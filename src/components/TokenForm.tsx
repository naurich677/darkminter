import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Link, Twitter, MessageCircle, MessageSquare, AlertCircle, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, Keypair, SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

const TokenForm = () => {
  const { toast } = useToast();
  const location = useLocation();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    amount: "",
    decimals: "18",
    ownerAddress: "",
    referralCode: "",
    websiteUrl: "",
    twitterUrl: "",
    telegramUrl: "",
    discordUrl: "",
    customReferralCode: "",
  });

  const [authorities, setAuthorities] = useState({
    revokeFreeze: true,
    revokeMint: true,
    revokeUpdate: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [createdTokenAddress, setCreatedTokenAddress] = useState<string | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const ref = queryParams.get('ref');
    if (ref) {
      setReferralCode(ref);
      setFormData(prev => ({ ...prev, referralCode: ref }));
      console.log("Referral code detected:", ref);
    }
  }, [location]);

  useEffect(() => {
    const storedAddress = localStorage.getItem('walletAddress');
    if (storedAddress) {
      setFormData(prev => ({ ...prev, ownerAddress: storedAddress }));
    }
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Token name is required";
    }
    
    if (!formData.symbol.trim()) {
      newErrors.symbol = "Token symbol is required";
    } else if (formData.symbol.length > 10) {
      newErrors.symbol = "Symbol must be 10 characters or less";
    }
    
    if (!formData.amount.trim()) {
      newErrors.amount = "Total supply is required";
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = "Total supply must be a positive number";
    }
    
    if (!formData.decimals.trim()) {
      newErrors.decimals = "Decimals is required";
    } else if (isNaN(Number(formData.decimals)) || Number(formData.decimals) < 0 || Number(formData.decimals) > 18) {
      newErrors.decimals = "Decimals must be between 0 and 18";
    }
    
    if (!formData.ownerAddress.trim()) {
      newErrors.ownerAddress = "Owner address is required";
    }
    
    if (formData.websiteUrl && !isValidUrl(formData.websiteUrl)) {
      newErrors.websiteUrl = "Please enter a valid URL";
    }
    
    if (formData.twitterUrl && !isValidUrl(formData.twitterUrl)) {
      newErrors.twitterUrl = "Please enter a valid URL";
    }
    
    if (formData.telegramUrl && !isValidUrl(formData.telegramUrl)) {
      newErrors.telegramUrl = "Please enter a valid URL";
    }
    
    if (formData.discordUrl && !isValidUrl(formData.discordUrl)) {
      newErrors.discordUrl = "Please enter a valid URL";
    }
    
    if (formData.customReferralCode && formData.customReferralCode.length < 3) {
      newErrors.customReferralCode = "Referral code must be at least 3 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'referralCode') {
      setReferralCode(value || null);
    }
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAuthorityToggle = (authority: keyof typeof authorities) => {
    setAuthorities((prev) => ({ ...prev, [authority]: !prev[authority] }));
  };

  const calculateTotalCost = () => {
    let cost = 0.2;
    if (authorities.revokeFreeze) cost += 0.05;
    if (authorities.revokeMint) cost += 0.05;
    if (authorities.revokeUpdate) cost += 0.05;
    return cost.toFixed(2);
  };

  const createSolanaToken = async (): Promise<string | null> => {
    if (!publicKey || !connection) {
      toast({
        title: "Wallet Connection Required",
        description: "Please connect your wallet to create a token.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const mintAccount = Keypair.generate();
      
      const mintDecimals = Number(formData.decimals);
      
      const mintRent = await connection.getMinimumBalanceForRentExemption(Token.getMintLen());
      
      const createTokenTransaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintAccount.publicKey,
          space: Token.getMintLen(),
          lamports: mintRent,
          programId: TOKEN_PROGRAM_ID,
        }),
        Token.createInitMintInstruction(
          TOKEN_PROGRAM_ID,
          mintAccount.publicKey,
          mintDecimals,
          publicKey,
          publicKey
        )
      );
      
      const totalSupply = Number(formData.amount) * Math.pow(10, mintDecimals);
      
      toast({
        title: "Creating Token",
        description: "Please approve the transaction in your wallet.",
        variant: "default",
      });

      const signature = await sendTransaction(createTokenTransaction, connection, {
        signers: [mintAccount]
      });
      
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast({
        title: "Token Created",
        description: `Your token has been created with address: ${mintAccount.publicKey.toString()}`,
        variant: "default",
      });
      
      return mintAccount.publicKey.toString();
    } catch (error) {
      console.error("Error creating token:", error);
      toast({
        title: "Token Creation Failed",
        description: "An error occurred while creating your token.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleReferralProcess = async (newTokenData: any) => {
    if (!formData.referralCode) return;
    
    try {
      const { data: referralData, error: referralError } = await supabase
        .from('referrals')
        .select('id, referrer_address')
        .eq('referral_code', formData.referralCode)
        .single();
      
      if (referralError || !referralData) {
        console.error("Error finding referral:", referralError);
        return;
      }
      
      const { error: usageError } = await supabase
        .from('referral_uses')
        .insert({
          referral_id: referralData.id,
          user_address: formData.ownerAddress,
          tokens_created: 1
        });
      
      if (usageError) {
        console.error("Error recording referral use:", usageError);
      } else {
        console.log("Referral recorded successfully");
      }
    } catch (error) {
      console.error("Error processing referral:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Form Error",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const tokenAddress = await createSolanaToken();
      
      if (!tokenAddress) {
        throw new Error("Failed to create token on Solana");
      }
      
      setCreatedTokenAddress(tokenAddress);
      
      const { data, error } = await supabase.from('tokens').insert({
        name: formData.name,
        symbol: formData.symbol,
        amount: formData.amount,
        decimals: formData.decimals,
        owner_address: formData.ownerAddress,
        token_address: tokenAddress,
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
      
      if (formData.customReferralCode && formData.customReferralCode.trim() !== "") {
        const { error: referralError } = await supabase.from('referrals').insert({
          referrer_address: formData.ownerAddress,
          referral_code: formData.customReferralCode.trim()
        });
        
        if (referralError) {
          console.error("Error creating referral code:", referralError);
          toast({
            title: "Referral Code Error",
            description: "This referral code is already taken. Please try another.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Referral Code Created",
            description: `Your referral code "${formData.customReferralCode}" has been created successfully.`,
            variant: "default",
          });
        }
      }
      
      await handleReferralProcess(data);

      setIsSuccess(true);
      
      toast({
        title: "Success!",
        description: `Your token "${formData.name}" (${formData.symbol}) has been created successfully on the Solana blockchain.`,
        variant: "default",
      });
      
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          name: "",
          symbol: "",
          amount: "",
          decimals: "18",
          ownerAddress: localStorage.getItem('walletAddress') || "",
          referralCode: "",
          websiteUrl: "",
          twitterUrl: "",
          telegramUrl: "",
          discordUrl: "",
          customReferralCode: "",
        });
        setAuthorities({
          revokeFreeze: true,
          revokeMint: true,
          revokeUpdate: true,
        });
        setCreatedTokenAddress(null);
      }, 5000);
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
        {referralCode && (
          <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center">
            <div className="mr-3 text-blue-400">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm text-blue-400">Referral code applied: {referralCode}</span>
            </div>
          </div>
        )}
        
        {createdTokenAddress && (
          <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-green-400">Token created successfully!</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(createdTokenAddress);
                  toast({
                    title: "Copied!",
                    description: "Token address copied to clipboard.",
                    variant: "default",
                  });
                }}
                className="text-xs bg-green-900/40 text-green-400 p-1 rounded"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <div className="text-xs text-green-400 break-all">
              {createdTokenAddress}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <h3 className="text-lg font-medium border-b border-gray-800 pb-2 mb-4">Token Information</h3>
            
            <FormField
              label="Token Name"
              name="name"
              value={formData.name}
              placeholder="e.g. My Custom Token"
              onChange={handleChange}
              error={errors.name}
              required
            />
            
            <FormField
              label="Token Symbol"
              name="symbol"
              value={formData.symbol}
              placeholder="e.g. MCT"
              onChange={handleChange}
              error={errors.symbol}
              required
            />
            
            <FormField
              label="Total Supply"
              name="amount"
              type="number"
              value={formData.amount}
              placeholder="e.g. 1000000"
              onChange={handleChange}
              error={errors.amount}
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
              error={errors.decimals}
              required
            />
            
            <FormField
              label="Owner Address"
              name="ownerAddress"
              value={formData.ownerAddress}
              placeholder="0x..."
              onChange={handleChange}
              error={errors.ownerAddress}
              required
            />
            
            <FormField
              label="Enter Referral Code"
              name="referralCode"
              value={formData.referralCode}
              placeholder="e.g. FRIEND_CODE"
              onChange={handleChange}
              error={errors.referralCode}
              icon={<Code className="h-4 w-4 text-gray-400" />}
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
              error={errors.websiteUrl}
              icon={<Link className="h-4 w-4 text-gray-400" />}
            />
            
            <FormField
              label="Twitter/X URL"
              name="twitterUrl"
              value={formData.twitterUrl}
              placeholder="https://twitter.com/yourusername"
              onChange={handleChange}
              error={errors.twitterUrl}
              icon={<Twitter className="h-4 w-4 text-gray-400" />}
            />
            
            <FormField
              label="Telegram URL"
              name="telegramUrl"
              value={formData.telegramUrl}
              placeholder="https://t.me/yourchannel"
              onChange={handleChange}
              error={errors.telegramUrl}
              icon={<MessageCircle className="h-4 w-4 text-gray-400" />}
            />
            
            <FormField
              label="Discord URL"
              name="discordUrl"
              value={formData.discordUrl}
              placeholder="https://discord.gg/yourinvite"
              onChange={handleChange}
              error={errors.discordUrl}
              icon={<MessageSquare className="h-4 w-4 text-gray-400" />}
            />
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-medium border-b border-gray-800 pb-2 mb-4">Your Referral Code</h3>
            
            <FormField
              label="Create Your Referral Code"
              name="customReferralCode"
              value={formData.customReferralCode}
              placeholder="e.g. MY_UNIQUE_CODE"
              onChange={handleChange}
              error={errors.customReferralCode}
              icon={<Code className="h-4 w-4 text-gray-400" />}
            />
            <p className="text-xs text-gray-400 mt-2">
              Create a unique referral code to earn rewards when others use it.
            </p>
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
            disabled={isSubmitting || isSuccess || !publicKey}
            className={`w-full relative btn-hover py-3 rounded-lg font-medium transition-all duration-300 ${
              isSuccess
                ? "bg-green-600 text-white"
                : !publicKey
                ? "bg-gray-600 text-white cursor-not-allowed"
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
            ) : !publicKey ? (
              "Connect Wallet to Create Token"
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
  error?: string;
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
  icon,
  error
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
          className={`w-full bg-muted border ${error ? 'border-red-500' : 'border-border'} text-foreground rounded-lg ${icon ? 'pl-10' : 'px-4'} py-3 focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200`}
        />
        {error && (
          <div className="flex items-center mt-1 text-red-500 text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            {error}
          </div>
        )}
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
