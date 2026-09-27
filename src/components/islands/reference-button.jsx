import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ReferenceButton({ label = 'Island ready' }) {
  const [mounted, setMounted] = useState(false);

  return (
    <Button type="button" variant="outline" aria-pressed={mounted} onClick={() => setMounted(true)}>
      {mounted ? 'Island mounted' : label}
    </Button>
  );
}
