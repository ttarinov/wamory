/**
 * Session management service with localStorage and auto-expiration
 * Similar to crypto wallet behavior - stays logged in until manual logout or expiration
 */

const SESSION_KEY = 'wamory_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

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
      expiresAt: Date.now() + SESSION_DURATION,
    };

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to save session:', error);
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

      // Extend session on access (sliding expiration)
      session.expiresAt = Date.now() + SESSION_DURATION;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      return session.mnemonic;
    } catch (error) {
      console.error('Failed to get session:', error);
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
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Check if there's a valid session
   */
  static hasValidSession(): boolean {
    return this.getSession() !== null;
  }
}
