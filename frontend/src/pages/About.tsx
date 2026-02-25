import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Shield, Users, TrendingUp, BookOpen, ArrowRight } from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-primary/5 border-b border-border py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-foreground mb-4">About UniXange</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The trusted campus marketplace built exclusively for Jain University students.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              UniXange was created to make campus life easier and more affordable. We believe students shouldn't have to overpay for textbooks, electronics, or everyday items when fellow students have exactly what they need.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By creating a trusted, verified marketplace exclusively for Jain University students, we enable safe peer-to-peer transactions within the campus community.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Shield, label: 'Verified Users', desc: 'University email required' },
              { icon: Users, label: 'Community', desc: 'Campus-only network' },
              { icon: TrendingUp, label: 'Best Prices', desc: 'Student-friendly deals' },
              { icon: BookOpen, label: 'All Categories', desc: 'Books to electronics' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="p-4 bg-card border border-border rounded-xl text-center">
                <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="bg-muted/50 border-y border-border py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">What We Offer</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: 'Buy & Sell', desc: 'List items for sale or find great deals from fellow students. From textbooks to electronics, find everything you need.' },
              { title: 'Rent Items', desc: 'Borrow items for short periods instead of buying. Perfect for one-time use items like formal wear or specialized equipment.' },
              { title: 'Lost & Found', desc: 'Report lost items or help reunite found items with their owners. Our campus community looks out for each other.' },
              { title: 'Secure Platform', desc: 'All users are verified Jain University students, ensuring a safe and trusted environment for all transactions.' },
            ].map(({ title, desc }) => (
              <div key={title} className="p-6 bg-card border border-border rounded-xl">
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-3">Ready to join?</h2>
        <p className="text-muted-foreground mb-6">Start buying, selling, and connecting with your campus community today.</p>
        <button
          onClick={() => navigate({ to: '/buy' })}
          className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity"
        >
          Explore Marketplace <ArrowRight className="h-4 w-4" />
        </button>
      </section>
    </div>
  );
}
