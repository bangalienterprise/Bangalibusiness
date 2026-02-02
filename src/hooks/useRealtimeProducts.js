
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { productService } from '@/services/productService';
import { useToast } from '@/components/ui/use-toast';

export const useRealtimeProducts = (businessId) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { toast } = useToast();

    // Initial Fetch
    useEffect(() => {
        if (!businessId) return;

        let mounted = true;
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const data = await productService.getProductsByBusiness(businessId);
                if (mounted) setProducts(data);
            } catch (err) {
                if (mounted) {
                    setError(err);
                    toast({ title: "Error fetching products", description: err.message, variant: "destructive" });
                }
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        fetchProducts();

        return () => { mounted = false; };
    }, [businessId]);

    // Realtime Subscription
    useEffect(() => {
        if (!businessId) return;

        const channel = supabase
            .channel('public:products')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'products',
                filter: `business_id=eq.${businessId}` 
            }, (payload) => {
                
                if (payload.eventType === 'INSERT') {
                    setProducts(prev => [payload.new, ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
                } else if (payload.eventType === 'DELETE') {
                    setProducts(prev => prev.filter(p => p.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [businessId]);

    return { products, isLoading, error };
};
