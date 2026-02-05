'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import AIAssistantModal from '@/components/AIAssistantModal'
import WidgetGrid from '@/components/widgets/WidgetGrid'
import OnboardingTour from '@/components/OnboardingTour'
import WorkspaceSkeleton from '@/components/skeletons/WorkspaceSkeleton'

export default function Workspace() {
  const router = useRouter()
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuth()
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)

  useEffect(() => {
    const init = async () => {
      await checkAuthStatus();
      if (!isAuthenticated && !isLoading) {
        router.push('/auth/login')
      }
    };
    init();
  }, [isAuthenticated, isLoading, router, checkAuthStatus])

  if (isLoading) {
    return <WorkspaceSkeleton />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Welcome */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Welcome back 👋
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400">
            What would you like to work on today?
          </p>
        </div>

        {/* Widget Grid */}
        <WidgetGrid onOpenAIModal={() => setIsAIModalOpen(true)} />
      </main>

      <AIAssistantModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
      />

      {/* Onboarding Tour for new users */}
      <OnboardingTour />
    </div>
  )
}