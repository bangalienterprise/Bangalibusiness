import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'bangali_pos_cart_v3'; 
const CART_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

const initialState = {
    cart: [],
    customerId: null,
    sellerId: null,
    paymentMethod: 'cash',
    amountPaid: '',
    lastUpdated: Date.now(),
};

const cartReducer = (state, action) => {
    let newState;
    switch (action.type) {
        case 'LOAD_SAVED_STATE':
            newState = { ...state, ...action.payload };
            break;
        
        case 'ADD_ITEM': {
            const { product } = action.payload;
            const existingItemIndex = state.cart.findIndex(item => item.id === product.id);
            let newCart;
            if (existingItemIndex > -1) {
                newCart = [...state.cart];
                const item = newCart[existingItemIndex];
                if (item.quantity < product.stock) {
                    newCart[existingItemIndex] = { ...item, quantity: item.quantity + 1 };
                }
            } else {
                newCart = [...state.cart, { ...product, quantity: 1 }];
            }
            newState = { ...state, cart: newCart, lastUpdated: Date.now() };
            break;
        }

        case 'REMOVE_ITEM':
            newState = {
                ...state,
                cart: state.cart.filter(item => item.id !== action.payload.productId),
                lastUpdated: Date.now()
            };
            break;

        case 'UPDATE_QUANTITY': {
            const { productId, delta } = action.payload;
            const newCart = state.cart.map(item => {
                if (item.id === productId) {
                    const newQty = item.quantity + delta;
                    if (newQty < 1) return item; 
                    if (newQty > item.stock) return item;
                    return { ...item, quantity: newQty };
                }
                return item;
            });
            newState = { ...state, cart: newCart, lastUpdated: Date.now() };
            break;
        }

        case 'SET_CUSTOMER':
            newState = { ...state, customerId: action.payload, lastUpdated: Date.now() };
            break;

        case 'SET_SELLER':
            newState = { ...state, sellerId: action.payload, lastUpdated: Date.now() };
            break;

        case 'SET_PAYMENT_METHOD':
            newState = { ...state, paymentMethod: action.payload, lastUpdated: Date.now() };
            break;

        case 'SET_AMOUNT_PAID':
            newState = { ...state, amountPaid: action.payload, lastUpdated: Date.now() };
            break;

        case 'CLEAR_CART':
            newState = { ...initialState, sellerId: state.sellerId, lastUpdated: Date.now() };
            break;

        default:
            return state;
    }
    
    // Persist to localStorage immediately after state change
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
        console.error("Failed to save cart to localStorage", e);
    }
    return newState;
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    const { toast } = useToast();

    // 1. Initial Load from LocalStorage
    useEffect(() => {
        try {
            const savedDataString = localStorage.getItem(CART_STORAGE_KEY);
            if (savedDataString) {
                const savedData = JSON.parse(savedDataString);
                const isExpired = (Date.now() - savedData.lastUpdated) > CART_EXPIRY_TIME;
                
                if (isExpired) {
                    localStorage.removeItem(CART_STORAGE_KEY);
                } else {
                    dispatch({ type: 'LOAD_SAVED_STATE', payload: savedData });
                }
            }
        } catch (e) {
            console.error("Failed to load cart from localStorage", e);
            localStorage.removeItem(CART_STORAGE_KEY);
        }
    }, []);

    const addToCart = useCallback((product) => {
        if(product.stock <= 0) {
             toast({ title: "Out of Stock", description: "Cannot add product with 0 stock.", variant: "destructive" });
             return;
        }
        dispatch({ type: 'ADD_ITEM', payload: { product } });
    }, [toast]);

    const removeFromCart = useCallback((productId) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
    }, []);

    const updateQuantity = useCallback((productId, delta) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, delta } });
    }, []);

    const setCustomer = useCallback((customerId) => {
        dispatch({ type: 'SET_CUSTOMER', payload: customerId });
    }, []);

    const setSeller = useCallback((sellerId) => {
        dispatch({ type: 'SET_SELLER', payload: sellerId });
    }, []);

    const setPaymentMethod = useCallback((method) => {
        dispatch({ type: 'SET_PAYMENT_METHOD', payload: method });
    }, []);

    const setAmountPaid = useCallback((amount) => {
        dispatch({ type: 'SET_AMOUNT_PAID', payload: amount });
    }, []);

    const clearCart = useCallback(() => {
        dispatch({ type: 'CLEAR_CART' });
    }, []);

    const value = {
        cart: state.cart,
        customerId: state.customerId,
        sellerId: state.sellerId,
        paymentMethod: state.paymentMethod,
        amountPaid: state.amountPaid,
        addToCart,
        removeFromCart,
        updateQuantity,
        setCustomer,
        setSeller,
        setPaymentMethod,
        setAmountPaid,
        clearCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};