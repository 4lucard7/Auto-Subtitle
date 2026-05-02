import os
import threading
import logging
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import Response

from app import store
from app.services import audio_extractor, transcription, translation, srt_generator

router = APIRouter()
logger = logging.getLogger(__name__)

SUPPORTED_LANGUAGES = ["fr", "en", "es", "de", "ar", "zh", "ja", "pt", "it", "ru", "ko"]


def _process_job(job_id: str, video_path: str, target_language: Optional[str]) -> None:
    try:
        # Step 1: Extract audio
        store.update_job(job_id, status="extracting", progress=10, step="Extracting audio")
        audio_path = os.path.join(store.UPLOADS_DIR, f"{job_id}.wav")
        duration = audio_extractor.get_duration(video_path)
        audio_extractor.extract_audio(video_path, audio_path)

        # Step 2: Transcribe
        store.update_job(job_id, status="transcribing", progress=30, step="Transcribing speech")
        result = transcription.transcribe(audio_path)
        detected_lang = result["detected_language"]
        segments = result["segments"]
        dur = result["duration"] or duration

        store.update_job(
            job_id,
            progress=65,
            step="Transcription complete",
            detected_language=detected_lang,
            duration_seconds=round(dur, 2),
            segment_count=len(segments),
        )

        # Save original SRT
        srt_orig = srt_generator.generate_srt(segments)
        store.save_subtitles(job_id, "original", segments, srt_orig)

        # Step 3: Translate (if target language differs from detected)
        if target_language and target_language != detected_lang:
            store.update_job(job_id, status="translating", progress=70, step="Translating subtitles")

            def on_progress(done: int, total: int) -> None:
                pct = 70 + int((done / max(total, 1)) * 25)
                store.update_job(job_id, progress=pct, step=f"Translating ({done}/{total})")

            translated = translation.translate_segments(
                segments,
                source_lang=detected_lang,
                target_lang=target_language,
                on_progress=on_progress,
            )
            srt_trans = srt_generator.generate_srt(translated)
            store.save_subtitles(job_id, "translated", translated, srt_trans)
        else:
            # Copy original as translated
            store.save_subtitles(job_id, "translated", segments, srt_orig)

        from datetime import datetime, timezone
        store.update_job(
            job_id,
            status="done",
            progress=100,
            step="Complete",
            completed_at=datetime.now(timezone.utc).isoformat(),
        )
        logger.info(f"Job {job_id} completed successfully.")

    except Exception as e:
        logger.error(f"Job {job_id} failed: {e}", exc_info=True)
        store.update_job(
            job_id,
            status="error",
            progress=0,
            step="Failed",
            error_message=str(e),
        )
    finally:
        # Clean up uploaded video to save space (keep audio for possible retry)
        try:
            if os.path.exists(video_path):
                os.remove(video_path)
        except Exception:
            pass


@router.post("/upload")
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_language: str = Form(default="en"),
):
    allowed_types = {
        "video/mp4", "video/avi", "video/x-msvideo", "video/quicktime",
        "video/x-matroska", "video/webm", "audio/mpeg", "audio/wav",
        "audio/x-wav", "audio/mp3", "audio/mp4", "audio/ogg",
    }
    content_type = file.content_type or ""
    filename = file.filename or "upload"
    ext = os.path.splitext(filename)[1].lower()
    allowed_exts = {".mp4", ".avi", ".mov", ".mkv", ".webm", ".mp3", ".wav", ".m4a", ".ogg"}

    if ext not in allowed_exts and content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Unsupported file type.")

    job = store.create_job(filename=filename, target_language=target_language)
    job_id = job["id"]

    upload_path = store.upload_path(job_id, filename)
    contents = await file.read()
    with open(upload_path, "wb") as f:
        f.write(contents)

    store.update_job(job_id, status="extracting", progress=5, step="Uploaded, processing...")

    thread = threading.Thread(
        target=_process_job,
        args=(job_id, upload_path, target_language),
        daemon=True,
    )
    thread.start()

    return {"job_id": job_id}


@router.get("/jobs/stats")
async def get_stats():
    jobs = store.list_jobs()
    total = len(jobs)
    completed = sum(1 for j in jobs if j["status"] == "done")
    processing = sum(1 for j in jobs if j["status"] in ("pending", "extracting", "transcribing", "translating"))
    failed = sum(1 for j in jobs if j["status"] == "error")
    total_mins = sum(
        (j.get("duration_seconds") or 0) for j in jobs if j["status"] == "done"
    ) / 60

    return {
        "total_jobs": total,
        "completed_jobs": completed,
        "processing_jobs": processing,
        "failed_jobs": failed,
        "total_minutes_processed": round(total_mins, 2),
        "supported_languages": SUPPORTED_LANGUAGES,
    }


@router.get("/jobs")
async def list_jobs():
    return store.list_jobs()


@router.get("/jobs/{job_id}")
async def get_job(job_id: str):
    job = store.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/jobs/{job_id}/subtitles")
async def get_subtitles(job_id: str, lang: str = "original"):
    job = store.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    data = store.get_subtitles(job_id, lang)
    if data is None:
        data = store.get_subtitles(job_id, "original")
    if data is None:
        raise HTTPException(status_code=404, detail="Subtitles not yet available")

    return {
        "job_id": job_id,
        "language": lang,
        "segments": data["segments"],
        "srt_content": data["srt_content"],
    }


@router.get("/jobs/{job_id}/download")
async def download_srt(job_id: str, lang: str = "original"):
    job = store.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    data = store.get_subtitles(job_id, lang)
    if data is None:
        raise HTTPException(status_code=404, detail="Subtitles not ready")

    filename = os.path.splitext(job["filename"])[0]
    srt_filename = f"{filename}_{lang}.srt"

    return Response(
        content=data["srt_content"],
        media_type="text/plain",
        headers={"Content-Disposition": f'attachment; filename="{srt_filename}"'},
    )
