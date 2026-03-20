export default function ContactPage() {
  return (
    <div className="page info-page">
      <header className="page-hero">
        <h2 className="page-title">Contact Us</h2>
        <p className="page-subtitle">We are here to help with orders, delivery, or custom requests.</p>
      </header>

      <section className="info-grid">
        <div className="info-card">
          <h3>Support</h3>
          <p>Email: support@techbouquet.com</p>
          <p>Phone: +91 90000 00000</p>
          <p>Response time: within 24 hours</p>
        </div>
        <div className="info-card">
          <h3>Hours</h3>
          <p>Mon - Sat: 9:00 AM - 9:00 PM</p>
          <p>Sun: 10:00 AM - 6:00 PM</p>
          <span className="info-badge">Fast Order Support</span>
        </div>
        <div className="info-card">
          <h3>Studio</h3>
          <p>Velvet Petals Studio</p>
          <p>Bengaluru, Karnataka</p>
          <p>India</p>
        </div>
      </section>
    </div>
  );
}
