import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Sunrise,
  CalendarDays,
  Clock,
  Timer,
  ListChecks,
  CheckCircle2,
  Route,
  Footprints,
  Mountain,
  Milestone,
  Flag,
  TrendingUp,
  Flame,
  Sprout,
  Target,
  Trophy,
  Compass,
  MapPin,
} from 'lucide-react';

interface Particle {
  id: number;
  top: number;
  start: number;
  size: number;
  duration: number;
  delay: number;
  yDrift: number;
  xDrift: number;
  isMobile: boolean;
}

// 48 seeded, stable particles evenly scattered toward margins and background
const STABLE_PARTICLES: Particle[] = [
  { id: 1, top: 5, start: 7, size: 3, duration: 16, delay: 0, yDrift: -24, xDrift: 12, isMobile: true },
  { id: 2, top: 12, start: 18, size: 2, duration: 20, delay: 1.5, yDrift: -30, xDrift: -10, isMobile: false },
  { id: 3, top: 8, start: 35, size: 4, duration: 18, delay: 2.2, yDrift: -22, xDrift: 14, isMobile: true },
  { id: 4, top: 15, start: 72, size: 3, duration: 22, delay: 0.8, yDrift: -28, xDrift: -8, isMobile: false },
  { id: 5, top: 6, start: 88, size: 3, duration: 15, delay: 3, yDrift: -26, xDrift: 15, isMobile: true },
  { id: 6, top: 18, start: 94, size: 2, duration: 24, delay: 1.2, yDrift: -32, xDrift: -12, isMobile: false },
  { id: 7, top: 25, start: 5, size: 4, duration: 17, delay: 2.8, yDrift: -25, xDrift: 10, isMobile: true },
  { id: 8, top: 32, start: 14, size: 2, duration: 21, delay: 0.5, yDrift: -20, xDrift: -14, isMobile: false },
  { id: 9, top: 28, start: 85, size: 3, duration: 19, delay: 3.4, yDrift: -30, xDrift: 12, isMobile: true },
  { id: 10, top: 35, start: 92, size: 4, duration: 14, delay: 1.8, yDrift: -22, xDrift: -10, isMobile: false },
  { id: 11, top: 42, start: 8, size: 3, duration: 23, delay: 2.5, yDrift: -27, xDrift: 15, isMobile: true },
  { id: 12, top: 48, start: 19, size: 2, duration: 18, delay: 4, yDrift: -24, xDrift: -8, isMobile: false },
  { id: 13, top: 45, start: 82, size: 4, duration: 16, delay: 0.3, yDrift: -32, xDrift: 14, isMobile: true },
  { id: 14, top: 52, start: 95, size: 3, duration: 25, delay: 2.1, yDrift: -28, xDrift: -12, isMobile: false },
  { id: 15, top: 58, start: 6, size: 2, duration: 20, delay: 1.1, yDrift: -22, xDrift: 8, isMobile: true },
  { id: 16, top: 65, start: 15, size: 3, duration: 15, delay: 3.8, yDrift: -30, xDrift: -14, isMobile: false },
  { id: 17, top: 62, start: 86, size: 3, duration: 22, delay: 0.7, yDrift: -26, xDrift: 11, isMobile: true },
  { id: 18, top: 68, start: 93, size: 4, duration: 19, delay: 2.9, yDrift: -20, xDrift: -9, isMobile: false },
  { id: 19, top: 74, start: 9, size: 3, duration: 17, delay: 1.6, yDrift: -29, xDrift: 13, isMobile: true },
  { id: 20, top: 82, start: 16, size: 2, duration: 21, delay: 4.2, yDrift: -25, xDrift: -11, isMobile: false },
  { id: 21, top: 78, start: 80, size: 4, duration: 16, delay: 0.9, yDrift: -31, xDrift: 15, isMobile: true },
  { id: 22, top: 85, start: 90, size: 3, duration: 24, delay: 2.7, yDrift: -23, xDrift: -10, isMobile: false },
  { id: 23, top: 92, start: 11, size: 3, duration: 18, delay: 1.4, yDrift: -28, xDrift: 9, isMobile: true },
  { id: 24, top: 95, start: 24, size: 2, duration: 22, delay: 3.2, yDrift: -24, xDrift: -15, isMobile: false },
  { id: 25, top: 90, start: 74, size: 4, duration: 15, delay: 0.2, yDrift: -30, xDrift: 12, isMobile: true },
  { id: 26, top: 94, start: 86, size: 3, duration: 20, delay: 2.4, yDrift: -26, xDrift: -8, isMobile: false },
  { id: 27, top: 11, start: 50, size: 2, duration: 23, delay: 3.1, yDrift: -21, xDrift: 10, isMobile: false },
  { id: 28, top: 22, start: 30, size: 3, duration: 17, delay: 1.7, yDrift: -27, xDrift: -12, isMobile: false },
  { id: 29, top: 38, start: 26, size: 4, duration: 19, delay: 4.5, yDrift: -25, xDrift: 14, isMobile: false },
  { id: 30, top: 72, start: 32, size: 2, duration: 21, delay: 0.6, yDrift: -32, xDrift: -9, isMobile: false },
  { id: 31, top: 86, start: 42, size: 3, duration: 16, delay: 2.3, yDrift: -22, xDrift: 11, isMobile: true },
  { id: 32, top: 14, start: 62, size: 3, duration: 25, delay: 1.9, yDrift: -29, xDrift: -13, isMobile: false },
  { id: 33, top: 29, start: 68, size: 2, duration: 18, delay: 3.6, yDrift: -23, xDrift: 15, isMobile: false },
  { id: 34, top: 56, start: 70, size: 4, duration: 22, delay: 0.4, yDrift: -31, xDrift: -10, isMobile: false },
  { id: 35, top: 80, start: 64, size: 3, duration: 14, delay: 2.6, yDrift: -24, xDrift: 12, isMobile: true },
  { id: 36, top: 3, start: 22, size: 2, duration: 20, delay: 4.1, yDrift: -28, xDrift: -11, isMobile: false },
  { id: 37, top: 19, start: 42, size: 3, duration: 17, delay: 1.3, yDrift: -26, xDrift: 8, isMobile: false },
  { id: 38, top: 61, start: 28, size: 4, duration: 24, delay: 3.5, yDrift: -30, xDrift: -14, isMobile: false },
  { id: 39, top: 88, start: 18, size: 3, duration: 16, delay: 0.8, yDrift: -22, xDrift: 13, isMobile: true },
  { id: 40, top: 4, start: 78, size: 2, duration: 21, delay: 2.9, yDrift: -27, xDrift: -9, isMobile: false },
  { id: 41, top: 34, start: 76, size: 3, duration: 18, delay: 4.4, yDrift: -25, xDrift: 14, isMobile: false },
  { id: 42, top: 66, start: 75, size: 4, duration: 23, delay: 1.0, yDrift: -32, xDrift: -12, isMobile: false },
  { id: 43, top: 96, start: 60, size: 2, duration: 15, delay: 3.3, yDrift: -21, xDrift: 10, isMobile: true },
  { id: 44, top: 16, start: 8, size: 3, duration: 22, delay: 2.0, yDrift: -29, xDrift: -15, isMobile: false },
  { id: 45, top: 46, start: 92, size: 3, duration: 19, delay: 0.5, yDrift: -24, xDrift: 11, isMobile: true },
  { id: 46, top: 76, start: 89, size: 2, duration: 17, delay: 3.7, yDrift: -30, xDrift: -8, isMobile: false },
  { id: 47, top: 84, start: 4, size: 4, duration: 20, delay: 1.6, yDrift: -26, xDrift: 13, isMobile: true },
  { id: 48, top: 53, start: 4, size: 3, duration: 26, delay: 4.8, yDrift: -28, xDrift: -10, isMobile: false },
];

interface FloatingIconConfig {
  id: string;
  icon: React.ElementType;
  size: number;
  top: number;
  start: number;
  duration: number;
  delay: number;
  yOffset: number;
  rot1: number;
  rot2: number;
  isMobile: boolean;
}

// 16 thematic icons (Daily planning, Progress path, Goals & achievement)
const FLOATING_ICONS: FloatingIconConfig[] = [
  // 1. Daily Planning: Sunrise (fresh morning planning)
  {
    id: 'sunrise',
    icon: Sunrise,
    size: 44,
    top: 7,
    start: 8,
    duration: 14,
    delay: 0,
    yOffset: -18,
    rot1: -4,
    rot2: 4,
    isMobile: true,
  },
  // 2. Daily Planning: Clock (time management)
  {
    id: 'clock',
    icon: Clock,
    size: 34,
    top: 22,
    start: 5,
    duration: 18,
    delay: 1.5,
    yOffset: -20,
    rot1: -6,
    rot2: 5,
    isMobile: true,
  },
  // 3. Daily Planning: Timer (focus blocks)
  {
    id: 'timer',
    icon: Timer,
    size: 32,
    top: 48,
    start: 7,
    duration: 16,
    delay: 3,
    yOffset: -16,
    rot1: 5,
    rot2: -5,
    isMobile: false,
  },
  // 4. Daily Planning: CalendarDays (weekly rhythm)
  {
    id: 'calendar-days',
    icon: CalendarDays,
    size: 40,
    top: 76,
    start: 7,
    duration: 15,
    delay: 0.8,
    yOffset: -22,
    rot1: -5,
    rot2: 6,
    isMobile: true,
  },
  // 5. Daily Planning: ListChecks (structured tasks)
  {
    id: 'list-checks',
    icon: ListChecks,
    size: 36,
    top: 90,
    start: 24,
    duration: 19,
    delay: 2.2,
    yOffset: -18,
    rot1: 4,
    rot2: -6,
    isMobile: false,
  },
  // 6. Daily Planning: CheckCircle2 (satisfying completion)
  {
    id: 'check-circle',
    icon: CheckCircle2,
    size: 30,
    top: 68,
    start: 38,
    duration: 17,
    delay: 3.5,
    yOffset: -15,
    rot1: -4,
    rot2: 4,
    isMobile: false,
  },
  // 7. Progress Path: Route (the overall journey)
  {
    id: 'route',
    icon: Route,
    size: 46,
    top: 80,
    start: 78,
    duration: 15,
    delay: 1.1,
    yOffset: -20,
    rot1: -6,
    rot2: 6,
    isMobile: true,
  },
  // 8. Progress Path: Footprints (step-by-step consistency)
  {
    id: 'footprints',
    icon: Footprints,
    size: 32,
    top: 68,
    start: 90,
    duration: 18,
    delay: 2.7,
    yOffset: -16,
    rot1: 6,
    rot2: -4,
    isMobile: false,
  },
  // 9. Progress Path: Mountain (the high summit of aspiration)
  {
    id: 'mountain',
    icon: Mountain,
    size: 48,
    top: 16,
    start: 91,
    duration: 20,
    delay: 0.5,
    yOffset: -22,
    rot1: -4,
    rot2: 4,
    isMobile: true,
  },
  // 10. Progress Path: Milestone (marking daily progress)
  {
    id: 'milestone',
    icon: Milestone,
    size: 36,
    top: 34,
    start: 92,
    duration: 16,
    delay: 3.1,
    yOffset: -18,
    rot1: 5,
    rot2: -5,
    isMobile: false,
  },
  // 11. Progress Path: TrendingUp (continuous improvement)
  {
    id: 'trending-up',
    icon: TrendingUp,
    size: 38,
    top: 50,
    start: 88,
    duration: 17,
    delay: 1.8,
    yOffset: -20,
    rot1: -5,
    rot2: 5,
    isMobile: false,
  },
  // 12. Progress Path: Flame (daily habit streak)
  {
    id: 'flame',
    icon: Flame,
    size: 36,
    top: 91,
    start: 56,
    duration: 13,
    delay: 2.5,
    yOffset: -17,
    rot1: 4,
    rot2: -6,
    isMobile: false,
  },
  // 13. Progress Path: Sprout (knowledge & skill growth)
  {
    id: 'sprout',
    icon: Sprout,
    size: 32,
    top: 60,
    start: 14,
    duration: 19,
    delay: 0.9,
    yOffset: -16,
    rot1: -5,
    rot2: 5,
    isMobile: false,
  },
  // 14. Goals & Achievement: Target (precision objectives)
  {
    id: 'target',
    icon: Target,
    size: 44,
    top: 6,
    start: 83,
    duration: 15,
    delay: 1.4,
    yOffset: -20,
    rot1: -4,
    rot2: 6,
    isMobile: true,
  },
  // 15. Goals & Achievement: Trophy (milestone celebration)
  {
    id: 'trophy',
    icon: Trophy,
    size: 40,
    top: 8,
    start: 46,
    duration: 18,
    delay: 2.9,
    yOffset: -18,
    rot1: 5,
    rot2: -4,
    isMobile: false,
  },
  // 16. Goals & Achievement: Compass (guidance along the path)
  {
    id: 'compass',
    icon: Compass,
    size: 38,
    top: 30,
    start: 22,
    duration: 16,
    delay: 0.6,
    yOffset: -19,
    rot1: -6,
    rot2: 6,
    isMobile: false,
  },
];

export const FloatingBackground: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);

  // Mouse interaction state refs
  const mouseState = useRef({
    x: -9999,
    y: -9999,
    active: false,
    framesRemaining: 0,
  });
  const rafId = useRef<number | null>(null);

  // Measured base coordinates (screen px)
  const particleBases = useRef<{ x: number; y: number }[]>([]);
  const iconBases = useRef<{ x: number; y: number }[]>([]);

  // DOM node references
  const containerRef = useRef<HTMLDivElement>(null);
  const particleWrappersRef = useRef<(HTMLDivElement | null)[]>([]);
  const particleInnersRef = useRef<(HTMLDivElement | null)[]>([]);
  const iconWrappersRef = useRef<(HTMLDivElement | null)[]>([]);
  const cursorLinesRef = useRef<(SVGLineElement | null)[]>([]);

  // Pause heavy updates when user switches browser tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const isStatic = shouldReduceMotion || !isVisible;

  // Measure initial and current on-screen positions of all particles and icons
  const measurePositions = useCallback(() => {
    particleBases.current = particleWrappersRef.current.map((el) => {
      if (!el) return { x: -9999, y: -9999 };
      const rect = el.getBoundingClientRect();
      const shiftX = Number(el.dataset.shiftX || 0);
      const shiftY = Number(el.dataset.shiftY || 0);
      return {
        x: rect.left + rect.width / 2 - shiftX,
        y: rect.top + rect.height / 2 - shiftY,
      };
    });

    iconBases.current = iconWrappersRef.current.map((el) => {
      if (!el) return { x: -9999, y: -9999 };
      const rect = el.getBoundingClientRect();
      const shiftX = Number(el.dataset.shiftX || 0);
      const shiftY = Number(el.dataset.shiftY || 0);
      return {
        x: rect.left + rect.width / 2 - shiftX,
        y: rect.top + rect.height / 2 - shiftY,
      };
    });
  }, []);

  useEffect(() => {
    // Measure on mount
    const id = requestAnimationFrame(() => {
      measurePositions();
    });

    // Recompute on resize (debounced)
    let resizeTimer: any = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        measurePositions();
      }, 100);
    };

    // Recompute on scroll
    const handleScroll = () => {
      measurePositions();
    };

    // Periodic recomputation every ~500ms since inner animation drifts
    const intervalId = setInterval(() => {
      measurePositions();
    }, 500);

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(id);
      if (resizeTimer) clearTimeout(resizeTimer);
      clearInterval(intervalId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [measurePositions]);

  // Mouse interactivity: repulsion, lighting up, scaling, and cursor constellation lines
  useEffect(() => {
    if (isStatic) return;

    // Strict pointer: fine check to ensure only mouse/trackpad pointer interaction
    const hasFinePointer = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) return;

    const tick = () => {
      if (mouseState.current.framesRemaining <= 0) {
        rafId.current = null;
        return;
      }
      mouseState.current.framesRemaining--;

      const cx = mouseState.current.x;
      const cy = mouseState.current.y;
      const active = mouseState.current.active;
      const nearestParticles: { x: number; y: number; dist: number }[] = [];

      // 1. Process Particles (~140px radius)
      for (let i = 0; i < STABLE_PARTICLES.length; i++) {
        const wrap = particleWrappersRef.current[i];
        const inner = particleInnersRef.current[i];
        const base = particleBases.current[i];
        if (!wrap || !base) continue;

        if (!active) {
          if (wrap.dataset.active === 'true') {
            wrap.style.transform = 'translate3d(0, 0, 0) scale(1)';
            wrap.style.color = 'var(--bg-fx-base)';
            wrap.style.filter = '';
            if (inner) inner.style.opacity = '';
            delete wrap.dataset.active;
            delete wrap.dataset.shiftX;
            delete wrap.dataset.shiftY;
          }
          continue;
        }

        const dx = base.x - cx;
        const dy = base.y - cy;
        const dist = Math.hypot(dx, dy);

        if (dist < 140) {
          wrap.dataset.active = 'true';
          const factor = Math.pow(1 - dist / 140, 2);
          const angle = Math.atan2(dy, dx);
          const repulse = factor * 24; // max ~24px displacement away from cursor
          const shiftX = Math.cos(angle) * repulse;
          const shiftY = Math.sin(angle) * repulse;
          const scale = 1 + factor * 0.6; // scale up to ~1.6

          wrap.dataset.shiftX = shiftX.toFixed(2);
          wrap.dataset.shiftY = shiftY.toFixed(2);

          wrap.style.transform = `translate3d(${shiftX.toFixed(1)}px, ${shiftY.toFixed(1)}px, 0) scale(${scale.toFixed(2)})`;
          wrap.style.color = 'var(--bg-fx-hover)';
          wrap.style.filter = `drop-shadow(0 0 ${Math.round(4 + factor * 6)}px currentColor)`;
          if (inner) {
            // Near the cursor particles go to full black (opacity ~1)
            inner.style.opacity = `${(0.85 + factor * 0.15).toFixed(2)}`;
          }

          nearestParticles.push({
            x: base.x + shiftX,
            y: base.y + shiftY,
            dist,
          });
        } else if (wrap.dataset.active === 'true') {
          wrap.style.transform = 'translate3d(0, 0, 0) scale(1)';
          wrap.style.color = 'var(--bg-fx-base)';
          wrap.style.filter = '';
          if (inner) inner.style.opacity = '';
          delete wrap.dataset.active;
          delete wrap.dataset.shiftX;
          delete wrap.dataset.shiftY;
        }
      }

      // 2. Draw faint 1px constellation lines from cursor to up to 5 nearest particles within radius
      nearestParticles.sort((a, b) => a.dist - b.dist);
      for (let i = 0; i < 5; i++) {
        const line = cursorLinesRef.current[i];
        if (!line) continue;
        if (active && i < nearestParticles.length) {
          const p = nearestParticles[i];
          line.setAttribute('x1', `${cx}`);
          line.setAttribute('y1', `${cy}`);
          line.setAttribute('x2', `${p.x.toFixed(1)}`);
          line.setAttribute('y2', `${p.y.toFixed(1)}`);
          line.setAttribute('stroke', 'var(--bg-fx-hover)');
          line.setAttribute('opacity', `${(0.4 * (1 - p.dist / 140)).toFixed(2)}`);
        } else {
          line.setAttribute('opacity', '0');
        }
      }

      // 3. Process Floating Icons (~200px radius)
      for (let i = 0; i < FLOATING_ICONS.length; i++) {
        const wrap = iconWrappersRef.current[i];
        const base = iconBases.current[i];
        if (!wrap || !base) continue;

        if (!active) {
          if (wrap.dataset.active === 'true') {
            wrap.style.transform = 'translate3d(0, 0, 0) scale(1)';
            wrap.style.color = 'var(--bg-fx-base)';
            wrap.style.opacity = '0.3';
            wrap.style.filter = 'none';
            delete wrap.dataset.active;
            delete wrap.dataset.shiftX;
            delete wrap.dataset.shiftY;
          }
          continue;
        }

        const dx = base.x - cx;
        const dy = base.y - cy;
        const dist = Math.hypot(dx, dy);

        if (dist < 200) {
          wrap.dataset.active = 'true';

          // Smooth falloff: the closer the cursor, the stronger the effect
          const linear = 1 - dist / 200;
          const intensity = linear * linear * (3 - 2 * linear);

          // Gently repel up to ~16px away from cursor
          const angle = Math.atan2(dy, dx);
          const repulse = intensity * 16;
          const shiftX = Math.cos(angle) * repulse;
          const shiftY = Math.sin(angle) * repulse;

          // Scale up to ~1.25
          const scale = 1 + intensity * 0.25;

          // Opacity goes from base (~0.3) up to ~1.0 near cursor
          const opacity = 0.3 + intensity * 0.7;

          wrap.dataset.shiftX = shiftX.toFixed(2);
          wrap.dataset.shiftY = shiftY.toFixed(2);

          wrap.style.transform = `translate3d(${shiftX.toFixed(1)}px, ${shiftY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
          wrap.style.color = 'var(--bg-fx-hover)';
          wrap.style.opacity = opacity.toFixed(2);
          wrap.style.filter = 'drop-shadow(0 0 8px currentColor)';
        } else if (wrap.dataset.active === 'true') {
          wrap.style.transform = 'translate3d(0, 0, 0) scale(1)';
          wrap.style.color = 'var(--bg-fx-base)';
          wrap.style.opacity = '0.3';
          wrap.style.filter = 'none';
          delete wrap.dataset.active;
          delete wrap.dataset.shiftX;
          delete wrap.dataset.shiftY;
        }
      }

      if (mouseState.current.framesRemaining > 0) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        rafId.current = null;
      }
    };

    const triggerUpdate = (frames = 5) => {
      mouseState.current.framesRemaining = Math.max(mouseState.current.framesRemaining, frames);
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(tick);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      mouseState.current.x = e.clientX;
      mouseState.current.y = e.clientY;
      mouseState.current.active = true;
      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
        containerRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
      }
      triggerUpdate(5);
    };

    const handlePointerLeave = () => {
      mouseState.current.x = -9999;
      mouseState.current.y = -9999;
      mouseState.current.active = false;
      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', '-9999px');
        containerRef.current.style.setProperty('--mouse-y', '-9999px');
      }
      triggerUpdate(5);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    window.addEventListener('blur', handlePointerLeave);

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('blur', handlePointerLeave);
    };
  }, [isStatic]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden select-none bg-bg"
      aria-hidden="true"
    >
      {/* Subtle Base Dotted Grid */}
      <div
        className="absolute inset-0 opacity-50 dark:opacity-20"
        style={{
          backgroundImage: 'radial-gradient(var(--pattern) 1.25px, transparent 1.25px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Dynamic Cursor Spotlight / Reveal (Soft dark shade in light mode, soft glow in dark mode) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle 280px at var(--mouse-x, -9999px) var(--mouse-y, -9999px), var(--spot-color), transparent 70%)',
        }}
      />

      {/* Brighter dot-grid reveal near cursor driven by --dot-hover */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(var(--dot-hover) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(circle 240px at var(--mouse-x, -9999px) var(--mouse-y, -9999px), black 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle 240px at var(--mouse-x, -9999px) var(--mouse-y, -9999px), black 0%, transparent 80%)',
        }}
      />

      {/* Layer 1: Connecting Constellation Lines (opacity 0.25 in light mode) */}
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full opacity-25 dark:opacity-30 pointer-events-none"
      >
        <line x1="70" y1="50" x2="180" y2="120" stroke="var(--bg-fx-base)" strokeWidth="1" strokeDasharray="3 4" />
        <line x1="880" y1="60" x2="940" y2="180" stroke="var(--bg-fx-base)" strokeWidth="1" strokeDasharray="3 4" />
        <line x1="50" y1="250" x2="140" y2="320" stroke="var(--bg-fx-base)" strokeWidth="1" strokeDasharray="3 4" />
        <line x1="850" y1="280" x2="920" y2="350" stroke="var(--bg-fx-base)" strokeWidth="1" strokeDasharray="3 4" />
        <line x1="90" y1="740" x2="160" y2="820" stroke="var(--bg-fx-base)" strokeWidth="1" strokeDasharray="3 4" />
        <line x1="800" y1="780" x2="900" y2="850" stroke="var(--bg-fx-base)" strokeWidth="1" strokeDasharray="3 4" />
      </svg>

      {/* Layer 1b: Floating Outline Shapes (opacity 0.35 in light mode) */}
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full opacity-35 dark:opacity-30 pointer-events-none"
      >
        <circle cx="120" cy="180" r="16" fill="none" stroke="var(--bg-fx-base)" strokeWidth="1.5" strokeDasharray="4 4" />
        <rect x="860" y="240" width="28" height="28" rx="6" fill="none" stroke="var(--bg-fx-base)" strokeWidth="1.5" strokeDasharray="3 3" />
        <polygon points="140,820 155,850 125,850" fill="none" stroke="var(--bg-fx-base)" strokeWidth="1.5" />
        <circle cx="880" cy="680" r="20" fill="none" stroke="var(--bg-fx-base)" strokeWidth="1.5" strokeDasharray="5 5" />
      </svg>

      {/* Dynamic Cursor Constellation Lines (faint 1px lines to nearest 3-5 particles within 140px) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            ref={(el) => {
              cursorLinesRef.current[i] = el;
            }}
            stroke="var(--bg-fx-hover)"
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity="0"
            style={{
              transition: 'opacity 0.15s ease',
            }}
          />
        ))}
      </svg>

      {/* Layer 1: Floating Particles (48 seeded dots: opacity 0.55-0.8 in light mode) */}
      {STABLE_PARTICLES.map((p, idx) => {
        const wrapperStyle: React.CSSProperties = {
          top: `${p.top}%`,
          insetInlineStart: `${p.start}%`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          willChange: 'transform',
          transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease, filter 0.2s ease',
          color: 'var(--bg-fx-base)',
        };

        if (isStatic) {
          return (
            <div
              key={p.id}
              className={`absolute rounded-full ${
                !p.isMobile ? 'hidden sm:block' : ''
              }`}
              style={{
                top: `${p.top}%`,
                insetInlineStart: `${p.start}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: 'var(--bg-fx-base)',
                opacity: 0.65,
              }}
            />
          );
        }

        return (
          <div
            key={p.id}
            ref={(el) => {
              particleWrappersRef.current[idx] = el;
            }}
            className={`absolute pointer-events-none ${
              !p.isMobile ? 'hidden sm:block' : ''
            }`}
            style={wrapperStyle}
          >
            <motion.div
              ref={(el) => {
                particleInnersRef.current[idx] = el as unknown as HTMLDivElement;
              }}
              className="w-full h-full rounded-full"
              style={{
                backgroundColor: 'currentColor',
                willChange: 'transform, opacity',
                transition: 'opacity 0.2s ease',
              }}
              animate={{
                y: [0, p.yDrift, 0],
                x: [0, p.xDrift, 0],
                opacity: [0.55, 0.8, 0.55],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: p.delay,
              }}
            />
          </div>
        );
      })}

      {/* Layer 2: "Progress Path" Winding Journey Line & Milestone Markers (opacity 0.35 in light mode) */}
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full opacity-35 dark:opacity-35 pointer-events-none"
      >
        {isStatic ? (
          <path
            d="M 60,940 C 240,820 110,640 330,500 C 560,360 670,220 940,60"
            stroke="var(--bg-fx-base)"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            fill="none"
          />
        ) : (
          <motion.path
            d="M 60,940 C 240,820 110,640 330,500 C 560,360 670,220 940,60"
            stroke="var(--bg-fx-base)"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            fill="none"
            animate={{ strokeDashoffset: [0, -140] }}
            transition={{
              duration: 36,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}
      </svg>

      {/* Layer 2: Outline Milestone Markers along the journey path */}
      {/* Milestone 1: Start (visible on all screens) */}
      <div
        className="absolute flex items-center gap-1.5 opacity-35 dark:opacity-50"
        style={{ top: '88%', insetInlineStart: '9%' }}
      >
        <div className="w-5 h-5 rounded-full border border-line bg-surface flex items-center justify-center shadow-xs">
          <Flag className="w-2.5 h-2.5" stroke="var(--bg-fx-base)" strokeWidth={1.5} />
        </div>
      </div>

      {/* Milestone 2: Step 2 Checkpoint (hidden on mobile) */}
      <div
        className="hidden sm:flex absolute items-center gap-1.5 opacity-35 dark:opacity-45"
        style={{ top: '64%', insetInlineStart: '21%' }}
      >
        <div className="w-5 h-5 rounded-full border border-line bg-surface flex items-center justify-center shadow-xs">
          <MapPin className="w-2.5 h-2.5" stroke="var(--bg-fx-base)" strokeWidth={1.5} />
        </div>
      </div>

      {/* Milestone 3: Peak Momentum (hidden on mobile) */}
      <div
        className="hidden sm:flex absolute items-center gap-1.5 opacity-35 dark:opacity-45"
        style={{ top: '40%', insetInlineStart: '53%' }}
      >
        <div className="w-5 h-5 rounded-full border border-line bg-surface flex items-center justify-center shadow-xs">
          <Milestone className="w-2.5 h-2.5" stroke="var(--bg-fx-base)" strokeWidth={1.5} />
        </div>
      </div>

      {/* Milestone 4: Goal Summit (hidden on mobile) */}
      <div
        className="hidden sm:flex absolute items-center gap-1.5 opacity-35 dark:opacity-50"
        style={{ top: '12%', insetInlineStart: '89%' }}
      >
        <div className="w-5 h-5 rounded-full border border-line bg-surface flex items-center justify-center shadow-xs">
          <Flag className="w-2.5 h-2.5" stroke="var(--bg-fx-base)" strokeWidth={1.5} />
        </div>
      </div>

      {/* Layer 3: Floating Outline Thematic Icons (opacity 0.3, strokeWidth 1.5, near cursor ~1.0) */}
      {FLOATING_ICONS.map((item, idx) => {
        const Icon = item.icon;
        const wrapperStyle: React.CSSProperties = {
          top: `${item.top}%`,
          insetInlineStart: `${item.start}%`,
          willChange: 'transform, opacity, filter',
          transition: 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease, color 400ms ease, filter 400ms ease',
          color: 'var(--bg-fx-base)',
          opacity: 0.3,
        };

        if (isStatic) {
          return (
            <div
              key={item.id}
              className={`absolute select-none ${
                !item.isMobile ? 'hidden sm:block' : ''
              }`}
              style={{
                top: `${item.top}%`,
                insetInlineStart: `${item.start}%`,
                color: 'var(--bg-fx-base)',
                opacity: 0.3,
              }}
            >
              <Icon size={item.size} strokeWidth={1.5} stroke="currentColor" />
            </div>
          );
        }

        return (
          <div
            key={item.id}
            ref={(el) => {
              iconWrappersRef.current[idx] = el;
            }}
            className={`absolute pointer-events-none select-none ${
              !item.isMobile ? 'hidden sm:block' : ''
            }`}
            style={wrapperStyle}
          >
            <motion.div
              style={{
                willChange: 'transform',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              animate={{
                y: [0, item.yOffset, 0],
                rotate: [item.rot1, item.rot2, item.rot1],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: item.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: item.delay,
              }}
            >
              <Icon size={item.size} strokeWidth={1.5} stroke="currentColor" />
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

export default FloatingBackground;
