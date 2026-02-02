import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getAllBlogs, getAllThemes } from '@/lib/database';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }
  
  const blogs = getAllBlogs();
  const themes = getAllThemes();
  
  return (
    <DashboardClient 
      user={session.user}
      initialBlogs={blogs}
      initialThemes={themes}
    />
  );
}
