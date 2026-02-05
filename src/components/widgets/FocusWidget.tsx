'use client'

import { useState, useEffect } from 'react'
import { Flame, RefreshCw, Edit3, Check, X } from 'lucide-react'

// Curated motivational quotes
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

const STORAGE_KEY = 'focus-widget-data'

interface FocusData {
  todaysFocus: string
  quoteIndex: number
  lastUpdated: string
}

export default function FocusWidget() {
  const [focus, setFocus] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data: FocusData = JSON.parse(saved)
        const now = new Date()
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        
        // Reset quote daily, but keep focus if set today
        if (data.lastUpdated === today) {
          setFocus(data.todaysFocus)
          setQuoteIndex(data.quoteIndex)
        } else {
          // New day - new quote
          const newIndex = Math.floor(Math.random() * QUOTES.length)
          setQuoteIndex(newIndex)
          saveData('', newIndex)
        }
      } catch {
        initializeData()
      }
    } else {
      initializeData()
    }
  }

  const initializeData = () => {
    const newIndex = Math.floor(Math.random() * QUOTES.length)
    setQuoteIndex(newIndex)
    saveData('', newIndex)
  }

  const saveData = (todaysFocus: string, index: number) => {
    const now = new Date()
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const data: FocusData = {
      todaysFocus,
      quoteIndex: index,
      lastUpdated: todayKey
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  const handleSaveFocus = () => {
    setFocus(editValue)
    saveData(editValue, quoteIndex)
    setIsEditing(false)
  }

  const handleNewQuote = () => {
    const newIndex = (quoteIndex + 1) % QUOTES.length
    setQuoteIndex(newIndex)
    saveData(focus, newIndex)
  }

  const quote = QUOTES[quoteIndex]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-500 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Today's Focus</h3>
            <p className="text-xs text-slate-400 dark:text-neutral-500">Stay locked in</p>
          </div>
        </div>
      </div>

      {/* Focus Input/Display */}
      <div className="mb-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="What's your main focus today?"
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 outline-none focus:border-slate-300 dark:focus:border-white/20"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveFocus()}
              autoFocus
            />
            <button
              onClick={handleSaveFocus}
              className="p-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setEditValue(focus)
              setIsEditing(true)
            }}
            className="w-full text-left group"
          >
            {focus ? (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06]">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                <p className="text-sm font-medium text-slate-800 dark:text-neutral-200">{focus}</p>
                <Edit3 className="w-3.5 h-3.5 text-slate-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-slate-400 dark:text-neutral-500 hover:border-slate-300 dark:hover:border-white/20 transition-colors">
                <Edit3 className="w-4 h-4" />
                <span className="text-sm">Set your focus for today...</span>
              </div>
            )}
          </button>
        )}
      </div>

      {/* Quote */}
      <div className="mt-auto">
        <div className="relative p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-white/[0.02] dark:to-white/[0.01] border border-slate-100 dark:border-white/[0.04]">
          <button
            onClick={handleNewQuote}
            className="absolute top-2 right-2 p-1.5 rounded-md text-slate-300 dark:text-neutral-600 hover:text-slate-500 dark:hover:text-neutral-400 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors"
            title="New quote"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          <p className="text-sm text-slate-600 dark:text-neutral-400 italic leading-relaxed pr-6">
            "{quote.text}"
          </p>
          <p className="text-xs text-slate-400 dark:text-neutral-500 mt-2">
            — {quote.author}
          </p>
        </div>
      </div>
    </div>
  )
}
