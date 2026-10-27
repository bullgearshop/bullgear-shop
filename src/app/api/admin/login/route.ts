import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Read directly from environment variables (.env.local)
    const expectedUser = (
      process.env.ADMIN_EMAIL ||
      process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
      'BUllgear@shop.cim'
    ).trim();

    const expectedPass = (
      process.env.ADMIN_PASSWORD ||
      process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
      'Bullgear@shop'
    ).trim();

    const inputUser = String(username || '').trim();
    const inputPass = String(password || '').trim();

    const isUserMatch =
      inputUser === expectedUser ||
      inputUser.toLowerCase() === expectedUser.toLowerCase();

    const isPassMatch = inputPass === expectedPass;

    if (isUserMatch && isPassMatch) {
      return NextResponse.json({
        success: true,
        user: expectedUser,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Invalid administrator credentials. Access denied.',
      },
      { status: 401 }
    );
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during authentication.',
      },
      { status: 500 }
    );
  }
}
