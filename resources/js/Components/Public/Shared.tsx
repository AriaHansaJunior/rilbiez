import React, { useEffect, useRef, useState, ReactNode, createContext, useContext } from 'react';

export const CONTAINER = 'max-w-[1300px] mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20';

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-8 select-none">
      <span className="block w-6 h-px bg-accent flex-shrink-0" />
      <span className="font-mono text-[11px] sm:text-[12px] tracking-[0.16em] text-accent uppercase font-medium">
        {children}
      </span>
    </div>
  );
}

export const ResetContext = createContext(0);

export function useIntersection(options = { threshold: 0.25 }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const resetSignal = useContext(ResetContext);

  useEffect(() => {
    if (resetSignal > 0) {
      setVisible(false);
    }
  }, [resetSignal]);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    
    // Fallback if IntersectionObserver is not supported
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
      }
    }, options);

    obs.observe(el);
    return () => obs.disconnect();
  }, [options.threshold, visible]);

  return { ref, visible };
}

export function Reveal({
  children,
  delay = 0,
  direction = 'up',
  distance = 30,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  className?: string;
}) {
  const { ref, visible } = useIntersection();

  let transform = 'translate3d(0,0,0)';
  if (!visible) {
    switch (direction) {
      case 'up': transform = `translate3d(0, ${distance}px, 0)`; break;
      case 'down': transform = `translate3d(0, -${distance}px, 0)`; break;
      case 'left': transform = `translate3d(${distance}px, 0, 0)`; break;
      case 'right': transform = `translate3d(-${distance}px, 0, 0)`; break;
      case 'none': transform = 'translate3d(0,0,0) scale(0.96)'; break;
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0,0,0) scale(1)' : transform,
        transition: `opacity 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms, transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

const StaggerContext = createContext({ baseDelay: 0, interval: 200, isVisible: false });

export function StaggerGroup({ children, delay = 0, interval = 200, className = '' }: { children: ReactNode, delay?: number, interval?: number, className?: string }) {
  const { ref, visible } = useIntersection();
  return (
    <div ref={ref} className={className}>
      <StaggerContext.Provider value={{ baseDelay: delay, interval, isVisible: visible }}>
        {children}
      </StaggerContext.Provider>
    </div>
  );
}

export function StaggerItem({ children, index, direction = 'up', distance = 30, className = '' }: { children: ReactNode, index: number, direction?: 'up'|'down'|'left'|'right'|'none', distance?: number, className?: string }) {
  const { baseDelay, interval, isVisible } = useContext(StaggerContext);
  
  let transform = 'translate3d(0,0,0)';
  if (!isVisible) {
    switch (direction) {
      case 'up': transform = `translate3d(0, ${distance}px, 0)`; break;
      case 'down': transform = `translate3d(0, -${distance}px, 0)`; break;
      case 'left': transform = `translate3d(${distance}px, 0, 0)`; break;
      case 'right': transform = `translate3d(-${distance}px, 0, 0)`; break;
      case 'none': transform = 'translate3d(0,0,0) scale(0.96)'; break;
    }
  }

  const itemDelay = baseDelay + (index * interval);

  return (
    <div
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0,0,0) scale(1)' : transform,
        transition: `opacity 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) ${itemDelay}ms, transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) ${itemDelay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
