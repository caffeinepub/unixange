export default function About() {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">About UniXange</h1>
          <p className="text-lg text-muted-foreground">
            Your trusted university marketplace for students, by students.
          </p>
        </div>

        <div className="space-y-6 text-foreground">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              UniXange is a closed, university-verified marketplace designed exclusively for Jain University students. 
              Our mission is to create a safe, trusted platform where students can buy, sell, rent, and manage 
              lost-and-found items within their campus community.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">What We Offer</h2>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Buy and sell items from fellow students</li>
              <li>Rent textbooks, electronics, and other essentials</li>
              <li>Post and find lost-and-found items</li>
              <li>Secure, university-verified access</li>
              <li>Easy-to-use marketplace interface</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Why UniXange?</h2>
            <p className="text-muted-foreground leading-relaxed">
              We understand the unique needs of university students. UniXange provides a trusted environment 
              where you can connect with your peers, save money, and contribute to a sustainable campus economy. 
              Every transaction happens within your verified university community, ensuring safety and trust.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Get Started</h2>
            <p className="text-muted-foreground leading-relaxed">
              Join UniXange today with your university email and start exploring what your campus community 
              has to offer. Whether you're looking to buy, sell, rent, or help reunite lost items with their 
              owners, UniXange is here to make it easy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
