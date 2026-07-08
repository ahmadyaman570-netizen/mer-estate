import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import heroImage from "../assets/hero.png";

const initialFilters = {
  searchTerm: "",
  category: "all",
  offerType: "all",
  parking: false,
  furnished: false,
  minPrice: "",
  maxPrice: "",
  sort: "createdAt",
  order: "desc",
};

const getFiltersFromParams = (searchParams) => ({
  searchTerm: searchParams.get("searchTerm") || "",
  category: searchParams.get("category") || "all",
  offerType: searchParams.get("offerType") || "all",
  parking: searchParams.get("parking") === "true",
  furnished: searchParams.get("furnished") === "true",
  minPrice: searchParams.get("minPrice") || "",
  maxPrice: searchParams.get("maxPrice") || "",
  sort: searchParams.get("sort") || "createdAt",
  order: searchParams.get("order") || "desc",
});

function SelectField({ id, value, onChange, options, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  const handleSelect = (nextValue) => {
    onChange({
      target: {
        id,
        type: "select",
        value: nextValue,
      },
    });
    setIsOpen(false);
  };

  return (
    <div
      className={`relative ${className}`}
      onBlur={() => setTimeout(() => setIsOpen(false), 120)}
    >
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className={`flex h-full min-h-12 w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 py-3 text-left text-sm shadow-sm outline-none transition ${
          isOpen
            ? "border-slate-800 ring-2 ring-slate-200"
            : "border-slate-200 hover:border-slate-400"
        }`}
      >
        <span className="truncate text-slate-800">{selectedOption.label}</span>
        <span
          className={`text-xs text-slate-500 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          v
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(option.value)}
                className={`flex w-full items-center justify-between px-3 py-3 text-left text-sm transition ${
                  isSelected
                    ? "bg-slate-900 font-semibold text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{option.label}</span>
                {isSelected && <span className="text-xs">Selected</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => getFiltersFromParams(searchParams));
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchListings(activeFilters) {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();

      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value && value !== "all" && value !== false) {
          params.set(key, value);
        }
      });

      const res = await fetch(`/api/listings/search?${params.toString()}`);
      const data = await res.json();

      if (data.success === false) {
        setError(data.message);
        return;
      }

      setListings(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchListings(getFiltersFromParams(searchParams));
    }, 0);

    return () => clearTimeout(timeout);
  }, [searchParams]);

  const handleChange = (e) => {
    const { id, type, checked, value } = e.target;
    setFilters({ ...filters, [id]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all" && value !== false) {
        params.set(key, value);
      }
    });

    setSearchParams(params);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchParams(new URLSearchParams());
  };

  return (
    <main className="bg-slate-50">
      <section className="relative min-h-[420px] overflow-hidden">
        <img
          src={heroImage}
          alt="Modern estate"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/55" />
        <div className="relative mx-auto flex min-h-[420px] max-w-6xl flex-col justify-center px-4 py-14">
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Find the estate that fits your next move
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-100">
            Browse residential and commercial estates for sale, rent, or both.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 grid max-w-4xl gap-3 rounded-lg bg-white p-3 shadow-xl md:grid-cols-[1fr_160px_160px_auto]"
          >
            <input
              id="searchTerm"
              type="text"
              placeholder="Search by city, address, or estate name"
              value={filters.searchTerm}
              onChange={handleChange}
              className="rounded-lg border border-slate-200 p-3 outline-none focus:border-slate-500"
            />
            <SelectField
              id="category"
              value={filters.category}
              onChange={handleChange}
              options={[
                { value: "all", label: "All categories" },
                { value: "residential", label: "Residential" },
                { value: "commercial", label: "Commercial" },
              ]}
            />
            <SelectField
              id="offerType"
              value={filters.offerType}
              onChange={handleChange}
              options={[
                { value: "all", label: "All offers" },
                { value: "sale", label: "Sell" },
                { value: "rent", label: "Rent" },
              ]}
            />
            <button className="rounded-lg bg-slate-900 px-5 py-3 font-semibold uppercase text-white hover:opacity-95">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Reset
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
            <label className="text-sm font-semibold text-slate-700">
              Sort
              <SelectField
                id="sort"
                value={filters.sort}
                onChange={handleChange}
                className="mt-2"
                options={[
                  { value: "createdAt", label: "Newest" },
                  { value: "regularPrice", label: "Price" },
                ]}
              />
            </label>

            <label className="text-sm font-semibold text-slate-700">
              Order
              <SelectField
                id="order"
                value={filters.order}
                onChange={handleChange}
                className="mt-2"
                options={[
                  { value: "desc", label: "High to low" },
                  { value: "asc", label: "Low to high" },
                ]}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <input
                id="minPrice"
                type="number"
                placeholder="Min price"
                min="1"
                value={filters.minPrice}
                onChange={handleChange}
                className="rounded-lg border border-slate-200 p-3 outline-none focus:border-slate-500"
              />
              <input
                id="maxPrice"
                type="number"
                placeholder="Max price"
                min="1"
                value={filters.maxPrice}
                onChange={handleChange}
                className="rounded-lg border border-slate-200 p-3 outline-none focus:border-slate-500"
              />
            </div>

            <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm font-semibold text-slate-700">
              <input
                id="parking"
                type="checkbox"
                checked={filters.parking}
                onChange={handleChange}
                className="h-4 w-4"
              />
              Parking
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm font-semibold text-slate-700">
              <input
                id="furnished"
                type="checkbox"
                checked={filters.furnished}
                onChange={handleChange}
                className="h-4 w-4"
              />
              Furnished
            </label>

            <button className="rounded-lg bg-slate-900 p-3 font-semibold uppercase text-white hover:opacity-95">
              Apply filters
            </button>
          </form>
        </aside>

        <div>
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Estates</h2>
              <p className="mt-1 text-sm text-slate-600">
                {loading ? "Searching..." : `${listings.length} results found`}
              </p>
            </div>
          </div>

          {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
          {loading && <p className="rounded-lg bg-white p-4 text-slate-600">Loading estates...</p>}

          {!loading && !error && listings.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              No estates match your search.
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => {
              const coverImage =
                listing.mainImage || listing.imageUrls?.[0] || listing.imageUrl;
              const hasDiscount =
                Number(listing.discountPrice) > 0 &&
                Number(listing.discountPrice) < Number(listing.regularPrice);
              const categories =
                listing.categories?.length > 0
                  ? listing.categories
                  : [
                      listing.category === "real-estate"
                        ? "commercial"
                        : "residential",
                    ];
              const offerTypes =
                listing.offerTypes?.length > 0 ? listing.offerTypes : [listing.type];
              const seller =
                listing.userRef && typeof listing.userRef === "object"
                  ? listing.userRef
                  : null;
              const sellerInitial = seller?.username?.charAt(0).toUpperCase() || "S";

              return (
                <article
                  key={listing._id}
                  className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                >
                  <div className="h-52 bg-slate-200">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={listing.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-500">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 text-lg font-semibold text-slate-900">
                      {listing.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {listing.address}
                    </p>
                    {seller && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        {seller.avatar ? (
                          <img
                            src={seller.avatar}
                            alt={seller.username}
                            className="h-7 w-7 rounded-full border border-slate-200 object-cover"
                          />
                        ) : (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                            {sellerInitial}
                          </span>
                        )}
                        <span className="min-w-0 truncate">
                          Seller:{" "}
                          <span className="font-semibold text-slate-700">
                            {seller.username}
                          </span>
                        </span>
                      </div>
                    )}
                    <p className="mt-4 text-lg font-semibold text-slate-900">
                      {hasDiscount && (
                        <span className="mr-2 text-sm text-slate-400 line-through">
                          ${Number(listing.regularPrice).toLocaleString()}
                        </span>
                      )}
                      $
                      {Number(
                        hasDiscount ? listing.discountPrice : listing.regularPrice
                      ).toLocaleString()}
                      {offerTypes.includes("rent") && !offerTypes.includes("sale")
                        ? " / month"
                        : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <span
                          key={category}
                          className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-600"
                        >
                          {category === "commercial" ? "Commercial" : "Residential"}
                        </span>
                      ))}
                      {offerTypes.map((offerType) => (
                        <span
                          key={offerType}
                          className="rounded bg-green-100 px-2 py-1 text-xs font-semibold uppercase text-green-700"
                        >
                          {offerType === "sale" ? "Sell" : "Rent"}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {listing.bedrooms} beds | {listing.bathrooms} baths |{" "}
                      {listing.kitchens} kitchens
                    </p>
                    <Link
                      to={`/listing/${listing._id}`}
                      className="mt-4 inline-block text-sm font-semibold text-slate-900 hover:underline"
                    >
                      View details
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
