import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Shield, Users, Building, BookOpen, AlertTriangle,
  Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin,
  CheckCircle2, XCircle, Clock, AlertCircle, ArrowRight,
  GraduationCap, Briefcase, FileCheck, Lock, Eye,
  MessageSquare, Star, ThumbsUp, LogIn
} from 'lucide-react';
import { type SharedData } from '@/types';
import { getImageUrl } from '@/utils/imageUtils';

// Import scroll animation components
import { ScrollReveal, StaggeredReveal } from '@/components/animations/ScrollReveal';
import { ParticleField } from '@/components/animations/ParallaxSection';
import { useScrollProgress } from '@/hooks/useScrollAnimation';

// Import ChatBot
import { ChatBot } from '@/components/ChatBot';

// Import Theme Switcher and QR Code
import { AppearanceDropdown } from '@/components/appearance-dropdown';
import QRCodeDisplay from '@/components/qr-code-display';

// Accordion component
function RuleAccordion({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false,
  color = 'blue'
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
  color?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const colorClasses: Record<string, { gradient: string; bg: string; border: string }> = {
    blue: { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
    green: { gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
    purple: { gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' },
    red: { gradient: 'from-red-500 to-rose-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
  };
  
  const colors = colorClasses[color] || colorClasses.blue;
  
  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${colors.bg} ${colors.border}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${colors.gradient} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <svg className={`w-6 h-6 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6 pt-0">{children}</div>
      </div>
    </div>
  );
}

function RuleItem({ children, icon: Icon = CheckCircle2 }: { children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <li className="flex items-start gap-3 py-2">
      <Icon className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
      <span className="text-gray-700 dark:text-gray-300">{children}</span>
    </li>
  );
}

interface Props extends SharedData {
  homeContent?: {
    logo?: string;
  } | null;
}

export default function Rules() {
  const { homeContent } = usePage<Props>().props;
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollProgress = useScrollProgress();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const consequences = [
    { level: 'Warning', icon: AlertCircle, color: 'bg-yellow-500', desc: 'First offense - Formal warning', count: '1st' },
    { level: 'Probation', icon: Clock, color: 'bg-orange-500', desc: 'Limited access period', count: '2nd' },
    { level: 'Suspension', icon: XCircle, color: 'bg-red-500', desc: 'Temporary suspension', count: '3rd' },
    { level: 'Termination', icon: Shield, color: 'bg-gray-800', desc: 'Permanent removal', count: 'Final' },
  ];

  const coreValues = [
    { icon: Shield, title: 'Integrity', desc: 'Honest and transparent', color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
    { icon: ThumbsUp, title: 'Respect', desc: 'Professional conduct', color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' },
    { icon: Star, title: 'Excellence', desc: 'Quality outcomes', color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' },
    { icon: Users, title: 'Collaboration', desc: 'Working together', color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' },
  ];

  return (
    <>
      <Head title="System Rules & Guidelines - ICMS">
        <style>{`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-25px) rotate(2deg); } }
          @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.3); } 50% { transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }
          @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
          @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); } 50% { box-shadow: 0 0 50px rgba(16, 185, 129, 0.7); } }
          @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
          @keyframes morph { 0%, 100% { border-radius: 60% 40% 30% 70%/60% 30% 70% 40%; } 50% { border-radius: 30% 60% 70% 40%/50% 60% 30% 60%; } }
          @keyframes draw-check { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
          @keyframes shield-pulse { 0%, 100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.1); opacity: 1; } }
          .animate-float { animation: float 8s ease-in-out infinite; }
          .animate-bounce-in { animation: bounceIn 1s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
          .animate-fade-in-up { animation: fadeInUp 0.8s ease-out; }
          .animate-shimmer { animation: shimmer 3s ease-in-out infinite; background-size: 200% 100%; }
          .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
          .animate-gradient { animation: gradient-shift 10s ease infinite; background-size: 400% 400%; }
          .animate-morph { animation: morph 12s ease-in-out infinite; }
          .animate-shield-pulse { animation: shield-pulse 2s ease-in-out infinite; }
          .interactive-card { transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
          .interactive-card:hover { transform: translateY(-12px) scale(1.02); box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15); }
          .glass-effect { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.2); }
          .text-gradient { background: linear-gradient(135deg, #fff 0%, #a7f3d0 50%, #6ee7b7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .hero-full-screen { position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important; height: 100vh !important; z-index: 0; }
          .hero-content-wrapper { position: relative; z-index: 1; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        `}</style>
      </Head>

      <div className="min-h-screen w-full bg-white dark:bg-gray-900 overflow-x-hidden">
        {/* Header */}
        <header className={`w-full bg-white/90 backdrop-blur-md dark:bg-gray-800/90 shadow-sm sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg py-2' : 'py-4'}`}>
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <Link href="/" prefetch className="flex items-center gap-3">
              {homeContent?.logo ? (
                <img 
                  src={getImageUrl(homeContent.logo)} 
                  alt="Logo" 
                  className={`rounded transition-all duration-300 ${isScrolled ? 'h-8 w-8' : 'h-10 w-10'}`} 
                />
              ) : (
                <Briefcase className={`text-indigo-600 dark:text-indigo-400 transition-all duration-300 ${isScrolled ? 'h-8 w-8' : 'h-10 w-10'}`} />
              )}
              <span className={`font-bold text-gray-900 dark:text-white transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>ICMS</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" prefetch className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition-colors">Home</Link>
              <Link href="/help/overview" prefetch className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition-colors">Overview</Link>
              <Link href="/help/rules" prefetch className="text-emerald-600 dark:text-emerald-400 font-medium">Rules</Link>
              <Link href="/help/contact" prefetch className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition-colors">Contact</Link>
              <Button asChild variant="ghost" className="text-gray-700 dark:text-gray-200 hover:bg-emerald-50 rounded-full">
                <Link href={route('login')} prefetch>Login <LogIn className="ml-2 h-4 w-4" /></Link>
              </Button>
              <AppearanceDropdown />
            </nav>
          </div>
          
          {/* Scroll Progress Bar */}
          <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" style={{ width: `${scrollProgress * 100}%` }} />
        </header>

        {/* Cinematic Hero Section - Full Screen Background */}
        <section className="relative min-h-screen">
          {/* Fixed Full-Screen Background */}
          <div className="hero-full-screen">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 animate-gradient"></div>
            
            {/* Morphing Background Shapes */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-500/20 animate-morph blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-teal-500/20 animate-morph blur-3xl" style={{ animationDelay: '4s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 animate-morph blur-3xl" style={{ animationDelay: '8s' }}></div>
            
            {/* Animated Shield Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 800 600">
                <defs>
                  <pattern id="shieldPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                    <path d="M50 10 L90 30 V60 C90 75 70 90 50 95 C30 90 10 75 10 60 V30 L50 10Z" fill="none" stroke="white" strokeWidth="1" className="animate-shield-pulse" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#shieldPattern)" />
              </svg>
            </div>
            
            {/* Particle Field */}
            <ParticleField particleCount={40} colors={['rgba(16, 185, 129, 0.4)', 'rgba(20, 184, 166, 0.4)', 'rgba(6, 182, 212, 0.3)']} />
          </div>

          {/* Content Layer */}
          <div className="hero-content-wrapper">
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24 text-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[70vh]">
              {/* Text Content */}
              <div className="text-center lg:text-left">
                <ScrollReveal animation="fadeInUp" delay={0}>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-emerald-200 text-sm font-medium mb-8">
                    <Shield className="w-4 h-4 animate-pulse" />
                    Official Guidelines
                  </div>
                </ScrollReveal>
                
                <ScrollReveal animation="fadeInUp" delay={100}>
                  <h1 className="text-5xl lg:text-7xl font-black mb-6 tracking-tight text-gradient">
                    Rules & Guidelines
                  </h1>
                </ScrollReveal>
                
                <ScrollReveal animation="scaleIn" delay={200}>
                  <div className="w-32 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full mx-auto lg:mx-0 mb-8"></div>
                </ScrollReveal>

                <ScrollReveal animation="fadeInUp" delay={300}>
                  <p className="text-xl lg:text-2xl mb-10 opacity-90 leading-relaxed">
                    Essential guidelines for all ICMS participants ensuring a professional, ethical, and secure environment
                  </p>
                </ScrollReveal>

                <ScrollReveal animation="fadeInUp" delay={400}>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Button asChild className="bg-white text-emerald-600 hover:bg-gray-100 shadow-xl px-8 py-4 rounded-full text-lg font-semibold animate-pulse-glow">
                      <Link href="/register" prefetch>Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
                    </Button>
                    <Button asChild variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-4 rounded-full text-lg font-semibold backdrop-blur-sm transition-all">
                      <Link href="/help/overview" prefetch>System Overview</Link>
                    </Button>
                  </div>
                </ScrollReveal>
              </div>

              {/* Animated Shield Illustration */}
              <ScrollReveal animation="scaleIn" delay={500} className="hidden lg:flex items-center justify-center">
                <div className="relative">
                  <svg width="400" height="450" viewBox="0 0 350 400" className="drop-shadow-2xl w-full max-w-md h-auto">
                    <defs>
                      <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#14b8a6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                      <filter id="shieldGlow">
                        <feGaussianBlur stdDeviation="10" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                    </defs>
                    
                    {/* Shield Background Glow */}
                    <path 
                      d="M175 20 L320 70 V200 C320 280 250 350 175 380 C100 350 30 280 30 200 V70 L175 20Z" 
                      fill="url(#shieldGradient)" 
                      opacity="0.2"
                      className="animate-shield-pulse"
                    />
                    
                    {/* Main Shield */}
                    <path 
                      d="M175 40 L300 80 V190 C300 260 240 320 175 345 C110 320 50 260 50 190 V80 L175 40Z" 
                      fill="url(#shieldGradient)" 
                      filter="url(#shieldGlow)"
                    />
                    
                    {/* Checkmark */}
                    <path 
                      d="M120 190 L160 230 L250 140" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="12" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      strokeDasharray="200"
                      strokeDashoffset="0"
                      style={{ animation: 'draw-check 1.5s ease-out forwards' }}
                    />
                    
                    {/* Decorative circles */}
                    <circle cx="175" cy="50" r="8" fill="white" opacity="0.5" className="animate-pulse" />
                    <circle cx="90" cy="130" r="5" fill="white" opacity="0.3" style={{ animation: 'float 4s ease-in-out infinite' }} />
                    <circle cx="260" cy="130" r="5" fill="white" opacity="0.3" style={{ animation: 'float 4s ease-in-out infinite 2s' }} />
                  </svg>
                </div>
              </ScrollReveal>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <ScrollReveal animation="fadeInUp" delay={800}>
              <div className="flex flex-col items-center gap-2">
                <span className="text-white/60 text-sm">Read our guidelines</span>
                <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                  <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce"></div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="relative z-10 py-24 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <ScrollReveal animation="fadeInUp" className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
                <Star className="w-4 h-4" />
                Our Principles
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">Our Core Values</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">These principles guide all interactions on our platform</p>
            </ScrollReveal>

            <StaggeredReveal animation="scaleIn" staggerDelay={150} className="grid md:grid-cols-4 gap-6 mb-20">
              {coreValues.map((value, i) => (
                <div key={i} className="interactive-card text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
                  <div className={`inline-flex p-5 rounded-2xl ${value.color} mb-4`}>
                    <value.icon className="w-10 h-10" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{value.desc}</p>
                </div>
              ))}
            </StaggeredReveal>

            {/* General Rules */}
            <ScrollReveal animation="fadeInUp">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-10 mb-16 shadow-2xl animate-gradient">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-white/20 animate-pulse-glow">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">General Rules for All Users</h2>
                    <p className="text-amber-100">Fundamental guidelines that apply to everyone</p>
                  </div>
                </div>
                <StaggeredReveal animation="fadeInUp" staggerDelay={100} className="grid md:grid-cols-2 gap-4">
                  {[
                    'Maintain professional communication at all times',
                    'Provide accurate and truthful information',
                    'Complete all documentation within deadlines',
                    'Report technical issues immediately',
                    'Keep sensitive information confidential',
                    'Respect intellectual property rights',
                  ].map((rule, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0" />
                      <span className="text-white font-medium">{rule}</span>
                    </div>
                  ))}
                </StaggeredReveal>
              </div>
            </ScrollReveal>

            {/* Role-specific Rules */}
            <ScrollReveal animation="fadeInUp">
              <div className="space-y-6 mb-20">
                <RuleAccordion title="Student Responsibilities" icon={GraduationCap} defaultOpen color="blue">
                  <ul className="space-y-1">
                    <RuleItem>Submit complete and accurate application materials including updated resume</RuleItem>
                    <RuleItem>Meet all internship program requirements, deadlines, and attendance</RuleItem>
                    <RuleItem>Maintain regular communication with supervisors and advisors</RuleItem>
                    <RuleItem>Demonstrate professional conduct and follow company policies</RuleItem>
                    <RuleItem>Complete all required evaluations and feedback forms on time</RuleItem>
                    <RuleItem>Adhere to confidentiality agreements and IP policies</RuleItem>
                  </ul>
                </RuleAccordion>

                <RuleAccordion title="Company Responsibilities" icon={Building} color="green">
                  <ul className="space-y-1">
                    <RuleItem>Provide accurate job descriptions with clear requirements</RuleItem>
                    <RuleItem>Ensure a safe, professional, and harassment-free environment</RuleItem>
                    <RuleItem>Assign qualified supervisors for proper mentoring</RuleItem>
                    <RuleItem>Provide constructive feedback and fair evaluations</RuleItem>
                    <RuleItem>Complete all required documentation within timeframes</RuleItem>
                    <RuleItem>Honor internship agreements and compensation terms</RuleItem>
                  </ul>
                </RuleAccordion>

                <RuleAccordion title="Academic Institution Responsibilities" icon={BookOpen} color="purple">
                  <ul className="space-y-1">
                    <RuleItem>Verify student eligibility and academic standing</RuleItem>
                    <RuleItem>Provide adequate pre-internship preparation</RuleItem>
                    <RuleItem>Assign qualified faculty advisors for support</RuleItem>
                    <RuleItem>Monitor student progress through regular check-ins</RuleItem>
                    <RuleItem>Intervene promptly when issues arise</RuleItem>
                    <RuleItem>Maintain accurate academic records</RuleItem>
                  </ul>
                </RuleAccordion>

                <RuleAccordion title="System Usage Guidelines" icon={Lock} color="red">
                  <ul className="space-y-1">
                    <RuleItem icon={Lock}>Use only your assigned account credentials</RuleItem>
                    <RuleItem icon={Eye}>Log out properly after each session</RuleItem>
                    <RuleItem icon={AlertCircle}>Report suspicious activities immediately</RuleItem>
                    <RuleItem icon={FileCheck}>Follow all data protection policies</RuleItem>
                    <RuleItem icon={MessageSquare}>Use platform only for legitimate purposes</RuleItem>
                  </ul>
                </RuleAccordion>
              </div>
            </ScrollReveal>

            {/* Consequences */}
            <ScrollReveal animation="fadeInUp">
              <div className="mb-20">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium mb-4">
                    <AlertTriangle className="w-4 h-4" />
                    Important Notice
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Consequences of Violations</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Understanding the progressive discipline process</p>
                </div>

                <StaggeredReveal animation="scaleIn" staggerDelay={150} className="grid md:grid-cols-4 gap-6">
                  {consequences.map((item, i) => (
                    <div key={i} className="relative group">
                      {i < 3 && (
                        <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gray-300 dark:bg-gray-600 z-10">
                          <ArrowRight className="absolute -right-2 -top-2 w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div className="interactive-card p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 h-full">
                        <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center text-sm font-bold shadow-lg">
                          {item.count}
                        </div>
                        <div className={`inline-flex p-4 rounded-xl ${item.color} text-white mb-4 shadow-lg`}>
                          <item.icon className="w-7 h-7" />
                        </div>
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{item.level}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </StaggeredReveal>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA Section */}
        <ScrollReveal animation="scaleIn" className="relative z-10">
          <div className="py-24 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 relative overflow-hidden animate-gradient">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
            </div>
            <div className="relative max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Questions About Our Guidelines?</h2>
              <p className="text-lg text-white/80 mb-8">Our team is here to help clarify any questions</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-white text-emerald-600 hover:bg-gray-100 shadow-xl px-8 py-3 rounded-full font-semibold animate-pulse-glow">
                  <Link href="/help/contact" prefetch>Contact Us <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button asChild variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-3 rounded-full font-semibold backdrop-blur-sm transition-all">
                  <Link href="/help/overview" prefetch>Back to Overview</Link>
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Footer */}
        <footer className="relative z-10 bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  {homeContent?.logo ? (
                    <img src={getImageUrl(homeContent.logo)} alt="Logo" className="h-10 w-10 rounded-lg" />
                  ) : (
                    <Briefcase className="h-10 w-10 text-emerald-400" />
                  )}
                  <span className="text-3xl font-bold">ICMS</span>
                </div>
                <p className="text-gray-400 mb-6 max-w-md">Connecting talent with opportunity through comprehensive internship management.</p>
                <div className="flex space-x-4">
                  {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                    <a key={i} href="#" className="p-3 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-300 hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
                <ul className="space-y-3">
                  <li><Link href="/" prefetch className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4" />Home</Link></li>
                  <li><Link href="/help/overview" prefetch className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4" />Overview</Link></li>
                  <li><Link href="/help/contact" prefetch className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4" />Contact</Link></li>
                  <li><Link href={route('login')} prefetch className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4" />Login</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-6">Contact Info</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="p-2 rounded-lg bg-gray-800"><Phone className="h-4 w-4" /></div>
                    <span>+251 911 123 456</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="p-2 rounded-lg bg-gray-800"><Mail className="h-4 w-4" /></div>
                    <span>skatephi@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="p-2 rounded-lg bg-gray-800"><MapPin className="h-4 w-4" /></div>
                    <span>Ambo University Hachalu Hundesa Campus</span>
                  </div>
                </div>
              </div>

              {/* Theme and QR Code */}
              <div>
                <h4 className="text-lg font-semibold mb-6">Theme</h4>
                <div className="mb-6">
                    <AppearanceDropdown />
                </div>
                <h4 className="text-lg font-semibold mb-4">Access ICMS</h4>
                <QRCodeDisplay size={120} />
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
              <p>&copy; {new Date().getFullYear()} ICMS. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* Floating Back Button */}
        <div className="fixed bottom-6 left-6 z-50">
          <Button asChild variant="outline" size="sm" className="shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:scale-105 transition-transform">
            <Link href="/" prefetch><ArrowLeft className="h-4 w-4 mr-2" />Back to Home</Link>
          </Button>
        </div>

        {/* ChatBot */}
        <ChatBot position="bottom-right" />
      </div>
    </>
  );
}
