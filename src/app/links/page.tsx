'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import axios from 'axios'
import { Sparkles, Pin, ExternalLink, Plus, X, Loader2, Trash2, Edit2, ChevronDown, PenLine } from 'lucide-react'
import LinksSkeleton from '@/components/skeletons/LinksSkeleton'

interface Link {
  _id: string;
  url: string;
  title: string;
  description: string;
  image?: string;
  category: string;
  favicon: string;
  isPinned: boolean;
  createdAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Social: 'bg-pink-50 text-pink-600',
  Learning: 'bg-blue-50 text-blue-600',
  Work: 'bg-slate-100 text-slate-600',
  Entertainment: 'bg-purple-50 text-purple-600',
  News: 'bg-amber-50 text-amber-600',
  Tools: 'bg-emerald-50 text-emerald-600',
  Other: 'bg-slate-50 text-slate-500'
};

export default function LinksPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  
  // Add/Edit State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    category: 'Other',
    image: ''
  })
  
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  
  const [isEnriching, setIsEnriching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/auth/login')
    } else if (isAuthenticated) {
      fetchLinks()
    }
  }, [isAuthenticated, authLoading, router])

  const fetchLinks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/links', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLinks(response.data)
    } catch (error) {
      console.error('Error fetching links:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnrichWithAI = async () => {
    if (!formData.url) return
    setIsEnriching(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('/api/ai/enrich-link', 
        { url: formData.url },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setFormData(prev => ({
        ...prev,
        title: response.data.title || '',
        description: response.data.description || '',
        category: response.data.category || 'Other',
        image: response.data.image || prev.image || ''
      }))
      
      // If AI returns a category not in our list, switch to custom mode
      if (response.data.category && !Object.keys(CATEGORY_COLORS).includes(response.data.category)) {
        setIsCustomCategory(true);
      }
    } catch (error) {
      console.error('AI enrichment failed:', error)
    } finally {
      setIsEnriching(false)
    }
  }

  const handleOpenModal = (link?: Link) => {
    if (link) {
      setEditingLink(link)
      setFormData({
        url: link.url,
        title: link.title,
        description: link.description,
        category: link.category,
        image: link.image || ''
      })
      setIsCustomCategory(!Object.keys(CATEGORY_COLORS).includes(link.category))
    } else {
      setEditingLink(null)
      setFormData({
        url: '',
        title: '',
        description: '',
        category: 'Other',
        image: ''
      })
      setIsCustomCategory(false)
    }
    setIsModalOpen(true)
  }

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.url || !formData.title) return
    
    setIsSaving(true)
    try {
      const token = localStorage.getItem('token')
      
      if (editingLink) {
        // Update existing
        await axios.put(`/api/links/${editingLink._id}`, 
          formData, 
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else {
        // Create new
        await axios.post('/api/links', 
          formData, 
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      
      setIsModalOpen(false)
      fetchLinks()
    } catch (error) {
      console.error('Error saving link:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTogglePin = async (linkId: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/links/${linkId}/pin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchLinks()
    } catch (error) {
      console.error('Error toggling pin:', error)
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/links/${linkId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchLinks()
    } catch (error) {
      console.error('Error deleting link:', error)
    }
  }

  if (authLoading || loading) {
    return <LinksSkeleton />
  }

  if (!isAuthenticated) {
    return null
  }

  const pinnedLinks = links.filter(l => l.isPinned)
  const otherLinks = links.filter(l => !l.isPinned)

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Links</h1>
            <p className="text-slate-500 dark:text-neutral-500">Save and organize your favorite websites</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Link
          </button>
        </div>

        {/* Pinned Section */}
        {pinnedLinks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Pin className="w-3.5 h-3.5" />
              Pinned
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {pinnedLinks.map(link => (
                <LinkCard 
                  key={link._id} 
                  link={link} 
                  onTogglePin={handleTogglePin}
                  onDelete={handleDeleteLink}
                  onEdit={() => handleOpenModal(link)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Links */}
        <div>
          {pinnedLinks.length > 0 && (
            <h2 className="text-sm font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
              All Links
            </h2>
          )}
          {links.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-neutral-500">
              <ExternalLink className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No links saved yet</p>
              <p className="text-sm mt-1">Click "Add Link" to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {otherLinks.map(link => (
                <LinkCard 
                  key={link._id} 
                  link={link} 
                  onTogglePin={handleTogglePin}
                  onDelete={handleDeleteLink}
                  onEdit={() => handleOpenModal(link)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Link Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl w-full max-w-md shadow-xl border border-slate-200 dark:border-white/10">
            <div className="p-5 border-b border-slate-100 dark:border-white/5">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {editingLink ? 'Edit Link' : 'Add New Link'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-white p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSaveLink} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://example.com"
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:border-slate-300 dark:focus:border-white/20 focus:bg-white dark:focus:bg-black outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleEnrichWithAI}
                    disabled={!formData.url || isEnriching}
                    className="px-3 py-2 rounded-lg bg-violet-50 dark:bg-white/10 text-violet-600 dark:text-white text-sm font-medium hover:bg-violet-100 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {isEnriching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    AI
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Website name"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:border-slate-300 dark:focus:border-white/20 focus:bg-white dark:focus:bg-black outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description (optional)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:border-slate-300 dark:focus:border-white/20 focus:bg-white dark:focus:bg-black outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">Category</label>
                {!isCustomCategory ? (
                  <div className="relative">
                    {/* Custom Dropdown Trigger */}
                    <button
                      type="button"
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 text-sm hover:bg-white dark:hover:bg-[#111] hover:border-slate-300 dark:hover:border-white/20 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${CATEGORY_COLORS[formData.category]?.split(' ')[0] || 'bg-slate-300'}`}></span>
                        <span className="text-slate-700 dark:text-neutral-300">{formData.category}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-neutral-500 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isCategoryOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsCategoryOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#0a0a0a] rounded-xl shadow-lg border border-slate-200 dark:border-white/10 py-1 z-50 max-h-64 overflow-y-auto">
                          {Object.keys(CATEGORY_COLORS).map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setFormData({...formData, category: cat});
                                setIsCategoryOpen(false);
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${
                                formData.category === cat ? 'bg-slate-50 dark:bg-white/5' : ''
                              }`}
                            >
                              <span className={`w-2.5 h-2.5 rounded-full ${CATEGORY_COLORS[cat].split(' ')[0]}`}></span>
                              <span className="text-slate-700 dark:text-neutral-300">{cat}</span>
                              {formData.category === cat && (
                                <svg className="w-4 h-4 ml-auto text-slate-500 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          ))}
                          
                          {/* Divider */}
                          <div className="border-t border-slate-100 dark:border-white/5 my-1"></div>
                          
                          {/* Custom Option */}
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomCategory(true);
                              setFormData({...formData, category: ''});
                              setIsCategoryOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-violet-600 dark:text-violet-400"
                          >
                            <PenLine className="w-4 h-4" />
                            <span>Custom category...</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="flex-1 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:border-slate-300 dark:focus:border-white/20 focus:bg-white dark:focus:bg-black outline-none"
                      placeholder="Type custom category..."
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategory(false);
                        setFormData({...formData, category: 'Other'});
                      }}
                      className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              
              {/* Image URL (Hidden but could be editable if we wanted, let's keep it clean for now or add it?) 
                  Let's just rely on AI/Scraping for now to keep UI simple, or add it if user wants precise control.
                  I'll leave it hidden for now as per "simple" requirement, but state has it.
              */}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !formData.url || !formData.title}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : (editingLink ? 'Save Changes' : 'Add Link')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper to detect embed type
function getEmbedType(url: string): 'twitter' | 'youtube' | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('twitter.com') || urlObj.hostname.includes('x.com')) {
      return 'twitter';
    }
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      return 'youtube';
    }
  } catch {
    return null;
  }
  return null;
}

// Get YouTube video ID
function getYouTubeId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1);
    }
    return urlObj.searchParams.get('v');
  } catch {
    return null;
  }
}

// Helper: Get consistent color for any category
const getCategoryColor = (category: string) => {
  // 1. Check predefined
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];

  // 2. Dynamic Palette (Pastel backgrounds + darker text)
  const palette = [
    'bg-teal-50 text-teal-600',
    'bg-cyan-50 text-cyan-600',
    'bg-indigo-50 text-indigo-600',
    'bg-rose-50 text-rose-600',
    'bg-orange-50 text-orange-600',
    'bg-lime-50 text-lime-600',
    'bg-fuchsia-50 text-fuchsia-600',
    'bg-violet-50 text-violet-600',
    'bg-sky-50 text-sky-600'
  ];

  // 3. Simple Hash
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // 4. Pick color
  const index = Math.abs(hash) % palette.length;
  return palette[index];
};

// Link Card Component with Rich Previews
function LinkCard({ 
  link, 
  onTogglePin, 
  onDelete,
  onEdit
}: { 
  link: Link; 
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const embedType = getEmbedType(link.url);
  const youtubeId = embedType === 'youtube' ? getYouTubeId(link.url) : null;

  return (
    <div className="group bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-white/[0.08] overflow-hidden hover:shadow-md dark:hover:shadow-none hover:border-slate-300 dark:hover:border-white/15 transition-all flex flex-col h-full">
      {/* Media Preview */}
      <div className="relative bg-slate-100 dark:bg-black border-b border-slate-100 dark:border-white/5">
        {embedType === 'youtube' && youtubeId ? (
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="block aspect-video overflow-hidden relative group/play">
            <img 
              src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
              alt={link.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                // Fallback to mqdefault if hq doesn't exist (rare)
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
              }}
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover/play:bg-black/20 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover/play:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </a>
        ) : (link.image && link.image.startsWith('http')) ? (
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="block aspect-video overflow-hidden">
            <img 
              src={link.image} 
              alt={link.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </a>
        ) : embedType === 'twitter' ? (
           <div className="h-32 bg-slate-900 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="text-white text-xs opacity-75">View Post on X</span>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block flex-1"
        >
          <div className="flex items-center gap-2 mb-1.5">
            {!embedType && (
              <img 
                src={link.favicon || `https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=32`}
                alt=""
                className="w-4 h-4 rounded-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2394a3b8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>'
                }}
              />
            )}
            <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-neutral-500 truncate max-w-[150px]">
              {new URL(link.url).hostname.replace('www.', '')}
            </span>
          </div>
          
          <h3 className="font-medium text-slate-900 dark:text-white text-sm leading-snug line-clamp-2 mb-1">
            {link.title}
          </h3>
          
          {link.description && (
            <p className="text-xs text-slate-500 dark:text-neutral-500 line-clamp-2 leading-relaxed">
              {link.description}
            </p>
          )}
        </a>

        {/* Footer/Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 dark:border-white/5">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getCategoryColor(link.category)}`}>
            {link.category}
          </span>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(link._id)}
              className="p-1.5 rounded-md text-slate-400 dark:text-neutral-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-white transition-colors"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onTogglePin(link._id)}
              className={`p-1.5 rounded-md text-slate-400 dark:text-neutral-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-white transition-colors ${link.isPinned ? 'text-amber-500 dark:text-amber-400 hover:text-amber-600' : ''}`}
              title={link.isPinned ? 'Unpin' : 'Pin'}
            >
              <Pin className={`w-3.5 h-3.5 ${link.isPinned ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => onDelete(link._id)}
              className="p-1.5 rounded-md text-slate-400 dark:text-neutral-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
