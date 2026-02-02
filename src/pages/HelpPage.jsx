import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Mail, Book, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const HelpPage = () => {
  return (
    <>
      <Helmet>
        <title>Help Center - Bangali Enterprise</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-950 text-white p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              How can we help you today?
            </h1>
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <Input 
                placeholder="Search for answers..." 
                className="pl-10 bg-gray-900 border-gray-800 text-white h-12 rounded-full"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-gray-800 text-white hover:bg-gray-800/50 transition cursor-pointer">
              <CardHeader>
                <Book className="h-8 w-8 text-blue-400 mb-2" />
                <CardTitle>Documentation</CardTitle>
                <CardDescription className="text-gray-400">
                  Read comprehensive guides on how to use every feature.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gray-900 border-gray-800 text-white hover:bg-gray-800/50 transition cursor-pointer">
              <CardHeader>
                <MessageCircle className="h-8 w-8 text-green-400 mb-2" />
                <CardTitle>FAQ</CardTitle>
                <CardDescription className="text-gray-400">
                  Find answers to common questions about billing and account.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gray-900 border-gray-800 text-white hover:bg-gray-800/50 transition cursor-pointer">
              <CardHeader>
                <Mail className="h-8 w-8 text-purple-400 mb-2" />
                <CardTitle>Contact Support</CardTitle>
                <CardDescription className="text-gray-400">
                  Get in touch with our team for personalized help.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                "How do I add a new team member?",
                "Can I export my sales data?",
                "How do I change my business settings?",
                "What payment methods are supported?"
              ].map((q, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg"
                >
                  <h3 className="font-semibold text-lg">{q}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpPage;