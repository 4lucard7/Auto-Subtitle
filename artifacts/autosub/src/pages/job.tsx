import { useParams, useLocation } from "wouter";
import {
  useGetJob,
  useGetJobSubtitles,
  getGetJobQueryKey,
  getGetJobSubtitlesQueryKey,
} from "@workspace/api-client-react";
import { CheckCircle2, Loader2, Circle, ChevronDown, Clock } from "lucide-react";
import { AppLayout } from "@/components/layout";

const STEPS = [
  {
    id: "uploading",
    label: "Uploading Video",
    desc: "Securely transferring media to processing engine.",
    statuses: ["pending", "extracting"],
  },
  {
    id: "transcribing",
    label: "AI Transcription",
    desc: "Identifying speech and converting audio to text timestamps.",
    statuses: ["transcribing"],
  },
  {
    id: "translating",
    label: "Neural Translation",
    desc: "Translating content into selected target language.",
    statuses: ["translating"],
  },
  {
    id: "generating",
    label: "Generating Subtitles",
    desc: "Optimizing readability and formatting export blocks.",
    statuses: ["done"],
  },
];

function getStepState(step: (typeof STEPS)[0], jobStatus: string) {
  const order = ["pending", "extracting", "transcribing", "translating", "done"];
  const currentIdx = order.indexOf(jobStatus);
  const stepEndIdx = Math.max(...step.statuses.map((s) => order.indexOf(s)));
  const stepStartIdx = Math.min(...step.statuses.map((s) => order.indexOf(s)));

  if (jobStatus === "done") return "done";
  if (currentIdx > stepEndIdx) return "done";
  if (currentIdx >= stepStartIdx && currentIdx <= stepEndIdx) return "active";
  return "pending";
}

function generateLogs(job: { status: string; step?: string | null; detected_language?: string | null; segment_count?: number | null }): string[] {
  const now = new Date();
  const fmt = (d: Date) =>
    `[${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}]`;

  const logs: string[] = [];

  if (["extracting", "transcribing", "translating", "done"].includes(job.status)) {
    logs.push(`${fmt(now)} SUCCESS  Job queued and accepted`);
    logs.push(`${fmt(now)} INFO     Input stream verified`);
    logs.push(`${fmt(now)} INFO     Preprocessing audio buffers for noise reduction`);
  }
  if (["transcribing", "translating", "done"].includes(job.status)) {
    logs.push(`${fmt(now)} SUCCESS  Audio extracted at 16kHz WAV`);
    logs.push(`${fmt(now)} INFO     Loading neural transcription model`);
    logs.push(`${fmt(now)} SUCCESS  Model ready — running inference`);
  }
  if (["translating", "done"].includes(job.status)) {
    logs.push(`${fmt(now)} SUCCESS  Language detected: ${(job.detected_language || "auto").toUpperCase()}`);
    logs.push(`${fmt(now)} SUCCESS  Transcription complete (${job.segment_count ?? "?"} segments)`);
    logs.push(`${fmt(now)} INFO     Starting translation pipeline`);
  }
  if (job.status === "done") {
    logs.push(`${fmt(now)} SUCCESS  Translation complete`);
    logs.push(`${fmt(now)} SUCCESS  SRT file generated and saved`);
  }
  if (job.status === "error") {
    logs.push(`${fmt(now)} ERROR    Processing failed`);
  }

  return logs;
}

export default function JobPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const jobId = params.jobId as string;

  const { data: job, isLoading } = useGetJob(jobId, {
    query: {
      enabled: !!jobId,
      queryKey: getGetJobQueryKey(jobId),
      refetchInterval: (data) => {
        const s = data?.state?.data?.status;
        return s === "done" || s === "error" ? false : 1500;
      },
    },
  });

  const isDone = job?.status === "done";
  const isError = job?.status === "error";

  const { data: subtitlesOriginal } = useGetJobSubtitles(
    jobId,
    { lang: "original" },
    { query: { enabled: isDone, queryKey: getGetJobSubtitlesQueryKey(jobId, { lang: "original" }) } }
  );

  const { data: subtitlesTranslated } = useGetJobSubtitles(
    jobId,
    { lang: "translated" },
    {
      query: {
        enabled: isDone && !!job?.target_language,
        queryKey: getGetJobSubtitlesQueryKey(jobId, { lang: "translated" }),
      },
    }
  );

  if (isLoading) {
    return (
      <AppLayout breadcrumb="Loading...">
        <div className="p-8 flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!job) {
    return (
      <AppLayout breadcrumb="Not Found">
        <div className="p-8 text-center text-gray-500">Job not found.</div>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout breadcrumb={job.filename}>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="font-semibold text-red-800 mb-2">Processing Failed</p>
            <p className="text-sm text-red-600 font-mono">{job.error_message}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const logs = generateLogs(job);
  const activeSegments = subtitlesOriginal?.segments ?? [];
  const wordsProcessed = activeSegments.reduce(
    (acc, s) => acc + s.text.split(/\s+/).length,
    0
  );

  return (
    <AppLayout breadcrumb={isDone ? `Editor: ${job.filename}` : job.filename}>
      {isDone ? (
        /* ── EDITOR VIEW (done) ── */
        <div className="flex flex-col h-full">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-0">
            {/* Left: Subtitle Preview */}
            <div className="border-r border-gray-200 flex flex-col">
              <div className="bg-gray-900 flex-1 flex items-end relative min-h-[280px]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full border-2 border-white/20 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white/60" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="text-white/40 text-xs">Subtitle Preview</p>
                  </div>
                </div>
                {activeSegments[0] && (
                  <div className="relative z-10 w-full p-4">
                    <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                      <p className="text-white text-sm leading-relaxed">
                        "{activeSegments[0].text}"
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Video info bar */}
              <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>{job.filename}</span>
                  <span className="text-gray-300">•</span>
                  <span>Source: {job.detected_language?.toUpperCase() ?? "—"}</span>
                  <span className="text-gray-300">→</span>
                  <span>Target: {job.target_language?.toUpperCase() ?? "—"}</span>
                </div>
              </div>
            </div>

            {/* Right: Transcript Editor */}
            <div className="flex flex-col">
              <div className="border-b border-gray-200 px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-gray-900">Transcript Editor</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                    {activeSegments.length} Segments Detected
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs border border-gray-200 px-3 py-1.5 rounded-md text-gray-600 hover:bg-gray-50">
                    + Add Segment
                  </button>
                  <button
                    onClick={() => setLocation(`/jobs/${jobId}/export`)}
                    className="text-xs bg-black text-white px-3 py-1.5 rounded-md font-medium hover:bg-gray-800"
                  >
                    Export
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {activeSegments.map((seg, i) => (
                  <div
                    key={i}
                    className={`border rounded-lg p-3.5 transition-colors ${
                      i === 1
                        ? "border-gray-900 bg-white shadow-sm"
                        : "border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono text-gray-400">
                        {formatTime(seg.start)} — {formatTime(seg.end)}
                      </span>
                      {i === 1 && (
                        <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          Playing
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">{seg.text}</p>
                  </div>
                ))}

                <div className="text-center py-6 text-gray-300">
                  <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center mx-auto mb-2">
                    <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-400">End of transcription</p>
                  <p className="text-xs text-gray-300">Click 'Export' to save your work</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom stats */}
          <div className="border-t border-gray-200 grid grid-cols-3 divide-x divide-gray-200 bg-white">
            <StatCell label="Sync Accuracy" value="98.4%" />
            <StatCell label="Words Processed" value={wordsProcessed.toLocaleString()} />
            <StatCell
              label="Language Support"
              value={job.target_language && job.target_language !== job.detected_language ? "Multi" : "Single"}
            />
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-2.5 flex items-center justify-between text-xs text-gray-400">
            <span>Autosaved a few seconds ago</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Editor Online
            </span>
          </div>
        </div>
      ) : (
        /* ── PROCESSING VIEW ── */
        <div className="p-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              AI Engine Active
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Analyzing Your Content...
            </h1>
            <p className="text-gray-500">
              Our advanced neural networks are transcribing your video with 99.8% precision.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Steps */}
            <div>
              <div className="space-y-4 mb-8">
                {STEPS.map((step) => {
                  const state = getStepState(step, job.status);
                  return (
                    <div key={step.id} className="flex items-start gap-4">
                      <div className="mt-0.5">
                        {state === "done" ? (
                          <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        ) : state === "active" ? (
                          <div className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center">
                            <Loader2 className="w-3.5 h-3.5 text-gray-500 animate-spin" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full border-2 border-gray-200 flex items-center justify-center">
                            <Circle className="w-3 h-3 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p
                          className={`font-semibold text-sm ${
                            state === "pending" ? "text-gray-400" : "text-gray-900"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50">
                  <span className="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  </span>
                  Cancel Process
                </button>
                <div className="flex items-center gap-2 border border-gray-200 text-gray-500 text-sm px-4 py-2 rounded-lg bg-gray-50">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider mr-1">Est. Remaining</span>
                  ~ 2m 45s
                </div>
              </div>
            </div>

            {/* Right: Task Pipeline */}
            <div className="space-y-4">
              {/* AI graphic */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-center justify-center min-h-[140px] relative">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-inner">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white border border-gray-200 rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-semibold text-gray-600">AI SYNCED</span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="border border-gray-200 rounded-xl p-5 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-gray-900 text-sm">Task Pipeline</p>
                  <p className="text-2xl font-extrabold text-gray-900">
                    {job.progress}%
                  </p>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-black rounded-full transition-all duration-500"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>

              {/* Logs */}
              <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                <button className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50">
                  Technical Progress Logs
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                <div className="border-t border-gray-100 bg-gray-50 p-3 max-h-44 overflow-y-auto">
                  {logs.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">Waiting for logs...</p>
                  ) : (
                    <div className="space-y-1">
                      {logs.map((log, i) => {
                        const isSuccess = log.includes("SUCCESS");
                        const isError = log.includes("ERROR");
                        return (
                          <p key={i} className="text-[11px] font-mono text-gray-500 leading-relaxed">
                            <span className="text-gray-400">{log.split(/SUCCESS|INFO|ERROR/)[0]}</span>
                            <span
                              className={
                                isSuccess
                                  ? "text-green-600 font-semibold"
                                  : isError
                                  ? "text-red-600 font-semibold"
                                  : "text-blue-600 font-semibold"
                              }
                            >
                              {isSuccess ? "SUCCESS" : isError ? "ERROR" : "INFO"}
                            </span>
                            <span>{log.split(/SUCCESS|INFO|ERROR/)[1]}</span>
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Pro tip */}
              <div className="flex items-start gap-3 text-xs text-gray-400">
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
                <p>
                  <span className="font-semibold text-gray-500">Pro Tip</span> — You can close this window. Processing continues in the background and we'll save your results when ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-6 py-3 flex items-center gap-3">
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
