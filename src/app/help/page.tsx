export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900">
      <section className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
        <article className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Help Center</p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-900">How to explore and customize recipes.</h1>
          <ul className="mt-6 space-y-3 text-stone-600">
            <li>• Search by ingredient, cuisine, or cooking time.</li>
            <li>• Use filters to narrow down vegetarian, vegan, low-calorie, or gluten-free options.</li>
            <li>• Ask the AI Food Scientist to scale, substitute, and adapt recipes safely.</li>
            <li>• Save favorites, create shopping lists, and print recipe cards from the recipe detail view.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
