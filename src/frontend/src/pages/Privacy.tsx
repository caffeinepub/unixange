export default function Privacy() {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">
            Last updated: February 6, 2026
          </p>
        </div>

        <div className="space-y-6 text-foreground">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information that you provide directly to us when using UniXange, including:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Account information (name, email, university affiliation)</li>
              <li>Profile information and onboarding details</li>
              <li>Listing information (titles, descriptions, images, prices)</li>
              <li>Communication data between users</li>
              <li>Usage data and platform interactions</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Provide, maintain, and improve our services</li>
              <li>Verify your university affiliation and eligibility</li>
              <li>Facilitate transactions between users</li>
              <li>Send important notifications and updates</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">3. Information Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>With other users as necessary to facilitate transactions (e.g., contact information for buyers/sellers)</li>
              <li>With service providers who assist in operating our platform</li>
              <li>When required by law or to protect our rights</li>
              <li>With your explicit consent</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">4. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
              over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as necessary to provide our services and comply with 
              legal obligations. You may request deletion of your account and associated data at any time, subject 
              to legal retention requirements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Access and review your personal information</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of non-essential communications</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">7. Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, 
              and maintain session information. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">8. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              UniXange is intended for university students and is not directed to individuals under 18 years of age. 
              We do not knowingly collect personal information from children.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes via 
              email or platform notification. Your continued use of UniXange after changes constitutes acceptance 
              of the updated policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us 
              at privacy@unixange.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
