export const STORAGE_KEYS = {
    USERS: 'be_users',
    BUSINESSES: 'be_businesses',
    PRODUCTS: 'be_products',
    SALES: 'be_sales',
    PROJECTS: 'be_projects',
    TASKS: 'be_tasks',
    STUDENTS: 'be_students',
    TIME_ENTRIES: 'be_time_entries',
    BOOKINGS: 'be_bookings',
    INVOICES: 'be_invoices',
    INVITE_CODES: 'be_invite_codes',
    SESSION: 'be_session',
    BACKUPS: 'be_backups'
};

export const saveToLocalStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving to localStorage [${key}]:`, error);
    }
};

export const loadFromLocalStorage = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`Error loading from localStorage [${key}]:`, error);
        return null;
    }
};

export const clearLocalStorage = (key) => {
    localStorage.removeItem(key);
};

export const storageManager = {
    getDB: async (key) => loadFromLocalStorage(key),
    setDB: async (key, data) => saveToLocalStorage(key, data),
    getLocal: (key) => loadFromLocalStorage(key),
    setLocal: (key, data) => saveToLocalStorage(key, data),
    getBackups: async () => loadFromLocalStorage(STORAGE_KEYS.BACKUPS) || [],
    createBackup: async () => {
        const backupId = `backup_${Date.now()}`;
        const backupData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('be_') || key.startsWith('offline_'))) {
                backupData[key] = localStorage.getItem(key);
            }
        }
        saveToLocalStorage(backupId, backupData);
        const backups = loadFromLocalStorage(STORAGE_KEYS.BACKUPS) || [];
        saveToLocalStorage(STORAGE_KEYS.BACKUPS, [backupId, ...backups]);
        return backupId;
    },
    restoreBackup: async (backupId) => {
        const backupData = loadFromLocalStorage(backupId);
        if (backupData) {
            Object.entries(backupData).forEach(([key, value]) => {
                localStorage.setItem(key, value);
            });
        }
    }
};