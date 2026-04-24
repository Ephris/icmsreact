import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, LogIn, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Search, Filter, Star, CheckCircle, Building2, UserCheck, GraduationCap, UserCog, Shield, BookOpen, Target, TrendingUp, Award, Globe, Clock, DollarSign, MapPin as MapPinIcon, Users as UsersIcon, Building, Code, Terminal, Zap, User } from 'lucide-react';
import { type SharedData } from '@/types';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';

// Import scroll animation components
import { ScrollReveal, StaggeredReveal } from '@/components/animations/ScrollReveal';

// Import ChatBot
import { ChatBot } from '@/components/ChatBot';

// Import Theme Switcher and QR Code
import { AppearanceDropdown } from '@/components/appearance-dropdown';
import QRCodeDisplay from '@/components/qr-code-display';

interface HomeContent {
    title: string;
    description: string;
    background_image?: string;
    logo?: string;
    about_title: string;
    about_description: string;
    inline_image?: string;
    phone?: string;
    email?: string;
    location?: string;
    social_media?: { platform: string; url: string }[];
    carousel_images?: string[];
    carousel_texts?: string[];
    background_color?: string;
    postings_button_text?: string;
    about_us_button_text?: string;
    login_button_text?: string;
    trusted_logos?: string[];
    footer_text?: string;
    footer_links?: { label: string; url: string }[];
    success_stories?: {
        name: string;
        student_name?: string;
        role?: string;
        role_position?: string;
        student_role?: string;
        text: string;
        title?: string;
        story?: string;
        image?: string | null;
        company?: string | null;
        company_name?: string | null;
        profile_image?: string | null;
        achievements?: string | null;
        outcome?: string | null;
        experiences?: string | null;
        created_at?: string;
    }[];
    // New dynamic content fields
    header_height?: string;
    navigation_menu?: { label: string; url: string; children?: { label: string; url: string }[] }[];
    hero_subtitle?: string;
    hero_image_fit?: string;
    about_image_text?: string;
    statistics?: { value: string; label: string }[];
    our_story_text?: string;
    our_story_image?: string;
    our_mission?: string;
    our_vision?: string;
    why_it_works_title?: string;
    why_it_works_subtitle?: string;
    why_it_works_cards?: {
        title: string;
        description: string;
        features: string[];
        bgColor?: string;
        borderColor?: string;
        iconBgColor?: string;
    }[];
    system_roles_title?: string;
    system_roles_data?: {
        role: string;
        icon: React.ComponentType<{ className?: string }>;
        description: string;
        functionalities: string[];
        color: string;
        iconColor: string;
    }[];
    how_it_works_title?: string;
    how_it_works_subtitle?: string;
    how_it_works_steps?: {
        step: number;
        title: string;
        description: string;
        icon: string;
    }[];
    workflows_title?: string;
    workflows_data?: {
        role: string;
        steps: {
            step: number;
            title: string;
            description: string;
        }[];
    }[];
    why_choose_title?: string;
    why_choose_subtitle?: string;
    why_choose_features?: {
        title: string;
        description: string;
        icon: string;
    }[];
    success_stories_title?: string;
    success_stories_subtitle?: string;
}

interface Posting {
    posting_id: number;
    title: string;
    type: string;
    industry: string;
    location: string;
    description?: string;
    salary_range?: string;
    work_type?: string;
    experience_level?: string;
    start_date?: string;
    end_date?: string;
    application_deadline?: string;
    company?: {
        company_id: number;
        name: string;
        logo?: string;
    };
}

interface Company {
    company_id: number;
    name: string;
    industry: string | null;
    location: string | null;
    logo: string | null;
    website: string | null;
    description: string | null;
}

interface Stats {
    companies: number;
    company_admins: number;
    students: number;
    postings: number;
    departments: number;
    dept_heads: number;
    advisors: number;
    supervisors: number;
}

interface Props extends SharedData {
    homeContent: HomeContent | null;
    postings: Posting[];
    companies: Company[];
    stats: Stats;
}

// Add: ParallaxEffect component for hero section background layering
function ParallaxEffect({children}: {children: React.ReactNode}) {
  const ref = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    if (ref.current) {
      ref.current.style.setProperty('--parallax-x', `${x*30}px`);
      ref.current.style.setProperty('--parallax-y', `${y*30}px`);
    }
  };

  return (
    <div
      ref={ref}
      className="relative"
      style={{
        perspective: '1200px',
        '--parallax-x': '0px',
        '--parallax-y': '0px',
      } as React.CSSProperties}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (ref.current) {
          ref.current.style.setProperty('--parallax-x', '0px');
          ref.current.style.setProperty('--parallax-y', '0px');
        }
      }}
    >
      <div style={{
        transform: `rotateY(var(--parallax-x)) rotateX(var(--parallax-y)) scale(1.03)`,
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {children}
      </div>
    </div>
  );
}

// Animated Counter Component - counts up when in viewport
function AnimatedCounter({ 
  value, 
  duration = 2000, 
  className = '' 
}: { 
  value: number | string; 
  duration?: number; 
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  
  // Parse the value - extract number and suffix (like "100+" or "50K")
  const parseValue = (val: number | string): { num: number; suffix: string; prefix: string } => {
    if (typeof val === 'number') return { num: val, suffix: '', prefix: '' };
    const str = String(val);
    const match = str.match(/^([^\d]*)(\d+)(.*)$/);
    if (match) {
      return { prefix: match[1] || '', num: parseInt(match[2], 10), suffix: match[3] || '' };
    }
    return { num: 0, suffix: str, prefix: '' };
  };
  
  const { num: targetNum, suffix, prefix } = parseValue(value);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            
            const startTime = performance.now();
            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const currentCount = Math.floor(progress * targetNum);
              setCount(currentCount);
              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };
            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.1 }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, [hasAnimated, targetNum, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  );
}

// Role selection moved to Help Overview per request

// Scroll animations - observe multiple animation types

export default function Welcome(props: Props) {
    useEffect(() => {
            const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );
        
        // Observe all animation types
        const animatableElements = document.querySelectorAll('[data-animate], [data-animate-left], [data-animate-right], [data-animate-scale]');
        animatableElements?.forEach((el) => observer.observe(el));
        
        return () => observer.disconnect();
    }, []);

    // Header scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 50);
            setShowBackToTop(scrollTop > 300);
            setScrollProgress((scrollTop / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // State for modals and UI
    const [showOverviewModal, setShowOverviewModal] = useState(false);
    const [showRulesModal, setShowRulesModal] = useState(false);
    const [showDevelopersModal, setShowDevelopersModal] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedLocation, setSelectedLocation] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(9);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [displayImages, setDisplayImages] = useState<string[]>([]);
    const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set());

    // Extract props
    const { homeContent, postings, companies, stats } = props;
    const auth = usePage().props.auth as SharedData['auth'];

    // Set display images from props
    useEffect(() => {
        if (homeContent?.carousel_images) {
            setDisplayImages(homeContent.carousel_images);
        }
    }, [homeContent?.carousel_images]);

    // Auto-advance carousel every 5 seconds
    useEffect(() => {
        if (displayImages.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % displayImages.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [displayImages.length]);

    // Carousel texts
    const carouselTexts = [
        homeContent?.description || 'The ultimate platform for internships and career opportunities.',
        'Connect with top companies and gain real-world experience.',
        'Build your career with personalized mentorship and guidance.',
        'Transform your academic journey into professional success.'
    ];

    return (
        <>
            <Head title="Welcome to AUHHC ICMS">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
                <style>{`
                    html {
                        scroll-behavior: smooth;
                    }
                    @keyframes fadeInUp {
                                             from {
                                                 opacity: 0;
                                                 transform: translateY(30px);
                                             }
                                             to {
                                                 opacity: 1;
                                                 transform: translateY(0);
                                             }
                                         }
                    
                                         @keyframes slideInLeft {
                                             from {
                                                 opacity: 0;
                                                 transform: translateX(-30px);
                                             }
                                             to {
                                                 opacity: 1;
                                                 transform: translateX(0);
                                             }
                                         }
                    
                                         @keyframes slideInRight {
                                             from {
                                                 opacity: 0;
                                                 transform: translateX(30px);
                                             }
                                             to {
                                                 opacity: 1;
                                                 transform: translateX(0);
                                             }
                                         }
                    
                                         @keyframes pulse {
                                             0%, 100% {
                                                 transform: scale(1);
                                             }
                                             50% {
                                                 transform: scale(1.05);
                                             }
                                         }
                    
                                         @keyframes float {
                                             0%, 100% {
                                                 transform: translateY(0px) rotate(0deg);
                                             }
                                             25% {
                                                 transform: translateY(-10px) rotate(1deg);
                                             }
                                             50% {
                                                 transform: translateY(-20px) rotate(0deg);
                                             }
                                             75% {
                                                 transform: translateY(-10px) rotate(-1deg);
                                             }
                                         }
                    
                                         @keyframes glow {
                                             0%, 100% {
                                                 box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
                                             }
                                             50% {
                                                 box-shadow: 0 0 40px rgba(99, 102, 241, 0.6), 0 0 60px rgba(139, 92, 246, 0.4);
                                             }
                                         }
                    
                                         @keyframes shimmer {
                                             0% {
                                                 background-position: -200% 0;
                                             }
                                             100% {
                                                 background-position: 200% 0;
                                             }
                                         }
                    
                                         @keyframes bounceIn {
                                             0% {
                                                 opacity: 0;
                                                 transform: scale(0.3) translateY(50px);
                                             }
                                             50% {
                                                 opacity: 1;
                                                 transform: scale(1.05) translateY(-10px);
                                             }
                                             70% {
                                                 transform: scale(0.9) translateY(5px);
                                             }
                                             100% {
                                                 opacity: 1;
                                                 transform: scale(1) translateY(0);
                                             }
                                         }
                    
                                         @keyframes rotate {
                                             from {
                                                 transform: rotate(0deg);
                                             }
                                             to {
                                                 transform: rotate(360deg);
                                             }
                                         }
                    
                                         @keyframes scalePulse {
                                             0%, 100% {
                                                 transform: scale(1);
                                             }
                                             50% {
                                                 transform: scale(1.1);
                                             }
                                         }
                    
                                         @keyframes textGlow {
                                                                  0%, 100% {
                                                                      text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                                                                  }
                                                                  50% {
                                                                      text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(99, 102, 241, 0.6);
                                                                  }
                                                              }
                    
                                         @keyframes typing {
                                             from { width: 0; }
                                             to { width: 100%; }
                                         }
                    
                                         @keyframes blink {
                                             50% { border-color: transparent; }
                                         }
                    
                                         .typing-effect {
                                             overflow: hidden;
                                             border-right: 2px solid #00ff41;
                                             white-space: nowrap;
                                             animation: typing 3s steps(40, end), blink 1s infinite;
                                             font-family: 'Courier New', monospace;
                                             color: #00ff41;
                                             text-shadow: 0 0 10px #00ff41;
                                         }
                    
                                         @keyframes particleFloat {
                                             0%, 100% {
                                                 transform: translateY(0px) rotate(0deg);
                                                 opacity: 0.7;
                                             }
                                             25% {
                                                 transform: translateY(-20px) rotate(90deg);
                                                 opacity: 1;
                                             }
                                             50% {
                                                 transform: translateY(-40px) rotate(180deg);
                                                 opacity: 0.8;
                                             }
                                             75% {
                                                 transform: translateY(-20px) rotate(270deg);
                                                 opacity: 0.9;
                                             }
                                         }
                    
                                         .particle {
                                             position: absolute;
                                             width: 4px;
                                             height: 4px;
                                             background: linear-gradient(45deg, #00ff41, #008f11);
                                             border-radius: 50%;
                                             animation: particleFloat 4s ease-in-out infinite;
                                             box-shadow: 0 0 6px #00ff41;
                                         }
                    
                    .animate-fade-in-up {
                        animation: fadeInUp 0.6s ease-out;
                    }

                    .animate-slide-in-left {
                        animation: slideInLeft 0.6s ease-out;
                    }

                    .animate-slide-in-right {
                        animation: slideInRight 0.6s ease-out;
                    }

                    .animate-pulse-slow {
                        animation: pulse 2s ease-in-out infinite;
                    }

                    .animate-float {
                        animation: float 6s ease-in-out infinite;
                    }

                    .animate-glow {
                        animation: glow 3s ease-in-out infinite;
                    }

                    .animate-shimmer {
                        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                        background-size: 200% 100%;
                        animation: shimmer 2s infinite;
                    }

                    .animate-bounce-in {
                        animation: bounceIn 0.8s ease-out;
                    }

                    .animate-rotate {
                        animation: rotate 20s linear infinite;
                    }

                    .animate-scale-pulse {
                        animation: scalePulse 2s ease-in-out infinite;
                    }

                    .animate-text-glow {
                        animation: textGlow 2s ease-in-out infinite;
                    }

                    /* Performance optimizations */
                    .gpu-accelerated {
                        transform: translateZ(0);
                        backface-visibility: hidden;
                        perspective: 1000px;
                    }

                    .will-change-transform {
                        will-change: transform;
                    }

                    .will-change-opacity {
                        will-change: opacity;
                    }

                    /* Reduce motion for users who prefer it */
                    @media (prefers-reduced-motion: reduce) {
                        .animate-float,
                        .animate-bounce-in,
                        .animate-fade-in-up,
                        .animate-shimmer,
                        .animate-glow,
                        .animate-text-glow,
                        .animate-scale-pulse,
                        .animate-rotate,
                        .matrix-rain,
                        .particle,
                        .typing-effect,
                        .glitch-text {
                            animation: none !important;
                        }

                        .hover-lift:hover,
                        .interactive-card:hover,
                        .cyber-button:hover {
                            transform: none !important;
                        }
                    }

                    @keyframes matrixRain {
                        0% {
                            transform: translateY(-100vh);
                            opacity: 1;
                        }
                        100% {
                            transform: translateY(100vh);
                            opacity: 0;
                        }
                    }

                    .matrix-rain {
                        position: absolute;
                        color: #00ff41;
                        font-family: 'Courier New', monospace;
                        font-size: 14px;
                        font-weight: bold;
                        animation: matrixRain 3s linear infinite;
                        text-shadow: 0 0 10px #00ff41;
                    }

                    .code-snippet {
                        background: rgba(0, 0, 0, 0.9);
                        border: 1px solid #00ff41;
                        border-radius: 8px;
                        padding: 16px;
                        font-family: 'Fira Code', 'Courier New', monospace;
                        font-size: 12px;
                        color: #00ff41;
                        box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
                        position: relative;
                        overflow: hidden;
                    }

                    .code-snippet::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(0, 255, 65, 0.1), transparent);
                        animation: codeScan 2s infinite;
                    }

                    @keyframes codeScan {
                        0% { left: -100%; }
                        100% { left: 100%; }
                    }

                    .terminal-window {
                        background: #1a1a1a;
                        border: 2px solid #333;
                        border-radius: 8px;
                        padding: 20px;
                        font-family: 'Fira Code', 'Courier New', monospace;
                        color: #00ff41;
                        box-shadow: 0 0 30px rgba(0, 255, 65, 0.2);
                        position: relative;
                    }

                    .terminal-header {
                        background: #333;
                        padding: 8px 12px;
                        border-radius: 6px 6px 0 0;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin: -20px -20px 20px -20px;
                    }

                    .terminal-button {
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        display: inline-block;
                    }

                    .terminal-button.red { background: #ff5f57; }
                    .terminal-button.yellow { background: #ffbd2e; }
                    .terminal-button.green { background: #28ca42; }

                    .typing-cursor {
                        animation: blink 1s infinite;
                    }

                    @keyframes blink {
                        0%, 50% { opacity: 1; }
                        51%, 100% { opacity: 0; }
                    }

                    .neon-glow {
                        text-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor;
                        animation: neonPulse 2s ease-in-out infinite alternate;
                    }

                    @keyframes neonPulse {
                        from { text-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor; }
                        to { text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor, 0 0 40px currentColor; }
                    }

                    .hover-lift {
                        transition: all 0.3s ease;
                    }

                    .hover-lift:hover {
                        transform: translateY(-8px);
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    }

                    .hover-glow:hover {
                        animation: glow 1s ease-in-out infinite;
                    }

                    .hover-float:hover {
                        animation: float 3s ease-in-out infinite;
                    }

                    .interactive-card {
                        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        cursor: pointer;
                        position: relative;
                        overflow: hidden;
                    }

                    .interactive-card::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                        transition: left 0.5s;
                    }

                    .interactive-card:hover::before {
                        left: 100%;
                    }

                    .interactive-card:hover {
                        transform: translateY(-12px) scale(1.02);
                        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 0 30px rgba(99, 102, 241, 0.3);
                    }

                    .cyber-button {
                        position: relative;
                        overflow: hidden;
                        border: 2px solid transparent;
                        background: linear-gradient(45deg, #667eea, #764ba2);
                        transition: all 0.3s ease;
                    }

                    .cyber-button::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                        transition: left 0.5s;
                    }

                    .cyber-button:hover::before {
                        left: 100%;
                    }

                    .cyber-button:hover {
                        box-shadow: 0 0 20px rgba(102, 126, 234, 0.5), 0 0 40px rgba(118, 75, 162, 0.3);
                        transform: translateY(-2px);
                    }

                    .glitch-text {
                        position: relative;
                        animation: glitch 2s infinite;
                    }

                    @keyframes glitch {
                        0%, 100% { transform: translate(0); }
                        20% { transform: translate(-2px, 2px); }
                        40% { transform: translate(-2px, -2px); }
                        60% { transform: translate(2px, 2px); }
                        80% { transform: translate(2px, -2px); }
                    }

                    .glitch-text::before,
                    .glitch-text::after {
                        content: attr(data-text);
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                    }

                    .glitch-text::before {
                        animation: glitch 0.5s infinite;
                        color: #ff0000;
                        z-index: -1;
                    }

                    .glitch-text::after {
                        animation: glitch 0.5s infinite reverse;
                        color: #00ffff;
                        z-index: -2;
                    }

                    .gradient-text {
                        background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    }

                    .glass-effect {
                        backdrop-filter: blur(10px);
                        background: rgba(255, 255, 255, 0.1);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                    }

                    .neon-border {
                        box-shadow: 0 0 10px rgba(99, 102, 241, 0.5), inset 0 0 10px rgba(99, 102, 241, 0.1);
                    }
                `}</style>
            </Head>
            <div className="min-h-screen text-gray-900 dark:text-gray-100" style={{ backgroundColor: homeContent?.background_color || undefined }}>
                {/* Header with Top Bar */}
                <header className={`w-full bg-white/90 backdrop-blur-md dark:bg-gray-800/90 shadow-sm sticky top-0 z-20 transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
                    {/* Top Bar - Hidden when scrolled */}
                    <div className={`w-full bg-gray-100 dark:bg-gray-700 px-4 flex items-center justify-between text-sm transition-all duration-300 ${isScrolled ? 'py-0 h-0 overflow-hidden' : 'py-2'}`}>
                        <div className="flex items-center gap-6">
                            {homeContent?.phone && (
                                <div className="flex items-center gap-1">
                                    <Phone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    <span>{homeContent.phone}</span>
                                </div>
                            )}
                            {homeContent?.email && (
                                <div className="flex items-center gap-1">
                                    <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    <a href={`mailto:${homeContent.email}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">{homeContent.email}</a>
                                </div>
                            )}
                            {homeContent?.location && (
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(homeContent.location)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                    title={`View ${homeContent.location} on Google Maps`}
                                >
                                    <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    <span>{homeContent.location}</span>
                                </a>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            {homeContent?.social_media && Array.isArray(homeContent.social_media) && homeContent.social_media.map((social, index) => (
                                <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                    {social.platform === 'facebook' && <Facebook className="h-5 w-5" />}
                                    {social.platform === 'twitter' && <Twitter className="h-5 w-5" />}
                                    {social.platform === 'instagram' && <Instagram className="h-5 w-5" />}
                                    {social.platform === 'linkedin' && <Linkedin className="h-5 w-5" />}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Scroll Progress Bar */}
                    <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-150" style={{ width: `${scrollProgress}%` }} />

                    {/* Main Navigation */}
                    <div className={`max-w-7xl mx-auto px-4 flex items-center justify-between transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'} ${homeContent?.header_height || 'h-16'}`}>
                        <div className="flex items-center gap-3">
                            {homeContent?.logo ? (
                                <img 
                                    src={getImageUrl(homeContent.logo)} 
                                    alt="Logo" 
                                    className={`rounded transition-all duration-300 ${isScrolled ? 'h-16 w-16' : 'h-20 w-20'}`} 
                                />
                            ) : (
                                <Briefcase className={`text-indigo-600 dark:text-indigo-400 transition-all duration-300 ${isScrolled ? 'h-16 w-16' : 'h-20 w-20'}`} aria-hidden="true" />
                            )}
                        </div>
                        <nav className={`hidden md:flex items-center transition-all duration-300 ${isScrolled ? 'gap-4' : 'gap-8'}`}>
                            <a href="#home" className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</a>
                            
                            {/* About Us Dropdown */}
                            <div className="relative group">
                                <button className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center">
                                    {homeContent?.about_us_button_text || 'About Us'}
                                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="py-2">
                                        <a href="#about" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                            About Us
                                        </a>
                                        <a href="#our-story" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                            Our Story
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Help Dropdown */}
                            <div className="relative group">
                                <button className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center">
                                    Help
                                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="py-2">
                                        <Link
                                            href="/help/overview"
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Overview
                                        </Link>
                                        <Link
                                            href="/help/rules"
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Rules
                                        </Link>
                                        <Link
                                            href="/help/contact"
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Contact Developers
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <a href="#latest-internship-opportunities" className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                {homeContent?.postings_button_text || 'Postings'}
                            </a>
                            {auth.user ? (
                                <Button
                                    asChild
                                    variant="outline"
                                    className={`border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-full transition-colors duration-200 ${isScrolled ? 'px-4 py-2 text-sm' : 'px-6'}`}
                                >
                                    <Link href={route('dashboard')}>
                                        Dashboard
                                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        asChild
                                        variant="ghost"
                                        className={`text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-800 rounded-full transition-colors duration-200 ${isScrolled ? 'px-3 py-2 text-sm' : 'px-5'}`}
                                    >
                                        <Link href={route('login')}>
                                            {homeContent?.login_button_text || 'Login'}
                                            <LogIn className="ml-2 h-4 w-4" aria-hidden="true" />
                                        </Link>
                                    </Button>
                                </>
                            )}
                            <div className="ml-4">
                                <AppearanceDropdown />
                            </div>
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <ParallaxEffect>
                    <section id="home" className="relative min-h-[90vh] flex items-center overflow-hidden">
                        {/* Animated Background */}
                        <div className="absolute inset-0">
                            {/* Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900"></div>

                            {/* Animated Shapes */}
                            <div className="absolute inset-0">
                                <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
                                <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
                                <div className="absolute top-10 right-20 w-24 h-24 bg-pink-500/20 rounded-full blur-2xl animate-bounce-in" style={{ animationDelay: '0.5s' }}></div>
                                <div className="absolute bottom-10 left-20 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
                                <div className="absolute top-1/4 right-1/4 w-20 h-20 bg-yellow-500/20 rounded-full blur-2xl animate-scale-pulse" style={{ animationDelay: '3s' }}></div>
                                <div className="absolute bottom-1/4 left-1/4 w-28 h-28 bg-green-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
                                <div className="absolute top-3/4 right-1/3 w-16 h-16 bg-red-500/20 rounded-full blur-xl animate-rotate" style={{ animationDelay: '2.5s' }}></div>
                            </div>

                            {/* Background Carousel */}
                            <div className="absolute inset-0 bg-black/30">
                                {displayImages.length > 0 && failedIndices.size < displayImages.length && (
                                    displayImages.map((image: string, index: number) => (
                                        <img
                                            key={index}
                                            src={getImageUrl(image)}
                                            alt={`Slide ${index + 1}`}
                                            className={`absolute inset-0 w-full h-full object-${homeContent?.hero_image_fit || 'cover'} transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-60 scale-105' : 'opacity-0 scale-100'}`}
                                            onLoad={() => {}}
                                            onError={() => {
                                                setFailedIndices((prev) => new Set(prev).add(index));
                                            }}
                                        />
                                    ))
                                )}
                                {/* Fallback gradient if all images failed */}
                                {failedIndices.size >= displayImages.length && (
                                    <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center opacity-80">
                                        <div className="text-white text-center">
                                            <h2 className="text-6xl font-bold mb-4 animate-fade-in-up">Welcome to ICMS</h2>
                                            <p className="text-2xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>Internship and Career Management System</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-float"></div>
                                <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-white/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
                                <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-white/40 rounded-full animate-scale-pulse" style={{ animationDelay: '2s' }}></div>
                                <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white/25 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
                                <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-yellow-300/40 rounded-full animate-bounce-in" style={{ animationDelay: '3s' }}></div>
                                <div className="absolute bottom-1/3 left-2/3 w-2.5 h-2.5 bg-blue-300/30 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
                                <div className="absolute top-2/3 right-1/2 w-1 h-1 bg-purple-300/50 rounded-full animate-scale-pulse" style={{ animationDelay: '1.5s' }}></div>
                            </div>

                            {/* Particle Field Animation */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                {/* Grid of animated particles */}
                                {Array.from({ length: 50 }).map((_, i) => (
                                    <div
                                        key={`particle-${i}`}
                                        className="absolute rounded-full particle-dot"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`,
                                            width: `${2 + Math.random() * 4}px`,
                                            height: `${2 + Math.random() * 4}px`,
                                            backgroundColor: ['rgba(255,255,255,0.3)', 'rgba(147,197,253,0.4)', 'rgba(196,181,253,0.4)', 'rgba(252,211,77,0.3)'][Math.floor(Math.random() * 4)],
                                            animationDelay: `${Math.random() * 5}s`,
                                            animationDuration: `${10 + Math.random() * 20}s`,
                                        }}
                                    />
                                ))}
                                
                                {/* Connecting lines effect */}
                                <svg className="absolute inset-0 w-full h-full opacity-10">
                                    <defs>
                                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#818cf8" />
                                            <stop offset="100%" stopColor="#c084fc" />
                                        </linearGradient>
                                    </defs>
                                    {Array.from({ length: 15 }).map((_, i) => (
                                        <line
                                            key={`line-${i}`}
                                            x1={`${10 + Math.random() * 80}%`}
                                            y1={`${10 + Math.random() * 80}%`}
                                            x2={`${10 + Math.random() * 80}%`}
                                            y2={`${10 + Math.random() * 80}%`}
                                            stroke="url(#lineGradient)"
                                            strokeWidth="1"
                                            className="animate-pulse"
                                            style={{ animationDelay: `${i * 0.3}s` }}
                                        />
                                    ))}
                                </svg>
                            </div>

                            {/* Scroll indicator */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
                                <span className="text-white/60 text-sm font-medium">Scroll to explore</span>
                                <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center p-2">
                                    <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-scroll-indicator"></div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="relative z-10 max-w-7xl mx-auto px-4 py-32 text-center text-white">
                            {/* Main Heading with Animation */}
                            <div className="animate-bounce-in gpu-accelerated will-change-transform">
                                <h1 className="text-6xl lg:text-8xl font-black mb-8 tracking-tight drop-shadow-2xl bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent animate-text-glow hover-float neon-glow">
                                    {homeContent?.title || 'Discover Your Future with AUHHC ICMS'}
                                </h1>
                                <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto mb-8 animate-shimmer"></div>
                            </div>

                            {/* Floating Code Snippets */}
                            <div className="absolute top-20 left-10 opacity-30 animate-float gpu-accelerated will-change-transform" style={{ animationDelay: '1s' }}>
                                <div className="code-snippet text-xs">
                                    <div className="text-green-400">const future = await AUHHC_ICMS.connect();</div>
                                    <div className="text-blue-400">{'future.then(success => console.log(\'🚀\'));'};</div>
                                </div>
                            </div>

                            <div className="absolute top-40 right-20 opacity-25 animate-float gpu-accelerated will-change-transform" style={{ animationDelay: '2s' }}>
                                <div className="code-snippet text-xs">
                                    <div className="text-purple-400">function innovate() {'{'}</div>
                                    <div className="text-cyan-400">  return "career growth";</div>
                                    <div className="text-purple-400">{'}'}</div>
                                </div>
                            </div>

                            <div className="absolute bottom-32 left-16 opacity-20 animate-float gpu-accelerated will-change-transform" style={{ animationDelay: '3s' }}>
                                <div className="code-snippet text-xs">
                                    <div className="text-yellow-400">while(dreaming) {'{'}</div>
                                    <div className="text-red-400">  buildFuture();</div>
                                    <div className="text-yellow-400">{'}'}</div>
                                </div>
                            </div>

                            {/* Subtitle with Animation */}
                            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                <p className="text-2xl lg:text-3xl mb-8 max-w-4xl mx-auto opacity-95 font-light leading-relaxed">
                                    {carouselTexts[currentSlide] || homeContent?.description || 'The ultimate platform for internships and career opportunities.'}
                                </p>
                            </div>

                            {/* Additional Subtitle */}
                            {homeContent?.hero_subtitle && (
                                <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                                    <p className="text-xl lg:text-2xl mb-12 max-w-3xl mx-auto opacity-85 font-medium">
                                        {homeContent.hero_subtitle}
                                    </p>
                                </div>
                            )}

                            {/* Typing Effect */}
                            <div className="animate-fade-in-up mb-8" style={{ animationDelay: '0.5s' }}>
                                <div className="text-center">
                                    <div className="inline-block bg-black/80 px-6 py-3 rounded-lg border border-green-500/50">
                                        <span className="typing-effect text-lg">
                                            Connecting Dreams to Reality...
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Particle Effects */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden gpu-accelerated">
                                {Array.from({ length: 15 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="particle will-change-transform"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`,
                                            animationDelay: `${Math.random() * 4}s`,
                                            animationDuration: `${3 + Math.random() * 2}s`
                                        }}
                                    />
                                ))}
                            </div>

                            {/* CTA Buttons */}
                            <div className="animate-bounce-in flex flex-col sm:flex-row gap-6 justify-center items-center mb-12" style={{ animationDelay: '0.6s' }}>
                                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-full text-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 border-0 animate-glow hover-glow glass-effect neon-glow">
                                    <Link href={route('login')} className="flex items-center">
                                        <Code className="mr-3 h-6 w-6 animate-pulse" />
                                        Get Started Today
                                        <ArrowRight className="ml-3 h-6 w-6 animate-float" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-10 py-4 rounded-full text-xl font-semibold transition-all duration-300 transform hover:scale-105 animate-shimmer neon-border">
                                    <Link href="#about" className="flex items-center">
                                        <Terminal className="mr-3 h-6 w-6 animate-pulse" />
                                        Learn More
                                        <Zap className="ml-2 h-6 w-6 animate-bounce-in" />
                                    </Link>
                                </Button>
                            </div>

                            {/* Terminal Window */}
                            <div className="absolute bottom-20 right-10 opacity-40 animate-float gpu-accelerated will-change-transform" style={{ animationDelay: '4s' }}>
                                <div className="terminal-window text-xs w-64">
                                    <div className="terminal-header">
                                        <div className="terminal-button red"></div>
                                        <div className="terminal-button yellow"></div>
                                        <div className="terminal-button green"></div>
                                        <span className="text-gray-300 text-xs ml-2">AUHHC ICMS Terminal</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div><span className="text-green-400">$</span> icms init --future</div>
                                        <div className="text-cyan-400">Initializing career matrix...</div>
                                        <div className="text-yellow-400">Connecting to opportunity network...</div>
                                        <div className="text-green-400">✓ Success! Ready to innovate.</div>
                                        <div><span className="text-green-400">$</span> <span className="typing-cursor">_</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Carousel Indicators */}
                            {displayImages.length > 1 && (
                                <div className="animate-fade-in-up flex justify-center gap-3" style={{ animationDelay: '0.8s' }}>
                                    {displayImages.map((_img: string, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentSlide(index)}
                                            className={`w-4 h-4 rounded-full ring-2 ring-white/50 transition-all duration-300 hover:scale-125 ${
                                                index === currentSlide
                                                    ? 'bg-white shadow-lg shadow-white/50 scale-125'
                                                    : 'bg-white/30 hover:bg-white/50'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Scroll Indicator */}
                            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                                <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                                    <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </section>
                </ParallaxEffect>

                {/* About Section */}
                {homeContent?.about_title && (
                    <section id="about" className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
                        {/* Background decoration - Colored Geometric Shapes */}
                        <div className="absolute inset-0">
                            {/* Floating Circles */}
                            <div className="absolute top-16 left-16 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-15 animate-float"></div>
                            <div className="absolute top-32 right-24 w-20 h-20 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full opacity-20 animate-float" style={{ animationDelay: '1.2s' }}></div>
                            <div className="absolute bottom-24 left-1/3 w-24 h-24 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full opacity-15 animate-float" style={{ animationDelay: '2.4s' }}></div>
                            <div className="absolute bottom-16 right-1/4 w-28 h-28 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-10 animate-float" style={{ animationDelay: '0.8s' }}></div>

                            {/* Rectangles and Squares */}
                            <div className="absolute top-1/4 right-16 w-16 h-40 bg-gradient-to-b from-emerald-400 to-green-500 rounded-lg opacity-15 animate-float" style={{ animationDelay: '1.8s' }}></div>
                            <div className="absolute bottom-1/4 left-24 w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg opacity-20 animate-float" style={{ animationDelay: '3s' }}></div>
                            <div className="absolute top-3/4 right-1/3 w-24 h-16 bg-gradient-to-r from-violet-400 to-purple-500 rounded-lg opacity-15 animate-float" style={{ animationDelay: '1.5s' }}></div>

                            {/* Triangles */}
                            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 opacity-15 animate-float" style={{ animationDelay: '2.8s', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                            <div className="absolute bottom-1/3 right-1/2 w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 opacity-20 animate-float" style={{ animationDelay: '2.1s', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>

                            {/* Hexagons */}
                            <div className="absolute top-2/3 left-20 w-22 h-22 bg-gradient-to-br from-indigo-400 to-blue-500 opacity-15 animate-float" style={{ animationDelay: '3.5s', clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }}></div>
                            <div className="absolute bottom-2/3 right-24 w-18 h-18 bg-gradient-to-br from-rose-400 to-pink-500 opacity-20 animate-float" style={{ animationDelay: '0.6s', clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }}></div>
                        </div>

                        <div className="max-w-7xl mx-auto px-4 relative z-10">
                            {/* Hero About Section */}
                            <ScrollReveal animation="fadeInUp" className="text-center mb-20">
                                <h2 className="text-5xl font-bold text-gray-900 mb-8 animate-text-glow">
                                    {homeContent.about_title || 'About AUHHC ICMS'}
                                </h2>
                                <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mx-auto mb-8"></div>
                                <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                                    {homeContent.about_description || 'AUHHC ICMS is a mission-oriented organization that helps connect great talent with great companies through comprehensive internship management.'}
                                </p>
                            </ScrollReveal>

                            {/* About Image Section */}
                            {homeContent?.inline_image && (
                                <ScrollReveal animation="scaleIn" delay={200} className="mb-20">
                                    <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                                        <img 
                                            src={getImageUrl(homeContent.inline_image)} 
                                            alt="About AUHHC ICMS"
                                            loading="lazy" 
                                            className="w-full h-[500px] object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                        <div className="absolute bottom-8 left-8 right-8 text-white">
                                            <h3 className="text-3xl font-bold mb-4">Connecting Talent with Opportunity</h3>
                                            <p className="text-lg opacity-90">{homeContent?.about_image_text || 'Building bridges between students and companies for meaningful career experiences'}</p>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            )}

                            {/* Our Story Section */}
                            <div id="our-story" className="mb-20">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                    <ScrollReveal animation="fadeInLeft" className="space-y-8">
                                        <div>
                                            <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">Our Story</h3>
                                            <div className="w-20 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-8"></div>
                                        </div>
                                        {homeContent?.our_story_image && (
                                            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                                                <img 
                                                    src={getImageUrl(homeContent.our_story_image)} 
                                                    alt="Our Story"
                                                    loading="lazy" 
                                                    className="w-full h-auto object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-6">
                                            {homeContent?.our_story_text ? (
                                                <div className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                                    {homeContent.our_story_text}
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                                                        Like the pioneers of education, we know that knowledge and ability go beyond what one memorizes in the classroom - teamwork, grit, ambition, and other core skills cannot be understood from a resume or transcript. We also know that fit can only truly be understood once a company and an individual work together.
                                                    </p>
                                                    <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                                                        AUHHC ICMS is not a replacement for traditional internships or a substitute for full-time roles. Rather, AUHHC ICMS complements these efforts with its network of skilled talent who want to help address immediate resource needs while launching their careers.
                                                    </p>
                                                    <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                                                        And AUHHC ICMS loves if a project leads to a full-time professional opportunity. Unlike other organizations, we love it so much that we do not charge any fees if this occurs.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </ScrollReveal>
                                    <ScrollReveal animation="fadeInRight" delay={200} className="relative">
                                        <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden">
                                            <div className="absolute inset-0 bg-black/10"></div>
                                            <div className="relative z-10">
                                                <h4 className="text-2xl font-bold mb-6">Our Mission</h4>
                                                <p className="text-lg leading-relaxed mb-6">
                                                    {homeContent?.our_mission || 'To bridge the gap between academic learning and professional success by connecting talented students with meaningful internship opportunities.'}
                                                </p>
                                                <h4 className="text-2xl font-bold mb-6">Our Vision</h4>
                                                <p className="text-lg leading-relaxed">
                                                    {homeContent?.our_vision || 'To create a world where every student has access to quality internship experiences that launch their careers.'}
                                                </p>
                                            </div>
                                        </div>
                                    </ScrollReveal>
                                </div>
                            </div>

                            {/* Statistics Section - Our Impact in Numbers */}
                            <ScrollReveal animation="scaleIn" className="mb-20">
                                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-3xl p-12 text-white">
                                    {/* Animated background pattern */}
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
                                    </div>

                                    <div className="relative z-10">
                                        <div className="text-center mb-12">
                                            <h3 className="text-4xl lg:text-5xl font-bold mb-4 text-white">Our Impact in Numbers</h3>
                                            <div className="w-24 h-1 bg-white/50 rounded-full mx-auto mb-6"></div>
                                            <p className="text-lg lg:text-xl opacity-90 max-w-2xl mx-auto text-white/80">
                                                Real-time statistics showcasing the growth and success of our internship management platform
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-6 lg:gap-8">
                                            {homeContent?.statistics && homeContent.statistics.length > 0 ? (
                                                homeContent.statistics.map((stat: { value: string; label: string }, index: number) => (
                                                    <div key={index} className="text-center group">
                                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 lg:p-6 flex flex-col justify-center items-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl min-h-[120px] w-full border border-white/20">
                                                            <div className="text-3xl lg:text-5xl font-bold mb-2 group-hover:text-yellow-300 transition-colors duration-300 leading-tight text-white">
                                                                <AnimatedCounter value={stat.value} duration={2000} />
                                                            </div>
                                                            <div className="text-sm lg:text-base opacity-90 font-medium leading-tight px-2 text-white break-words text-center">{stat.label}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <>
                                                    <div className="text-center group">
                                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 lg:p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl min-h-[120px] flex flex-col justify-center border border-white/20">
                                                            <div className="text-3xl lg:text-5xl font-bold mb-2 group-hover:text-yellow-300 transition-colors duration-300 text-white">
                                                                <AnimatedCounter value={stats?.companies || 0} duration={2000} />
                                                            </div>
                                                            <div className="text-sm lg:text-base opacity-90 font-medium px-2 text-white break-words text-center">Partner Companies</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-center group">
                                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 lg:p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl min-h-[120px] flex flex-col justify-center border border-white/20">
                                                            <div className="text-3xl lg:text-5xl font-bold mb-2 group-hover:text-yellow-300 transition-colors duration-300 text-white">
                                                                <AnimatedCounter value={stats?.company_admins || 0} duration={2000} />
                                                            </div>
                                                            <div className="text-sm lg:text-base opacity-90 font-medium px-2 text-white break-words text-center">Company Admins</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-center group">
                                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 lg:p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl min-h-[120px] flex flex-col justify-center border border-white/20">
                                                            <div className="text-3xl lg:text-5xl font-bold mb-2 group-hover:text-yellow-300 transition-colors duration-300 text-white">
                                                                <AnimatedCounter value={stats?.students || 0} duration={2000} />
                                                            </div>
                                                            <div className="text-sm lg:text-base opacity-90 font-medium px-2 text-white break-words text-center">Students</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-center group">
                                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 lg:p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl min-h-[120px] flex flex-col justify-center border border-white/20">
                                                            <div className="text-3xl lg:text-5xl font-bold mb-2 group-hover:text-yellow-300 transition-colors duration-300 text-white">
                                                                <AnimatedCounter value={stats?.postings || 0} duration={2000} />
                                                            </div>
                                                            <div className="text-sm lg:text-base opacity-90 font-medium px-2 text-white break-words text-center">Open Postings</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-center group">
                                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 lg:p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl min-h-[120px] flex flex-col justify-center border border-white/20">
                                                            <div className="text-3xl lg:text-5xl font-bold mb-2 group-hover:text-yellow-300 transition-colors duration-300 text-white">
                                                                <AnimatedCounter value={stats?.departments || 0} duration={2000} />
                                                            </div>
                                                            <div className="text-sm lg:text-base opacity-90 font-medium px-2 text-white break-words text-center">Departments</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-center group">
                                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 lg:p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl min-h-[120px] flex flex-col justify-center border border-white/20">
                                                            <div className="text-3xl lg:text-5xl font-bold mb-2 group-hover:text-yellow-300 transition-colors duration-300 text-white">
                                                                <AnimatedCounter value={stats?.dept_heads || 0} duration={2000} />
                                                            </div>
                                                            <div className="text-sm lg:text-base opacity-90 font-medium px-2 text-white break-words text-center">Department Heads</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-center group">
                                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 lg:p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl min-h-[120px] flex flex-col justify-center border border-white/20">
                                                            <div className="text-3xl lg:text-5xl font-bold mb-2 group-hover:text-yellow-300 transition-colors duration-300 text-white">
                                                                <AnimatedCounter value={stats?.advisors || 0} duration={2000} />
                                                            </div>
                                                            <div className="text-sm lg:text-base opacity-90 font-medium px-2 text-white break-words text-center">Advisors</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-center group">
                                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 lg:p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl min-h-[120px] flex flex-col justify-center border border-white/20">
                                                            <div className="text-3xl lg:text-5xl font-bold mb-2 group-hover:text-yellow-300 transition-colors duration-300 text-white">
                                                                <AnimatedCounter value={stats?.supervisors || 0} duration={2000} />
                                                            </div>
                                                            <div className="text-sm lg:text-base opacity-90 font-medium px-2 text-white break-words text-center">Supervisors</div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Call to action */}
                                        <div className="text-center mt-12">
                                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                                <Button asChild className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
                                                    <Link href={route('login')}>
                                                        Get Started Today
                                                        <ArrowRight className="ml-2 h-5 w-5" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>

                            {/* Transforming University-to-Career Transitions Section */}
                            <ScrollReveal animation="fadeInUp" className="mb-20">
                                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl p-12 text-white relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black/10"></div>
                                    <div className="relative z-10 text-center">
                                        <h3 className="text-4xl font-bold mb-6">Transforming University-to-Career Transitions</h3>
                                        <div className="w-24 h-1 bg-white/50 rounded-full mx-auto mb-6"></div>
                                        <p className="text-xl leading-relaxed mb-8 max-w-4xl mx-auto">
                                            AUHHC ICMS revolutionizes the university-to-career transition by creating a seamless ecosystem that benefits all stakeholders: Companies, Universities, and Students.
                                        </p>
                                        <StaggeredReveal 
                                            animation="scaleIn" 
                                            staggerDelay={150}
                                            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
                                        >
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                    <Building2 className="h-8 w-8 text-white" />
                                                </div>
                                                <h4 className="text-lg font-semibold mb-2">For Companies</h4>
                                                <p className="text-sm opacity-90">Access to qualified talent and streamlined recruitment processes</p>
                                            </div>
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                    <GraduationCap className="h-8 w-8 text-white" />
                                                </div>
                                                <h4 className="text-lg font-semibold mb-2">For Students</h4>
                                                <p className="text-sm opacity-90">Real-world experience and career development opportunities</p>
                                            </div>
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                    <BookOpen className="h-8 w-8 text-white" />
                                                </div>
                                                <h4 className="text-lg font-semibold mb-2">For Universities</h4>
                                                <p className="text-sm opacity-90">Enhanced student outcomes and industry partnerships</p>
                                            </div>
                                        </StaggeredReveal>
                                    </div>
                                </div>
                            </ScrollReveal>

                            {/* Benefits */}
                            <div className="text-center">
                                <ScrollReveal animation="fadeInUp">
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">How ICMS Benefits Everyone</h3>
                                    <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mx-auto mb-8"></div>
                                </ScrollReveal>
                                <StaggeredReveal 
                                    animation="scaleIn" 
                                    staggerDelay={150}
                                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                                >
                                    <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                        <TrendingUp className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                                        <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">For Universities</h4>
                                        <p className="text-gray-600 dark:text-gray-300">Streamlined internship tracking, better student outcomes, and improved industry partnerships.</p>
                                    </div>
                                    <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                        <Award className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                                        <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">For Students</h4>
                                        <p className="text-gray-600 dark:text-gray-300">Easy access to opportunities, application tracking, and career development support.</p>
                                    </div>
                                    <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                        <Building className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                                        <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">For Companies</h4>
                                        <p className="text-gray-600 dark:text-gray-300">Efficient recruitment process, qualified candidates, and streamlined communication.</p>
                                    </div>
                                </StaggeredReveal>
                            </div>
                        </div>
                    </section>
                )}

                {/* Features Section */}
                <section className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
                    {/* Background decoration - Colored Geometric Shapes */}
                    <div className="absolute inset-0">
                        {/* Floating Circles */}
                        <div className="absolute top-20 left-20 w-30 h-30 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full opacity-15 animate-float"></div>
                        <div className="absolute top-28 right-28 w-22 h-22 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full opacity-20 animate-float" style={{ animationDelay: '1.4s' }}></div>
                        <div className="absolute bottom-24 left-1/5 w-26 h-26 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full opacity-15 animate-float" style={{ animationDelay: '2.8s' }}></div>
                        <div className="absolute bottom-20 right-1/5 w-32 h-32 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-10 animate-float" style={{ animationDelay: '1.1s' }}></div>

                        {/* Rectangles and Squares */}
                        <div className="absolute top-1/6 right-20 w-18 h-44 bg-gradient-to-b from-emerald-400 to-green-500 rounded-lg opacity-15 animate-float" style={{ animationDelay: '2.1s' }}></div>
                        <div className="absolute bottom-1/5 left-28 w-22 h-22 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg opacity-20 animate-float" style={{ animationDelay: '3.3s' }}></div>
                        <div className="absolute top-2/3 right-1/6 w-26 h-18 bg-gradient-to-r from-violet-400 to-purple-500 rounded-lg opacity-15 animate-float" style={{ animationDelay: '1.9s' }}></div>

                        {/* Triangles */}
                        <div className="absolute top-3/5 left-1/6 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 opacity-15 animate-float" style={{ animationDelay: '3.1s', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                        <div className="absolute bottom-1/5 right-3/5 w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 opacity-20 animate-float" style={{ animationDelay: '2.5s', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>

                        {/* Hexagons */}
                        <div className="absolute top-1/3 left-16 w-24 h-24 bg-gradient-to-br from-indigo-400 to-blue-500 opacity-15 animate-float" style={{ animationDelay: '3.9s', clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }}></div>
                        <div className="absolute bottom-2/5 right-28 w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 opacity-20 animate-float" style={{ animationDelay: '0.9s', clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }}></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 relative z-10">
                        {/* Trusted By Section */}
                        <div className="mb-20">
                            <ScrollReveal animation="fadeInUp" className="text-center mb-16">
                                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 animate-text-glow neon-glow">
                                    🤝 Our Partner Companies
                                </h2>
                                <div className="w-20 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mx-auto mb-8"></div>
                                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                    Trusted by leading companies across various industries to connect with exceptional talent
                                </p>

                                {/* Matrix Rain Effect */}
                                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
                                    {Array.from({ length: 20 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="matrix-rain absolute"
                                            style={{
                                                left: `${Math.random() * 100}%`,
                                                animationDelay: `${Math.random() * 3}s`,
                                                animationDuration: `${2 + Math.random() * 2}s`
                                            }}
                                        >
                                            {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
                                        </div>
                                    ))}
                                </div>
                            </ScrollReveal>

                            {companies && companies.length > 0 ? (
                                <div className="relative bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl py-8 overflow-hidden">
                                    {/* Gradient overlays for seamless fade */}
                                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 dark:from-gray-800 to-transparent z-10 pointer-events-none"></div>
                                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-blue-50 dark:from-gray-900 to-transparent z-10 pointer-events-none"></div>
                                    
                                    {/* First row - scrolls left */}
                                    <div className="marquee-container mb-6 group/marquee">
                                        <div className="marquee-content animate-marquee group-hover/marquee:[animation-play-state:paused]">
                                            {[...companies, ...companies, ...companies].map((company, index) => (
                                                <div key={`row1-${company.company_id}-${index}`} className="flex-shrink-0 mx-3 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 group min-w-[280px] transform hover:-translate-y-2 hover:scale-105">
                                                    <div className="flex items-center justify-center mb-4">
                                                        {company.logo ? (
                                                            <img
                                                                src={getImageUrl(company.logo)}
                                                                alt={`${company.name} logo`}
                                                                loading="lazy"
                                                                className="h-16 w-16 object-contain opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110"
                                                                onError={(e) => handleImageError(e)}
                                                            />
                                                        ) : (
                                                            <div className="h-16 w-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                                <Building className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-center">
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 line-clamp-1">{company.name}</h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 font-medium">{company.industry || 'Technology'}</p>
                                                        {company.location && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                <span className="line-clamp-1">{company.location}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                            <span>Active Partner</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Second row - scrolls right (reverse) */}
                                    {companies.length > 3 && (
                                        <div className="marquee-container group/marquee">
                                            <div className="marquee-content animate-marquee-reverse group-hover/marquee:[animation-play-state:paused]">
                                                {[...companies.slice().reverse(), ...companies.slice().reverse(), ...companies.slice().reverse()].map((company, index) => (
                                                    <div key={`row2-${company.company_id}-${index}`} className="flex-shrink-0 mx-3 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 group min-w-[280px] transform hover:-translate-y-2 hover:scale-105">
                                                        <div className="flex items-center justify-center mb-4">
                                                            {company.logo ? (
                                                                <img
                                                                    src={getImageUrl(company.logo)}
                                                                    alt={`${company.name} logo`}
                                                                    className="h-16 w-16 object-contain opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110"
                                                                    onError={(e) => handleImageError(e)}
                                                                />
                                                            ) : (
                                                                <div className="h-16 w-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                                    <Building className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-center">
                                                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 line-clamp-1">{company.name}</h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 font-medium">{company.industry || 'Technology'}</p>
                                                            {company.location && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                                                                    <MapPin className="h-3 w-3" />
                                                                    <span className="line-clamp-1">{company.location}</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                                <span>Active Partner</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Company count badge */}
                                    <div className="text-center mt-8">
                                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <Building className="h-4 w-4 text-indigo-500" />
                                            {companies.length} Partner Companies
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative overflow-hidden bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8">
                                    <div className="flex animate-scroll">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <div key={i} className="flex-shrink-0 mx-6 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 min-w-[320px] animate-pulse">
                                                <div className="flex items-center justify-center mb-6">
                                                    <div className="h-20 w-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center">
                                                        <Building className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Partner Company</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Industry</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        Location
                                                    </p>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                        <span>Active Partner</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Internship Postings Section */}
            <section id="latest-internship-opportunities" className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
                {/* Background decoration - Colored Geometric Shapes */}
                <div className="absolute inset-0">
                    {/* Floating Circles */}
                    <div className="absolute top-16 left-16 w-36 h-36 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-15 animate-float"></div>
                    <div className="absolute top-24 right-20 w-24 h-24 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full opacity-20 animate-float" style={{ animationDelay: '1.5s' }}></div>
                    <div className="absolute bottom-20 left-1/6 w-28 h-28 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full opacity-15 animate-float" style={{ animationDelay: '2.9s' }}></div>
                    <div className="absolute bottom-16 right-1/6 w-32 h-32 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-10 animate-float" style={{ animationDelay: '1.2s' }}></div>

                    {/* Rectangles and Squares */}
                    <div className="absolute top-1/7 right-16 w-20 h-48 bg-gradient-to-b from-emerald-400 to-green-500 rounded-lg opacity-15 animate-float" style={{ animationDelay: '2.3s' }}></div>
                    <div className="absolute bottom-1/6 left-20 w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg opacity-20 animate-float" style={{ animationDelay: '3.5s' }}></div>
                    <div className="absolute top-2/5 right-1/7 w-28 h-20 bg-gradient-to-r from-violet-400 to-purple-500 rounded-lg opacity-15 animate-float" style={{ animationDelay: '2.1s' }}></div>

                    {/* Triangles */}
                    <div className="absolute top-4/5 left-1/7 w-26 h-26 bg-gradient-to-br from-yellow-400 to-orange-500 opacity-15 animate-float" style={{ animationDelay: '3.3s', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                    <div className="absolute bottom-1/6 right-4/7 w-22 h-22 bg-gradient-to-br from-teal-400 to-cyan-500 opacity-20 animate-float" style={{ animationDelay: '2.7s', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>

                    {/* Hexagons */}
                    <div className="absolute top-1/4 left-24 w-26 h-26 bg-gradient-to-br from-indigo-400 to-blue-500 opacity-15 animate-float" style={{ animationDelay: '4.1s', clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }}></div>
                    <div className="absolute bottom-3/7 right-24 w-22 h-22 bg-gradient-to-br from-rose-400 to-pink-500 opacity-20 animate-float" style={{ animationDelay: '1.1s', clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                <ScrollReveal animation="fadeInUp" className="text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">Latest Internship Opportunities</h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mx-auto mb-8"></div>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Discover amazing opportunities to kickstart your career and gain valuable experience</p>
                </ScrollReveal>
                        
                        {/* Search and Filters */}
                        <div className="mb-16">
                            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {/* Search Bar */}
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 h-5 w-5 transition-colors duration-200" />
                                        <input
                                            type="text"
                                            placeholder="Search postings..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-300 text-lg placeholder-gray-400 dark:placeholder-gray-500"
                                        />
                                    </div>

                                    {/* Type Filter */}
                                    <div className="relative">
                                        <select
                                            value={selectedType}
                                            onChange={(e) => setSelectedType(e.target.value)}
                                            className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-300 text-lg appearance-none"
                                        >
                                            <option value="all">All Types</option>
                                            <option value="internship">Internship</option>
                                            <option value="career">Career</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Location Filter */}
                                    <div className="relative">
                                        <select
                                            value={selectedLocation}
                                            onChange={(e) => setSelectedLocation(e.target.value)}
                                            className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-300 text-lg appearance-none"
                                        >
                                            <option value="all">All Locations</option>
                                            <option value="remote">Remote</option>
                                            <option value="onsite">Onsite</option>
                                            <option value="hybrid">Hybrid</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Filter Button */}
                                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-semibold text-lg">
                                        <Filter className="h-5 w-5 mr-2" />
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Postings Grid */}
                        {postings.length > 0 ? (
                            <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {(() => {
                                        const filteredPostings = postings.filter(posting => {
                                            const matchesSearch = posting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                               posting.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                               posting.company?.name.toLowerCase().includes(searchTerm.toLowerCase());
                                            const matchesType = selectedType === 'all' || posting.type === selectedType;
                                            const matchesLocation = selectedLocation === 'all' || posting.work_type === selectedLocation;
                                            return matchesSearch && matchesType && matchesLocation;
                                        });
                                        
                                        const startIndex = (currentPage - 1) * itemsPerPage;
                                        const endIndex = startIndex + itemsPerPage;
                                        const paginatedPostings = filteredPostings.slice(startIndex, endIndex);
                                        
                                        return paginatedPostings.map((posting) => (
                                    <div key={posting.posting_id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 group transform hover:-translate-y-1">
                                        {/* Company Logo and Info */}
                                        <div className="flex items-center gap-3 mb-4">
                                            {posting.company?.logo ? (
                                                <img 
                                                    src={posting.company.logo.startsWith('/media/') ? posting.company.logo : getImageUrl(posting.company.logo)} 
                                                    alt={posting.company.name} 
                                                    className="h-12 w-12 rounded-lg object-cover"
                                                    onError={(e) => handleImageError(e)}
                                                />
                                            ) : (
                                                <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                                                    <Building className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{posting.title}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{posting.company?.name}</p>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                posting.type === 'internship' 
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            }`}>
                                                {posting.type}
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                                                {posting.work_type}
                                            </span>
                                            {posting.salary_range && (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                    Paid
                                                </span>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <MapPinIcon className="h-4 w-4" />
                                                <span>{posting.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Building className="h-4 w-4" />
                                                <span>{posting.industry}</span>
                                            </div>
                                            {posting.salary_range && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <DollarSign className="h-4 w-4" />
                                                    <span>{posting.salary_range}</span>
                                                </div>
                                            )}
                                            {posting.start_date && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <Clock className="h-4 w-4" />
                                                    <span>Starts: {new Date(posting.start_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            {posting.work_type && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <Globe className="h-4 w-4" />
                                                    <span className="capitalize">{posting.work_type}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Description Preview */}
                                        {posting.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
                                                {posting.description.substring(0, 120)}...
                                            </p>
                                        )}

                                        {/* Action Button */}
                                        <div className="flex gap-3">
                                            <Button asChild className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                                                <Link href={route('login')}>
                                                    View Details
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                        ));
                                    })()}
                                </div>
                                
                                {/* Pagination */}
                                {(() => {
                                    const filteredPostings = postings.filter(posting => {
                                        const matchesSearch = posting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                               posting.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                               posting.company?.name.toLowerCase().includes(searchTerm.toLowerCase());
                                        const matchesType = selectedType === 'all' || posting.type === selectedType;
                                        const matchesLocation = selectedLocation === 'all' || posting.work_type === selectedLocation;
                                        return matchesSearch && matchesType && matchesLocation;
                                    });
                                    
                                    return (
                                        <div className="mt-12">
                                            {/* Show pagination info */}
                                            <div className="text-center mb-4 text-sm text-gray-600 dark:text-gray-400">
                                                Showing {(() => {
                                                    const startIdx = (currentPage - 1) * itemsPerPage;
                                                    const endIdx = startIdx + itemsPerPage;
                                                    return `${startIdx + 1}-${Math.min(endIdx, filteredPostings.length)} of ${filteredPostings.length} postings`;
                                                })()}
                                            </div>
                                            
                                            {/* Pagination controls - show even if only one page for better UX */}
                                            {filteredPostings.length > 0 && (
                                                <div className="flex justify-center items-center gap-4">
                                                    <Button
                                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                        disabled={currentPage === 1}
                                                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Previous
                                                    </Button>
                                                    
                                                    <div className="flex gap-2">
                                                        {Array.from({ length: Math.ceil(filteredPostings.length / itemsPerPage) }, (_, i) => (
                                                            <Button
                                                                key={i + 1}
                                                                onClick={() => setCurrentPage(i + 1)}
                                                                className={`px-3 py-2 rounded-full ${
                                                                    currentPage === i + 1
                                                                        ? 'bg-indigo-600 text-white'
                                                                        : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                                                                }`}
                                                            >
                                                                {i + 1}
                                                            </Button>
                                ))}
                            </div>
                                                    
                                                    <Button
                                                        onClick={() => setCurrentPage(Math.min(Math.ceil(filteredPostings.length / itemsPerPage), currentPage + 1))}
                                                        disabled={currentPage === Math.ceil(filteredPostings.length / itemsPerPage)}
                                                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Next
                                                    </Button>
                        </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </>
                ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="rounded-3xl border border-gray-100 dark:border-gray-700 p-8 bg-white dark:bg-gray-800 animate-pulse">
                                        <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                                        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                                        <div className="h-4 w-2/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                                        <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
                                        <div className="flex gap-3">
                                            <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
                                            <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        </div>
                    </section>
                {/* Success Stories Section */}
                <section className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
                    {/* Background decoration - Colored Geometric Shapes */}
                    <div className="absolute inset-0">
                        {/* Floating Circles */}
                        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-15 animate-float"></div>
                        <div className="absolute top-28 right-24 w-28 h-28 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full opacity-20 animate-float" style={{ animationDelay: '1.6s' }}></div>
                        <div className="absolute bottom-24 left-1/7 w-32 h-32 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full opacity-15 animate-float" style={{ animationDelay: '3.1s' }}></div>
                        <div className="absolute bottom-20 right-1/7 w-36 h-36 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-10 animate-float" style={{ animationDelay: '1.4s' }}></div>

                        {/* Rectangles and Squares */}
                        <div className="absolute top-1/8 right-20 w-22 h-52 bg-gradient-to-b from-emerald-400 to-green-500 rounded-lg opacity-15 animate-float" style={{ animationDelay: '2.5s' }}></div>
                        <div className="absolute bottom-1/7 left-24 w-26 h-26 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg opacity-20 animate-float" style={{ animationDelay: '3.7s' }}></div>
                        <div className="absolute top-3/5 right-1/8 w-30 h-22 bg-gradient-to-r from-violet-400 to-purple-500 rounded-lg opacity-15 animate-float" style={{ animationDelay: '2.3s' }}></div>

                        {/* Triangles */}
                        <div className="absolute top-5/7 left-1/8 w-28 h-28 bg-gradient-to-br from-yellow-400 to-orange-500 opacity-15 animate-float" style={{ animationDelay: '3.5s', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                        <div className="absolute bottom-1/7 right-5/8 w-24 h-24 bg-gradient-to-br from-teal-400 to-cyan-500 opacity-20 animate-float" style={{ animationDelay: '2.9s', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>

                        {/* Hexagons */}
                        <div className="absolute top-2/7 left-20 w-28 h-28 bg-gradient-to-br from-indigo-400 to-blue-500 opacity-15 animate-float" style={{ animationDelay: '4.3s', clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }}></div>
                        <div className="absolute bottom-4/7 right-28 w-24 h-24 bg-gradient-to-br from-rose-400 to-pink-500 opacity-20 animate-float" style={{ animationDelay: '1.3s', clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }}></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 relative z-10">
                        <ScrollReveal animation="fadeInUp" className="text-center mb-20">
                            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 animate-text-glow neon-glow">
                                {homeContent?.success_stories_title || '🌟 Success Stories'}
                            </h2>
                            <div className="w-20 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mx-auto mb-8"></div>
                            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                                {homeContent?.success_stories_subtitle || 'Real stories from students who transformed their careers through AUHHC ICMS'}
                            </p>

                            {/* Floating Terminal */}
                            <div className="absolute top-10 right-10 opacity-30 animate-float" style={{ animationDelay: '2s' }}>
                                <div className="terminal-window text-xs w-56">
                                    <div className="terminal-header">
                                        <div className="terminal-button red"></div>
                                        <div className="terminal-button yellow"></div>
                                        <div className="terminal-button green"></div>
                                        <span className="text-gray-300 text-xs ml-2">Success Log</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-green-400">{'> Loading success stories...'}</div>
                                        <div className="text-cyan-400">✓ 150+ career transformations</div>
                                        <div className="text-yellow-400">✓ 95% placement rate</div>
                                        <div className="text-green-400">{'> System ready.'}</div>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal animation="scaleIn" delay={200} className="relative max-w-7xl mx-auto">
                            {homeContent?.success_stories && homeContent.success_stories.length > 0 ? (
                                <div
                                    className="relative"
                                >
                                    {/* Carousel Container */}
                                    <div className="overflow-hidden">
                                        <div 
                                            className="flex transition-transform duration-500 ease-out"
                                            style={{ transform: `translateX(-${currentStoryIndex * 100}%)` }}
                                        >
                                            {homeContent.success_stories.map((story, index) => (
                                                <div key={index} className="w-full flex-shrink-0 px-4">
                                                    <div className="max-w-4xl mx-auto group bg-white dark:bg-gray-800 rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                                                        {/* Background pattern */}
                                                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full -translate-y-20 translate-x-20 opacity-50"></div>
                                                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-100 to-pink-100 dark:from-indigo-900/20 dark:to-pink-900/20 rounded-full translate-y-16 -translate-x-16 opacity-50"></div>

                                                        <div className="relative z-10">
                                                            {/* Story Title */}
                                                            {story.title && (
                                                                <h3 className="text-2xl lg:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-6 text-center">
                                                                    {story.title}
                                                                </h3>
                                                            )}

                                                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                                                                {(story.profile_image || story.image) ? (
                                                                    <div className="relative flex-shrink-0">
                                                                        <img
                                                                            src={getImageUrl(story.profile_image || story.image)}
                                                                            alt={story.student_name || story.name}
                                                                            className="h-24 w-24 rounded-full object-cover border-4 border-indigo-100 dark:border-indigo-900 shadow-lg"
                                                                            onError={(e) => handleImageError(e)}
                                                                        />
                                                                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                                                                            <CheckCircle className="h-4 w-4 text-white" />
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="relative flex-shrink-0">
                                                                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-indigo-100 dark:border-indigo-900 shadow-lg">
                                                                            <User className="h-12 w-12 text-white" />
                                                                        </div>
                                                                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                                                                            <CheckCircle className="h-4 w-4 text-white" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="text-center md:text-left">
                                                                    <h4 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                                        {story.student_name || story.name}
                                                                    </h4>
                                                                    {(story.company_name || story.company) && (
                                                                        <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-700 dark:text-indigo-400 font-semibold mt-1">
                                                                            <Building className="h-4 w-4" />
                                                                            <span>{story.company_name || story.company}</span>
                                                                        </div>
                                                                    )}
                                                                    {(story.role_position || story.role) && (
                                                                        <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">
                                                                            {story.role_position || story.role}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-6">
                                                                {/* Full Story */}
                                                                {(story.story || story.text) && (
                                                                    <div className="relative bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                                                                        <span className="text-5xl text-indigo-300 dark:text-indigo-600 font-serif absolute top-2 left-4">"</span>
                                                                        <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed pl-8 pr-4">
                                                                            {story.story || story.text}
                                                                        </p>
                                                                        <span className="text-5xl text-indigo-300 dark:text-indigo-600 font-serif absolute bottom-0 right-4">"</span>
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Outcome Section */}
                                                                {story.outcome && (
                                                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <Target className="h-5 w-5 text-green-600" />
                                                                            <p className="font-semibold text-green-800 dark:text-green-300">Outcome</p>
                                                                        </div>
                                                                        <p className="text-green-700 dark:text-green-200 leading-relaxed">{story.outcome}</p>
                                                                    </div>
                                                                )}
                                                                
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {story.achievements && (
                                                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <Award className="h-5 w-5 text-yellow-600" />
                                                                                <p className="font-semibold text-yellow-800 dark:text-yellow-300">Achievements</p>
                                                                            </div>
                                                                            <p className="text-yellow-700 dark:text-yellow-200 text-sm">{story.achievements}</p>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {story.experiences && (
                                                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <BookOpen className="h-5 w-5 text-blue-600" />
                                                                                <p className="font-semibold text-blue-800 dark:text-blue-300">Experiences</p>
                                                                            </div>
                                                                            <p className="text-blue-700 dark:text-blue-200 text-sm">{story.experiences}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                                                                <div className="flex items-center gap-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                                                    ))}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 px-4 py-2 rounded-full">
                                                                    <CheckCircle className="h-4 w-4" />
                                                                    <span className="font-medium">Verified Story</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Navigation Arrows */}
                                    {homeContent.success_stories.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setCurrentStoryIndex((prev) => (prev - 1 + homeContent.success_stories!.length) % homeContent.success_stories!.length)}
                                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:translate-x-0 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-gray-700 z-10"
                                                aria-label="Previous story"
                                            >
                                                <ArrowRight className="h-5 w-5 text-indigo-600 rotate-180" />
                                            </button>
                                            <button
                                                onClick={() => setCurrentStoryIndex((prev) => (prev + 1) % homeContent.success_stories!.length)}
                                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-0 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-gray-700 z-10"
                                                aria-label="Next story"
                                            >
                                                <ArrowRight className="h-5 w-5 text-indigo-600" />
                                            </button>
                                        </>
                                    )}

                                    {/* Navigation Dots */}
                                    <div className="flex justify-center gap-3 mt-8">
                                        {homeContent.success_stories.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentStoryIndex(i)}
                                                className={`relative transition-all duration-300 ${
                                                    i === currentStoryIndex
                                                        ? 'w-8 h-3 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/50'
                                                        : 'w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full hover:bg-indigo-400'
                                                }`}
                                                aria-label={`Go to story ${i + 1}`}
                                            />
                                        ))}
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-6 max-w-md mx-auto">
                                        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                                                style={{ 
                                                    width: `${((currentStoryIndex + 1) / homeContent.success_stories.length) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                                            {currentStoryIndex + 1} of {homeContent.success_stories.length} stories
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                                        {[
                                            { name: 'Amina', role: 'Computer Science Student', text: 'AUHHC ICMS helped me land a remote internship that turned into a full-time job at a tech startup. The platform made the entire process seamless!', company: 'TechCorp', image: null },
                                            { name: 'Daniel', role: 'Business Student', text: 'The application process was smooth and I got matched with the perfect company for my career goals. Highly recommend AUHHC ICMS!', company: 'Business Solutions', image: null },
                                            { name: 'Selam', role: 'Engineering Student', text: 'Great experience working with my supervisor through the platform. The guidance was invaluable for my professional development.', company: 'Engineering Ltd', image: null }
                                        ].map((story, index) => (
                                            <div key={index} className={`bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden ${index === currentTestimonial ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
                                                {/* Background pattern */}
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>

                                                <div className="relative z-10">
                                                    <div className="flex items-center mb-6">
                                                        <div className="relative">
                                                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
                                                                <UsersIcon className="h-10 w-10 text-white" />
                                                            </div>
                                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                                                <CheckCircle className="h-3 w-3 text-white" />
                                                            </div>
                                                        </div>
                                                        <div className="ml-6">
                                                            <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{story.name}</h4>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{story.role}</p>
                                                            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">{story.company}</p>
                                                        </div>
                                                    </div>

                                                    <div className="mb-8 space-y-4">
                                                        <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed italic relative">
                                                            <span className="text-4xl text-indigo-300 dark:text-indigo-600 font-serif absolute -top-2 -left-2">"</span>
                                                            {story.text}
                                                            <span className="text-4xl text-indigo-300 dark:text-indigo-600 font-serif absolute -bottom-4 -right-2">"</span>
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                                                            ))}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                                            <Award className="h-4 w-4 text-indigo-500" />
                                                            <span>Verified Success</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Enhanced Testimonial Navigation */}
                                    <div className="flex justify-center gap-4 mt-12">
                                        {[0, 1, 2].map((i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentTestimonial(i)}
                                                className={`relative w-4 h-4 rounded-full transition-all duration-300 hover:scale-125 ${
                                                    i === currentTestimonial
                                                        ? 'bg-indigo-600 shadow-lg shadow-indigo-500/50'
                                                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-indigo-400 dark:hover:bg-indigo-500'
                                                }`}
                                            >
                                                {i === currentTestimonial && (
                                                    <div className="absolute inset-0 bg-indigo-600 rounded-full animate-ping"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </ScrollReveal>

                        {/* Call to Action */}
                        <ScrollReveal animation="fadeInUp" delay={300} className="text-center mt-16">
                            <div className="inline-flex items-center gap-6 bg-white dark:bg-gray-800 rounded-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
                                <div className="flex -space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-bold text-sm">A</div>
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-bold text-sm">D</div>
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-bold text-sm">S</div>
                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-bold text-sm">+</div>
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 font-semibold">Join thousands of successful students</span>
                                <Button asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                                    <Link href={route('login')}>
                                        Share Your Story
                                        <Star className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* FAQ Section - Enhanced Professional Design */}
                <section className="py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
                        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"></div>
                    </div>

                    <div className="max-w-5xl mx-auto px-4 relative z-10">
                        {/* Section Header */}
                        <ScrollReveal animation="fadeInUp" className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                FAQ
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Frequently Asked Questions
                            </h2>
                            <div className="w-24 h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full mx-auto mb-6"></div>
                            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Everything you need to know about ICMS and our internship management platform
                            </p>
                        </ScrollReveal>

                        {/* FAQ Grid */}
                        <ScrollReveal animation="fadeInUp" delay={100}>
                            <div className="grid gap-4">
                            {[
                                {
                                    question: "What is ICMS?",
                                    answer: "ICMS (Internship and Career Management System) is a comprehensive platform designed to connect students with internship opportunities, facilitate communication between academic institutions and companies, and streamline the entire internship management process.",
                                    icon: "🎯",
                                    category: "General"
                                },
                                {
                                    question: "How do I apply for an internship?",
                                    answer: "To apply for an internship, first create an account as a student, complete your profile with relevant information, browse available internship postings, and submit your application with required documents. You can track your application status through your dashboard.",
                                    icon: "📝",
                                    category: "Students"
                                },
                                {
                                    question: "Who can use ICMS?",
                                    answer: "ICMS is designed for multiple user roles: Students seeking internships, Company Administrators posting opportunities, Faculty Advisors guiding students, Department Heads overseeing programs, Coordinators managing workflows, and Company Supervisors mentoring interns.",
                                    icon: "👥",
                                    category: "General"
                                },
                                {
                                    question: "How does the application review process work?",
                                    answer: "After you submit an application, it goes through multiple stages: initial review by the company, assessment by faculty advisors, and final approval. You'll receive notifications at each stage, and you can track progress through your dashboard.",
                                    icon: "🔄",
                                    category: "Process"
                                },
                                {
                                    question: "Can companies post multiple internship opportunities?",
                                    answer: "Yes! Companies can create and manage multiple internship postings simultaneously. Each posting can have different requirements, timelines, and supervisor assignments. Our platform supports bulk management of applications.",
                                    icon: "🏢",
                                    category: "Companies"
                                },
                                {
                                    question: "How is my data protected?",
                                    answer: "We take data security seriously. All personal information is encrypted, access is role-based, and we comply with data protection regulations. Only authorized personnel can view your sensitive information.",
                                    icon: "🔒",
                                    category: "Security"
                                },
                                {
                                    question: "What support is available if I need help?",
                                    answer: "We offer multiple support channels: in-platform messaging, email support, comprehensive documentation, and help guides. Faculty advisors and coordinators are also available to assist students throughout their internship journey.",
                                    icon: "💬",
                                    category: "Support"
                                }
                            ].map((faq, index) => (
                                <details 
                                    key={index} 
                                    className="group bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl border border-gray-200/80 dark:border-gray-700/80 overflow-hidden transition-all duration-300"
                                >
                                    <summary className="flex items-center gap-4 p-5 cursor-pointer list-none hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 transition-all duration-300">
                                        <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center text-2xl shadow-inner">
                                            {faq.icon}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{faq.category}</span>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{faq.question}</h3>
                                        </div>
                                        <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-open:rotate-180 transition-transform duration-300 shadow-lg">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </summary>
                                    <div className="px-5 pb-5 pt-0">
                                        <div className="pl-16 pr-12 py-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl text-gray-600 dark:text-gray-300 leading-relaxed border-l-4 border-indigo-500">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </details>
                            ))}
                            </div>
                        </ScrollReveal>

                        {/* Contact Support CTA */}
                        <ScrollReveal animation="scaleIn" delay={200} className="mt-16 text-center">
                            <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl shadow-indigo-500/25">
                                <div className="text-white text-center sm:text-left">
                                    <h3 className="text-xl font-bold mb-1">Still have questions?</h3>
                                    <p className="text-indigo-100 text-sm">Our support team is here to help you</p>
                                </div>
                                <Button asChild className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                    <Link href="/help/contact">
                                        Contact Support
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* Ambo University Location */}
                <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
                    <div className="max-w-6xl mx-auto px-4 space-y-6">
                        <ScrollReveal animation="fadeInUp" className="text-center space-y-2">
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Our Location</h3>
                            <div className="w-20 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mx-auto"></div>
                            <div className="space-y-2">
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">Ambo University</p>
                                <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                                    <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    <p>Ambo, West Shewa Zone, Oromia Region, Ethiopia</p>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Approximately 114 km west of Addis Ababa</p>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal animation="scaleIn" delay={200} className="overflow-hidden rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800">
                            <iframe
                                title="Ambo University Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15952.189760684183!2d37.84614!3d8.98378!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164f6b2b5b3d624b%3A0x7f0f7cc6c0daac7d!2sAmbo%20University!5e0!3m2!1sen!2set!4v1700000000000!5m2!1sen!2set"
                                width="100%"
                                height="420"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </ScrollReveal>
                    </div>
                </section>

                {/* Newsletter CTA Banner */}
                <section className="py-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
                    </div>
                    
                    <ScrollReveal animation="fadeInUp" className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Mail className="h-10 w-10 text-white/90" />
                            <h2 className="text-3xl lg:text-4xl font-bold text-white">Stay Updated</h2>
                        </div>
                        <div className="w-20 h-1 bg-white/50 rounded-full mx-auto mb-6"></div>
                        <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                            Subscribe to our newsletter for the latest internship opportunities, career tips, and platform updates.
                        </p>
                        
                        <form 
                            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
                            onSubmit={(e) => {
                                e.preventDefault();
                                // Newsletter subscription would be handled here
                                alert('Thank you for subscribing! (Demo)');
                            }}
                        >
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="flex-1 px-5 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all duration-300"
                                required
                            />
                            <button
                                type="submit"
                                className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                            >
                                Subscribe
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </form>
                        
                        <p className="text-white/60 text-sm mt-4">
                            No spam, unsubscribe at any time.
                        </p>
                    </ScrollReveal>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                            {/* Company Info */}
                            <div className="lg:col-span-1">
                                <div className="flex items-center gap-3 mb-4">
                            {homeContent?.logo ? (
                                        <img src={getImageUrl(homeContent.logo)} alt="Logo" className="h-12 w-12 rounded-lg" />
                            ) : (
                                        <Briefcase className="h-12 w-12 text-indigo-400" />
                            )}
                                    <h3 className="text-xl font-bold">ICMS</h3>
                        </div>
                                <p className="text-gray-400 mb-4 text-sm">
                                    {homeContent?.footer_text || 'The ultimate platform for internships and career opportunities.'}
                                </p>
                                <div className="flex flex-col gap-2 text-sm">
                                    {homeContent?.phone && (
                                        <div className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                                            <Phone className="h-4 w-4" />
                                            <span>{homeContent.phone}</span>
                                </div>
                                    )}
                                    {homeContent?.email && (
                                        <a href={`mailto:${homeContent.email}`} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                                            <Mail className="h-4 w-4" />
                                            <span>{homeContent.email}</span>
                                        </a>
                                    )}
                                    {homeContent?.location && (
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <MapPin className="h-4 w-4" />
                                            <span>{homeContent.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
                                <div className="flex flex-col gap-3 text-sm">
                                    <a href="#home" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                        Home
                                    </a>
                                    <a href="#about" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                        About
                                    </a>
                                    <a href={route('postings.index')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                        Postings
                                    </a>
                                    {auth.user ? (
                                        <a href={route('dashboard')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                            Dashboard
                                        </a>
                                    ) : (
                                        <a href={route('login')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                            Login
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* User Roles */}
                            <div>
                                <h4 className="font-semibold mb-4 text-lg">For Users</h4>
                                <div className="flex flex-col gap-3 text-sm">
                                    <span className="text-gray-400 flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-blue-400" />
                                        Students
                                    </span>
                                    <span className="text-gray-400 flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-green-400" />
                                        Company Admins
                                    </span>
                                    <span className="text-gray-400 flex items-center gap-2">
                                        <UserCheck className="h-4 w-4 text-orange-400" />
                                        Supervisors
                                    </span>
                                    <span className="text-gray-400 flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-purple-400" />
                                        Department Heads
                                    </span>
                                    <span className="text-gray-400 flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-pink-400" />
                                        Advisors
                                    </span>
                                </div>
                            </div>

                            {/* Newsletter in footer */}
                            <div>
                                <h4 className="font-semibold mb-4 text-lg">Connect With Us</h4>
                                <p className="text-gray-400 text-sm mb-4">Follow us on social media for updates and career tips.</p>
                                <div className="flex gap-3 mb-4">
                                    {homeContent?.social_media && Array.isArray(homeContent.social_media) && homeContent.social_media.map((social, index) => (
                                        <a 
                                            key={index} 
                                            href={social.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all duration-300 hover:scale-110"
                                        >
                                            {social.platform === 'facebook' && <Facebook className="h-5 w-5" />}
                                            {social.platform === 'twitter' && <Twitter className="h-5 w-5" />}
                                            {social.platform === 'instagram' && <Instagram className="h-5 w-5" />}
                                            {social.platform === 'linkedin' && <Linkedin className="h-5 w-5" />}
                                        </a>
                                    ))}
                                    {(!homeContent?.social_media || homeContent.social_media.length === 0) && (
                                        <>
                                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all duration-300 hover:scale-110">
                                                <Facebook className="h-5 w-5" />
                                            </a>
                                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all duration-300 hover:scale-110">
                                                <Twitter className="h-5 w-5" />
                                            </a>
                                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all duration-300 hover:scale-110">
                                                <Linkedin className="h-5 w-5" />
                                            </a>
                                        </>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <h4 className="font-semibold mb-3 text-lg">Theme</h4>
                                    <AppearanceDropdown />
                                </div>
                            </div>

                            {/* QR Code */}
                            <div>
                                <h4 className="font-semibold mb-4 text-lg">Access ICMS</h4>
                                <QRCodeDisplay size={120} />
                            </div>
                        </div>

                        {/* Social Media & Copyright */}
                        <div className="border-t border-gray-800 pt-8">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="text-gray-500 text-sm">
                                    &copy; {new Date().getFullYear()} AUHHC ICMS. All rights reserved.
                                </div>
                                <div className="flex gap-4">
                            {homeContent?.social_media && Array.isArray(homeContent.social_media) && homeContent.social_media.map((social, index) => (
                                        <a 
                                            key={index} 
                                            href={social.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                                        >
                                            {social.platform === 'facebook' && <Facebook className="h-5 w-5" />}
                                            {social.platform === 'twitter' && <Twitter className="h-5 w-5" />}
                                            {social.platform === 'instagram' && <Instagram className="h-5 w-5" />}
                                            {social.platform === 'linkedin' && <Linkedin className="h-5 w-5" />}
                                </a>
                            ))}
                        </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Back to Top Button with Progress Indicator */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${
                    showBackToTop 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-10 pointer-events-none'
                }`}
                aria-label="Back to top"
            >
                <div className="relative">
                    {/* Progress ring */}
                    <svg className="w-14 h-14 transform -rotate-90">
                        <circle
                            cx="28"
                            cy="28"
                            r="24"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            className="text-gray-300 dark:text-gray-700"
                        />
                        <circle
                            cx="28"
                            cy="28"
                            r="24"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            className="text-indigo-600"
                            style={{
                                strokeDasharray: `${2 * Math.PI * 24}`,
                                strokeDashoffset: `${2 * Math.PI * 24 * (1 - scrollProgress / 100)}`,
                                transition: 'stroke-dashoffset 0.3s ease'
                            }}
                        />
                    </svg>
                    {/* Button center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        </div>
                    </div>
                </div>
            </button>

            {/* Custom CSS for Animations */}
            <style>
                {`
                    .animate-fade-in-up {
                        animation: fadeInUp 0.75s ease-out forwards;
                    }
                    .delay-100 {
                        animation-delay: 0.1s;
                    }
                    .delay-200 {
                        animation-delay: 0.2s;
                    }
                    .delay-300 {
                        animation-delay: 0.3s;
                    }
                    .animate-scroll {
                        animation: scroll 20s linear infinite;
                    }
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    @keyframes scroll {
                        0% {
                            transform: translateX(0);
                        }
                        100% {
                            transform: translateX(-50%);
                        }
                    }
                    .line-clamp-3 {
                        display: -webkit-box;
                        -webkit-line-clamp: 3;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                    
                    /* Marquee animations for partner companies */
                    .marquee-container {
                        overflow: hidden;
                        width: 100%;
                    }
                    .marquee-content {
                        display: flex;
                        width: fit-content;
                    }
                    .animate-marquee {
                        animation: marquee 30s linear infinite;
                    }
                    .animate-marquee-reverse {
                        animation: marquee-reverse 35s linear infinite;
                    }
                    @keyframes marquee {
                        0% {
                            transform: translateX(0);
                        }
                        100% {
                            transform: translateX(-33.333%);
                        }
                    }
                    @keyframes marquee-reverse {
                        0% {
                            transform: translateX(-33.333%);
                        }
                        100% {
                            transform: translateX(0);
                        }
                    }
                    
                    /* Line clamp utilities */
                    .line-clamp-1 {
                        display: -webkit-box;
                        -webkit-line-clamp: 1;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                    .line-clamp-4 {
                        display: -webkit-box;
                        -webkit-line-clamp: 4;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                    
                    /* Particle animations */
                    .particle-dot {
                        animation: particleDrift linear infinite;
                    }
                    @keyframes particleDrift {
                        0%, 100% {
                            transform: translate(0, 0) scale(1);
                            opacity: 0.3;
                        }
                        25% {
                            transform: translate(20px, -30px) scale(1.2);
                            opacity: 0.6;
                        }
                        50% {
                            transform: translate(-10px, -50px) scale(0.8);
                            opacity: 0.4;
                        }
                        75% {
                            transform: translate(30px, -20px) scale(1.1);
                            opacity: 0.5;
                        }
                    }
                    
                    /* Scroll indicator animation */
                    .animate-scroll-indicator {
                        animation: scrollIndicator 2s ease-in-out infinite;
                    }
                    @keyframes scrollIndicator {
                        0%, 100% {
                            transform: translateY(0);
                            opacity: 1;
                        }
                        50% {
                            transform: translateY(12px);
                            opacity: 0.3;
                        }
                    }
                    
                    /* Scroll-triggered animations */
                    [data-animate] {
                        opacity: 0;
                        transform: translateY(30px);
                        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
                    }
                    [data-animate].animate-in {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    
                    /* Staggered animation delays */
                    [data-animate]:nth-child(1) { transition-delay: 0s; }
                    [data-animate]:nth-child(2) { transition-delay: 0.1s; }
                    [data-animate]:nth-child(3) { transition-delay: 0.2s; }
                    [data-animate]:nth-child(4) { transition-delay: 0.3s; }
                    [data-animate]:nth-child(5) { transition-delay: 0.4s; }
                    [data-animate]:nth-child(6) { transition-delay: 0.5s; }
                    
                    /* Slide animations for different directions */
                    [data-animate-left] {
                        opacity: 0;
                        transform: translateX(-50px);
                        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
                    }
                    [data-animate-left].animate-in {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    
                    [data-animate-right] {
                        opacity: 0;
                        transform: translateX(50px);
                        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
                    }
                    [data-animate-right].animate-in {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    
                    [data-animate-scale] {
                        opacity: 0;
                        transform: scale(0.9);
                        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
                    }
                    [data-animate-scale].animate-in {
                        opacity: 1;
                        transform: scale(1);
                    }
                    
                    /* Mobile-specific improvements */
                    @media (max-width: 768px) {
                        /* Reduce animation complexity on mobile */
                        .animate-float {
                            animation-duration: 8s;
                        }
                        
                        .particle-dot {
                            animation: none;
                            opacity: 0.2;
                        }
                        
                        /* Touch-friendly interactive areas */
                        .interactive-card {
                            min-height: 44px;
                        }
                        
                        /* Better tap targets */
                        button, a {
                            min-height: 44px;
                        }
                        
                        /* Smooth scrolling for touch */
                        .marquee-container {
                            -webkit-overflow-scrolling: touch;
                        }
                        
                        /* Reduce parallax effects on mobile */
                        .parallax-container {
                            transform: none !important;
                        }
                        
                        /* Better text sizing */
                        .text-6xl {
                            font-size: 2.5rem;
                        }
                        
                        .text-5xl {
                            font-size: 2rem;
                        }
                        
                        /* Hide decorative elements on small screens */
                        .hide-mobile {
                            display: none;
                        }
                    }
                    
                    /* Performance optimizations */
                    .gpu-accelerated {
                        transform: translateZ(0);
                        backface-visibility: hidden;
                        will-change: transform;
                    }
                    
                    /* Optimize animations for 60fps */
                    .animate-float,
                    .animate-marquee,
                    .animate-marquee-reverse,
                    .particle-dot {
                        will-change: transform;
                        transform: translateZ(0);
                    }
                    
                    /* Lazy loading placeholder styles */
                    .lazy-image {
                        opacity: 0;
                        transition: opacity 0.3s ease-in-out;
                    }
                    
                    .lazy-image.loaded {
                        opacity: 1;
                    }
                    
                    /* Skeleton loading animation */
                    .skeleton {
                        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                        background-size: 200% 100%;
                        animation: skeleton-loading 1.5s infinite;
                    }
                    
                    @keyframes skeleton-loading {
                        0% { background-position: 200% 0; }
                        100% { background-position: -200% 0; }
                    }
                    
                    /* Dark mode skeleton */
                    .dark .skeleton {
                        background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
                        background-size: 200% 100%;
                    }
                    
                    /* Focus visible for accessibility */
                    :focus-visible {
                        outline: 2px solid #6366f1;
                        outline-offset: 2px;
                    }
                    
                    /* Reduced motion preference */
                    @media (prefers-reduced-motion: reduce) {
                        *,
                        *::before,
                        *::after {
                            animation-duration: 0.01ms !important;
                            animation-iteration-count: 1 !important;
                            transition-duration: 0.01ms !important;
                            scroll-behavior: auto !important;
                        }
                        
                        .marquee-content {
                            animation: none;
                        }
                    }
                `}
            </style>

            {/* Overview Modal */}
            {showOverviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Roles Overview</h2>
                                <button
                                    onClick={() => setShowOverviewModal(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                                        <div className="flex items-center mb-4">
                                            <UserCog className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                                            <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">System Administrator</h3>
                                        </div>
                                        <p className="text-blue-800 dark:text-blue-200 mb-4">
                                            The backbone of the system, responsible for maintaining system integrity, user management, and overall platform administration.
                                        </p>
                                        <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                                            <li>• User account management and permissions</li>
                                            <li>• System configuration and maintenance</li>
                                            <li>• Data backup and security monitoring</li>
                                            <li>• Platform performance optimization</li>
                                            <li>• Compliance and audit trail management</li>
                                        </ul>
                                    </div>

                                    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                                        <div className="flex items-center mb-4">
                                            <GraduationCap className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
                                            <h3 className="text-xl font-semibold text-green-900 dark:text-green-100">Students</h3>
                                        </div>
                                        <p className="text-green-800 dark:text-green-200 mb-4">
                                            Future professionals seeking internship opportunities to gain practical experience and build their careers.
                                        </p>
                                        <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
                                            <li>• Browse and apply for internship positions</li>
                                            <li>• Submit application materials and documents</li>
                                            <li>• Track application status and progress</li>
                                            <li>• Complete internship requirements and forms</li>
                                            <li>• Provide feedback and success stories</li>
                                        </ul>
                                    </div>

                                    <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                                        <div className="flex items-center mb-4">
                                            <Building2 className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
                                            <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100">Company Administrators</h3>
                                        </div>
                                        <p className="text-purple-800 dark:text-purple-200 mb-4">
                                            Company representatives who manage their organization's presence and internship offerings on the platform.
                                        </p>
                                        <ul className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
                                            <li>• Company profile and information management</li>
                                            <li>• Internship posting creation and management</li>
                                            <li>• Application review and candidate selection</li>
                                            <li>• Supervisor assignment and coordination</li>
                                            <li>• Performance tracking and analytics</li>
                                        </ul>
                                    </div>

                                    <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                                        <div className="flex items-center mb-4">
                                            <UserCheck className="h-8 w-8 text-orange-600 dark:text-orange-400 mr-3" />
                                            <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100">Company Supervisors</h3>
                                        </div>
                                        <p className="text-orange-800 dark:text-orange-200 mb-4">
                                            Industry professionals who mentor and evaluate interns, providing guidance and performance assessments.
                                        </p>
                                        <ul className="space-y-2 text-sm text-orange-700 dark:text-orange-300">
                                            <li>• Intern supervision and mentoring</li>
                                            <li>• Performance evaluation and feedback</li>
                                            <li>• Progress tracking and milestone reviews</li>
                                            <li>• Form approval and documentation</li>
                                            <li>• Internship completion verification</li>
                                        </ul>
                                    </div>

                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg">
                                        <div className="flex items-center mb-4">
                                            <Shield className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-3" />
                                            <h3 className="text-xl font-semibold text-indigo-900 dark:text-indigo-100">Department Heads</h3>
                                        </div>
                                        <p className="text-indigo-800 dark:text-indigo-200 mb-4">
                                            Academic leaders who oversee department internship programs and coordinate with industry partners.
                                        </p>
                                        <ul className="space-y-2 text-sm text-indigo-700 dark:text-indigo-300">
                                            <li>• Department internship program oversight</li>
                                            <li>• Faculty advisor assignment and management</li>
                                            <li>• Industry partnership coordination</li>
                                            <li>• Program evaluation and improvement</li>
                                            <li>• Student internship outcome assessment</li>
                                        </ul>
                                    </div>

                                    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
                                        <div className="flex items-center mb-4">
                                            <BookOpen className="h-8 w-8 text-red-600 dark:text-red-400 mr-3" />
                                            <h3 className="text-xl font-semibold text-red-900 dark:text-red-100">Faculty Advisors</h3>
                                        </div>
                                        <p className="text-red-800 dark:text-red-200 mb-4">
                                            Academic mentors who guide students through their internship experience and ensure educational objectives are met.
                                        </p>
                                        <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
                                            <li>• Student internship guidance and mentoring</li>
                                            <li>• Academic requirement coordination</li>
                                            <li>• Progress monitoring and intervention</li>
                                            <li>• Form review and approval processes</li>
                                            <li>• Educational outcome assessment</li>
                                        </ul>
                                    </div>

                                    <div className="bg-teal-50 dark:bg-teal-900/20 p-6 rounded-lg">
                                        <div className="flex items-center mb-4">
                                            <Target className="h-8 w-8 text-teal-600 dark:text-teal-400 mr-3" />
                                            <h3 className="text-xl font-semibold text-teal-900 dark:text-teal-100">Coordinators</h3>
                                        </div>
                                        <p className="text-teal-800 dark:text-teal-200 mb-4">
                                            System coordinators who manage overall internship program operations and ensure smooth functioning across all stakeholders.
                                        </p>
                                        <ul className="space-y-2 text-sm text-teal-700 dark:text-teal-300">
                                            <li>• Program-wide coordination and oversight</li>
                                            <li>• Cross-departmental communication</li>
                                            <li>• Issue resolution and conflict management</li>
                                            <li>• Program analytics and reporting</li>
                                            <li>• Stakeholder relationship management</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rules Modal */}
            {showRulesModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Rules & Guidelines</h2>
                                <button
                                    onClick={() => setShowRulesModal(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-4">General Rules for All Users</h3>
                                    <ul className="space-y-3 text-yellow-800 dark:text-yellow-200">
                                        <li className="flex items-start">
                                            <span className="font-bold mr-2">1.</span>
                                            <span>Maintain professional communication and respect towards all platform users and stakeholders.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-bold mr-2">2.</span>
                                            <span>Provide accurate and truthful information in all profiles, applications, and communications.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-bold mr-2">3.</span>
                                            <span>Complete all required forms and documentation within specified deadlines.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-bold mr-2">4.</span>
                                            <span>Report any technical issues or security concerns immediately to system administrators.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-bold mr-2">5.</span>
                                            <span>Maintain confidentiality of sensitive information shared during the internship process.</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                                        <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">Student Responsibilities</h4>
                                        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                                            <li>• Submit complete and accurate application materials</li>
                                            <li>• Meet all internship program requirements and deadlines</li>
                                            <li>• Maintain regular communication with supervisors and advisors</li>
                                            <li>• Demonstrate professional conduct during internship</li>
                                            <li>• Complete all required evaluations and feedback forms</li>
                                            <li>• Adhere to company policies and internship agreements</li>
                                        </ul>
                                    </div>

                                    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                                        <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">Company Responsibilities</h4>
                                        <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                                            <li>• Provide accurate job descriptions and requirements</li>
                                            <li>• Ensure safe and professional work environment</li>
                                            <li>• Assign qualified supervisors for intern mentoring</li>
                                            <li>• Provide constructive feedback and performance evaluations</li>
                                            <li>• Complete all required documentation and forms</li>
                                            <li>• Honor internship agreements and commitments</li>
                                        </ul>
                                    </div>

                                    <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                                        <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">Academic Institution Responsibilities</h4>
                                        <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                                            <li>• Ensure student eligibility and academic standing</li>
                                            <li>• Provide adequate pre-internship preparation</li>
                                            <li>• Assign qualified faculty advisors for student support</li>
                                            <li>• Monitor student progress and intervene when necessary</li>
                                            <li>• Maintain accurate academic records and evaluations</li>
                                            <li>• Coordinate with industry partners effectively</li>
                                        </ul>
                                    </div>

                                    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
                                        <h4 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">System Usage Guidelines</h4>
                                        <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
                                            <li>• Use only your assigned account credentials</li>
                                            <li>• Log out properly after each session</li>
                                            <li>• Do not share login information with others</li>
                                            <li>• Report suspicious activities immediately</li>
                                            <li>• Follow data protection and privacy policies</li>
                                            <li>• Use the platform only for legitimate internship purposes</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Consequences of Rule Violations</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div className="text-center">
                                            <div className="text-yellow-600 dark:text-yellow-400 font-semibold mb-2">Warning</div>
                                            <p className="text-gray-600 dark:text-gray-400">First offense - Formal warning and corrective action required</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-orange-600 dark:text-orange-400 font-semibold mb-2">Suspension</div>
                                            <p className="text-gray-600 dark:text-gray-400">Repeated offenses - Temporary account suspension</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-red-600 dark:text-red-400 font-semibold mb-2">Termination</div>
                                            <p className="text-gray-600 dark:text-gray-400">Severe violations - Permanent account termination</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Developers Modal */}
            {showDevelopersModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Developers</h2>
                                <button
                                    onClick={() => setShowDevelopersModal(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Developer 1 */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="text-center mb-4">
                                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                                            <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Ephrem Niguse</h3>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">Lead Developer & System Architect</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center text-sm">
                                            <GraduationCap className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                            <span className="text-blue-800 dark:text-blue-200">Computer Science, Addis Ababa University</span>
                                        </div>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            Full-stack developer specializing in Laravel and React ecosystems. 
                                            Passionate about creating scalable internship management solutions.
                                        </p>
                                        <div className="flex justify-center space-x-3">
                                            <a href="https://facebook.com/ephrem.dev" target="_blank" rel="noopener noreferrer" 
                                               className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
                                                <Facebook className="w-5 h-5" />
                                            </a>
                                            <a href="https://twitter.com/ephrem_dev" target="_blank" rel="noopener noreferrer"
                                               className="text-blue-400 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-100">
                                                <Twitter className="w-5 h-5" />
                                            </a>
                                            <a href="https://linkedin.com/in/ephrem-niguse" target="_blank" rel="noopener noreferrer"
                                               className="text-blue-700 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-300">
                                                <Linkedin className="w-5 h-5" />
                                            </a>
                                            <a href="https://github.com/ephrem-dev" target="_blank" rel="noopener noreferrer"
                                               className="text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                                </svg>
                                            </a>
                                        </div>
                                        <a href="https://ephrem.dev/portfolio" target="_blank" rel="noopener noreferrer"
                                           className="block text-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline">
                                            View Portfolio
                                        </a>
                                    </div>
                                </div>

                                {/* Developer 2 */}
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="text-center mb-4">
                                        <div className="w-20 h-20 bg-green-100 dark:bg-green-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                                            <User className="w-10 h-10 text-green-600 dark:text-green-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Abel Tsegaye</h3>
                                        <p className="text-sm text-green-700 dark:text-green-300">Frontend Developer & UI/UX Designer</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center text-sm">
                                            <GraduationCap className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                                            <span className="text-green-800 dark:text-green-200">Software Engineering, Unity University</span>
                                        </div>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            Creative frontend developer with expertise in React and modern UI frameworks. 
                                            Focused on creating intuitive user experiences for educational platforms.
                                        </p>
                                        <div className="flex justify-center space-x-3">
                                            <a href="https://facebook.com/abel.design" target="_blank" rel="noopener noreferrer"
                                               className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
                                                <Facebook className="w-5 h-5" />
                                            </a>
                                            <a href="https://instagram.com/abel_ui" target="_blank" rel="noopener noreferrer"
                                               className="text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-200">
                                                <Instagram className="w-5 h-5" />
                                            </a>
                                            <a href="https://linkedin.com/in/abel-tsegaye" target="_blank" rel="noopener noreferrer"
                                               className="text-blue-700 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-300">
                                                <Linkedin className="w-5 h-5" />
                                            </a>
                                            <a href="https://dribbble.com/abel-design" target="_blank" rel="noopener noreferrer"
                                               className="text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-200">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0zm6.237 16.584c-.16.107-.331.186-.509.236-.286.078-.589.117-.893.117-.62 0-1.213-.093-1.767-.278-.714-.237-1.348-.582-1.902-1.035-.554-.453-.991-.998-1.312-1.635-.321-.637-.482-1.327-.482-2.07 0-.746.161-1.433.482-2.062.321-.629.758-1.172 1.312-1.629.554-.457 1.188-.802 1.902-1.035.554-.185 1.147-.278 1.767-.278.304 0 .607.039.893.117.178.05.349.129.509.236.16.107.301.236.424.386.123.15.221.316.293.497.072.181.108.376.108.584 0 .208-.036.403-.108.584-.072.181-.17.347-.293.497-.123.15-.264.279-.424.386zm-6.237-6.562c-.414 0-.788.147-1.121.44-.333.293-.602.69-.807 1.19-.205.5-.308 1.04-.308 1.622 0 .582.103 1.122.308 1.622.205.5.474.897.807 1.19.333.293.707.44 1.121.44.414 0 .788-.147 1.121-.44.333-.293.602-.69.807-1.19.205-.5.308-1.04.308-1.622 0-.582-.103-1.122-.308-1.622-.205-.5-.474-.897-.807-1.19-.333-.293-.707-.44-1.121-.44zm6.237 6.562c-.138 0-.271-.021-.4-.063-.129-.042-.244-.102-.344-.181-.1-.079-.181-.173-.244-.282-.063-.109-.095-.229-.095-.36 0-.131.032-.251.095-.36.063-.109.144-.203.244-.282.1-.079.215-.139.344-.181.129-.042.262-.063.4-.063.138 0 .271.021.4.063.129.042.244.102.344.181.1.079.181.173.244.282.063.109.095.229.095.36 0 .131-.032.251-.095.36-.063.109-.144.203-.244.282-.1.079-.215.139-.344.181-.129.042-.262.063-.4.063z"/>
                                                </svg>
                                            </a>
                                        </div>
                                        <a href="https://abel.design/portfolio" target="_blank" rel="noopener noreferrer"
                                           className="block text-center text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 underline">
                                            View Portfolio
                                        </a>
                                    </div>
                                </div>

                                {/* Developer 3 */}
                                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                                    <div className="text-center mb-4">
                                        <div className="w-20 h-20 bg-purple-100 dark:bg-purple-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                                            <User className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Helen Tesfaye</h3>
                                        <p className="text-sm text-purple-700 dark:text-purple-300">Backend Developer & Database Architect</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center text-sm">
                                            <GraduationCap className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                                            <span className="text-purple-800 dark:text-purple-200">Information Technology, Addis Ababa Science & Technology University</span>
                                        </div>
                                        <p className="text-sm text-purple-700 dark:text-purple-300">
                                            Backend specialist with deep knowledge of database design and API development. 
                                            Expert in creating robust and scalable server-side solutions.
                                        </p>
                                        <div className="flex justify-center space-x-3">
                                            <a href="https://facebook.com/helen.tech" target="_blank" rel="noopener noreferrer"
                                               className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
                                                <Facebook className="w-5 h-5" />
                                            </a>
                                            <a href="https://twitter.com/helen_db" target="_blank" rel="noopener noreferrer"
                                               className="text-blue-400 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-100">
                                                <Twitter className="w-5 h-5" />
                                            </a>
                                            <a href="https://linkedin.com/in/helen-tesfaye" target="_blank" rel="noopener noreferrer"
                                               className="text-blue-700 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-300">
                                                <Linkedin className="w-5 h-5" />
                                            </a>
                                            <a href="https://stackoverflow.com/users/helen-dev" target="_blank" rel="noopener noreferrer"
                                               className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M18.986 21.865v-6.404h2.134V24H1.844v-8.539h2.13v6.404h15.012zM6.111 2.127l13.178.002-1.258 8.873L21.058 0H7.613l4.48 2.127-3.982 5.904-.001-8.904z"/>
                                                </svg>
                                            </a>
                                        </div>
                                        <a href="https://helen.tech/portfolio" target="_blank" rel="noopener noreferrer"
                                           className="block text-center text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200 underline">
                                            View Portfolio
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* ChatBot */}
            <ChatBot position="bottom-right" />
        </>
    );
}