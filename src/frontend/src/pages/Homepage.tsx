import { useGetBuySellItems, useGetRentalItems } from '@/hooks/useQueries';
import ItemCard from '@/components/ItemCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, ShoppingBag, Home as HomeIcon, MapPin, Package } from 'lucide-react';

export default function Homepage() {
  const navigate = useNavigate();
  const { data: buyItems, isLoading: buyLoading } = useGetBuySellItems();
  const { data: rentalItems, isLoading: rentLoading } = useGetRentalItems();

  const recentItems = buyItems?.slice(0, 4) || [];
  const availableRentals = rentalItems?.filter(item => item.available).slice(0, 4) || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-accent to-background py-20 md:py-28">
        <div className="container mx-auto px-6 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            UniXange
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Your campus marketplace for buying, selling, and renting
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate({ to: '/buy' })}
            className="rounded-md px-8 py-6 text-base font-semibold shadow-marketplace transition-marketplace hover:shadow-marketplace-hover"
          >
            Explore Marketplace
          </Button>
        </div>
      </section>

      {/* Category Highlights */}
      <section className="border-b border-border bg-background py-16">
        <div className="container mx-auto px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => navigate({ to: '/buy' })}
              className="group flex flex-col items-center gap-4 rounded-lg border-2 border-border bg-card p-8 text-center shadow-marketplace transition-marketplace hover:border-primary hover:shadow-marketplace-hover hover-marketplace"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <ShoppingBag className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold text-foreground">Buy</h3>
                <p className="text-sm text-muted-foreground">Browse items for sale</p>
              </div>
            </button>

            <button
              onClick={() => navigate({ to: '/sell' })}
              className="group flex flex-col items-center gap-4 rounded-lg border-2 border-border bg-card p-8 text-center shadow-marketplace transition-marketplace hover:border-primary hover:shadow-marketplace-hover hover-marketplace"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold text-foreground">Sell</h3>
                <p className="text-sm text-muted-foreground">List your items</p>
              </div>
            </button>

            <button
              onClick={() => navigate({ to: '/rent' })}
              className="group flex flex-col items-center gap-4 rounded-lg border-2 border-border bg-card p-8 text-center shadow-marketplace transition-marketplace hover:border-primary hover:shadow-marketplace-hover hover-marketplace"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <HomeIcon className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold text-foreground">Rent</h3>
                <p className="text-sm text-muted-foreground">Find rentals</p>
              </div>
            </button>

            <button
              onClick={() => navigate({ to: '/lost-found' })}
              className="group flex flex-col items-center gap-4 rounded-lg border-2 border-border bg-card p-8 text-center shadow-marketplace transition-marketplace hover:border-primary hover:shadow-marketplace-hover hover-marketplace"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold text-foreground">Lost & Found</h3>
                <p className="text-sm text-muted-foreground">Report items</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Recent Listings Section */}
      <section className="bg-background py-16">
        <div className="container mx-auto px-6">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Recent Listings
            </h2>
            <p className="text-base text-muted-foreground">
              Fresh items from your campus community
            </p>
          </div>
          
          {/* Buy Items */}
          {buyLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : recentItems.length > 0 ? (
            <>
              <div className="mb-8">
                <h3 className="mb-6 text-xl font-semibold text-foreground">For Sale</h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {recentItems.map((item) => (
                    <ItemCard
                      key={Number(item.id)}
                      title={item.title}
                      description={item.description}
                      price={item.price}
                      condition={item.condition}
                      category={item.category}
                      imageUrl={item.storageBlobs[0]?.getDirectURL()}
                      image={item.images[0]}
                      showActions
                    />
                  ))}
                </div>
              </div>
              <div className="mb-12 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate({ to: '/buy' })}
                  className="rounded-md border-2 px-8 font-semibold transition-marketplace hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  View All Items for Sale
                </Button>
              </div>
            </>
          ) : (
            <div className="mb-12 rounded-lg border-2 border-border bg-accent py-16 text-center">
              <p className="text-base text-muted-foreground">No items available yet</p>
            </div>
          )}

          {/* Rental Items */}
          {rentLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : availableRentals.length > 0 ? (
            <>
              <div className="mb-8">
                <h3 className="mb-6 text-xl font-semibold text-foreground">Available for Rent</h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {availableRentals.map((item) => (
                    <ItemCard
                      key={Number(item.id)}
                      title={item.title}
                      description={item.description}
                      dailyPrice={item.dailyPrice}
                      condition={item.condition}
                      category={item.category}
                      imageUrl={item.storageBlobs[0]?.getDirectURL()}
                      image={item.images[0]}
                      showActions
                    />
                  ))}
                </div>
              </div>
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate({ to: '/rent' })}
                  className="rounded-md border-2 px-8 font-semibold transition-marketplace hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  View All Rentals
                </Button>
              </div>
            </>
          ) : (
            <div className="rounded-lg border-2 border-border bg-accent py-16 text-center">
              <p className="text-base text-muted-foreground">No rental items available yet</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
