/**
 * KairOS Universal Storage Service
 * 
 * Provides an isolated, type-safe storage layer with automatic in-memory fallback
 * when browser LocalStorage is unavailable or throws (e.g. sandboxed iframes,
 * strict cookie policies, QuotaExceededError, or headless test runners).
 * 
 * @module services/storage_service
 */

const GEMINI_API_STORAGE_KEY = 'kairos_gemini_api_key';

/**
 * Storage adapter interface defining CRUD operations.
 */
export interface IStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * In-memory fallback adapter used when LocalStorage is disabled or throws.
 */
export class MemoryStorageAdapter implements IStorageAdapter {
  private memoryStore: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.memoryStore.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.memoryStore.set(key, value);
  }

  removeItem(key: string): void {
    this.memoryStore.delete(key);
  }

  clear(): void {
    this.memoryStore.clear();
  }
}

/**
 * Enterprise storage service managing application preferences and API keys.
 */
export class StorageService {
  private adapter: IStorageAdapter;

  constructor(customAdapter?: IStorageAdapter) {
    if (customAdapter) {
      this.adapter = customAdapter;
    } else {
      this.adapter = this.resolvePrimaryAdapter();
    }
  }

  /**
   * Resolves the primary storage adapter, falling back to MemoryStorageAdapter
   * if localStorage is undefined, inaccessible, or throws SecurityError.
   */
  private resolvePrimaryAdapter(): IStorageAdapter {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const testKey = '__kairos_storage_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        return window.localStorage;
      }
    } catch {
      // In-memory fallback for sandboxed iframe or disabled cookies
    }
    return new MemoryStorageAdapter();
  }

  /**
   * Retrieves the stored Google Gemini API key, or null if none is configured.
   */
  getGeminiApiKey(): string | null {
    try {
      const val = this.adapter.getItem(GEMINI_API_STORAGE_KEY);
      return val && val.trim().length > 0 ? val.trim() : null;
    } catch {
      return null;
    }
  }

  /**
   * Securely persists or clears the Google Gemini API key.
   * 
   * @param key - The raw API key string. If empty or whitespace, removes the key.
   */
  setGeminiApiKey(key: string): void {
    try {
      const trimmed = key.trim();
      if (trimmed) {
        this.adapter.setItem(GEMINI_API_STORAGE_KEY, trimmed);
      } else {
        this.adapter.removeItem(GEMINI_API_STORAGE_KEY);
      }
    } catch {
      // Gracefully prevent UI crash on restricted storage quotas
    }
  }

  /**
   * Clears all stored application configuration.
   */
  clearAll(): void {
    try {
      this.adapter.clear();
    } catch {
      // Gracefully prevent UI crash
    }
  }
}

/**
 * Singleton instance of StorageService for application-wide consistency.
 */
export const storageService = new StorageService();
