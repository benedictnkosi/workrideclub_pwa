"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Label, TextInput } from "flowbite-react";
import "./page.css";
import { z } from "zod";
import { Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { Spinner } from "flowbite-react";
import { useRouter } from "next/navigation";

const phoneNumberSchema = z
  .string()
  .min(10, "Phone number must be 10 characters")
  .max(10, "Phone number must be 10 characters");
const codeSchema = z.string().min(1, "Code cannot be empty");
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Login: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("0837917430");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      phoneNumberSchema.parse(phoneNumber);
      setError(null); // Clear any previous errors

      console.log("API_URL:", API_URL);
      setLoading(true);
      const response = await axios.post<{ code: string; message: string }>(
        `${API_URL}/api/whatsapp/login`,
        {
          phone: phoneNumber,
        }
      );

      setLoading(false);

      if (response.data.code !== "R00") {
        setError("Failed to send login code");
      } else {
        setCodeSent(true);
        setMessage("Please check your Whatsapp for the login code");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else {
        setError("Failed to send login code");
      }
    }
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
        localStorage.setItem("token", response.data.guid);
        localStorage.setItem(
          "profile_complete",
          response.data.profile_complete.toString()
        );
        router.push("/");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else {
        setError("Verification failed");
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/");
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="container">
      {error && (
        <Alert color="failure" icon={HiInformationCircle}>
          {error}
        </Alert>
      )}

      {message && <Alert color="info">{message}</Alert>}

      <>
        {loading ? (
          <Spinner aria-label="Extra large spinner example" size="xl" />
        ) : (
          <>
            <div
              id="request-code"
              className={`container ${codeSent ? "hidden" : ""}`}
            >
              <div>
                <Label htmlFor="phoneNumber" value="Whatsapp Phone Number" />
              </div>
              <TextInput
                id="phoneNumber"
                type="text"
                placeholder="+27837917435"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <Button onClick={handleLogin}>Login With Whatsapp</Button>
            </div>
            <div
              id="verify-code"
              className={`container ${codeSent ? "" : "hidden"}`}
            >
              <Label htmlFor="code" value="Whatsapp Code" />
              <TextInput
                id="code"
                type="text"
                placeholder="123456"
                required
                onChange={(e) => setCode(e.target.value)}
              />
              <Button onClick={() => handleVerifyCode()}>Verify Code</Button>
            </div>
          </>
        )}
      </>
    </div>
  );
};

export default Login;
