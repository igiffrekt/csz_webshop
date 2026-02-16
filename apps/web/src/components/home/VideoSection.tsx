'use client'

import { Link } from '@/i18n/navigation'
import {
  ContainerAnimated,
  ContainerInset,
  ContainerScroll,
  ContainerStagger,
} from '@/components/hero-video'

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

export function VideoSection({ videoData }: VideoSectionProps) {
  if (!videoData?.videoUrl) return null

  return (
    <ContainerScroll className="bg-gray-950 text-center text-white">
      <ContainerStagger>
        {videoData.title && (
          <ContainerAnimated animation="top">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
              {videoData.title}
            </h2>
          </ContainerAnimated>
        )}
        {videoData.subtitle && (
          <ContainerAnimated animation="top">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-amber-400">
              {videoData.subtitle}
            </h3>
          </ContainerAnimated>
        )}

        {videoData.description && (
          <ContainerAnimated animation="blur" className="my-4">
            <p className="text-base sm:text-lg leading-relaxed text-gray-300 max-w-2xl mx-auto px-4">
              {videoData.description}
            </p>
          </ContainerAnimated>
        )}

        {videoData.ctaText && videoData.ctaLink && (
          <ContainerAnimated
            animation="bottom"
            className="flex justify-center gap-3 mb-2"
          >
            <Link
              href={videoData.ctaLink as any}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-amber-500 text-gray-900 font-semibold text-sm hover:bg-amber-400 active:scale-[0.98] transition-all shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-gray-900" />
              {videoData.ctaText}
            </Link>
          </ContainerAnimated>
        )}
      </ContainerStagger>

      <ContainerInset className="mx-4 sm:mx-8">
        <video
          width="100%"
          height="100%"
          loop
          playsInline
          autoPlay
          muted
          className="relative z-10 block h-auto max-h-full max-w-full object-contain align-middle"
        >
          <source src={videoData.videoUrl} type="video/mp4" />
        </video>
      </ContainerInset>
    </ContainerScroll>
  )
}
