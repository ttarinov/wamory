'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getAvatarColor } from '@/lib/utils/avatar-colors';

interface ChatAvatarProps {
  name?: string;
  phoneNumber: string;
  avatar?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

export function ChatAvatar({
  name,
  phoneNumber,
  avatar,
  className,
  size = 'md',
}: ChatAvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : phoneNumber.slice(-2);

  const avatarColor = getAvatarColor(phoneNumber);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={avatar} alt={name || phoneNumber} />
      <AvatarFallback className={cn(avatarColor.bg, avatarColor.text, 'font-semibold')}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
