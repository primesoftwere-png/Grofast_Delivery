import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-800">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-700">Page Not Found</h2>
        <p className="mb-6 text-lg text-gray-600">
          Oops! The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}