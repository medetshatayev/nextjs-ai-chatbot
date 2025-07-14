import { z } from 'zod';

// Wraps all calls to the FastAPI backend that powers the RAG engine.
// The base URL is configured via NEXT_PUBLIC_BACKEND_URL so that it
// works in both browser and server runtimes.

const BASE_ENV = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';
// remove any trailing slash so we don't end up with '//upload'
const BASE_URL = BASE_ENV.replace(/\/+$/, '');

export class ApiError extends Error {
  public status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function handleResponse<T>(response: Response, schema: z.ZodSchema<T>): Promise<T> {
  if (!response.ok) {
    // Try to surface a meaningful error coming from the backend
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (typeof data?.message === 'string') {
        message = data.message;
      }
    } catch (_) {
      // ignore – non-JSON response
    }
    throw new ApiError(message, response.status);
  }

  const json = (await response.json()) as unknown;
  return schema.parse(json);
}

/* --------------------------------- Schemas -------------------------------- */

const HealthSchema = z.object({ status: z.literal('ok') });

const UploadSchema = z.object({
  document_id: z.string().uuid(),
  filename: z.string(),
});

export type UploadResponse = z.infer<typeof UploadSchema>;

const AskSchema = z.object({
  answer: z.string(),
  sources: z.array(
    z.object({
      content: z.string().optional(),
      download_link: z.string(),
    }),
  ),
});

export type AskResponse = z.infer<typeof AskSchema>;

/* --------------------------------- Helpers -------------------------------- */

export async function healthCheck() {
  const res = await fetch(`${BASE_URL}/`);
  return handleResponse(res, HealthSchema);
}

export async function uploadPdf(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`/api/upload`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse(res, UploadSchema);
}

export async function askQuestion({
  query,
  documentId,
}: {
  query: string;
  documentId: string;
}): Promise<AskResponse> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, document_id: documentId }),
  });

  return handleResponse(res, AskSchema);
}

export function downloadFile(documentId: string) {
  return `${BASE_URL}/files/${documentId}`;
} 