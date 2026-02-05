import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, LayoutGrid, Search, Plus, Grid3X3 } from "lucide-react"

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navbar */}
      <div className="h-16 border-b border-slate-200 dark:border-white/[0.04] px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-white/10 flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 dark:text-white/40" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex items-center gap-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-slate-300 dark:text-white/20" />
              <Skeleton className="h-7 w-24" />
            </div>
            <Skeleton className="h-4 w-48 opacity-60" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 rounded-lg bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center gap-2">
              <Plus className="w-4 h-4 text-slate-400 dark:text-white/40" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="h-9 w-24 rounded-lg bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center gap-2">
              <Grid3X3 className="w-4 h-4 text-slate-400 dark:text-white/40" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
        
        {/* Search */}
        <div className="h-11 w-full rounded-xl mb-6 bg-slate-100 dark:bg-white/[0.04] flex items-center px-4 gap-3">
          <Search className="w-4 h-4 text-slate-400 dark:text-white/30" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 flex-1 rounded-lg" />
        </div>

        {/* Sort buttons */}
        <div className="flex justify-center gap-1 mb-6">
          <Skeleton className="h-7 w-14 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-md" />
        </div>

        {/* Task cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-white/[0.04] p-5"
            >
              <Skeleton className="h-5 w-3/4 mb-3" />
              <Skeleton className="h-3 w-full mb-1.5 opacity-60" />
              <Skeleton className="h-3 w-4/5 mb-4 opacity-60" />
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-5 w-12 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.02]">
                <Skeleton className="h-7 flex-1 rounded-md" />
                <Skeleton className="h-7 w-14 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
