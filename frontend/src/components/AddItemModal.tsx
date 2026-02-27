import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAddBuySellItem, useListForRent, usePostLostItem, usePostFoundItem } from '../hooks/useQueries';
import { generateDescription } from '../utils/aiDescriptionGenerator';
import { ExternalBlob } from '../backend';
import { Loader2, Sparkles, Upload } from 'lucide-react';

type Section = 'buy' | 'sell' | 'rent' | 'lost' | 'found';

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSection?: Section;
}

const CATEGORIES = ['Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Stationery', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

export default function AddItemModal({ open, onOpenChange, defaultSection = 'buy' }: AddItemModalProps) {
  const [section, setSection] = useState<Section>(defaultSection);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [dailyPrice, setDailyPrice] = useState('');
  const [condition, setCondition] = useState('Good');
  const [category, setCategory] = useState('Electronics');
  const [location, setLocation] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addBuySell = useAddBuySellItem();
  const listForRent = useListForRent();
  const postLost = usePostLostItem();
  const postFound = usePostFoundItem();

  const isSubmitting = addBuySell.isPending || listForRent.isPending || postLost.isPending || postFound.isPending;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerateDescription = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateDescription({
        title,
        category: category.toLowerCase(),
        condition: condition.toLowerCase(),
        listingType: section === 'buy' || section === 'sell' ? 'sell' : section,
      });
      setDescription(generated);
      setIsGenerating(false);
    }, 600);
  };

  const resetForm = () => {
    setTitle(''); setDescription(''); setPrice(''); setDailyPrice('');
    setCondition('Good'); setCategory('Electronics'); setLocation('');
    setWhatsapp(''); setImageFile(null); setImagePreview(null);
    setUploadProgress(0); setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      let images: Uint8Array[] = [];
      let storageBlobs: ExternalBlob[] = [];

      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        if (bytes.length > 1_900_000) {
          // Use blob storage for large files
          const blob = ExternalBlob.fromBytes(bytes).withUploadProgress(p => setUploadProgress(p));
          storageBlobs = [blob];
        } else {
          images = [bytes];
        }
      }

      if (section === 'buy' || section === 'sell') {
        await addBuySell.mutateAsync({
          title, description,
          price: BigInt(Math.round(parseFloat(price) || 0)),
          condition, category, images, storageBlobs,
          isFromSellSection: section === 'sell',
          whatsappNumber: whatsapp,
        });
      } else if (section === 'rent') {
        await listForRent.mutateAsync({
          title, description,
          dailyPrice: BigInt(Math.round(parseFloat(dailyPrice) || 0)),
          condition, category, images, storageBlobs,
          whatsappNumber: whatsapp,
        });
      } else if (section === 'lost') {
        await postLost.mutateAsync({ title, description, location, images, storageBlobs });
      } else if (section === 'found') {
        await postFound.mutateAsync({ title, description, location, images, storageBlobs });
      }

      resetForm();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to post item. Please try again.');
    }
  };

  const showPrice = section === 'buy' || section === 'sell';
  const showDailyPrice = section === 'rent';
  const showLocation = section === 'lost' || section === 'found';
  const showConditionCategory = section !== 'lost' && section !== 'found';
  const showWhatsapp = section !== 'lost' && section !== 'found';

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">Post a Listing</DialogTitle>
        </DialogHeader>

        {/* Section Tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 mb-2">
          {(['buy', 'sell', 'rent', 'lost', 'found'] as Section[]).map(s => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                section === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="What are you listing?"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-foreground">Description</label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGenerating || !title}
                className="flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-opacity disabled:opacity-40"
              >
                {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                AI Generate
              </button>
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe your item..."
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
            />
          </div>

          {/* Condition & Category */}
          {showConditionCategory && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                >
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Price */}
          {showPrice && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Price (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                  min="0"
                  placeholder="0"
                  className="w-full pl-7 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
            </div>
          )}

          {/* Daily Price */}
          {showDailyPrice && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Daily Price (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                <input
                  type="number"
                  value={dailyPrice}
                  onChange={e => setDailyPrice(e.target.value)}
                  required
                  min="0"
                  placeholder="0"
                  className="w-full pl-7 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
            </div>
          )}

          {/* Location */}
          {showLocation && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Location *</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
                placeholder="Where was it lost/found?"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
          )}

          {/* WhatsApp */}
          {showWhatsapp && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">WhatsApp Number</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Image</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-md p-4 text-center cursor-pointer hover:border-primary transition-colors"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-32 mx-auto rounded object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="h-6 w-6" />
                  <span className="text-sm">Click to upload image</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2 bg-muted rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Post Listing
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
