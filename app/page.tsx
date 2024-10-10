"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "flowbite-react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const profile_completed = localStorage.getItem("profile_complete");
    if (token) {
      setIsLoggedIn(true);
    } else {
      router.push("/login");
    }
  }, []);

  const handleProfileSetup = () => {
    router.push("/profile");
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="container">
      <h2 className="header">Work Ride Club</h2>
      {localStorage.getItem("profile_complete") === "false" ? (
        <>
          <p>Complete your profile to find a lift club</p>
          <Button onClick={handleProfileSetup} gradientDuoTone="cyanToBlue">
            Setup Commute Profile
          </Button>
        </>
      ) : (
        <div id="matches">Matches here</div>
      )}
    </div>
  );
}
