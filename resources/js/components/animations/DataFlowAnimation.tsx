import React, { useEffect, useState, useRef } from 'react';
import { useInView, useElementScrollProgress } from '@/hooks/useScrollAnimation';

interface DataNode {
  id: string;
  x: number;
  y: number;
  label?: string;
  icon?: 'database' | 'server' | 'user' | 'code' | 'cloud' | 'shield' | 'chart';
  color?: string;
  size?: number;
}

interface Connection {
  from: string;
  to: string;
  animated?: boolean;
}

interface DataFlowAnimationProps {
  nodes?: DataNode[];
  connections?: Connection[];
  width?: number;
  height?: number;
  className?: string;
  particleCount?: number;
  particleSpeed?: number;
}

// Default nodes for tech/data visualization
const defaultNodes: DataNode[] = [
  { id: 'student', x: 80, y: 150, icon: 'user', color: '#3b82f6', label: 'Students' },
  { id: 'company', x: 320, y: 80, icon: 'server', color: '#10b981', label: 'Companies' },
  { id: 'icms', x: 200, y: 200, icon: 'cloud', color: '#8b5cf6', label: 'ICMS', size: 40 },
  { id: 'advisor', x: 320, y: 320, icon: 'shield', color: '#f59e0b', label: 'Advisors' },
  { id: 'data', x: 80, y: 280, icon: 'database', color: '#ec4899', label: 'Data' },
  { id: 'analytics', x: 350, y: 200, icon: 'chart', color: '#06b6d4', label: 'Analytics' },
];

const defaultConnections: Connection[] = [
  { from: 'student', to: 'icms', animated: true },
  { from: 'company', to: 'icms', animated: true },
  { from: 'advisor', to: 'icms', animated: true },
  { from: 'data', to: 'icms', animated: true },
  { from: 'icms', to: 'analytics', animated: true },
  { from: 'student', to: 'company', animated: false },
];

// Icon SVG paths
const iconPaths: Record<string, string> = {
  database: 'M12 2C8 2 4 3.5 4 6v12c0 2.5 4 4 8 4s8-1.5 8-4V6c0-2.5-4-4-8-4zM4 12c0 2.5 4 4 8 4s8-1.5 8-4',
  server: 'M4 6h16v4H4zM4 14h16v4H4zM8 8h.01M8 16h.01',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  code: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
  cloud: 'M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z',
  shield: 'M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z',
  chart: 'M18 20V10M12 20V4M6 20v-6',
};

/**
 * Animated data flow visualization with nodes and flowing particles
 */
export function DataFlowAnimation({
  nodes = defaultNodes,
  connections = defaultConnections,
  width = 400,
  height = 400,
  className = '',
  particleCount = 20,
  particleSpeed = 3,
}: DataFlowAnimationProps) {
  const [ref, isInView] = useInView(0.2, '0px', true);
  const [particles, setParticles] = useState<Array<{
    id: number;
    connectionIndex: number;
    progress: number;
    speed: number;
  }>>([]);
  const animationRef = useRef<number | undefined>(undefined);

  // Initialize particles
  useEffect(() => {
    if (!isInView) return;

    const animatedConnections = connections.filter(c => c.animated);
    const initialParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      connectionIndex: i % animatedConnections.length,
      progress: Math.random(),
      speed: (0.5 + Math.random() * 0.5) * particleSpeed,
    }));
    setParticles(initialParticles);
  }, [isInView, particleCount, particleSpeed, connections]);

  // Animate particles
  useEffect(() => {
    if (!isInView || particles.length === 0) return;

    const animate = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        progress: (particle.progress + particle.speed * 0.01) % 1,
      })));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isInView, particles.length]);

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  const getPathForConnection = (conn: Connection) => {
    const from = getNodeById(conn.from);
    const to = getNodeById(conn.to);
    if (!from || !to) return '';
    
    // Create curved path
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const offset = Math.sqrt(dx * dx + dy * dy) * 0.2;
    const controlX = midX - dy * offset / Math.sqrt(dx * dx + dy * dy);
    const controlY = midY + dx * offset / Math.sqrt(dx * dx + dy * dy);
    
    return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
  };

  const getPointOnPath = (path: string, progress: number) => {
    const svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    svgPath.setAttribute('d', path);
    const length = svgPath.getTotalLength();
    const point = svgPath.getPointAtLength(length * progress);
    return { x: point.x, y: point.y };
  };

  return (
    <div ref={ref} className={className}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        <defs>
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Gradient for lines */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Connection lines */}
        {connections.map((conn, index) => {
          const path = getPathForConnection(conn);
          return (
            <path
              key={`conn-${index}`}
              d={path}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              strokeDasharray={conn.animated ? '5,5' : 'none'}
              style={{
                opacity: isInView ? 1 : 0,
                transition: `opacity 1s ease-out ${index * 100}ms`,
              }}
            />
          );
        })}

        {/* Flowing particles */}
        {particles.map((particle) => {
          const animatedConnections = connections.filter(c => c.animated);
          const conn = animatedConnections[particle.connectionIndex];
          if (!conn) return null;
          
          const path = getPathForConnection(conn);
          if (!path) return null;
          
          try {
            const point = getPointOnPath(path, particle.progress);
            return (
              <circle
                key={`particle-${particle.id}`}
                cx={point.x}
                cy={point.y}
                r={3}
                fill="#a855f7"
                filter="url(#glow)"
                style={{ opacity: 0.8 }}
              />
            );
          } catch {
            return null;
          }
        })}

        {/* Nodes */}
        {nodes.map((node, index) => {
          const size = node.size || 30;
          const iconPath = node.icon ? iconPaths[node.icon] : '';
          
          return (
            <g
              key={node.id}
              style={{
                opacity: isInView ? 1 : 0,
                transform: isInView ? 'scale(1)' : 'scale(0)',
                transformOrigin: `${node.x}px ${node.y}px`,
                transition: `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${500 + index * 150}ms`,
              }}
            >
              {/* Node background */}
              <circle
                cx={node.x}
                cy={node.y}
                r={size / 2 + 5}
                fill={`${node.color}20`}
                className="animate-pulse"
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={size / 2}
                fill={node.color}
                filter="url(#glow)"
              />
              
              {/* Icon */}
              {iconPath && (
                <g transform={`translate(${node.x - 10}, ${node.y - 10}) scale(0.8)`}>
                  <path
                    d={iconPath}
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              )}
              
              {/* Label */}
              {node.label && (
                <text
                  x={node.x}
                  y={node.y + size / 2 + 18}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-600 dark:fill-gray-300"
                >
                  {node.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Circuit board pattern animation
 */
interface CircuitPatternProps {
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
  className?: string;
}

export function CircuitPattern({
  width = 400,
  height = 300,
  color = '#6366f1',
  opacity = 0.2,
  className = '',
}: CircuitPatternProps) {
  const [ref, isInView] = useInView(0.1, '0px', true);
  
  const lines = [
    'M20 50 L80 50 L80 100 L120 100',
    'M50 20 L50 80 L100 80',
    'M150 30 L150 70 L200 70 L200 120',
    'M250 50 L300 50 L300 100',
    'M30 150 L80 150 L80 200 L130 200',
    'M200 150 L200 200 L280 200',
    'M100 250 L180 250 L180 280',
    'M300 200 L350 200 L350 250',
  ];
  
  const dots = [
    { x: 80, y: 50 }, { x: 120, y: 100 }, { x: 50, y: 80 },
    { x: 150, y: 70 }, { x: 200, y: 120 }, { x: 300, y: 100 },
    { x: 80, y: 150 }, { x: 130, y: 200 }, { x: 280, y: 200 },
    { x: 180, y: 250 }, { x: 350, y: 250 },
  ];

  return (
    <div ref={ref} className={className}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {lines.map((d, i) => (
          <path
            key={`line-${i}`}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{
              opacity: isInView ? opacity : 0,
              strokeDasharray: '500',
              strokeDashoffset: isInView ? 0 : 500,
              transition: `all 1.5s ease-out ${i * 100}ms`,
            }}
          />
        ))}
        {dots.map((dot, i) => (
          <circle
            key={`dot-${i}`}
            cx={dot.x}
            cy={dot.y}
            r="4"
            fill={color}
            style={{
              opacity: isInView ? opacity * 1.5 : 0,
              transform: isInView ? 'scale(1)' : 'scale(0)',
              transformOrigin: `${dot.x}px ${dot.y}px`,
              transition: `all 0.4s ease-out ${800 + i * 50}ms`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

/**
 * Animated code block floating effect
 */
interface FloatingCodeProps {
  className?: string;
}

export function FloatingCode({ className = '' }: FloatingCodeProps) {
  const codeSnippets = [
    '{ data: flow }',
    'async connect()',
    '<Student />',
    'query.find()',
    'export default',
    '=> success',
  ];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {codeSnippets.map((code, i) => (
        <div
          key={i}
          className="absolute text-xs font-mono text-indigo-400/30 dark:text-indigo-300/20"
          style={{
            left: `${10 + (i * 15) % 80}%`,
            top: `${5 + (i * 20) % 90}%`,
            animation: `float ${8 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        >
          {code}
        </div>
      ))}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-30px) rotate(3deg); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

export default DataFlowAnimation;

