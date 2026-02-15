export default function BlogLoading() {
  return (
    <main className="site-container py-10">
      <div className="mb-10">
        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse mb-3" />
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-5 w-96 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[16/10] bg-gray-200 rounded-[20px] mb-4" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        ))}
      </div>
    </main>
  )
}
