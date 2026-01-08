'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Key, Shield } from 'lucide-react';

interface InitSessionProps {
  onInitialize: () => void;
}

export function InitSession({ onInitialize }: InitSessionProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">WhatsApp History Viewer</CardTitle>
          <CardDescription>
            Secure, encrypted chat history with zero-knowledge architecture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Key className="h-5 w-5 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-foreground">12-Word Recovery Phrase</p>
                <p className="text-sm text-muted-foreground">
                  BIP39 standard (like crypto wallets) converts your phrase into an encryption key
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-foreground">AES-256-GCM Encryption</p>
                <p className="text-sm text-muted-foreground">
                  Military-grade encryption in your browser - data encrypted before upload
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-foreground">Zero-Knowledge Storage</p>
                <p className="text-sm text-muted-foreground">
                  Server only stores encrypted blobs - your phrase never leaves your device
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground text-center">
              Your 12 words = Master key → AES-256 key → Encrypted data
            </p>
          </div>

          <Button onClick={onInitialize} className="w-full" size="lg">
            Initialize Session
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            A new recovery phrase will be generated for you
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
