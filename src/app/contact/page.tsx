export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fffefb_45%,#fff7ed_100%)] text-stone-900">
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_0.9fr] lg:px-10">
        <article className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Contact</p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-900">Get help, share feedback, or submit a recipe.</h1>
          <p className="mt-4 text-stone-600">The contact form supports recipe corrections, technical support, partnership inquiries, and general questions about the alcohol-free policy.</p>
        </article>
        <form className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <label className="block text-sm font-medium text-stone-700">Full name</label>
          <input className="mt-1 w-full rounded-2xl border border-stone-200 bg-stone-50 p-3" />
          <label className="mt-4 block text-sm font-medium text-stone-700">Email</label>
          <input className="mt-1 w-full rounded-2xl border border-stone-200 bg-stone-50 p-3" />
          <label className="mt-4 block text-sm font-medium text-stone-700">Message</label>
          <textarea className="mt-1 min-h-28 w-full rounded-2xl border border-stone-200 bg-stone-50 p-3" />
          <button className="mt-6 rounded-full bg-amber-700 px-5 py-3 text-white">Send request</button>
        </form>
      </section>
    </main>
  );
}
