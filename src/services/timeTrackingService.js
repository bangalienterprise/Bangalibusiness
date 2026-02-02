import { supabase } from '@/lib/customSupabaseClient';

export const timeTrackingService = {
    async getTimeEntries(businessId, userId = null) {
        let query = supabase
            .from('time_entries')
            .select(`
        *,
        user:profiles(id, full_name, email),
        project:projects(id, name)
      `)
            .eq('business_id', businessId)
            .order('start_time', { ascending: false });

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;
        return { data, error };
    },

    async createTimeEntry(businessId, entryData) {
        const { data, error } = await supabase
            .from('time_entries')
            .insert({
                ...entryData,
                business_id: businessId
            })
            .select()
            .single();

        return { data, error };
    },

    async updateTimeEntry(entryId, businessId, entryData) {
        const { data, error } = await supabase
            .from('time_entries')
            .update(entryData)
            .eq('id', entryId)
            .eq('business_id', businessId)
            .select()
            .single();

        return { data, error };
    },

    async deleteTimeEntry(entryId, businessId) {
        const { error } = await supabase
            .from('time_entries')
            .delete()
            .eq('id', entryId)
            .eq('business_id', businessId);

        return { error };
    },

    async startTimer(businessId, userId, projectId, description) {
        const { data, error } = await supabase
            .from('time_entries')
            .insert({
                business_id: businessId,
                user_id: userId,
                project_id: projectId,
                description,
                start_time: new Date().toISOString(),
                is_running: true
            })
            .select()
            .single();

        return { data, error };
    },

    async stopTimer(entryId, businessId) {
        const { data, error } = await supabase
            .from('time_entries')
            .update({
                end_time: new Date().toISOString(),
                is_running: false
            })
            .eq('id', entryId)
            .eq('business_id', businessId)
            .select()
            .single();

        return { data, error };
    },

    async getActiveTimer(userId, businessId) {
        const { data, error } = await supabase
            .from('time_entries')
            .select('*')
            .eq('user_id', userId)
            .eq('business_id', businessId)
            .eq('is_running', true)
            .maybeSingle();

        return { data, error };
    },

    calculateDuration(startTime, endTime) {
        const start = new Date(startTime);
        const end = endTime ? new Date(endTime) : new Date();
        return Math.floor((end - start) / 1000 / 60); // Duration in minutes
    }
};
