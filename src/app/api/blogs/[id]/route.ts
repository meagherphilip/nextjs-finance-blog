import { NextResponse } from 'next/server';
import { getBlogById } from '@/lib/database';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const blog = getBlogById(id);
  
  if (!blog) {
    return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  }
  
  return NextResponse.json(blog);
}
