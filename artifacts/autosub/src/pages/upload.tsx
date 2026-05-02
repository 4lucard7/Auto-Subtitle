import { useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { Upload as UploadIcon, FileVideo, AlertCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [targetLang, setTargetLang] = useState<string>("en");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (f: File) => {
    setError(null);
    const validTypes = ['video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska', 'video/webm', 'audio/mpeg', 'audio/wav'];
    const validExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.mp3', '.wav'];
    
    const isValidType = validTypes.includes(f.type);
    const isValidExtension = validExtensions.some(ext => f.name.toLowerCase().endsWith(ext));

    if (!isValidType && !isValidExtension) {
      setError("Unsupported file format. Please upload MP4, AVI, MOV, MKV, WEBM, MP3, or WAV.");
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("target_language", targetLang);
      
      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/api/upload`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Upload failed. Server returned " + response.status);
      }
      
      const { job_id } = await response.json();
      setLocation(`/jobs/${job_id}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during upload.");
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full">
        <h1 className="text-3xl font-bold font-mono mb-2">New Job</h1>
        <p className="text-muted-foreground mb-8">Upload media to begin transcription and translation.</p>

        {error && (
          <Alert variant="destructive" className="mb-6 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div 
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 flex flex-col items-center justify-center relative cursor-pointer
              ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-card/50 hover:bg-card hover:border-primary/50'}
              ${file ? 'border-primary/50 bg-card' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".mp4,.avi,.mov,.mkv,.webm,.mp3,.wav,video/mp4,video/x-msvideo,video/quicktime,video/x-matroska,video/webm,audio/mpeg,audio/wav"
              onChange={handleFileChange}
            />

            {file ? (
              <div className="w-full flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileVideo className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <div className="font-mono text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">{file.name}</div>
                    <div className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-primary/20' : 'bg-secondary'}`}>
                  <UploadIcon className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="font-medium text-lg mb-1">Drag & Drop media here</div>
                <div className="text-sm text-muted-foreground">or click to browse</div>
                <div className="text-xs text-muted-foreground/60 mt-4 font-mono uppercase tracking-widest">
                  mp4 · avi · mov · mkv · webm · mp3 · wav
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="language-select">Target Language</Label>
            <Select value={targetLang} onValueChange={setTargetLang} disabled={isUploading}>
              <SelectTrigger id="language-select" className="w-full bg-card h-12">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name} ({lang.code.toUpperCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full h-14 text-base font-mono font-bold shadow-[0_0_20px_hsl(var(--primary)/0.2)]" 
            disabled={!file || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                INITIALIZING JOB...
              </>
            ) : (
              <>
                <UploadIcon className="w-5 h-5 mr-2" />
                START PROCESSING
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
