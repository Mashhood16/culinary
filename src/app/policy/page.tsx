export default function PolicyPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900">
      <section className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
        <article className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Site policy</p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-900">Culinarriest policy</h1>
          <p className="mt-4 text-stone-600">This site provides recipe discovery, cooking guidance, and AI-assisted adaptation recommendations. Content is curated to support safe cooking practices and a positive user experience.</p>
          <p className="mt-6 text-sm text-stone-700">Please note that recipe content is for informational purposes only. Always follow safe food-handling practices, verify ingredient suitability for your dietary needs, and consult a professional when required.</p>
        </article>
      </section>
    </main>
  );
}
