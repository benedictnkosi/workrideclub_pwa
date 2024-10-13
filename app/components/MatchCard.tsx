import React from "react";
import "./MatchCard.css"; // Assuming you create a Card.css file for styling

import { IoIosAlarm } from "react-icons/io";
import { Button, Card } from "flowbite-react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaArrowDown } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";

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

interface MatchCardProps {
  match: MatchInterface;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const homeAddress = match.home_address.replace(/,\s*[^,]*$/, "");
  const homeAddressWithoutStreetNumber = homeAddress.replace(/^\d+\s/, "");
  const workAddress = match.work_address.replace(/,\s*[^,]*$/, "");
  const phone = match.phone.replace(/^\d/, "+27");
  let whatsappMessage = `Hi ${match.name}`;
  if (match.user_type === "passenger") {
    whatsappMessage = `Hi ${match.name}, How would you like to join my lift club?`;
  } else {
    whatsappMessage = `Hi ${match.name}, I'm interested in joining your lift club.`;
  }

  const openWhatsapp = () => {
    window.open(`https://wa.me/${phone}?text=${whatsappMessage}`, "_blank");
  };

  const openDirections = () => {
    window.open(match.map_link, "_blank");
  };

  return (
    <Card className="max-w-sm">
      <div className="card-row">
        <div className="text-container">
          <h3 className="commuter-name">{match.name}</h3>
          <p>+{match.extra_travelTime} minutes</p>
        </div>
      </div>
      <div className="card-row">
        <div className="text-container">
          <p>{homeAddressWithoutStreetNumber}</p>
        </div>
        <div className="time">
          <IoIosAlarm className="small-icon mr-5" />
          <p>{match.home_departure_time}</p>
        </div>
      </div>
      <div className="card-row">
        <FaArrowDown className="icon" />
        <div className="text-container">
          <p>{workAddress}</p>
        </div>
        <div className="time">
          <IoIosAlarm className="small-icon mr-5" />
          <p>{match.work_departure_time}</p>
        </div>
      </div>

      <div className="card-row">
        <div className="flex gap-4">
          <Button
            className="mt-5 w-full"
            color="light"
            onClick={openDirections}
          >
            <FaMapMarkerAlt className="icon" color="green" />
            <span className="mt-2">Directions</span>
          </Button>
          <Button className="mt-5  w-full" color="light" onClick={openWhatsapp}>
            <FaWhatsapp className="icon" color="green" />
            <span className="mt-2">Whatsapp</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
