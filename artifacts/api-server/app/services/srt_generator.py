def _format_timestamp(seconds: float) -> str:
    """Convert seconds to SRT timestamp format: HH:MM:SS,mmm"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def _split_line(text: str, max_chars: int = 42) -> str:
    """Split long text into multiple lines."""
    if len(text) <= max_chars:
        return text
    words = text.split()
    lines = []
    current = ""
    for word in words:
        if len(current) + len(word) + 1 <= max_chars:
            current = f"{current} {word}".strip()
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return "\n".join(lines)


def generate_srt(segments: list[dict]) -> str:
    """Generate SRT content from subtitle segments."""
    lines = []
    for seg in segments:
        idx = seg["index"]
        start = _format_timestamp(seg["start"])
        end = _format_timestamp(seg["end"])
        text = _split_line(seg["text"])
        lines.append(f"{idx}\n{start} --> {end}\n{text}\n")
    return "\n".join(lines)
