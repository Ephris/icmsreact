import React, { useEffect, useRef, useState } from 'react';
import { useInView, useElementScrollProgress } from '@/hooks/useScrollAnimation';

interface AnimatedPathProps {
  d: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  duration?: number;
  delay?: number;
  className?: string;
  animateOnScroll?: boolean;
}

/**
 * SVG path that draws itself when in view
 */
export function AnimatedPath({
  d,
  stroke = 'currentColor',
  strokeWidth = 2,
  fill = 'none',
  duration = 2000,
  delay = 0,
  className = '',
  animateOnScroll = true,
}: AnimatedPathProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [ref, isInView] = useInView(0.2, '0px', true);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [d]);

  const shouldAnimate = animateOnScroll ? isInView : true;

  return (
    <g ref={ref as unknown as React.RefObject<SVGGElement>}>
      <path
        ref={pathRef}
        d={d}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={fill}
        className={className}
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: shouldAnimate ? 0 : pathLength,
          transition: `stroke-dashoffset ${duration}ms ease-out ${delay}ms`,
        }}
      />
    </g>
  );
}

interface AnimatedCircleProps {
  cx: number;
  cy: number;
  r: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  delay?: number;
  duration?: number;
  pulseAnimation?: boolean;
  className?: string;
}

/**
 * Circle that scales in when in view with optional pulse
 */
export function AnimatedCircle({
  cx,
  cy,
  r,
  fill = 'currentColor',
  stroke = 'none',
  strokeWidth = 0,
  delay = 0,
  duration = 600,
  pulseAnimation = false,
  className = '',
}: AnimatedCircleProps) {
  const [ref, isInView] = useInView(0.2, '0px', true);

  return (
    <g ref={ref as unknown as React.RefObject<SVGGElement>}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        className={className}
        style={{
          transform: isInView ? 'scale(1)' : 'scale(0)',
          transformOrigin: `${cx}px ${cy}px`,
          transition: `transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
          animation: pulseAnimation && isInView ? 'pulse-circle 2s ease-in-out infinite' : 'none',
        }}
      />
      {pulseAnimation && (
        <style>{`
          @keyframes pulse-circle {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}</style>
      )}
    </g>
  );
}

interface NetworkNodeProps {
  nodes: { x: number; y: number; label?: string }[];
  connections: [number, number][];
  nodeRadius?: number;
  nodeColor?: string;
  lineColor?: string;
  lineWidth?: number;
  className?: string;
  width?: number;
  height?: number;
  animated?: boolean;
}

/**
 * Animated network of connected nodes
 */
export function NetworkGraph({
  nodes,
  connections,
  nodeRadius = 8,
  nodeColor = '#6366f1',
  lineColor = '#a5b4fc',
  lineWidth = 2,
  className = '',
  width = 400,
  height = 300,
  animated = true,
}: NetworkNodeProps) {
  const [ref, isInView] = useInView(0.2, '0px', true);

  return (
    <svg
      ref={ref as unknown as React.RefObject<SVGSVGElement>}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      {/* Connection lines */}
      {connections.map(([from, to], index) => {
        const fromNode = nodes[from];
        const toNode = nodes[to];
        if (!fromNode || !toNode) return null;

        const pathD = `M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`;
        
        return animated ? (
          <AnimatedPath
            key={`line-${index}`}
            d={pathD}
            stroke={lineColor}
            strokeWidth={lineWidth}
            duration={1000}
            delay={index * 100}
            animateOnScroll={false}
          />
        ) : (
          <path
            key={`line-${index}`}
            d={pathD}
            stroke={lineColor}
            strokeWidth={lineWidth}
          />
        );
      })}
      
      {/* Nodes */}
      {nodes.map((node, index) => (
        <AnimatedCircle
          key={`node-${index}`}
          cx={node.x}
          cy={node.y}
          r={nodeRadius}
          fill={nodeColor}
          delay={animated ? 500 + index * 150 : 0}
          duration={600}
          pulseAnimation={animated}
        />
      ))}
    </svg>
  );
}

interface DrawingIconProps {
  icon: 'checkmark' | 'shield' | 'star' | 'document' | 'user' | 'briefcase' | 'graduation';
  size?: number;
  color?: string;
  strokeWidth?: number;
  duration?: number;
  delay?: number;
  className?: string;
}

const iconPaths: Record<string, string> = {
  checkmark: 'M5 12l5 5L20 7',
  shield: 'M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  document: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  briefcase: 'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16',
  graduation: 'M22 10l-10-5-10 5 10 5 10-5z M6 12v5c0 2 3 4 6 4s6-2 6-4v-5',
};

/**
 * Icon that draws itself with path animation
 */
export function DrawingIcon({
  icon,
  size = 48,
  color = 'currentColor',
  strokeWidth = 2,
  duration = 1500,
  delay = 0,
  className = '',
}: DrawingIconProps) {
  const path = iconPaths[icon];
  if (!path) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <AnimatedPath
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        duration={duration}
        delay={delay}
      />
    </svg>
  );
}

interface ScrollLinkedSVGProps {
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
  viewBox?: string;
  className?: string;
}

/**
 * SVG container that provides scroll progress to children
 */
export function ScrollLinkedSVG({
  children,
  width = '100%',
  height = '100%',
  viewBox = '0 0 100 100',
  className = '',
}: ScrollLinkedSVGProps) {
  const [ref, progress] = useElementScrollProgress();

  return (
    <div ref={ref}>
      <svg
        width={width}
        height={height}
        viewBox={viewBox}
        className={className}
        style={{ '--scroll-progress': progress } as React.CSSProperties}
      >
        {children}
      </svg>
    </div>
  );
}

export default AnimatedPath;

