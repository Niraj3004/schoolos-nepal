"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const loginAction = useAuthStore(state => state.login);
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subdomain, setSubdomain] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host !== 'localhost' && host !== '127.0.0.1') {
        const parts = host.split('.');
        if (parts.length > 1) {
          setSubdomain(parts[0].toUpperCase());
        }
      }
    }
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Backend expects { email, password }
      const res: any = await api.post('/auth/login', data, { requireAuth: false });
      
      const { user, accessToken } = res.data;
      
      loginAction({ 
        user, 
        role: user.role, 
        schoolId: user.schoolId || null, 
        accessToken 
      });

      // Route based on role
      switch (user.role) {
        case 'SUPERADMIN':
          router.push('/superadmin');
          break;
        case 'ADMIN':
          router.push('/admin');
          break;
        case 'TEACHER':
          router.push('/teacher');
          break;
        case 'PARENT':
          router.push('/parent');
          break;
        case 'STUDENT':
          router.push('/student');
          break;
        default:
          router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block text-3xl font-extrabold text-primary tracking-tighter">
          School<span className="text-warning">OS</span>
        </Link>
        <p className="text-gray-500 mt-2">
          {subdomain ? `Sign in to ${subdomain} Portal` : 'Sign in to your portal'}
        </p>
      </div>

      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-sm font-medium">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <Input 
                  {...register('email')} 
                  type="email" 
                  placeholder="name@school.edu.np" 
                  className="pl-10"
                  error={!!errors.email}
                />
              </div>
              {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Password</label>
                <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <Input 
                  {...register('password')} 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10"
                  error={!!errors.password}
                />
              </div>
              {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base mt-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Spinner size="sm" className="mr-2 text-white" /> Signing in...</>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t p-4 bg-gray-50 rounded-b-xl">
          <p className="text-sm text-gray-500">
            Don't have a school account? <Link href="/onboarding" className="text-primary font-medium hover:underline">Register your school</Link>
          </p>
        </CardFooter>
      </Card>
      
    </div>
  );
}
