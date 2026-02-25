import React, { useState } from 'react';
import { Package, Loader2, AlertCircle, Plus } from 'lucide-react';
import { useGetRentalItems, useDeleteItem } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import ItemCard from '../components/ItemCard';
import FloatingAddButton from '../components/FloatingAddButton';
import AddItemModal from '../components/AddItemModal';
import LoginModal from '../components/LoginModal';

export default function RentSection() {
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const { data: items = [], isLoading, error } = useGetRentalItems();
  const deleteItem = useDeleteItem();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const isAuthenticated = !!identity;
  const hasValidProfile = !!profile;

  const handleAddClick = () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    if (!hasValidProfile) return;
    setAddModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Rent Items</h1>
              <p className="text-sm text-muted-foreground mt-1">Borrow and lend within campus</p>
            </div>
            {isAuthenticated && hasValidProfile && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" />
                List for Rent
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Auth prompt */}
        {!isAuthenticated && (
          <div className="text-center py-16">
            <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Browse Rentals</h2>
            <p className="text-muted-foreground mb-6">Login to view and list rental items</p>
            <button
              onClick={() => setLoginModalOpen(true)}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Login to Continue
            </button>
          </div>
        )}

        {/* Loading */}
        {isAuthenticated && isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error */}
        {isAuthenticated && error && (
          <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">Failed to load rental items. Please try again.</p>
          </div>
        )}

        {/* Items */}
        {isAuthenticated && !isLoading && !error && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {items.length} item{items.length !== 1 ? 's' : ''} available for rent
            </p>
            {items.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">No rental items yet</h2>
                <p className="text-muted-foreground mb-6">Be the first to list an item for rent</p>
                {hasValidProfile && (
                  <button
                    onClick={() => setAddModalOpen(true)}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    List First Item
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {items.map(item => (
                  <ItemCard
                    key={item.id.toString()}
                    type="rental"
                    item={item}
                    onDelete={() => deleteItem.mutate(item.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {isAuthenticated && hasValidProfile && (
        <FloatingAddButton onClick={handleAddClick} label="List for Rent" />
      )}

      <AddItemModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        section="rental"
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
}
