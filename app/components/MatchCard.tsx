import React from "react";
import "./MatchCard.css"; // Assuming you create a Card.css file for styling

import { IoIosAlarm } from "react-icons/io";
import { Button, Card, Modal } from "flowbite-react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaArrowDown } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineExclamationCircle } from "react-icons/hi";

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
  const [openModal, setOpenModal] = React.useState(false);

  let whatsappMessage = `Hi ${match.name}`;
  if (match.user_type === "passenger") {
    whatsappMessage = `Hi ${match.name}, How would you like to join my lift club?`;
  } else {
    whatsappMessage = `Hi ${match.name}, I'm interested in joining your lift club.`;
  }

  const handleWhatsAppClick = () => {
    setOpenModal(true);
  };

  const openWhatsapp = () => {
    setOpenModal(false);
    window.open(`https://wa.me/${phone}?text=${whatsappMessage}`, "_blank");
  };

  const openDirections = () => {
    window.open(match.map_link, "_blank");
  };

  return (
    <>
      <Modal
        show={openModal}
        size="md"
        onClose={() => setOpenModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Commuters on this platform are not vetted. Do not send money to
              anyone.
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={() => openWhatsapp()}>
                {"Yes, I'm sure"}
              </Button>
              <Button color="gray" onClick={() => setOpenModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
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
            <Button
              className="mt-5  w-full"
              color="light"
              onClick={handleWhatsAppClick}
            >
              <FaWhatsapp className="icon" color="green" />
              <span className="mt-2">Whatsapp</span>
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};
