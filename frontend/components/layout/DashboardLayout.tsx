"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { 
  LayoutDashboard, Users, School, Settings, BookOpen, 
  CreditCard, Calendar, MessageSquare, Menu, Bell, User, LogOut, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Define navigation items per role
const roleNavigation: Record<string, { name: string; href: string; icon: React.FC<any> }[]> = {
  SUPERADMIN: [
    { name: 'Dashboard', href: '/superadmin', icon: LayoutDashboard },
    { name: 'Schools (Tenants)', href: '/superadmin/schools', icon: School },
    { name: 'SaaS Plans', href: '/superadmin/plans', icon: CreditCard },
    { name: 'Settings', href: '/superadmin/settings', icon: Settings },
  ],
  ADMIN: [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Teachers', href: '/admin/teachers', icon: Users },
    { name: 'Attendance', href: '/admin/attendance', icon: Calendar },
    { name: 'Academics', href: '/admin/academic', icon: BookOpen },
    { name: 'Exams', href: '/admin/exams', icon: BookOpen },
    { name: 'Finance', href: '/admin/finance', icon: CreditCard },
    { name: 'Notice Board', href: '/notices', icon: MessageSquare },
  ],
  TEACHER: [
    { name: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
    { name: 'Attendance', href: '/teacher/attendance', icon: Calendar },
    { name: 'Exams', href: '/teacher/exams', icon: BookOpen },
    { name: 'Homework', href: '/teacher/homework', icon: BookOpen },
    { name: 'Notice Board', href: '/notices', icon: MessageSquare },
  ],
  PARENT: [
    { name: 'Dashboard', href: '/parent', icon: LayoutDashboard },
    { name: 'My Children', href: '/parent/children', icon: Users },
    { name: 'Fees & Payments', href: '/parent/fees', icon: CreditCard },
    { name: 'Notice Board', href: '/notices', icon: MessageSquare },
  ],
  STUDENT: [
    { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { name: 'Attendance', href: '/student/attendance', icon: Calendar },
    { name: 'Exams & Results', href: '/student/exams', icon: BookOpen },
    { name: 'Homework', href: '/student/homework', icon: BookOpen },
    { name: 'Notice Board', href: '/notices', icon: MessageSquare },
  ]
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const { user, logout } = useAuthStore();
  
  if (!user) return null;

  const navigation = roleNavigation[user.role] || [];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const pageTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Modern Slate Dark */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
          shadow-xl lg:shadow-none border-r border-slate-800
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center h-20 px-6 border-b border-slate-800 shrink-0">
          <div className="bg-gradient-to-br from-primary to-blue-600 p-1.5 rounded-lg mr-3 shadow-inner">
            <School className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            School<span className="text-accent">OS</span>
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-3 flex items-center gap-2">
            <span className="h-px w-4 bg-slate-700"></span>
            {user.role} PORTAL
          </div>
          
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`
                  group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden
                  ${isActive 
                    ? 'text-accent bg-accent/10 font-semibold' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="flex items-center">
                  <item.icon className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-accent' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {item.name}
                </div>
                {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
              </Link>
            );
          })}
        </div>
        
        {/* User profile preview */}
        <div className="p-4 m-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl flex items-center gap-3 backdrop-blur-md">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center text-slate-900 font-bold shadow-inner">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">{user.email}</p>
            <p className="text-xs text-slate-400 capitalize truncate">{user.role.toLowerCase()}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden relative">
        
        {/* Topbar - Floating/Sticky with Blur */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shrink-0 shadow-sm">
          <div className="flex items-center">
            <button 
              className="p-2 mr-4 text-slate-500 rounded-xl lg:hidden hover:bg-slate-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="hidden sm:flex items-center">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                {navigation.find(n => pathname === n.href || pathname.startsWith(`${n.href}/`))?.name || 'Dashboard'}
              </h1>
              {/* Optional Breadcrumb or Path indicator can go here */}
            </div>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button className="p-2 text-slate-400 rounded-full hover:text-slate-600 hover:bg-slate-100 relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-6 w-px bg-slate-200"></div>
            
            <div className="relative group">
              <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
                <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-primary shadow-inner">
                  <User className="h-4 w-4" />
                </div>
              </button>
              
              {/* Dropdown menu */}
              <div className="absolute right-0 w-56 mt-2 py-2 bg-white border border-slate-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-right scale-95 group-hover:scale-100">
                <div className="px-4 py-3 border-b border-slate-50">
                  <div className="font-semibold text-slate-800 text-sm truncate">{user.email}</div>
                  <div className="text-slate-500 text-xs mt-0.5 capitalize flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {user.role.toLowerCase()}
                  </div>
                </div>
                <div className="py-1">
                  <Link href={`/${user.role.toLowerCase()}/settings`} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary flex items-center transition-colors">
                    <Settings className="mr-2 h-4 w-4" /> Account Settings
                  </Link>
                </div>
                <div className="border-t border-slate-50 py-1">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center transition-colors font-medium"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content with Framer Motion AnimatePresence */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none custom-scrollbar bg-slate-50/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageTransition}
              className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        
      </div>
      
      {/* Global styles for custom scrollbar to match the modern theme */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
        aside .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
        }
      `}} />
    </div>
  );
}
