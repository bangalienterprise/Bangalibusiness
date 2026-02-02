import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageManager } from '@/lib/persistentStorage';
import { useBusiness } from '@/contexts/BusinessContext';

const SalesContext = createContext(null);

const SALES_DB_KEY = 'offline_sales_history';
const DRAFT_SALES_KEY = 'draft_sales_list';

export const SalesProvider = ({ children }) => {
    const { sales: liveSales } = useBusiness(); // Assuming BusinessContext fetches sales
    const [salesHistory, setSalesHistory] = useState([]);
    const [draftSales, setDraftSales] = useState([]);

    // 1. Load History and Drafts
    useEffect(() => {
        const init = async () => {
            const cachedHistory = await storageManager.getDB(SALES_DB_KEY);
            if (cachedHistory) setSalesHistory(cachedHistory);

            const cachedDrafts = storageManager.getLocal(DRAFT_SALES_KEY);
            if (cachedDrafts) setDraftSales(cachedDrafts);
        };
        init();
    }, []);

    // 2. Sync Live Sales to Cache
    useEffect(() => {
        if (liveSales && liveSales.length > 0) {
            setSalesHistory(liveSales);
            storageManager.setDB(SALES_DB_KEY, liveSales).catch(console.error);
        }
    }, [liveSales]);

    // 3. Draft Management
    const saveDraft = (draft) => {
        const newDrafts = [...draftSales, { ...draft, id: `draft_${Date.now()}`, createdAt: Date.now() }];
        setDraftSales(newDrafts);
        storageManager.setLocal(DRAFT_SALES_KEY, newDrafts);
    };

    const deleteDraft = (draftId) => {
        const newDrafts = draftSales.filter(d => d.id !== draftId);
        setDraftSales(newDrafts);
        storageManager.setLocal(DRAFT_SALES_KEY, newDrafts);
    };

    const value = {
        salesHistory,
        draftSales,
        saveDraft,
        deleteDraft
    };

    return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>;
};

export const useSales = () => {
    const context = useContext(SalesContext);
    if (!context) throw new Error('useSales must be used within SalesProvider');
    return context;
};