import { Link } from 'react-router-dom';
import { Heart, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <Heart className="mx-auto h-16 w-16 text-rose-300" />
        <h1 className="mt-4 text-6xl font-bold text-rose-500">404</h1>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">Page not found</h2>
        <p className="mt-2 text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 font-semibold text-white hover:bg-rose-600"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
