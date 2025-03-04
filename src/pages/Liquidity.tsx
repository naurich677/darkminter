
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

const Liquidity = () => {
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
        
        <h2 className="text-2xl font-bold mb-4">Coming Soon...</h2>
        <p className="text-gray-400">
          Our liquidity features are currently under development.
          Check back soon for updates!
        </p>
      </motion.div>
    </div>
  );
};

export default Liquidity;
