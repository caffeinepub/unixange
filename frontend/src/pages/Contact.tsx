import { Mail, MessageSquare, HelpCircle } from 'lucide-react';

export default function Contact() {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Contact Us</h1>
          <p className="text-lg text-muted-foreground">
            We're here to help. Reach out to us with any questions or concerns.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Email Support</h3>
            <p className="text-sm text-muted-foreground">
              For general inquiries and support, reach out to our team via email.
            </p>
            <p className="text-sm font-medium text-primary">support@unixange.com</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Feedback</h3>
            <p className="text-sm text-muted-foreground">
              Have suggestions or feedback? We'd love to hear from you to improve UniXange.
            </p>
            <p className="text-sm font-medium text-primary">feedback@unixange.com</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-3 md:col-span-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Help & Support</h3>
            <p className="text-sm text-muted-foreground">
              Need help with your account, listings, or have questions about how UniXange works? 
              Our support team is ready to assist you with any issues you may encounter.
            </p>
            <p className="text-sm font-medium text-primary">help@unixange.com</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-accent/50 p-6 space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Response Time</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We typically respond to all inquiries within 24-48 hours during business days. 
            For urgent matters, please mark your email as "Urgent" in the subject line.
          </p>
        </div>
      </div>
    </div>
  );
}
