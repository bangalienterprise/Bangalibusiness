
import { mockDatabase } from '@/lib/services/MockDatabase';

/**
 * MOCK SUPABASE CLIENT
 * 
 * This file replaces the actual Supabase client.
 * It routes all calls to the MockDatabase service.
 * Used for compatibility with existing code that expects a 'supabase' export.
 */

class MockQueryBuilder {
    constructor(table) {
        this.table = table;
        this.filters = [];
        this._order = null;
        this._single = false;
        this._limit = null;
    }

    select(columns = '*') {
        return this;
    }

    eq(column, value) {
        this.filters.push({ operator: 'eq', column, value });
        return this;
    }

    order(column, { ascending = true } = {}) {
        this._order = { column, ascending };
        return this;
    }

    limit(count) {
        this._limit = count;
        return this;
    }

    single() {
        this._single = true;
        return this;
    }

    ilike() { return this; }
    in() { return this; }
    gte() { return this; }
    lte() { return this; }

    then(resolve, reject) {
        const query = {
            filters: this.filters,
            order: this._order,
            single: this._single,
            limit: this._limit
        };
        
        mockDatabase.select(this.table, query).then(({data, error}) => {
            if (error && this._single && (!data || data.length === 0)) {
               // Mimic Supabase PGRST116 error for single() on no rows
               resolve({ data: null, error: { message: 'JSON object requested, multiple (or no) rows returned', code: 'PGRST116' }});
            } else {
               resolve({ data, error });
            }
        });
    }

    insert(data) {
        // Return a promise that resolves to the result, but also has .select() and .single() methods attached
        // to support chaining like supabase.from().insert().select()
        const promise = new Promise((resolve, reject) => {
            mockDatabase.insert(this.table, data).then(result => {
                resolve(result);
            }).catch(err => {
                resolve({ data: null, error: err });
            });
        });

        // Attach chainable methods that just return the same promise
        // In a real implementation, .select() would modify what is returned, 
        // but for mock we just return the inserted data.
        promise.select = () => promise;
        promise.single = () => promise;
        
        return promise;
    }

    async update(data) {
        const idFilter = this.filters.find(f => f.column === 'id');
        if (idFilter) {
            return mockDatabase.update(this.table, idFilter.value, data);
        }
        return { error: { message: "Update requires .eq('id', ...)" } };
    }

    async delete() {
        const idFilter = this.filters.find(f => f.column === 'id');
        if (idFilter) {
            return mockDatabase.delete(this.table, idFilter.value);
        }
        return { error: { message: "Delete requires .eq('id', ...)" } };
    }
}

const mockClient = {
    from: (table) => new MockQueryBuilder(table),
    rpc: async (fn, args) => {
        console.log(`[MockRPC] Calling ${fn}`, args);
        return { data: null, error: null }; 
    },
    auth: {
        signInWithPassword: async ({ email, password }) => {
            const { data: profiles } = await mockDatabase.select('profiles', {});
            const user = profiles ? profiles.find(u => u.email === email) : null;
            
            if (user) {
                const session = {
                    user: { id: user.id, email: user.email, user_metadata: { full_name: user.full_name, role: user.role, business_id: user.business_id } },
                    access_token: 'mock-token',
                    expires_at: Date.now() + 3600000
                };
                return { data: { user: session.user, session }, error: null };
            }
            return { data: null, error: { message: 'Invalid credentials (mock)' } };
        },
        signUp: async ({ email, password, options }) => {
            const newUser = {
                email,
                full_name: options?.data?.full_name,
                role: options?.data?.role || 'owner',
                business_id: options?.data?.business_id || null,
                business_name: options?.data?.business_name,
                business_type: options?.data?.business_type
            };
            // We don't insert into profiles here, authService does that. 
            // We just return a mock user object.
            const userId = uuidv4();
            const session = { 
                user: { id: userId, email, user_metadata: { ...options?.data } }, 
                access_token: 'mock-token' 
            };
            return { data: { user: session.user, session }, error: null };
        },
        signOut: async () => {
            return { error: null };
        },
        getSession: async () => {
            return { data: { session: null }, error: null };
        },
        onAuthStateChange: (callback) => {
            return { data: { subscription: { unsubscribe: () => {} } } };
        },
        resetPasswordForEmail: async (email) => {
            return { data: {}, error: null };
        },
        updateUser: async (attributes) => {
            return { data: { user: {} }, error: null };
        },
        setSession: (newSession) => {}
    },
    storage: {
        from: () => ({
            upload: async () => ({ data: { path: 'mock-path' }, error: null }),
            getPublicUrl: () => ({ data: { publicUrl: 'https://placehold.co/400' } })
        })
    },
    channel: () => ({
        on: () => ({ subscribe: () => {} }),
        subscribe: () => {}
    }),
    removeChannel: () => {}
};

// Helper for uuid generation in mock auth
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const supabase = mockClient;
export const isMock = true;
