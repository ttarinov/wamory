'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaDecryption } from '@/contexts/media-decryption-context';
import { formatTime } from '@/lib/date-utils';
import { Check, CheckCheck } from 'lucide-react';

let currentlyPlayingAudio: HTMLAudioElement | null = null;

interface MessageAudioProps {
  message: {
    id: string;
    attachmentUrl?: string;
    timestamp: Date;
    sender: 'user' | 'client' | 'system';
    isRead?: boolean;
  };
  isUser: boolean;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function MessageAudio({ message, isUser }: MessageAudioProps) {
  const { getDecryptedUrl, isDecrypting, decryptMedia } = useMediaDecryption();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const encryptedUrl = message.attachmentUrl;
  const decryptedUrl = encryptedUrl ? getDecryptedUrl(encryptedUrl) : null;
  const decrypting = encryptedUrl ? isDecrypting(encryptedUrl) : false;

  useEffect(() => {
    if (encryptedUrl && !decryptedUrl && !decrypting) {
      decryptMedia(encryptedUrl);
    }
  }, [encryptedUrl, decryptedUrl, decrypting, decryptMedia]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (currentlyPlayingAudio === audio) {
        currentlyPlayingAudio = null;
      }
    };
    
    const handlePause = () => {
      if (currentlyPlayingAudio === audio) {
        currentlyPlayingAudio = null;
      }
      setIsPlaying(false);
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      if (currentlyPlayingAudio === audio) {
        currentlyPlayingAudio = null;
      }
    };
  }, [decryptedUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      if (currentlyPlayingAudio && currentlyPlayingAudio !== audio) {
        currentlyPlayingAudio.pause();
        const event = new Event('pause');
        currentlyPlayingAudio.dispatchEvent(event);
      }
      currentlyPlayingAudio = audio;
      audio.play().catch(() => {
        setIsPlaying(false);
        if (currentlyPlayingAudio === audio) {
          currentlyPlayingAudio = null;
        }
      });
    } else {
      if (currentlyPlayingAudio === audio) {
        currentlyPlayingAudio = null;
      }
      audio.pause();
    }
  }, [isPlaying]);

  const togglePlay = () => {
    if (!decryptedUrl || decrypting || isLoading) return;
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !decryptedUrl) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const togglePlaybackRate = () => {
    const rates = [1, 2, 3];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  if (decrypting || !decryptedUrl) {
    return (
      <div
        className={cn(
          'w-[98%] rounded-lg px-4 py-3',
          isUser
            ? 'bg-whatsapp-outgoing text-whatsapp-outgoing-foreground'
            : 'bg-card text-foreground'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div className="flex-1">
            <div className="text-sm opacity-70">Loading audio...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'max-w-[95%] rounded-lg px-4 py-3',
        isUser
          ? 'bg-whatsapp-outgoing text-whatsapp-outgoing-foreground'
          : 'bg-card text-foreground'
      )}
    >
      <audio ref={audioRef} src={decryptedUrl} preload="metadata" />
      
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
            isUser
              ? 'bg-whatsapp-outgoing-foreground/20 hover:bg-whatsapp-outgoing-foreground/30'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="mb-1.5">
            <div
              className={cn(
                'h-1.5 w-full cursor-pointer rounded-full',
                isUser ? 'bg-whatsapp-outgoing-foreground/30' : 'bg-muted'
              )}
              onClick={handleProgressClick}
            >
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  isUser
                    ? 'bg-whatsapp-outgoing-foreground'
                    : 'bg-primary'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className={cn(
              isUser ? 'text-whatsapp-outgoing-foreground/70' : 'text-muted-foreground'
            )}>
              {formatDuration(currentTime)} / {formatDuration(duration || 0)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <button
            onClick={togglePlaybackRate}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-medium transition-colors',
              isUser
                ? 'bg-whatsapp-outgoing-foreground/20 hover:bg-whatsapp-outgoing-foreground/30 text-whatsapp-outgoing-foreground'
                : 'bg-muted hover:bg-muted/80 text-foreground'
            )}
          >
            {playbackRate}x
          </button>
          <div className="flex items-center gap-0.5 text-[10px]">
            <span className={cn(
              isUser ? 'text-whatsapp-outgoing-foreground/70' : 'text-muted-foreground'
            )}>
              {formatTime(message.timestamp)}
            </span>
            {isUser && (
              <div>
                {message.isRead ? (
                  <CheckCheck className="h-2.5 w-2.5" />
                ) : (
                  <Check className="h-2.5 w-2.5" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

