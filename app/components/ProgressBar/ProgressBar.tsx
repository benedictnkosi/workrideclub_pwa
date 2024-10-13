import React from "react";
import "./ProgressBar.css";

interface Step {
  label: string;
  isActive: boolean;
}

interface ProgressBarProps {
  activeStep: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ activeStep }) => {
  const steps: Step[] = [
    { label: "Commute", isActive: activeStep === 0 },
    { label: "Personal", isActive: activeStep === 1 },
    { label: "Whatsapp", isActive: activeStep === 2 },
  ];

  return (
    <div className="progress-bar">
      <div className="steps">
        {steps.map((step, index) => (
          <div key={index} className={`step ${step.isActive ? "active" : ""}`}>
            {index + 1}. {step.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
