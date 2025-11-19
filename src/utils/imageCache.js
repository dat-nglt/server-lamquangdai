/**
 * Tạm thời lưu trữ hình ảnh của khách hàng
 * Structure: { [UID]: { imageUrls: [], timestamp: Date } }
 */
const imageCache = new Map();

const CACHE_EXPIRY_TIME = 3600000; // 1 giờ (ms)

export const storeCustomerImage = (UID, imageUrl) => {
    if (!imageCache.has(UID)) {
        imageCache.set(UID, {
            imageUrls: [],
            timestamp: Date.now(),
        });
    }

    const cacheEntry = imageCache.get(UID);
    if (!cacheEntry.imageUrls.includes(imageUrl)) {
        cacheEntry.imageUrls.push(imageUrl);
    }
};

export const getCustomerImages = (UID) => {
    const cacheEntry = imageCache.get(UID);

    if (!cacheEntry) {
        return [];
    }

    // Kiểm tra xem cache có hết hạn không
    if (Date.now() - cacheEntry.timestamp > CACHE_EXPIRY_TIME) {
        imageCache.delete(UID);
        return [];
    }

    return cacheEntry.imageUrls;
};

export const clearCustomerImages = (UID) => {
    imageCache.delete(UID);
};
