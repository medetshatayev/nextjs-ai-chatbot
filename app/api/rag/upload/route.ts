import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const fastapi = process.env.FASTAPI_URL;

  if (!fastapi) {
    return NextResponse.json({ error: 'FASTAPI_URL not configured' }, { status: 500 });
  }

  const upstream = await fetch(`${fastapi}/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
