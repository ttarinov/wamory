'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { InitSession } from './InitSession';
import { MnemonicSetup } from './MnemonicSetup';
import { MnemonicInput } from './MnemonicInput';
import { StorageSelection } from './StorageSelection';
import { MnemonicService } from '@/lib/services/mnemonic-service';
import { EncryptionService } from '@/lib/services/encryption-service';
import { SessionService } from '@/lib/services/session-service';
import { StorageMode } from '@/lib/services/storage-service';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

type AuthState = 'loading' | 'select-storage' | 'init' | 'setup' | 'login' | 'authenticated';

const StorageModeContext = createContext<StorageMode>('blob');

export function useStorageMode() {
  return useContext(StorageModeContext);
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [storageMode, setStorageMode] = useState<StorageMode>('blob');
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    checkSavedSession();
  }, []);

  const checkSavedSession = async () => {
    try {
      const savedMnemonic = SessionService.getSession();
      if (savedMnemonic) {
        for (const mode of ['blob', 'local'] as StorageMode[]) {
          try {
            const key = await MnemonicService.deriveEncryptionKey(savedMnemonic);
            const res = await fetch('/api/chats', {
              headers: {
                'storage-mode': mode,
              },
            });
            const data = await res.json();

            if (data.data) {
              await EncryptionService.decrypt(data.data, key);
              setEncryptionKey(key);
              setStorageMode(mode);
              setAuthState('authenticated');
              return;
            }
          } catch {
            continue;
          }
        }
        SessionService.clearSession();
      }

      setAuthState('select-storage');
    } catch {
      setAuthState('select-storage');
    }
  };

  const handleStorageSelect = async (mode: StorageMode) => {
    setStorageMode(mode);
    setAuthState('loading');

    try {
      const res = await fetch('/api/auth/check', {
        headers: {
          'storage-mode': mode,
        },
      });
      const data = await res.json();

      if (data.hasData) {
        setHasData(true);
        setAuthState('login');
      } else {
        setHasData(false);
        setAuthState('init');
      }
    } catch {
      setHasData(false);
      setAuthState('init');
    }
  };

  const handleInitialize = () => {
    setAuthState('setup');
  };

  const handleSetupConfirm = async (mnemonic: string) => {
    try {
      const key = await MnemonicService.deriveEncryptionKey(mnemonic);

      const emptyDatabase = JSON.stringify({ chats: {}, messages: {} });
      const encrypted = await EncryptionService.encrypt(emptyDatabase, key);

      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'storage-mode': storageMode,
        },
        body: JSON.stringify({
          data: encrypted,
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

      const key = await MnemonicService.deriveEncryptionKey(enteredMnemonic);
      const res = await fetch('/api/chats', {
        headers: {
          'storage-mode': storageMode,
        },
      });

      if (!res.ok) {
        console.error('Failed to fetch encrypted data:', res.status, res.statusText);
        return false;
      }

      const data = await res.json();
      if (!data.data) {
        console.error('No encrypted data found');
        return false;
      }

      await EncryptionService.decrypt(data.data, key);

      SessionService.saveSession(enteredMnemonic);
      setEncryptionKey(key);
      setAuthState('authenticated');
      return true;
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
        headers: {
          'storage-mode': storageMode,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to reset data');
      }

      SessionService.clearSession();
      setHasData(false);
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

  if (authState === 'select-storage') {
    return <StorageSelection onSelect={handleStorageSelect} />;
  }

  if (authState === 'init') {
    return <InitSession onInitialize={handleInitialize} />;
  }

  if (authState === 'setup') {
    return <MnemonicSetup onConfirm={handleSetupConfirm} />;
  }

  if (authState === 'login') {
    return <MnemonicInput onSubmit={handleUnlock} onReset={handleReset} hasData={hasData} />;
  }

  return (
    <StorageModeContext.Provider value={storageMode}>
      {children}
    </StorageModeContext.Provider>
  );
}
