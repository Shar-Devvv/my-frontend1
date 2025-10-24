import { motion } from "framer-motion";

export default function CreateResumePage() {
  return (
    <div className="flex h-screen">
      {/* Left: Preview */}
      <motion.div
        className="w-1/2 p-8 border-r border-gray-200"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-xl font-semibold mb-4">Live Resume Preview</h2>
        <div className="border-2 border-dashed rounded-2xl p-6 text-center h-[400px] flex items-center justify-center text-gray-500">
          Enter your details and upload an image to see your mock-up here.
        </div>
      </motion.div>

      {/* Right: Form */}
      <motion.div
        className="w-1/2 p-10"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        <h2 className="text-2xl font-bold mb-6">Create New Resume</h2>

        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="mb-6"
        >
          <label className="block mb-2 font-medium">Enter your Username</label>
          <input
            type="text"
            placeholder="e.g., Jane Doe"
            className="border p-3 rounded-lg w-full"
          />
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-md"
        >
          Upload Image
        </motion.button>
      </motion.div>
    </div>
  );
}
