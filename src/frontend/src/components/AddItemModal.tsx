import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ExternalBlob } from '@/backend';
import { Upload, X, AlertCircle, WifiOff, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: 'buy' | 'rent' | 'lost' | 'found';
  onSubmit: (data: ItemFormData) => Promise<void>;
}

export interface ItemFormData {
  title: string;
  description: string;
  price?: number;
  dailyPrice?: number;
  condition?: string;
  category?: string;
  location?: string;
  images: Uint8Array[];
  storageBlobs: ExternalBlob[];
}

const categories = ['Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Other'];
const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

export default function AddItemModal({ open, onOpenChange, section, onSubmit }: AddItemModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [dailyPrice, setDailyPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'auth' | 'network' | 'validation' | 'server' | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
      setError(null);
      setErrorType(null);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const categorizeError = (errorMessage: string): 'auth' | 'network' | 'validation' | 'server' => {
    const lowerMessage = errorMessage.toLowerCase();
    
    if (lowerMessage.includes('logged in') || 
        lowerMessage.includes('unauthorized') || 
        lowerMessage.includes('authentication') ||
        lowerMessage.includes('valid university email required') ||
        lowerMessage.includes('profile')) {
      return 'auth';
    }
    if (lowerMessage.includes('connection') || 
        lowerMessage.includes('network') || 
        lowerMessage.includes('timeout') ||
        lowerMessage.includes('actor not available')) {
      return 'network';
    }
    if (lowerMessage.includes('required') || lowerMessage.includes('invalid')) {
      return 'validation';
    }
    return 'server';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setErrorType(null);

    try {
      const imageArrays: Uint8Array[] = [];
      const storageBlobs: ExternalBlob[] = [];

      // Process images only if they exist
      if (images.length > 0) {
        for (const file of images) {
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          imageArrays.push(uint8Array);
          storageBlobs.push(ExternalBlob.fromBytes(uint8Array));
        }
      }

      await onSubmit({
        title,
        description,
        price: price ? Number(price) : undefined,
        dailyPrice: dailyPrice ? Number(dailyPrice) : undefined,
        condition: condition || undefined,
        category: category || undefined,
        location: location || undefined,
        images: imageArrays,
        storageBlobs,
      });

      toast.success('Item added successfully!', {
        description: 'Your item has been posted and is now visible to others.',
      });
      onOpenChange(false);
      resetForm();
      setRetryCount(0);
    } catch (error: any) {
      console.error('Error adding item:', error);
      
      const errorMessage = error?.message || 'Failed to add item';
      const type = categorizeError(errorMessage);
      
      setError(errorMessage);
      setErrorType(type);
      setRetryCount(prev => prev + 1);

      // Show appropriate toast based on error type
      if (type === 'auth') {
        toast.error('Authentication Required', {
          description: 'Please ensure you are logged in with a valid university profile.',
        });
      } else if (type === 'network') {
        toast.error('Connection Issue', {
          description: 'Please check your connection and try again.',
        });
      } else if (type === 'validation') {
        toast.error('Validation Error', {
          description: errorMessage,
        });
      } else {
        toast.error('Failed to Add Item', {
          description: 'An error occurred. Please try again.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setDailyPrice('');
    setCondition('');
    setCategory('');
    setLocation('');
    setImages([]);
    setError(null);
    setErrorType(null);
    setRetryCount(0);
  };

  const showPrice = section === 'buy';
  const showDailyPrice = section === 'rent';
  const showCondition = section === 'buy' || section === 'rent';
  const showCategory = section === 'buy' || section === 'rent';
  const showLocation = section === 'lost' || section === 'found';

  const getErrorIcon = () => {
    if (errorType === 'network') return <WifiOff className="h-4 w-4" />;
    if (errorType === 'auth') return <AlertCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const getErrorTitle = () => {
    if (errorType === 'auth') return 'Authentication Required';
    if (errorType === 'network') return 'Connection Issue';
    if (errorType === 'validation') return 'Validation Error';
    return 'Error';
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        resetForm();
      }
    }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-lg border border-border/50 bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-light">
            {section === 'buy' && 'Post Item for Sale'}
            {section === 'rent' && 'List Item for Rent'}
            {section === 'lost' && 'Report Lost Item'}
            {section === 'found' && 'Report Found Item'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            {getErrorIcon()}
            <AlertDescription className="ml-2 font-light">
              <div className="font-medium">{getErrorTitle()}</div>
              <div className="mt-1 text-sm">{error}</div>
              {retryCount > 0 && (
                <div className="mt-1 text-xs opacity-80">
                  Retry attempt {retryCount}
                </div>
              )}
              {errorType === 'network' && (
                <div className="mt-2 text-xs opacity-80">
                  The Internet Computer network may be experiencing delays. Your request will be retried automatically.
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-light">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Item title"
              className="h-10 rounded-lg border-border/50 font-light"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-light">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item..."
              rows={4}
              className="rounded-lg border-border/50 font-light"
              required
              disabled={isSubmitting}
            />
          </div>

          {showPrice && (
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-light">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                min="0"
                className="h-10 rounded-lg border-border/50 font-light"
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          {showDailyPrice && (
            <div className="space-y-2">
              <Label htmlFor="dailyPrice" className="text-sm font-light">Daily Price (₹)</Label>
              <Input
                id="dailyPrice"
                type="number"
                value={dailyPrice}
                onChange={(e) => setDailyPrice(e.target.value)}
                placeholder="0"
                min="0"
                className="h-10 rounded-lg border-border/50 font-light"
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          {showCondition && (
            <div className="space-y-2">
              <Label htmlFor="condition" className="text-sm font-light">Condition</Label>
              <Select value={condition} onValueChange={setCondition} required disabled={isSubmitting}>
                <SelectTrigger className="h-10 rounded-lg border-border/50 font-light">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((c) => (
                    <SelectItem key={c} value={c} className="font-light">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showCategory && (
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-light">Category</Label>
              <Select value={category} onValueChange={setCategory} required disabled={isSubmitting}>
                <SelectTrigger className="h-10 rounded-lg border-border/50 font-light">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c} className="font-light">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showLocation && (
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-light">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where was it lost/found?"
                className="h-10 rounded-lg border-border/50 font-light"
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="images" className="text-sm font-light">Images (Optional)</Label>
            <div className="flex items-center gap-2">
              <label 
                htmlFor="images" 
                className={`flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border/50 bg-accent transition-opacity-smooth hover:opacity-60 ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}
              >
                <Upload className="h-4 w-4" />
                <span className="text-sm font-light">Upload Images</span>
              </label>
              <Input 
                id="images" 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleImageChange}
                className="hidden"
                disabled={isSubmitting}
              />
            </div>
            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {images.map((file, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`Preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground shadow-minimal transition-opacity-smooth hover:opacity-80"
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full rounded-full py-5 text-sm font-light transition-opacity-smooth hover:opacity-80" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {retryCount > 0 ? `Retrying (${retryCount})...` : 'Adding...'}
              </>
            ) : error ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </>
            ) : (
              'Add Item'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
