/**
 * Unit Tests for KairOS Universal Storage Service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService, MemoryStorageAdapter } from '../services/storage_service';

describe('Universal Storage Service & Memory Adapter (storage_service.ts)', () => {
  let memoryAdapter: MemoryStorageAdapter;
  let service: StorageService;

  beforeEach(() => {
    memoryAdapter = new MemoryStorageAdapter();
    service = new StorageService(memoryAdapter);
  });

  it('correctly operates getItem, setItem, removeItem, and clear on MemoryStorageAdapter', () => {
    expect(memoryAdapter.getItem('nonexistent')).toBeNull();

    memoryAdapter.setItem('key1', 'value1');
    expect(memoryAdapter.getItem('key1')).toBe('value1');

    memoryAdapter.removeItem('key1');
    expect(memoryAdapter.getItem('key1')).toBeNull();

    memoryAdapter.setItem('a', '1');
    memoryAdapter.setItem('b', '2');
    memoryAdapter.clear();
    expect(memoryAdapter.getItem('a')).toBeNull();
    expect(memoryAdapter.getItem('b')).toBeNull();
  });

  it('returns null when no Gemini API key is configured', () => {
    expect(service.getGeminiApiKey()).toBeNull();
  });

  it('trims and persists valid Gemini API keys', () => {
    service.setGeminiApiKey('   AIzaSyFakeKey12345   ');
    expect(service.getGeminiApiKey()).toBe('AIzaSyFakeKey12345');
  });

  it('removes stored Gemini API key when passed empty string or whitespace', () => {
    service.setGeminiApiKey('AIzaSyKey');
    expect(service.getGeminiApiKey()).toBe('AIzaSyKey');

    service.setGeminiApiKey('');
    expect(service.getGeminiApiKey()).toBeNull();

    service.setGeminiApiKey('AIzaSyKey2');
    service.setGeminiApiKey('   ');
    expect(service.getGeminiApiKey()).toBeNull();
  });

  it('clears all entries when clearAll is called', () => {
    service.setGeminiApiKey('AIzaSyKey');
    service.clearAll();
    expect(service.getGeminiApiKey()).toBeNull();
  });

  it('gracefully handles faulty storage adapter without throwing unhandled exceptions', () => {
    const throwingAdapter = {
      getItem: () => { throw new Error('QuotaExceeded'); },
      setItem: () => { throw new Error('QuotaExceeded'); },
      removeItem: () => { throw new Error('QuotaExceeded'); },
      clear: () => { throw new Error('QuotaExceeded'); },
    };

    const resilientService = new StorageService(throwingAdapter);
    expect(resilientService.getGeminiApiKey()).toBeNull();
    expect(() => resilientService.setGeminiApiKey('key')).not.toThrow();
    expect(() => resilientService.clearAll()).not.toThrow();
  });
});
