import { NextResponse } from 'next/server';

export async function GET() {
  const fastapi = process.env.FASTAPI_URL;
  if (!fastapi) {
    return NextResponse.json({ error: 'FASTAPI_URL not configured' }, { status: 500 });
  }

  const res = await fetch(`${fastapi}/`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
