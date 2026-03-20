export default function HelpPage() {
  return (
    <div className="page info-page">
      <header className="page-hero">
        <h2 className="page-title">Help</h2>
        <p className="page-subtitle">Quick answers to the most common questions.</p>
      </header>

      <section className="faq-list">
        <div className="faq-item">
          <h3>How do I track my order?</h3>
          <p>After placing an order, you will receive a confirmation email with tracking details.</p>
        </div>
        <div className="faq-item">
          <h3>Can I change delivery time?</h3>
          <p>Yes, changes are allowed up to 12 hours before delivery based on slot availability.</p>
        </div>
        <div className="faq-item">
          <h3>Do you offer custom bouquets?</h3>
          <p>Absolutely. Share your preferences and we will curate a custom arrangement.</p>
        </div>
      </section>
    </div>
  );
}
