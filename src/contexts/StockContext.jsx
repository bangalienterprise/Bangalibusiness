import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storageManager } from '@/lib/persistentStorage';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/components/ui/use-toast';

const StockContext = createContext(null);

const STOCK_DB_KEY = 'offline_stock_data';

export const StockProvider = ({ children }) => {
    const { products: liveProducts, refreshData } = useBusiness();
    const [stockData, setStockData] = useState([]);
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const { toast } = useToast();

    // 1. Load from IndexedDB on mount (Cache-first strategy)
    useEffect(() => {
        const loadCachedStock = async () => {
            const cached = await storageManager.getDB(STOCK_DB_KEY);
            if (cached && cached.length > 0) {
                setStockData(cached);
                console.log("Loaded stock from cache");
            }
        };
        loadCachedStock();
    }, []);

    // 2. Sync live data to Cache & State
    useEffect(() => {
        if (liveProducts && liveProducts.length > 0) {
            setStockData(liveProducts);
            storageManager.setDB(STOCK_DB_KEY, liveProducts).catch(console.error);
            setIsOfflineMode(false);
        }
    }, [liveProducts]);

    // 3. Optimistic Update Wrapper
    // Allows UI to update stock immediately while request processes
    const adjustStockOptimistically = useCallback((productId, newQuantity) => {
        setStockData(prev => prev.map(p => 
            p.id === productId ? { ...p, stock: newQuantity } : p
        ));
    }, []);

    const value = {
        products: stockData,
        isOfflineMode,
        adjustStockOptimistically,
        refreshStock: refreshData
    };

    return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
};

export const useStock = () => {
    const context = useContext(StockContext);
    if (!context) throw new Error('useStock must be used within StockProvider');
    return context;
};