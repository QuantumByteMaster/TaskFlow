'use client'

import { useState, useEffect } from 'react'
import { Edit3 } from 'lucide-react'

export default function ScratchpadWidget() {
  const [content, setContent] = useState('')
  const [isSaved, setIsSaved] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('scratchpad-content')
    if (saved) {
      setContent(saved)
    }
  }, [])

  useEffect(() => {
    if (!isSaved) {
      const timer = setTimeout(() => {
        localStorage.setItem('scratchpad-content', content)
        setIsSaved(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [content, isSaved])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    setIsSaved(false)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
          <Edit3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white">Scratchpad</h3>
          <p className="text-xs text-slate-400 dark:text-neutral-500">
            {isSaved ? 'Saved' : 'Saving...'}
          </p>
        </div>
      </div>
      
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Quick notes, ideas, reminders..."
        className="flex-1 min-h-[120px] max-h-[200px] w-full px-3.5 py-3 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-neutral-300 placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:border-slate-300 dark:focus:border-white/20 outline-none resize-none transition-all leading-relaxed overflow-y-auto"
        style={{ wordBreak: 'break-word' }}
      />
    </div>
  )
}
