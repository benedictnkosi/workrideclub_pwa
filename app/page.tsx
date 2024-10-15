"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Alert, Button, Spinner } from "flowbite-react";
import axios from "axios";
import { MatchCard } from "./components/MatchCard";
import { NavMenu } from "./components/Navmenu";
import { HiInformationCircle } from "react-icons/hi";
import { GoogleTagManager } from "@next/third-parties/google";
import Head from "next/head";

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
        setLoading(false);
        setMatchesFetched(true);
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
    <>
      <Head>
        <title>Matches | Carpool</title>
        <meta name="description" content="Find a lift club to work or school" />
      </Head>
      <div className="block">
        <NavMenu />
        <div className="container" style={{ height: "auto" }}>
          {matches.length < 2 && (
            <div className="logo-container">
              <img
                src="/images/carpool.png"
                alt="logo"
                className="mt-5 logo-image"
              />
            </div>
          )}
          <div className="container-content">
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
              <div className="flex flex-col items-center mt-5">
                <h2 className="title-24 m-5">Matches</h2>
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
                            <div className="flex flex-col items-center mt-5">
                              <p className="text-center">
                                No matches found, we will send you a WhatsApp
                                message when we find a match for you.
                              </p>
                              <Image
                                src="/images/undraw_void_-3-ggu.svg"
                                alt="No matches found illustration"
                                width={300}
                                height={300}
                                className="mt-10"
                              />
                            </div>
                          ) : (
                            <p className="mt-5 text-center">
                              Loading matches...
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <GoogleTagManager gtmId="G-YQJZ73S924" />
    </>
  );
}
