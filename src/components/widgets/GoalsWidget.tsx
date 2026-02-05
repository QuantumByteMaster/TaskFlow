'use client'

import { useState, useEffect } from 'react'
import { Target, Plus, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const STORAGE_KEY = 'goals-widget-data'

interface Goal {
  id: string
  text: string
  completed: boolean
}

interface GoalsData {
  mainGoal: string
  miniGoals: Goal[]
  monthlyGoals: Goal[]
  yearlyGoal: string
}

const DEFAULT_DATA: GoalsData = {
  mainGoal: '',
  miniGoals: [],
  monthlyGoals: [],
  yearlyGoal: ''
}

export default function GoalsWidget() {
  const [data, setData] = useState<GoalsData>(DEFAULT_DATA)
  const [isEditing, setIsEditing] = useState<'main' | 'yearly' | null>(null)
  const [editValue, setEditValue] = useState('')
  const [addingTo, setAddingTo] = useState<'mini' | 'monthly' | null>(null)
  const [newGoalText, setNewGoalText] = useState('')
  const [showMonthly, setShowMonthly] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setData(JSON.parse(saved))
      } catch {
        setData(DEFAULT_DATA)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const saveMainGoal = () => {
    setData(prev => ({ ...prev, mainGoal: editValue }))
    setIsEditing(null)
    setEditValue('')
  }

  const saveYearlyGoal = () => {
    setData(prev => ({ ...prev, yearlyGoal: editValue }))
    setIsEditing(null)
    setEditValue('')
  }

  const addGoal = (type: 'mini' | 'monthly') => {
    if (!newGoalText.trim()) return
    const newGoal: Goal = {
      id: Date.now().toString(),
      text: newGoalText.trim(),
      completed: false
    }
    
    if (type === 'mini') {
      setData(prev => ({ ...prev, miniGoals: [...prev.miniGoals, newGoal] }))
    } else {
      setData(prev => ({ ...prev, monthlyGoals: [...prev.monthlyGoals, newGoal] }))
    }
    
    setNewGoalText('')
    setAddingTo(null)
  }

  const toggleGoal = (type: 'mini' | 'monthly', id: string) => {
    if (type === 'mini') {
      setData(prev => ({
        ...prev,
        miniGoals: prev.miniGoals.map(g => 
          g.id === id ? { ...g, completed: !g.completed } : g
        )
      }))
    } else {
      setData(prev => ({
        ...prev,
        monthlyGoals: prev.monthlyGoals.map(g => 
          g.id === id ? { ...g, completed: !g.completed } : g
        )
      }))
    }
  }

  const removeGoal = (type: 'mini' | 'monthly', id: string) => {
    if (type === 'mini') {
      setData(prev => ({
        ...prev,
        miniGoals: prev.miniGoals.filter(g => g.id !== id)
      }))
    } else {
      setData(prev => ({
        ...prev,
        monthlyGoals: prev.monthlyGoals.filter(g => g.id !== id)
      }))
    }
  }

  const miniProgress = data.miniGoals.length > 0
    ? Math.round((data.miniGoals.filter(g => g.completed).length / data.miniGoals.length) * 100)
    : 0

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-purple-500 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Life Goals</h3>
            <p className="text-xs text-slate-400 dark:text-neutral-500">Track your ambitions</p>
          </div>
        </div>
        {data.miniGoals.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${miniProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-slate-400 dark:text-neutral-500">
              {miniProgress}%
            </span>
          </div>
        )}
      </div>

      {/* Main Goal */}
      <div className="mb-3">
        <p className="text-[10px] font-medium text-slate-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">
          Most Important Goal
        </p>
        {isEditing === 'main' ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Your #1 life goal..."
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && saveMainGoal()}
              autoFocus
            />
            <button onClick={saveMainGoal} className="p-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black">
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setEditValue(data.mainGoal); setIsEditing('main') }}
            className="w-full text-left"
          >
            {data.mainGoal ? (
              <p className="text-sm font-medium text-slate-800 dark:text-neutral-200 p-2 rounded-lg bg-purple-50/50 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/10">
                🎯 {data.mainGoal}
              </p>
            ) : (
              <p className="text-sm text-slate-400 dark:text-neutral-500 p-2 rounded-lg border border-dashed border-slate-200 dark:border-white/10">
                + Set your most important goal
              </p>
            )}
          </button>
        )}
      </div>

      {/* Mini Goals */}
      <div className="mb-3 flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-medium text-slate-400 dark:text-neutral-500 uppercase tracking-wide">
            Mini Goals
          </p>
          <button
            onClick={() => setAddingTo(addingTo === 'mini' ? null : 'mini')}
            className="p-1 rounded text-slate-400 dark:text-neutral-500 hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        
        {addingTo === 'mini' && (
          <div className="flex gap-1.5 mb-2">
            <input
              type="text"
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              placeholder="New mini goal..."
              className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') addGoal('mini')
                if (e.key === 'Escape') setAddingTo(null)
              }}
              autoFocus
            />
          </div>
        )}

        <div className="space-y-1">
          {data.miniGoals.map(goal => (
            <div
              key={goal.id}
              className="group flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
            >
              <button onClick={() => toggleGoal('mini', goal.id)}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  goal.completed 
                    ? 'bg-emerald-500 border-emerald-500' 
                    : 'border-slate-300 dark:border-neutral-600'
                }`}>
                  {goal.completed && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
              </button>
              <span className={`flex-1 text-sm ${
                goal.completed 
                  ? 'text-slate-400 dark:text-neutral-500 line-through' 
                  : 'text-slate-700 dark:text-neutral-300'
              }`}>
                {goal.text}
              </span>
              <button
                onClick={() => removeGoal('mini', goal.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 dark:text-neutral-600 hover:text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          {data.miniGoals.length === 0 && !addingTo && (
            <p className="text-xs text-slate-300 dark:text-neutral-600 italic py-2">
              No mini goals yet
            </p>
          )}
        </div>
      </div>

      {/* Monthly/Yearly Collapsible */}
      <div className="border-t border-slate-100 dark:border-white/[0.06] pt-2">
        <button
          onClick={() => setShowMonthly(!showMonthly)}
          className="flex items-center justify-between w-full py-1 text-xs text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300"
        >
          <span>Monthly & Yearly Goals</span>
          {showMonthly ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showMonthly && (
          <div className="mt-2 space-y-3">
            {/* Monthly Goals */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-medium text-slate-400 dark:text-neutral-500">
                  This Month
                </p>
                <button
                  onClick={() => setAddingTo(addingTo === 'monthly' ? null : 'monthly')}
                  className="p-0.5 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
              
              {addingTo === 'monthly' && (
                <input
                  type="text"
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  placeholder="Monthly goal..."
                  className="w-full px-2 py-1 text-[11px] rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none mb-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addGoal('monthly')
                    if (e.key === 'Escape') setAddingTo(null)
                  }}
                  autoFocus
                />
              )}

              {data.monthlyGoals.map(goal => (
                <div key={goal.id} className="flex items-center gap-1.5 py-0.5">
                  <button onClick={() => toggleGoal('monthly', goal.id)}>
                    <div className={`w-3 h-3 rounded border flex items-center justify-center ${
                      goal.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-neutral-600'
                    }`}>
                      {goal.completed && <Check className="w-2 h-2 text-white" />}
                    </div>
                  </button>
                  <span className={`text-[11px] ${goal.completed ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-neutral-400'}`}>
                    {goal.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Yearly Goal */}
            <div>
              <p className="text-[10px] font-medium text-slate-400 dark:text-neutral-500 mb-1">
                Yearly Vision
              </p>
              {isEditing === 'yearly' ? (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 px-2 py-1 text-[11px] rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && saveYearlyGoal()}
                    autoFocus
                  />
                  <button onClick={saveYearlyGoal} className="px-2 py-1 rounded bg-slate-900 dark:bg-white text-white dark:text-black text-[10px]">
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditValue(data.yearlyGoal); setIsEditing('yearly') }}
                  className="text-[11px] text-slate-600 dark:text-neutral-400"
                >
                  {data.yearlyGoal || '+ Set yearly goal'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
