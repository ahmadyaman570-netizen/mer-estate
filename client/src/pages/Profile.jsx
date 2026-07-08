import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserFailure,
  signOutUserStart,
  signOutUserSuccess,
  updateUserFailure,
  updateUserStart,
  updateUserSuccess,
} from "../redux/user/userSlice";

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Only JPEG, PNG, and WebP images are allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image must be smaller than 2MB");
      return;
    }

    setUploading(true);
    setUploadError("");

    const imageFormData = new FormData();
    imageFormData.append("avatar", file);

    try {
      const res = await fetch("/api/users/upload-avatar", {
        method: "POST",
        body: imageFormData,
      });

      const data = await res.json();

      if (data.avatar) {
        setAvatar(data.avatar);
        setFormData((prevFormData) => ({
          ...prevFormData,
          avatar: data.avatar,
        }));
      } else {
        setUploadError(data.message || "Error uploading image");
      }
    } catch {
      setUploadError("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setUpdateSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uploading) return;

    try {
      dispatch(updateUserStart());
      const payload = { ...formData };

      if (payload.password !== undefined && payload.password.trim() === "") {
        delete payload.password;
      }

      const res = await fetch(`/api/users/update/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        setUpdateSuccess(false);
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      setUpdateSuccess(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/users/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        setShowDeletePopup(false);
        return;
      }

      dispatch(deleteUserSuccess());
      setShowDeletePopup(false);
      navigate("/sign-in");
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
      setShowDeletePopup(false);
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch("/api/auth/signout", {
        method: "POST",
      });
      const data = await res.json();

      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }

      dispatch(signOutUserSuccess());
      navigate("/sign-in");
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mx-auto max-w-lg p-3">
        <input
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
          onChange={handleImageUpload}
        />

        <img
          onClick={() => fileRef.current.click()}
          src={avatar}
          alt={currentUser.username}
          className="w-24 h-24 rounded-full object-cover cursor-pointer self-center mt-2"
        />

        {uploading && (
          <p className="text-sm text-center text-slate-600">Uploading...</p>
        )}

        {uploadError && (
          <p className="text-sm text-center text-red-700">
            {uploadError}
          </p>
        )}

        <input
          type="text"
          placeholder="Username"
          defaultValue={currentUser.username}
          className="border p-3 rounded-lg bg-white"
          id="username"
          onChange={handleChange}
        />

        <input
          type="text"
          placeholder="Email"
          defaultValue={currentUser.email}
          className="border p-3 rounded-lg bg-white"
          id="email"
          onChange={handleChange}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-3 rounded-lg bg-white"
          id="password"
          onChange={handleChange}
        />

        <button
          disabled={loading || uploading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Updating..." : "Update"}
        </button>

        <Link
          to="/my-listings"
          className="bg-green-700 text-white rounded-lg p-3 uppercase text-center hover:opacity-95"
        >
          Create listing
        </Link>
      </form>

      {error && <p className="text-red-700 mt-3 text-center">{error}</p>}
      {updateSuccess && (
        <p className="text-green-700 mt-3 text-center">
          User updated successfully
        </p>
      )}

      <div className="flex mt-5 justify-between">
        <button
          type="button"
          onClick={() => setShowDeletePopup(true)}
          disabled={loading}
          className="text-red-700 cursor-pointer disabled:opacity-70"
        >
          Delete account
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={loading}
          className="text-red-700 cursor-pointer disabled:opacity-70"
        >
          Sign out
        </button>
      </div>

      {showDeletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl"
          >
            <h2
              id="delete-account-title"
              className="text-xl font-semibold text-slate-900"
            >
              Delete account?
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This action will permanently delete your account and sign you out.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeletePopup(false)}
                disabled={loading}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={loading}
                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-70"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
