'use client';

import { useEffect, useState } from 'react';
import { InitSession } from './InitSession';
import { MnemonicSetup } from './MnemonicSetup';
import { MnemonicInput } from './MnemonicInput';
import { MnemonicService } from '@/lib/services/mnemonic-service';
import { EncryptionService } from '@/lib/services/encryption-service';
import { SessionService } from '@/lib/services/session-service';
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
      // Check if there's a valid session first
      const savedMnemonic = SessionService.getSession();
      if (savedMnemonic) {
        // Try to auto-authenticate with saved session
        const keyHash = await MnemonicService.getKeyHash(savedMnemonic);
        const res = await fetch('/api/auth/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyHash }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.isValid) {
            const key = await MnemonicService.deriveEncryptionKey(savedMnemonic);
            setEncryptionKey(key);
            setAuthState('authenticated');
            return;
          }
        }
        // If validation failed, clear invalid session
        SessionService.clearSession();
      }

      // No valid session, check if data exists
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

      const emptyDatabase = JSON.stringify({ chats: {}, messages: {} });
      const encrypted = await EncryptionService.encrypt(emptyDatabase, key);

      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: encrypted,
          keyHash,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to setup encryption');
      }

      SessionService.saveSession(mnemonic);
      setEncryptionKey(key);
      setAuthState('authenticated');
    } catch (error) {
      console.error('Setup error:', error);
      alert(error instanceof Error ? error.message : 'Failed to setup encryption. Please try again.');
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

      if (!res.ok) {
        console.error('Validation request failed:', res.status, res.statusText);
        return false;
      }

      const data = await res.json();
      if (data.isValid) {
        const key = await MnemonicService.deriveEncryptionKey(enteredMnemonic);
        SessionService.saveSession(enteredMnemonic);
        setEncryptionKey(key);
        setAuthState('authenticated');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Unlock error:', error);
      return false;
    }
  };

  const handleReset = async () => {
    if (!confirm('This will permanently delete all your data. Are you sure?')) {
      return;
    }

    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to reset data');
      }

      SessionService.clearSession();
      setAuthState('init');
    } catch (error) {
      console.error('Reset error:', error);
      alert(error instanceof Error ? error.message : 'Failed to reset data. Please try again.');
    }
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
