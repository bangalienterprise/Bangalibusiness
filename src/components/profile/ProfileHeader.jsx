import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Edit } from 'lucide-react';
import EditProfileDialog from '@/components/users/EditProfileDialog';
import * as db from '@/lib/database';

const ProfileHeader = ({ user: profileUser, business, isOwnProfile, onProfileUpdate }) => {
    const { toast } = useToast();
    const avatarInputRef = useRef(null);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(profileUser?.avatar_url);

    useEffect(() => {
        setAvatarUrl(profileUser?.avatar_url);
    }, [profileUser]);

    if (!profileUser) return null;

    const handleAvatarChangeClick = () => {
        if (!isOwnProfile) return;
        avatarInputRef.current.click();
    };

    const handleAvatarFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !isOwnProfile) return;

        try {
            // Upload file using API utility
            const uploadResult = await db.uploadFile(file);
            
            if (uploadResult.error) throw uploadResult.error;

            const publicUrl = uploadResult.url;

            // Update user profile with new avatar URL
            await db.database.update('/users/profile', profileUser.id, { avatar_url: publicUrl });
            
            setAvatarUrl(publicUrl);
            onProfileUpdate(); // Callback to refresh profile data
            toast({ title: 'Avatar Updated Successfully!' });

        } catch (error) {
            toast({ title: 'Avatar Upload Failed', description: error.message, variant: 'destructive' });
        }
    };
    
    return (
        <>
            <div className="relative h-64 md:h-80 w-full">
                <div className="absolute inset-0 bg-card overflow-hidden">
                    <img
                        alt="Abstract background representing business branding"
                        className="w-full h-full object-cover opacity-20"
                        src="https://images.unsplash.com/photo-1653023500770-3a3b64a1b4c4?q=80&w=2069&auto=format&fit=crop" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center p-4">
                     <h2 className="text-4xl md:text-6xl font-bold text-foreground/80" style={{ fontFamily: 'sans-serif' }}>
                        বাঙ্গালী এন্টারপ্রাইজ
                     </h2>
                </div>

                <div className="absolute -bottom-20 md:-bottom-24 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-col md:flex-row items-center"
                    >
                        <div className="relative group mb-4 md:mb-0 md:mr-6">
                            <Avatar className="h-36 w-36 md:h-48 md:w-48 border-4 border-background shadow-lg">
                                <AvatarImage src={avatarUrl} alt={profileUser.username} />
                                <AvatarFallback className="text-6xl font-bold bg-primary text-primary-foreground">
                                    {(profileUser.full_name || profileUser.username || 'U').charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {isOwnProfile && (
                                <>
                                    <input
                                        type="file"
                                        ref={avatarInputRef}
                                        onChange={handleAvatarFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleAvatarChangeClick}
                                        className="absolute bottom-2 right-2 h-10 w-10 bg-card/80 hover:bg-card rounded-full text-foreground group-hover:opacity-100 opacity-70 transition-opacity"
                                    >
                                        <Camera className="h-5 w-5" />
                                    </Button>
                                </>
                            )}
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{profileUser.full_name || profileUser.username}</h1>
                            <p className="text-lg text-muted-foreground">@{profileUser.username}</p>
                            <p className="mt-2 font-semibold text-primary">{business?.name || 'No Active Business'}</p>
                        </div>
                        {isOwnProfile && (
                           <div className="mt-4 md:mt-0">
                               <Button onClick={() => setIsEditProfileOpen(true)} variant="outline">
                                   <Edit className="mr-2 h-4 w-4"/>
                                   Edit Profile
                               </Button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
            {isOwnProfile && <EditProfileDialog isOpen={isEditProfileOpen} setIsOpen={setIsEditProfileOpen} user={profileUser} onProfileUpdate={onProfileUpdate} />}
        </>
    );
};

export default ProfileHeader;