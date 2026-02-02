import { NextResponse } from 'next/server';
import { seedFinancePosts } from '@/lib/db';

export async function POST() {
  seedFinancePosts();
  return NextResponse.json({ message: 'Database seeded with finance posts' });
}
