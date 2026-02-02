import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const GlobalStateContext = createContext();

const initialData = {
    users: [],
    customers: [],
    products: [],
    sales: [],
    expenses: [],
    expenseCategories: [],
    stockHistory: [],
    stockHistoryItems: [],
    roles: [],
    businesses: []
};


const globalReducer = (state, action) => {
  switch (action.type) {
    case 'SET_INITIAL_DATA':
        return action.payload;

    case 'ADD_CUSTOMER':
        return { ...state, customers: [...state.customers, { ...action.payload, id: uuidv4() }] };
    
    case 'ADD_USER': // For local state, we just add them. Auth is separate.
        return { ...state, users: [...state.users, { ...action.payload, id: uuidv4() }] };
    
    case 'ADD_PRODUCT':
        const newProduct = { ...action.payload, id: uuidv4(), created_at: new Date().toISOString() };
        return { ...state, products: [...state.products, newProduct] };

    case 'ADD_SALE':
        const { sale, items } = action.payload;
        const newSales = items.map(item => ({
            ...sale,
            id: uuidv4(),
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_amount: item.total_amount,
            // Pro-rate collected and due amounts
            collected_amount: (sale.collected_amount / sale.total_amount) * item.total_amount,
            due_amount: ((sale.total_amount - sale.collected_amount) / sale.total_amount) * item.total_amount,
            created_at: new Date().toISOString(),
        }));
        return { ...state, sales: [...state.sales, ...newSales] };
    
    case 'ADD_EXPENSE':
        return { ...state, expenses: [...state.expenses, { ...action.payload, id: uuidv4(), created_at: new Date().toISOString() }] };

    case 'ADD_STOCK_ENTRY':
        const { entry, items: stockItems } = action.payload;
        const newEntry = { ...entry, id: uuidv4(), created_at: new Date().toISOString() };
        const newStockItems = stockItems.map(item => ({...item, id: uuidv4(), stock_history_id: newEntry.id }));
        
        const updatedProducts = state.products.map(p => {
            const itemToAdd = newStockItems.find(si => si.product_id === p.id);
            if(itemToAdd){
                return { ...p, stock: p.stock + itemToAdd.quantity };
            }
            return p;
        });

        return { 
            ...state, 
            stockHistory: [...state.stockHistory, newEntry],
            stockHistoryItems: [...state.stockHistoryItems, ...newStockItems],
            products: updatedProducts
        };

    default:
      return state;
  }
};

const APP_STATE_KEY = 'bangaliEnterpriseAppState';

export const GlobalStateProvider = ({ children }) => {
    const [state, dispatch] = useReducer(globalReducer, initialData, (initial) => {
        try {
            const localData = window.localStorage.getItem(APP_STATE_KEY);
            // Ensure the parsed data has all initial keys to prevent runtime errors
            const parsed = localData ? JSON.parse(localData) : {};
            return { ...initial, ...parsed };
        } catch (error) {
            console.error("Could not parse localStorage data:", error);
            return initial;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error("Could not save to localStorage:", error);
        }
    }, [state]);

    return (
        <GlobalStateContext.Provider value={{ state, dispatch }}>
            {children}
        </GlobalStateContext.Provider>
    );
};

export const useGlobalState = () => useContext(GlobalStateContext);