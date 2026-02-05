'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { User, Mail, Lock, Camera, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function ProfilePage() {
  const { user, setUser, setAuthToken } = useAuth(); // Using setUser/setAuthToken directly
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    profilePic: user?.profilePic || '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const { confirmPassword, password, ...rest } = formData;
      const updateData = { 
        ...rest, 
        ...(password ? { password } : {}) 
      };

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

      const { data } = await axios.put('/api/users/profile', updateData, config);
      
      // Update local context
      setAuthToken(data.token);
      setUser(data);
      
      setSuccessMessage('Profile updated successfully!');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;

     const formDataUpload = new FormData();
     formDataUpload.append('profilePic', file);

     try {
         setIsLoading(true); // temporary loading state for upload
         const token = localStorage.getItem('token');
         const res = await axios.post('/api/upload', formDataUpload, {
             headers: {
                 'Content-Type': 'multipart/form-data',
                 Authorization: `Bearer ${token}`
             }
         });
         
         // Prepend server URL if it's a relative path
         const fullPath = `${BACKEND_URL}${res.data.filePath}`;
         setFormData(prev => ({ ...prev, profilePic: fullPath }));
         setIsLoading(false);
     } catch (err) {
         console.error(err);
         setError('Failed to upload image. Please try again.');
         setIsLoading(false);
     }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Profile Settings</h1>

        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none overflow-hidden">
            <div className="p-8">
            
            {successMessage && (
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {successMessage}
                </div>
            )}
            {error && (
                <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Profile Picture Section */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300">Profile Picture</label>
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10 border-2 border-slate-100 dark:border-white/5">
                                {formData.profilePic ? (
                                    <img 
                                        src={formData.profilePic} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-neutral-400 text-2xl font-bold">
                                         {formData.name?.charAt(0) || 'U'}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 space-y-3">
                           <div className="flex gap-2">
                               <input 
                                    type="text"
                                    name="profilePic"
                                    value={formData.profilePic}
                                    onChange={handleChange}
                                    placeholder="Enter image URL..."
                                    className="flex-1 px-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:bg-white dark:focus:bg-black focus:border-slate-400 dark:focus:border-white/20 outline-none transition-all"
                               />
                               <label className="cursor-pointer px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl hover:bg-slate-800 dark:hover:bg-neutral-200 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm">
                                   <Camera className="w-4 h-4" />
                                   <input 
                                        type="file" 
                                        accept="image/*"
                                        className="hidden" 
                                        onChange={handleImageUpload}
                                   />
                                   Upload
                               </label>
                           </div>
                           <p className="text-xs text-slate-400 dark:text-neutral-500">
                                Upload a JPG, PNG or WEBP (Max 5MB).
                           </p>
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100 dark:border-white/5" />

                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-neutral-300 flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-black focus:border-slate-400 dark:focus:border-white/20 outline-none transition-all"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-neutral-300 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-black focus:border-slate-400 dark:focus:border-white/20 outline-none transition-all opacity-75 cursor-not-allowed"
                            disabled
                            title="Email cannot be changed"
                        />
                    </div>
                </div>

                 <hr className="border-slate-100 dark:border-white/5" />

                {/* Password Change */}
                <div className="space-y-4">
                     <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Change Password</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-neutral-300 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-slate-400 dark:text-neutral-500" />
                                New Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Min. 6 characters"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:bg-white dark:focus:bg-black focus:border-slate-400 dark:focus:border-white/20 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-neutral-300">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Re-enter password"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:bg-white dark:focus:bg-black focus:border-slate-400 dark:focus:border-white/20 outline-none transition-all"
                            />
                        </div>
                     </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-neutral-200 shadow-md hover:shadow-lg focus:ring-4 focus:ring-slate-100 dark:focus:ring-white/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>

            </form>
            </div>
        </div>
      </main>
    </div>
  );
}
