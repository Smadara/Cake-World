
function Order({
  form,
  setForm,
  checkout,
  setPage
}) {
  return (
    <section className="form-page order-page">

      <div className="form-intro">
        <p className="eyebrow">ALMOST THERE</p>

        <h1>
          Complete your <i>order.</i>
        </h1>

        <p>
          Just a few more details and your favourite cakes
          will be on their way to you.
        </p>

        <button
          className="text-link"
          type="button"
          onClick={() => setPage('home')}
        >
          ← Continue shopping
        </button>
      </div>

      <form
        className="panel form order-form"
        onSubmit={checkout}
      >

        <h2>Delivery details</h2>

        <p className="muted">
          Please provide your information for a smooth delivery.
        </p>

        <div className="form-grid">

          <label>
            Full name
            <input
              required
              value={form.name}
              onChange={e =>
                setForm({ ...form, name: e.target.value })
              }
              placeholder="Enter your full name"
            />
          </label>

          <label>
            Email address
            <input
              required
              type="email"
              value={form.email}
              onChange={e =>
                setForm({ ...form, email: e.target.value })
              }
              placeholder="you@example.com"
            />
          </label>

          <label>
            Phone number
            <input
              required
              type="tel"
              value={form.phone}
              onChange={e =>
                setForm({ ...form, phone: e.target.value })
              }
              placeholder="+94 77 123 4567"
            />
          </label>

          <label>
            Preferred delivery date
            <input
              required
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={form.date}
              onChange={e =>
                setForm({ ...form, date: e.target.value })
              }
            />
          </label>

          <label className="full">
            Delivery address
            <textarea
              required
              rows="4"
              value={form.address}
              onChange={e =>
                setForm({ ...form, address: e.target.value })
              }
              placeholder="House number, street, city and postal code"
            />
          </label>

          <label className="full">
            Additional notes (Optional)
            <textarea
              rows="3"
              value={form.notes}
              onChange={e =>
                setForm({ ...form, notes: e.target.value })
              }
              placeholder="Any special delivery instructions?"
            />
          </label>

        </div>

        <div className="cod">
          ✓ Cash on Delivery
        </div>

        <button className="primary wide" type="submit">
          Confirm & Place Order ↗
        </button>

      </form>

    </section>
  )
}

export default Order
