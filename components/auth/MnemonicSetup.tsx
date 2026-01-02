'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { MnemonicService } from '@/lib/services/mnemonic-service';

interface MnemonicSetupProps {
  onConfirm: (mnemonic: string) => void;
}

export function MnemonicSetup({ onConfirm }: MnemonicSetupProps) {
  const [mnemonic, setMnemonic] = useState(() => MnemonicService.generate(12));
  const [confirmed, setConfirmed] = useState(false);

  const handleRegenerate = () => {
    setMnemonic(MnemonicService.generate(12));
    setConfirmed(false);
  };

  const handleDownload = () => {
    const blob = new Blob([mnemonic], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recovery-phrase.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Initialize Session</CardTitle>
          <CardDescription>
            Save your 12-word recovery phrase. You'll need it to access your encrypted chats.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              If you lose this phrase, you will permanently lose access to your encrypted data.
              There is no way to recover it.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Textarea
              value={mnemonic}
              readOnly
              className="font-mono text-sm min-h-[100px] resize-none"
              onClick={(e) => e.currentTarget.select()}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
            />
            <label
              htmlFor="confirm"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have securely backed up my recovery phrase
            </label>
          </div>

          <Button
            onClick={() => onConfirm(mnemonic)}
            disabled={!confirmed}
            className="w-full"
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
