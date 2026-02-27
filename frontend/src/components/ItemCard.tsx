import { useNavigate } from '@tanstack/react-router';
import { Trash2, MessageCircle } from 'lucide-react';
import type { ExternalBlob } from '../backend';

interface ItemCardProps {
  id?: bigint;
  title: string;
  price?: number | bigint;
  dailyPrice?: number | bigint;
  condition?: string;
  category?: string;
  imageUrl?: string;
  image?: Uint8Array;
  images?: Uint8Array[];
  storageBlobs?: ExternalBlob[];
  description?: string;
  whatsappNumber?: string;
  status?: string;
  isOwner?: boolean;
  showDelete?: boolean;
  showActions?: boolean;
  itemType?: 'buy' | 'sell' | 'rent' | 'lost-found';
  onDelete?: () => void;
}

function getImageSrc(props: ItemCardProps): string | null {
  if (props.storageBlobs && props.storageBlobs.length > 0) {
    return props.storageBlobs[0].getDirectURL();
  }
  if (props.images && props.images.length > 0) {
    const blob = new Blob([new Uint8Array(props.images[0])], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  }
  if (props.image && props.image.length > 0) {
    const blob = new Blob([new Uint8Array(props.image)], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  }
  if (props.imageUrl) return props.imageUrl;
  return null;
}

export default function ItemCard(props: ItemCardProps) {
  const navigate = useNavigate();
  const { id, title, price, dailyPrice, condition, category, whatsappNumber, status, isOwner, showDelete, onDelete, itemType } = props;

  const imageSrc = getImageSrc(props);
  const displayPrice = price !== undefined ? price : dailyPrice;
  const priceLabel = dailyPrice !== undefined && price === undefined ? '/day' : '';

  const handleClick = () => {
    if (id !== undefined) {
      navigate({ to: '/item/$id', params: { id: `${itemType || 'buy'}-${id.toString()}` } });
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=Hi, I'm interested in your listing: ${title}`, '_blank');
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-card border border-border rounded-lg overflow-hidden marketplace-shadow card-hover ${id !== undefined ? 'cursor-pointer' : ''}`}
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {imageSrc ? (
          <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No Image
          </div>
        )}
        {status && (
          <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
            status === 'lost' ? 'bg-destructive text-destructive-foreground' :
            status === 'found' ? 'bg-green-600 text-white' :
            'bg-muted text-muted-foreground'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">{title}</h3>
        {displayPrice !== undefined && (
          <p className="text-primary font-bold text-base">
            ₹{Number(displayPrice).toLocaleString('en-IN')}{priceLabel}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {condition && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{condition}</span>
          )}
          {category && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{category}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          {whatsappNumber && (
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1 text-xs bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="h-3 w-3" />
              WhatsApp
            </button>
          )}
          {(isOwner || showDelete) && onDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded-md hover:opacity-90 transition-opacity ml-auto"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
