"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Spinner } from "flowbite-react";
import axios from "axios";
import { MatchCard } from "./components/MatchCard";
import { NavMenu } from "./components/Navmenu";

import { HiInformationCircle } from "react-icons/hi";

interface MatchInterface {
  name: string;
  phone: string;
  home_address: string;
  work_address: string;
  home_departure_time: string;
  work_departure_time: string;
  extra_travelTime: number;
  map_link: string;
  user_type: string;
}

interface MatchesResponse {
  passenger: {
    name: string;
    phone: string;
    home_address: {
      full_address: string;
    };
    work_address: {
      full_address: string;
    };
    home_departure: string;
    work_departure: string;
  };
  additional_time: number;
  map_link: string;
  driver: {
    name: string;
    phone: string;
    home_address: {
      full_address: string;
    };
    work_address: {
      full_address: string;
    };
    home_departure: string;
    work_departure: string;
  };
  additional_km: number;
  code: string;
  message: string;
  matches: string;
  user_type: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<MatchInterface[]>([]);
  const [matchesFetched, setMatchesFetched] = useState(false);

  const getMatches = async () => {
    try {
      setError(null); // Clear any previous errors
      setLoading(true);
      const response = await axios.get<{
        code: string;
        message: string;
        matches: string;
        user_type: string;
      }>(`${API_URL}/api/usermatches/${localStorage.getItem("user_guid")}`);

      setLoading(false);

      if (response.data.code !== "R00") {
        setError(response.data.message);
      } else {
        const matchesData = JSON.parse(response.data.matches);
        let filteredMatches;

        if (response.data.user_type === "driver") {
          filteredMatches = matchesData.map((match: MatchesResponse) => ({
            name: match.passenger.name,
            phone: match.passenger.phone,
            home_address: match.passenger.home_address.full_address,
            work_address: match.passenger.work_address.full_address,
            home_departure_time: match.passenger.home_departure,
            work_departure_time: match.passenger.work_departure,
            extra_travelTime: match.additional_time,
            map_link: match.map_link,
            user_type: "passenger",
          }));
        } else {
          filteredMatches = matchesData.map((match: MatchesResponse) => ({
            name: match.driver.name,
            phone: match.driver.phone,
            home_address: match.driver.home_address.full_address,
            work_address: match.driver.work_address.full_address,
            home_departure_time: match.driver.home_departure,
            work_departure_time: match.driver.work_departure,
            extra_travelTime: match.additional_time,
            extra_km: match.additional_km,
            user_type: "driver",
          }));
        }

        setMatches(filteredMatches);
        setMatchesFetched(true);
        setLoading(false);
        console.log("Matches:", filteredMatches);
      }
    } catch (error) {
      setError("Failed to get matches");
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    getMatches();
  }, []);

  useEffect(() => {
    const userGuid = localStorage.getItem("user_guid");
    if (userGuid) {
      setIsLoggedIn(true);
    } else {
      router.push("/splash");
    }
  }, [router]);

  const handleProfileSetup = () => {
    router.push("/profile");
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="block">
      <NavMenu />
      <div className="containerr">
        {error && (
          <Alert
            className="mt-5 w-full"
            color="failure"
            icon={HiInformationCircle}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Spinner aria-label="Extra large spinner example" size="xl" />
        ) : (
          <>
            <h2 className="title-18 m-5">Matches</h2>
            {localStorage.getItem("profile_complete") === "false" ? (
              <>
                <p>Complete your profile to find a lift club</p>
                <Button
                  onClick={handleProfileSetup}
                  gradientDuoTone="pinkToOrange"
                >
                  Setup Commute Profile
                </Button>
              </>
            ) : (
              <>
                <div id="matches" className="matches-container">
                  {matches.length > 0 ? (
                    <>
                      {matches.map((match, index) => (
                        <MatchCard key={index} match={match} />
                      ))}
                    </>
                  ) : (
                    <>
                      {matchesFetched ? (
                        <div>
                          <p className="mt-5 text-center">
                            No matches found, we will send you a WhatsApp
                            message when we find a match for you.
                          </p>
                          <img
                            src="/images/undraw_void_-3-ggu.svg"
                            alt="No matches found illustration"
                          />
                        </div>
                      ) : (
                        <p className="mt-5 text-center">Loading matches...</p>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
