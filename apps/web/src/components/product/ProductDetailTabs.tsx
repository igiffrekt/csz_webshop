'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { FileText, Download, Shield, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Specification {
  _key?: string
  name: string
  value: string
  unit?: string
}

interface Certification {
  _key?: string
  name: string
  standard?: string
  certificate?: { url: string; name: string }
}

interface DocumentAsset {
  _key?: string
  url: string
  name: string
}

interface ProductDetailTabsProps {
  description?: string
  specifications?: Specification[]
  certifications?: Certification[]
  documents?: DocumentAsset[]
}

export function ProductDetailTabs({
  description,
  specifications,
  certifications,
  documents,
}: ProductDetailTabsProps) {
  const t = useTranslations('product')

  const hasDescription = !!description
  const hasSpecs = specifications && specifications.length > 0
  const hasDocs = documents && documents.length > 0
  const hasCerts = certifications && certifications.length > 0

  const tabs: { id: string; label: string }[] = []
  if (hasDescription) tabs.push({ id: 'description', label: t('description') })
  if (hasSpecs) tabs.push({ id: 'specifications', label: t('specifications') })
  if (hasDocs) tabs.push({ id: 'documents', label: t('documents') })
  if (hasCerts) tabs.push({ id: 'certifications', label: t('certifications') })

  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '')

  if (tabs.length === 0) return null

  return (
    <section className="mt-10">
      {/* Tab navigation — underline style, left-aligned */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8" aria-label="Termék részletek">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative pb-4 text-sm font-semibold tracking-wide uppercase transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'text-gray-900'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FFBB36] rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="pt-8 pb-2">
        {activeTab === 'description' && hasDescription && (
          <div
            className="text-gray-600 leading-relaxed max-w-3xl [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-2 [&_li]:marker:text-gray-400 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-6 [&_h3]:mb-2 [&_h4]:font-semibold [&_h4]:text-gray-800 [&_h4]:mt-4 [&_h4]:mb-2 [&_strong]:font-semibold [&_strong]:text-gray-800"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        {activeTab === 'specifications' && hasSpecs && (
          <div className="max-w-2xl">
            <div className="rounded-2xl overflow-hidden border border-gray-100">
              {specifications!.map((spec, i) => (
                <div
                  key={spec._key || spec.name}
                  className={cn(
                    'flex items-center justify-between px-5 py-3.5',
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'
                  )}
                >
                  <span className="text-sm text-gray-500">{spec.name}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {spec.value}
                    {spec.unit && <span className="text-gray-400 ml-1">{spec.unit}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'documents' && hasDocs && (
          <div className="max-w-xl space-y-3">
            {documents!.map((doc) => (
              <a
                key={doc._key || doc.name}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-[#FFBB36]/30 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#FFBB36]/10 flex items-center justify-center flex-shrink-0 transition-colors">
                  <FileText className="h-5 w-5 text-gray-400 group-hover:text-[#FFBB36] transition-colors" />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-700 truncate">
                  {doc.name}
                </span>
                <Download className="h-4 w-4 text-gray-300 group-hover:text-[#FFBB36] transition-colors flex-shrink-0" />
              </a>
            ))}
          </div>
        )}

        {activeTab === 'certifications' && hasCerts && (
          <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
            {certifications!.map((cert) => (
              <div
                key={cert._key || cert.name}
                className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white"
              >
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  {cert.name.includes('CE') ? (
                    <Shield className="h-5 w-5 text-green-600" />
                  ) : (
                    <Award className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{cert.name}</p>
                  {cert.standard && (
                    <p className="text-xs text-gray-400 mt-0.5">{cert.standard}</p>
                  )}
                </div>
                {cert.certificate && (
                  <a
                    href={cert.certificate.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                  >
                    <Download className="h-4 w-4 text-gray-300 hover:text-green-600 transition-colors" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
