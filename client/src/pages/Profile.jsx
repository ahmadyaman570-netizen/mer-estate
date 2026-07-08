import React from "react";
import { useSelector } from "react-redux";

export default function Profile() {
  const { currentUser } = useSelector((state) => state.user);
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form className="flex flex-col gap-4 mx-auto max-w-lg p-3">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-24 h-24 rounded-full object-cover cursor-pointer self-center mt-2"
        />
        <input
          type="text"
          placeholder="Username"
          defaultValue={currentUser.username}
          className="border p-3 rounded-lg bg-white"
          id="username"
        />
        <input
          type="text"
          placeholder="Email"
          defaultValue={currentUser.email}
          className="border p-3 rounded-lg bg-white"
          id="email"
        />

        <input
          type="text"
          placeholder="password"
          className="border p-3 rounded-lg bg-white"
          id="password"
        />
        <button className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80">Update</button>
      </form>
      <div className="flex mt-5 justify-between">
        <span className="text-red-700 cursor-pointer">Delete account</span>
         <span className="text-red-700 cursor-pointer">Sign out</span>
      </div>
    </div>
  );
}
