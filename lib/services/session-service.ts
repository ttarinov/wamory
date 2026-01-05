import { SESSION_KEY, SESSION_DURATION_MS } from '@/lib/constants/app-constants';

interface SessionData {
  mnemonic: string;
  expiresAt: number;
}

export class SessionService {
  /**
   * Save session to localStorage with expiration
   */
  static saveSession(mnemonic: string): void {
    const session: SessionData = {
      mnemonic,
      expiresAt: Date.now() + SESSION_DURATION_MS,
    };

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
    }
  }

  /**
   * Get current session if valid, null otherwise
   */
  static getSession(): string | null {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      if (!data) return null;

      const session: SessionData = JSON.parse(data);

      // Check if session has expired
      if (Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }

      session.expiresAt = Date.now() + SESSION_DURATION_MS;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      return session.mnemonic;
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear the current session
   */
  static clearSession(): void {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (error) {
    }
  }

  /**
   * Check if there's a valid session
   */
  static hasValidSession(): boolean {
    return this.getSession() !== null;
  }
}
