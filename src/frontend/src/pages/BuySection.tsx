import { useState } from 'react';
import { useGetBuySellItems, useDeleteItem } from '@/hooks/useQueries';
import ItemCard from '@/components/ItemCard';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { toast } from 'sonner';

export default function BuySection() {
  const { data: items, isLoading, error, refetch, isRefetching } = useGetBuySellItems();
  const { identity } = useInternetIdentity();
  const deleteItem = useDeleteItem();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: bigint; title: string } | null>(null);

  const handleDeleteClick = (id: bigint, title: string) => {
    setItemToDelete({ id, title });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    try {
      await deleteItem.mutateAsync(itemToDelete.id);
      toast.success('Item deleted successfully');
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete item');
    }
  };

  const filteredItems = items?.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (maxPrice && Number(item.price) > Number(maxPrice)) return false;
    return true;
  });

  const hasNetworkError = error && String(error).includes('network');

  const isOwner = (sellerId: any) => {
    if (!identity) return false;
    return sellerId.toString() === identity.getPrincipal().toString();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Buy
          </h1>
          <p className="text-base text-muted-foreground">
            Browse items for sale from fellow students
          </p>
        </div>

        {hasNetworkError && (
          <Alert className="mb-8 border-2 border-border shadow-marketplace">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <div className="flex items-center justify-between">
                <span>Connection issue. Unable to load items.</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className="ml-4 rounded-md font-semibold"
                >
                  {isRefetching ? (
                    <>
                      <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Retry
                    </>
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-10 rounded-lg border-2 border-border bg-card p-6 shadow-marketplace">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category" className="h-11 rounded-md border-2 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Books">Books</SelectItem>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Clothing">Clothing</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPrice" className="text-sm font-semibold">Max Price (₹)</Label>
              <Input
                id="maxPrice"
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Any"
                min="0"
                className="h-11 rounded-md border-2 font-medium"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredItems && filteredItems.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item) => (
              <ItemCard
                key={Number(item.id)}
                title={item.title}
                description={item.description}
                price={item.price}
                condition={item.condition}
                category={item.category}
                imageUrl={item.storageBlobs[0]?.getDirectURL()}
                image={item.images[0]}
                showActions={!isOwner(item.sellerId)}
                showDelete={isOwner(item.sellerId)}
                onDelete={() => handleDeleteClick(item.id, item.title)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-border bg-accent py-20 text-center shadow-marketplace">
            <p className="text-base text-muted-foreground">No items found</p>
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}

        <DeleteConfirmationModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={handleDeleteConfirm}
          isDeleting={deleteItem.isPending}
          itemTitle={itemToDelete?.title}
        />
      </div>
    </div>
  );
}
