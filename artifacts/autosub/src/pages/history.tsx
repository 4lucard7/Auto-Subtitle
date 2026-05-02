import { Link } from "wouter";
import { useListJobs, useGetJobStats } from "@workspace/api-client-react";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout";

export default function HistoryPage() {
  const { data: jobs, isLoading: isLoadingJobs } = useListJobs();
  const { data: stats } = useGetJobStats();

  return (
    <AppLayout breadcrumb="Dashboard">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-gray-500 text-sm">Overview of all your subtitle jobs and processing stats.</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Jobs" value={stats.total_jobs} color="gray" />
            <StatCard label="Completed" value={stats.completed_jobs} color="green" />
            <StatCard label="Processing" value={stats.processing_jobs} color="blue" />
            <StatCard label="Minutes Processed" value={Math.round(stats.total_minutes_processed)} color="gray" />
          </div>
        )}

        {/* Jobs table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">Recent Jobs</h2>
            <Link href="/upload" className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1">
              New Job <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoadingJobs ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          ) : !jobs || jobs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No jobs yet.</p>
              <Link href="/upload" className="text-sm font-medium text-gray-900 underline mt-1 inline-block">
                Upload your first video
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">File</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Language</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 group transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[200px] block" title={job.filename}>
                          {job.filename}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {job.detected_language?.toUpperCase() ?? "—"}
                        {job.target_language && (
                          <span className="text-gray-400"> → {job.target_language.toUpperCase()}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {format(new Date(job.created_at), "MMM d, HH:mm")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-gray-900 gap-1 group-hover:gap-1.5 transition-all"
                        >
                          View <ArrowRight className="w-3 h-3" />
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
    </AppLayout>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    gray: "text-gray-900",
    green: "text-green-600",
    blue: "text-blue-600",
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      <p className={`text-3xl font-extrabold ${colors[color] ?? colors.gray}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "done") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> Done
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
        <XCircle className="w-3 h-3" /> Error
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
      <Loader2 className="w-3 h-3 animate-spin" /> {status}
    </span>
  );
}
