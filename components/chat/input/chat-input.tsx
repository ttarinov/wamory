'use client';

import { ArrowUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  disabled?: boolean;
}

export function ChatInput({ disabled = true }: ChatInputProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 mb-4 px-4">
      <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 shadow-md">
        <div className="relative flex-1">
          <Input
            placeholder="Type a message"
            disabled={disabled}
            className={cn(
              "rounded-full border-0 bg-muted/50 px-3 py-1.5 text-sm h-8",
              "focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "placeholder:text-muted-foreground/60"
            )}
          />
        </div>
        <Button
          disabled={disabled}
          size="icon"
          className={cn(
            "h-8 w-8 shrink-0 rounded-full bg-primary text-primary-foreground",
            "hover:bg-primary/90",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
          )}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

