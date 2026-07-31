import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#06101e] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-8xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-slate-400 mb-8">Page not found</p>
        <Link
          href="/"
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold px-6 py-3 rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
