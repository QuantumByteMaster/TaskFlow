'use client'

import { useState, useEffect } from 'react'
import { X, ArrowRight, CheckCircle, Sparkles } from 'lucide-react'

interface Step {
  emoji: string
  title: string
  description: string
}

const steps: Step[] = [
  {
    emoji: '👋',
    title: 'Welcome to TaskFlow',
    description: 'Your productivity hub for tasks, links, and focus.'
  },
  {
    emoji: '✅',
    title: 'Manage Tasks',
    description: 'Create, prioritize, and track with AI-powered search.'
  },
  {
    emoji: '📋',
    title: 'Kanban Board',
    description: 'Drag tasks across columns to visualize progress.'
  }
]

export default function OnboardingTour() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const completed = localStorage.getItem('onboardingComplete')
    if (!completed) {
      // Small delay for smoother appearance
      const timer = setTimeout(() => setIsVisible(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      localStorage.setItem('onboardingComplete', 'true')
      setIsVisible(false)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('onboardingComplete', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl w-80 overflow-hidden">
        
        {/* Header with close */}
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-500 dark:text-violet-400" />
            <span className="text-xs font-medium text-slate-400 dark:text-neutral-500">
              Quick Tour • {currentStep + 1}/{steps.length}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="p-1 rounded-lg text-slate-400 dark:text-neutral-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{step.emoji}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                {step.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-neutral-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  index === currentStep
                    ? 'w-4 bg-slate-900 dark:bg-white'
                    : 'w-1.5 bg-slate-200 dark:bg-white/10'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-neutral-200 transition-colors"
          >
            {isLastStep ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Done
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
