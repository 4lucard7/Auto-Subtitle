import logging
from typing import Optional

logger = logging.getLogger(__name__)

_model = None


def _get_model():
    global _model
    if _model is None:
        try:
            from faster_whisper import WhisperModel
            logger.info("Loading faster-whisper model (base)...")
            _model = WhisperModel("base", device="cpu", compute_type="int8")
            logger.info("Model loaded successfully.")
        except ImportError:
            raise RuntimeError(
                "faster-whisper is not installed. Run: pip install faster-whisper"
            )
    return _model


def transcribe(audio_path: str, language: Optional[str] = None) -> dict:
    """
    Transcribe audio using faster-whisper.
    Returns: { detected_language, segments: [{index, start, end, text}] }
    """
    model = _get_model()

    kwargs = {}
    if language:
        kwargs["language"] = language

    segments_raw, info = model.transcribe(
        audio_path,
        beam_size=5,
        word_timestamps=False,
        vad_filter=True,
        **kwargs,
    )

    detected_lang = info.language
    duration = info.duration

    segments = []
    for i, seg in enumerate(segments_raw):
        segments.append(
            {
                "index": i + 1,
                "start": round(seg.start, 3),
                "end": round(seg.end, 3),
                "text": seg.text.strip(),
            }
        )

    return {
        "detected_language": detected_lang,
        "duration": duration,
        "segments": segments,
    }
