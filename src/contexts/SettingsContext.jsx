import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockDatabase } from '@/lib/services/MockDatabase';
import { useToast } from '@/components/ui/use-toast';
import { STORAGE_KEYS, loadFromLocalStorage } from '@/lib/persistentStorage';

const SettingsContext = createContext(null);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Default settings fallback
    const defaultSettings = {
        store_name: "My Retail Store",
        address: "",
        phone: "",
        email: "",
        website: "",
        tax_rate: 0,
        currency_symbol: "৳",
        discount_limit: 100,
        minimum_sale: 0,
        enable_tax: false,
        enable_discount: true,
        header_text: "Thank you for shopping!",
        footer_text: "No returns after 3 days.",
        invoice_prefix: "INV-",
        invoice_start: 1000,
        paper_size: "Thermal",
        show_logo: true,
        show_address: true,
        show_phone: true,
        show_email: true
    };

    const loadSettings = async () => {
        if (!user?.business_id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // Try to load from mock DB (which handles local storage)
            const data = await mockDatabase.getSettings(user.business_id);
            
            if (data) {
                setSettings({ ...defaultSettings, ...data });
            } else {
                // Initialize defaults if strictly null
                const newSettings = await mockDatabase.updateSettings(user.business_id, defaultSettings);
                setSettings(newSettings);
            }
        } catch (error) {
            console.error("Failed to load settings", error);
            setError(error);
            toast({ 
                variant: "destructive", 
                title: "Settings Error", 
                description: "Failed to load business settings. Using defaults." 
            });
            setSettings(defaultSettings);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, [user]);

    const updateSettings = async (newSettings) => {
        if (!user?.business_id) return;
        try {
            // Optimistic update
            setSettings(prev => ({ ...prev, ...newSettings }));
            
            const updated = await mockDatabase.updateSettings(user.business_id, newSettings);
            setSettings(updated);
            
            toast({ title: "Settings Saved", description: "Business settings have been updated successfully." });
            return updated;
        } catch (error) {
            console.error("Failed to update settings", error);
            toast({ variant: "destructive", title: "Save Failed", description: "Could not update settings." });
            // Revert on failure (could implement previous state tracking if needed)
            loadSettings(); 
            throw error;
        }
    };

    const resetSettings = async () => {
        if (!user?.business_id) return;
        try {
            await updateSettings(defaultSettings);
            toast({ title: "Settings Reset", description: "Settings have been restored to defaults." });
        } catch (error) {
            console.error(error);
        }
    };

    const factoryReset = async () => {
        if (!user?.business_id) return;
        try {
            await mockDatabase.factoryReset(user.business_id);
            toast({ title: "Factory Reset Complete", description: "All transactional data has been cleared." });
            window.location.reload(); 
        } catch (error) {
            toast({ variant: "destructive", title: "Reset Failed", description: error.message });
        }
    };

    const exportData = async () => {
        if (!user?.business_id) return;
        return await mockDatabase.exportData(user.business_id);
    };
    
    const importData = async (jsonData) => {
        if (!user?.business_id) return;
        try {
            await mockDatabase.importData(user.business_id, jsonData);
            toast({ title: "Import Successful", description: "Data has been imported successfully." });
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            toast({ variant: "destructive", title: "Import Failed", description: error.message });
        }
    };

    const getCurrency = () => settings?.currency_symbol || '৳';
    const getTaxRate = () => settings?.enable_tax ? (settings?.tax_rate || 0) : 0;
    const isTaxEnabled = () => settings?.enable_tax || false;

    // Commission Helpers
    const getUserCommissionSettings = async (userId) => {
         const u = await mockDatabase.getUser(userId);
         return {
             commission_percentage: u?.commission_percentage || 0,
             commission_type: u?.commission_type || 'percentage',
             is_active: u?.is_active_commission,
             commission_amount: u?.commission_amount
         };
    };

    return (
        <SettingsContext.Provider value={{
            settings: settings || defaultSettings,
            loading,
            error,
            updateSettings,
            resetSettings,
            factoryReset,
            exportData,
            importData,
            getCurrency,
            getTaxRate,
            isTaxEnabled,
            getUserCommissionSettings,
            refreshSettings: loadSettings
        }}>
            {children}
        </SettingsContext.Provider>
    );
};