// Supabase Storage — direct REST API (no SDK required)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET;

/**
 * Uploads a File object to Supabase Storage and returns its public URL.
 * The bucket "productos" must be public in the Supabase dashboard.
 */
export const uploadProductImage = async (file) => {
    if (!file) throw new Error('No file provided');

    // Generate a unique path: products/timestamp-random.ext
    const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
    const path = `productos/${uniqueName}`;

    const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': file.type || 'image/jpeg',
                'x-upsert': 'true',
            },
            body: file,
        }
    );

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Upload failed: ${res.status}`);
    }

    // Return the public URL
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
};

/**
 * Deletes an image from Supabase Storage given its full public URL.
 */
export const deleteProductImage = async (url) => {
    try {
        // Extract the path from the URL
        const marker = `/object/public/${BUCKET}/`;
        const idx = url.indexOf(marker);
        if (idx === -1) return;
        const path = url.slice(idx + marker.length);

        await fetch(
            `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`,
            {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
            }
        );
    } catch {
        // Silent fail — main concern is saving the new URL, not cleaning up orphans
    }
};

/**
 * Parse stored imagen_url field (can be a JSON array or a plain string/null)
 */
export const parseImagenes = (imagen_url) => {
    if (!imagen_url) return [];
    try {
        const parsed = JSON.parse(imagen_url);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
        return [imagen_url]; // Legacy: plain string URL
    }
};

/**
 * Stringify an array of URLs into the stored JSON format
 */
export const serializeImagenes = (urls) => {
    const valid = (urls || []).filter(Boolean);
    if (valid.length === 0) return null;
    return JSON.stringify(valid);
};
