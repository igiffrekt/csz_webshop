import { Instagram } from 'lucide-react';

// Placeholder images - in production, would fetch from Instagram API
const placeholderPosts = [
  { id: 1, alt: 'Tűzoltó készülék bemutató' },
  { id: 2, alt: 'Tűzvédelmi felszerelések' },
  { id: 3, alt: 'Szakmai tanácsadás' },
  { id: 4, alt: 'Termék karbantartás' },
  { id: 5, alt: 'Ügyfélszolgálat' },
  { id: 6, alt: 'Új termékek' },
];

export function InstagramSection() {
  const instagramUrl = 'https://instagram.com/csztuzvedelmi';

  return (
    <section className="py-16 lg:py-20 bg-secondary-50">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-10">
          <span className="text-primary-500 font-medium text-sm uppercase tracking-wider">
            Social Media
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mt-2 flex items-center justify-center gap-3">
            <Instagram className="h-8 w-8" />
            Kövessen minket Instagramon
          </h2>
          <p className="text-secondary-600 mt-2">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-500 transition-colors"
            >
              @csztuzvedelmi
            </a>
          </p>
        </div>

        {/* Instagram grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {placeholderPosts.map((post) => (
            <a
              key={post.id}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square bg-white rounded-2xl overflow-hidden group shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Placeholder with gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300" />

              {/* Placeholder icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Instagram className="h-10 w-10 text-primary-400" />
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-secondary-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Instagram className="h-10 w-10 text-white" />
              </div>
            </a>
          ))}
        </div>

        {/* Follow button */}
        <div className="text-center mt-10">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <Instagram className="h-5 w-5" />
            Követés Instagramon
          </a>
        </div>
      </div>
    </section>
  );
}
