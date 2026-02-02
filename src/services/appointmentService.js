import { supabase } from '@/lib/customSupabaseClient';

export const appointmentService = {
    async getAppointments(businessId, options = {}) {
        let query = supabase
            .from('appointments')
            .select(`
        *,
        customer:customers(id, name, email, phone),
        service:services(id, name, duration, price),
        staff:profiles(id, full_name)
      `)
            .eq('business_id', businessId)
            .order('appointment_date', { ascending: true });

        if (options.startDate) {
            query = query.gte('appointment_date', options.startDate);
        }

        if (options.endDate) {
            query = query.lte('appointment_date', options.endDate);
        }

        if (options.status) {
            query = query.eq('status', options.status);
        }

        const { data, error } = await query;
        return { data, error };
    },

    async createAppointment(businessId, appointmentData) {
        const { data, error } = await supabase
            .from('appointments')
            .insert({
                ...appointmentData,
                business_id: businessId,
                status: appointmentData.status || 'scheduled'
            })
            .select()
            .single();

        return { data, error };
    },

    async updateAppointment(appointmentId, businessId, appointmentData) {
        const { data, error } = await supabase
            .from('appointments')
            .update(appointmentData)
            .eq('id', appointmentId)
            .eq('business_id', businessId)
            .select()
            .single();

        return { data, error };
    },

    async cancelAppointment(appointmentId, businessId) {
        const { data, error } = await supabase
            .from('appointments')
            .update({ status: 'cancelled' })
            .eq('id', appointmentId)
            .eq('business_id', businessId)
            .select()
            .single();

        return { data, error };
    },

    async deleteAppointment(appointmentId, businessId) {
        const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('id', appointmentId)
            .eq('business_id', businessId);

        return { error };
    },

    async checkAvailability(businessId, staffId, appointmentDate, duration) {
        // Check for overlapping appointments
        const startTime = new Date(appointmentDate);
        const endTime = new Date(startTime.getTime() + duration * 60000);

        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('business_id', businessId)
            .eq('staff_id', staffId)
            .neq('status', 'cancelled')
            .or(`and(appointment_date.lte.${endTime.toISOString()},appointment_end.gte.${startTime.toISOString()})`);

        if (error) return { available: false, error };
        return { available: data.length === 0, conflicts: data };
    }
};
