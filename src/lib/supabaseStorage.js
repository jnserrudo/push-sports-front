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
        if (Array.isArray(imagen_url)) return imagen_url;
        const parsed = JSON.parse(imagen_url);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
        return imagen_url ? [imagen_url] : [];
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

/**
 * Fetch a remote image URL and convert it to a base64 data URI.
 * Required for react-pdf image embedding (avoids CORS issues in Web Worker context).
 * Returns null if the fetch fails.
 */
export const fetchImageAsBase64 = async (url) => {
    if (!url) return null;
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const blob = await res.blob();
        
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                // Fill with white background (in case of transparent PNG/WebP)
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                // Export as JPEG to guarantee @react-pdf/renderer compatibility
                resolve(canvas.toDataURL('image/jpeg', 0.9));
            };
            img.onerror = () => {
                // Fallback to FileReader if Image load fails
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(blob);
            };
            img.src = URL.createObjectURL(blob);
        });
    } catch {
        return null;
    }
};

/**
 * Pre-fetch all product images as base64, returning a map of { id_producto: base64string | null }
 * Call this once before rendering PDFs.
 */
export const prefetchProductImages = async (products) => {
    const entries = await Promise.all(
        products.map(async (p) => {
            const urls = parseImagenes(p.imagen_url).slice(0, 3);
            const base64Array = await Promise.all(urls.map(url => fetchImageAsBase64(url)));
            return [p.id_producto, base64Array.filter(Boolean)];
        })
    );
    return Object.fromEntries(entries);
};
