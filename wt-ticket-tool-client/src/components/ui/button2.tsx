import { cn } from "../../lib/utils"; 

export function Button2({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "outline";
}) {
  const baseStyles =
    "px-4 py-2 rounded-lg text-sm font-medium transition focus:outline-none";

  const variants = {
    primary: "text-black ",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], disabled && "opacity-50 cursor-not-allowed")}
    >
      {children}
    </button>
  );
}