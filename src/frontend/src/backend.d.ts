import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface MinimalItem {
    id: ItemId;
    title: string;
    itemType: Variant_rent_lostFound_buySell;
    image: Uint8Array;
    dailyPrice?: Rupee;
    price?: Rupee;
}
export type UserId = Principal;
export interface LostFoundItem {
    id: ItemId;
    status: string;
    title: string;
    ownerId: UserId;
    storageBlobs: Array<ExternalBlob>;
    description: string;
    location: string;
    images: Array<Uint8Array>;
}
export interface BuySellItem {
    id: ItemId;
    title: string;
    storageBlobs: Array<ExternalBlob>;
    description: string;
    category: string;
    sellerId: UserId;
    price: Rupee;
    isFromSellSection: boolean;
    condition: string;
    images: Array<Uint8Array>;
}
export type ItemId = bigint;
export interface RentalItem {
    id: ItemId;
    title: string;
    ownerId: UserId;
    storageBlobs: Array<ExternalBlob>;
    description: string;
    available: boolean;
    category: string;
    dailyPrice: Rupee;
    condition: string;
    images: Array<Uint8Array>;
}
export type Rupee = bigint;
export interface UserProfile {
    name: string;
    email: string;
    university: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_found_lost_rent_buySell {
    found = "found",
    lost = "lost",
    rent = "rent",
    buySell = "buySell"
}
export enum Variant_rent_lostFound_buySell {
    rent = "rent",
    lostFound = "lostFound",
    buySell = "buySell"
}
export interface backendInterface {
    addBuySellItem(title: string, description: string, price: Rupee, condition: string, category: string, images: Array<Uint8Array>, storageBlobs: Array<ExternalBlob>, isFromSellSection: boolean): Promise<void>;
    addItem(section: Variant_found_lost_rent_buySell, title: string, description: string, price: Rupee | null, dailyPrice: Rupee | null, condition: string | null, category: string | null, location: string | null, images: Array<Uint8Array>, storageBlobs: Array<ExternalBlob>): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createUserProfile(profile: UserProfile): Promise<void>;
    deleteItem(itemId: ItemId): Promise<void>;
    deleteLostFoundItem(itemId: ItemId): Promise<void>;
    filterBuySellItemsByCategory(category: string): Promise<Array<BuySellItem>>;
    filterBuySellItemsByPriceRange(minPrice: Rupee, maxPrice: Rupee): Promise<Array<BuySellItem>>;
    getBuySellItem(itemId: ItemId): Promise<BuySellItem | null>;
    getBuySellItems(): Promise<Array<BuySellItem>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLostFoundItem(itemId: ItemId): Promise<LostFoundItem | null>;
    getLostFoundItems(): Promise<Array<LostFoundItem>>;
    getRentalItem(itemId: ItemId): Promise<RentalItem | null>;
    getRentalItems(): Promise<Array<RentalItem>>;
    getUserProfile(user: UserId): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listForRent(title: string, description: string, dailyPrice: Rupee, condition: string, category: string, images: Array<Uint8Array>, storageBlobs: Array<ExternalBlob>): Promise<void>;
    markAsRecovered(itemId: ItemId): Promise<void>;
    postFoundItem(title: string, description: string, location: string, images: Array<Uint8Array>, storageBlobs: Array<ExternalBlob>): Promise<void>;
    postLostItem(title: string, description: string, location: string, images: Array<Uint8Array>, storageBlobs: Array<ExternalBlob>): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toMinimalItemList(): Promise<Array<MinimalItem>>;
}
