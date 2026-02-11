import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowLeft } from 'lucide-react';

export default function MessagesInbox() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/' })}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Messages
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Your conversations with sellers and buyers
          </p>
        </div>

        <Card className="border-2 border-border shadow-marketplace">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-12 text-center">
              <MessageCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-base text-muted-foreground">No conversations yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Start a conversation by clicking "Contact" on any listing
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
