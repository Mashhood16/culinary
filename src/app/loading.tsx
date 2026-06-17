export default function Loading() {
  return (
    <main className="min-h-screen bg-[#fffaf6] dark:bg-[#111827] flex items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-stone-500 animate-pulse font-medium">Culnarriest is preparing your kitchen...</p>
      </div>
    </main>
  );
}