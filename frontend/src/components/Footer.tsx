import { useNavigate } from '@tanstack/react-router';
import { Heart } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'unixange');

  return (
    <footer className="bg-marketplace-dark text-primary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold mb-3">UniXange</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              The campus marketplace for Jain University students. Buy, sell, rent, and find lost items — all in one place.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-3 opacity-80">Quick Links</h4>
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
                    className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-3 opacity-80">About</h4>
            <ul className="space-y-2">
              {[
                { label: 'About Us', path: '/about' },
                { label: 'Contact', path: '/contact' },
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Terms of Service', path: '/terms' },
              ].map(({ label, path }) => (
                <li key={path}>
                  <button
                    onClick={() => navigate({ to: path })}
                    className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs opacity-50">© {year} UniXange. All rights reserved.</p>
          <p className="text-xs opacity-50 flex items-center gap-1">
            Built with <Heart className="h-3 w-3 text-red-400 fill-red-400" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80 transition-opacity"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
