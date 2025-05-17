import React from "react";

interface KubraLogoProps {
  size?: "small" | "medium" | "large";
}

export const KubraLogo: React.FC<KubraLogoProps> = ({ size = "medium" }) => {
  const getSizeClass = () => {
    switch (size) {
      case "small":
        return "text-lg";
      case "large":
        return "text-3xl";
      case "medium":
      default:
        return "text-2xl";
    }
  };

  const iconSize = size === "large" ? "h-10 w-10" : size === "small" ? "h-6 w-6" : "h-8 w-8";

  return (
    <div className="flex items-center">
      <span className={`text-primary ${iconSize}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={iconSize}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </span>
      <span className={`ml-2 font-bold ${getSizeClass()}`}>
        <span className="text-primary">KUBRA</span>
        <span className="font-light text-primary">market</span>
      </span>
    </div>
  );
};
