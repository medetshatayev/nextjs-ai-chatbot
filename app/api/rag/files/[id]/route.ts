import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const fastapi = process.env.FASTAPI_URL;
  if (!fastapi) {
    return NextResponse.json({ error: 'FASTAPI_URL not configured' }, { status: 500 });
  }

  const res = await fetch(`${fastapi}/files/${params.id}`);
  if (!res.ok) {
    return NextResponse.json({ error: 'File not found' }, { status: res.status });
  }

  const blob = await res.blob();
  return new Response(blob, {
    status: 200,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'application/pdf',
    },
  });
}
