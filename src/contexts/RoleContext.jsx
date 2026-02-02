
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const RoleContext = createContext();

export const FEATURES = {
    DASHBOARD: 'dashboard',
    POS: 'pos',
    SALES_HISTORY: 'sales_history',
    DUE_COLLECTION: 'due_collection',
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    EXPENSES: 'expenses',
    DAMAGE: 'damage',
    GIFT_CARDS: 'gift_cards',
    ORDERS: 'orders',
    SUPPLIERS: 'suppliers',
    TEAM: 'team',
    SETTINGS: 'settings',
    ADMIN_PANEL: 'admin_panel'
};

const PERMISSIONS = {
    global_admin: {
        canView: Object.values(FEATURES),
        canCreate: Object.values(FEATURES),
        canEdit: Object.values(FEATURES),
        canDelete: Object.values(FEATURES),
    },
    owner: {
        canView: [FEATURES.DASHBOARD, FEATURES.POS, FEATURES.SALES_HISTORY, FEATURES.DUE_COLLECTION, FEATURES.PRODUCTS, FEATURES.CATEGORIES, FEATURES.EXPENSES, FEATURES.DAMAGE, FEATURES.GIFT_CARDS, FEATURES.ORDERS, FEATURES.SUPPLIERS, FEATURES.TEAM, FEATURES.SETTINGS],
        canCreate: [FEATURES.POS, FEATURES.PRODUCTS, FEATURES.CATEGORIES, FEATURES.EXPENSES, FEATURES.DAMAGE, FEATURES.GIFT_CARDS, FEATURES.ORDERS, FEATURES.SUPPLIERS, FEATURES.TEAM],
        canEdit: [FEATURES.PRODUCTS, FEATURES.CATEGORIES, FEATURES.EXPENSES, FEATURES.DAMAGE, FEATURES.GIFT_CARDS, FEATURES.ORDERS, FEATURES.SUPPLIERS, FEATURES.TEAM, FEATURES.SETTINGS],
        canDelete: [FEATURES.PRODUCTS, FEATURES.CATEGORIES, FEATURES.EXPENSES, FEATURES.DAMAGE, FEATURES.GIFT_CARDS, FEATURES.ORDERS, FEATURES.SUPPLIERS, FEATURES.TEAM],
    },
    manager: {
        canView: [FEATURES.DASHBOARD, FEATURES.POS, FEATURES.SALES_HISTORY, FEATURES.DUE_COLLECTION, FEATURES.PRODUCTS, FEATURES.CATEGORIES, FEATURES.EXPENSES, FEATURES.DAMAGE, FEATURES.GIFT_CARDS, FEATURES.ORDERS, FEATURES.SUPPLIERS],
        canCreate: [FEATURES.POS, FEATURES.PRODUCTS, FEATURES.CATEGORIES, FEATURES.EXPENSES, FEATURES.DAMAGE, FEATURES.GIFT_CARDS, FEATURES.ORDERS, FEATURES.SUPPLIERS],
        canEdit: [FEATURES.PRODUCTS, FEATURES.CATEGORIES, FEATURES.EXPENSES, FEATURES.DAMAGE, FEATURES.GIFT_CARDS, FEATURES.ORDERS, FEATURES.SUPPLIERS],
        canDelete: [], // Managers generally cannot delete
    },
    seller: {
        canView: [FEATURES.DASHBOARD, FEATURES.POS, FEATURES.SALES_HISTORY, FEATURES.DUE_COLLECTION, FEATURES.PRODUCTS, FEATURES.CUSTOMERS],
        canCreate: [FEATURES.POS, FEATURES.DUE_COLLECTION], // Only sales and collections
        canEdit: [],
        canDelete: [],
    }
};

export function RoleProvider({ children }) {
    const { role } = useAuth();
    const [permissions, setPermissions] = useState(null);

    useEffect(() => {
        if (role && PERMISSIONS[role]) {
            setPermissions(PERMISSIONS[role]);
        } else if (role === 'super_admin') { // Fallback for legacy role name
             setPermissions(PERMISSIONS.global_admin);
        } else {
             // Default safe permissions
             setPermissions(PERMISSIONS.seller);
        }
    }, [role]);

    const canViewFeature = (feature) => permissions?.canView.includes(feature);
    const canCreateFeature = (feature) => permissions?.canCreate.includes(feature);
    const canEditFeature = (feature) => permissions?.canEdit.includes(feature);
    const canDeleteFeature = (feature) => permissions?.canDelete.includes(feature);

    return (
        <RoleContext.Provider value={{
            permissions,
            canViewFeature,
            canCreateFeature,
            canEditFeature,
            canDeleteFeature,
            FEATURES
        }}>
            {children}
        </RoleContext.Provider>
    );
}

export const useRole = () => useContext(RoleContext);
