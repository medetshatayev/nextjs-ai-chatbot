/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/no-explicit-any */
// Vitest unit tests for lib/api.ts

import { describe, expect, it, vi, afterEach } from 'vitest';

import {
  ApiError,
  askQuestion,
  healthCheck,
  uploadPdf,
  downloadFile,
} from '@/lib/api';

// Helper to prepare global fetch mock
const createFetchMock = (payload: any, status = 200, ok = true) =>
  vi
    .fn()
    .mockResolvedValue({
      ok,
      status,
      json: () => Promise.resolve(payload),
    } as unknown as Response);

describe('lib/api.ts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('healthCheck() returns status ok', async () => {
    global.fetch = createFetchMock({ status: 'ok' });
    const res = await healthCheck();
    expect(res.status).toBe('ok');
  });

  it('uploadPdf() returns document_id', async () => {
    const mockFile = new Blob(['dummy'], { type: 'application/pdf' }) as unknown as File;
    global.fetch = createFetchMock({ document_id: '123e4567-e89b-12d3-a456-426614174000', filename: 'doc.pdf' });

    const res = await uploadPdf(mockFile);
    expect(res.document_id).toMatch(/^[0-9a-fA-F-]{36}$/);
    expect(res.filename).toBe('doc.pdf');
  });

  it('askQuestion() returns answer & sources', async () => {
    global.fetch = createFetchMock({
      answer: '42',
      sources: [{ content: 'chunk', download_link: '/files/1' }],
    });

    const res = await askQuestion({ query: 'Why?', documentId: '123e4567-e89b-12d3-a456-426614174000' });
    expect(res.answer).toBe('42');
    expect(res.sources.length).toBe(1);
  });

  it('handles non-OK responses', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'boom' }),
    });

    await expect(
      healthCheck(),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('downloadFile() builds url', () => {
    const url = downloadFile('abc');
    expect(url.endsWith('/files/abc')).toBeTruthy();
  });
}); 