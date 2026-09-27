import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

export function TextReveal({ children, className }) {
  if (typeof children !== 'string') {
    throw new Error('TextReveal: children must be a string');
  }

  const words = children.split(' ');
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  if (shouldReduceMotion) {
    return (
      <span aria-hidden="true" className={cn(className)}>
        {children}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn('sh:inline-flex sh:flex-nowrap sh:items-baseline', className)}
    >
      {words.map((word, index) => (
        <Word key={`${word}-${index}`} scrollY={scrollY} index={index} count={words.length}>
          {word}
        </Word>
      ))}
    </span>
  );
}

function Word({ children, scrollY, index, count }) {
  const opacity = useTransform(scrollY, (value) => {
    const viewport = window.innerHeight || 1;
    const scrollable = Math.max(0, document.documentElement.scrollHeight - viewport);
    if (scrollable <= 8) return 1;
    const limit = Math.min(viewport * 0.4, scrollable);
    const start = (index / count) * limit;
    const end = ((index + 1) / count) * limit;
    if (value <= start) return 0;
    if (value >= end) return 1;
    return (value - start) / (end - start);
  });

  return (
    <span className="nav-wordmark__word sh:relative sh:mr-[0.28em] sh:inline-block sh:last:mr-0">
      <span className="nav-wordmark__ghost sh:text-foreground/35">{children}</span>
      <motion.span
        style={{ opacity }}
        className="nav-wordmark__solid sh:absolute sh:inset-0 sh:text-foreground"
      >
        {children}
      </motion.span>
    </span>
  );
}
