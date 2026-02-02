import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import WelcomeMessage from '@/components/WelcomeMessage';
import CallToAction from '@/components/CallToAction';
import HeroImage from '@/components/HeroImage';

const BangaliShaj = () => {
  return (
    <>
      <Helmet>
        <title>Welcome to Bangali Enterprise</title>
        <meta name="description" content="The starting point for your Bangali Enterprise application." />
      </Helmet>
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center text-center p-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <HeroImage />
        </motion.div>
        <div className="space-y-6">
          <WelcomeMessage />
          <CallToAction />
        </div>
      </div>
    </>
  );
};

export default BangaliShaj;