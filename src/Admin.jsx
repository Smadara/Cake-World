import { useState } from 'react'
import { money } from './data'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

function Admin({ orders, setOrders, requests, inquiries, save }) {
  const [expandedOrder, setExpandedOrder] = useState(null)

  const updateStatus = async (orderId, status) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status
      })
    } catch (error) {
      console.error('Status update error:', error)
      alert('Unable to update order status.')
    }
  }
   

    

  return (
    <section className="admin-page section">

      <p className="eyebrow">CAKEWORLD MANAGEMENT</p>
      <h1>Admin <i>dashboard.</i></h1>

      
      <div className="stats">

        <div>
          <small>Total orders</small>
          <b>{orders.length}</b>
        </div>

        <div>
          <small>Custom requests</small>
          <b>{requests.length}</b>
        </div>

        <div>
          <small>Inquiries</small>
          <b>{inquiries.length}</b>
        </div>

      </div>

      
      <div className="admin-section">

        <h2>Recent orders</h2>

        {orders.length ? (
          orders.map(order => (
            <div className="admin-order-card" key={order.id}>

              <div className="admin-row">

                <span>
                  <b>Order #{String(order.id).slice(-5)}</b>
                  <small>
                    {order.customer?.name} · {order.date}
                  </small>
                </span>

                <strong>{money(order.total)}</strong>

                <select
                  value={order.status}
                  onChange={e => updateStatus(order.id, e.target.value)}
                >
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Preparing</option>
                  <option>Dispatched</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>

                <button
                  className="outline"
                  onClick={() =>
                    setExpandedOrder(
                      expandedOrder === order.id ? null : order.id
                    )
                  }
                >
                  {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                </button>

              </div>

             
              {expandedOrder === order.id && (
                <div className="admin-order-details">

                  <h3>Customer Information</h3>

                  <p><b>Name:</b> {order.customer?.name || 'N/A'}</p>
                  <p><b>Email:</b> {order.customer?.email || 'N/A'}</p>
                  <p><b>Phone:</b> {order.customer?.phone || 'N/A'}</p>
                  <p><b>Delivery Address:</b> {order.customer?.address || 'N/A'}</p>
                  <p><b>Delivery Date:</b> {order.customer?.date || 'N/A'}</p>
                  <p><b>Additional Notes:</b> {order.customer?.notes || 'None'}</p>

                  <h3>Ordered Cakes</h3>

                  {order.items?.map((item, index) => (
                    <div className="admin-product-detail" key={`${item.id}-${index}`}>

                      <img src={item.image} alt={item.name} />

                      <span>
                        <b>{item.name}</b>
                        <small>Quantity: {item.qty}</small>
                      </span>

                      <strong>{money(item.price * item.qty)}</strong>

                    </div>
                  ))}

                  <div className="admin-order-total">
                    Total Amount: {money(order.total)}
                  </div>

                </div>
              )}

            </div>
          ))
        ) : (
          <p className="muted">No orders yet.</p>
        )}

      </div>

      
      <div className="admin-section">

        <h2>Custom cake requests</h2>

        {requests.length ? (
          requests.map(request => (
            <div className="admin-row" key={request.id}>

              <span>
                <b>{request.name} · {request.occasion}</b>

                <small>
                  {request.flavor} · {request.size} · {request.date}
                  {request.message && ` · ${request.message}`}
                </small>

                <small>{request.email}</small>
              </span>

              <span>{request.phone}</span>

            </div>
          ))
        ) : (
          <p className="muted">No custom requests yet.</p>
        )}

      </div>

      
      <div className="admin-section">

        <h2>Customer inquiries</h2>

        {inquiries.length ? (
          inquiries.map(inquiry => (
            <div className="admin-row" key={inquiry.id}>

              <span>
                <b>{inquiry.name}</b>
                <small>{inquiry.email}</small>
                <small>{inquiry.phone}</small>
                <small>{inquiry.notes}</small>
              </span>

            </div>
          ))
        ) : (
          <p className="muted">No inquiries yet.</p>
        )}

      </div>

    </section>
  )
}

export default Admin