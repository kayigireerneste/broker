interface InputFieldProps {
  name: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  type,
  value,
  onChange,
  error,
  disabled,
  placeholder,
  required
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-[#004B5B]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full rounded-full px-4 py-2 text-[#004B5B] bg-transparent outline-none border transition-all
          ${error 
            ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500' 
            : 'border-[#004B5B]/50 focus:border-[#004B5B] hover:border-[#004B5B]/80'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 ml-2">{error}</p>
      )}
    </div>
  );
};