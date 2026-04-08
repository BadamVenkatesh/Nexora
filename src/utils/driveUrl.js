/**
 * Converts a Google Drive sharing URL to a direct-embeddable image URL.
 *
 * Supported input formats:
 *   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *   https://drive.google.com/open?id=FILE_ID
 *   https://drive.google.com/uc?id=FILE_ID
 *
 * Output:
 *   https://lh3.googleusercontent.com/d/FILE_ID
 */
export function toDriveImageUrl(url) {
    if (!url || typeof url !== 'string') return url;

    // Already a direct URL or not a Drive link — return as-is
    if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) {
        return url;
    }

    let fileId = null;

    // Format: /file/d/FILE_ID/
    const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match1) fileId = match1[1];

    // Format: ?id=FILE_ID or &id=FILE_ID
    if (!fileId) {
        const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (match2) fileId = match2[1];
    }

    if (fileId) {
        return `https://lh3.googleusercontent.com/d/${fileId}`;
    }

    // Can't parse — return original
    return url;
}
