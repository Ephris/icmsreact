import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, ArrowRight, Users, Target, Award, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin,
  GraduationCap, Building2, UserCheck, Shield, UserCog, BookOpen, LogIn, Search, FileText, 
  MessageSquare, Briefcase, CheckCircle, Sparkles, Zap, Globe, TrendingUp
} from 'lucide-react';
import { type SharedData } from '@/types';
import { getImageUrl } from '@/utils/imageUtils';

// Import scroll animation components
import { ScrollReveal, StaggeredReveal } from '@/components/animations/ScrollReveal';
import { ParticleField } from '@/components/animations/ParallaxSection';
import { DataFlowAnimation, CircuitPattern, FloatingCode } from '@/components/animations/DataFlowAnimation';
import { useScrollProgress, useCountUp } from '@/hooks/useScrollAnimation';

// Import ChatBot
import { ChatBot } from '@/components/ChatBot';

// Import Theme Switcher and QR Code
import { AppearanceDropdown } from '@/components/appearance-dropdown';
import QRCodeDisplay from '@/components/qr-code-display';

// Lazy load Lottie for better performance
const Lottie = lazy(() => import('lottie-react'));

interface Props extends SharedData {
  homeContent?: {
    logo?: string;
    phone?: string;
    email?: string;
    location?: string;
  } | null;
}

// Lottie animation URLs (CDN hosted)
const LOTTIE_ANIMATIONS = {
  hero: 'https://lottie.host/b1da91a2-7dc9-4c5a-95e3-1d0c58ac0c4d/DcJdVcM0i8.json',
  teamwork: 'https://lottie.host/d35aaa6e-cf4d-4fb8-95a7-23c9d9e2b6c1/pVvbMDTnm4.json',
  success: 'https://lottie.host/f3ca0c59-d8be-47c7-b5f7-1a2d45cb9e3d/8yXZWYELnJ.json',
};

// Animated counter component
function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [ref, count] = useCountUp(target, 2000, true);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export default function Overview() {
  const { homeContent } = usePage<Props>().props;
  const [selectedRole, setSelectedRole] = useState('student');
  const [isScrolled, setIsScrolled] = useState(false);
  const [lottieData, setLottieData] = useState<Record<string, unknown> | null>(null);
  const scrollProgress = useScrollProgress();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load Lottie animation data
  useEffect(() => {
    fetch(LOTTIE_ANIMATIONS.hero)
      .then(res => res.json())
      .then(data => setLottieData(data))
      .catch(() => setLottieData(null));
  }, []);

  return (
    <>
      <Head title="System Overview - ICMS">
        <style>{`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-30px) rotate(3deg); } }
          @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.3); } 50% { transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }
          @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
          @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); } 50% { box-shadow: 0 0 50px rgba(99, 102, 241, 0.7); } }
          @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
          @keyframes draw-line { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
          @keyframes scale-in { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          @keyframes rotate-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes morph { 0%, 100% { border-radius: 60% 40% 30% 70%/60% 30% 70% 40%; } 50% { border-radius: 30% 60% 70% 40%/50% 60% 30% 60%; } }
          .animate-float { animation: float 8s ease-in-out infinite; }
          .animate-bounce-in { animation: bounceIn 1s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
          .animate-fade-in-up { animation: fadeInUp 0.8s ease-out; }
          .animate-shimmer { animation: shimmer 3s ease-in-out infinite; background-size: 200% 100%; }
          .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
          .animate-gradient { animation: gradient-shift 10s ease infinite; background-size: 400% 400%; }
          .animate-draw-line { animation: draw-line 2s ease-out forwards; }
          .animate-scale-in { animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
          .animate-rotate-slow { animation: rotate-slow 30s linear infinite; }
          .animate-morph { animation: morph 15s ease-in-out infinite; }
          .interactive-card { transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
          .interactive-card:hover { transform: translateY(-12px) scale(1.02); box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2); }
          .glass-effect { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.2); }
          .text-gradient { background: linear-gradient(135deg, #fff 0%, #c7d2fe 50%, #a5b4fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .parallax-bg { transform: translateY(calc(var(--scroll) * 0.3)); }
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
              <Link href="/help/overview" prefetch className="text-indigo-600 dark:text-indigo-400 font-medium">Overview</Link>
              <Link href="/help/rules" prefetch className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition-colors">Rules</Link>
              <Link href="/help/contact" prefetch className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition-colors">Contact</Link>
              <Button asChild variant="ghost" className="text-gray-700 dark:text-gray-200 hover:bg-indigo-50 rounded-full">
                <Link href={route('login')} prefetch>Login <LogIn className="ml-2 h-4 w-4" /></Link>
              </Button>
              <AppearanceDropdown />
            </nav>
          </div>
          
          {/* Scroll Progress Bar */}
          <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" style={{ width: `${scrollProgress * 100}%` }} />
        </header>

        {/* Hero Section with Cinematic Design - Full Screen Background */}
        <section className="relative min-h-screen">
          {/* Fixed Full-Screen Background */}
          <div className="hero-full-screen">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 animate-gradient"></div>
            
            {/* Morphing Background Shapes */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-500/20 animate-morph blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 animate-morph blur-3xl" style={{ animationDelay: '5s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 animate-morph blur-3xl" style={{ animationDelay: '10s' }}></div>
            
            {/* Rotating geometric elements */}
            <div className="absolute top-1/4 right-1/4 w-32 h-32 border border-white/10 rounded-lg animate-rotate-slow"></div>
            <div className="absolute bottom-1/4 left-1/4 w-24 h-24 border border-white/10 rounded-full animate-rotate-slow" style={{ animationDirection: 'reverse' }}></div>
            
            {/* Circuit Pattern Background */}
            <div className="absolute inset-0 opacity-20">
              <CircuitPattern width={800} height={600} color="#a5b4fc" opacity={0.3} className="absolute top-0 left-0" />
              <CircuitPattern width={800} height={600} color="#c4b5fd" opacity={0.2} className="absolute bottom-0 right-0" />
            </div>
            
            {/* Floating Code */}
            <FloatingCode />
            
            {/* Particle Field */}
            <ParticleField particleCount={40} colors={['rgba(99, 102, 241, 0.4)', 'rgba(168, 85, 247, 0.4)', 'rgba(236, 72, 153, 0.3)']} />
          </div>

          {/* Content Layer */}
          <div className="hero-content-wrapper">
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24 text-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[70vh]">
              {/* Text Content */}
              <div className="text-center lg:text-left">
                <ScrollReveal animation="fadeInUp" delay={0}>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-indigo-200 text-sm font-medium mb-8">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    Comprehensive Platform
                  </div>
                </ScrollReveal>
                
                <ScrollReveal animation="fadeInUp" delay={100}>
                  <h1 className="text-5xl lg:text-7xl font-black mb-6 tracking-tight text-gradient">
              ICMS Overview
            </h1>
                </ScrollReveal>
                
                <ScrollReveal animation="scaleIn" delay={200}>
                  <div className="w-32 h-1.5 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full mx-auto lg:mx-0 mb-8"></div>
                </ScrollReveal>

                <ScrollReveal animation="fadeInUp" delay={300}>
                  <p className="text-xl lg:text-2xl mb-10 opacity-90 leading-relaxed">
              Comprehensive Internship Management System connecting students, companies, and educational institutions
            </p>
                </ScrollReveal>

                <ScrollReveal animation="fadeInUp" delay={400}>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Button asChild className="bg-white text-indigo-600 hover:bg-gray-100 shadow-xl px-8 py-4 rounded-full text-lg font-semibold animate-pulse-glow">
                      <Link href="/register" prefetch>Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
                    <Button asChild variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4 rounded-full text-lg font-semibold backdrop-blur-sm transition-all">
                      <Link href="/#latest-internship-opportunities" prefetch>Browse Postings</Link>
              </Button>
                  </div>
                </ScrollReveal>
              </div>

              {/* Data Flow Animation */}
              <ScrollReveal animation="scaleIn" delay={500} className="hidden lg:block">
                <div className="relative">
                  <DataFlowAnimation 
                    width={500} 
                    height={500} 
                    className="drop-shadow-2xl w-full max-w-lg h-auto"
                    particleCount={25}
                    particleSpeed={4}
                  />
                  
                  {/* Lottie overlay */}
                  {lottieData && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      <Suspense fallback={null}>
                        <Lottie animationData={lottieData} loop={true} className="w-64 h-64" />
                      </Suspense>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            </div>
          </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <ScrollReveal animation="fadeInUp" delay={800}>
              <div className="flex flex-col items-center gap-2">
                <span className="text-white/60 text-sm">Scroll to explore</span>
                <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                  <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce"></div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Stats Section - Animated Counters */}
        <section className="py-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')]"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <StaggeredReveal 
              animation="scaleIn" 
              staggerDelay={150} 
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {[
                { value: 5000, label: 'Students', suffix: '+' },
                { value: 200, label: 'Companies', suffix: '+' },
                { value: 50, label: 'Institutions', suffix: '+' },
                { value: 98, label: 'Success Rate', suffix: '%' },
              ].map((stat, i) => (
                <div key={i} className="text-center text-white">
                  <div className="text-4xl md:text-5xl font-bold mb-2">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-white/80 text-sm md:text-base">{stat.label}</div>
                </div>
              ))}
            </StaggeredReveal>
          </div>
        </section>

      {/* Main Content */}
      <div className="relative z-10 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* What is ICMS */}
          <ScrollReveal animation="fadeInUp" className="text-center mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              About the Platform
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            What is ICMS?
          </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            ICMS (Internship and Career Management System) is a comprehensive platform designed to streamline
            the internship process for students, companies, and educational institutions. Our mission is to
            bridge the gap between academic learning and professional experience, creating meaningful
            opportunities that benefit all stakeholders.
          </p>
          </ScrollReveal>

        {/* Key Features */}
          <div className="mb-24">
            <StaggeredReveal 
              animation="fadeInUp" 
              staggerDelay={150}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[
                { icon: Users, title: 'Student-Centric', color: 'blue', gradient: 'from-blue-500 to-cyan-500', description: 'Empowering students with tools to find, apply for, and manage their internship experiences with ease and transparency.' },
                { icon: Target, title: 'Company Focused', color: 'green', gradient: 'from-green-500 to-emerald-500', description: 'Helping companies discover talented students and manage their internship programs efficiently and effectively.' },
                { icon: Award, title: 'Institution Integrated', color: 'purple', gradient: 'from-purple-500 to-pink-500', description: 'Seamlessly integrating with academic institutions to ensure internship experiences meet educational objectives.' },
              ].map((feature, index) => (
                <div key={index} className="interactive-card text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 group">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:animate-pulse-glow transition-all duration-300 group-hover:scale-110`}>
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
            </p>
          </div>
              ))}
            </StaggeredReveal>
          </div>

          {/* How It Works - Cinematic Timeline */}
          <div className="mb-24">
            <ScrollReveal animation="fadeInUp" className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Simple Process
          </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            How It Works
          </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-teal-600 rounded-full mx-auto"></div>
            </ScrollReveal>

            <div className="relative">
              {/* Animated Connection Line */}
              <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 animate-shimmer"></div>
              </div>
              
              <StaggeredReveal 
                animation="scaleIn" 
                staggerDelay={200}
                className="grid grid-cols-1 md:grid-cols-3 gap-12"
              >
                {[
                  { step: 1, title: 'Discover', color: 'blue', gradient: 'from-blue-500 to-blue-600', description: 'Students browse internship opportunities posted by companies, while companies review student profiles and applications.' },
                  { step: 2, title: 'Connect', color: 'green', gradient: 'from-green-500 to-green-600', description: 'Through our platform, students and companies connect, with academic advisors and coordinators ensuring quality and compliance.' },
                  { step: 3, title: 'Succeed', color: 'purple', gradient: 'from-purple-500 to-purple-600', description: 'Students gain valuable experience, companies find talent, and institutions achieve their educational goals.' },
                ].map((item, index) => (
                  <div key={index} className="text-center relative group">
                    <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-2xl z-10 relative group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-4xl font-black text-white">{item.step}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </StaggeredReveal>
            </div>
            </div>

          {/* Role-Specific Workflows Section */}
          <div className="mb-24">
            <ScrollReveal animation="fadeInUp" className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
                <TrendingUp className="w-4 h-4" />
                Role Workflows
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Role-Specific Workflows
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Explore how different roles interact with ICMS to achieve their goals
              </p>
            </ScrollReveal>
            
            {/* Role Selection Buttons */}
            <ScrollReveal animation="fadeInUp" delay={100}>
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {[
                  { role: 'student', label: 'Student', icon: GraduationCap, color: 'bg-blue-600 hover:bg-blue-700' },
                  { role: 'company_admin', label: 'Company Admin', icon: Building2, color: 'bg-green-600 hover:bg-green-700' },
                  { role: 'supervisor', label: 'Supervisor', icon: UserCheck, color: 'bg-orange-600 hover:bg-orange-700' },
                  { role: 'dept_head', label: 'Department Head', icon: Shield, color: 'bg-purple-600 hover:bg-purple-700' },
                  { role: 'coordinator', label: 'Coordinator', icon: UserCog, color: 'bg-teal-600 hover:bg-teal-700' },
                  { role: 'advisor', label: 'Advisor', icon: BookOpen, color: 'bg-pink-600 hover:bg-pink-700' }
                ].map(({ role, label, icon: Icon, color }) => (
                  <Button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`${color} text-white rounded-full px-6 py-3 transition-all duration-300 transform hover:scale-105 shadow-lg ${selectedRole === role ? 'ring-4 ring-offset-2 ring-indigo-300 scale-105 shadow-xl' : ''}`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {label}
                  </Button>
                ))}
            </div>
            </ScrollReveal>

            {/* Dynamic Steps Based on Selected Role */}
            <ScrollReveal animation="fadeInUp" delay={200}>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-10 shadow-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-10">
                  Workflow for {selectedRole === 'student' ? 'Students' : 
                           selectedRole === 'company_admin' ? 'Company Admins' :
                           selectedRole === 'supervisor' ? 'Supervisors' :
                           selectedRole === 'dept_head' ? 'Department Heads' :
                           selectedRole === 'coordinator' ? 'Coordinators' : 'Advisors'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(() => {
                    const roleSteps: Record<string, { step: number; title: string; description: string; icon: React.ElementType }[]> = {
                      student: [
                        { step: 1, title: 'Login', description: 'Access your student dashboard', icon: LogIn },
                        { step: 2, title: 'Browse Internships', description: 'Explore available opportunities', icon: Search },
                        { step: 3, title: 'Apply & Track', description: 'Submit applications and monitor status', icon: FileText },
                        { step: 4, title: 'Communicate', description: 'Chat with supervisors and coordinators', icon: MessageSquare }
                      ],
                      company_admin: [
                        { step: 1, title: 'Login', description: 'Access your company dashboard', icon: LogIn },
                        { step: 2, title: 'Post Opportunities', description: 'Create and publish position postings', icon: Briefcase },
                        { step: 3, title: 'Review Applications', description: 'Evaluate and shortlist candidates', icon: FileText },
                        { step: 4, title: 'Assign Supervisors', description: 'Assign supervisors to students', icon: UserCheck }
                      ],
                      supervisor: [
                        { step: 1, title: 'Login', description: 'Access your supervisor dashboard', icon: LogIn },
                        { step: 2, title: 'Manage Students', description: 'Oversee assigned students', icon: Users },
                        { step: 3, title: 'Approve Forms', description: 'Review and approve student forms', icon: CheckCircle },
                        { step: 4, title: 'Communicate', description: 'Provide guidance and feedback', icon: MessageSquare }
                      ],
                      dept_head: [
                        { step: 1, title: 'Login', description: 'Access your department dashboard', icon: LogIn },
                        { step: 2, title: 'Monitor Applications', description: 'Track department-wide applications', icon: Target },
                        { step: 3, title: 'Coordinate', description: 'Work with coordinators and advisors', icon: UserCog },
                        { step: 4, title: 'Oversee Process', description: 'Ensure smooth internship process', icon: Shield }
                      ],
                      coordinator: [
                        { step: 1, title: 'Login', description: 'Access your coordinator dashboard', icon: LogIn },
                        { step: 2, title: 'Manage Letters', description: 'Handle application letters', icon: FileText },
                        { step: 3, title: 'Coordinate', description: 'Facilitate between departments and companies', icon: UserCog },
                        { step: 4, title: 'Communicate', description: 'Maintain communication channels', icon: MessageSquare }
                      ],
                      advisor: [
                        { step: 1, title: 'Login', description: 'Access your advisor dashboard', icon: LogIn },
                        { step: 2, title: 'Review Applications', description: 'Evaluate student applications', icon: FileText },
                        { step: 3, title: 'Provide Guidance', description: 'Offer academic and career advice', icon: BookOpen },
                        { step: 4, title: 'Support Students', description: 'Help with career development', icon: Users }
                      ]
                    };
                    
                    const steps = roleSteps[selectedRole] || roleSteps.student;
                    
                    return steps.map(({ step, title, description, icon: Icon }, index) => (
                      <div 
                        key={step} 
                        className="interactive-card text-center p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold shadow-md">
                          {step}
                        </div>
                        <h4 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </ScrollReveal>
        </div>

        {/* Call to Action */}
          <ScrollReveal animation="scaleIn">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 p-12 text-center animate-gradient">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
                <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of students, companies, and institutions already using ICMS
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild className="bg-white text-indigo-600 hover:bg-gray-100 shadow-xl px-8 py-3 rounded-full font-semibold animate-pulse-glow">
                    <Link href="/register" prefetch>Create Account <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
                  <Button asChild variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-3 rounded-full font-semibold backdrop-blur-sm transition-all">
                    <Link href="/#latest-internship-opportunities" prefetch>View Opportunities</Link>
            </Button>
          </div>
        </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  {homeContent?.logo ? (
                    <img src={getImageUrl(homeContent.logo)} alt="Logo" className="h-10 w-10 rounded-lg" />
                  ) : (
                    <Briefcase className="h-10 w-10 text-indigo-400" />
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
                  <li><Link href="/help/rules" prefetch className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4" />Rules</Link></li>
                  <li><Link href="/help/contact" prefetch className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4" />Contact</Link></li>
                  <li><Link href={route('login')} prefetch className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4" />Login</Link></li>
              </ul>
            </div>

            <div>
                <h4 className="text-lg font-semibold mb-6">Contact Info</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="p-2 rounded-lg bg-gray-800"><Phone className="h-4 w-4" /></div>
                    <span>{homeContent?.phone || '+251 911 123 456'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="p-2 rounded-lg bg-gray-800"><Mail className="h-4 w-4" /></div>
                    <span>{homeContent?.email || 'skatephi@gmail.com'}</span>
                </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="p-2 rounded-lg bg-gray-800"><MapPin className="h-4 w-4" /></div>
                    <span>{homeContent?.location || 'Ambo University Hachalu Hundesa Campus'}</span>
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
