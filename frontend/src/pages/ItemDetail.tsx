import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ItemCard from '../components/ItemCard';
import {
  useGetBuySellItem,
  useGetRentalItem,
  useGetLostFoundItem,
  useGetBuySellItems,
  useGetRentalItems,
} from '../hooks/useQueries';
import { getRecommendations } from '../utils/aiRecommender';
import { ExternalBlob } from '../backend';
import type { BuySellItem, RentalItem, LostFoundItem } from '../backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  ArrowLeft,
  MapPin,
  Tag,
  Package,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getImageUrl(
  images: Uint8Array[],
  storageBlobs: ExternalBlob[],
  index: number
): string {
  if (storageBlobs && storageBlobs[index]) {
    return storageBlobs[index].getDirectURL();
  }
  if (images && images[index] && images[index].length > 0) {
    const blob = new Blob([new Uint8Array(images[index])], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  }
  return '';
}

function getConditionColor(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes('new')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (c.includes('good') || c.includes('like'))
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  if (c.includes('fair'))
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  return 'bg-muted text-muted-foreground';
}

// ─── Image Gallery ────────────────────────────────────────────────────────────

function ImageGallery({
  images,
  storageBlobs,
  title,
}: {
  images: Uint8Array[];
  storageBlobs: ExternalBlob[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const totalImages = Math.max(images.length, storageBlobs.length);

  if (totalImages === 0) {
    return (
      <div className="w-full aspect-square bg-muted rounded-2xl flex items-center justify-center">
        <Package className="w-16 h-16 text-muted-foreground" />
      </div>
    );
  }

  const currentUrl = getImageUrl(images, storageBlobs, activeIndex);

  return (
    <div className="space-y-3">
      <div className="relative w-full aspect-square bg-muted rounded-2xl overflow-hidden">
        {currentUrl ? (
          <img src={currentUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        {totalImages > 1 && (
          <>
            <button
              onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
              disabled={activeIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow disabled:opacity-30 hover:bg-background transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveIndex((i) => Math.min(totalImages - 1, i + 1))}
              disabled={activeIndex === totalImages - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow disabled:opacity-30 hover:bg-background transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/70 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs text-foreground">
              {activeIndex + 1} / {totalImages}
            </div>
          </>
        )}
      </div>

      {totalImages > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: totalImages }).map((_, i) => {
            const url = getImageUrl(images, storageBlobs, i);
            return (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === activeIndex
                    ? 'border-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {url ? (
                  <img
                    src={url}
                    alt={`${title} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── BuySell Detail ───────────────────────────────────────────────────────────

function BuySellDetail({ item }: { item: BuySellItem }) {
  const { identity } = useInternetIdentity();
  const isOwner =
    identity && item.sellerId.toString() === identity.getPrincipal().toString();
  const { data: allItems = [] } = useGetBuySellItems();
  const similar = getRecommendations(item, allItems as BuySellItem[]);

  const handleWhatsApp = () => {
    if (!item.whatsappNumber) return;
    const msg = encodeURIComponent(
      `Hi! I'm interested in your listing: "${item.title}" on UniXange.`
    );
    window.open(
      `https://wa.me/${item.whatsappNumber.replace(/\D/g, '')}?text=${msg}`,
      '_blank'
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <ImageGallery
            images={item.images}
            storageBlobs={item.storageBlobs}
            title={item.title}
          />
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Tag className="w-3 h-3" />
              {item.category}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}
            >
              {item.condition}
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
            {item.title}
          </h1>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">
              ₹{Number(item.price).toLocaleString('en-IN')}
            </span>
            <span className="text-muted-foreground text-sm">one-time</span>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">About this item</h3>
            <p className="text-muted-foreground leading-relaxed">{item.description}</p>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Seller</p>
              <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                {item.sellerId.toString().slice(0, 20)}...
              </p>
            </div>
          </div>

          {!isOwner && item.whatsappNumber && (
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 text-base rounded-xl font-semibold transition-colors"
            >
              <SiWhatsapp className="w-5 h-5" />
              Chat on WhatsApp
            </button>
          )}
          {isOwner && (
            <div className="p-3 rounded-xl bg-muted text-center text-sm text-muted-foreground">
              This is your listing
            </div>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-xl font-bold text-foreground">Similar Items You May Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {similar.map((s) => (
              <ItemCard
                key={s.id.toString()}
                id={s.id}
                title={s.title}
                price={(s as BuySellItem).price}
                condition={s.condition}
                category={(s as BuySellItem).category}
                images={s.images}
                storageBlobs={s.storageBlobs}
                whatsappNumber={(s as BuySellItem).whatsappNumber}
                itemType="buy"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Rental Detail ────────────────────────────────────────────────────────────

function RentalDetail({ item }: { item: RentalItem }) {
  const { identity } = useInternetIdentity();
  const isOwner =
    identity && item.ownerId.toString() === identity.getPrincipal().toString();
  const { data: allItems = [] } = useGetRentalItems();
  const similar = getRecommendations(item, allItems as RentalItem[]);

  const handleWhatsApp = () => {
    if (!item.whatsappNumber) return;
    const msg = encodeURIComponent(
      `Hi! I'm interested in renting: "${item.title}" on UniXange.`
    );
    window.open(
      `https://wa.me/${item.whatsappNumber.replace(/\D/g, '')}?text=${msg}`,
      '_blank'
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <ImageGallery
            images={item.images}
            storageBlobs={item.storageBlobs}
            title={item.title}
          />
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Tag className="w-3 h-3" />
              {item.category}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}
            >
              {item.condition}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                item.available
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {item.available ? 'Available' : 'Not Available'}
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
            {item.title}
          </h1>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">
              ₹{Number(item.dailyPrice).toLocaleString('en-IN')}
            </span>
            <span className="text-muted-foreground text-sm">/ day</span>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">About this item</h3>
            <p className="text-muted-foreground leading-relaxed">{item.description}</p>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Owner</p>
              <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                {item.ownerId.toString().slice(0, 20)}...
              </p>
            </div>
          </div>

          {!isOwner && item.whatsappNumber && item.available && (
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 text-base rounded-xl font-semibold transition-colors"
            >
              <SiWhatsapp className="w-5 h-5" />
              Chat on WhatsApp
            </button>
          )}
          {isOwner && (
            <div className="p-3 rounded-xl bg-muted text-center text-sm text-muted-foreground">
              This is your listing
            </div>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-xl font-bold text-foreground">Similar Rentals You May Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {similar.map((s) => (
              <ItemCard
                key={s.id.toString()}
                id={s.id}
                title={s.title}
                dailyPrice={(s as RentalItem).dailyPrice}
                condition={s.condition}
                category={(s as RentalItem).category}
                images={s.images}
                storageBlobs={s.storageBlobs}
                whatsappNumber={(s as RentalItem).whatsappNumber}
                itemType="rent"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Lost & Found Detail ──────────────────────────────────────────────────────

function LostFoundDetail({ item }: { item: LostFoundItem }) {
  const { identity } = useInternetIdentity();
  const isOwner =
    identity && item.ownerId.toString() === identity.getPrincipal().toString();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <div>
        <ImageGallery
          images={item.images}
          storageBlobs={item.storageBlobs}
          title={item.title}
        />
      </div>

      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              item.status === 'lost'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : item.status === 'found'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
        </div>

        <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
          {item.title}
        </h1>

        {item.location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{item.location}</span>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Description</h3>
          <p className="text-muted-foreground leading-relaxed">{item.description}</p>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Posted by</p>
            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {item.ownerId.toString().slice(0, 20)}...
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="p-3 rounded-xl bg-muted text-center text-sm text-muted-foreground">
            This is your post
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ItemDetail Page ─────────────────────────────────────────────────────

export default function ItemDetail() {
  // Route param format: "type-id" e.g. "buy-5", "rent-2", "lost-found-3"
  const { id } = useParams({ from: '/item/$id' });
  const navigate = useNavigate();

  // Parse type and numeric id from the combined param
  // Format: "{type}-{numericId}" where type can be "buy", "sell", "rent", "lost-found"
  const lastDashIndex = id.lastIndexOf('-');
  const itemType = lastDashIndex > 0 ? id.slice(0, lastDashIndex) : 'buy';
  const rawId = lastDashIndex > 0 ? id.slice(lastDashIndex + 1) : id;
  const itemId = rawId ? BigInt(rawId) : BigInt(0);

  const isRent = itemType === 'rent';
  const isLostFound = itemType === 'lost-found';
  const isBuySell = !isRent && !isLostFound;

  const { data: buySellItem, isLoading: bsLoading } = useGetBuySellItem(
    isBuySell ? itemId : null
  );
  const { data: rentalItem, isLoading: rentLoading } = useGetRentalItem(
    isRent ? itemId : null
  );
  const { data: lostFoundItem, isLoading: lfLoading } = useGetLostFoundItem(
    isLostFound ? itemId : null
  );

  const isLoading = bsLoading || rentLoading || lfLoading;

  const backPath = isRent ? '/rent' : isLostFound ? '/lost-found' : '/buy';
  const backLabel = isRent ? 'Rentals' : isLostFound ? 'Lost & Found' : 'Buy & Sell';

  const currentTitle =
    buySellItem?.title || rentalItem?.title || lostFoundItem?.title || 'Item';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Back navigation */}
        <nav className="flex items-center gap-2 mb-6 text-sm">
          <button
            onClick={() => navigate({ to: backPath })}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {backLabel}
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {isLoading ? '...' : currentTitle}
          </span>
        </nav>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="w-full aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-10 w-3/4 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        )}

        {/* Not found */}
        {!isLoading && !buySellItem && !rentalItem && !lostFoundItem && (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold">Item not found</p>
            <button
              onClick={() => navigate({ to: backPath })}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Go Back
            </button>
          </div>
        )}

        {/* Item content */}
        {!isLoading && buySellItem && <BuySellDetail item={buySellItem} />}
        {!isLoading && rentalItem && <RentalDetail item={rentalItem} />}
        {!isLoading && lostFoundItem && <LostFoundDetail item={lostFoundItem} />}
      </main>
      <Footer />
    </div>
  );
}
