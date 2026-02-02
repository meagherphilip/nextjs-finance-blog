import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { createTheme } from '@/lib/database';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    const theme = createTheme({
      ...body,
      createdBy: session.user.id
    });
    
    return NextResponse.json(theme);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create theme' }, { status: 500 });
  }
}
