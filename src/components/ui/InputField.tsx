import { useState, type ChangeEvent, type FC } from "react";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";

interface InputFieldProps {
  name: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  showVisibilityToggle?: boolean;
  autoComplete?: string;
}

export const InputField: FC<InputFieldProps> = ({
  name,
  label,
  type,
  value,
  onChange,
  error,
  disabled,
  placeholder,
  required,
  showVisibilityToggle = false,
  autoComplete = "off",
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = showVisibilityToggle && type === "password";
  const inputType = isPasswordField && isPasswordVisible ? "text" : type;

  const borderClasses = error
    ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
    : "border-[#004B5B]/50 focus:border-[#004B5B] hover:border-[#004B5B]/80";

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  const inputClasses = [
    "w-full rounded-full px-4 py-2 text-[#004B5B] bg-transparent outline-none border transition-all",
    borderClasses,
    disabledClasses,
    isPasswordField ? "pr-12" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-[#004B5B]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={inputType}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={inputClasses}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-[#004B5B] hover:text-[#003641] focus:outline-none"
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          >
            {isPasswordVisible ? (
              <IoIosEyeOff className="w-5 h-5" aria-hidden="true" />
            ) : (
              <IoIosEye className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500 ml-2">{error}</p>
      )}
    </div>
  );
};