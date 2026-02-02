import React from 'react';
import { Download, Monitor, Smartphone, Apple } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const Footer = () => {
    const { toast } = useToast();

    const handleDownloadClick = () => {
        toast({
            title: "🚧 Feature coming soon!",
            description: "Installable desktop and mobile apps are on the way. You can request this feature again in the future!",
            duration: 5000,
        });
    };

    return (
        <footer className="w-full bg-transparent text-foreground py-6 px-4 sm:px-6 mt-auto">
            <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-center items-center gap-4">
                <h3 className="text-md font-semibold flex items-center">
                    <Download className="mr-3 h-5 w-5" />
                    Download App:
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                    <Button variant="outline" size="sm" onClick={handleDownloadClick} className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" /> Windows
                    </Button>
                     <Button variant="outline" size="sm" onClick={handleDownloadClick} className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" /> Android
                    </Button>
                     <Button variant="outline" size="sm" onClick={handleDownloadClick} className="flex items-center gap-2">
                        <Apple className="h-4 w-4" /> iOS
                    </Button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;