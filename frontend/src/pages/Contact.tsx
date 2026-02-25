import React from 'react';
import { Mail, MessageSquare, HelpCircle } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-primary/5 border-b border-border py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-foreground mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: Mail,
              title: 'General Inquiries',
              desc: 'For general questions about UniXange',
              email: 'hello@unixange.in',
              color: 'text-primary',
              bg: 'bg-primary/10',
            },
            {
              icon: MessageSquare,
              title: 'Feedback',
              desc: 'Share your thoughts and suggestions',
              email: 'feedback@unixange.in',
              color: 'text-success',
              bg: 'bg-success/10',
            },
            {
              icon: HelpCircle,
              title: 'Support',
              desc: 'Need help with your account or listings?',
              email: 'support@unixange.in',
              color: 'text-warning',
              bg: 'bg-warning/10',
            },
          ].map(({ icon: Icon, title, desc, email, color, bg }) => (
            <div key={title} className="p-6 bg-card border border-border rounded-2xl text-center shadow-card">
              <div className={`inline-flex items-center justify-center w-12 h-12 ${bg} rounded-xl mb-4`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{desc}</p>
              <a
                href={`mailto:${email}`}
                className="text-sm text-primary hover:underline font-medium"
              >
                {email}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-card border border-border rounded-2xl text-center">
          <h2 className="text-xl font-bold text-foreground mb-3">Campus Community</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto">
            UniXange is a student-run platform for Jain University. We're always looking to improve and value your feedback. Reach out to us anytime — we typically respond within 24 hours.
          </p>
        </div>
      </section>
    </div>
  );
}
