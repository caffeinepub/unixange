import { useState } from 'react';
import { useGetBuySellItems, useAddBuySellItem, useDeleteItem, useGetCallerUserProfile } from '@/hooks/useQueries';
import ItemCard from '@/components/ItemCard';
import FloatingAddButton from '@/components/FloatingAddButton';
import AddItemModal, { ItemFormData } from '@/components/AddItemModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import LoginModal from '@/components/LoginModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, WifiOff, RefreshCw } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SellSection() {
  const { data: items, isLoading, error, refetch, isRefetching } = useGetBuySellItems();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const addBuySellItem = useAddBuySellItem();
  const deleteItem = useDeleteItem();
  const [modalOpen, setModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: bigint; title: string } | null>(null);

  const isAuthenticated = !!identity;

  const myItems = items?.filter((item) => 
    identity && item.sellerId.toString() === identity.getPrincipal().toString()
  );

  const handleAddItem = async (data: ItemFormData) => {
    await addBuySellItem.mutateAsync({
      title: data.title,
      description: data.description,
      price: BigInt(data.price || 0),
      condition: data.condition || '',
      category: data.category || '',
      images: data.images,
      storageBlobs: data.storageBlobs,
      isFromSellSection: true,
    });
  };

  const handleFloatingButtonClick = () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }

    // Check if profile is loaded and valid
    if (profileLoading) {
      toast.info('Loading your profile...', {
        description: 'Please wait a moment.',
      });
      return;
    }

    if (!profileFetched || userProfile === null) {
      toast.error('Profile Required', {
        description: 'Please complete your university profile to post items.',
      });
      return;
    }

    setModalOpen(true);
  };

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

  const hasNetworkError = error && String(error).includes('network');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            My Listings
          </h1>
          <p className="text-base text-muted-foreground">
            Items you've posted for sale
          </p>
        </div>

        {hasNetworkError && (
          <Alert className="mb-8 border-2 border-border shadow-marketplace">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <div className="flex items-center justify-between">
                <span>Connection issue. Unable to load your listings.</span>
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

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : myItems && myItems.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {myItems.map((item) => (
              <ItemCard
                key={Number(item.id)}
                title={item.title}
                description={item.description}
                price={item.price}
                condition={item.condition}
                category={item.category}
                imageUrl={item.storageBlobs[0]?.getDirectURL()}
                image={item.images[0]}
                showDelete
                onDelete={() => handleDeleteClick(item.id, item.title)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-border bg-accent py-20 text-center shadow-marketplace">
            <p className="text-base text-muted-foreground">No listings yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Post your first item to get started</p>
          </div>
        )}

        <FloatingAddButton onClick={handleFloatingButtonClick} />
        <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
        <AddItemModal open={modalOpen} onOpenChange={setModalOpen} section="buy" onSubmit={handleAddItem} />
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
