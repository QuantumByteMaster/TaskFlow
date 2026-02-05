import { Skeleton } from "@/components/ui/skeleton"
import { Link2, Pin, Plus, Globe } from "lucide-react"

export default function LinksSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navbar */}
      <div className="h-16 border-b border-slate-200 dark:border-white/[0.04] px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-white/10 flex items-center justify-center">
            <Link2 className="w-3.5 h-3.5 text-slate-400 dark:text-white/40" />
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
              <Link2 className="w-6 h-6 text-slate-300 dark:text-white/20" />
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-4 w-64 opacity-60" />
          </div>
          <div className="h-9 w-28 rounded-lg bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center gap-2">
            <Plus className="w-4 h-4 text-slate-400 dark:text-white/40" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>

        {/* Pinned Links Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Pin className="w-3.5 h-3.5 text-slate-400 dark:text-white/30" />
            <span className="text-xs font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Pinned</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <LinkCardSkeleton key={`pinned-${i}`} index={i} />
            ))}
          </div>
        </div>

        {/* All Links Section */}
        <div>
          <span className="text-xs font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-3 block">All Links</span>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <LinkCardSkeleton key={`all-${i}`} index={i + 4} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

function LinkCardSkeleton({ index }: { index: number }) {
  return (
    <div 
      className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-white/[0.04] overflow-hidden flex flex-col h-full"
    >
      {/* Media Preview Skeleton */}
      <div className="aspect-video bg-slate-100 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.02] flex items-center justify-center">
        <Globe className="w-8 h-8 text-slate-300 dark:text-white/10" />
      </div>

      {/* Content Skeleton */}
      <div className="p-3 flex flex-col flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm bg-slate-200 dark:bg-white/10 flex items-center justify-center">
            <Link2 className="w-2.5 h-2.5 text-slate-400 dark:text-white/30" />
          </div>
          <Skeleton className="h-3 w-20 opacity-50" />
        </div>
        
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <div className="flex gap-1">
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
