
import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const TokenForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    amount: "",
    decimals: "18",
    ownerAddress: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          name: "",
          symbol: "",
          amount: "",
          decimals: "18",
          ownerAddress: "",
        });
      }, 3000);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="neo-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="Token Name"
            name="name"
            value={formData.name}
            placeholder="e.g. My Custom Token"
            onChange={handleChange}
            required
          />
          
          <FormField
            label="Token Symbol"
            name="symbol"
            value={formData.symbol}
            placeholder="e.g. MCT"
            onChange={handleChange}
            required
          />
          
          <FormField
            label="Total Supply"
            name="amount"
            type="number"
            value={formData.amount}
            placeholder="e.g. 1000000"
            onChange={handleChange}
            required
          />
          
          <FormField
            label="Decimals"
            name="decimals"
            type="number"
            min="0"
            max="18"
            value={formData.decimals}
            placeholder="18"
            onChange={handleChange}
            required
          />
          
          <FormField
            label="Owner Address"
            name="ownerAddress"
            value={formData.ownerAddress}
            placeholder="0x..."
            onChange={handleChange}
            required
          />
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting || isSuccess}
            className={`w-full relative btn-hover py-3 rounded-lg font-medium transition-all duration-300 ${
              isSuccess
                ? "bg-green-600 text-white"
                : "bg-primary text-white"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : isSuccess ? (
              <span className="flex items-center justify-center">
                <Check className="mr-2 h-4 w-4" /> Token Created!
              </span>
            ) : (
              "Create Token"
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
  min?: string;
  max?: string;
}

const FormField = ({ 
  label, 
  name, 
  value, 
  placeholder, 
  onChange, 
  required = false,
  type = "text",
  min,
  max
}: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        className="w-full bg-muted border border-border text-foreground rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200"
      />
    </div>
  );
};

export default TokenForm;
