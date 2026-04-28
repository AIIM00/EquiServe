import React from "react";

const Btn = ({ type, onClick, children, className, variant = "primary" }) => {
  const base =
    "flex items-center justify-center rounded-full px-4 py-2 transition-all duration-200";
  const variants = {
    primary: "bg-gradient-to-r from-indigo-500 to-indigo-900",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    outline: `border border-gray-700 text-indigo-700 hover:bg-gray-100`,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Btn;
