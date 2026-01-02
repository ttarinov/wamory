'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Trash2 } from 'lucide-react';

interface MnemonicInputProps {
  onSubmit: (mnemonic: string) => Promise<boolean>;
  onReset: () => void;
}

export function MnemonicInput({ onSubmit, onReset }: MnemonicInputProps) {
  const [phrase, setPhrase] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const cleanedPhrase = phrase.trim().toLowerCase();
    if (!cleanedPhrase) {
      setError('Please enter your recovery phrase');
      return;
    }

    setLoading(true);
    setError('');

    const success = await onSubmit(cleanedPhrase);
    if (!success) {
      setError('Invalid recovery phrase. Please check and try again.');
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Enter Recovery Phrase</CardTitle>
          <CardDescription>
            Enter your 12-word recovery phrase to access your encrypted chats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Textarea
            value={phrase}
            onChange={(e) => {
              setPhrase(e.target.value);
              setError('');
            }}
            placeholder="Enter your 12-word recovery phrase here..."
            className="font-mono min-h-[120px]"
            disabled={loading}
          />

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Unlocking...' : 'Unlock'}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Lost your recovery phrase?
            </p>
            <Button
              variant="destructive"
              onClick={onReset}
              disabled={loading}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Erase All Data & Create New Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
