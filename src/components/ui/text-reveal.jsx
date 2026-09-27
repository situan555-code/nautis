import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * Small one-shot reveal for the existing nav logo.
 * Each word starts readable and finishes fully opaque. It does not wait on page scroll.
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
        <motion.span
          key={`${word}-${index}`}
          className="nav-wordmark__word sh:mr-[0.28em] sh:inline-block sh:text-foreground sh:last:mr-0"
          initial={{ opacity: 0.45, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 + index * 0.09, ease: 'easeOut' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
