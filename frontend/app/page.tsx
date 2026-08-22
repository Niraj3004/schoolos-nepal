"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  ShieldCheck,
  Zap,
  Terminal,
  BarChart3,
  Fingerprint,
  Mountain,
  Users,
  Clock,
  Globe,
  Smartphone,
  BookOpen,
  Quote,
  MessageSquare,
  MapPin,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.05], [1, 0.95]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen font-sans bg-slate-50 text-slate-900 selection:bg-red-500/30 overflow-x-hidden"
    >
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <img src="/logo.png" alt="SchoolOS Logo" className="h-10 w-auto group-hover:scale-105 transition-transform" />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              href="#features"
              className="text-slate-600 hover:text-red-600 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#modules"
              className="text-slate-600 hover:text-red-600 transition-colors"
            >
              Modules
            </Link>
            <Link
              href="#testimonials"
              className="text-slate-600 hover:text-red-600 transition-colors"
            >
              Testimonials
            </Link>
            <Link
              href="#pricing"
              className="text-slate-600 hover:text-red-600 transition-colors"
            >
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block"
            >
              Sign in
            </Link>
            <Link href="/onboarding">
              <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-full h-9 px-5 font-semibold text-sm transition-all hover:scale-105 shadow-sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* 1. Hero Section (Nepali Vibe + Student Image) */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-white">
          {/* Subtle Himalayan/Nepali gradient vibes and pattern */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 via-white to-red-50 -z-10 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] -z-10 mix-blend-multiply pointer-events-none"></div>
          {/* Decorative Mountains */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0 opacity-[0.03] pointer-events-none">
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="relative block w-[200%] h-[150px] transform -translate-x-1/4"
            >
              <path
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.45,200,107.56,242.75,100.22,283.47,79.52,321.39,56.44Z"
                fill="#ef4444"
              ></path>
              <path
                d="M0,73.9c8.2-1.2,16.5-2.2,25-3.1C135.5,58,247,40.1,357.7,19.3,472,1.3,588.6-4.5,701,13.6c112.7,18.1,223,54.8,333.6,76.5,56,11,111.4,17.4,165.4,19.7V120H0V73.9Z"
                fill="#3b82f6"
                opacity="0.5"
              ></path>
            </svg>
          </div>

          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="container mx-auto px-6 z-10 relative"
          >
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Left Content */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="flex-1 text-center lg:text-left"
              >
                <motion.div
                  variants={fadeInUp as any}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-red-100 shadow-sm text-slate-600 text-xs font-semibold mb-8"
                >
                  <Mountain className="h-4 w-4 text-red-500" />
                  Proudly Built in Nepal, for Nepal
                </motion.div>

                <motion.h1
                  variants={fadeInUp as any}
                  className="text-5xl md:text-6xl lg:text-[75px] font-extrabold tracking-tighter mb-8 leading-[1.1] text-slate-900"
                >
                  Manage your school with <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-red-600">
                    absolute precision.
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeInUp as any}
                  className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 mb-10 font-medium leading-relaxed"
                >
                  Replace your fragmented software with one unified platform.
                  Native BS calendars, NEB grading, smart finance, and instant
                  parent notifications.
                </motion.p>

                <motion.div
                  variants={fadeInUp as any}
                  className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center lg:justify-start"
                >
                  <Link href="/onboarding" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700 h-14 px-8 text-base rounded-full shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5"
                    >
                      Start Your Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#modules" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto h-14 px-8 text-base rounded-full bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all hover:-translate-y-0.5"
                    >
                      Explore Platform
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right Content (Transparent Floating Hero Image) */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="flex-1 w-full relative flex items-center justify-center"
              >
                <div className="relative w-full max-w-lg">
                  <img
                    src="/hero1.png"
                    alt="SchoolOS Hero"
                    className="object-contain w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] transform hover:scale-105 transition-transform duration-700 relative z-10"
                  />
                  {/* Floating badges */}
                  <div className="absolute top-10 -left-6 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-xl border border-slate-100 z-20 animate-bounce-slow flex items-center gap-3">
                    <span className="flex h-3 w-3 rounded-full bg-red-600"></span>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Region
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        Kathmandu, NP
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-10 -right-6 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-xl border border-slate-100 z-20 animate-bounce-delayed flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Standards
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        NEB Compliant
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* 2. Core Modules (Features Bento) */}
        <section
          id="modules"
          className="py-24 relative bg-slate-50 border-y border-slate-200"
        >
          <div className="container mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp as any}
              className="mb-20 text-center"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">
                One platform. All your operations.
              </h2>
              <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                SchoolOS is designed modularly. Use everything, or just what you
                need.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="md:col-span-2 group"
              >
                <div className="h-full bg-white border border-slate-200 rounded-[2rem] p-8 relative overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <BookOpen className="w-64 h-64 text-slate-900" />
                  </div>
                  <div className="relative z-10 h-full flex flex-col justify-end">
                    <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6 shadow-sm border border-blue-200/50 group-hover:scale-110 transition-transform">
                      <BookOpen className="h-7 w-7 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-slate-900">
                      Academic & Exam Management
                    </h3>
                    <p className="text-slate-600 leading-relaxed max-w-md font-medium mb-4">
                      Native support for Nepali grading scales. Teachers enter
                      raw marks, and SchoolOS instantly generates beautiful,
                      NEB-compliant mark ledgers and individual report cards.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />{" "}
                        Automated GPA calculation
                      </li>
                      <li className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />{" "}
                        One-click report card printing
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="group"
              >
                <div className="h-full bg-white border border-slate-200 rounded-[2rem] p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6 shadow-sm border border-emerald-200/50 group-hover:scale-110 transition-transform">
                    <CreditCard className="h-7 w-7 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">
                    Finance Engine
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm font-medium">
                    Automated fee generation, manual QR payment verification,
                    and comprehensive ledger management. Stop chasing paper
                    receipts.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="group"
              >
                <div className="h-full bg-white border border-slate-200 rounded-[2rem] p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-6 shadow-sm border border-amber-200/50 group-hover:scale-110 transition-transform">
                    <Users className="h-7 w-7 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">
                    Parent Portals
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm font-medium">
                    Give parents an intuitive dashboard to track attendance, pay
                    fees, and view their child's academic progress in real-time.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="md:col-span-2 group"
              >
                <div className="h-full bg-white border border-slate-200 rounded-[2rem] p-8 relative overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-red-100 rounded-full blur-3xl group-hover:bg-red-200 transition-colors opacity-60"></div>
                  <div className="relative z-10 h-full flex flex-col justify-end">
                    <div className="h-14 w-14 rounded-2xl bg-red-100 flex items-center justify-center mb-6 shadow-sm border border-red-200/50 group-hover:scale-110 transition-transform">
                      <Zap className="h-7 w-7 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-slate-900">
                      WebSocket Push Notifications
                    </h3>
                    <p className="text-slate-600 leading-relaxed max-w-md font-medium mb-4">
                      Forget expensive SMS gateways. SchoolOS uses real-time
                      WebSockets to deliver instant push notifications to the
                      parent app for absences, fee dues, and urgent notices.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-red-500" />{" "}
                        Zero-latency delivery
                      </li>
                      <li className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-red-500" /> No
                        per-message SMS costs
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3. How It Works (Steps) */}
        <section className="py-24 bg-white border-y border-slate-200 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">
                How SchoolOS Works
              </h2>
              <p className="text-slate-500 text-lg font-medium">
                From setup to daily operations in three simple steps.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-0.5 bg-slate-100 -z-10"></div>

              {[
                {
                  step: "1",
                  title: "Setup & Onboarding",
                  desc: "Our team helps you import your existing student data, set up your fee structures, and configure your academic calendar in minutes.",
                  icon: Globe,
                },
                {
                  step: "2",
                  title: "Daily Operations",
                  desc: "Teachers take attendance and post homework. Admins manage fees and approve leave requests. Everything syncs instantly.",
                  icon: Clock,
                },
                {
                  step: "3",
                  title: "Insights & Growth",
                  desc: "Parents stay engaged through their portal while management gets bird's-eye analytics on school performance and financial health.",
                  icon: BarChart3,
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="text-center relative bg-white"
                >
                  <div className="w-24 h-24 mx-auto bg-white border-[8px] border-slate-50 shadow-lg rounded-full flex items-center justify-center mb-6 relative z-10 group hover:border-red-50 transition-colors">
                    <item.icon className="h-8 w-8 text-blue-700 group-hover:scale-110 transition-transform" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Ecosystem & Integrations (Nepal Vibe Focus) */}
        <section className="py-24 bg-slate-50 relative overflow-hidden">
          {/* Decor */}
          <div className="absolute -left-32 -bottom-32 opacity-10 pointer-events-none">
            <Mountain className="w-[400px] h-[400px] text-slate-900" />
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-16 max-w-6xl mx-auto">
              <div className="flex-1 space-y-8">
                <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
                  <Mountain className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
                  Tailored for the Nepali Ecosystem.
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  We understand local challenges. That's why we natively support
                  the Bikram Sambat (BS) calendar, allow manual QR receipt
                  uploads for parents without digital wallets, and map to local
                  grading systems.
                </p>
                <div className="pt-4 flex items-center gap-4">
                  <Button
                    variant="outline"
                    className="bg-white border-slate-200 text-slate-700 font-semibold shadow-sm"
                  >
                    Learn about Local Features
                  </Button>
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      title: "Native BS Calendar",
                      desc: "No more confusing AD/BS date conversions.",
                    },
                    {
                      title: "QR Payment Proofs",
                      desc: "Parents can upload eSewa/Khalti transfer screenshots.",
                    },
                    {
                      title: "NEB Ledgers",
                      desc: "Export marksheets perfectly formatted for government.",
                    },
                    {
                      title: "Role-Based Access",
                      desc: "Strict permissions for SuperAdmins, Teachers, and Parents.",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <CheckCircle2 className="h-6 w-6 text-red-500 mb-4" />
                      <h4 className="font-bold text-slate-900 mb-2">
                        {item.title}
                      </h4>
                      <p className="text-sm text-slate-500 font-medium">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Testimonials */}
        <section
          id="testimonials"
          className="py-24 bg-white border-y border-slate-200"
        >
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">
                Loved by Educators.
              </h2>
              <p className="text-slate-500 text-lg font-medium">
                Don't just take our word for it.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  name: "Rajesh Maharjan",
                  role: "Principal, Everest Academy",
                  text: "SchoolOS completely eliminated our end-of-term chaos. Grading that used to take weeks now takes a single day.",
                },
                {
                  name: "Sita Sharma",
                  role: "Admin, Kathmandu Global",
                  text: "The finance engine is brilliant. Parents upload their QR payment receipts, and we verify them with one click. Simple and perfect for Nepal.",
                },
                {
                  name: "Bikash Shrestha",
                  role: "Director, Apex High",
                  text: "The real-time push notifications are a game changer. Parents are always informed about absences, and we save thousands on SMS costs.",
                },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-200 h-full flex flex-col relative">
                    <Quote className="absolute top-8 right-8 h-8 w-8 text-slate-200" />
                    <div className="flex-1 mb-6">
                      <p className="text-slate-700 font-medium leading-relaxed italic">
                        "{t.text}"
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg border border-blue-200">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{t.name}</h4>
                        <p className="text-xs font-semibold text-slate-500">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Pricing */}
        <section id="pricing" className="py-32 relative bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">
                Predictable Pricing.
              </h2>
              <p className="text-slate-500 text-lg font-medium">
                No hidden implementation fees. Pay based on student enrollment.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
              {[
                {
                  name: "Starter",
                  desc: "For small institutions",
                  price: "15k",
                  features: [
                    "Up to 300 Students",
                    "Academics & Exams",
                    "Community Support",
                  ],
                  highlighted: false,
                },
                {
                  name: "Growth",
                  desc: "For standard schools",
                  price: "35k",
                  features: [
                    "Up to 1,000 Students",
                    "Finance & Parent Portals",
                    "Priority Support",
                  ],
                  highlighted: true,
                },
                {
                  name: "Enterprise",
                  desc: "For large colleges",
                  price: "Custom",
                  features: [
                    "Unlimited Students",
                    "Custom Branding",
                    "Dedicated Account Manager",
                  ],
                  highlighted: false,
                },
              ].map((tier, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="h-full"
                >
                  <div
                    className={`relative h-full flex flex-col p-8 rounded-3xl transition-transform ${tier.highlighted ? "bg-blue-700 border border-blue-600 md:-translate-y-4 z-10 shadow-2xl shadow-blue-700/30" : "bg-white border border-slate-200 hover:shadow-lg"}`}
                  >
                    {tier.highlighted && (
                      <div className="absolute -top-4 right-8 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                        Most Popular
                      </div>
                    )}
                    <h3
                      className={`text-2xl font-bold mb-2 ${tier.highlighted ? "text-white" : "text-slate-900"}`}
                    >
                      {tier.name}
                    </h3>
                    <p
                      className={`text-sm mb-8 font-medium ${tier.highlighted ? "text-blue-200" : "text-slate-500"}`}
                    >
                      {tier.desc}
                    </p>
                    <div className="flex items-baseline gap-1 mb-8">
                      {tier.price !== "Custom" && (
                        <span
                          className={`text-xl font-bold ${tier.highlighted ? "text-blue-200" : "text-slate-400"}`}
                        >
                          Rs.
                        </span>
                      )}
                      <span
                        className={`text-5xl font-extrabold tracking-tight ${tier.highlighted ? "text-white" : "text-slate-900"}`}
                      >
                        {tier.price}
                      </span>
                      {tier.price !== "Custom" && (
                        <span
                          className={`font-medium ${tier.highlighted ? "text-blue-200" : "text-slate-500"}`}
                        >
                          /yr
                        </span>
                      )}
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                      {tier.features.map((f, j) => (
                        <li
                          key={j}
                          className="flex items-center gap-3 text-sm font-medium"
                        >
                          <CheckCircle2
                            className={`h-5 w-5 shrink-0 ${tier.highlighted ? "text-blue-300" : "text-red-600"}`}
                          />
                          <span
                            className={
                              tier.highlighted
                                ? "text-blue-50"
                                : "text-slate-700"
                            }
                          >
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full rounded-full h-12 font-bold text-base shadow-sm ${tier.highlighted ? "bg-white text-blue-900 hover:bg-slate-50" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                    >
                      {tier.price === "Custom"
                        ? "Contact Sales"
                        : "Start Building"}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. FAQ Section */}
        <section className="py-24 bg-white border-y border-slate-200">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 tracking-tight text-slate-900">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  q: "Is it difficult to migrate from our old system?",
                  a: "Not at all. We provide CSV templates for you to bulk upload students, teachers, and historical exam records. Our support team assists you during onboarding.",
                },
                {
                  q: "Do parents need to download a separate app?",
                  a: "SchoolOS provides a mobile-responsive Parent Portal accessible via any browser. You can also deploy it as a PWA (Progressive Web App) to their home screens.",
                },
                {
                  q: "How is data secured?",
                  a: "We use MongoDB multi-tenant isolation, ensuring your school's data is logically separated. All passwords and tokens are encrypted with bank-level security.",
                },
                {
                  q: "Can we collect fees online?",
                  a: "Yes. Parents can upload screenshots of eSewa/Khalti transfers directly to invoices for admins to approve, making it perfectly suited for Nepal's payment landscape.",
                },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="bg-slate-50 p-6 rounded-2xl border border-slate-200"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <MessageSquare className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                    <h4 className="font-bold text-slate-900">{faq.q}</h4>
                  </div>
                  <p className="text-slate-600 font-medium text-sm leading-relaxed pl-8">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Final CTA */}
        <section className="py-24 relative overflow-hidden bg-blue-800">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600 rounded-full blur-[120px] -z-10 pointer-events-none opacity-40"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px] -z-10 pointer-events-none opacity-40"></div>

          <div className="container mx-auto px-6 text-center z-10 relative">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Ready to digitize your school?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-medium">
              Join over 150+ leading educational institutions across Nepal who
              trust SchoolOS.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/onboarding">
                <Button
                  size="lg"
                  className="bg-red-600 text-white hover:bg-red-700 h-14 px-10 text-base rounded-full font-bold shadow-xl transition-all hover:scale-105 border-0"
                >
                  Create Account Now
                </Button>
              </Link>
              <Link href="#">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-blue-300 text-white hover:bg-blue-700 h-14 px-10 text-base rounded-full font-bold transition-all"
                >
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Expanded Footer */}
      <footer className="bg-slate-900 py-16 text-sm text-slate-400">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center mb-6 group bg-white/10 p-2 rounded-xl inline-flex w-fit">
              <img src="/logo.png" alt="SchoolOS Logo" className="h-10 w-auto brightness-0 invert" />
            </Link>
            <p className="mb-6 max-w-sm font-medium text-slate-400">
              Engineered natively for the future of education in Nepal.
              Replacing outdated software with a modern, unified ecosystem.
            </p>
            <div className="flex gap-4 mb-6">
              <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer">
                <span className="text-white font-bold">f</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer">
                <span className="text-white font-bold">in</span>
              </div>
            </div>
            <p className="text-slate-500">
              © 2026 SchoolOS. All rights reserved.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">
              Platform
            </h4>
            <ul className="space-y-3 font-medium">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Academic Engine
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Finance Ledger
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Parent Portal
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Push Notifications
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">
              Resources
            </h4>
            <ul className="space-y-3 font-medium">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  System Status
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">
              Company
            </h4>
            <ul className="space-y-3 font-medium">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">
              Legal
            </h4>
            <ul className="space-y-3 font-medium">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Data Security
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
