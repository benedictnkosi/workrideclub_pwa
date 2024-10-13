"use client";

import { CiHome, CiLogout, CiUser } from "react-icons/ci";

export function NavMenu() {
  const logout = async () => {
    localStorage.removeItem("user_guid");
    localStorage.removeItem("commuter");
    localStorage.removeItem("profile_complete");
    window.location.href = "/login";
  };

  return (
    <div className="navbar">
      <a
        href="/"
        className="self-center whitespace-nowrap text-xl font-semibold"
      >
        Work Ride Club
      </a>
      <div className="flex">
        <a href="/profile">
          <CiUser className="title-24" />
        </a>
        <a href="/">
          <CiHome className="title-24 ml-5" />
        </a>
        <CiLogout onClick={logout} className="title-24 ml-5" />
      </div>
    </div>
  );
}
