import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | Blob | null;

    if (!file) {
      return NextResponse.json(
        { message: 'file field is required' },
        { status: 400 },
      );
    }

    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL!.replace(/\/+$/, '')}/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    const resBody = await backendRes.text();
    return new Response(resBody, {
      status: backendRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message ?? 'upload proxy failed' },
      { status: 500 },
    );
  }
} 