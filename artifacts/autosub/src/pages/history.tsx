import { Link } from "wouter";
import { useListJobs, useGetJobStats } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Activity, Clock, Languages, CheckCircle2, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryPage() {
  const { data: jobs, isLoading: isLoadingJobs } = useListJobs();
  const { data: stats, isLoading: isLoadingStats } = useGetJobStats();

  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto w-full flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-mono mb-2">History & Stats</h1>
        <p className="text-muted-foreground">Overview of all processing jobs and system utilization.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingStats ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : stats ? (
          <>
            <StatCard 
              label="Total Jobs" 
              value={stats.total_jobs} 
              icon={Activity} 
            />
            <StatCard 
              label="Completed" 
              value={stats.completed_jobs} 
              icon={CheckCircle2} 
              valueClassName="text-green-500"
            />
            <StatCard 
              label="Processing" 
              value={stats.processing_jobs} 
              icon={Loader2} 
              valueClassName="text-primary"
            />
            <StatCard 
              label="Minutes Processed" 
              value={Math.round(stats.total_minutes_processed)} 
              icon={Clock} 
            />
          </>
        ) : null}
      </div>

      {/* Jobs Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col mt-4">
        <div className="border-b border-border bg-secondary/50 px-6 py-4 flex items-center justify-between">
          <h2 className="font-mono font-bold">Recent Jobs</h2>
        </div>
        
        {isLoadingJobs ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : !jobs || jobs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground font-mono">
            No jobs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground font-mono uppercase bg-card border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">File</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Language</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-secondary/30 transition-colors group">
                    <td className="px-6 py-4 font-medium max-w-[200px] truncate" title={job.filename}>
                      {job.filename}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4 font-mono text-xs uppercase text-muted-foreground">
                      {job.detected_language || '?'} 
                      {job.target_language && <span className="text-primary ml-1">→ {job.target_language}</span>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                      {format(new Date(job.created_at), "MMM d, HH:mm")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/jobs/${job.id}`} className="inline-flex items-center text-primary hover:text-primary/80 font-mono text-xs font-bold uppercase tracking-wider">
                        View <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, valueClassName = "" }: { label: string, value: number, icon: any, valueClassName?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-mono text-muted-foreground">{label}</span>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className={`text-3xl font-bold font-mono ${valueClassName}`}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'done') {
    return <Badge variant="default" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20 font-mono text-[10px] uppercase tracking-wider"><CheckCircle2 className="w-3 h-3 mr-1" /> Done</Badge>;
  }
  if (status === 'error') {
    return <Badge variant="destructive" className="font-mono text-[10px] uppercase tracking-wider"><XCircle className="w-3 h-3 mr-1" /> Error</Badge>;
  }
  if (status === 'pending') {
    return <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">Pending</Badge>;
  }
  
  return (
    <Badge variant="outline" className="border-primary/30 text-primary font-mono text-[10px] uppercase tracking-wider">
      <Loader2 className="w-3 h-3 mr-1 animate-spin" /> {status}
    </Badge>
  );
}
