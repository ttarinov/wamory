'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { HardDrive, Cloud } from 'lucide-react';
import { StorageMode } from '@/lib/services/storage-service';

interface StorageSelectionProps {
  onSelect: (mode: StorageMode) => void;
}

export function StorageSelection({ onSelect }: StorageSelectionProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Select Storage Location</CardTitle>
          <CardDescription>
            Choose where to store your encrypted chat data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-3">
            <Label className="text-sm font-medium">Storage Location</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSelect('blob')}
                className="p-4 rounded-lg border-2 transition-colors text-left border-border hover:border-primary hover:bg-primary/5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="h-5 w-5 text-primary" />
                  <span className="font-medium">Cloud (Blob)</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Store on Vercel Blob storage. Accessible from anywhere.
                </p>
              </button>
              <button
                type="button"
                onClick={() => onSelect('local')}
                className="p-4 rounded-lg border-2 transition-colors text-left border-border hover:border-primary hover:bg-primary/5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="h-5 w-5 text-primary" />
                  <span className="font-medium">Local</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Store in ./data folder on your machine. Offline access.
                </p>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
