import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { useMouseParallax } from '@/hooks/useScrollAnimation';

interface ParallaxLayerProps {
  children: ReactNode;
  speed?: number;
  direction?: 'up' | 'down';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Individual parallax layer with configurable speed
 */
export function ParallaxLayer({
  children,
  speed = 0.5,
  direction = 'up',
  className = '',
  style = {},
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let rafId: number;
    
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const element = ref.current;
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = window.innerHeight / 2;
        const distanceFromCenter = elementCenter - viewportCenter;
        const multiplier = direction === 'up' ? -1 : 1;
        
        setOffset(distanceFromCenter * speed * multiplier);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [speed, direction]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        transform: `translateY(${offset}px)`,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  enableMouseParallax?: boolean;
  mouseIntensity?: number;
}

/**
 * Container for parallax sections with optional mouse tracking
 */
export function ParallaxSection({
  children,
  className = '',
  style = {},
  enableMouseParallax = false,
  mouseIntensity = 20,
}: ParallaxSectionProps) {
  const mousePos = useMouseParallax(enableMouseParallax ? mouseIntensity : 0);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        ...style,
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      {enableMouseParallax ? (
        <div
          style={{
            transform: `rotateY(${mousePos.x * 0.02}deg) rotateX(${mousePos.y * -0.02}deg)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

/**
 * Floating elements that move with parallax and subtle animation
 */
interface FloatingElementProps {
  children?: ReactNode;
  speed?: number;
  floatAmplitude?: number;
  floatDuration?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function FloatingElement({
  children,
  speed = 0.3,
  floatAmplitude = 20,
  floatDuration = 6,
  delay = 0,
  className = '',
  style = {},
}: FloatingElementProps) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        setScrollOffset(scrollY * speed);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return (
    <div
      ref={ref}
      className={`${className}`}
      style={{
        ...style,
        transform: `translateY(${-scrollOffset}px)`,
        animation: `float-element ${floatDuration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        willChange: 'transform',
      }}
    >
      <style>{`
        @keyframes float-element {
          0%, 100% { transform: translateY(${-scrollOffset}px); }
          50% { transform: translateY(${-scrollOffset - floatAmplitude}px); }
        }
      `}</style>
      {children}
    </div>
  );
}

/**
 * Background with multiple parallax layers
 */
interface MultiLayerParallaxProps {
  layers: {
    content: ReactNode;
    speed: number;
    zIndex?: number;
    opacity?: number;
  }[];
  className?: string;
  style?: React.CSSProperties;
}

export function MultiLayerParallax({
  layers,
  className = '',
  style = {},
}: MultiLayerParallaxProps) {
  return (
    <div className={`relative ${className}`} style={style}>
      {layers.map((layer, index) => (
        <ParallaxLayer
          key={index}
          speed={layer.speed}
          className="absolute inset-0"
          style={{
            zIndex: layer.zIndex ?? index,
            opacity: layer.opacity ?? 1,
          }}
        >
          {layer.content}
        </ParallaxLayer>
      ))}
    </div>
  );
}

/**
 * Depth-based floating particles
 */
interface ParticleFieldProps {
  particleCount?: number;
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  className?: string;
}

export function ParticleField({
  particleCount = 30,
  colors = ['rgba(99, 102, 241, 0.3)', 'rgba(168, 85, 247, 0.3)', 'rgba(236, 72, 153, 0.3)'],
  minSize = 4,
  maxSize = 12,
  className = '',
}: ParticleFieldProps) {
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: minSize + Math.random() * (maxSize - minSize),
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: 0.1 + Math.random() * 0.4,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 20,
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <FloatingElement
          key={particle.id}
          speed={particle.speed}
          floatAmplitude={15 + Math.random() * 25}
          floatDuration={particle.duration}
          delay={particle.delay}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            filter: 'blur(1px)',
          }}
        />
      ))}
    </div>
  );
}

export default ParallaxSection;

