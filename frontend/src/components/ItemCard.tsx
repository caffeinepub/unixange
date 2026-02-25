import React, { useState, useEffect } from 'react';
import { Tag, Clock, MapPin, Trash2, Phone, Package } from 'lucide-react';
import type { BuySellItem, RentalItem, LostFoundItem } from '../backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import DeleteConfirmationModal from './DeleteConfirmationModal';

type ItemCardProps =
  | { type: 'buySell'; item: BuySellItem; onDelete?: () => void }
  | { type: 'rental'; item: RentalItem; onDelete?: () => void }
  | { type: 'lostFound'; item: LostFoundItem; onDelete?: () => void; onMarkRecovered?: () => void };

function useItemImage(images: Uint8Array[], storageBlobs: { getDirectURL: () => string }[]) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (storageBlobs && storageBlobs.length > 0) {
      setImageUrl(storageBlobs[0].getDirectURL());
      return;
    }
    if (images && images.length > 0 && images[0].length > 1) {
      const blob = new Blob([new Uint8Array(images[0])], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [images, storageBlobs]);

  return imageUrl;
}

export default function ItemCard(props: ItemCardProps) {
  const { identity } = useInternetIdentity();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const item = props.item;
  const imageUrl = useItemImage(
    item.images,
    item.storageBlobs as { getDirectURL: () => string }[]
  );

  // Narrow ownership check by type to avoid union type errors
  const isOwner = (() => {
    if (!identity) return false;
    const principal = identity.getPrincipal().toString();
    if (props.type === 'buySell') {
      return props.item.sellerId?.toString() === principal;
    }
    if (props.type === 'rental') {
      return props.item.ownerId?.toString() === principal;
    }
    if (props.type === 'lostFound') {
      return props.item.ownerId?.toString() === principal;
    }
    return false;
  })();

  const formatPrice = (price: bigint) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lost': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'found': return 'bg-success/10 text-success border-success/20';
      case 'recovered': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <>
      <div className="bg-card border-2 border-border rounded-xl overflow-hidden shadow-card hover:shadow-marketplace-hover hover:border-primary transition-all duration-200 hover:scale-[1.01] flex flex-col">
        {/* Image */}
        <div className="relative h-44 bg-muted overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}

          {/* Type badge */}
          {props.type === 'lostFound' && (
            <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full border ${getStatusColor((item as LostFoundItem).status)}`}>
              {(item as LostFoundItem).status.charAt(0).toUpperCase() + (item as LostFoundItem).status.slice(1)}
            </span>
          )}

          {props.type === 'rental' && (
            <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full border ${
              (item as RentalItem).available
                ? 'bg-success/10 text-success border-success/20'
                : 'bg-muted text-muted-foreground border-border'
            }`}>
              {(item as RentalItem).available ? 'Available' : 'Rented'}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-semibold text-foreground text-sm leading-tight mb-1 line-clamp-2">
            {item.title}
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">
            {item.description}
          </p>

          {/* Price / Info */}
          <div className="mt-auto">
            {props.type === 'buySell' && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold" style={{ color: 'var(--price-color)' }}>
                  {formatPrice(props.item.price)}
                </span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {props.item.condition}
                </span>
              </div>
            )}

            {props.type === 'rental' && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold" style={{ color: 'var(--price-color)' }}>
                  {formatPrice(props.item.dailyPrice)}<span className="text-xs font-normal text-muted-foreground">/day</span>
                </span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {props.item.condition}
                </span>
              </div>
            )}

            {props.type === 'lostFound' && (
              <div className="flex items-center gap-1 mb-2">
                <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">
                  {props.item.location}
                </span>
              </div>
            )}

            {/* Category */}
            {(props.type === 'buySell' || props.type === 'rental') && (
              <div className="flex items-center gap-1 mb-2">
                <Tag className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {props.type === 'buySell' ? props.item.category : props.item.category}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-1">
              {isOwner ? (
                <>
                  {props.type === 'lostFound' && props.item.status !== 'recovered' && props.onMarkRecovered && (
                    <button
                      onClick={props.onMarkRecovered}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium bg-success/10 text-success border border-success/20 rounded-lg hover:bg-success/20 transition-colors"
                    >
                      <Clock className="h-3 w-3" />
                      Recovered
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </>
              ) : (
                <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                  <Phone className="h-3 w-3" />
                  Contact
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          setDeleteModalOpen(false);
          props.onDelete?.();
        }}
        itemTitle={item.title}
      />
    </>
  );
}
