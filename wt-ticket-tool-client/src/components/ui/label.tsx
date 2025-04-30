import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

export const Label: React.FC<LabelProps> = ({ children, className = "", ...props }) => {
  return (
    <label className={`font-medium text-gray-700 ${className}`} {...props}>
      {children}
    </label>
  );
};
