
import { motion } from "framer-motion";
import TokenForm from "../components/TokenForm";
import { Toaster } from "@/components/ui/toaster";

const Create = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Create Your Token</h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Easily create and deploy your custom token on the blockchain.
          </p>
        </motion.div>
        
        <TokenForm />
        <Toaster />
      </div>
    </div>
  );
};

export default Create;
