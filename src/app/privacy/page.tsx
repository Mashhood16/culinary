export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900">
      <section className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
        <article className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Privacy</p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-900">Privacy policy</h1>
          <p className="mt-4 text-stone-600">We do not share user-provided data with third parties. Any data entered on this site is used only to power site interactions and internal feature behavior.</p>
          <p className="mt-6 text-sm text-stone-700">If you have questions about data handling or permissions, please contact us through the site contact form.</p>
        </article>
      </section>
    </main>
  );
}
