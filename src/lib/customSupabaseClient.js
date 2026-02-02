import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dwjdkwhnqmjwfevklrat.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3amRrd2hucW1qd2ZldmtscmF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTUzMDUsImV4cCI6MjA4NTA5MTMwNX0.Ob4uTjm9gS26F1Z1E5d-84s5g8tYzP6Z1fCez4nI25c';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
