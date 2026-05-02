import json
import os
import uuid
from datetime import datetime, timezone
from typing import Optional
import threading

JOBS_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "jobs")
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "uploads")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "results")

os.makedirs(JOBS_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

_lock = threading.Lock()


def _job_path(job_id: str) -> str:
    return os.path.join(JOBS_DIR, f"{job_id}.json")


def create_job(filename: str, target_language: Optional[str] = None) -> dict:
    job_id = str(uuid.uuid4())
    job = {
        "id": job_id,
        "filename": filename,
        "status": "pending",
        "progress": 0,
        "step": "Queued",
        "detected_language": None,
        "target_language": target_language,
        "error_message": None,
        "duration_seconds": None,
        "segment_count": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": None,
    }
    _save_job(job)
    return job


def _save_job(job: dict) -> None:
    with _lock:
        with open(_job_path(job["id"]), "w") as f:
            json.dump(job, f)


def get_job(job_id: str) -> Optional[dict]:
    path = _job_path(job_id)
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


def list_jobs() -> list[dict]:
    jobs = []
    for fname in sorted(os.listdir(JOBS_DIR), reverse=True):
        if fname.endswith(".json"):
            with open(os.path.join(JOBS_DIR, fname)) as f:
                try:
                    jobs.append(json.load(f))
                except Exception:
                    pass
    return jobs


def update_job(job_id: str, **kwargs) -> Optional[dict]:
    job = get_job(job_id)
    if job is None:
        return None
    job.update(kwargs)
    _save_job(job)
    return job


def save_subtitles(job_id: str, lang: str, segments: list, srt_content: str) -> None:
    path = os.path.join(RESULTS_DIR, f"{job_id}_{lang}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"segments": segments, "srt_content": srt_content}, f)


def get_subtitles(job_id: str, lang: str) -> Optional[dict]:
    path = os.path.join(RESULTS_DIR, f"{job_id}_{lang}.json")
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def upload_path(job_id: str, filename: str) -> str:
    ext = os.path.splitext(filename)[1]
    return os.path.join(UPLOADS_DIR, f"{job_id}{ext}")
