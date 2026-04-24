import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, ArrowRight, User, GraduationCap, Facebook, Twitter, Instagram, Linkedin, 
  Phone, Mail, MapPin, Github, Briefcase, LogIn, Code, Palette, Database, 
  Server, TestTube, Smartphone, ExternalLink, Sparkles, Users, Heart, Send
} from 'lucide-react';
import { type SharedData } from '@/types';
import { getImageUrl } from '@/utils/imageUtils';

// Import scroll animation components
import { ScrollReveal, StaggeredReveal } from '@/components/animations/ScrollReveal';
import { ParticleField } from '@/components/animations/ParallaxSection';
import { TeamCircleAnimation, SpeechBubbles, CardFlipReveal } from '@/components/animations/TeamAnimation';
import { useScrollProgress } from '@/hooks/useScrollAnimation';

// Import ChatBot
import { ChatBot } from '@/components/ChatBot';

// Import Theme Switcher and QR Code
import { AppearanceDropdown } from '@/components/appearance-dropdown';
import QRCodeDisplay from '@/components/qr-code-display';

// Lazy load Lottie for better performance
const Lottie = lazy(() => import('lottie-react'));

// Lottie animation URL
const LOTTIE_TEAMWORK = 'https://lottie.host/d35aaa6e-cf4d-4fb8-95a7-23c9d9e2b6c1/pVvbMDTnm4.json';

interface Developer {
  id: number;
  name: string;
  role: string;
  education: string;
  bio: string;
  image: string;
  color: string;
  social: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    telegram?: string;
  };
  portfolio: string;
}

interface Props extends SharedData {
  homeContent?: {
    logo?: string;
    phone?: string;
    email?: string;
    location?: string;
  } | null;
  developers?: Developer[];
}

// Color configurations for developer cards
const colorConfigs: Record<string, { gradient: string; bg: string; border: string; icon: string; hover: string; glow: string }> = {
  blue: { 
    gradient: 'from-blue-500 to-indigo-600', 
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20', 
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    hover: 'hover:border-blue-400',
    glow: 'rgba(59, 130, 246, 0.5)'
  },
  green: { 
    gradient: 'from-green-500 to-emerald-600', 
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20', 
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    hover: 'hover:border-green-400',
    glow: 'rgba(16, 185, 129, 0.5)'
  },
  purple: { 
    gradient: 'from-purple-500 to-violet-600', 
    bg: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20', 
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600 dark:text-purple-400',
    hover: 'hover:border-purple-400',
    glow: 'rgba(139, 92, 246, 0.5)'
  },
  orange: { 
    gradient: 'from-orange-500 to-amber-600', 
    bg: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20', 
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'text-orange-600 dark:text-orange-400',
    hover: 'hover:border-orange-400',
    glow: 'rgba(249, 115, 22, 0.5)'
  },
  pink: { 
    gradient: 'from-pink-500 to-rose-600', 
    bg: 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20', 
    border: 'border-pink-200 dark:border-pink-800',
    icon: 'text-pink-600 dark:text-pink-400',
    hover: 'hover:border-pink-400',
    glow: 'rgba(236, 72, 153, 0.5)'
  },
  teal: { 
    gradient: 'from-teal-500 to-cyan-600', 
    bg: 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20', 
    border: 'border-teal-200 dark:border-teal-800',
    icon: 'text-teal-600 dark:text-teal-400',
    hover: 'hover:border-teal-400',
    glow: 'rgba(20, 184, 166, 0.5)'
  },
};

// Role icons mapping
const roleIcons: Record<string, React.ElementType> = {
  'Lead Developer & System Architect': Code,
  'Frontend Developer & UI/UX Designer': Palette,
  'Backend Developer & Database Architect': Database,
  'DevOps Engineer & Cloud Specialist': Server,
  'QA Engineer & Testing Lead': TestTube,
  'Mobile Developer & API Specialist': Smartphone,
};

export default function Contact() {
  const { homeContent, developers = [] } = usePage<Props>().props;
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [lottieData, setLottieData] = useState<Record<string, unknown> | null>(null);
  const scrollProgress = useScrollProgress();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load Lottie animation
  useEffect(() => {
    fetch(LOTTIE_TEAMWORK)
      .then(res => res.json())
      .then(data => setLottieData(data))
      .catch(() => setLottieData(null));
  }, []);

  // Default developers if none provided
  const displayDevelopers: Developer[] = developers.length > 0 ? developers : [
    {
      id: 1, name: 'Ephrem Niguse', role: 'Lead Developer & System Architect',
      education: 'Computer Science, Addis Ababa University',
      bio: 'Full-stack developer specializing in Laravel and React ecosystems. Passionate about creating scalable solutions.',
      image: '', color: 'blue',
      social: { github: '#', linkedin: '#', twitter: '#', facebook: '#', instagram: '#', telegram: '#' },
      portfolio: '#'
    },
    {
      id: 2, name: 'Abel Tsegaye', role: 'Frontend Developer & UI/UX Designer',
      education: 'Software Engineering, Unity University',
      bio: 'Creative frontend developer with expertise in React and modern UI frameworks.',
      image: '', color: 'green',
      social: { github: '#', linkedin: '#', facebook: '#', instagram: '#', telegram: '#' },
      portfolio: '#'
    },
    {
      id: 3, name: 'Helen Tesfaye', role: 'Backend Developer & Database Architect',
      education: 'Information Technology, AASTU',
      bio: 'Backend specialist with deep knowledge of database design and API development.',
      image: '', color: 'purple',
      social: { github: '#', linkedin: '#', twitter: '#', facebook: '#', instagram: '#', telegram: '#' },
      portfolio: '#'
    },
    {
      id: 4, name: 'Dawit Bekele', role: 'DevOps Engineer & Cloud Specialist',
      education: 'Computer Engineering, Bahir Dar University',
      bio: 'Infrastructure expert specializing in cloud deployments and CI/CD pipelines.',
      image: '', color: 'orange',
      social: { github: '#', linkedin: '#', twitter: '#', facebook: '#', instagram: '#', telegram: '#' },
      portfolio: '#'
    },
    {
      id: 5, name: 'Sara Mohammed', role: 'QA Engineer & Testing Lead',
      education: 'Software Engineering, Jimma University',
      bio: 'Quality assurance specialist dedicated to ensuring bug-free releases.',
      image: '', color: 'pink',
      social: { github: '#', linkedin: '#', twitter: '#', facebook: '#', instagram: '#', telegram: '#' },
      portfolio: '#'
    },
    {
      id: 6, name: 'Yonas Hailu', role: 'Mobile Developer & API Specialist',
      education: 'Computer Science, Hawassa University',
      bio: 'Mobile application developer with expertise in React Native and cross-platform development.',
      image: '', color: 'teal',
      social: { github: '#', linkedin: '#', twitter: '#', facebook: '#', instagram: '#', telegram: '#' },
      portfolio: '#'
    },
  ];

  return (
    <>
      <Head title="Contact Developers - ICMS">
        <style>{`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-25px) rotate(2deg); } }
          @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.3); } 50% { transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }
          @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
          @keyframes pulse-ring { 0% { transform: scale(0.95); opacity: 0.7; box-shadow: 0 0 0 0 currentColor; } 50% { transform: scale(1); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.7; box-shadow: 0 0 0 15px transparent; } }
          @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
          @keyframes glow { 0%, 100% { box-shadow: 0 0 30px rgba(168, 85, 247, 0.4); } 50% { box-shadow: 0 0 60px rgba(168, 85, 247, 0.8); } }
          @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes morph { 0%, 100% { border-radius: 60% 40% 30% 70%/60% 30% 70% 40%; } 50% { border-radius: 30% 60% 70% 40%/50% 60% 30% 60%; } }
          @keyframes card-shine { 0% { left: -100%; } 100% { left: 200%; } }
          @keyframes flip-in { 0% { transform: perspective(1000px) rotateY(-90deg); opacity: 0; } 100% { transform: perspective(1000px) rotateY(0deg); opacity: 1; } }
          .animate-float { animation: float 8s ease-in-out infinite; }
          .animate-bounce-in { animation: bounceIn 1s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
          .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
          .animate-shimmer { animation: shimmer 3s ease-in-out infinite; background-size: 200% 100%; }
          .animate-pulse-ring { animation: pulse-ring 2s ease-in-out infinite; }
          .animate-gradient { animation: gradient-shift 10s ease infinite; background-size: 400% 400%; }
          .animate-glow { animation: glow 3s ease-in-out infinite; }
          .animate-spin-slow { animation: spin-slow 25s linear infinite; }
          .animate-morph { animation: morph 12s ease-in-out infinite; }
          .animate-flip-in { animation: flip-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
          .interactive-card { transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; overflow: hidden; }
          .interactive-card:hover { transform: translateY(-15px) scale(1.02); }
          .interactive-card::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); transition: 0.5s; }
          .interactive-card:hover::before { left: 200%; }
          .glass-effect { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.2); }
          .text-gradient { background: linear-gradient(135deg, #fff 0%, #f0abfc 50%, #c4b5fd 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
          .card-3d { transform-style: preserve-3d; perspective: 1000px; }
          .card-3d:hover { transform: translateY(-15px) rotateX(5deg) rotateY(5deg); }
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
              <Link href="/help/rules" prefetch className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition-colors">Rules</Link>
              <Link href="/help/contact" prefetch className="text-purple-600 dark:text-purple-400 font-medium">Contact</Link>
              <Button asChild variant="ghost" className="text-gray-700 dark:text-gray-200 hover:bg-purple-50 rounded-full">
                <Link href={route('login')} prefetch>Login <LogIn className="ml-2 h-4 w-4" /></Link>
              </Button>
              <AppearanceDropdown />
            </nav>
          </div>
          
          {/* Scroll Progress Bar */}
          <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500" style={{ width: `${scrollProgress * 100}%` }} />
        </header>

        {/* Cinematic Hero Section - Full Screen Background */}
        <section className="relative min-h-screen">
          {/* Fixed Full-Screen Background */}
          <div className="hero-full-screen">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 animate-gradient"></div>
            
            {/* Morphing Background Shapes */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/20 animate-morph blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-500/20 animate-morph blur-3xl" style={{ animationDelay: '4s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/15 animate-morph blur-3xl" style={{ animationDelay: '8s' }}></div>
            
            {/* Geometric elements */}
            <div className="absolute top-1/4 right-1/4 w-40 h-40 border border-white/10 rounded-full animate-spin-slow"></div>
            <div className="absolute bottom-1/4 left-1/4 w-32 h-32 border border-white/10 rounded-lg rotate-45 animate-pulse-ring"></div>
            
            {/* Speech Bubbles - Team Communication Visual */}
            <SpeechBubbles className="opacity-50" />
            
            {/* Particle Field */}
            <ParticleField particleCount={50} colors={['rgba(168, 85, 247, 0.4)', 'rgba(236, 72, 153, 0.4)', 'rgba(244, 63, 94, 0.3)']} />
          </div>

          {/* Content Layer */}
          <div className="hero-content-wrapper">
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24 text-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[70vh]">
              {/* Text Content */}
              <div className="text-center lg:text-left">
                <ScrollReveal animation="fadeInUp" delay={0}>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-purple-200 text-sm font-medium mb-8">
                    <Heart className="w-4 h-4 animate-pulse" />
                    Meet the Team
                  </div>
                </ScrollReveal>
                
                <ScrollReveal animation="fadeInUp" delay={100}>
                  <h1 className="text-5xl lg:text-7xl font-black mb-6 tracking-tight text-gradient">
                    Our Developers
                  </h1>
                </ScrollReveal>
                
                <ScrollReveal animation="scaleIn" delay={200}>
                  <div className="w-32 h-1.5 bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 rounded-full mx-auto lg:mx-0 mb-8"></div>
                </ScrollReveal>

                <ScrollReveal animation="fadeInUp" delay={300}>
                  <p className="text-xl lg:text-2xl mb-10 opacity-90 leading-relaxed">
                    The talented team behind ICMS - passionate about connecting education and industry
                  </p>
                </ScrollReveal>

                <ScrollReveal animation="fadeInUp" delay={400}>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Button asChild className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl px-8 py-4 rounded-full text-lg font-semibold animate-glow">
                      <Link href={`mailto:${homeContent?.email || 'skatephi@gmail.com'}`}>
                        Get In Touch <Mail className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 rounded-full text-lg font-semibold backdrop-blur-sm transition-all">
                      <Link href="/help/overview" prefetch>Back to Overview</Link>
                    </Button>
                  </div>
                </ScrollReveal>
              </div>

              {/* Team Circle Animation */}
              <ScrollReveal animation="scaleIn" delay={500} className="hidden lg:flex items-center justify-center">
                <div className="relative">
                  <TeamCircleAnimation 
                    memberCount={6} 
                    width={500} 
                    height={500}
                    className="drop-shadow-2xl w-full max-w-lg h-auto"
                  />
                  
                  {/* Lottie overlay */}
                  {lottieData && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <Suspense fallback={null}>
                        <Lottie animationData={lottieData} loop={true} className="w-48 h-48" />
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
                <span className="text-white/60 text-sm">Meet our team</span>
                <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                  <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce"></div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Main Content */}
        <div className="relative z-10 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            {/* Team Introduction */}
          <ScrollReveal animation="fadeInUp" className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              Development Team
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our Development Team
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto mb-8"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Meet the skilled professionals who built ICMS. Our diverse team brings together expertise
              in full-stack development, UI/UX design, and database architecture to create a platform
              that serves students, companies, and institutions effectively.
            </p>
          </ScrollReveal>

          {/* Developer Cards Grid with Flip Animation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8 mb-24">
            {displayDevelopers.map((developer, index) => {
              const colors = colorConfigs[developer.color] || colorConfigs.blue;
              const RoleIcon = roleIcons[developer.role] || User;
              
              return (
                <CardFlipReveal key={developer.id} delay={index * 150}>
                  <div
                    className={`interactive-card card-3d ${colors.bg} p-6 lg:p-8 rounded-3xl border-2 ${colors.border} ${colors.hover} shadow-xl h-full flex flex-col transition-all duration-300 transform hover:-translate-y-2`}
                    onMouseEnter={() => setHoveredCard(developer.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      boxShadow: hoveredCard === developer.id ? `0 25px 50px ${colors.glow}` : undefined,
                    }}
                  >
                    <div className="text-center mb-6 flex-shrink-0">
                      {/* Profile Image/Icon */}
                      <div className="relative inline-block mb-4">
                        <div className={`w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br ${colors.gradient} p-1 shadow-xl transition-transform duration-300 ${hoveredCard === developer.id ? 'animate-pulse-ring scale-110' : ''}`}>
                          <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                            {developer.image && developer.image !== '' ? (
                              <img 
                                src={getImageUrl(developer.image)} 
                                alt={developer.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <RoleIcon className={`w-10 h-10 lg:w-12 lg:h-12 ${colors.icon}`} />
                            )}
                          </div>
                        </div>
                        {/* Floating Badge */}
                        <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg transition-transform duration-300 ${hoveredCard === developer.id ? 'animate-bounce scale-110' : ''}`}>
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      
                      <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{developer.name}</h3>
                      <p className={`${colors.icon} font-semibold text-xs lg:text-sm mb-2 line-clamp-2`}>{developer.role}</p>
                    </div>
                    
                    <div className="space-y-3 lg:space-y-4 flex-grow flex flex-col">
                      <div className="flex items-start text-xs lg:text-sm">
                        <GraduationCap className={`w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 ${colors.icon} flex-shrink-0 mt-0.5`} />
                        <span className="text-gray-700 dark:text-gray-300 line-clamp-2">{developer.education}</span>
                      </div>
                      
                      <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4 flex-grow">
                        {developer.bio}
                      </p>
                      
                      {/* Social Links */}
                      <div className="flex justify-center flex-wrap gap-2 lg:gap-3 pt-3 lg:pt-4">
                        {developer.social.github && (
                          <a href={developer.social.github} target="_blank" rel="noopener noreferrer"
                             className={`p-2 rounded-xl bg-gray-100 dark:bg-gray-700 ${colors.icon} hover:scale-125 transition-all duration-300 hover:shadow-lg transform`}
                             aria-label="GitHub">
                            <Github className="w-4 h-4 lg:w-5 lg:h-5" />
                          </a>
                        )}
                        {developer.social.linkedin && (
                          <a href={developer.social.linkedin} target="_blank" rel="noopener noreferrer"
                             className={`p-2 rounded-xl bg-gray-100 dark:bg-gray-700 ${colors.icon} hover:scale-125 transition-all duration-300 hover:shadow-lg transform`}
                             aria-label="LinkedIn">
                            <Linkedin className="w-4 h-4 lg:w-5 lg:h-5" />
                          </a>
                        )}
                        {developer.social.twitter && (
                          <a href={developer.social.twitter} target="_blank" rel="noopener noreferrer"
                             className={`p-2 rounded-xl bg-gray-100 dark:bg-gray-700 ${colors.icon} hover:scale-125 transition-all duration-300 hover:shadow-lg transform`}
                             aria-label="Twitter">
                            <Twitter className="w-4 h-4 lg:w-5 lg:h-5" />
                          </a>
                        )}
                        {developer.social.facebook && (
                          <a href={developer.social.facebook} target="_blank" rel="noopener noreferrer"
                             className={`p-2 rounded-xl bg-gray-100 dark:bg-gray-700 ${colors.icon} hover:scale-125 transition-all duration-300 hover:shadow-lg transform`}
                             aria-label="Facebook">
                            <Facebook className="w-4 h-4 lg:w-5 lg:h-5" />
                          </a>
                        )}
                        {developer.social.instagram && (
                          <a href={developer.social.instagram} target="_blank" rel="noopener noreferrer"
                             className={`p-2 rounded-xl bg-gray-100 dark:bg-gray-700 ${colors.icon} hover:scale-125 transition-all duration-300 hover:shadow-lg transform`}
                             aria-label="Instagram">
                            <Instagram className="w-4 h-4 lg:w-5 lg:h-5" />
                          </a>
                        )}
                        {developer.social.telegram && (
                          <a href={developer.social.telegram} target="_blank" rel="noopener noreferrer"
                             className={`p-2 rounded-xl bg-gray-100 dark:bg-gray-700 ${colors.icon} hover:scale-125 transition-all duration-300 hover:shadow-lg transform`}
                             aria-label="Telegram">
                            <Send className="w-4 h-4 lg:w-5 lg:h-5" />
                          </a>
                        )}
                      </div>
                      
                      {/* Portfolio Link */}
                      <a href={developer.portfolio} target="_blank" rel="noopener noreferrer"
                         className={`flex items-center justify-center gap-2 text-xs lg:text-sm ${colors.icon} hover:underline font-medium pt-2 group mt-auto`}>
                        View Portfolio <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </CardFlipReveal>
              );
            })}
          </div>

          {/* Contact Information Section */}
          <ScrollReveal animation="fadeInUp">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-10 mb-20 shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
                  <Mail className="w-4 h-4" />
                  Get In Touch
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Contact Information
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Have questions, feedback, or need technical support? We'd love to hear from you.
                </p>
              </div>

              <StaggeredReveal animation="scaleIn" staggerDelay={150} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: Mail, title: 'Email Us', description: 'Send us an email for general inquiries or technical support', value: homeContent?.email || 'skatephi@gmail.com', href: `mailto:${homeContent?.email || 'skatephi@gmail.com'}`, gradient: 'from-blue-500 to-cyan-500' },
                  { icon: Phone, title: 'Call Us', description: 'Speak directly with our support team', value: homeContent?.phone || '+251 911 123 456', href: `tel:${homeContent?.phone || '+251911123456'}`, gradient: 'from-green-500 to-emerald-500' },
                  { icon: MapPin, title: 'Visit Us', description: 'Located at Ambo University', value: homeContent?.location || 'Ambo University Hachalu Hundesa Campus', href: '#', gradient: 'from-purple-500 to-pink-500' },
                ].map((contact, index) => (
                  <div key={index} className="interactive-card text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${contact.gradient} flex items-center justify-center shadow-lg`}>
                      <contact.icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{contact.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                      {contact.description}
                    </p>
                    {contact.href !== '#' ? (
                      <a href={contact.href} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 font-semibold transition-colors text-sm">
                        {contact.value}
                      </a>
                    ) : (
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                        {contact.value}
                      </span>
                    )}
                  </div>
                ))}
              </StaggeredReveal>
            </div>
          </ScrollReveal>

          {/* Call to Action */}
          <ScrollReveal animation="scaleIn">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-12 text-center animate-gradient">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                  Join thousands of students and companies already using ICMS
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl px-8 py-3 rounded-full font-semibold animate-glow">
                    <Link href="/register" prefetch>Create Account <ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                  <Button asChild variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 rounded-full font-semibold backdrop-blur-sm transition-all">
                    <Link href="/help/rules" prefetch>Read Our Rules</Link>
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
                    <Briefcase className="h-10 w-10 text-purple-400" />
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
                  <li><Link href="/help/rules" prefetch className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-4 h-4" />Rules</Link></li>
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
