"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Label, Select, TextInput } from "flowbite-react";
import "./page.css";
import { z } from "zod";
import { Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { Spinner } from "flowbite-react";
import { useRouter } from "next/navigation";
import ProgressBar from "../components/ProgressBar/ProgressBar";
import { PlaceAutocomplete } from "../profile/PlaceAutoComplete";
import { APIProvider } from "@vis.gl/react-google-maps";
import Image from "next/image";
import ReCAPTCHA from "react-google-recaptcha";

interface CommuterProps {
  commuter: typeof commuterInterface;
  setCommuter: React.Dispatch<React.SetStateAction<typeof commuterInterface>>;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>; // This is the new line
  setError: (message: string | null) => void;
  setCodeSent: React.Dispatch<React.SetStateAction<boolean>>;
  setCountdown: React.Dispatch<React.SetStateAction<number>>;
}

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
  status: "active",
};

const phoneNumberSchema = z
  .string()
  .min(10, "Phone number must be 10 characters")
  .max(10, "Phone number must be 10 characters");
const codeSchema = z.string().min(1, "Code cannot be empty");
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [commuter, setCommuter] = useState(commuterInterface);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    console.log("error", error);
  }, [error]);

  return (
    <>
      <div className="container">
        <div className="logo-container ">
          <img
            src="/images/carpool.png"
            alt="logo"
            className="mt-5 logo-image"
          />
        </div>
        <div className="content-container">
          <div className="w-full">
            <img
              src="/images/logo.png"
              alt="logo"
              className="mt-5 login-image"
            />
            {error && (
              <Alert color="failure" icon={HiInformationCircle}>
                {error}
              </Alert>
            )}

            <ProgressBar activeStep={activeStep} />
            {activeStep === 0 && (
              <CommuteForm
                commuter={commuter}
                setCommuter={setCommuter}
                setActiveStep={setActiveStep}
                setError={setError}
                setCodeSent={setCodeSent}
                setCountdown={setCountdown}
              />
            )}
            {activeStep === 1 && (
              <PersonalForm
                commuter={commuter}
                setCommuter={setCommuter}
                setActiveStep={setActiveStep}
                setError={setError}
                setCodeSent={setCodeSent}
                setCountdown={setCountdown}
              />
            )}
            {activeStep === 2 && (
              <VerificationForm
                phoneNumber={commuter.phone}
                codeSent={codeSent}
                countdown={countdown}
                setCountdown={setCountdown}
              />
            )}
            <a href="/login" className="mt-5 block text-center">
              Go to login
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

const CommuteForm: React.FC<CommuterProps> = (props) => {
  const { commuter, setCommuter, setActiveStep, setError } = props;
  const handleNext = () => {
    try {
      setError(null);
      const commuterSchema = z.object({
        type: z.string().refine((val) => val !== "Select Commute Type", {
          message: "Please select a valid commute type",
        }),
        home_address: z.object({
          full_address: z.string().min(1, "Home address cannot be empty"),
          longitude: z.number(),
          latitude: z.number(),
          state: z.string(),
          city: z.string(),
        }),
        work_address: z.object({
          full_address: z.string().min(1, "Work address cannot be empty"),
          longitude: z.number(),
          latitude: z.number(),
          state: z.string(),
          city: z.string(),
        }),
      });

      commuterSchema.parse(commuter);
      setActiveStep(1);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(`Validation failed: ${error.errors[0].message}`);
      } else {
        setError("Failed to update commuter profile");
      }
    }
  };

  return (
    <APIProvider apiKey="AIzaSyAayXTCszaLYN33xN5cAavY8YCblcznDzE">
      <form>
        <div className="mt-5">
          <div className="mb-2 block">
            <Label htmlFor="homeAddress" value="Home Address" />
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
        <div className="mt-5">
          <div className="mb-2 block">
            <Label htmlFor="workAddress" value="Work Address" />
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
        <div className="mt-5">
          <div className="mb-2 block">
            <Label htmlFor="homeDepartureTime" value="Home Departure Time" />
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
        <div className="mt-5">
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
        <div className="mt-5">
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

        <div className="mt-5">
          <Button
            onClick={handleNext}
            className="w-full mt-5"
            gradientDuoTone="pinkToOrange"
          >
            Next
          </Button>
        </div>
      </form>
    </APIProvider>
  );
};

const PersonalForm: React.FC<CommuterProps> = (props) => {
  const {
    commuter,
    setCommuter,
    setActiveStep,
    setError,
    setCodeSent,
    setCountdown,
  } = props;
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const sendCode = async () => {
    try {
      setError(null);
      const commuterSchema = z.object({
        name: z.string().min(1, "Name cannot be empty"),
        phone: z
          .string()
          .min(1, "Phone number cannot be empty")
          .max(10, "Phone number must be 10 characters"),
      });

      commuterSchema.parse(commuter);

      if (!recaptchaToken) {
        setError("Please complete the reCAPTCHA");
        setLoading(false);
        return;
      }

      setLoading(true);
      const response = await axios.post<{ code: string; message: string }>(
        `${API_URL}/api/whatsapp/register`,
        commuter
      );
      setLoading(false);

      if (response.data.code !== "R00") {
        setError(response.data.message as string);
      } else {
        setCodeSent(true);
        setCountdown(300); // Reset countdown to 5 minutes
        setActiveStep(2);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(`Validation failed: ${error.errors[0].message}`);
      } else {
        setError("Failed to update commuter profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const onRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  return (
    <div>
      <form>
        <div className="mt-5">
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
        <div className="mt-5">
          <div className="mb-2 block">
            <Label htmlFor="phoneNumber" value="Whatsapp Number" />
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

          <ReCAPTCHA
            sitekey="6LdQ0WAqAAAAADOyMHmSs-31fw0KJlQKGR7rawEb"
            onChange={onRecaptchaChange}
          />

          <div className="mb-2 block">
            <Button
              onClick={sendCode}
              gradientDuoTone="pinkToOrange"
              className="w-full mt-5"
            >
              {loading ? (
                <Spinner aria-label="Extra large spinner example" size="xl" />
              ) : (
                <span>Next</span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

interface VerificationFormProps {
  phoneNumber: string;
  codeSent: boolean;
  countdown: number;
  setCountdown: React.Dispatch<React.SetStateAction<number>>;
}

const VerificationForm: React.FC<VerificationFormProps> = ({
  phoneNumber,
  codeSent,
  countdown,
  setCountdown,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (codeSent && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [codeSent, countdown]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      setMessage(null); // Clear any previous messages
      codeSchema.parse(code);
      phoneNumberSchema.parse(phoneNumber);
      const response = await axios.post<{
        message: string;
        code: string;
        guid: string;
        profile_complete: boolean;
      }>(`${API_URL}/api/whatsapp/validate`, {
        phone: phoneNumber,
        verification_code: code,
      });

      setLoading(false);

      if (response.data.code !== "R00") {
        setError(response.data.message as string);
      } else {
        localStorage.setItem("user_guid", response.data.guid);
        localStorage.setItem(
          "profile_complete",
          response.data.profile_complete.toString()
        );
        setShowSuccess(true);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else {
        setError("Verification failed");
      }
    }
  };

  const navigateToMatches = () => {
    router.push("/");
  };

  return (
    <div>
      {error && (
        <Alert color="failure" icon={HiInformationCircle}>
          {error}
        </Alert>
      )}

      {message && <Alert color="info">{message}</Alert>}
      {loading ? (
        <Spinner aria-label="Extra large spinner example" size="xl" />
      ) : (
        <>
          {showSuccess ? (
            <div className="mt-5 flex flex-col items-center gap-5">
              <img
                src="/images/undraw_confirmation_re_b6q5.svg"
                alt="logo"
                className="mb-5"
              />
              <Alert
                color="success"
                onDismiss={() => alert("Alert dismissed!")}
              >
                Registration Successful
              </Alert>

              <Button
                color="light"
                pill
                onClick={() => navigateToMatches()}
                className="login-button"
              >
                Go to the home page
              </Button>
            </div>
          ) : (
            <form className="flex flex-col items-center">
              <Image
                src="/images/verify.png"
                alt="logo"
                width={200}
                height={200}
              />
              <Label htmlFor="code" value="Whatsapp Code" className="mt-5" />
              <TextInput
                id="code"
                type="number"
                placeholder="123456"
                required
                onChange={(e) => setCode(e.target.value)}
                className="mt-5"
              />
              <p className="text-center mt-5">{formatTime(countdown)}</p>
              <p className="mt-2 text-center">
                Didn’t receive the code?
                <a href="/login" className="pink-text">
                  {" "}
                  Resend
                </a>
              </p>
              <Button
                gradientDuoTone="pinkToOrange"
                className="mt-5"
                onClick={() => handleVerifyCode()}
              >
                Verify Code
              </Button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default Login;
