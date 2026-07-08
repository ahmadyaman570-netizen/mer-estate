import { Link } from "react-router-dom";
import heroImage from "../assets/hero.png";

const services = [
  {
    title: "Smart estate discovery",
    text: "Search residential and commercial estates with filters for sale, rent, price, amenities, and keywords.",
  },
  {
    title: "Professional listing tools",
    text: "Owners can publish estates with cover images, gallery photos, rich descriptions, pricing, rooms, and features.",
  },
  {
    title: "Clear seller access",
    text: "Each estate page highlights the seller profile so visitors can contact the right owner directly.",
  },
];

const steps = [
  "Create an account and complete your profile.",
  "Upload estate photos and write a clear rich description.",
  "Publish, edit, or remove your estate from your private dashboard.",
];

export default function About() {
  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <img
          src={heroImage}
          alt="Modern real estate"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-slate-950/55" />

        <div className="relative mx-auto grid min-h-[520px] max-w-6xl items-end gap-10 px-4 py-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="pb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">
              About Aqark Estate
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              A better way to publish, compare, and find real estate.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">
              Aqark Estate helps buyers, renters, and owners move through the
              property journey with clear listings, real photos, practical
              filters, and direct seller information.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/"
                className="rounded-lg bg-white px-5 py-3 text-sm font-semibold uppercase text-slate-950 transition hover:bg-slate-100"
              >
                Browse estates
              </Link>
              <Link
                to="/create-listing"
                className="rounded-lg border border-white/50 px-5 py-3 text-sm font-semibold uppercase text-white transition hover:bg-white/10"
              >
                Create listing
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pb-4">
            <div className="rounded-lg bg-white/12 p-4 backdrop-blur">
              <p className="text-2xl font-semibold">2</p>
              <p className="mt-1 text-xs uppercase text-slate-200">
                Estate types
              </p>
            </div>
            <div className="rounded-lg bg-white/12 p-4 backdrop-blur">
              <p className="text-2xl font-semibold">6</p>
              <p className="mt-1 text-xs uppercase text-slate-200">
                Gallery photos
              </p>
            </div>
            <div className="rounded-lg bg-white/12 p-4 backdrop-blur">
              <p className="text-2xl font-semibold">24/7</p>
              <p className="mt-1 text-xs uppercase text-slate-200">
                Online search
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              What we do
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight">
              Practical tools for serious property decisions.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              The platform is designed around the real work of property search:
              compare prices, inspect photos, understand amenities, and reach
              the seller without noise.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {service.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-2">
          <div className="rounded-lg bg-slate-100 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              For property seekers
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              Find the right estate faster.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Browse listings by category, offer type, price range, parking,
              furnishing, and search terms. Every detail page brings photos,
              room counts, amenities, price details, and seller contact into one
              focused view.
            </p>
          </div>

          <div className="rounded-lg bg-slate-900 p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              For owners
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              Publish listings with confidence.
            </h2>
            <ol className="mt-5 space-y-3">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-6">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-950">
                    {index + 1}
                  </span>
                  <span className="text-slate-200">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid items-center gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Ready to explore available estates?
            </h2>
            <p className="mt-2 max-w-2xl leading-7 text-slate-600">
              Start from the home page to search current listings, filter by
              your needs, and open the estate page for full details.
            </p>
          </div>
          <Link
            to="/"
            className="rounded-lg bg-slate-900 px-5 py-3 text-center text-sm font-semibold uppercase text-white transition hover:bg-slate-700"
          >
            Start searching
          </Link>
        </div>
      </section>
    </main>
  );
}
