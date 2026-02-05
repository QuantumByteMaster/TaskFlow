'use client'

import { useState, useEffect } from 'react'
import { Sparkles, ArrowRight, AlertCircle, CheckCircle2, Clock, Zap, RefreshCw } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface BriefingData {
  greeting: string
  summary: string
  focusTask: { _id: string; title: string; priority: string; dueDate?: string; status?: string } | null
  insight: string | null
  stats: {
    total: number
    overdue: number
    dueToday: number
    dueTomorrow?: number
    dueThisWeek?: number
    highPriority: number
    completed: number
    inProgress: number
  }
  productivity?: {
    score: number
    trend: 'excellent' | 'good' | 'neutral' | 'needs_attention'
  }
}

export default function DailyBriefingWidget() {
  const [briefing, setBriefing] = useState<BriefingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchBriefing()
  }, [])

  const fetchBriefing = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      
      // First fetch all tasks
      const tasksRes = await axios.get('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Then get AI briefing
      const briefingRes = await axios.post(
        '/api/ai/briefing',
        { tasks: tasksRes.data },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setBriefing(briefingRes.data)
    } catch (err) {
      console.error('Briefing error:', err)
      setError('Unable to generate briefing')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-slate-600 dark:text-neutral-400" />
            </div>
            <div>
              <div className="h-5 w-32 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-24 bg-slate-100 dark:bg-white/5 rounded mt-1 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
        </div>
        <div className="flex gap-3 mt-4">
          <div className="h-6 w-20 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
          <div className="h-6 w-20 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Daily Briefing</h3>
              <p className="text-xs text-slate-400 dark:text-neutral-500">AI-powered insights</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-neutral-400 mb-3">{error}</p>
        <button
          onClick={() => fetchBriefing(true)}
          className="text-sm text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try again
        </button>
      </div>
    )
  }

  if (!briefing) return null

  const { greeting, summary, focusTask, stats, insight, productivity } = briefing

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-slate-600 dark:text-neutral-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{greeting}</h3>
            <p className="text-xs text-slate-400 dark:text-neutral-500">Daily Briefing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {productivity && productivity.score > 0 && (
            <div className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              productivity.trend === 'excellent' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
              productivity.trend === 'good' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' :
              productivity.trend === 'needs_attention' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' :
              'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-neutral-400'
            }`}>
              {productivity.score}%
            </div>
          )}
          <button 
            onClick={() => fetchBriefing(true)}
            disabled={refreshing}
            className="p-2 rounded-lg text-slate-400 dark:text-neutral-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-white transition-colors disabled:opacity-50"
            title="Refresh briefing"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-slate-600 dark:text-neutral-300 mb-4 leading-relaxed">
        {summary}
      </p>

      {/* Insight */}
      {insight && (
        <div className="flex items-start gap-2 mb-4 p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
          <Sparkles className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500 dark:text-neutral-400 italic">{insight}</p>
        </div>
      )}

      {/* Stats Row */}
      <div className="flex flex-wrap gap-2 mb-4">
        {stats.overdue > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            <span>{stats.overdue} overdue</span>
          </div>
        )}
        {stats.dueToday > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium">
            <Clock className="w-3 h-3" />
            <span>{stats.dueToday} due today</span>
          </div>
        )}
        {stats.highPriority > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-300 text-xs font-medium">
            <Zap className="w-3 h-3" />
            <span>{stats.highPriority} high priority</span>
          </div>
        )}
        {stats.completed > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>{stats.completed} done</span>
          </div>
        )}
      </div>

      {/* Focus Task CTA */}
      {focusTask && (
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-auto group flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${
              focusTask.priority === 'High' ? 'bg-rose-500' :
              focusTask.priority === 'Medium' ? 'bg-amber-500' : 'bg-slate-400'
            }`} />
            <span className="text-sm font-medium text-slate-700 dark:text-neutral-200 truncate max-w-[180px]">
              {focusTask.title}
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 dark:text-neutral-500 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  )
}
