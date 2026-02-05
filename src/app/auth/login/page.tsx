'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { useState } from "react"
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email, password);
    }

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-slate-100 dark:bg-black transition-colors">
            <Card className="w-[350px] bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-white/10">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-slate-900 dark:text-white">Sign in to your account</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email" className="text-slate-700 dark:text-neutral-300">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required
                                    className="bg-white dark:bg-black border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:border-slate-400 dark:focus:border-white/25"
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password" className="text-slate-700 dark:text-neutral-300">Password</Label>
                                <div className="relative">
                                    <Input 
                                        id="password" 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="Enter your password" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required
                                        className="pr-10 bg-white dark:bg-black border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:border-slate-400 dark:focus:border-white/25"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <Button type="submit" className="w-full mt-4 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-neutral-200 text-white dark:text-black font-medium">Login</Button>
                    </form>
                    <p className="mt-4 text-sm text-center text-slate-600 dark:text-neutral-400">
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/signup" className="font-medium text-slate-900 dark:text-white hover:underline">
                            Create a new account
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}