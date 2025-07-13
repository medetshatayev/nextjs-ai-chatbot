import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const fastapi = process.env.FASTAPI_URL;
  if (!fastapi) {
    return NextResponse.json({ error: 'FASTAPI_URL not configured' }, { status: 500 });
  }

  const body = await request.json();
  const upstream = await fetch(`${fastapi}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
