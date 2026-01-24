'use client';

import { Link } from '@/i18n/navigation';
import { Home, ArrowLeft } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-white">
      <div className="text-center px-4">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Termék nem található
        </h1>
        <p className="text-gray-600 mb-8">
          A keresett termék nem létezik vagy eltávolításra került.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/termekek"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FFBB36] text-gray-900 font-medium rounded-full hover:bg-[#E5A830] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Vissza a termékekhez
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-900 font-medium rounded-full hover:bg-gray-200 transition-colors"
          >
            <Home className="h-4 w-4" />
            Főoldal
          </Link>
        </div>
      </div>
    </div>
  );
}
