"use client";

import React, { useState, useRef, useEffect } from "react";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";

import axios from "axios";
import { Button, Label, Select, TextInput } from "flowbite-react";
import "./page.css";
import { set, z } from "zod";
import { Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { Spinner } from "flowbite-react";
import { useRouter } from "next/navigation";
import { PlaceAutocomplete } from "./PlaceAutoComplete";

const addressInterface = {
  full_address: "",
  longitude: 0,
  latitude: 0,
  state: "",
  type: "",
  city: "",
  country: "",
};

const commuterInterface = {
  name: "",
  phone: "",
  home_address: addressInterface,
  work_address: addressInterface,
  home_departure_time: "6:30 AM",
  work_departure_time: "4:00 PM",
  type: "Select Commute Type",
  guid: "",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Profile: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [commuter, setCommuter] = useState(commuterInterface);

  const getCommuter = async () => {
    try {
      setError(null); // Clear any previous errors
      setLoading(true);
      const response = await axios.get<{
        code: string;
        message: string;
        commuter: string;
      }>(`${API_URL}/api/commuter/${localStorage.getItem("token")}`);

      setLoading(false);

      if (response.data.code !== "R00") {
        setError(response.data.message);
      } else {
        const commuterData = JSON.parse(response.data.commuter);
        setCommuter((prevState) => ({
          ...prevState,
          home_address: {
            ...prevState.home_address,
            full_address: commuterData.home_address.full_address,
            longitude: commuterData.home_address.longitude,
            latitude: commuterData.home_address.latitude,
            state: commuterData.home_address.state,
            city: commuterData.home_address.city,
          },
          guid: commuterData.guid,
          name: commuterData.name,
          phone: commuterData.phone,
          type: commuterData.type,
          work_address: {
            ...prevState.work_address,
            full_address: commuterData.work_address.full_address,
            longitude: commuterData.work_address.longitude,
            latitude: commuterData.work_address.latitude,
            state: commuterData.home_address.state,
            city: commuterData.work_address.city,
          },
          home_departure_time: commuterData.home_departure,
          work_departure_time: commuterData.work_departure,
        }));
        console.log("commuterData", commuterData.home_address);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else {
        setError("Failed to send login code");
      }
    }
  };

  const updateCommuter = async () => {
    try {
      const commuterSchema = z.object({
        name: z.string().min(1, "Name cannot be empty"),
        phone: z.string().min(1, "Phone number cannot be empty"),
        type: z.string().refine((val) => val !== "Select Commute Type", {
          message: "Please select a valid commute type",
        }),
        home_address: z.object({
          full_address: z.string().min(1, "Home address cannot be empty"),
          longitude: z.string(),
          latitude: z.string(),
          state: z.string(),
          city: z.string(),
        }),
        work_address: z.object({
          full_address: z.string().min(1, "Work address cannot be empty"),
          longitude: z.string(),
          latitude: z.string(),
          state: z.string(),
          city: z.string(),
        }),
      });

      commuterSchema.parse(commuter);
      setError(null); // Clear any previous errors
      setLoading(true);
      const response = await axios.put<{
        code: string;
        message: string;
      }>(`${API_URL}/api/commuter/update`, commuter, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setLoading(false);

      if (response.data.code !== "R00") {
        setError(response.data.message);
      } else {
        setMessage("Commuter profile updated successfully");
        localStorage.setItem("profile_complete", "true");
      }
    } catch (error) {
      setLoading(false);
      if (error instanceof z.ZodError) {
        setError(
          `Validation failed: ${
            error.errors[0].message
          } in ${error.errors[0].path.join(".")}`
        );
      } else {
        setError("Failed to update commuter profile");
      }
    }
  };

  useEffect(() => {
    getCommuter();
  }, []);

  useEffect(() => {
    console.log("commuter", commuter);
  }, [commuter]);

  return (
    <div className="container">
      <>
        {loading ? (
          <Spinner aria-label="Extra large spinner example" size="xl" />
        ) : (
          <APIProvider apiKey="AIzaSyAayXTCszaLYN33xN5cAavY8YCblcznDzE">
            <a className="header" href="/">
              Work Ride Club
            </a>
            <p>Update your profile</p>
            <form className="flex max-w-md flex-col gap-4">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="coummuterName" value="Your name" />
                </div>
                <TextInput
                  id="coummuterName"
                  type="text"
                  required
                  value={commuter.name}
                  maxLength={50}
                  onChange={(e) =>
                    setCommuter((prevState) => ({
                      ...prevState,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="phoneNumber" value="Whatsapp Phone Number" />
                </div>
                <TextInput
                  id="phoneNumber"
                  type="text"
                  required
                  value={commuter.phone}
                  maxLength={10}
                  onChange={(e) =>
                    setCommuter((prevState) => ({
                      ...prevState,
                      phone: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="homeAddress" value="Home Address" />
                </div>
                <div className="mb-2 block">
                  <Label value={commuter.home_address.full_address} />
                </div>
                <PlaceAutocomplete
                  onPlaceSelect={function (
                    place: google.maps.places.PlaceResult | null
                  ): void {
                    if (place && place.geometry) {
                      console.log(place);
                      const location = place.geometry.location;
                      if (location) {
                        setCommuter((prevState) => ({
                          ...prevState,
                          home_address: {
                            ...prevState.home_address,
                            full_address: place.formatted_address || "",
                            longitude: location.lng(),
                            latitude: location.lat(),
                            city:
                              place.address_components?.find((component) =>
                                component.types.includes("locality")
                              )?.long_name || "",
                            state:
                              place.address_components?.find((component) => {
                                component.types.includes(
                                  "administrative_area_level_1"
                                );
                              })?.long_name || "",
                          },
                        }));
                      }
                    }
                  }}
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="workAddress" value="Work Address" />
                </div>
                <div className="mb-2 block">
                  <Label value={commuter.work_address.full_address} />
                </div>
                <PlaceAutocomplete
                  onPlaceSelect={function (
                    place: google.maps.places.PlaceResult | null
                  ): void {
                    if (place && place.geometry) {
                      console.log(place);
                      const location = place.geometry.location;
                      if (location) {
                        setCommuter((prevState) => ({
                          ...prevState,
                          work_address: {
                            ...prevState.work_address,
                            full_address: place.formatted_address || "",
                            longitude: location.lng(),
                            latitude: location.lat(),
                            city:
                              place.address_components?.find((component) =>
                                component.types.includes("locality")
                              )?.long_name || "",
                            state:
                              place.address_components?.find((component) => {
                                component.types.includes(
                                  "administrative_area_level_1"
                                );
                              })?.long_name || "",
                          },
                        }));
                      }
                    }
                  }}
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label
                    htmlFor="homeDepartureTime"
                    value="Home Departure Time"
                  />
                </div>
                <Select
                  id="homeDepartureTime"
                  required
                  value={commuter.home_departure_time}
                  onChange={(e) =>
                    setCommuter((prevState) => ({
                      ...prevState,
                      home_departure_time: e.target.value,
                    }))
                  }
                >
                  <option>5:00 AM</option>
                  <option>5:30 AM</option>
                  <option>6:00 AM</option>
                  <option>6:30 AM</option>
                  <option>7:00 AM</option>
                  <option>7:30 AM</option>
                  <option>8:00 AM</option>
                  <option>8:30 AM</option>
                  <option>9:00 AM</option>
                  <option>9:30 AM</option>
                  <option>10:00 AM</option>
                </Select>
              </div>
              <div>
                <div className="mb-2 block">
                  <Label
                    htmlFor="officeDepartureTime"
                    value="Office Departure Time"
                  />
                </div>
                <Select
                  id="officeDepartureTime"
                  required
                  value={commuter.work_departure_time}
                  onChange={(e) =>
                    setCommuter((prevState) => ({
                      ...prevState,
                      work_departure_time: e.target.value,
                    }))
                  }
                >
                  <option>2:00 PM</option>
                  <option>2:30 PM</option>
                  <option>3:00 PM</option>
                  <option>3:30 PM</option>
                  <option>4:00 PM</option>
                  <option>4:30 PM</option>
                  <option>5:00 PM</option>
                  <option>5:30 PM</option>
                  <option>6:00 PM</option>
                  <option>6:30 PM</option>
                  <option>7:00 PM</option>
                </Select>
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="commuterType" value="Commute Type" />
                </div>
                <Select
                  id="commuterType"
                  required
                  value={commuter.type}
                  onChange={(e) =>
                    setCommuter((prevState) => ({
                      ...prevState,
                      type: e.target.value,
                    }))
                  }
                >
                  <option>Select Commute Type</option>
                  <option value="passenger">I am looking for a lift</option>
                  <option value="driver">I am looking for passengers</option>
                </Select>
              </div>

              {error && (
                <Alert color="failure" icon={HiInformationCircle}>
                  {error}
                </Alert>
              )}

              {message && <Alert color="info">{message}</Alert>}

              <Button onClick={updateCommuter}>Submit</Button>
            </form>
          </APIProvider>
        )}
      </>
    </div>
  );
};

export default Profile;
