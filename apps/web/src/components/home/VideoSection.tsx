'use client'

import { useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { motion, useScroll, useTransform, useMotionTemplate } from 'motion/react'
import {
  ContainerAnimated,
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
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start 20%'],
  })

  // Pill → expanded: shrink insets and roundedness as user scrolls
  const insetX = useTransform(scrollYProgress, [0, 1], [35, 0])
  const insetY = useTransform(scrollYProgress, [0, 1], [25, 0])
  const roundedness = useTransform(scrollYProgress, [0, 1], [1000, 24])
  const clipPath = useMotionTemplate`inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round ${roundedness}px)`

  return (
    <section ref={sectionRef} className="w-full pb-4 text-center">
      <div className="site-container">
        <ContainerStagger>
          {videoData.title && (
            <ContainerAnimated animation="top">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-gray-900">
                {videoData.title}
              </h2>
            </ContainerAnimated>
          )}
          {videoData.subtitle && (
            <ContainerAnimated animation="top">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-amber-500">
                {videoData.subtitle}
              </h3>
            </ContainerAnimated>
          )}

          {videoData.description && (
            <ContainerAnimated animation="blur" className="my-3">
              <p className="text-base sm:text-lg leading-relaxed text-gray-600 max-w-2xl mx-auto px-4">
                {videoData.description}
              </p>
            </ContainerAnimated>
          )}

          {videoData.ctaText && videoData.ctaLink && (
            <ContainerAnimated
              animation="bottom"
              className="flex justify-center gap-3 mb-3"
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

          <ContainerAnimated animation="z">
            <motion.div
              className="overflow-hidden pointer-events-none"
              style={{ clipPath }}
            >
              {youtubeId ? (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3`}
                    title={videoData.title || 'Video'}
                    allow="autoplay; encrypted-media"
                    tabIndex={-1}
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
                  className="block w-full h-auto object-contain"
                >
                  <source src={videoData.videoUrl} type="video/mp4" />
                </video>
              )}
            </motion.div>
          </ContainerAnimated>
        </ContainerStagger>
      </div>
    </section>
  )
}
