import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Share2, Copy, Check, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const Profile = () => {
  const { toast } = useToast();
  const { publicKey, connected, wallet } = useWallet();
  const { connection } = useConnection();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<any[]>([]);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState({
    registrations: 0,
    tokensCreated: 0
  });
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    const checkWallet = async () => {
      if (publicKey) {
        const address = publicKey.toString();
        setWalletAddress(address);
        
        fetchWalletBalance();
        
        loadUserTokens(address);
        
        loadReferralData(address);
      }
    };
    
    checkWallet();
  }, [publicKey, connection]);

  const fetchWalletBalance = async () => {
    if (!publicKey || !connection) return;
    
    setIsLoadingBalance(true);
    try {
      const balance = await connection.getBalance(publicKey);
      setSolBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setSolBalance(0);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const loadUserTokens = async (address: string) => {
    setIsLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .eq('owner_address', address);
        
      if (error) throw error;
      
      setTokens(data || []);
    } catch (error) {
      console.error("Error loading tokens:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadReferralData = async (address: string) => {
    try {
      const { data: referralData, error: referralError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_address', address)
        .single();
        
      if (referralError && referralError.code !== 'PGRST116') {
        console.error("Error loading referral data:", referralError);
      }
      
      if (referralData) {
        setReferralCode(referralData.referral_code);
        
        const { data: statsData, error: statsError } = await supabase
          .from('referral_uses')
          .select('*')
          .eq('referral_id', referralData.id);
          
        if (statsError) {
          console.error("Error loading referral statistics:", statsError);
        } else if (statsData) {
          setReferralStats({
            registrations: statsData.length,
            tokensCreated: statsData.reduce((total, current) => total + (current.tokens_created || 0), 0)
          });
        }
      }
    } catch (error) {
      console.error("Error in referral data processing:", error);
    }
  };

  const generateReferralCode = async () => {
    if (!walletAddress) return;
    
    setIsGeneratingCode(true);
    try {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const { error } = await supabase
        .from('referrals')
        .insert({
          referrer_address: walletAddress,
          referral_code: code
        });
        
      if (error) throw error;
      
      setReferralCode(code);
      toast({
        title: "Success!",
        description: "Your referral code has been generated.",
      });
    } catch (error) {
      console.error("Error generating referral code:", error);
      toast({
        title: "Error",
        description: "Failed to generate referral code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const copyReferralLink = () => {
    if (!referralCode) return;
    
    const link = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard.",
    });
    
    setTimeout(() => setIsCopied(false), 2000);
  };

  const connectWallet = () => {
    toast({
      title: "Wallet Connection",
      description: "Please use the wallet button in the navigation bar to connect.",
    });
  };

  if (!connected || !publicKey) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full neo-card text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8">
            Please connect your wallet to view your profile and token information.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={connectWallet}
            className="btn-hover w-full bg-primary text-white py-3 rounded-lg font-medium"
          >
            Connect Wallet
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Profile</h1>
          <p className="text-lg text-gray-400">
            Manage your tokens and account settings
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="neo-card mb-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Wallet Address</h2>
              <div className="flex items-center">
                <span className="text-sm text-gray-400 truncate max-w-xs">{publicKey?.toString()}</span>
                <button 
                  className="ml-2 text-gray-400 hover:text-white transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(publicKey?.toString() || '');
                    toast({ title: "Copied!", description: "Address copied to clipboard." });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center">
                <span className="text-sm text-gray-400">Wallet type: </span>
                <span className="text-sm text-white ml-1">{wallet?.adapter.name || 'Unknown'}</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">Balance</h2>
              {isLoadingBalance ? (
                <div className="flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-gray-400">Loading...</span>
                </div>
              ) : (
                <span className="text-lg text-white">{solBalance?.toFixed(5)} SOL</span>
              )}
              <div className="mt-2">
                <button
                  onClick={fetchWalletBalance}
                  className="text-xs bg-secondary/50 text-gray-300 rounded-full px-2 py-1 flex items-center"
                  disabled={isLoadingBalance}
                >
                  <RefreshCcw className="h-3 w-3 mr-1" /> Refresh
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="neo-card h-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Your Tokens</h2>
                <div className="flex items-center">
                  <button 
                    onClick={() => walletAddress && loadUserTokens(walletAddress)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </button>
                  <span className="ml-3 text-sm text-gray-400">{tokens.length} tokens</span>
                </div>
              </div>

              {isLoadingData ? (
                <div className="flex justify-center py-12">
                  <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : tokens.length > 0 ? (
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {tokens.map((token) => (
                    <motion.div
                      key={token.id}
                      variants={item}
                      className="hover-scale glass rounded-xl p-4 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-medium text-white">{token.name}</h3>
                        <div className="flex items-center mt-1">
                          <span className="text-xs bg-secondary text-gray-300 rounded-full px-2 py-0.5">
                            {token.symbol}
                          </span>
                          <span className="mx-2 text-gray-500">•</span>
                          <span className="text-xs text-gray-400">
                            {new Date(token.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs bg-green-400/10 text-green-400 rounded-full px-3 py-1 font-medium">
                          Active
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No tokens created yet
                </div>
              )}
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="neo-card mb-6"
            >
              <h2 className="text-xl font-semibold mb-4">Refer a Friend</h2>
              <p className="text-gray-400 text-sm mb-6">
                For each friend you invite who creates a token, you'll receive 0.1 SOL.
              </p>
              
              {referralCode ? (
                <div className="space-y-4">
                  <div className="p-3 bg-secondary/30 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-mono">{referralCode}</span>
                    <button 
                      onClick={copyReferralLink}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Registrations:</span>
                      <span className="text-sm font-medium">{referralStats.registrations}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Tokens created:</span>
                      <span className="text-sm font-medium">{referralStats.tokensCreated}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                      <span className="text-sm text-gray-400">Earnings:</span>
                      <span className="text-sm font-medium text-green-400">
                        {(referralStats.tokensCreated * 0.1).toFixed(1)} SOL
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateReferralCode}
                  disabled={isGeneratingCode}
                  className="btn-hover w-full bg-primary text-white py-3 rounded-lg font-medium flex items-center justify-center"
                >
                  {isGeneratingCode ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Share2 className="mr-2 h-4 w-4" /> Generate Referral Link
                    </>
                  )}
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
