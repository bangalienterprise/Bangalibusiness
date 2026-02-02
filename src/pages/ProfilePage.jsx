import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useParams, Navigate, Link } from 'react-router-dom';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { Button } from '@/components/ui/button';
import { Settings, BarChart2, DollarSign, ShieldCheck, User as UserIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

const ProfilePage = () => {
    const { userId } = useParams();
    const { profile: currentUserProfile, loading: authLoading, hasPermission } = useAuth();
    const { activeBusiness, loading: businessLoading } = useBusiness();
    const [profileData, setProfileData] = useState(null);
    const [stats, setStats] = useState({ totalNetProfit: 0, totalCollected: 0, totalDue: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const profileId = userId || currentUserProfile?.id;
    const isOwnProfile = !userId || currentUserProfile?.id === userId;
    const isSeller = profileData?.role === 'seller';

    const fetchProfileData = useCallback(async () => {
        if (!profileId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const { data, error } = await supabase.rpc('get_all_users_with_details')
            .eq('id', profileId)
            .single();
        
        if (error) {
            console.error("Error fetching profile", error);
            setProfileData(null);
        } else {
            setProfileData(data);
        }
        setIsLoading(false);
    }, [profileId]);

    const fetchStats = useCallback(async () => {
        if (activeBusiness?.id && profileId && isSeller) {
            const { data, error } = await supabase.rpc('get_seller_stats', { 
                p_business_id: activeBusiness.id,
                p_seller_id: profileId
            });

            if (error) {
                console.error("Error fetching seller stats", error);
            } else if (data && data.length > 0) {
                setStats({
                    totalNetProfit: data[0].total_net_profit || 0,
                    totalCollected: data[0].total_collected || 0,
                    totalDue: data[0].total_due || 0,
                });
            }
        }
    }, [activeBusiness, profileId, isSeller]);

    useEffect(() => {
        if (!authLoading) {
            fetchProfileData();
        }
    }, [authLoading, fetchProfileData]);

    useEffect(() => {
        if (!businessLoading && profileData) {
            fetchStats();
        }
    }, [businessLoading, profileData, fetchStats]);

    const loadingState = isLoading || authLoading || businessLoading;

    if (loadingState && !profileData) {
        return <div className="flex justify-center items-center h-screen"><p>Loading Profile...</p></div>;
    }

    if (!profileData) {
        return <Navigate to="/dashboard" replace />;
    }

    const pageTitle = loadingState ? "Loading Profile..." : `${profileData.full_name || profileData.username}'s Profile - Bangali Enterprise`;

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={`Profile page for ${profileData.username || 'user'}.`} />
            </Helmet>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col min-h-full"
            >
                <ProfileHeader 
                    user={profileData} 
                    business={activeBusiness} 
                    isOwnProfile={isOwnProfile} 
                    onProfileUpdate={fetchProfileData}
                />

                <div className="pt-28 md:pt-32" />

                <div className="p-4 md:p-8 w-full max-w-5xl mx-auto space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                       {isSeller ? (
                        <>
                             <Card className="glassmorphic">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Net Profit</CardTitle>
                                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">৳{stats.totalNetProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                    <p className="text-xs text-muted-foreground">Your sales profit</p>
                                </CardContent>
                            </Card>
                             <Card className="glassmorphic">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Collected (Market)</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">৳{stats.totalCollected.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                    <p className="text-xs text-muted-foreground">Cash received from sales</p>
                                </CardContent>
                            </Card>
                            <Card className="glassmorphic">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Due (Market)</CardTitle>
                                    <TrendingDown className="h-4 w-4 text-destructive" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">৳{stats.totalDue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                    <p className="text-xs text-muted-foreground">Outstanding payments</p>
                                </CardContent>
                            </Card>
                        </>
                       ) : (
                        <>
                           <Card className="glassmorphic">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Role</CardTitle>
                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold capitalize">{profileData.role.replace(/_/g, ' ')}</div>
                                    <p className="text-xs text-muted-foreground">User permission level</p>
                                </CardContent>
                            </Card>
                             <Card className="glassmorphic">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                                    <ShieldCheck className={`h-4 w-4 ${profileData.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-2xl font-bold capitalize ${profileData.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                                        {profileData.status}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Account status</p>
                                </CardContent>
                            </Card>
                        </>
                       )}
                       
                       <Card className="glassmorphic">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Status</CardTitle>
                                <ShieldCheck className={`h-4 w-4 ${profileData.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`} />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold capitalize ${profileData.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                                    {profileData.status}
                                </div>
                                <p className="text-xs text-muted-foreground">Account status</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    {isOwnProfile && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h2 className="text-xl font-bold mb-4 text-foreground">Quick Actions</h2>
                            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 flex flex-wrap gap-4 justify-center">
                                <Button asChild variant="outline" size="lg">
                                    <Link to="/sales">View Sales</Link>
                                </Button>
                                <Button asChild variant="outline" size="lg">
                                    <Link to="/products">View Products</Link>
                                </Button>
                                {hasPermission('manage_products') && (
                                     <Button asChild variant="outline" size="lg">
                                        <Link to="/products">Manage Products</Link>
                                    </Button>
                                )}
                                <Button asChild size="lg">
                                    <Link to="/settings">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Go to Settings
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default ProfilePage;