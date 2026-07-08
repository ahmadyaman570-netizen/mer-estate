import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

const toggleValue = (values, value) => {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
};

const uploadButtonClass =
  "mt-3 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-slate-500 hover:bg-slate-100";

const getHtmlTextLength = (html) =>
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;

function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [previewOpen, setPreviewOpen] = useState(true);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const textLength = getHtmlTextLength(value);

  const updateValue = () => {
    onChange(editorRef.current?.innerHTML || "");
  };

  const runCommand = (command, commandValue = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    updateValue();
  };

  const clearEditor = () => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = "";
    onChange("");
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    updateValue();
  };

  const toolbarButton =
    "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50";

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-3 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Rich description editor
          </p>
          <p className="text-xs text-slate-500">
            Add headings, paragraphs, lists, and highlighted details.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            textLength > 900
              ? "bg-red-100 text-red-700"
              : "bg-slate-200 text-slate-700"
          }`}
        >
          {textLength}/1000
        </span>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-white p-3">
        <button
          type="button"
          onClick={() => runCommand("formatBlock", "p")}
          className={toolbarButton}
        >
          P
        </button>
        <button
          type="button"
          onClick={() => runCommand("formatBlock", "h2")}
          className={toolbarButton}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => runCommand("formatBlock", "h3")}
          className={toolbarButton}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => runCommand("bold")}
          className={toolbarButton}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => runCommand("italic")}
          className={toolbarButton}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => runCommand("underline")}
          className={toolbarButton}
        >
          U
        </button>
        <button
          type="button"
          onClick={() => runCommand("insertUnorderedList")}
          className={toolbarButton}
        >
          List
        </button>
        <button
          type="button"
          onClick={() => runCommand("insertOrderedList")}
          className={toolbarButton}
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => runCommand("formatBlock", "blockquote")}
          className={toolbarButton}
        >
          Quote
        </button>
        <button
          type="button"
          onClick={() => setPreviewOpen((current) => !current)}
          className={toolbarButton}
        >
          Preview
        </button>
        <button
          type="button"
          onClick={clearEditor}
          className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
        >
          Clear
        </button>
      </div>

      <div
        ref={editorRef}
        role="textbox"
        aria-label="Estate description"
        contentEditable
        suppressContentEditableWarning
        onInput={updateValue}
        onPaste={handlePaste}
        className="rich-text-input estate-description min-h-72 w-full bg-white p-4 outline-none"
      />

      {previewOpen && (
        <div className="border-t border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Live preview
          </p>
          <div
            className="estate-description mt-2 max-h-44 overflow-y-auto rounded-lg bg-white p-3"
            dangerouslySetInnerHTML={{
              __html: value || "<p>Your formatted description will appear here.</p>",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function CreateListing() {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const isEditing = Boolean(listingId);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    regularPrice: "",
    discountPrice: "",
    bedrooms: 1,
    bathrooms: 1,
    kitchens: 1,
    parking: false,
    furnished: false,
    categories: ["residential"],
    offerTypes: ["sale"],
    mainImage: "",
    imageUrls: [],
  });
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (!isEditing) return;

    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listings/${listingId}`);
        const data = await res.json();

        if (data.success === false) {
          setError(data.message);
          return;
        }

        setFormData({
          name: data.name || "",
          description: data.description || "",
          address: data.address || "",
          regularPrice: data.regularPrice || "",
          discountPrice: data.discountPrice || "",
          bedrooms: data.bedrooms ?? 1,
          bathrooms: data.bathrooms ?? 1,
          kitchens: data.kitchens ?? 1,
          parking: Boolean(data.parking),
          furnished: Boolean(data.furnished),
          categories:
            data.categories?.length > 0
              ? data.categories
              : [data.category === "real-estate" ? "commercial" : "residential"],
          offerTypes: data.offerTypes?.length > 0 ? data.offerTypes : [data.type],
          mainImage: data.mainImage || data.imageUrl || "",
          imageUrls: data.imageUrls || [],
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [isEditing, listingId]);

  const validateImages = (files, maxFiles) => {
    if (files.length > maxFiles) return `You can upload up to ${maxFiles} images`;

    if (files.some((file) => !allowedImageTypes.includes(file.type))) {
      return "Only JPEG, PNG, and WebP images are allowed";
    }

    if (files.some((file) => file.size > 4 * 1024 * 1024)) {
      return "Each image must be smaller than 4MB";
    }

    return "";
  };

  const uploadImages = async (files) => {
    const imageFormData = new FormData();
    files.forEach((file) => imageFormData.append("images", file));

    const res = await fetch("/api/listings/upload-images", {
      method: "POST",
      body: imageFormData,
    });
    const data = await res.json();

    if (data.success === false) throw new Error(data.message);

    return data.imageUrls;
  };

  const handleMainImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validationError = validateImages(files, 1);
    if (validationError) {
      setImageError(validationError);
      return;
    }

    try {
      setImageUploading(true);
      setImageError("");
      const [mainImage] = await uploadImages(files);
      setFormData({ ...formData, mainImage });
    } catch (error) {
      setImageError(error.message);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSliderImagesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const availableSlots = 6 - formData.imageUrls.length;
    const validationError = validateImages(files, availableSlots);
    if (validationError) {
      setImageError(validationError);
      return;
    }

    try {
      setImageUploading(true);
      setImageError("");
      const imageUrls = await uploadImages(files);
      setFormData({
        ...formData,
        imageUrls: [...formData.imageUrls, ...imageUrls],
      });
    } catch (error) {
      setImageError(error.message);
    } finally {
      setImageUploading(false);
    }
  };

  const handleChange = (e) => {
    const { id, type, checked, value } = e.target;
    setFormData({ ...formData, [id]: type === "checkbox" ? checked : value });
    setError("");
  };

  const handleMultiSelect = (field, value) => {
    const nextValues = toggleValue(formData[field], value);
    if (nextValues.length === 0) return;
    setFormData({ ...formData, [field]: nextValues });
    setError("");
  };

  const removeSliderImage = (imageUrl) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((url) => url !== imageUrl),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.mainImage) {
      setError("Main image is required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        isEditing ? `/api/listings/${listingId}` : "/api/listings",
        {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        }
      );
      const data = await res.json();

      if (data.success === false) {
        setError(data.message);
        return;
      }

      navigate("/my-listings");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const optionClass = (active) =>
    `rounded-lg border p-4 text-left transition ${
      active
        ? "border-slate-800 bg-slate-900 text-white shadow-sm"
        : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
    }`;

  return (
    <div className="mx-auto max-w-5xl p-3">
      <div className="my-7">
        <h1 className="text-center text-3xl font-semibold text-slate-900">
          {isEditing ? "Edit Estate" : "Create New Estate"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Details</h2>
            <div className="mt-4 grid gap-4">
              <input
                type="text"
                id="name"
                placeholder="Estate name"
                value={formData.name}
                onChange={handleChange}
                className="rounded-lg border bg-white p-3"
                required
              />
              <RichTextEditor
                value={formData.description}
                onChange={(description) => {
                  setFormData({ ...formData, description });
                  setError("");
                }}
              />
              <input
                type="text"
                id="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className="rounded-lg border bg-white p-3"
                required
              />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Pricing</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input
                type="number"
                id="regularPrice"
                placeholder="Price before discount"
                min="1"
                value={formData.regularPrice}
                onChange={handleChange}
                className="rounded-lg border bg-white p-3"
                required
              />
              <input
                type="number"
                id="discountPrice"
                placeholder="Price after discount"
                min="1"
                value={formData.discountPrice}
                onChange={handleChange}
                className="rounded-lg border bg-white p-3"
              />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Specs</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <input
                type="number"
                id="bedrooms"
                placeholder="Bedrooms"
                min="0"
                value={formData.bedrooms}
                onChange={handleChange}
                className="rounded-lg border bg-white p-3"
                required
              />
              <input
                type="number"
                id="bathrooms"
                placeholder="Bathrooms"
                min="0"
                value={formData.bathrooms}
                onChange={handleChange}
                className="rounded-lg border bg-white p-3"
                required
              />
              <input
                type="number"
                id="kitchens"
                placeholder="Kitchens"
                min="0"
                value={formData.kitchens}
                onChange={handleChange}
                className="rounded-lg border bg-white p-3"
                required
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-lg border bg-white p-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  id="parking"
                  checked={formData.parking}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                Parking
              </label>
              <label className="flex items-center gap-2 rounded-lg border bg-white p-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  id="furnished"
                  checked={formData.furnished}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                Furnished
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Images</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Main image
                </label>
                <label className={uploadButtonClass}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleMainImageUpload}
                    disabled={imageUploading}
                    className="hidden"
                  />
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-2xl font-light text-white">
                    +
                  </span>
                  <span className="mt-3 text-sm font-semibold text-slate-800">
                    {formData.mainImage ? "Replace main image" : "Upload main image"}
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    JPEG, PNG, or WebP up to 4MB
                  </span>
                </label>
                {formData.mainImage && (
                  <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
                    <img
                      src={formData.mainImage}
                      alt="Main estate"
                      className="h-52 w-full object-cover"
                    />
                    <div className="bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                      Main cover image
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Slider images
                  </label>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {formData.imageUrls.length}/6
                  </span>
                </div>
                <label
                  className={`${uploadButtonClass} ${
                    formData.imageUrls.length >= 6 || imageUploading
                      ? "pointer-events-none opacity-60"
                      : ""
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleSliderImagesUpload}
                    disabled={formData.imageUrls.length >= 6 || imageUploading}
                    className="hidden"
                  />
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-2xl font-light text-white">
                    +
                  </span>
                  <span className="mt-3 text-sm font-semibold text-slate-800">
                    Add slider photos
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    Select multiple images
                  </span>
                </label>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {formData.imageUrls.map((imageUrl) => (
                    <button
                      type="button"
                      key={imageUrl}
                      onClick={() => removeSliderImage(imageUrl)}
                      className="relative h-24 overflow-hidden rounded-lg bg-slate-100"
                    >
                      <img
                        src={imageUrl}
                        alt="Estate slider"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute right-1 top-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
                        Remove
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {imageUploading && (
              <p className="mt-4 text-center text-sm text-slate-600">
                Uploading images...
              </p>
            )}
            {imageError && (
              <p className="mt-4 text-center text-red-700">{imageError}</p>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Category</h2>
            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={() => handleMultiSelect("categories", "residential")}
                className={optionClass(formData.categories.includes("residential"))}
              >
                <span className="block font-semibold">Residential</span>
                <span className="mt-1 block text-sm opacity-80">
                  Homes, apartments, villas
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleMultiSelect("categories", "commercial")}
                className={optionClass(formData.categories.includes("commercial"))}
              >
                <span className="block font-semibold">Commercial</span>
                <span className="mt-1 block text-sm opacity-80">
                  Offices, shops, business spaces
                </span>
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Offer</h2>
            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={() => handleMultiSelect("offerTypes", "sale")}
                className={optionClass(formData.offerTypes.includes("sale"))}
              >
                <span className="block font-semibold">Sell</span>
                <span className="mt-1 block text-sm opacity-80">
                  Available for purchase
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleMultiSelect("offerTypes", "rent")}
                className={optionClass(formData.offerTypes.includes("rent"))}
              >
                <span className="block font-semibold">Rent</span>
                <span className="mt-1 block text-sm opacity-80">
                  Available for monthly rent
                </span>
              </button>
            </div>
          </section>

          <button
            disabled={loading || imageUploading}
            className="rounded-lg bg-slate-900 p-3 uppercase text-white hover:opacity-95 disabled:opacity-80"
          >
            {loading
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
                ? "Update estate"
                : "Create estate"}
          </button>

          {error && <p className="text-center text-red-700">{error}</p>}
        </aside>
      </form>
    </div>
  );
}
