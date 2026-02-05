'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, Check, X, ChevronLeft, ChevronRight } from 'lucide-react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const STORAGE_KEY = 'weekly-planner-data'

interface DayTask {
  id: string
  text: string
  completed: boolean
}

interface WeekData {
  [weekKey: string]: {
    [dayIndex: number]: DayTask[]
  }
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getWeekKey(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return getLocalDateKey(d)
}

function getWeekDates(weekKey: string): Date[] {
  const [year, month, day] = weekKey.split('-').map(Number)
  const start = new Date(year, month - 1, day)
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(year, month - 1, day + i)
    return date
  })
}

export default function WeeklyPlannerWidget() {
  const [currentWeekKey, setCurrentWeekKey] = useState(() => getWeekKey(new Date()))
  const [weekData, setWeekData] = useState<WeekData>({})
  const [addingTo, setAddingTo] = useState<number | null>(null)
  const [newTaskText, setNewTaskText] = useState('')

  const todayIndex = (() => {
    const today = new Date()
    const currentKey = getWeekKey(today)
    if (currentKey !== currentWeekKey) return -1
    const day = today.getDay()
    return day === 0 ? 6 : day - 1
  })()

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setWeekData(JSON.parse(saved))
      } catch {
        setWeekData({})
      }
    }
  }, [])

  useEffect(() => {
    if (Object.keys(weekData).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(weekData))
    }
  }, [weekData])

  const currentWeekTasks = weekData[currentWeekKey] || {}
  const weekDates = getWeekDates(currentWeekKey)

  const addTask = (dayIndex: number) => {
    if (!newTaskText.trim()) return
    
    const newTask: DayTask = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false
    }

    setWeekData(prev => ({
      ...prev,
      [currentWeekKey]: {
        ...prev[currentWeekKey],
        [dayIndex]: [...(prev[currentWeekKey]?.[dayIndex] || []), newTask]
      }
    }))

    setNewTaskText('')
    setAddingTo(null)
  }

  const toggleTask = (dayIndex: number, taskId: string) => {
    setWeekData(prev => ({
      ...prev,
      [currentWeekKey]: {
        ...prev[currentWeekKey],
        [dayIndex]: prev[currentWeekKey]?.[dayIndex]?.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ) || []
      }
    }))
  }

  const removeTask = (dayIndex: number, taskId: string) => {
    setWeekData(prev => ({
      ...prev,
      [currentWeekKey]: {
        ...prev[currentWeekKey],
        [dayIndex]: prev[currentWeekKey]?.[dayIndex]?.filter(task => task.id !== taskId) || []
      }
    }))
  }

  const navigateWeek = (direction: number) => {
    const [year, month, day] = currentWeekKey.split('-').map(Number)
    const current = new Date(year, month - 1, day)
    current.setDate(current.getDate() + (direction * 7))
    setCurrentWeekKey(getWeekKey(current))
  }

  const isCurrentWeek = currentWeekKey === getWeekKey(new Date())

  const formatWeekRange = () => {
    const start = weekDates[0]
    const end = weekDates[6]
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
    
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}`
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Weekly Planner</h3>
            <p className="text-xs text-slate-400 dark:text-neutral-500">{formatWeekRange()}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-1.5 rounded-lg text-slate-400 dark:text-neutral-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {!isCurrentWeek && (
            <button
              onClick={() => setCurrentWeekKey(getWeekKey(new Date()))}
              className="px-2 py-1 text-[10px] font-medium rounded-md bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              Today
            </button>
          )}
          <button
            onClick={() => navigateWeek(1)}
            className="p-1.5 rounded-lg text-slate-400 dark:text-neutral-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="flex-1 grid grid-cols-7 gap-1">
        {DAYS.map((day, index) => {
          const tasks = currentWeekTasks[index] || []
          const isToday = index === todayIndex
          const isPast = isCurrentWeek && index < todayIndex
          const date = weekDates[index]

          return (
            <div
              key={day}
              className={`flex flex-col rounded-lg p-2 transition-colors ${
                isToday 
                  ? 'bg-slate-100 dark:bg-white/[0.06] ring-1 ring-slate-200 dark:ring-white/10' 
                  : isPast 
                    ? 'bg-slate-50/50 dark:bg-white/[0.01]' 
                    : 'bg-slate-50 dark:bg-white/[0.02]'
              }`}
            >
              {/* Day Header */}
              <div className="text-center mb-2">
                <p className={`text-[10px] font-medium uppercase tracking-wide ${
                  isToday 
                    ? 'text-slate-900 dark:text-white' 
                    : isPast 
                      ? 'text-slate-300 dark:text-neutral-600' 
                      : 'text-slate-500 dark:text-neutral-500'
                }`}>
                  {day}
                </p>
                <p className={`text-xs ${
                  isToday 
                    ? 'text-slate-700 dark:text-neutral-300 font-medium' 
                    : isPast 
                      ? 'text-slate-300 dark:text-neutral-600' 
                      : 'text-slate-400 dark:text-neutral-500'
                }`}>
                  {date.getDate()}
                </p>
              </div>

              {/* Tasks */}
              <div className="flex-1 space-y-1 min-h-[60px]">
                {tasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    className={`group flex items-start gap-1 p-1 rounded text-[10px] ${
                      task.completed 
                        ? 'text-slate-300 dark:text-neutral-600 line-through' 
                        : isPast 
                          ? 'text-slate-400 dark:text-neutral-500'
                          : 'text-slate-600 dark:text-neutral-300'
                    }`}
                  >
                    <button
                      onClick={() => toggleTask(index, task.id)}
                      className="shrink-0 mt-0.5"
                    >
                      <div className={`w-3 h-3 rounded border flex items-center justify-center ${
                        task.completed 
                          ? 'bg-emerald-500 border-emerald-500' 
                          : 'border-slate-300 dark:border-neutral-600 hover:border-emerald-400'
                      }`}>
                        {task.completed && <Check className="w-2 h-2 text-white" />}
                      </div>
                    </button>
                    <span className="flex-1 leading-tight truncate">{task.text}</span>
                    <button
                      onClick={() => removeTask(index, task.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 dark:text-neutral-600 hover:text-red-400 transition-opacity"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
                {tasks.length > 3 && (
                  <p className="text-[9px] text-slate-400 dark:text-neutral-500 text-center">
                    +{tasks.length - 3} more
                  </p>
                )}
              </div>

              {/* Add Button */}
              {addingTo === index ? (
                <div className="mt-1">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Task..."
                    className="w-full px-1.5 py-1 text-[10px] rounded bg-white dark:bg-black border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addTask(index)
                      if (e.key === 'Escape') setAddingTo(null)
                    }}
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  onClick={() => setAddingTo(index)}
                  className="mt-1 w-full py-1 rounded text-slate-300 dark:text-neutral-600 hover:text-slate-500 dark:hover:text-neutral-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <Plus className="w-3 h-3 mx-auto" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
