import React, { ReactNode } from 'react';
import { useInView } from '@/hooks/useScrollAnimation';

type AnimationType = 
  | 'fadeIn' 
  | 'fadeInUp' 
  | 'fadeInDown' 
  | 'fadeInLeft' 
  | 'fadeInRight'
  | 'scaleIn'
  | 'rotateIn'
  | 'flipIn'
  | 'slideInLeft'
  | 'slideInRight'
  | 'bounceIn'
  | 'zoomIn';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
  triggerOnce?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const animationStyles: Record<AnimationType, { initial: React.CSSProperties; animate: React.CSSProperties }> = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  fadeInUp: {
    initial: { opacity: 0, transform: 'translateY(60px)' },
    animate: { opacity: 1, transform: 'translateY(0)' },
  },
  fadeInDown: {
    initial: { opacity: 0, transform: 'translateY(-60px)' },
    animate: { opacity: 1, transform: 'translateY(0)' },
  },
  fadeInLeft: {
    initial: { opacity: 0, transform: 'translateX(-60px)' },
    animate: { opacity: 1, transform: 'translateX(0)' },
  },
  fadeInRight: {
    initial: { opacity: 0, transform: 'translateX(60px)' },
    animate: { opacity: 1, transform: 'translateX(0)' },
  },
  scaleIn: {
    initial: { opacity: 0, transform: 'scale(0.8)' },
    animate: { opacity: 1, transform: 'scale(1)' },
  },
  rotateIn: {
    initial: { opacity: 0, transform: 'rotate(-10deg) scale(0.9)' },
    animate: { opacity: 1, transform: 'rotate(0deg) scale(1)' },
  },
  flipIn: {
    initial: { opacity: 0, transform: 'perspective(1000px) rotateY(-90deg)' },
    animate: { opacity: 1, transform: 'perspective(1000px) rotateY(0deg)' },
  },
  slideInLeft: {
    initial: { opacity: 0, transform: 'translateX(-100%)' },
    animate: { opacity: 1, transform: 'translateX(0)' },
  },
  slideInRight: {
    initial: { opacity: 0, transform: 'translateX(100%)' },
    animate: { opacity: 1, transform: 'translateX(0)' },
  },
  bounceIn: {
    initial: { opacity: 0, transform: 'scale(0.3)' },
    animate: { opacity: 1, transform: 'scale(1)' },
  },
  zoomIn: {
    initial: { opacity: 0, transform: 'scale(0.5)' },
    animate: { opacity: 1, transform: 'scale(1)' },
  },
};

export function ScrollReveal({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = 800,
  threshold = 0.1,
  triggerOnce = true,
  className = '',
  style = {},
}: ScrollRevealProps) {
  const [ref, isInView] = useInView(threshold, '0px', triggerOnce);
  const animConfig = animationStyles[animation];

  const currentStyle = isInView ? animConfig.animate : animConfig.initial;
  
  const timingFunction = animation === 'bounceIn' 
    ? 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' 
    : 'cubic-bezier(0.4, 0, 0.2, 1)';

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        ...currentStyle,
        transition: `all ${duration}ms ${timingFunction} ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Staggered reveal for multiple children
 */
interface StaggeredRevealProps {
  children: ReactNode[];
  animation?: AnimationType;
  staggerDelay?: number;
  baseDuration?: number;
  threshold?: number;
  className?: string;
  itemClassName?: string;
}

export function StaggeredReveal({
  children,
  animation = 'fadeInUp',
  staggerDelay = 100,
  baseDuration = 600,
  threshold = 0.1,
  className = '',
  itemClassName = '',
}: StaggeredRevealProps) {
  const [ref, isInView] = useInView(threshold, '0px', true);

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, index) => {
        const animConfig = animationStyles[animation];
        const currentStyle = isInView ? animConfig.animate : animConfig.initial;
        
        return (
          <div
            className={itemClassName}
            style={{
              ...currentStyle,
              transition: `all ${baseDuration}ms cubic-bezier(0.4, 0, 0.2, 1) ${index * staggerDelay}ms`,
              willChange: 'opacity, transform',
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}

export default ScrollReveal;

