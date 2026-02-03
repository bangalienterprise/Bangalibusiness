// S3 Compatibility Layer for Supabase Storage
// Use this if you need to access storage via standard S3 tools or libraries
// Endpoint: https://dwjdkwhnqmjwfevklrat.storage.supabase.co/storage/v1/s3

const S3_CONFIG = {
    endpoint: "https://dwjdkwhnqmjwfevklrat.storage.supabase.co/storage/v1/s3",
    region: "global", // Supabase S3 is region-agnostic/global
    credentials: {
        accessKeyId: "1cbf4d92d2977fc11424ff4804223ca5", // Provided Access Key
        secretAccessKey: import.meta.env.VITE_SUPABASE_SERVICE_KEY // Use Service Key as Secret
    }
};

export default S3_CONFIG;
