import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect('/dashboard');
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            AI Blog Generator
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Sign in to create AI-powered blogs
          </p>
        </div>
        <LoginForm />
        <div className="text-center text-sm text-gray-500">
          <p>Default: admin@example.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
