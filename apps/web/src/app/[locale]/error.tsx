'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="site-container py-20 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Hiba történt</h1>
      <p className="text-gray-600 mb-8">Sajnáljuk, váratlan hiba lépett fel. Kérjük, próbálja újra.</p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
      >
        Újrapróbálás
      </button>
    </main>
  )
}
