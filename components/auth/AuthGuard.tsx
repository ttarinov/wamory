'use client';

import { useEffect, useState } from 'react';
import { InitSession } from './InitSession';
import { MnemonicSetup } from './MnemonicSetup';
import { MnemonicInput } from './MnemonicInput';
import { MnemonicService } from '@/lib/services/mnemonic-service';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

type AuthState = 'loading' | 'init' | 'setup' | 'login' | 'authenticated';

export function AuthGuard({ children }: AuthGuardProps) {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    checkDataStatus();
  }, []);

  const checkDataStatus = async () => {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      setAuthState(data.hasData ? 'login' : 'init');
    } catch {
      setAuthState('init');
    }
  };

  const handleInitialize = () => {
    setAuthState('setup');
  };

  const handleSetupConfirm = async (mnemonic: string) => {
    try {
      const key = await MnemonicService.deriveEncryptionKey(mnemonic);
      const keyHash = await MnemonicService.getKeyHash(mnemonic);

      await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: '',
          keyHash,
        }),
      });

      sessionStorage.setItem('mnemonic', mnemonic);
      setEncryptionKey(key);
      setAuthState('authenticated');
    } catch {
      alert('Failed to setup encryption. Please try again.');
    }
  };

  const handleUnlock = async (enteredMnemonic: string): Promise<boolean> => {
    try {
      if (!MnemonicService.validate(enteredMnemonic)) {
        return false;
      }

      const keyHash = await MnemonicService.getKeyHash(enteredMnemonic);
      const res = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyHash }),
      });

      const data = await res.json();
      if (data.isValid) {
        const key = await MnemonicService.deriveEncryptionKey(enteredMnemonic);
        sessionStorage.setItem('mnemonic', enteredMnemonic);
        setEncryptionKey(key);
        setAuthState('authenticated');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleReset = async () => {
    if (!confirm('This will permanently delete all your data. Are you sure?')) {
      return;
    }

    sessionStorage.removeItem('mnemonic');
    setAuthState('init');
  };

  if (authState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (authState === 'init') {
    return <InitSession onInitialize={handleInitialize} />;
  }

  if (authState === 'setup') {
    return <MnemonicSetup onConfirm={handleSetupConfirm} />;
  }

  if (authState === 'login') {
    return <MnemonicInput onSubmit={handleUnlock} onReset={handleReset} />;
  }

  return <>{children}</>;
}
