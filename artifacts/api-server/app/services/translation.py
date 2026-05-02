import logging
import urllib.request
import urllib.parse
import json
import time
from typing import Optional

logger = logging.getLogger(__name__)

LANGUAGE_NAMES = {
    "fr": "French",
    "en": "English",
    "es": "Spanish",
    "de": "German",
    "ar": "Arabic",
    "zh": "Chinese",
    "ja": "Japanese",
    "pt": "Portuguese",
    "it": "Italian",
    "ru": "Russian",
    "ko": "Korean",
    "auto": "auto",
}

_cache: dict[str, str] = {}


def _translate_chunk(text: str, source_lang: str, target_lang: str) -> str:
    cache_key = f"{source_lang}:{target_lang}:{text}"
    if cache_key in _cache:
        return _cache[cache_key]

    url = "https://api.mymemory.translated.net/get"
    lang_pair = f"{source_lang}|{target_lang}"
    params = urllib.parse.urlencode({"q": text, "langpair": lang_pair})
    full_url = f"{url}?{params}"

    try:
        req = urllib.request.Request(
            full_url,
            headers={"User-Agent": "AutoSub/1.0"},
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            translated = data.get("responseData", {}).get("translatedText", text)
            if not translated or translated.strip() == "":
                translated = text
            _cache[cache_key] = translated
            return translated
    except Exception as e:
        logger.warning(f"Translation failed for chunk: {e}")
        return text


def translate_segments(
    segments: list[dict],
    source_lang: str,
    target_lang: str,
    on_progress: Optional[callable] = None,
) -> list[dict]:
    """Translate segments using MyMemory API with chunking."""
    if source_lang == target_lang:
        return segments

    MAX_CHUNK = 450
    translated_segments = []
    total = len(segments)

    for i, seg in enumerate(segments):
        text = seg["text"]

        if len(text) > MAX_CHUNK:
            words = text.split()
            chunks = []
            current = ""
            for word in words:
                if len(current) + len(word) + 1 <= MAX_CHUNK:
                    current = f"{current} {word}".strip()
                else:
                    if current:
                        chunks.append(current)
                    current = word
            if current:
                chunks.append(current)

            translated_parts = []
            for chunk in chunks:
                translated_parts.append(
                    _translate_chunk(chunk, source_lang, target_lang)
                )
                time.sleep(0.1)
            translated_text = " ".join(translated_parts)
        else:
            translated_text = _translate_chunk(text, source_lang, target_lang)
            time.sleep(0.1)

        translated_segments.append(
            {
                "index": seg["index"],
                "start": seg["start"],
                "end": seg["end"],
                "text": translated_text,
            }
        )

        if on_progress and i % 5 == 0:
            on_progress(i + 1, total)

    return translated_segments
