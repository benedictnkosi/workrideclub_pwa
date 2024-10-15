"use client";

import React, { useEffect, useState } from "react";
import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import "./page.css";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { HiInformationCircle } from "react-icons/hi";
import axios from "axios";
import Head from "next/head";

const phoneNumberSchema = z
  .string()
  .min(10, "Phone number must be 10 characters")
  .max(10, "Phone number must be 10 characters");
const codeSchema = z.string().min(1, "Code cannot be empty");
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds

  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      setMessage(null); // Clear any previous messages
      codeSchema.parse(code);
      const response = await axios.post<{
        message: string;
        code: string;
        guid: string;
        profile_complete: boolean;
      }>(`${API_URL}/api/whatsapp/validate`, {
        phone: phoneNumber,
        verification_code: code,
      });

      if (response.data.code !== "R00") {
        setLoading(false);
        setError(response.data.message as string);
      } else {
        localStorage.setItem("user_guid", response.data.guid);
        localStorage.setItem(
          "profile_complete",
          response.data.profile_complete.toString()
        );
        router.push("/");
      }
    } catch (error) {
      setLoading(false);
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else {
        setError("Verification failed");
      }
    }
  };

  const sendCode = async () => {
    try {
      setError(null);
      phoneNumberSchema.parse(phoneNumber);

      setLoading(true);
      const response = await axios.get<{ code: string; message: string }>(
        `${API_URL}/api/whatsapp/sendcode/${phoneNumber}`
      );

      setLoading(false);
      if (response.data.code !== "R00") {
        setError(response.data.message as string);
      } else {
        setCodeSent(true);
        setCountdown(300); // Reset countdown to 5 minutes
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(`Validation failed: ${error.errors[0].message}`);
      } else {
        setError("Failed to send code");
      }
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="container">
      <Head>
        <title>Login</title>
        <meta name="description" content="Find a lift club to work or school" />
        <meta
          name="keywords"
          content="lift club, carpool, work, school, commute, rideshare, login, whatsapp"
        />
        <meta
          name="keywords"
          content="lift club, carpool, work, school, commute, rideshare, login, whatsapp"
        />
      </Head>
      {loading ? (
        <Spinner aria-label="Extra large spinner example" size="xl" />
      ) : (
        <>
          <div className="logo-container">
            <img
              src="/images/carpool.png"
              alt="logo"
              className="mt-5 logo-image"
            />
          </div>
          <div className="content-container">
            <form className="w-full flex flex-col items-center">
              <img
                src="/images/logo.png"
                alt="logo"
                className="mt-5 login-image"
              />
              <img
                src="/images/verify.png"
                alt="logo"
                className="mt-5 login-image"
              />
              <p className="text-center title-24 mt-5">Login with whatsapp</p>
              {!codeSent && (
                <div className="mt-5 w-full">
                  <div className="mb-2 block">
                    <Label htmlFor="phoneNumber" value="Whatsapp Number" />
                  </div>
                  <TextInput
                    id="phoneNumber"
                    type="text"
                    required
                    value={phoneNumber}
                    maxLength={10}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              )}
              {codeSent && (
                <div className="mt-5 w-full">
                  <p className="text-center pink-text">{phoneNumber}</p>
                  <TextInput
                    id="code"
                    type="number"
                    required
                    onChange={(e) => setCode(e.target.value)}
                    className="mt-5"
                  />
                </div>
              )}
              {error && (
                <Alert
                  className="mt-5 w-full"
                  color="failure"
                  icon={HiInformationCircle}
                >
                  {error}
                </Alert>
              )}

              {message && <Alert color="info">{message}</Alert>}
              {!codeSent && (
                <div className="mt-5 w-full">
                  <Button
                    className="mt-5 w-full"
                    onClick={() => sendCode()}
                    gradientDuoTone="pinkToOrange"
                  >
                    Send Code
                  </Button>
                </div>
              )}
              {codeSent && (
                <>
                  <p className="text-center mt-5">{formatTime(countdown)}</p>
                  <p className="mt-2 text-center">
                    Didn’t receive the code?
                    <a href="/login" className="pink-text">
                      {" "}
                      Resend
                    </a>
                  </p>

                  <div className="mt-5 w-full">
                    <Button
                      className="mt-5 w-full"
                      onClick={() => handleVerifyCode()}
                      gradientDuoTone="pinkToOrange"
                    >
                      Verify Code
                    </Button>
                  </div>
                </>
              )}
              <a href="/register" className="mt-5 block text-center">
                Register Now
              </a>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
export default Login;
