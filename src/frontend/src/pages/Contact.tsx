import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Mail, MessageSquare, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginModal from '@/components/LoginModal';
import { useState } from 'react';

export default function Contact() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleMessagesClick = () => {
    if (!identity) {
      setLoginModalOpen(true);
      return;
    }
    navigate({ to: '/messages' });
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Contact & Support
        </h1>
        <p className="text-base text-muted-foreground">
          Get in touch with us or contact sellers directly
        </p>
      </div>

      <div className="mb-12 max-w-2xl mx-auto">
        <Card className="border-2 border-primary bg-primary/5 shadow-marketplace">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <MessageSquare className="h-5 w-5" />
              Contact Sellers & Buyers
            </CardTitle>
            <CardDescription>
              Use our in-app messaging to communicate with other students about listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleMessagesClick}
              className="w-full rounded-md font-semibold"
            >
              Go to Messages
            </Button>
            <p className="mt-3 text-sm text-muted-foreground text-center">
              Click "Contact" on any listing to start a conversation
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-4xl mx-auto">
        <h2 className="mb-6 text-2xl font-bold text-foreground">Support & Feedback</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-2 border-border shadow-marketplace">
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">General Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                For general questions about UniXange
              </p>
              <a
                href="mailto:info@unixange.com"
                className="text-sm font-medium text-primary hover:underline"
              >
                info@unixange.com
              </a>
            </CardContent>
          </Card>

          <Card className="border-2 border-border shadow-marketplace">
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Share your thoughts and suggestions
              </p>
              <a
                href="mailto:feedback@unixange.com"
                className="text-sm font-medium text-primary hover:underline"
              >
                feedback@unixange.com
              </a>
            </CardContent>
          </Card>

          <Card className="border-2 border-border shadow-marketplace">
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Help & Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Need help? We're here to assist
              </p>
              <a
                href="mailto:support@unixange.com"
                className="text-sm font-medium text-primary hover:underline"
              >
                support@unixange.com
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </div>
  );
}
