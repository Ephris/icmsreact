import React, { useEffect, useState, useRef } from 'react';
import { useInView, useElementScrollProgress } from '@/hooks/useScrollAnimation';

interface TeamMember {
  id: number;
  x: number;
  y: number;
  color: string;
  delay: number;
}

interface TeamAnimationProps {
  memberCount?: number;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Animated team silhouettes forming a circle - collaboration visualization
 */
export function TeamCircleAnimation({
  memberCount = 6,
  width = 400,
  height = 400,
  className = '',
}: TeamAnimationProps) {
  const [ref, isInView] = useInView(0.2, '0px', true);
  const [connectionProgress, setConnectionProgress] = useState(0);
  
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;
  
  const members: TeamMember[] = Array.from({ length: memberCount }, (_, i) => {
    const angle = (i * 2 * Math.PI) / memberCount - Math.PI / 2;
    return {
      id: i,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      color: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'][i % 6],
      delay: i * 100,
    };
  });

  // Animate connections
  useEffect(() => {
    if (!isInView) return;
    
    const duration = 2000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setConnectionProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    const timeout = setTimeout(() => requestAnimationFrame(animate), 600);
    return () => clearTimeout(timeout);
  }, [isInView]);

  // Person silhouette path
  const personPath = (scale: number = 1) => `
    M ${-8 * scale} ${16 * scale}
    C ${-8 * scale} ${12 * scale} ${-6 * scale} ${8 * scale} 0 ${8 * scale}
    C ${6 * scale} ${8 * scale} ${8 * scale} ${12 * scale} ${8 * scale} ${16 * scale}
    M 0 ${-4 * scale}
    A ${6 * scale} ${6 * scale} 0 1 0 0 ${-4 * scale - 0.01}
  `;

  return (
    <div ref={ref} className={className}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        <defs>
          <filter id="teamGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Center glow */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.6}
          fill="url(#centerGlow)"
          style={{
            opacity: isInView ? connectionProgress : 0,
            transform: `scale(${isInView ? 1 : 0})`,
            transformOrigin: `${centerX}px ${centerY}px`,
            transition: 'all 1s ease-out',
          }}
        />

        {/* Connection lines between members */}
        {members.map((member, i) => (
          members.slice(i + 1).map((other, j) => (
            <line
              key={`conn-${i}-${j}`}
              x1={member.x}
              y1={member.y}
              x2={other.x}
              y2={other.y}
              stroke="#8b5cf6"
              strokeWidth="1"
              strokeDasharray="4,4"
              style={{
                opacity: isInView ? 0.3 * connectionProgress : 0,
                transition: `opacity 0.5s ease-out ${600 + (i + j) * 50}ms`,
              }}
            />
          ))
        ))}

        {/* Lines from members to center */}
        {members.map((member, i) => (
          <line
            key={`center-${i}`}
            x1={member.x}
            y1={member.y}
            x2={centerX}
            y2={centerY}
            stroke={member.color}
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              opacity: isInView ? 0.5 * connectionProgress : 0,
              strokeDasharray: '100',
              strokeDashoffset: isInView ? 0 : 100,
              transition: `all 1s ease-out ${member.delay + 300}ms`,
            }}
          />
        ))}

        {/* Team members */}
        {members.map((member) => (
          <g
            key={member.id}
            transform={`translate(${member.x}, ${member.y})`}
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView 
                ? `translate(${member.x}px, ${member.y}px) scale(1)` 
                : `translate(${centerX}px, ${centerY}px) scale(0)`,
              transition: `all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${member.delay}ms`,
            }}
          >
            {/* Background circle */}
            <circle
              cx="0"
              cy="4"
              r="25"
              fill={`${member.color}20`}
            />
            
            {/* Person silhouette */}
            <path
              d={personPath(1.2)}
              fill={member.color}
              filter="url(#teamGlow)"
            />
            
            {/* Pulse ring */}
            <circle
              cx="0"
              cy="4"
              r="30"
              fill="none"
              stroke={member.color}
              strokeWidth="2"
              style={{
                opacity: isInView ? 0.5 : 0,
                animation: isInView ? 'pulse-ring 2s ease-out infinite' : 'none',
                animationDelay: `${member.delay}ms`,
              }}
            />
          </g>
        ))}

        {/* Center icon (collaboration symbol) */}
        <g
          transform={`translate(${centerX}, ${centerY})`}
          style={{
            opacity: isInView ? connectionProgress : 0,
            transform: isInView ? `translate(${centerX}px, ${centerY}px) scale(1) rotate(0deg)` : `translate(${centerX}px, ${centerY}px) scale(0) rotate(-180deg)`,
            transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1) 800ms',
          }}
        >
          <circle
            cx="0"
            cy="0"
            r="25"
            fill="#8b5cf6"
            filter="url(#teamGlow)"
          />
          {/* Handshake icon */}
          <path
            d="M-8 0 L-4 -4 L0 0 L4 -4 L8 0 M-6 4 L6 4"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        <style>{`
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 0.5; }
            100% { transform: scale(1.5); opacity: 0; }
          }
        `}</style>
      </svg>
    </div>
  );
}

/**
 * Speech bubbles animation for team communication
 */
interface SpeechBubblesProps {
  className?: string;
}

export function SpeechBubbles({ className = '' }: SpeechBubblesProps) {
  const [ref, isInView] = useInView(0.2, '0px', true);
  
  const bubbles = [
    { x: 20, y: 30, text: '👋', delay: 0, size: 'large' },
    { x: 70, y: 20, text: '💼', delay: 200, size: 'medium' },
    { x: 30, y: 70, text: '🎓', delay: 400, size: 'medium' },
    { x: 80, y: 60, text: '✨', delay: 600, size: 'small' },
    { x: 50, y: 50, text: '🤝', delay: 800, size: 'large' },
  ];

  const sizeClasses = {
    small: 'w-10 h-10 text-lg',
    medium: 'w-12 h-12 text-xl',
    large: 'w-14 h-14 text-2xl',
  };

  return (
    <div ref={ref} className={`absolute inset-0 pointer-events-none ${className}`}>
      {bubbles.map((bubble, i) => (
        <div
          key={i}
          className={`absolute ${sizeClasses[bubble.size as keyof typeof sizeClasses]} bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center`}
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            opacity: isInView ? 1 : 0,
            transform: isInView ? 'scale(1) translateY(0)' : 'scale(0) translateY(20px)',
            transition: `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${bubble.delay}ms`,
            animation: isInView ? `bubble-float ${3 + i * 0.5}s ease-in-out infinite ${bubble.delay}ms` : 'none',
          }}
        >
          {bubble.text}
        </div>
      ))}
      <style>{`
        @keyframes bubble-float {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.05) translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

/**
 * Collaboration lines animation
 */
interface CollaborationLinesProps {
  width?: number;
  height?: number;
  className?: string;
}

export function CollaborationLines({
  width = 400,
  height = 300,
  className = '',
}: CollaborationLinesProps) {
  const [ref, isInView] = useInView(0.2, '0px', true);
  
  const paths = [
    { d: 'M50 150 Q150 50 250 150 T450 150', color: '#3b82f6', delay: 0 },
    { d: 'M0 100 Q100 200 200 100 Q300 0 400 100', color: '#10b981', delay: 200 },
    { d: 'M100 200 Q200 100 300 200 Q400 300 500 200', color: '#8b5cf6', delay: 400 },
  ];

  return (
    <div ref={ref} className={className}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {paths.map((path, i) => (
          <path
            key={i}
            d={path.d}
            fill="none"
            stroke={path.color}
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              opacity: isInView ? 0.4 : 0,
              strokeDasharray: '1000',
              strokeDashoffset: isInView ? 0 : 1000,
              transition: `all 2s ease-out ${path.delay}ms`,
            }}
          />
        ))}
        
        {/* Animated dots along paths */}
        {paths.map((path, i) => (
          <circle
            key={`dot-${i}`}
            r="6"
            fill={path.color}
            style={{
              opacity: isInView ? 1 : 0,
              animation: isInView ? `move-along-path-${i} 4s ease-in-out infinite ${path.delay}ms` : 'none',
            }}
          >
            <animateMotion
              dur="4s"
              repeatCount="indefinite"
              path={path.d}
            />
          </circle>
        ))}
      </svg>
    </div>
  );
}

/**
 * Card flip reveal animation wrapper
 */
interface CardFlipRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function CardFlipReveal({
  children,
  delay = 0,
  className = '',
}: CardFlipRevealProps) {
  const [ref, isInView] = useInView(0.2, '0px', true);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        perspective: '1000px',
      }}
    >
      <div
        style={{
          transform: isInView ? 'rotateY(0deg)' : 'rotateY(-90deg)',
          transformStyle: 'preserve-3d',
          transition: `transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
          opacity: isInView ? 1 : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Orbiting social icons effect
 */
interface OrbitingIconsProps {
  icons: React.ReactNode[];
  radius?: number;
  duration?: number;
  className?: string;
}

export function OrbitingIcons({
  icons,
  radius = 50,
  duration = 20,
  className = '',
}: OrbitingIconsProps) {
  const [ref, isInView] = useInView(0.2, '0px', true);

  return (
    <div ref={ref} className={`relative ${className}`} style={{ width: radius * 2.5, height: radius * 2.5 }}>
      {icons.map((icon, i) => {
        const angle = (i * 360) / icons.length;
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              transform: `rotate(${angle}deg) translateX(${radius}px)`,
              opacity: isInView ? 1 : 0,
              animation: isInView ? `orbit ${duration}s linear infinite` : 'none',
              animationDelay: `${-i * (duration / icons.length)}s`,
              transition: `opacity 0.5s ease-out ${i * 100}ms`,
            }}
          >
            <div style={{ transform: `rotate(-${angle}deg)` }}>
              {icon}
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(${radius}px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(${radius}px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}

export default TeamCircleAnimation;

