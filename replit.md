# AutoSub Workspace

## Overview

AutoSub is an AI-powered automatic subtitling and translation web application. Upload a video, get AI-generated subtitles in SRT format, optionally translated into 11 languages.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS (`artifacts/autosub`)
- **Backend**: Python FastAPI + faster-whisper (`artifacts/api-server/app/`)
- **Audio extraction**: FFmpeg
- **Transcription**: faster-whisper (local model, no API cost)
- **Translation**: MyMemory free API
- **API codegen**: Orval (from OpenAPI spec)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec

## Architecture

### Frontend (`artifacts/autosub/`)
- React + Vite SPA with wouter routing
- Pages: Landing (`/`), Upload (`/upload`), Job processing (`/jobs/:jobId`), History (`/history`)
- Uses React Query hooks generated from OpenAPI spec

### Backend (`artifacts/api-server/`)
- Python FastAPI server running on port 8080
- Entrypoint: `app/main.py`
- Routes: `app/routes/health.py`, `app/routes/jobs.py`
- Services: `app/services/audio_extractor.py` (FFmpeg), `app/services/transcription.py` (faster-whisper), `app/services/translation.py` (MyMemory), `app/services/srt_generator.py`
- File-based job store: `app/store.py` → `data/jobs/`, `data/uploads/`, `data/results/`
- Run command: `bash -c 'cd /home/runner/workspace/artifacts/api-server && uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2'`

## API Endpoints

- `POST /api/upload` — multipart upload (file + target_language), returns `{job_id}`
- `GET /api/jobs` — list all jobs
- `GET /api/jobs/stats` — overall statistics
- `GET /api/jobs/:id` — job status and metadata
- `GET /api/jobs/:id/subtitles?lang=original|translated` — subtitle segments + SRT
- `GET /api/jobs/:id/download?lang=original|translated` — download SRT file
- `GET /api/healthz` — health check

## Processing Flow

1. Video uploaded → job created → background thread starts
2. FFmpeg extracts audio to 16kHz WAV
3. faster-whisper transcribes (auto-detects language)
4. MyMemory API translates if target language differs from detected
5. SRT files generated and saved
6. Job status polled every 1.5s by frontend

## Supported Translation Languages

French, English, Spanish, German, Arabic, Chinese, Japanese, Portuguese, Italian, Russian, Korean
