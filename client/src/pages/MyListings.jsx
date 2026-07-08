import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const statusStyles = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const statusLabels = {
  pending: "Pending approval",
  approved: "Approved",
  rejected: "Rejected",
};

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/listings/mine");
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
    };

    fetchListings();
  }, []);

  const handleDeleteListing = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/listings/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success === false) {
        setError(data.message);
        return;
      }

      setListings(listings.filter((listing) => listing._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-3">
      <div className="my-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold">My Estates</h1>
        <Link
          to="/create-listing"
          className="rounded-lg bg-slate-700 px-4 py-3 text-center font-semibold uppercase text-white hover:opacity-95"
        >
          Create new estate
        </Link>
      </div>

      {loading && <p className="text-slate-600">Loading estates...</p>}
      {error && <p className="text-red-700">{error}</p>}

      {!loading && !error && listings.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <p className="text-slate-600">No estates added yet.</p>
          <Link
            to="/create-listing"
            className="mt-4 inline-block rounded-lg bg-green-700 px-4 py-3 font-semibold uppercase text-white hover:opacity-95"
          >
            Create new estate
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          (() => {
            const coverImage =
              listing.mainImage || listing.imageUrls?.[0] || listing.imageUrl;
            const hasDiscount =
              Number(listing.discountPrice) > 0 &&
              Number(listing.discountPrice) < Number(listing.regularPrice);
            const categories =
              listing.categories?.length > 0
                ? listing.categories
                : [listing.category === "real-estate" ? "commercial" : "residential"];
            const offerTypes =
              listing.offerTypes?.length > 0 ? listing.offerTypes : [listing.type];

            return (
          <article
            key={listing._id}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="h-44 bg-slate-200">
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
              <h2 className="line-clamp-1 text-lg font-semibold text-slate-800">
                {listing.name}
              </h2>
              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                  statusStyles[listing.status] || statusStyles.pending
                }`}
              >
                {statusLabels[listing.status] || statusLabels.pending}
              </span>
              {listing.status === "rejected" && listing.rejectionReason && (
                <p className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-700">
                  {listing.rejectionReason}
                </p>
              )}
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                {listing.address}
              </p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-800">
                  {hasDiscount && (
                    <span className="mr-2 text-slate-400 line-through">
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
                </span>
              </div>
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
              <p className="mt-2 text-sm text-slate-600">
                {listing.bedrooms} beds | {listing.bathrooms} baths |{" "}
                {listing.kitchens} kitchens
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {listing.parking ? "Parking" : "No parking"} |{" "}
                {listing.furnished ? "Furnished" : "Unfurnished"}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  to={`/edit-listing/${listing._id}`}
                  className="rounded-lg bg-slate-700 px-3 py-2 text-center text-sm font-semibold uppercase text-white hover:opacity-95"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(listing)}
                  className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold uppercase text-white hover:opacity-95"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
            );
          })()
        ))}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-listing-title"
            className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl"
          >
            <h2
              id="delete-listing-title"
              className="text-xl font-semibold text-slate-900"
            >
              Delete estate?
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This will permanently delete {deleteTarget.name}.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteListing}
                disabled={deleteLoading}
                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-70"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
