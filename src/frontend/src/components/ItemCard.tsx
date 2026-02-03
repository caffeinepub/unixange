import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, MessageCircle, Trash2 } from 'lucide-react';

interface ItemCardProps {
  title: string;
  description: string;
  price?: bigint;
  dailyPrice?: bigint;
  condition?: string;
  category?: string;
  location?: string;
  status?: string;
  image?: Uint8Array;
  imageUrl?: string;
  showActions?: boolean;
  showDelete?: boolean;
  onMessageSeller?: () => void;
  onDelete?: () => void;
}

export default function ItemCard({
  title,
  description,
  price,
  dailyPrice,
  condition,
  category,
  location,
  status,
  image,
  imageUrl,
  showActions = false,
  showDelete = false,
  onMessageSeller,
  onDelete,
}: ItemCardProps) {
  const displayImage = imageUrl || (image ? URL.createObjectURL(new Blob([new Uint8Array(image)])) : null);

  return (
    <Card className="group overflow-hidden rounded-lg border-2 border-border bg-card shadow-marketplace transition-marketplace hover:border-primary/50 hover:shadow-marketplace-hover hover-marketplace">
      {displayImage && (
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <img 
            src={displayImage} 
            alt={title} 
            className="h-full w-full object-cover transition-marketplace group-hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="line-clamp-2 text-base font-semibold leading-snug">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-3 px-4">
        {(price !== undefined || dailyPrice !== undefined) && (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">
              ₹{price !== undefined ? Number(price).toLocaleString() : Number(dailyPrice).toLocaleString()}
            </span>
            {dailyPrice !== undefined && (
              <span className="text-sm font-medium text-muted-foreground">/day</span>
            )}
          </div>
        )}
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {condition && (
            <Badge variant="outline" className="rounded-md border-border px-2 py-0.5 text-xs font-medium">
              {condition}
            </Badge>
          )}
          {category && (
            <Badge variant="outline" className="rounded-md border-border px-2 py-0.5 text-xs font-medium">
              {category}
            </Badge>
          )}
          {location && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {location}
            </span>
          )}
          {status && (
            <Badge 
              variant={status === 'recovered' ? 'default' : 'outline'} 
              className="rounded-md px-2 py-0.5 text-xs font-medium"
            >
              {status}
            </Badge>
          )}
        </div>
      </CardContent>
      {(showActions || showDelete) && (
        <CardFooter className="pt-0 pb-4 px-4 flex gap-2">
          {showActions && (
            <Button 
              onClick={onMessageSeller}
              variant="default" 
              size="sm" 
              className="flex-1 rounded-md font-semibold transition-marketplace"
            >
              Contact
            </Button>
          )}
          {showDelete && (
            <Button 
              onClick={onDelete}
              variant="outline" 
              size="sm" 
              className="rounded-md border-2 border-destructive font-semibold text-destructive transition-marketplace hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
