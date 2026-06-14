export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900">
      <section className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
        <article className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">About Culnarriest</p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-900">A premium recipe platform for curious cooks.</h1>
          <p className="mt-4 text-stone-600">We combine global food culture, verified recipe histories, and AI-assisted guidance to make recipe discovery accessible, safe, and welcoming for learners and experienced cooks alike.</p>
        </article>
      </section>
    </main>
  );
}
