import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
