import { Instagram } from 'lucide-react';

// Placeholder images - in production, would fetch from Instagram API
const placeholderPosts = [
  { id: 1, color: 'from-amber-200 to-amber-300' },
  { id: 2, color: 'from-gray-200 to-gray-300' },
  { id: 3, color: 'from-amber-100 to-amber-200' },
  { id: 4, color: 'from-gray-300 to-gray-400' },
  { id: 5, color: 'from-amber-200 to-amber-400' },
  { id: 6, color: 'from-gray-200 to-gray-300' },
];

export function InstagramSection() {
  const instagramUrl = 'https://instagram.com/csztuzvedelmi';

  return (
    <section className="py-16 lg:py-20 bg-gray-900">
      <div className="site-container">
        {/* Section header */}
        <div className="text-center mb-10">
          <span className="text-amber-400 font-medium text-sm uppercase tracking-wider">
            Kövessen minket
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mt-2">
            Kövessen minket Instagramon
          </h2>
        </div>

        {/* Instagram grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {placeholderPosts.map((post) => (
            <a
              key={post.id}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-lg overflow-hidden group"
            >
              {/* Placeholder with gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${post.color}`} />

              {/* Placeholder icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl opacity-50">📷</span>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Instagram className="h-8 w-8 text-white" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
