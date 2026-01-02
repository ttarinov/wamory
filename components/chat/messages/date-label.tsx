'use client';

import { useEffect, useRef, useState } from 'react';
import { formatDateLabel } from '@/lib/date-utils';

interface ChatDateLabelProps {
  date: Date;
  messagesCount: number;
}

export function ChatDateLabel({ date, messagesCount }: ChatDateLabelProps) {
  const [isSticky, setIsSticky] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const scrollContainer = sentinel.closest('[data-slot="scroll-area-viewport"]');
    if (!scrollContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsSticky(!entry.isIntersecting);
        });
      },
      {
        root: scrollContainer,
        rootMargin: '-8px 0px 0px 0px',
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [messagesCount]);

  return (
    <div className="relative">
      <div ref={sentinelRef} className="absolute -top-2 h-2 w-full pointer-events-none" />
      <div
        ref={labelRef}
        className={isSticky ? 'sticky top-2 z-10' : ''}
      >
        <div className="flex justify-center">
          <div className="rounded-md bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
            {formatDateLabel(date)}
          </div>
        </div>
      </div>
    </div>
  );
}

