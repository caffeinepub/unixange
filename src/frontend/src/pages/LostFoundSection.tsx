import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetLostFoundItems, usePostLostItem, usePostFoundItem, useDeleteLostFoundItem, useGetCallerUserProfile, useStartConversation } from '@/hooks/useQueries';
import ItemCard from '@/components/ItemCard';
import FloatingAddButton from '@/components/FloatingAddButton';
import AddItemModal, { ItemFormData } from '@/components/AddItemModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import LoginModal from '@/components/LoginModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin, WifiOff, RefreshCw } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function LostFoundSection() {
  const navigate = useNavigate();
  const { data: items, isLoading, error, refetch, isRefetching } = useGetLostFoundItems();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const postLostItem = usePostLostItem();
  const postFoundItem = usePostFoundItem();
  const deleteItem = useDeleteLostFoundItem();
  const startConversation = useStartConversation();
  const [modalOpen, setModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [modalSection, setModalSection] = useState<'lost' | 'found'>('lost');
  const [choiceDialogOpen, setChoiceDialogOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: bigint; title: string } | null>(null);

  const isAuthenticated = !!identity;

  const lostItems = items?.filter((item) => item.status === 'lost');
  const foundItems = items?.filter((item) => item.status === 'found');

  const handleAddItem = async (data: ItemFormData) => {
    if (modalSection === 'lost') {
      await postLostItem.mutateAsync({
        title: data.title,
        description: data.description,
        location: data.location || '',
        images: data.images,
        storageBlobs: data.storageBlobs,
      });
    } else {
      await postFoundItem.mutateAsync({
        title: data.title,
        description: data.description,
        location: data.location || '',
        images: data.images,
        storageBlobs: data.storageBlobs,
      });
    }
  };

  const openModal = (section: 'lost' | 'found') => {
    // Check if profile is loaded and valid before opening modal
    if (profileLoading) {
      toast.info('Loading your profile...', {
        description: 'Please wait a moment.',
      });
      return;
    }

    if (!profileFetched || userProfile === null) {
      toast.error('Profile Required', {
        description: 'Please complete your university profile to report items.',
      });
      setChoiceDialogOpen(false);
      return;
    }

    setModalSection(section);
    setChoiceDialogOpen(false);
    setModalOpen(true);
  };

  const handleFloatingButtonClick = () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }

    // Check if profile is loaded and valid before showing choice dialog
    if (profileLoading) {
      toast.info('Loading your profile...', {
        description: 'Please wait a moment.',
      });
      return;
    }

    if (!profileFetched || userProfile === null) {
      toast.error('Profile Required', {
        description: 'Please complete your university profile to report items.',
      });
      return;
    }

    setChoiceDialogOpen(true);
  };

  const handleContactOwner = async (ownerId: any, itemTitle: string) => {
    if (!identity) {
      setLoginModalOpen(true);
      return;
    }

    try {
      const conversationId = await startConversation.mutateAsync({
        listingOwnerId: ownerId,
        initialMessage: `Hi, I saw your post about "${itemTitle}"`,
      });
      toast.success('Conversation started');
      navigate({ to: `/messages/${conversationId}` });
    } catch (error: any) {
      toast.error(error.message || 'Failed to start conversation');
    }
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

  const isOwner = (ownerId: any) => {
    if (!identity) return false;
    return ownerId.toString() === identity.getPrincipal().toString();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Lost & Found
          </h1>
          <p className="text-base text-muted-foreground">
            Help reunite lost items with their owners
          </p>
        </div>

        {hasNetworkError && (
          <Alert className="mb-8 border-2 border-border shadow-marketplace">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <div className="flex items-center justify-between">
                <span>Connection issue. Unable to load lost & found items.</span>
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

        <Tabs defaultValue="lost" className="w-full">
          <TabsList className="mb-10 grid w-full max-w-md mx-auto grid-cols-2 rounded-lg border-2 border-border bg-accent p-1.5 shadow-marketplace">
            <TabsTrigger value="lost" className="rounded-md font-semibold data-[state=active]:bg-card data-[state=active]:shadow-marketplace">
              Lost Items
            </TabsTrigger>
            <TabsTrigger value="found" className="rounded-md font-semibold data-[state=active]:bg-card data-[state=active]:shadow-marketplace">
              Found Items
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lost">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : lostItems && lostItems.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {lostItems.map((item) => (
                  <ItemCard
                    key={Number(item.id)}
                    title={item.title}
                    description={item.description}
                    location={item.location}
                    status={item.status}
                    imageUrl={item.storageBlobs[0]?.getDirectURL()}
                    image={item.images[0]}
                    showActions={!isOwner(item.ownerId)}
                    showDelete={isOwner(item.ownerId)}
                    onMessageSeller={() => handleContactOwner(item.ownerId, item.title)}
                    onDelete={() => handleDeleteClick(item.id, item.title)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border-2 border-border bg-accent py-20 text-center shadow-marketplace">
                <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-base text-muted-foreground">No lost items reported</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Lost something? Report it here
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="found">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : foundItems && foundItems.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {foundItems.map((item) => (
                  <ItemCard
                    key={Number(item.id)}
                    title={item.title}
                    description={item.description}
                    location={item.location}
                    status={item.status}
                    imageUrl={item.storageBlobs[0]?.getDirectURL()}
                    image={item.images[0]}
                    showActions={!isOwner(item.ownerId)}
                    showDelete={isOwner(item.ownerId)}
                    onMessageSeller={() => handleContactOwner(item.ownerId, item.title)}
                    onDelete={() => handleDeleteClick(item.id, item.title)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border-2 border-border bg-accent py-20 text-center shadow-marketplace">
                <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-base text-muted-foreground">No found items reported</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Found something? Report it here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <FloatingAddButton onClick={handleFloatingButtonClick} />
        
        <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />

        <Dialog open={choiceDialogOpen} onOpenChange={setChoiceDialogOpen}>
          <DialogContent className="rounded-lg border-2 border-border bg-card shadow-marketplace-lg backdrop-blur-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Report Item</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button 
                onClick={() => openModal('lost')} 
                className="rounded-md font-semibold transition-marketplace"
              >
                Report Lost Item
              </Button>
              <Button 
                onClick={() => openModal('found')} 
                variant="outline" 
                className="rounded-md border-2 font-semibold transition-marketplace"
              >
                Report Found Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AddItemModal 
          open={modalOpen} 
          onOpenChange={setModalOpen} 
          section={modalSection} 
          onSubmit={handleAddItem} 
        />
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
