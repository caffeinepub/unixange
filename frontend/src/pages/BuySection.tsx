import { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ItemCard from '../components/ItemCard';
import AISmartSearch from '../components/AISmartSearch';
import AddItemModal from '../components/AddItemModal';
import FloatingAddButton from '../components/FloatingAddButton';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useGetBuySellItems, useDeleteItem } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { filterBuySellItems } from '../utils/aiSmartSearch';
import { ShoppingBag, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function BuySection() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: items = [], isLoading } = useGetBuySellItems();
  const deleteItem = useDeleteItem();

  // Filter to only buy items (not from sell section)
  const buyItems = items.filter(i => !i.isFromSellSection);

  const filtered = searchQuery
    ? filterBuySellItems(buyItems, searchQuery)
    : buyItems;

  const handleDelete = async () => {
    if (deleteId === null) return;
    await deleteItem.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="h-7 w-7 text-primary" />
              Buy Items
            </h1>
            <p className="text-muted-foreground mt-1">Find great deals from fellow students</p>
          </div>
          {identity && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity text-sm"
            >
              + Post Item
            </button>
          )}
        </div>

        <AISmartSearch onSearch={setSearchQuery} className="mb-6" />

        {searchQuery && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Showing results for:</span>
            <span className="flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full font-medium">
              {searchQuery}
              <button onClick={() => setSearchQuery('')} className="ml-1 hover:opacity-70">
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-border">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ShoppingBag className="h-14 w-14 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">{searchQuery ? 'No items match your search.' : 'No items listed yet.'}</p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="mt-3 text-primary hover:opacity-80 text-sm">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(item => (
              <ItemCard
                key={item.id.toString()}
                id={item.id}
                title={item.title}
                price={item.price}
                condition={item.condition}
                category={item.category}
                images={item.images}
                storageBlobs={item.storageBlobs}
                whatsappNumber={item.whatsappNumber}
                itemType="buy"
                isOwner={identity?.getPrincipal().toString() === item.sellerId.toString()}
                onDelete={() => setDeleteId(item.id)}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />

      <FloatingAddButton onClick={() => setAddModalOpen(true)} />
      <AddItemModal open={addModalOpen} onOpenChange={setAddModalOpen} defaultSection="buy" />
      <DeleteConfirmationModal
        open={deleteId !== null}
        onOpenChange={open => { if (!open) setDeleteId(null); }}
        onConfirm={handleDelete}
        isLoading={deleteItem.isPending}
      />
    </div>
  );
}
