import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

export default function ListingDetails() {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listings/public/${listingId}`);
        const data = await res.json();

        if (data.success === false) {
          setError(data.message);
          return;
        }

        setListing(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-4">
        <p className="rounded-lg bg-white p-4 text-slate-600">Loading estate...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-6xl p-4">
        <p className="rounded-lg bg-red-50 p-4 text-red-700">
          {error || "Estate not found"}
        </p>
      </div>
    );
  }

  const images = [
    listing.mainImage || listing.imageUrl,
    ...(listing.imageUrls || []),
  ].filter(Boolean);
  const hasDiscount =
    Number(listing.discountPrice) > 0 &&
    Number(listing.discountPrice) < Number(listing.regularPrice);
  const categories =
    listing.categories?.length > 0
      ? listing.categories
      : [listing.category === "real-estate" ? "commercial" : "residential"];
  const offerTypes =
    listing.offerTypes?.length > 0 ? listing.offerTypes : [listing.type];
  const seller =
    listing.userRef && typeof listing.userRef === "object"
      ? listing.userRef
      : null;
  const sellerInitial = seller?.username?.charAt(0).toUpperCase() || "S";

  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-6">
        <Link
          to="/"
          className="text-sm font-semibold text-slate-700 hover:text-slate-950"
        >
          Back to estates
        </Link>

        <div className="mt-5">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {images.length > 0 ? (
              <>
                <div className="relative bg-slate-200">
                  <Swiper
                    modules={[Navigation, Thumbs]}
                    navigation={images.length > 1}
                    thumbs={{
                      swiper:
                        thumbsSwiper && !thumbsSwiper.destroyed
                          ? thumbsSwiper
                          : null,
                    }}
                    loop={images.length > 1}
                    className="listing-main-swiper"
                  >
                    {images.map((image, index) => (
                      <SwiperSlide key={`${image}-${index}`}>
                        <img
                          src={image}
                          alt={`${listing.name} ${index + 1}`}
                          className="h-[430px] w-full object-cover sm:h-[620px]"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-slate-950/70 to-transparent" />
                  {images.length > 1 && (
                    <span className="absolute bottom-5 right-5 z-20 rounded-full bg-slate-950/80 px-4 py-2 text-sm font-semibold text-white">
                      {images.length} photos
                    </span>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="border-t border-slate-200 bg-white p-3">
                    <Swiper
                      modules={[FreeMode, Thumbs]}
                      onSwiper={setThumbsSwiper}
                      spaceBetween={12}
                      slidesPerView="auto"
                      freeMode
                      watchSlidesProgress
                      className="listing-thumbs-swiper"
                    >
                      {images.map((image, index) => (
                        <SwiperSlide
                          key={`${image}-thumb-${index}`}
                          className="!h-20 !w-28 sm:!h-24 sm:!w-36"
                        >
                          <img
                            src={image}
                            alt={`${listing.name} thumbnail ${index + 1}`}
                            className="h-full w-full rounded-lg object-cover"
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-[430px] items-center justify-center bg-slate-200 text-slate-500 sm:h-[620px]">
                No image
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Description</h2>
            <div
              className="estate-description mt-3"
              dangerouslySetInnerHTML={{ __html: listing.description }}
            />
          </section>

          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">
              {listing.name}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {listing.address}
            </p>
            {seller && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                {seller.avatar ? (
                  <img
                    src={seller.avatar}
                    alt={seller.username}
                    className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
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

            <p className="mt-5 text-2xl font-semibold text-slate-900">
              {hasDiscount && (
                <span className="mr-2 text-base text-slate-400 line-through">
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

            <div className="mt-4 flex flex-wrap gap-2">
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

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-lg font-semibold text-slate-900">
                  {listing.bedrooms}
                </p>
                <p className="text-xs uppercase text-slate-500">Beds</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-lg font-semibold text-slate-900">
                  {listing.bathrooms}
                </p>
                <p className="text-xs uppercase text-slate-500">Baths</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-lg font-semibold text-slate-900">
                  {listing.kitchens}
                </p>
                <p className="text-xs uppercase text-slate-500">Kitchens</p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-sm text-slate-700">
              <p>{listing.parking ? "Parking available" : "No parking"}</p>
              <p>{listing.furnished ? "Furnished" : "Unfurnished"}</p>
            </div>

            {seller && (
              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Seller details
                </p>
                <div className="mt-3 flex items-center gap-3">
                  {seller.avatar ? (
                    <img
                      src={seller.avatar}
                      alt={seller.username}
                      className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-xl font-semibold text-white shadow-sm">
                      {sellerInitial}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {seller.username}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {seller.email}
                    </p>
                  </div>
                </div>
                <a
                  href={`mailto:${seller.email}?subject=Estate inquiry: ${encodeURIComponent(
                    listing.name
                  )}`}
                  className="mt-4 block rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-semibold uppercase text-white transition hover:bg-slate-700"
                >
                  Contact seller
                </a>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
