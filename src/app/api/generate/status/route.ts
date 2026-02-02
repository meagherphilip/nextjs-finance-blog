import { NextResponse } from 'next/server';
import { getGenerationById } from '@/lib/database';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Generation ID required' }, { status: 400 });
  }
  
  const generation = getGenerationById(id);
  
  if (!generation) {
    return NextResponse.json({ error: 'Generation not found' }, { status: 404 });
  }
  
  return NextResponse.json(generation);
}
