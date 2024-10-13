"use client";

import React from "react";
import { Button } from "flowbite-react";
import "./page.css";
import { FaWhatsapp } from "react-icons/fa";
import { useRouter } from "next/navigation";

const Splash: React.FC = () => {
  const router = useRouter();

  const navigateToLogin = () => {
    router.push("/login");
  };

  const navigateToRegister = () => {
    router.push("/register");
  };

  return (
    <div className="container">
      <div className="splash">
        <img src="/images/logo.png" alt="logo" className="mt-5 login-image" />
        <p>Work Ride Club is a platform that connects drivers and passengers</p>
        <Button
          color="light"
          pill
          onClick={() => navigateToLogin()}
          className="login-button"
        >
          <FaWhatsapp className="mr-2 small-icon" color="green" />
          Login with Whatsapp
        </Button>
        <Button
          color="light"
          pill
          onClick={() => navigateToRegister()}
          className="login-button"
        >
          <FaWhatsapp className="mr-2 small-icon" color="green" />
          Register with Whatsapp
        </Button>
      </div>
    </div>
  );
};
export default Splash;
