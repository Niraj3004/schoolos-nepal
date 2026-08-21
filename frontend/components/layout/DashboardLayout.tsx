"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { 
  LayoutDashboard, Users, School, Settings, BookOpen, 
  CreditCard, Calendar, MessageSquare, Menu, Bell, User, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
    { name: 'Classes', href: '/admin/classes', icon: BookOpen },
    { name: 'Finance', href: '/admin/finance', icon: CreditCard },
  ],
  TEACHER: [
    { name: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
    { name: 'Attendance', href: '/teacher/attendance', icon: Calendar },
    { name: 'Exams', href: '/teacher/exams', icon: BookOpen },
    { name: 'Homework', href: '/teacher/homework', icon: BookOpen },
  ],
  PARENT: [
    { name: 'Dashboard', href: '/parent', icon: LayoutDashboard },
    { name: 'My Children', href: '/parent/children', icon: Users },
    { name: 'Fees & Payments', href: '/parent/fees', icon: CreditCard },
    { name: 'Notices', href: '/parent/notices', icon: MessageSquare },
  ],
  STUDENT: [
    { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { name: 'Attendance', href: '/student/attendance', icon: Calendar },
    { name: 'Exams & Results', href: '/student/exams', icon: BookOpen },
    { name: 'Library', href: '/student/library', icon: BookOpen },
  ]
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const { user, logout } = useAuthStore();
  
  // If user is null (should be caught by route guard, but just in case)
  if (!user) return null;

  const navigation = roleNavigation[user.role] || [];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Dark Navy (#1a2238) */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#1a2238] text-white flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-center h-16 bg-[#131929] px-4">
          <span className="text-2xl font-extrabold tracking-tighter">
            School<span className="text-[#f4b400]">OS</span>
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
            {user.role} PORTAL
          </div>
          
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`
                  flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-[#2a3759] text-[#f4b400]' // Active state: yellow text, slightly lighter navy bg
                    : 'text-gray-300 hover:bg-[#2a3759] hover:text-white'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-[#f4b400]' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
        
        {/* User preview in sidebar bottom */}
        <div className="p-4 bg-[#131929] border-t border-[#2a3759] flex items-center">
          <div className="h-9 w-9 rounded-full bg-[#f4b400] flex items-center justify-center text-[#1a2238] font-bold">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3 truncate">
            <p className="text-sm font-medium text-white truncate">{user.email}</p>
            <p className="text-xs text-gray-400 capitalize">{user.role.toLowerCase()}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        
        {/* Topbar - White */}
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center">
            <button 
              className="p-2 mr-4 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
              {navigation.find(n => pathname === n.href || pathname.startsWith(`${n.href}/`))?.name || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 rounded-full hover:text-gray-500 hover:bg-gray-100 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
            </button>
            
            <div className="h-6 w-px bg-gray-200"></div>
            
            <div className="relative group">
              <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-4 w-4" />
                </div>
              </button>
              
              {/* Simple dropdown */}
              <div className="absolute right-0 w-48 mt-2 py-1 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <div className="font-medium text-gray-900">{user.email}</div>
                  <div className="text-gray-500 text-xs mt-0.5 capitalize">{user.role.toLowerCase()}</div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-2 text-sm text-danger hover:bg-gray-50 flex items-center"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
}
