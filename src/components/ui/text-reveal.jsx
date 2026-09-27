import { useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * One-shot word build for the nav logo.
 * Each word is a single inline layer. Opacity runs in CSS so a React
 * re-render cannot restart it, and nothing translates the bar.
 */
const settledMarks = new Set();

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function TextReveal({ children, className }) {
  const reduced = prefersReducedMotion();
  const play = useRef(null);

  if (typeof children !== 'string') {
    throw new Error('TextReveal: children must be a string');
  }

  if (play.current === null) {
    play.current = !reduced && !settledMarks.has(children);
    if (play.current) settledMarks.add(children);
  }

  if (reduced || !play.current) {
    return (
      <span aria-hidden="true" className={cn('nav-wordmark nav-wordmark--settled', className)}>
        {children}
      </span>
    );
  }

  const words = children.trim().split(/\s+/);

  return (
    <span aria-hidden="true" className={cn('nav-wordmark', className)}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="nav-wordmark__word">
          {index > 0 ? ' ' : null}
          {word}
        </span>
      ))}
    </span>
  );
}
