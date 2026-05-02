import subprocess
import os
import logging

logger = logging.getLogger(__name__)


def extract_audio(video_path: str, output_path: str) -> str:
    """Extract audio from a video file and convert to 16kHz WAV."""
    cmd = [
        "ffmpeg",
        "-i", video_path,
        "-ar", "16000",
        "-ac", "1",
        "-c:a", "pcm_s16le",
        "-y",
        output_path,
    ]
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,
        )
        if result.returncode != 0:
            raise RuntimeError(f"FFmpeg error: {result.stderr[:500]}")
        return output_path
    except subprocess.TimeoutExpired:
        raise RuntimeError("Audio extraction timed out (5 min limit)")
    except FileNotFoundError:
        raise RuntimeError("FFmpeg not found. Please install ffmpeg.")


def get_duration(video_path: str) -> float:
    """Get video/audio duration in seconds using ffprobe."""
    cmd = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        video_path,
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0 and result.stdout.strip():
            return float(result.stdout.strip())
    except Exception as e:
        logger.warning(f"Could not get duration: {e}")
    return 0.0
