
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Index = () => {
  return (
    <div className="relative min-h-screen w-full flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95 z-0" />
      
      {/* Subtle gradient orbs */}
      <div className="absolute top-[10%] left-[10%] w-[30rem] h-[30rem] bg-primary/5 rounded-full filter blur-[8rem] z-0"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[30rem] h-[30rem] bg-blue-500/5 rounded-full filter blur-[8rem] z-0"></div>
      
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={item}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
              Create Your Token
            </h1>
          </motion.div>
          
          <motion.div variants={item}>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Easily create and deploy your custom token on the blockchain.
            </p>
          </motion.div>
          
          <motion.div variants={item}>
            <Link to="/create">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="btn-hover bg-primary text-white font-medium px-8 py-4 rounded-xl text-lg flex items-center space-x-2"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </main>
      
      <footer className="py-6 text-center text-gray-500 text-sm relative z-10">
        © {new Date().getFullYear()} Coin. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
