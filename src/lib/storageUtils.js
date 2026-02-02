import { supabase } from '@/lib/supabase';

/**
 * Uploads a file to Supabase Storage (S3 compatible)
 * @param {File} file - The file object to upload
 * @param {string} bucket - The bucket name (default: 'bangali-enterprise-assets')
 * @param {string} path - Optional path/folder structure
 * @returns {Promise<{url: string, error: Error}>}
 */
export const uploadFile = async (file, bucket = 'bangali-enterprise-assets', path = '') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { url: null, error };
  }
};

/**
 * Deletes a file from Supabase Storage
 * @param {string} path - The file path in the bucket
 * @param {string} bucket - The bucket name
 */
export const deleteFile = async (path, bucket = 'bangali-enterprise-assets') => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  return { error };
};