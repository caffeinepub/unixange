import { Link } from '@tanstack/react-router';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand + Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary">UniXange</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted student marketplace for buying, selling, renting, and finding lost items on campus.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/buy"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Buy
                </Link>
              </li>
              <li>
                <Link
                  to="/sell"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Sell
                </Link>
              </li>
              <li>
                <Link
                  to="/rent"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Rent
                </Link>
              </li>
              <li>
                <Link
                  to="/lost-found"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Lost & Found
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">About</h4>
            <p className="text-sm text-muted-foreground">
              UniXange connects students within campus communities to exchange goods and services safely and conveniently.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {currentYear} UniXange. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
