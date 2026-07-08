import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";

const statusBadgeClass =
  "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase text-amber-700";

export default function AdminDashboard() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [pendingListings, setPendingListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser?.isAdmin) return;

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError("");

        const [usersRes, listingsRes] = await Promise.all([
          fetch("/api/users/admin/users"),
          fetch("/api/listings/admin/pending"),
        ]);
        const [usersData, listingsData] = await Promise.all([
          usersRes.json(),
          listingsRes.json(),
        ]);

        if (usersData.success === false) throw new Error(usersData.message);
        if (listingsData.success === false) throw new Error(listingsData.message);

        setUsers(usersData);
        setPendingListings(listingsData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [currentUser]);

  if (!currentUser) return <Navigate to="/sign-in" />;
  if (!currentUser.isAdmin) return <Navigate to="/" />;

  const handleDeleteUser = async (userId) => {
    try {
      setActionLoading(`delete-user-${userId}`);
      setError("");
      const res = await fetch(`/api/users/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success === false) throw new Error(data.message);

      setUsers(users.filter((user) => user._id !== userId));
      setPendingListings(
        pendingListings.filter((listing) => listing.userRef?._id !== userId)
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading("");
    }
  };

  const handleListingDecision = async (listingId, decision) => {
    try {
      setActionLoading(`${decision}-${listingId}`);
      setError("");
      const res = await fetch(`/api/listings/admin/${listingId}/${decision}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body:
          decision === "reject"
            ? JSON.stringify({ reason: "Rejected by admin" })
            : undefined,
      });
      const data = await res.json();

      if (data.success === false) throw new Error(data.message);

      setPendingListings(
        pendingListings.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading("");
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Admin dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Users and estate approvals
          </h1>
        </div>
        <Link
          to="/"
          className="rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-semibold uppercase text-white hover:bg-slate-700"
        >
          View site
        </Link>
      </div>

      {error && (
        <p className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6 rounded-lg bg-white p-4 text-slate-600">
          Loading admin data...
        </p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">Users</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {users.length} total
              </span>
            </div>

            <div className="mt-4 divide-y divide-slate-200">
              {users.map((user) => (
                <div key={user._id} className="flex items-center gap-3 py-4">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">
                      {user.username}
                      {user.isAdmin && (
                        <span className="ml-2 rounded bg-slate-900 px-2 py-0.5 text-[10px] uppercase text-white">
                          Admin
                        </span>
                      )}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {user.email}
                    </p>
                  </div>
                  {!user.isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(user._id)}
                      disabled={actionLoading === `delete-user-${user._id}`}
                      className="rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold uppercase text-white hover:opacity-95 disabled:opacity-70"
                    >
                      {actionLoading === `delete-user-${user._id}`
                        ? "Deleting"
                        : "Delete"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">
                Pending estates
              </h2>
              <span className={statusBadgeClass}>
                {pendingListings.length} pending
              </span>
            </div>

            {pendingListings.length === 0 ? (
              <p className="mt-5 rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-600">
                No estates waiting for approval.
              </p>
            ) : (
              <div className="mt-4 grid gap-4">
                {pendingListings.map((listing) => (
                  <article
                    key={listing._id}
                    className="overflow-hidden rounded-lg border border-slate-200"
                  >
                    <div className="grid gap-4 p-4 sm:grid-cols-[130px_1fr]">
                      <img
                        src={listing.mainImage || listing.imageUrls?.[0]}
                        alt={listing.name}
                        className="h-28 w-full rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <h3 className="line-clamp-1 font-semibold text-slate-900">
                          {listing.name}
                        </h3>
                        <p className="mt-1 line-clamp-1 text-sm text-slate-600">
                          {listing.address}
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                          <img
                            src={listing.userRef?.avatar}
                            alt={listing.userRef?.username}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                          <span className="truncate">
                            Seller: {listing.userRef?.username}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleListingDecision(listing._id, "approve")
                            }
                            disabled={actionLoading === `approve-${listing._id}`}
                            className="rounded-lg bg-green-700 px-4 py-2 text-xs font-semibold uppercase text-white hover:opacity-95 disabled:opacity-70"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleListingDecision(listing._id, "reject")
                            }
                            disabled={actionLoading === `reject-${listing._id}`}
                            className="rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold uppercase text-white hover:opacity-95 disabled:opacity-70"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
