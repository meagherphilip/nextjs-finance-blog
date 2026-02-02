import { NextResponse } from 'next/server';
import { getAllPosts, getPostBySlug } from '@/lib/db';

export async function GET() {
  const posts = getAllPosts();
  return NextResponse.json(posts);
}
