import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetMessages, useSendMessage } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MessagesThread() {
  const navigate = useNavigate();
  const { conversationId } = useParams({ strict: false }) as { conversationId?: string };
  const { identity } = useInternetIdentity();
  const { data: messages, isLoading, error } = useGetMessages(conversationId || null);
  const sendMessage = useSendMessage();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !conversationId) return;

    try {
      await sendMessage.mutateAsync({
        conversationId,
        content: messageText.trim(),
      });
      setMessageText('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
  };

  if (!conversationId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border-2 border-border shadow-marketplace p-8">
          <p className="text-muted-foreground">Invalid conversation</p>
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/messages' })}
            className="mt-4"
          >
            Back to Messages
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/messages' })}
            className="-ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Messages
          </Button>
        </div>

        <Card className="border-2 border-border shadow-marketplace">
          <CardHeader className="border-b border-border">
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-destructive">Failed to load messages</p>
                </div>
              ) : messages && messages.length > 0 ? (
                <>
                  {messages.map((message) => {
                    const isOwnMessage = identity?.getPrincipal().toText() === message.sender.toText();
                    return (
                      <div
                        key={Number(message.id)}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isOwnMessage
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-accent text-accent-foreground'
                          }`}
                        >
                          <p className="text-sm break-words">{message.content}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">No messages yet</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="border-t border-border p-4">
              <div className="flex gap-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded-md border-2"
                  disabled={sendMessage.isPending}
                />
                <Button
                  type="submit"
                  disabled={!messageText.trim() || sendMessage.isPending}
                  className="rounded-md"
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
