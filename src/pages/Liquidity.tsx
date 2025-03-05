
import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

const Liquidity = () => {
  useEffect(() => {
    // Redirect to Raydium's liquidity page
    window.location.href = "https://raydium.io/liquidity/";
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full neo-card text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-blue-500/10 p-4">
            <AlertCircle className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Redirecting...</h2>
        <p className="text-gray-400">
          You are being redirected to Raydium's liquidity page.
          If you are not redirected automatically, please click the link below.
        </p>
        <a 
          href="https://raydium.io/liquidity/" 
          className="mt-6 inline-block text-blue-400 hover:text-blue-300 transition-colors"
          target="_blank" 
          rel="noopener noreferrer"
        >
          Go to Raydium
        </a>
      </motion.div>
    </div>
  );
};

export default Liquidity;
