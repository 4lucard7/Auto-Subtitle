import { useParams } from "wouter";
import { useGetJob, useGetJobSubtitles, getGetJobQueryKey, getGetJobSubtitlesQueryKey } from "@workspace/api-client-react";
import { AlertCircle, Download, FileAudio, LayoutList, Loader2, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const STEPS = [
  { id: 'pending', label: 'Initializing', icon: Loader2 },
  { id: 'extracting', label: 'Extracting Audio', icon: FileAudio },
  { id: 'transcribing', label: 'Transcribing', icon: LayoutList },
  { id: 'translating', label: 'Translating', icon: LayoutList },
  { id: 'done', label: 'Complete', icon: CheckCircle2 },
];

export default function JobPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const { data: job, isLoading: isLoadingJob } = useGetJob(jobId, {
    query: {
      enabled: !!jobId,
      queryKey: getGetJobQueryKey(jobId),
      refetchInterval: (data) => {
        const isDone = data?.state?.data?.status === 'done' || data?.state?.data?.status === 'error';
        return isDone ? false : 1500;
      }
    }
  });

  const isDone = job?.status === 'done';
  const isError = job?.status === 'error';

  const { data: subtitlesOriginal } = useGetJobSubtitles(jobId, { lang: 'original' }, {
    query: {
      enabled: isDone,
      queryKey: getGetJobSubtitlesQueryKey(jobId, { lang: 'original' }),
    }
  });

  const { data: subtitlesTranslated } = useGetJobSubtitles(jobId, { lang: 'translated' }, {
    query: {
      enabled: isDone && !!job?.target_language,
      queryKey: getGetJobSubtitlesQueryKey(jobId, { lang: 'translated' }),
    }
  });

  const handleDownload = (lang: 'original' | 'translated') => {
    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
    window.open(`${baseUrl}/api/jobs/${jobId}/download?lang=${lang}`, '_blank');
  };

  if (isLoadingJob) {
    return (
      <div className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Job Not Found</AlertTitle>
          <AlertDescription>The requested job ID could not be found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === job.status);
  const activeStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto w-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold font-mono truncate max-w-md" title={job.filename}>
              {job.filename}
            </h1>
            <Badge variant={isDone ? "default" : isError ? "destructive" : "secondary"} className="font-mono uppercase tracking-widest text-[10px]">
              {job.status}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground font-mono flex items-center gap-4">
            <span>ID: {job.id.substring(0, 8)}...</span>
            <span>•</span>
            <span>{format(new Date(job.created_at), "MMM d, yyyy HH:mm")}</span>
          </div>
        </div>
        
        {job.detected_language && (
          <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded border border-border text-sm font-mono">
            <span className="text-muted-foreground">LANG:</span> 
            <span className="font-bold text-primary uppercase">{job.detected_language} {job.target_language && `→ ${job.target_language}`}</span>
          </div>
        )}
      </div>

      {isError ? (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Processing Failed</AlertTitle>
          <AlertDescription className="font-mono text-sm mt-2">
            {job.error_message || "Unknown error occurred"}
          </AlertDescription>
        </Alert>
      ) : (
        /* Progress Status */
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="font-mono text-sm text-primary uppercase font-bold tracking-wider">
              {job.step || 'Processing...'}
            </div>
            <div className="font-mono text-2xl font-bold text-foreground">
              {Math.round(job.progress)}%
            </div>
          </div>
          
          <Progress value={job.progress} className="h-3 mb-8 bg-secondary" indicatorClassName="bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.5)] transition-all duration-500" />
          
          <div className="grid grid-cols-5 gap-2 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-secondary -z-10 -translate-y-1/2" />
            {STEPS.map((step, i) => {
              const isCompleted = i < activeStepIndex || isDone;
              const isCurrent = i === activeStepIndex && !isDone;
              const StepIcon = step.icon;
              
              return (
                <div key={step.id} className="flex flex-col items-center text-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors
                    ${isCompleted ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.4)]' : 
                      isCurrent ? 'bg-background border-primary text-primary animate-pulse shadow-[0_0_10px_hsl(var(--primary)/0.2)]' : 
                      'bg-card border-border text-muted-foreground'}`}>
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <div className={`text-xs font-mono font-medium hidden sm:block uppercase tracking-wider
                    ${isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results Section */}
      {isDone && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-mono">Results</h2>
            <div className="flex gap-2">
              {subtitlesOriginal && (
                <Button size="sm" variant="outline" className="font-mono text-xs border-primary/20 hover:bg-primary/10 hover:text-primary" onClick={() => handleDownload('original')}>
                  <Download className="w-3.5 h-3.5 mr-2" />
                  SRT ({subtitlesOriginal.language})
                </Button>
              )}
              {subtitlesTranslated && (
                <Button size="sm" variant="default" className="font-mono text-xs shadow-[0_0_15px_hsl(var(--primary)/0.2)]" onClick={() => handleDownload('translated')}>
                  <Download className="w-3.5 h-3.5 mr-2" />
                  SRT ({subtitlesTranslated.language})
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue={subtitlesTranslated ? "translated" : "original"} className="w-full">
            <TabsList className="w-full justify-start bg-card border border-border h-12 rounded-lg p-1 mb-6">
              {subtitlesTranslated && (
                <TabsTrigger value="translated" className="font-mono data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex-1 sm:flex-none px-8">
                  Translated ({subtitlesTranslated.language})
                </TabsTrigger>
              )}
              {subtitlesOriginal && (
                <TabsTrigger value="original" className="font-mono data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex-1 sm:flex-none px-8">
                  Original ({subtitlesOriginal.language})
                </TabsTrigger>
              )}
            </TabsList>
            
            {subtitlesTranslated && (
              <TabsContent value="translated" className="mt-0 outline-none">
                <div className="bg-card border border-border rounded-xl p-6 max-h-[500px] overflow-y-auto custom-scrollbar">
                  <div className="space-y-4">
                    {subtitlesTranslated.segments.map((seg, i) => (
                      <div key={i} className="flex gap-4 group hover:bg-secondary/50 p-2 rounded -mx-2 transition-colors">
                        <div className="w-24 shrink-0 font-mono text-xs text-muted-foreground pt-1">
                          {formatTime(seg.start)}
                        </div>
                        <div className="text-foreground leading-relaxed">
                          {seg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            )}
            
            {subtitlesOriginal && (
              <TabsContent value="original" className="mt-0 outline-none">
                <div className="bg-card border border-border rounded-xl p-6 max-h-[500px] overflow-y-auto custom-scrollbar">
                  <div className="space-y-4">
                    {subtitlesOriginal.segments.map((seg, i) => (
                      <div key={i} className="flex gap-4 group hover:bg-secondary/50 p-2 rounded -mx-2 transition-colors">
                        <div className="w-24 shrink-0 font-mono text-xs text-muted-foreground pt-1">
                          {formatTime(seg.start)}
                        </div>
                        <div className="text-foreground leading-relaxed">
                          {seg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
