
import { motion } from "framer-motion";
import { Share2 } from "lucide-react";

const Profile = () => {
  // Mock data for created tokens
  const tokens = [
    { id: 1, name: "Sample Token", symbol: "SMP", date: "2023-11-15", status: "Active" },
    { id: 2, name: "Test Token", symbol: "TST", date: "2023-11-10", status: "Active" },
    { id: 3, name: "Demo Finance", symbol: "DFI", date: "2023-11-01", status: "Pending" },
  ];

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

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Profile</h1>
          <p className="text-lg text-gray-400">
            Manage your tokens and account settings
          </p>
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
                <span className="text-sm text-gray-400">{tokens.length} tokens</span>
              </div>

              {tokens.length > 0 ? (
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
                          <span className="text-xs text-gray-400">{token.date}</span>
                        </div>
                      </div>
                      <div>
                        <span
                          className={`text-xs rounded-full px-3 py-1 font-medium ${
                            token.status === "Active"
                              ? "bg-green-400/10 text-green-400"
                              : "bg-yellow-400/10 text-yellow-400"
                          }`}
                        >
                          {token.status}
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
                Invite friends to create their own tokens and earn rewards
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="btn-hover w-full bg-primary text-white py-3 rounded-lg font-medium flex items-center justify-center"
              >
                <Share2 className="mr-2 h-4 w-4" /> Invite
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
