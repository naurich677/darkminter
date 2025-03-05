
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    
    // Check if wallet is connected
    const storedAddress = localStorage.getItem('walletAddress');
    if (storedAddress) {
      setWalletAddress(storedAddress);
    }
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const connectWallet = () => {
    // In a real implementation, this would trigger wallet connection
    // For now, we'll just use a mock address
    if (walletAddress) {
      // Disconnect
      localStorage.removeItem('walletAddress');
      setWalletAddress(null);
      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected.",
      });
    } else {
      // Connect
      const mockAddress = "0x" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('walletAddress', mockAddress);
      setWalletAddress(mockAddress);
      toast({
        title: "Wallet connected",
        description: "Your wallet has been connected successfully.",
      });
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-white text-xl font-semibold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
            Coin
          </span>
        </Link>

        <div className="flex items-center space-x-1 md:space-x-4">
          <NavLink to="/create" current={location.pathname}>
            Create
          </NavLink>
          <NavLink to="/liquidity" current={location.pathname}>
            Liquidity
          </NavLink>
          <NavLink to="/profile" current={location.pathname}>
            Profile
          </NavLink>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={connectWallet}
          className={`btn-hover ${
            walletAddress ? "bg-green-600" : "bg-primary"
          } text-white px-5 py-2 rounded-full text-sm font-medium`}
        >
          {walletAddress ? "Connected" : "Connect"}
        </motion.button>
      </div>
    </motion.nav>
  );
};

const NavLink = ({ to, current, children }: { to: string; current: string; children: React.ReactNode }) => {
  const isActive = current === to;

  return (
    <Link to={to} className="relative px-3 py-2">
      <span
        className={`relative z-10 transition-colors duration-300 ${
          isActive ? "text-white" : "text-gray-400 hover:text-white"
        }`}
      >
        {children}
      </span>
      {isActive && (
        <motion.span
          layoutId="navIndicator"
          className="absolute inset-0 rounded-full bg-secondary z-0"
          transition={{ type: "spring", duration: 0.5 }}
        />
      )}
    </Link>
  );
};

export default Navbar;
