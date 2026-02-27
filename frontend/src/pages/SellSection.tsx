import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ItemCard from '../components/ItemCard';
import AddItemModal from '../components/AddItemModal';
import FloatingAddButton from '../components/FloatingAddButton';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useGetBuySellItems, useDeleteItem } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Tag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SellSection() {
  const { identity } = useInternetIdentity();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const { data: items = [], isLoading } = useGetBuySellItems();
  const deleteItem = useDeleteItem();

  // Show only the current user's listings
  const myItems = identity
    ? items.filter(i => i.sellerId.toString() === identity.getPrincipal().toString())
    : [];

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
              <Tag className="h-7 w-7 text-primary" />
              My Listings
            </h1>
            <p className="text-muted-foreground mt-1">Manage your items for sale</p>
          </div>
          {identity && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity text-sm"
            >
              + New Listing
            </button>
          )}
        </div>

        {!identity ? (
          <div className="text-center py-16 text-muted-foreground">
            <Tag className="h-14 w-14 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Please log in to manage your listings.</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-border">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : myItems.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Tag className="h-14 w-14 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">You haven't listed any items yet.</p>
            <button
              onClick={() => setAddModalOpen(true)}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Post Your First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {myItems.map(item => (
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
                itemType="sell"
                isOwner={true}
                onDelete={() => setDeleteId(item.id)}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />

      <FloatingAddButton onClick={() => setAddModalOpen(true)} />
      <AddItemModal open={addModalOpen} onOpenChange={setAddModalOpen} defaultSection="sell" />
      <DeleteConfirmationModal
        open={deleteId !== null}
        onOpenChange={open => { if (!open) setDeleteId(null); }}
        onConfirm={handleDelete}
        isLoading={deleteItem.isPending}
      />
    </div>
  );
}
