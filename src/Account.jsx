import { money } from './data'

function Account({ user, orders, signOut, setPage }) {
  const myOrders = orders.filter(
    order =>
      order.customer?.email?.toLowerCase() === user.email.toLowerCase()
  )

  return (
    <section className="account-page section">

      <div className="account-heading">
        <p className="eyebrow">YOUR CAKEWORLD ACCOUNT</p>
        <h1>My <i>Account.</i></h1>
        <p>Manage your account and keep track of your sweet orders.</p>
      </div>

      <div className="panel account-profile">
        <div>
          <span className="account-avatar">♡</span>
        </div>

        <div className="account-info">
          <p className="eyebrow">ACCOUNT DETAILS</p>
          <h2>Welcome back!</h2>
          <p>{user.email}</p>
        </div>

        <button className="outline" onClick={signOut}>
          Sign Out ↗
        </button>
      </div>

      <div className="my-orders">

        <div className="section-heading">
          <div>
            <p className="eyebrow">ORDER HISTORY</p>
            <h2>My <i>Orders.</i></h2>
          </div>

          <span>{myOrders.length} Orders</span>
        </div>

        {myOrders.length === 0 ? (

          <div className="panel no-orders">
            <span>♡</span>
            <h3>No orders yet.</h3>
            <p>Your delicious journey starts with your first order.</p>

            <button
              className="primary"
              onClick={() => setPage('home')}
            >
              Explore Cakes →
            </button>
          </div>

        ) : (

          <div className="my-order-list">

            {myOrders.map(order => (

              <div className="panel my-order-card" key={order.id}>

                <div className="my-order-top">
                  <div>
                    <p className="eyebrow">
                      ORDER #{String(order.id).slice(-5)}
                    </p>

                    <small>Placed on {order.date}</small>
                  </div>

                  <span className={`order-status ${order.status?.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>

                <div className="my-order-items">
                  {order.items.map(item => (
                    <div className="my-order-item" key={item.id}>
                      <img src={item.image} alt={item.name} />

                      <div>
                        <b>{item.name}</b>
                        <small>Quantity: {item.qty}</small>
                      </div>

                      <strong>{money(item.price * item.qty)}</strong>
                    </div>
                  ))}
                </div>

                <div className="my-order-bottom">
                  <span>Total Amount</span>
                  <strong>{money(order.total)}</strong>
                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </section>
  )
}

export default Account