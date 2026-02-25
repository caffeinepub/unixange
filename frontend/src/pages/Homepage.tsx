import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShoppingBag, Tag, Package, HelpCircle, ArrowRight, TrendingUp, Shield, Users } from 'lucide-react';

const categories = [
  { label: 'Electronics', emoji: '💻', path: '/buy' },
  { label: 'Books', emoji: '📚', path: '/buy' },
  { label: 'Furniture', emoji: '🪑', path: '/buy' },
  { label: 'Clothing', emoji: '👕', path: '/buy' },
  { label: 'Sports', emoji: '⚽', path: '/buy' },
  { label: 'Stationery', emoji: '✏️', path: '/buy' },
];

const features = [
  {
    icon: Shield,
    title: 'Campus Verified',
    description: 'Only verified Jain University students can buy and sell.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Connect with fellow students and build trust within campus.',
  },
  {
    icon: TrendingUp,
    title: 'Best Deals',
    description: 'Find great deals on textbooks, electronics, and more.',
  },
];

export default function Homepage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/20 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-4 tracking-tight">
              Campus Marketplace
            </h1>
            <p className="text-lg sm:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Buy, sell, rent, and find lost items within the Jain University community. Safe, trusted, and easy.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate({ to: '/buy' })}
                className="px-8 py-3.5 bg-primary-foreground text-primary font-bold rounded-full hover:opacity-90 transition-opacity text-sm"
              >
                Browse Items
              </button>
              <button
                onClick={() => navigate({ to: '/sell' })}
                className="px-8 py-3.5 bg-transparent text-primary-foreground font-bold rounded-full border-2 border-primary-foreground/50 hover:border-primary-foreground hover:bg-primary-foreground/10 transition-all text-sm"
              >
                Start Selling
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: ShoppingBag, label: 'Buy', desc: 'Find great deals', path: '/buy', color: 'text-primary' },
            { icon: Tag, label: 'Sell', desc: 'List your items', path: '/sell', color: 'text-success' },
            { icon: Package, label: 'Rent', desc: 'Borrow & lend', path: '/rent', color: 'text-warning' },
            { icon: HelpCircle, label: 'Lost & Found', desc: 'Report items', path: '/lost-found', color: 'text-destructive' },
          ].map(({ icon: Icon, label, desc, path, color }) => (
            <button
              key={path}
              onClick={() => navigate({ to: path })}
              className="flex flex-col items-center gap-3 p-5 bg-card border-2 border-border rounded-2xl hover:border-primary hover:shadow-marketplace-hover transition-all duration-200 group"
            >
              <div className={`p-3 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-muted/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Browse Categories</h2>
            <button
              onClick={() => navigate({ to: '/buy' })}
              className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {categories.map(({ label, emoji, path }) => (
              <button
                key={label}
                onClick={() => navigate({ to: path })}
                className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-xl hover:border-primary hover:shadow-card transition-all duration-200"
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs font-medium text-foreground">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-10">Why UniXange?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center p-6 bg-card border border-border rounded-2xl shadow-card"
            >
              <div className="p-3 bg-primary/10 rounded-xl mb-4">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary/5 border-y border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">Join hundreds of Jain University students already using UniXange.</p>
          <button
            onClick={() => navigate({ to: '/buy' })}
            className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            Explore Marketplace
          </button>
        </div>
      </section>
    </div>
  );
}
