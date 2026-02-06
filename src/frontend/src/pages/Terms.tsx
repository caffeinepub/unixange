export default function Terms() {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Terms of Service</h1>
          <p className="text-lg text-muted-foreground">
            Last updated: February 6, 2026
          </p>
        </div>

        <div className="space-y-6 text-foreground">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using UniXange, you accept and agree to be bound by the terms and provisions 
              of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">2. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              UniXange is exclusively available to verified students of Jain University. You must have a 
              valid @jainuniversity.ac.in email address to create an account and access the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">3. User Responsibilities</h2>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Provide accurate and truthful information in your listings</li>
              <li>Respect other users and maintain professional conduct</li>
              <li>Comply with all applicable laws and university policies</li>
              <li>Not post prohibited, illegal, or offensive content</li>
              <li>Take responsibility for all transactions and communications</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">4. Listings and Transactions</h2>
            <p className="text-muted-foreground leading-relaxed">
              Users are solely responsible for the accuracy of their listings and the completion of transactions. 
              UniXange acts as a platform to facilitate connections between buyers and sellers but is not a party 
              to any transaction. We do not guarantee the quality, safety, or legality of items listed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">5. Prohibited Activities</h2>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Posting fraudulent or misleading listings</li>
              <li>Harassment or abuse of other users</li>
              <li>Selling prohibited or illegal items</li>
              <li>Attempting to circumvent platform security</li>
              <li>Using the platform for commercial purposes outside student transactions</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">6. Account Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms or engage in 
              activities that harm the platform or its users. Termination may occur without prior notice 
              for serious violations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              UniXange is provided "as is" without warranties of any kind. We are not liable for any damages 
              arising from your use of the platform, including but not limited to transaction disputes, 
              lost items, or data loss.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">8. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of the platform after 
              changes constitutes acceptance of the modified terms. We will notify users of significant changes 
              via email or platform notifications.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these Terms of Service, please contact us at legal@unixange.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
