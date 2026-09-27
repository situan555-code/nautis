import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * Small one-shot word reveal for the nav logo.
 * Ghost + solid layers stay full foreground so the mark is never blank or half-shown.
 * Scroll-linked opacity is not used: a 200vh/scroll variant hides the logo until you move.
 */
export function TextReveal({ children, className }) {
  if (typeof children !== 'string') {
    throw new Error('TextReveal: children must be a string');
  }

  const words = children.split(' ');
  const shouldReduceMotion = useReducedMotion();

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
        <Word key={`${word}-${index}`} index={index}>
          {word}
        </Word>
      ))}
    </span>
  );
}

function Word({ children, index }) {
  return (
    <span className="nav-wordmark__word sh:relative sh:mr-[0.28em] sh:inline-block sh:last:mr-0">
      <span className="nav-wordmark__ghost sh:text-foreground">{children}</span>
      <motion.span
        className="nav-wordmark__solid sh:absolute sh:inset-0 sh:text-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.08 + index * 0.1, ease: 'easeOut' }}
      >
        {children}
      </motion.span>
    </span>
  );
}
