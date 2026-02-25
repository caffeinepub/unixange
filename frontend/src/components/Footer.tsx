import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Heart } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'unixange');

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/assets/generated/unixange-logo-transparent.dim_200x200.png"
                alt="UniXange"
                className="h-8 w-8 object-contain"
              />
              <span className="text-lg font-bold text-foreground">
                Uni<span className="text-primary">Xange</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The trusted marketplace for university students. Buy, sell, rent, and find lost items within your campus community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'Buy Items', path: '/buy' },
                { label: 'Sell Items', path: '/sell' },
                { label: 'Rent Items', path: '/rent' },
                { label: 'Lost & Found', path: '/lost-found' },
              ].map(({ label, path }) => (
                <li key={path}>
                  <button
                    onClick={() => navigate({ to: path })}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              About
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              UniXange is built for Jain University students to exchange goods and services safely within the campus community.
            </p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => navigate({ to: '/about' })}
                className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
              >
                About Us
              </button>
              <button
                onClick={() => navigate({ to: '/contact' })}
                className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
              >
                Contact
              </button>
              <button
                onClick={() => navigate({ to: '/terms' })}
                className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
              >
                Terms of Service
              </button>
              <button
                onClick={() => navigate({ to: '/privacy' })}
                className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {year} UniXange. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Built with{' '}
            <Heart className="h-3 w-3 text-destructive fill-destructive" />{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
