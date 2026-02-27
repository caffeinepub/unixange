import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AISmartSearch from '../components/AISmartSearch';
import ItemCard from '../components/ItemCard';
import { useGetBuySellItems, useGetRentalItems } from '../hooks/useQueries';
import { filterBuySellItems, filterRentalItems } from '../utils/aiSmartSearch';
import { ShoppingBag, Tag, Package, Search, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const categories = [
  { label: 'Buy', path: '/buy', icon: ShoppingBag, desc: 'Find great deals on campus', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'Sell', path: '/sell', icon: Tag, desc: 'List your items for sale', color: 'bg-green-50 text-green-700 border-green-200' },
  { label: 'Rent', path: '/rent', icon: Package, desc: 'Rent items affordably', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { label: 'Lost & Found', path: '/lost-found', icon: Search, desc: 'Report or find lost items', color: 'bg-purple-50 text-purple-700 border-purple-200' },
];

export default function Homepage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: buySellItems = [], isLoading: buySellLoading } = useGetBuySellItems();
  const { data: rentalItems = [], isLoading: rentalLoading } = useGetRentalItems();

  const filteredBuySell = searchQuery ? filterBuySellItems(buySellItems, searchQuery) : buySellItems.slice(0, 8);
  const filteredRental = searchQuery ? filterRentalItems(rentalItems, searchQuery) : rentalItems.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-marketplace-beige border-b border-border py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-3 tracking-tight">
              Uni<span className="text-primary">Xange</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              The campus marketplace for Jain University students — buy, sell, rent, and find lost items.
            </p>
            <AISmartSearch
              onSearch={setSearchQuery}
              placeholder='AI Search: "laptop under ₹5000", "good condition books"...'
              className="max-w-2xl mx-auto"
            />
          </div>
        </section>

        {/* Category Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Browse Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(({ label, path, icon: Icon, desc, color }) => (
              <button
                key={path}
                onClick={() => navigate({ to: path })}
                className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 ${color} hover:scale-105 transition-transform text-center`}
              >
                <Icon className="h-8 w-8" />
                <div>
                  <p className="font-bold text-base">{label}</p>
                  <p className="text-xs opacity-70 mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Recent Buy/Sell Listings */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {searchQuery ? 'Search Results' : 'Recent Listings'}
            </h2>
            <button
              onClick={() => navigate({ to: '/buy' })}
              className="flex items-center gap-1 text-sm text-primary hover:opacity-80 transition-opacity font-medium"
            >
              View all <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {buySellLoading ? (
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
          ) : filteredBuySell.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>{searchQuery ? 'No items match your search.' : 'No listings yet. Be the first to post!'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBuySell.map(item => (
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
                />
              ))}
            </div>
          )}
        </section>

        {/* Recent Rentals */}
        {!searchQuery && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Available for Rent</h2>
              <button
                onClick={() => navigate({ to: '/rent' })}
                className="flex items-center gap-1 text-sm text-primary hover:opacity-80 transition-opacity font-medium"
              >
                View all <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            {rentalLoading ? (
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
            ) : rentalItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No rental listings yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredRental.map(item => (
                  <ItemCard
                    key={item.id.toString()}
                    id={item.id}
                    title={item.title}
                    dailyPrice={item.dailyPrice}
                    condition={item.condition}
                    category={item.category}
                    images={item.images}
                    storageBlobs={item.storageBlobs}
                    whatsappNumber={item.whatsappNumber}
                    itemType="rent"
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
