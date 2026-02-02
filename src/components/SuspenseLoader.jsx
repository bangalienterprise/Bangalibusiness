import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SuspenseLoader = ({ text = "Loading resources..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center space-y-4"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin relative z-10" />
        </div>
        
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-medium text-white">{text}</h3>
          <div className="flex gap-1 justify-center">
             <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
               transition={{ repeat: Infinity, duration: 1, delay: 0 }}
               className="h-2 w-2 bg-blue-500 rounded-full" 
             />
             <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
               transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
               className="h-2 w-2 bg-blue-500 rounded-full" 
             />
             <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
               transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
               className="h-2 w-2 bg-blue-500 rounded-full" 
             />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SuspenseLoader;