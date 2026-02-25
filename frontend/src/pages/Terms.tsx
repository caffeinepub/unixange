import React from 'react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary/5 border-b border-border py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground mt-2">Last updated: February 2026</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-sm max-w-none space-y-8">
          {[
            {
              title: '1. Acceptance of Terms',
              content: 'By accessing and using UniXange, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.',
            },
            {
              title: '2. Eligibility',
              content: 'UniXange is exclusively available to current students, faculty, and staff of Jain University with a valid @jainuniversity.ac.in email address. You must be at least 18 years old to use this platform.',
            },
            {
              title: '3. User Responsibilities',
              content: 'You are responsible for all activity that occurs under your account. You agree to provide accurate information, maintain the security of your account, and promptly notify us of any unauthorized use.',
            },
            {
              title: '4. Prohibited Activities',
              content: 'You may not use UniXange to post illegal items, engage in fraudulent transactions, harass other users, or violate any applicable laws. Violations may result in immediate account termination.',
            },
            {
              title: '5. Transactions',
              content: 'UniXange facilitates connections between buyers and sellers but is not a party to any transaction. We are not responsible for the quality, safety, or legality of items listed, or the ability of sellers to sell or buyers to buy.',
            },
            {
              title: '6. Intellectual Property',
              content: 'All content on UniXange, including logos, text, and graphics, is the property of UniXange and protected by applicable intellectual property laws.',
            },
            {
              title: '7. Limitation of Liability',
              content: 'UniXange is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.',
            },
            {
              title: '8. Changes to Terms',
              content: 'We reserve the right to modify these terms at any time. Continued use of UniXange after changes constitutes acceptance of the new terms.',
            },
          ].map(({ title, content }) => (
            <div key={title}>
              <h2 className="text-lg font-bold text-foreground mb-2">{title}</h2>
              <p className="text-muted-foreground leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
