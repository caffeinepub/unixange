import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ItemCard from '../components/ItemCard';
import AddItemModal from '../components/AddItemModal';
import FloatingAddButton from '../components/FloatingAddButton';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useGetLostFoundItems, useDeleteLostFoundItem } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function LostFoundSection() {
  const { identity } = useInternetIdentity();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [defaultSection, setDefaultSection] = useState<'lost' | 'found'>('lost');
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const { data: items = [], isLoading } = useGetLostFoundItems();
  const deleteItem = useDeleteLostFoundItem();

  const lostItems = items.filter(i => i.status === 'lost');
  const foundItems = items.filter(i => i.status === 'found');

  const handleDelete = async () => {
    if (deleteId === null) return;
    await deleteItem.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const openAddModal = (section: 'lost' | 'found') => {
    setDefaultSection(section);
    setAddModalOpen(true);
  };

  const renderGrid = (sectionItems: typeof items) => {
    if (isLoading) {
      return (
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
      );
    }
    if (sectionItems.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No items reported here yet.</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {sectionItems.map(item => (
          <ItemCard
            key={item.id.toString()}
            id={item.id}
            title={item.title}
            images={item.images}
            storageBlobs={item.storageBlobs}
            status={item.status}
            itemType="lost-found"
            isOwner={identity?.getPrincipal().toString() === item.ownerId.toString()}
            onDelete={() => setDeleteId(item.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Search className="h-7 w-7 text-primary" />
              Lost & Found
            </h1>
            <p className="text-muted-foreground mt-1">Report lost items or help others find theirs</p>
          </div>
          {identity && (
            <div className="flex gap-2">
              <button
                onClick={() => openAddModal('lost')}
                className="px-3 py-2 bg-destructive text-destructive-foreground rounded-md font-medium hover:opacity-90 transition-opacity text-sm"
              >
                + Report Lost
              </button>
              <button
                onClick={() => openAddModal('found')}
                className="px-3 py-2 bg-green-600 text-white rounded-md font-medium hover:opacity-90 transition-opacity text-sm"
              >
                + Report Found
              </button>
            </div>
          )}
        </div>

        <Tabs defaultValue="lost">
          <TabsList className="mb-6">
            <TabsTrigger value="lost">Lost Items ({lostItems.length})</TabsTrigger>
            <TabsTrigger value="found">Found Items ({foundItems.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="lost">{renderGrid(lostItems)}</TabsContent>
          <TabsContent value="found">{renderGrid(foundItems)}</TabsContent>
        </Tabs>
      </main>
      <Footer />

      <FloatingAddButton onClick={() => openAddModal('lost')} />
      <AddItemModal open={addModalOpen} onOpenChange={setAddModalOpen} defaultSection={defaultSection} />
      <DeleteConfirmationModal
        open={deleteId !== null}
        onOpenChange={open => { if (!open) setDeleteId(null); }}
        onConfirm={handleDelete}
        isLoading={deleteItem.isPending}
      />
    </div>
  );
}
