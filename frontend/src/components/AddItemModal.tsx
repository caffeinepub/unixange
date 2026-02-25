import React, { useState, useRef } from 'react';
import { X, Upload, AlertCircle, Loader2, ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAddBuySellItem, useListForRent, usePostLostItem, usePostFoundItem } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';

type Section = 'buySell' | 'rental' | 'lost' | 'found';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: Section;
}

const CATEGORIES = ['Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Stationery', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

export default function AddItemModal({ isOpen, onClose, section }: AddItemModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [dailyPrice, setDailyPrice] = useState('');
  const [condition, setCondition] = useState('Good');
  const [category, setCategory] = useState('Other');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addBuySellItem = useAddBuySellItem();
  const listForRent = useListForRent();
  const postLostItem = usePostLostItem();
  const postFoundItem = usePostFoundItem();

  const getMutation = () => {
    switch (section) {
      case 'buySell': return addBuySellItem;
      case 'rental': return listForRent;
      case 'lost': return postLostItem;
      case 'found': return postFoundItem;
    }
  };

  const mutation = getMutation();
  const isLoading = mutation.isPending;
  const error = mutation.error as Error | null;

  const getTitle = () => {
    switch (section) {
      case 'buySell': return 'Post Item for Sale';
      case 'rental': return 'List Item for Rent';
      case 'lost': return 'Report Lost Item';
      case 'found': return 'Report Found Item';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 5));
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const imageArrays: Uint8Array[] = [];
    const storageBlobs: ExternalBlob[] = [];

    for (const file of images) {
      if (file.size > 500 * 1024) {
        const buffer = await file.arrayBuffer();
        const blob = ExternalBlob.fromBytes(new Uint8Array(buffer)).withUploadProgress((pct) => {
          setUploadProgress(pct);
        });
        storageBlobs.push(blob);
      } else {
        const buffer = await file.arrayBuffer();
        imageArrays.push(new Uint8Array(buffer));
      }
    }

    try {
      if (section === 'buySell') {
        await addBuySellItem.mutateAsync({
          title,
          description,
          price: BigInt(Math.round(parseFloat(price) || 0)),
          condition,
          category,
          images: imageArrays,
          storageBlobs,
          isFromSellSection: true,
        });
      } else if (section === 'rental') {
        await listForRent.mutateAsync({
          title,
          description,
          dailyPrice: BigInt(Math.round(parseFloat(dailyPrice) || 0)),
          condition,
          category,
          images: imageArrays,
          storageBlobs,
        });
      } else if (section === 'lost') {
        await postLostItem.mutateAsync({
          title,
          description,
          location,
          images: imageArrays,
          storageBlobs,
        });
      } else if (section === 'found') {
        await postFoundItem.mutateAsync({
          title,
          description,
          location,
          images: imageArrays,
          storageBlobs,
        });
      }

      handleClose();
    } catch {
      // error handled by mutation state
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setDailyPrice('');
    setCondition('Good');
    setCategory('Other');
    setLocation('');
    setImages([]);
    setUploadProgress(0);
    mutation.reset();
    onClose();
  };

  const getErrorMessage = (err: Error | null): string => {
    if (!err) return '';
    const msg = err.message || '';
    if (msg.includes('Unauthorized') || msg.includes('authentication')) {
      return 'You must be logged in with a valid university account to post items.';
    }
    if (msg.includes('university email') || msg.includes('campus membership')) {
      return 'A valid @jainuniversity.ac.in email is required to post items.';
    }
    if (msg.includes('network') || msg.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    return 'Failed to post item. Please try again.';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{getTitle()}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the details below to {section === 'buySell' ? 'list your item for sale' : section === 'rental' ? 'list your item for rent' : section === 'lost' ? 'report a lost item' : 'report a found item'}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter item title"
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Describe the item..."
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Price fields */}
          {section === 'buySell' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Price (₹) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                placeholder="0"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
              />
            </div>
          )}

          {section === 'rental' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Daily Price (₹) *</label>
              <input
                type="number"
                value={dailyPrice}
                onChange={(e) => setDailyPrice(e.target.value)}
                required
                min="0"
                placeholder="0"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
              />
            </div>
          )}

          {/* Location for lost/found */}
          {(section === 'lost' || section === 'found') && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Location *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="Where was it lost/found?"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
              />
            </div>
          )}

          {/* Condition & Category */}
          {(section === 'buySell' || section === 'rental') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Images <span className="text-muted-foreground font-normal">(up to 5)</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
            >
              <ImageIcon className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Click to upload images</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />

            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((file, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${i}`}
                      className="h-16 w-16 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Uploading... {uploadProgress}%</p>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-accent transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Posting...' : 'Post Item'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
