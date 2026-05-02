import { useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { Upload as UploadIcon, FileVideo, X, Loader2, Info } from "lucide-react";
import { AppLayout } from "@/components/layout";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "de", name: "German" },
  { code: "ar", name: "Arabic" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "pt", name: "Portuguese" },
  { code: "it", name: "Italian" },
  { code: "ru", name: "Russian" },
  { code: "ko", name: "Korean" },
];

interface SelectedFile {
  file: File;
  id: string;
}

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [targetLang, setTargetLang] = useState<string>("en");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFile = (f: File) => {
    const validExtensions = [".mp4", ".avi", ".mov", ".mkv", ".webm", ".mp3", ".wav"];
    const isValid = validExtensions.some((ext) => f.name.toLowerCase().endsWith(ext));
    if (!isValid) {
      setError("Unsupported file format. Please upload MP4, AVI, MOV, MKV, WEBM, MP3, or WAV.");
      return;
    }
    setError(null);
    setSelectedFiles((prev) => [...prev, { file: f, id: Math.random().toString(36).slice(2) }]);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    Array.from(e.dataTransfer.files).forEach(validateAndAddFile);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(validateAndAddFile);
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setError(null);

    try {
      const { file } = selectedFiles[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("target_language", targetLang);

      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed. Server returned " + response.status);

      const { job_id } = await response.json();
      setLocation(`/jobs/${job_id}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setIsUploading(false);
    }
  };

  return (
    <AppLayout breadcrumb="New Upload">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Create your next Subtitled Video
          </h1>
          <p className="text-gray-500">
            Upload your footage and let our AI handle transcription and translation in seconds.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Dropzone + Files */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dropzone */}
            <div
              className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-gray-400 bg-gray-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept=".mp4,.avi,.mov,.mkv,.webm,.mp3,.wav"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <UploadIcon className="w-5 h-5 text-gray-500" />
              </div>
              <p className="font-semibold text-gray-800 mb-1">Drag and drop your video here</p>
              <p className="text-sm text-gray-500 mb-5">Supports MP4, MOV, and AVI up to 2GB</p>
              <button
                type="button"
                className="bg-black text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <span className="text-base leading-none">+</span> Choose File
              </button>
            </div>

            {/* Selected files */}
            {selectedFiles.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-gray-900 text-sm">
                    Selected Files{" "}
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-200 text-gray-700 rounded-full text-xs ml-1">
                      {selectedFiles.length}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedFiles([])}
                    className="text-xs text-gray-500 hover:text-gray-900"
                  >
                    Remove All
                  </button>
                </div>
                <div className="space-y-2">
                  {selectedFiles.map(({ file, id }) => (
                    <div
                      key={id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white"
                    >
                      <div className="w-9 h-9 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                        <FileVideo className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-400">
                          {(file.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
                        {file.name.split(".").pop()?.toUpperCase()}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(id)}
                        className="text-gray-400 hover:text-gray-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Project Settings */}
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-xl p-5 bg-white">
              <div className="flex items-center gap-2 mb-5">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-semibold text-gray-900 text-sm">Project Settings</span>
              </div>

              <div className="space-y-5">
                {/* Source language */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Source Language
                  </label>
                  <div className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2.5 bg-gray-50">
                    <span className="text-sm text-gray-700">Auto-detect (Recommended)</span>
                    <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                      AI Active
                    </span>
                  </div>
                </div>

                {/* Target language */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Target Language
                  </label>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    disabled={isUploading}
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subtitle Engine */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Subtitle Engine
                  </label>
                  <div className="flex rounded-md border border-gray-200 overflow-hidden text-sm">
                    <button className="flex-1 py-2 bg-black text-white font-medium text-xs">
                      Premium AI
                    </button>
                    <button className="flex-1 py-2 bg-white text-gray-500 font-medium text-xs">
                      Standard
                    </button>
                  </div>
                  <div className="flex items-start gap-2 mt-3 bg-gray-50 border border-gray-200 rounded-md p-3">
                    <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500 leading-relaxed">
                      High-accuracy AI transcription is enabled for your account. Processing time typically takes 20-30% of the video length.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Start button */}
            <button
              type="button"
              disabled={selectedFiles.length === 0 || isUploading}
              onClick={handleUpload}
              className="w-full bg-black text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Start Processing
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400">
              By starting, you agree to our processing{" "}
              <a href="#" className="underline">Terms of Service</a>.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
