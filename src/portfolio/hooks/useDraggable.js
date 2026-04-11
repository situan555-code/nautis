import { useState, useCallback, useEffect } from 'react';

const useDraggable = (id, initialPosition, updatePosition) => {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handlePointerDown = useCallback((e) => {
    if (window.innerWidth <= 768) return;
    
    e.preventDefault();
    setIsDragging(true);
    setOffset({
      x: e.clientX - initialPosition.x,
      y: e.clientY - initialPosition.y,
    });
  }, [initialPosition]);

  const handlePointerMove = useCallback((e) => {
    if (isDragging) {
      updatePosition(id, e.clientX - offset.x, e.clientY - offset.y);
    }
  }, [isDragging, id, offset, updatePosition]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    } else {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  return { handlePointerDown };
};

export default useDraggable;
