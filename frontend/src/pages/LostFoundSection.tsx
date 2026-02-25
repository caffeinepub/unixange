import React, { useState } from 'react';
import { HelpCircle, Loader2, AlertCircle, Plus } from 'lucide-react';
import { useGetLostFoundItems, useDeleteLostFoundItem, useMarkAsRecovered } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import ItemCard from '../components/ItemCard';
import FloatingAddButton from '../components/FloatingAddButton';
import AddItemModal from '../components/AddItemModal';
import LoginModal from '../components/LoginModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

type LostFoundTab = 'all' | 'lost' | 'found' | 'recovered';

export default function LostFoundSection() {
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const { data: items = [], isLoading, error } = useGetLostFoundItems();
  const deleteItem = useDeleteLostFoundItem();
  const markRecovered = useMarkAsRecovered();

  const [activeTab, setActiveTab] = useState<LostFoundTab>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addSection, setAddSection] = useState<'lost' | 'found'>('lost');
  const [choiceDialogOpen, setChoiceDialogOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const isAuthenticated = !!identity;
  const hasValidProfile = !!profile;

  const filteredItems = items.filter(item => {
    if (activeTab === 'all') return true;
    return item.status === activeTab;
  });

  const handleAddClick = () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    if (!hasValidProfile) return;
    setChoiceDialogOpen(true);
  };

  const handleChoiceSelect = (type: 'lost' | 'found') => {
    setAddSection(type);
    setChoiceDialogOpen(false);
    setAddModalOpen(true);
  };

  const tabs: { key: LostFoundTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'lost', label: 'Lost' },
    { key: 'found', label: 'Found' },
    { key: 'recovered', label: 'Recovered' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Lost & Found</h1>
              <p className="text-sm text-muted-foreground mt-1">Report and find lost items on campus</p>
            </div>
            {isAuthenticated && hasValidProfile && (
              <button
                onClick={handleAddClick}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" />
                Report Item
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  activeTab === key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Auth prompt */}
        {!isAuthenticated && (
          <div className="text-center py-16">
            <HelpCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Lost & Found Board</h2>
            <p className="text-muted-foreground mb-6">Login to view and report lost or found items</p>
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
            <p className="text-sm">Failed to load items. Please try again.</p>
          </div>
        )}

        {/* Items */}
        {isAuthenticated && !isLoading && !error && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
            </p>
            {filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <HelpCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">No items here</h2>
                <p className="text-muted-foreground">
                  {activeTab === 'all' ? 'No lost or found items reported yet.' : `No ${activeTab} items.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredItems.map(item => (
                  <ItemCard
                    key={item.id.toString()}
                    type="lostFound"
                    item={item}
                    onDelete={() => deleteItem.mutate(item.id)}
                    onMarkRecovered={() => markRecovered.mutate(item.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {isAuthenticated && hasValidProfile && (
        <FloatingAddButton onClick={handleAddClick} label="Report Item" />
      )}

      {/* Choice Dialog */}
      <Dialog open={choiceDialogOpen} onOpenChange={setChoiceDialogOpen}>
        <DialogContent className="max-w-sm bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Report an Item</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              What would you like to report?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              onClick={() => handleChoiceSelect('lost')}
              className="flex flex-col items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl hover:bg-destructive/20 transition-colors"
            >
              <span className="text-2xl">😢</span>
              <span className="text-sm font-semibold text-foreground">Lost Item</span>
              <span className="text-xs text-muted-foreground text-center">I lost something</span>
            </button>
            <button
              onClick={() => handleChoiceSelect('found')}
              className="flex flex-col items-center gap-2 p-4 bg-success/10 border border-success/20 rounded-xl hover:bg-success/20 transition-colors"
            >
              <span className="text-2xl">🎉</span>
              <span className="text-sm font-semibold text-foreground">Found Item</span>
              <span className="text-xs text-muted-foreground text-center">I found something</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <AddItemModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        section={addSection}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
}
