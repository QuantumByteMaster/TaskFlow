'use client'

import { useState } from 'react'
import axios from 'axios'

interface NaturalSearchBarProps {
  onSearch: (filters: any, interpretation: string) => void
  onClear: () => void
}

export default function NaturalSearchBar({ onSearch, onClear }: NaturalSearchBarProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [interpretation, setInterpretation] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        '/api/ai/search',
        { query },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setInterpretation(response.data.interpretation)
      onSearch(response.data.filters, response.data.interpretation)
    } catch (error) {
      console.error('Search error:', error)
      setInterpretation('Failed to process search')
    } finally {
      setIsSearching(false)
    }
  }

  const handleClear = () => {
    setQuery('')
    setInterpretation('')
    onClear()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    if (newValue === '') {
      setInterpretation('')
      onClear()
    }
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSearch} className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          {isSearching ? (
            <div className="animate-spin h-4 w-4 border-2 border-slate-300 dark:border-white/20 border-t-slate-600 dark:border-t-white rounded-full" />
          ) : (
            <svg className="w-4 h-4 text-slate-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search with AI... (e.g., 'high priority tasks')"
          className="w-full pl-11 pr-24 py-3 rounded-xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:border-slate-400 dark:focus:border-white/25 focus:ring-2 focus:ring-slate-100 dark:focus:ring-white/5 outline-none transition-all text-sm"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {interpretation && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs px-2 py-1 rounded-md text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              Clear
            </button>
          )}
          <span className="ai-badge text-[10px]">AI</span>
        </div>
      </form>

      {interpretation && (
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5 text-sm text-slate-600 dark:text-neutral-300 animate-fade-in">
          <svg className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{interpretation}</span>
        </div>
      )}
    </div>
  )
}
