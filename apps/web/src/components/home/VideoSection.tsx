'use client'

import { Link } from '@/i18n/navigation'

interface VideoSectionProps {
  videoData?: {
    title?: string
    subtitle?: string
    description?: string
    videoUrl?: string
    ctaText?: string
    ctaLink?: string
  } | null
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function VideoSection({ videoData }: VideoSectionProps) {
  if (!videoData?.videoUrl) return null

  const youtubeId = getYouTubeId(videoData.videoUrl)

  return (
    <section className="site-container py-8 sm:py-12">
      {(videoData.title || videoData.subtitle) && (
        <div className="text-center mb-6 sm:mb-8">
          {videoData.title && (
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-gray-900">
              {videoData.title}
            </h2>
          )}
          {videoData.subtitle && (
            <p className="text-base sm:text-lg text-gray-600 mt-2">
              {videoData.subtitle}
            </p>
          )}
        </div>
      )}

      <div className="rounded-2xl sm:rounded-3xl overflow-hidden">
        {youtubeId ? (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
              title={videoData.title || 'Video'}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        ) : (
          <video
            width="100%"
            height="100%"
            loop
            playsInline
            autoPlay
            muted
            className="block w-full h-auto"
          >
            <source src={videoData.videoUrl} type="video/mp4" />
          </video>
        )}
      </div>

      {videoData.description && (
        <p className="text-center text-sm sm:text-base text-gray-600 mt-4 max-w-2xl mx-auto">
          {videoData.description}
        </p>
      )}

      {videoData.ctaText && videoData.ctaLink && (
        <div className="flex justify-center mt-5">
          <Link
            href={videoData.ctaLink as any}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-amber-500 text-gray-900 font-semibold text-sm hover:bg-amber-400 active:scale-[0.98] transition-all shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-gray-900" />
            {videoData.ctaText}
          </Link>
        </div>
      )}
    </section>
  )
}
