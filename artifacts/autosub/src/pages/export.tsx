import { useState } from "react";
import { useParams } from "wouter";
import { useGetJob, useGetJobSubtitles, getGetJobQueryKey, getGetJobSubtitlesQueryKey } from "@workspace/api-client-react";
import { FileText, Globe, Type, CheckCircle2, Clock, Layers, AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/layout";

type Format = "srt" | "vtt" | "txt";

const FORMATS = [
  {
    id: "srt" as Format,
    label: "SubRip",
    ext: ".srt",
    desc: "Most common format, widely supported by players and social media.",
    icon: FileText,
  },
  {
    id: "vtt" as Format,
    label: "WebVTT",
    ext: ".vtt",
    desc: "Standard format for web-based video players (HTML5).",
    icon: Globe,
  },
  {
    id: "txt" as Format,
    label: "Plain Text",
    ext: ".txt",
    desc: "Simple text file without timestamps, great for transcripts.",
    icon: Type,
  },
];

export default function ExportPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const [format, setFormat] = useState<Format>("srt");
  const [exportLang, setExportLang] = useState<"original" | "translated">("original");
  const [includeTimestamps, setIncludeTimestamps] = useState(true);

  const { data: job } = useGetJob(jobId, {
    query: { enabled: !!jobId, queryKey: getGetJobQueryKey(jobId) },
  });

  const { data: subtitles } = useGetJobSubtitles(
    jobId,
    { lang: exportLang },
    {
      query: {
        enabled: !!jobId && job?.status === "done",
        queryKey: getGetJobSubtitlesQueryKey(jobId, { lang: exportLang }),
      },
    }
  );

  const handleDownload = () => {
    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
    window.open(`${baseUrl}/api/jobs/${jobId}/download?lang=${exportLang}`, "_blank");
  };

  const duration = job?.duration_seconds
    ? `${Math.floor(job.duration_seconds / 60)
        .toString()
        .padStart(2, "0")}:${Math.floor(job.duration_seconds % 60)
        .toString()
        .padStart(2, "0")}`
    : "—";

  const previewLines = subtitles?.srt_content?.split("\n").slice(0, 12) ?? [];

  return (
    <AppLayout breadcrumb="Export Subtitles">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Finalize & Export</h1>
          <p className="text-gray-500">
            Choose your preferred format and language to download your refined subtitles.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Steps */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Format */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Step 1</p>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Select Export Format</h2>
              <p className="text-sm text-gray-500 mb-5">Different platforms require specific subtitle file types.</p>

              <div className="space-y-3">
                {FORMATS.map((f) => {
                  const Icon = f.icon;
                  const isSelected = format === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFormat(f.id)}
                      className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? "border-gray-900 bg-white shadow-sm"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-gray-100" : "bg-gray-50"}`}>
                        <Icon className="w-5 h-5 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{f.label}</span>
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            {f.ext}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{f.desc}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Settings */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Step 2</p>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-5">Refine Settings</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Language
                  </label>
                  <div className="relative">
                    <select
                      value={exportLang}
                      onChange={(e) => setExportLang(e.target.value as "original" | "translated")}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="original">
                        {job?.detected_language
                          ? `${job.detected_language.toUpperCase()} (Original)`
                          : "Original Language"}
                      </option>
                      {job?.target_language && (
                        <option value="translated">
                          {job.target_language.toUpperCase()} (Translated)
                        </option>
                      )}
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {job?.detected_language && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-gray-400">Verified for accuracy by AutoSub AI</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTimestamps}
                      onChange={(e) => setIncludeTimestamps(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-black"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Include Timestamps</p>
                      <p className="text-xs text-gray-400">Required for video synchronization.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer opacity-50">
                    <input type="checkbox" disabled className="mt-0.5 w-4 h-4 rounded border-gray-300" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Add UTF-8 BOM</p>
                      <p className="text-xs text-gray-400">Helpful for legacy Windows text editors.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Summary + Preview + Download */}
          <div className="space-y-4">
            {/* Project summary */}
            <div className="border border-gray-200 rounded-xl p-5 bg-white">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <p className="font-semibold text-sm text-gray-900">Project Summary</p>
              </div>
              <div className="space-y-3">
                <SummaryRow icon={FileText} label="File Name" value={job?.filename ?? "—"} truncate />
                <SummaryRow icon={Clock} label="Video Length" value={duration} />
                <SummaryRow icon={Layers} label="Total Segments" value={`${job?.segment_count ?? "—"} Lines`} />
              </div>
            </div>

            {/* File preview */}
            {previewLines.length > 0 && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-700">File Preview</p>
                  <span className="text-[10px] text-gray-400">First few lines of your .srt file</span>
                </div>
                <div className="bg-gray-900 p-4 font-mono text-xs text-green-400 leading-relaxed max-h-36 overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded">SRT Preview</span>
                  </div>
                  {previewLines.map((line, i) => (
                    <p key={i} className={line === "" ? "mt-1" : ""}>{line}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Download button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={!job || job.status !== "done"}
              className="w-full bg-black text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download .{format} File
            </button>
            <p className="text-center text-xs text-gray-400">
              Your subtitles will download directly to your default browser folder.
            </p>

            {/* Tip */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800">Uploading to YouTube?</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  We recommend using the <strong>SRT</strong> format for best compatibility with YouTube's CC system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  truncate,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-gray-500 flex-shrink-0">{label}</span>
      <span className={`text-gray-900 font-medium text-right ${truncate ? "truncate max-w-[140px]" : ""}`} title={value}>
        {value}
      </span>
    </div>
  );
}
