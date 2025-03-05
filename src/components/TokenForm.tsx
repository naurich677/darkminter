
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Link, Twitter, MessageCircle, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TokenForm = () => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    amount: "",
    decimals: "18",
    ownerAddress: "",
    websiteUrl: "",
    twitterUrl: "",
    telegramUrl: "",
    discordUrl: "",
  });

  const [authorities, setAuthorities] = useState({
    revokeFreeze: true,
    revokeMint: true,
    revokeUpdate: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthorityToggle = (authority: keyof typeof authorities) => {
    setAuthorities((prev) => ({ ...prev, [authority]: !prev[authority] }));
  };

  const calculateTotalCost = () => {
    let cost = 0.2; // Base cost for creating a token
    if (authorities.revokeFreeze) cost += 0.05;
    if (authorities.revokeMint) cost += 0.05;
    if (authorities.revokeUpdate) cost += 0.05;
    return cost.toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Save token data to Supabase
      const { error } = await supabase.from('tokens').insert({
        name: formData.name,
        symbol: formData.symbol,
        amount: formData.amount,
        decimals: formData.decimals,
        owner_address: formData.ownerAddress,
        website_url: formData.websiteUrl,
        twitter_url: formData.twitterUrl,
        telegram_url: formData.telegramUrl,
        discord_url: formData.discordUrl,
        revoke_freeze: authorities.revokeFreeze,
        revoke_mint: authorities.revokeMint,
        revoke_update: authorities.revokeUpdate,
        total_cost: parseFloat(calculateTotalCost())
      });

      if (error) throw error;

      setIsSuccess(true);
      
      toast({
        title: "Success!",
        description: "Your token has been created successfully.",
        variant: "default",
      });
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          name: "",
          symbol: "",
          amount: "",
          decimals: "18",
          ownerAddress: "",
          websiteUrl: "",
          twitterUrl: "",
          telegramUrl: "",
          discordUrl: "",
        });
        setAuthorities({
          revokeFreeze: true,
          revokeMint: true,
          revokeUpdate: true,
        });
      }, 3000);
    } catch (error) {
      console.error("Error creating token:", error);
      toast({
        title: "Error",
        description: "Failed to create token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="space-y-6">
            <h3 className="text-lg font-medium border-b border-gray-800 pb-2 mb-4">Token Information</h3>
            
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
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-medium border-b border-gray-800 pb-2 mb-4">Social Media</h3>
            
            <FormField
              label="Website URL"
              name="websiteUrl"
              value={formData.websiteUrl}
              placeholder="https://yourwebsite.com"
              onChange={handleChange}
              icon={<Link className="h-4 w-4 text-gray-400" />}
            />
            
            <FormField
              label="Twitter/X URL"
              name="twitterUrl"
              value={formData.twitterUrl}
              placeholder="https://twitter.com/yourusername"
              onChange={handleChange}
              icon={<Twitter className="h-4 w-4 text-gray-400" />}
            />
            
            <FormField
              label="Telegram URL"
              name="telegramUrl"
              value={formData.telegramUrl}
              placeholder="https://t.me/yourchannel"
              onChange={handleChange}
              icon={<MessageCircle className="h-4 w-4 text-gray-400" />}
            />
            
            <FormField
              label="Discord URL"
              name="discordUrl"
              value={formData.discordUrl}
              placeholder="https://discord.gg/yourinvite"
              onChange={handleChange}
              icon={<MessageSquare className="h-4 w-4 text-gray-400" />}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b border-gray-800 pb-2 mb-4">Token Authorities</h3>
            
            <AuthorityOption
              label="Revoke Freeze (+0.05 SOL)"
              checked={authorities.revokeFreeze}
              onChange={() => handleAuthorityToggle('revokeFreeze')}
            />
            
            <AuthorityOption
              label="Revoke Mint (+0.05 SOL)"
              checked={authorities.revokeMint}
              onChange={() => handleAuthorityToggle('revokeMint')}
            />
            
            <AuthorityOption
              label="Revoke Update (+0.05 SOL)"
              checked={authorities.revokeUpdate}
              onChange={() => handleAuthorityToggle('revokeUpdate')}
            />
            
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Base cost:</span>
                <span className="text-sm font-medium text-gray-300">0.2 SOL</span>
              </div>
              {authorities.revokeFreeze && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-300">Revoke Freeze:</span>
                  <span className="text-sm font-medium text-gray-300">0.05 SOL</span>
                </div>
              )}
              {authorities.revokeMint && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-300">Revoke Mint:</span>
                  <span className="text-sm font-medium text-gray-300">0.05 SOL</span>
                </div>
              )}
              {authorities.revokeUpdate && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-300">Revoke Update:</span>
                  <span className="text-sm font-medium text-gray-300">0.05 SOL</span>
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-blue-800/30 flex justify-between items-center">
                <span className="text-sm font-medium text-blue-400">Total cost:</span>
                <span className="text-sm font-bold text-blue-400">{calculateTotalCost()} SOL</span>
              </div>
            </div>
          </div>
          
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
  icon?: React.ReactNode;
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
  max,
  icon
}: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
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
          className={`w-full bg-muted border border-border text-foreground rounded-lg ${icon ? 'pl-10' : 'px-4'} py-3 focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200`}
        />
      </div>
    </div>
  );
};

interface AuthorityOptionProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

const AuthorityOption = ({ label, checked, onChange }: AuthorityOptionProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-lg">
      <label htmlFor={label} className="text-sm font-medium cursor-pointer">
        {label}
      </label>
      <div className="relative inline-block w-10 mr-2 align-middle select-none transition-all duration-200">
        <input
          type="checkbox"
          name={label}
          id={label}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div 
          onClick={onChange}
          className="block w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer bg-gray-600 peer-checked:bg-primary"
        ></div>
        <div 
          onClick={onChange}
          className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4 cursor-pointer"
        ></div>
      </div>
    </div>
  );
};

export default TokenForm;
