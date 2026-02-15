'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ListChecks, Target, Calendar, RefreshCw, Edit3, Check, X, 
  Plus, Trash2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Quote, ArrowLeft, Star
} from 'lucide-react'

// ==================== STORAGE KEYS ====================
const FOCUS_KEY = 'personal-dashboard-focus-v3'
const GOALS_KEY = 'personal-dashboard-goals-v3'
const PLANNER_KEY = 'personal-dashboard-weekly-goals'

// ==================== QUOTES ====================
const QUOTES = [
  { text: "Everything negative—pressure, challenges—is all an opportunity for me to rise.", author: "Kobe Bryant" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" }
]

// ==================== TYPES ====================
interface FocusItem { id: string; text: string; completed: boolean; isPrimary: boolean }
interface Goal { id: string; text: string; completed: boolean }
interface GoalsData { mainGoal: string; miniGoals: Goal[]; monthlyGoals: Goal[]; yearlyGoals: Goal[] }
interface WeeklyGoal { id: string; text: string; completed: boolean }
interface WeeklyGoalsData { [weekKey: string]: WeeklyGoal[] }
interface FocusData { items: FocusItem[]; quoteIndex: number; lastUpdated: string }

// ==================== HELPERS ====================
function getLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
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
  return Array.from({ length: 7 }, (_, i) => new Date(year, month - 1, day + i))
}

// ==================== MINI CALENDAR COMPONENT ====================
function MiniCalendar() {
  const [viewDate, setViewDate] = useState(new Date())
  const today = new Date()
  
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const navigateMonth = (direction: number) => {
    const newDate = new Date(year, month + direction, 1)
    setViewDate(newDate)
  }
  
  const goToToday = () => setViewDate(new Date())
  
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()
  
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-white/[0.06] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20">
            <Calendar className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              {viewDate.toLocaleString('default', { month: 'long' })}
            </p>
            <p className="text-sm text-slate-500 dark:text-neutral-500">{year}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => navigateMonth(-1)} className="p-2 rounded-lg text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {!isCurrentMonth && (
            <button onClick={goToToday} className="px-2 py-1 text-xs font-medium rounded-md bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-500/20 transition-all">
              Today
            </button>
          )}
          <button onClick={() => navigateMonth(1)} className="p-2 rounded-lg text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-slate-400 dark:text-neutral-500">{d}</div>
        ))}
        {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} className="w-8 h-8" />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1
          const isToday = isCurrentMonth && d === today.getDate()
          return (
            <div key={d} className={`w-8 h-8 flex items-center justify-center text-sm rounded-full transition-all cursor-default ${
              isToday 
                ? 'bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/30' 
                : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}>
              {d}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ==================== MAIN COMPONENT ====================
export default function PersonalDashboardPage() {
  const router = useRouter()
  
  const [isLoaded, setIsLoaded] = useState(false)

  // Focus state
  const [focusItems, setFocusItems] = useState<FocusItem[]>([])
  const [addingFocus, setAddingFocus] = useState(false)
  const [newFocusText, setNewFocusText] = useState('')
  const [editingFocusId, setEditingFocusId] = useState<string | null>(null)
  const [editFocusText, setEditFocusText] = useState('')
  const [quoteIndex, setQuoteIndex] = useState(0)
  
  // Goals state
  const [goals, setGoals] = useState<GoalsData>({ mainGoal: '', miniGoals: [], monthlyGoals: [], yearlyGoals: [] })
  const [isEditingMain, setIsEditingMain] = useState(false)
  const [editMainValue, setEditMainValue] = useState('')
  const [addingTo, setAddingTo] = useState<'mini' | 'monthly' | 'yearly' | null>(null)
  const [newGoalText, setNewGoalText] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [editingGoal, setEditingGoal] = useState<{ type: 'mini' | 'monthly' | 'yearly', id: string } | null>(null)
  const [editGoalText, setEditGoalText] = useState('')
  
  // Weekly Goals state
  const [currentWeekKey, setCurrentWeekKey] = useState(() => getWeekKey(new Date()))
  const [weeklyGoalsData, setWeeklyGoalsData] = useState<WeeklyGoalsData>({})
  const [addingWeeklyGoal, setAddingWeeklyGoal] = useState(false)
  const [newWeeklyGoalText, setNewWeeklyGoalText] = useState('')
  const [editingWeeklyGoalId, setEditingWeeklyGoalId] = useState<string | null>(null)
  const [editWeeklyGoalText, setEditWeeklyGoalText] = useState('')

  // Load data
  useEffect(() => {
    const now = new Date()
    const today = getLocalDateKey(now)
    
    const savedFocus = localStorage.getItem(FOCUS_KEY)
    if (savedFocus) {
      try {
        const data: FocusData = JSON.parse(savedFocus)
        if (data.lastUpdated === today) { setFocusItems(data.items || []); setQuoteIndex(data.quoteIndex) }
        else { setQuoteIndex(Math.floor(Math.random() * QUOTES.length)) }
      } catch { setQuoteIndex(Math.floor(Math.random() * QUOTES.length)) }
    } else { setQuoteIndex(Math.floor(Math.random() * QUOTES.length)) }

    const savedGoals = localStorage.getItem(GOALS_KEY)
    if (savedGoals) {
      try {
        const parsed = JSON.parse(savedGoals)
        if (typeof parsed.yearlyGoal === 'string' && parsed.yearlyGoal) {
          parsed.yearlyGoals = [{ id: Date.now().toString(), text: parsed.yearlyGoal, completed: false }]
          delete parsed.yearlyGoal
        }
        if (!parsed.yearlyGoals) parsed.yearlyGoals = []
        setGoals(parsed)
      } catch { /* keep default */ }
    }

    const savedPlanner = localStorage.getItem(PLANNER_KEY)
    if (savedPlanner) { try { setWeeklyGoalsData(JSON.parse(savedPlanner)) } catch { /* keep default */ } }

    setIsLoaded(true)
  }, [])

  // Save data
  useEffect(() => {
    if (!isLoaded) return
    const data: FocusData = { items: focusItems, quoteIndex, lastUpdated: getLocalDateKey(new Date()) }
    localStorage.setItem(FOCUS_KEY, JSON.stringify(data))
  }, [focusItems, quoteIndex, isLoaded])
  useEffect(() => { if (!isLoaded) return; localStorage.setItem(GOALS_KEY, JSON.stringify(goals)) }, [goals, isLoaded])
  useEffect(() => { if (!isLoaded) return; if (Object.keys(weeklyGoalsData).length > 0) localStorage.setItem(PLANNER_KEY, JSON.stringify(weeklyGoalsData)) }, [weeklyGoalsData, isLoaded])

  // Focus handlers
  const addFocus = () => {
    if (!newFocusText.trim()) return
    setFocusItems(prev => [...prev, { id: Date.now().toString(), text: newFocusText.trim(), completed: false, isPrimary: prev.length === 0 }])
    setNewFocusText(''); setAddingFocus(false)
  }
  const toggleFocus = (id: string) => { setFocusItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)) }
  const removeFocus = (id: string) => {
    setFocusItems(prev => {
      const filtered = prev.filter(item => item.id !== id)
      if (filtered.length > 0 && !filtered.some(f => f.isPrimary)) filtered[0].isPrimary = true
      return filtered
    })
  }
  const setPrimaryFocus = (id: string) => { setFocusItems(prev => prev.map(item => ({ ...item, isPrimary: item.id === id }))) }
  const startEditFocus = (item: FocusItem) => { setEditingFocusId(item.id); setEditFocusText(item.text) }
  const saveFocusEdit = () => {
    if (!editFocusText.trim() || !editingFocusId) return
    setFocusItems(prev => prev.map(item => item.id === editingFocusId ? { ...item, text: editFocusText.trim() } : item))
    setEditingFocusId(null); setEditFocusText('')
  }
  const newQuote = () => { setQuoteIndex((prev) => (prev + 1) % QUOTES.length) }

  // Goal handlers
  const saveMainGoal = () => { setGoals(prev => ({ ...prev, mainGoal: editMainValue })); setIsEditingMain(false); setEditMainValue('') }
  const clearMainGoal = () => { setGoals(prev => ({ ...prev, mainGoal: '' })); setIsEditingMain(false) }
  const addGoal = (type: 'mini' | 'monthly' | 'yearly') => {
    if (!newGoalText.trim()) return
    const newGoal: Goal = { id: Date.now().toString(), text: newGoalText.trim(), completed: false }
    if (type === 'mini') setGoals(prev => ({ ...prev, miniGoals: [...prev.miniGoals, newGoal] }))
    else if (type === 'monthly') setGoals(prev => ({ ...prev, monthlyGoals: [...prev.monthlyGoals, newGoal] }))
    else setGoals(prev => ({ ...prev, yearlyGoals: [...prev.yearlyGoals, newGoal] }))
    setNewGoalText(''); setAddingTo(null)
  }
  const toggleGoal = (type: 'mini' | 'monthly' | 'yearly', id: string) => {
    if (type === 'mini') setGoals(prev => ({ ...prev, miniGoals: prev.miniGoals.map(g => g.id === id ? { ...g, completed: !g.completed } : g) }))
    else if (type === 'monthly') setGoals(prev => ({ ...prev, monthlyGoals: prev.monthlyGoals.map(g => g.id === id ? { ...g, completed: !g.completed } : g) }))
    else setGoals(prev => ({ ...prev, yearlyGoals: prev.yearlyGoals.map(g => g.id === id ? { ...g, completed: !g.completed } : g) }))
  }
  const removeGoal = (type: 'mini' | 'monthly' | 'yearly', id: string) => {
    if (type === 'mini') setGoals(prev => ({ ...prev, miniGoals: prev.miniGoals.filter(g => g.id !== id) }))
    else if (type === 'monthly') setGoals(prev => ({ ...prev, monthlyGoals: prev.monthlyGoals.filter(g => g.id !== id) }))
    else setGoals(prev => ({ ...prev, yearlyGoals: prev.yearlyGoals.filter(g => g.id !== id) }))
  }
  const startEditGoal = (type: 'mini' | 'monthly' | 'yearly', goal: Goal) => { setEditingGoal({ type, id: goal.id }); setEditGoalText(goal.text) }
  const saveGoalEdit = () => {
    if (!editGoalText.trim() || !editingGoal) return
    const { type, id } = editingGoal
    if (type === 'mini') setGoals(prev => ({ ...prev, miniGoals: prev.miniGoals.map(g => g.id === id ? { ...g, text: editGoalText.trim() } : g) }))
    else if (type === 'monthly') setGoals(prev => ({ ...prev, monthlyGoals: prev.monthlyGoals.map(g => g.id === id ? { ...g, text: editGoalText.trim() } : g) }))
    else setGoals(prev => ({ ...prev, yearlyGoals: prev.yearlyGoals.map(g => g.id === id ? { ...g, text: editGoalText.trim() } : g) }))
    setEditingGoal(null); setEditGoalText('')
  }

  // Weekly Goals handlers
  const currentWeekGoals = weeklyGoalsData[currentWeekKey] || []
  const weekDates = getWeekDates(currentWeekKey)
  const addWeeklyGoal = () => {
    if (!newWeeklyGoalText.trim()) return
    setWeeklyGoalsData(prev => ({ ...prev, [currentWeekKey]: [...(prev[currentWeekKey] || []), { id: Date.now().toString(), text: newWeeklyGoalText.trim(), completed: false }] }))
    setNewWeeklyGoalText(''); setAddingWeeklyGoal(false)
  }
  const toggleWeeklyGoal = (goalId: string) => {
    setWeeklyGoalsData(prev => ({ ...prev, [currentWeekKey]: prev[currentWeekKey]?.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g) || [] }))
  }
  const removeWeeklyGoal = (goalId: string) => {
    setWeeklyGoalsData(prev => ({ ...prev, [currentWeekKey]: prev[currentWeekKey]?.filter(g => g.id !== goalId) || [] }))
  }
  const startEditWeeklyGoal = (goal: WeeklyGoal) => { setEditingWeeklyGoalId(goal.id); setEditWeeklyGoalText(goal.text) }
  const saveWeeklyGoalEdit = () => {
    if (!editWeeklyGoalText.trim() || !editingWeeklyGoalId) return
    setWeeklyGoalsData(prev => ({ ...prev, [currentWeekKey]: prev[currentWeekKey]?.map(g => g.id === editingWeeklyGoalId ? { ...g, text: editWeeklyGoalText.trim() } : g) || [] }))
    setEditingWeeklyGoalId(null); setEditWeeklyGoalText('')
  }
  const navigateWeek = (direction: number) => {
    const [year, month, day] = currentWeekKey.split('-').map(Number)
    const current = new Date(year, month - 1, day)
    current.setDate(current.getDate() + (direction * 7))
    setCurrentWeekKey(getWeekKey(current))
  }

  const isCurrentWeek = currentWeekKey === getWeekKey(new Date())
  const formatWeekRange = () => {
    const start = weekDates[0], end = weekDates[6]
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
    return startMonth === endMonth ? `${startMonth} ${start.getDate()} - ${end.getDate()}` : `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`
  }

  const miniProgress = goals.miniGoals.length > 0 ? Math.round((goals.miniGoals.filter(g => g.completed).length / goals.miniGoals.length) * 100) : 0
  const weeklyProgress = currentWeekGoals.length > 0 ? Math.round((currentWeekGoals.filter(g => g.completed).length / currentWeekGoals.length) * 100) : 0
  const focusProgress = focusItems.length > 0 ? Math.round((focusItems.filter(f => f.completed).length / focusItems.length) * 100) : 0
  const quote = QUOTES[quoteIndex]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-white/[0.04] bg-white dark:bg-gradient-to-b dark:from-neutral-950 dark:to-black sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/workspace')} className="p-2.5 -ml-2 rounded-xl text-slate-400 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{greeting}</h1>
              <p className="text-base text-slate-500 dark:text-neutral-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Today's Tasks */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-white/[0.06] p-7 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/15 flex items-center justify-center border border-orange-200 dark:border-orange-500/20">
                      <ListChecks className="w-6 h-6 text-orange-500 dark:text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Today's Tasks</h2>
                      <p className="text-sm text-slate-500 dark:text-neutral-500">{focusItems.length > 0 ? `${focusProgress}% complete` : 'What will you accomplish?'}</p>
                    </div>
                  </div>
                  <button onClick={() => setAddingFocus(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-base font-medium text-orange-600 dark:text-orange-400/80 hover:text-orange-700 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all">
                    <Plus className="w-5 h-5" /><span>Add</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {focusItems.map(item => (
                    <div key={item.id} className="group">
                      {editingFocusId === item.id ? (
                        <div className="flex items-center gap-3">
                          <input type="text" value={editFocusText} onChange={(e) => setEditFocusText(e.target.value)}
                            className="flex-1 px-4 py-3.5 text-base rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 outline-none focus:border-orange-500/50"
                            onKeyDown={(e) => { if (e.key === 'Enter') saveFocusEdit(); if (e.key === 'Escape') setEditingFocusId(null) }} autoFocus />
                          <button onClick={saveFocusEdit} className="p-3.5 rounded-xl bg-orange-500 text-white"><Check className="w-5 h-5" /></button>
                          <button onClick={() => setEditingFocusId(null)} className="p-3.5 rounded-xl text-slate-400 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-white/5"><X className="w-5 h-5" /></button>
                        </div>
                      ) : (
                        <div className={`flex items-center gap-4 p-4 rounded-xl transition-all ${item.isPrimary ? 'bg-orange-50 dark:bg-black/30 border border-orange-200 dark:border-orange-500/20' : 'bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/[0.04] hover:border-slate-200 dark:hover:border-white/10'}`}>
                          <button onClick={() => toggleFocus(item.id)} className="shrink-0">
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-neutral-600 hover:border-orange-400'}`}>
                              {item.completed && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                            </div>
                          </button>
                          {item.isPrimary && <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 shrink-0 shadow-lg shadow-orange-500/30" />}
                          <span className={`flex-1 text-base ${item.completed ? 'text-slate-400 dark:text-neutral-500 line-through' : ''}`}>{item.text}</span>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!item.isPrimary && <button onClick={() => setPrimaryFocus(item.id)} className="p-2 rounded-lg text-slate-400 dark:text-neutral-600 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10" title="Set as priority"><Star className="w-4 h-4" /></button>}
                            <button onClick={() => startEditFocus(item)} className="p-2 rounded-lg text-slate-400 dark:text-neutral-600 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => removeFocus(item.id)} className="p-2 rounded-lg text-slate-400 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {addingFocus && (
                    <div className="flex items-center gap-3">
                      <input type="text" value={newFocusText} onChange={(e) => setNewFocusText(e.target.value)} placeholder="What will you accomplish?"
                        className="flex-1 px-4 py-3.5 text-base rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 placeholder-slate-400 dark:placeholder-neutral-600 outline-none focus:border-orange-500/50"
                        onKeyDown={(e) => { if (e.key === 'Enter') addFocus(); if (e.key === 'Escape') { setAddingFocus(false); setNewFocusText('') } }} autoFocus />
                      <button onClick={addFocus} className="p-3.5 rounded-xl bg-orange-500 text-white hover:bg-orange-400 transition-colors"><Check className="w-5 h-5" /></button>
                      <button onClick={() => { setAddingFocus(false); setNewFocusText('') }} className="p-3.5 rounded-xl text-slate-400 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-white/5"><X className="w-5 h-5" /></button>
                    </div>
                  )}

                  {focusItems.length === 0 && !addingFocus && (
                    <button onClick={() => setAddingFocus(true)} className="w-full flex items-center gap-4 p-5 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-400 dark:text-neutral-500 hover:border-orange-300 dark:hover:border-orange-500/30 hover:text-orange-500 dark:hover:text-orange-400/80 transition-all">
                      <Plus className="w-6 h-6" /><span className="text-lg">Add your first task for today...</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Weekly Goals */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-white/[0.06] p-7">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center border border-blue-200 dark:border-blue-500/20">
                    <Calendar className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Weekly Goals</h2>
                    <p className="text-sm text-slate-500 dark:text-neutral-500">{formatWeekRange()} • {weeklyProgress}% complete</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigateWeek(-1)} className="p-2.5 rounded-lg text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"><ChevronLeft className="w-5 h-5" /></button>
                  {!isCurrentWeek && <button onClick={() => setCurrentWeekKey(getWeekKey(new Date()))} className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all">This Week</button>}
                  <button onClick={() => navigateWeek(1)} className="p-2.5 rounded-lg text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"><ChevronRight className="w-5 h-5" /></button>
                  <button onClick={() => setAddingWeeklyGoal(true)} className="ml-2 flex items-center gap-2 px-4 py-2 rounded-lg text-base font-medium text-blue-600 dark:text-blue-400/80 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"><Plus className="w-5 h-5" /><span>Add Goal</span></button>
                </div>
              </div>

              <div className="space-y-3">
                {addingWeeklyGoal && (
                  <div className="flex items-center gap-3">
                    <input type="text" value={newWeeklyGoalText} onChange={(e) => setNewWeeklyGoalText(e.target.value)} placeholder="What do you want to achieve this week?"
                      className="flex-1 px-4 py-3.5 text-base rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 placeholder-slate-400 dark:placeholder-neutral-600 outline-none focus:border-blue-500/50"
                      onKeyDown={(e) => { if (e.key === 'Enter') addWeeklyGoal(); if (e.key === 'Escape') { setAddingWeeklyGoal(false); setNewWeeklyGoalText('') } }} autoFocus />
                    <button onClick={addWeeklyGoal} className="p-3.5 rounded-xl bg-blue-500 text-white hover:bg-blue-400 transition-colors"><Check className="w-5 h-5" /></button>
                    <button onClick={() => { setAddingWeeklyGoal(false); setNewWeeklyGoalText('') }} className="p-3.5 rounded-xl text-slate-400 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-white/5"><X className="w-5 h-5" /></button>
                  </div>
                )}

                {currentWeekGoals.map(goal => (
                  <div key={goal.id} className="group">
                    {editingWeeklyGoalId === goal.id ? (
                      <div className="flex items-center gap-3">
                        <input type="text" value={editWeeklyGoalText} onChange={(e) => setEditWeeklyGoalText(e.target.value)}
                          className="flex-1 px-4 py-3.5 text-base rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-500/50"
                          onKeyDown={(e) => { if (e.key === 'Enter') saveWeeklyGoalEdit(); if (e.key === 'Escape') setEditingWeeklyGoalId(null) }} autoFocus />
                        <button onClick={saveWeeklyGoalEdit} className="p-3.5 rounded-xl bg-blue-500 text-white"><Check className="w-5 h-5" /></button>
                        <button onClick={() => setEditingWeeklyGoalId(null)} className="p-3.5 rounded-xl text-slate-400 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-white/5"><X className="w-5 h-5" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] border border-slate-100 dark:border-white/[0.04] transition-all">
                        <button onClick={() => toggleWeeklyGoal(goal.id)} className="shrink-0">
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${goal.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-neutral-600 hover:border-blue-400'}`}>
                            {goal.completed && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                          </div>
                        </button>
                        <span className={`flex-1 text-base ${goal.completed ? 'text-slate-400 dark:text-neutral-500 line-through' : 'text-slate-700 dark:text-neutral-200'}`}>{goal.text}</span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEditWeeklyGoal(goal)} className="p-2 rounded-lg text-slate-400 dark:text-neutral-600 hover:text-slate-700 dark:hover:text-white hover:bg-white dark:hover:bg-white/5"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => removeWeeklyGoal(goal.id)} className="p-2 rounded-lg text-slate-400 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {currentWeekGoals.length === 0 && !addingWeeklyGoal && (
                  <button onClick={() => setAddingWeeklyGoal(true)} className="w-full flex items-center gap-4 p-5 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-400 dark:text-neutral-500 hover:border-blue-300 dark:hover:border-blue-500/30 hover:text-blue-500 dark:hover:text-blue-400/80 transition-all">
                    <Plus className="w-6 h-6" /><span className="text-lg">Add your first goal for this week...</span>
                  </button>
                )}
              </div>
            </div>

            {/* Life Goals */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-white/[0.06] p-7">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/15 flex items-center justify-center border border-purple-200 dark:border-purple-500/20">
                    <Target className="w-6 h-6 text-purple-500 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Life Goals</h2>
                    <p className="text-sm text-slate-500 dark:text-neutral-500">Track your ambitions</p>
                  </div>
                </div>
                {goals.miniGoals.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-2.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500" style={{ width: `${miniProgress}%` }} />
                    </div>
                    <span className="text-base font-medium text-slate-500 dark:text-neutral-400">{miniProgress}%</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Goal */}
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-neutral-500 uppercase tracking-wider mb-4">🎯 Most Important Goal</p>
                  {isEditingMain ? (
                    <div className="flex gap-3">
                      <input type="text" value={editMainValue} onChange={(e) => setEditMainValue(e.target.value)} placeholder="Your #1 life goal..."
                        className="flex-1 px-4 py-4 text-base rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 placeholder-slate-400 dark:placeholder-neutral-600 outline-none focus:border-purple-500/50"
                        onKeyDown={(e) => { if (e.key === 'Enter') saveMainGoal(); if (e.key === 'Escape') setIsEditingMain(false) }} autoFocus />
                      <button onClick={saveMainGoal} className="px-5 py-4 rounded-xl bg-purple-500 text-white hover:bg-purple-400 transition-colors"><Check className="w-5 h-5" /></button>
                      {goals.mainGoal && <button onClick={clearMainGoal} className="px-5 py-4 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"><Trash2 className="w-5 h-5" /></button>}
                    </div>
                  ) : (
                    <button onClick={() => { setEditMainValue(goals.mainGoal); setIsEditingMain(true) }} className="w-full text-left group">
                      {goals.mainGoal ? (
                        <div className="p-5 rounded-xl bg-purple-50 dark:bg-gradient-to-r dark:from-purple-500/10 dark:to-purple-600/5 border border-purple-200 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-500/40 transition-all flex items-center justify-between">
                          <p className="text-lg font-medium">{goals.mainGoal}</p>
                          <Edit3 className="w-5 h-5 text-slate-400 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ) : (
                        <div className="p-5 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-400 dark:text-neutral-500 hover:border-purple-300 dark:hover:border-purple-500/30 hover:text-purple-500 dark:hover:text-purple-400/80 transition-all flex items-center gap-3">
                          <Plus className="w-5 h-5" /><span className="text-base">Set your most important goal</span>
                        </div>
                      )}
                    </button>
                  )}
                </div>

                {/* Mini Goals */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-slate-500 dark:text-neutral-500 uppercase tracking-wider">✨ Mini Goals</p>
                    <button onClick={() => setAddingTo(addingTo === 'mini' ? null : 'mini')} className="p-2 rounded-lg text-slate-400 dark:text-neutral-500 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all"><Plus className="w-5 h-5" /></button>
                  </div>
                  {addingTo === 'mini' && (
                    <div className="mb-4">
                      <input type="text" value={newGoalText} onChange={(e) => setNewGoalText(e.target.value)} placeholder="New mini goal..."
                        className="w-full px-4 py-3.5 text-base rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 placeholder-slate-400 dark:placeholder-neutral-600 outline-none focus:border-purple-500/50"
                        onKeyDown={(e) => { if (e.key === 'Enter') addGoal('mini'); if (e.key === 'Escape') setAddingTo(null) }} autoFocus />
                    </div>
                  )}
                  <div className="space-y-3 max-h-[220px] overflow-y-auto">
                    {goals.miniGoals.map(goal => (
                      <div key={goal.id} className="group">
                        {editingGoal?.type === 'mini' && editingGoal.id === goal.id ? (
                          <div className="flex gap-3">
                            <input type="text" value={editGoalText} onChange={(e) => setEditGoalText(e.target.value)}
                              className="flex-1 px-4 py-3 text-base rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 outline-none"
                              onKeyDown={(e) => { if (e.key === 'Enter') saveGoalEdit(); if (e.key === 'Escape') setEditingGoal(null) }} autoFocus />
                            <button onClick={saveGoalEdit} className="p-3 rounded-xl bg-purple-500 text-white"><Check className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all">
                            <button onClick={() => toggleGoal('mini', goal.id)}>
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${goal.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-neutral-600 hover:border-emerald-400'}`}>
                                {goal.completed && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                              </div>
                            </button>
                            <span className={`flex-1 text-base ${goal.completed ? 'text-slate-400 dark:text-neutral-500 line-through' : 'text-slate-700 dark:text-neutral-200'}`}>{goal.text}</span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEditGoal('mini', goal)} className="p-2 text-slate-400 dark:text-neutral-600 hover:text-slate-700 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                              <button onClick={() => removeGoal('mini', goal.id)} className="p-2 text-slate-400 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {goals.miniGoals.length === 0 && addingTo !== 'mini' && (
                      <div className="py-10 text-center">
                        <p className="text-base text-slate-400 dark:text-neutral-600">No mini goals yet</p>
                        <p className="text-sm text-slate-300 dark:text-neutral-700 mt-2">Break down your big goal into smaller wins</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Monthly/Yearly Goals */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/[0.04]">
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center justify-between w-full py-3 text-base text-slate-500 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-neutral-300 transition-colors">
                  <span className="font-medium">Monthly & Yearly Goals</span>
                  {showAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {showAdvanced && (
                  <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Goals */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold text-slate-500 dark:text-neutral-500 uppercase tracking-wider">📅 This Month</p>
                        <button onClick={() => setAddingTo(addingTo === 'monthly' ? null : 'monthly')} className="p-2 rounded-lg text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"><Plus className="w-4 h-4" /></button>
                      </div>
                      {addingTo === 'monthly' && (
                        <input type="text" value={newGoalText} onChange={(e) => setNewGoalText(e.target.value)} placeholder="Monthly goal..."
                          className="w-full px-4 py-3 text-base rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 outline-none mb-4"
                          onKeyDown={(e) => { if (e.key === 'Enter') addGoal('monthly'); if (e.key === 'Escape') setAddingTo(null) }} autoFocus />
                      )}
                      <div className="space-y-3">
                        {goals.monthlyGoals.map(goal => (
                          <div key={goal.id} className="group">
                            {editingGoal?.type === 'monthly' && editingGoal.id === goal.id ? (
                              <div className="flex gap-2">
                                <input type="text" value={editGoalText} onChange={(e) => setEditGoalText(e.target.value)}
                                  className="flex-1 px-3 py-2.5 text-base rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 outline-none"
                                  onKeyDown={(e) => { if (e.key === 'Enter') saveGoalEdit(); if (e.key === 'Escape') setEditingGoal(null) }} autoFocus />
                                <button onClick={saveGoalEdit} className="p-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black"><Check className="w-4 h-4" /></button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                                <button onClick={() => toggleGoal('monthly', goal.id)}>
                                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${goal.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-neutral-600 hover:border-emerald-400'}`}>
                                    {goal.completed && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                </button>
                                <span className={`flex-1 text-base ${goal.completed ? 'text-slate-400 dark:text-neutral-500 line-through' : 'text-slate-600 dark:text-neutral-400'}`}>{goal.text}</span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startEditGoal('monthly', goal)} className="p-1.5 text-slate-400 dark:text-neutral-600 hover:text-slate-700 dark:hover:text-white"><Edit3 className="w-4 h-4" /></button>
                                  <button onClick={() => removeGoal('monthly', goal.id)} className="p-1.5 text-slate-400 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {goals.monthlyGoals.length === 0 && addingTo !== 'monthly' && <p className="text-base text-slate-400 dark:text-neutral-600 py-3">No monthly goals set</p>}
                      </div>
                    </div>

                    {/* Yearly Goals */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold text-slate-500 dark:text-neutral-500 uppercase tracking-wider">🎯 Yearly Goals</p>
                        <button onClick={() => setAddingTo(addingTo === 'yearly' ? null : 'yearly')} className="p-2 rounded-lg text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"><Plus className="w-4 h-4" /></button>
                      </div>
                      {addingTo === 'yearly' && (
                        <input type="text" value={newGoalText} onChange={(e) => setNewGoalText(e.target.value)} placeholder="Yearly goal..."
                          className="w-full px-4 py-3 text-base rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 outline-none mb-4"
                          onKeyDown={(e) => { if (e.key === 'Enter') addGoal('yearly'); if (e.key === 'Escape') setAddingTo(null) }} autoFocus />
                      )}
                      <div className="space-y-3">
                        {goals.yearlyGoals.map(goal => (
                          <div key={goal.id} className="group">
                            {editingGoal?.type === 'yearly' && editingGoal.id === goal.id ? (
                              <div className="flex gap-2">
                                <input type="text" value={editGoalText} onChange={(e) => setEditGoalText(e.target.value)}
                                  className="flex-1 px-3 py-2.5 text-base rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 outline-none"
                                  onKeyDown={(e) => { if (e.key === 'Enter') saveGoalEdit(); if (e.key === 'Escape') setEditingGoal(null) }} autoFocus />
                                <button onClick={saveGoalEdit} className="p-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black"><Check className="w-4 h-4" /></button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                                <button onClick={() => toggleGoal('yearly', goal.id)}>
                                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${goal.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-neutral-600 hover:border-emerald-400'}`}>
                                    {goal.completed && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                </button>
                                <span className={`flex-1 text-base ${goal.completed ? 'text-slate-400 dark:text-neutral-500 line-through' : 'text-slate-600 dark:text-neutral-400'}`}>{goal.text}</span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startEditGoal('yearly', goal)} className="p-1.5 text-slate-400 dark:text-neutral-600 hover:text-slate-700 dark:hover:text-white"><Edit3 className="w-4 h-4" /></button>
                                  <button onClick={() => removeGoal('yearly', goal.id)} className="p-1.5 text-slate-400 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {goals.yearlyGoals.length === 0 && addingTo !== 'yearly' && <p className="text-base text-slate-400 dark:text-neutral-600 py-3">No yearly goals set</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-72 shrink-0 space-y-6">
            {/* Mini Calendar */}
            <MiniCalendar />

            {/* Daily Wisdom */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-white/[0.06] p-5 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Quote className="w-4 h-4 text-purple-500 dark:text-purple-400/60" />
                    <span className="text-xs font-medium text-purple-500 dark:text-purple-400/60 uppercase tracking-wider">Daily Wisdom</span>
                  </div>
                  <button onClick={newQuote} className="p-2 rounded-lg text-slate-400 dark:text-neutral-600 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm text-slate-600 dark:text-neutral-300 italic leading-relaxed">"{quote.text}"</p>
                <p className="text-xs text-slate-400 dark:text-neutral-500 mt-3">— {quote.author}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
