import { useMemo, useState, useEffect } from 'react'
import {createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut } from 'firebase/auth'
import { products, money } from './data'
import { firebaseEnabled, auth, db } from './firebase'
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore'
import Login from './Login'
import Register from './Register'
import Order from './Order'
import Account from './Account'
import Admin from './Admin'

const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value))

function App() {
  const [cart,setCart] = useState(read('cb-cart',[]))
  const [orders,setOrders] = useState(read('cb-orders',[]))
  const [requests,setRequests] = useState(read('cb-requests',[]))
  const [inquiries,setInquiries] = useState(read('cb-inquiries',[]))
  const [category,setCategory] = useState('All')
  const [search,setSearch] = useState('')
  const [page,setPage] = useState('home')
  const [selected,setSelected] = useState(null)
  const [showCart,setShowCart] = useState(false)
  const [notice,setNotice] = useState('')
  const [admin,setAdmin] = useState(false)
  const [user,setUser] = useState(read('cb-user',null))
  const [form,setForm] = useState({name:'',email:'',phone:'',address:'',date:'',notes:''})
  const [custom,setCustom] = useState({name:'',email:'',phone:'',occasion:'Birthday',flavor:'Vanilla',size:'1 kg',message:'',date:'',reference:''})
  const [login,setLogin] = useState({email:'',password:''})

  useEffect(() => {
    if (!user || !db) {
      setOrders([])
      return
    }
  
    const ordersRef = collection(db, 'orders')
  
    const ordersQuery = user.role === 'admin'
      ? ordersRef
      : query(
          ordersRef,
          where('customer.email', '==', user.email)
        )
  
    const unsubscribe = onSnapshot(
      ordersQuery,
      snapshot => {
        const firestoreOrders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
  
        firestoreOrders.sort((a, b) => {
          const dateA = a.createdAt?.toMillis?.() || 0
          const dateB = b.createdAt?.toMillis?.() || 0
          return dateB - dateA
        })
  
        setOrders(firestoreOrders)
      },
      error => {
        console.error('Orders loading error:', error)
        flash('Unable to load orders.')
      }
    )
  
    return () => unsubscribe()
  }, [user])
  

  const filtered = useMemo(()=>products.filter(p=>(category==='All'||p.category===category)&&`${p.name} ${p.desc}`.toLowerCase().includes(search.toLowerCase())),[category,search])
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0)
  const updateCart = next => { setCart(next); save('cb-cart',next) }
  const flash = msg => { setNotice(msg); setTimeout(()=>setNotice(''),3200) }
  const add = p => { const exists=cart.find(i=>i.id===p.id); updateCart(exists?cart.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...cart,{...p,qty:1}]); flash('Added to your basket!') }
  const changeQty = (id,delta) => updateCart(cart.map(i=>i.id===id?{...i,qty:i.qty+delta}:i).filter(i=>i.qty>0))
  
  const checkout = async (e) => {
    e.preventDefault()
  
    if (!cart.length) return
  
    if (!user) {
      flash('Please sign in before placing an order.')
      setPage('login')
      return
    }
  
    try {
      const orderData = {
        items: cart,
        total,
        status: 'Pending',
        date: new Date().toLocaleDateString(),
        createdAt: serverTimestamp(),
        customer: {
          ...form,
          email: user.email
        }
      }
  
      const docRef = await addDoc(collection(db, 'orders'), orderData)

console.log('Firestore Order ID:', docRef.id)
console.log('Firebase Project:', db.app.options.projectId)
  
      updateCart([])
      setPage('home')
      setShowCart(false)
  
      setForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        date: '',
        notes: ''
      })
  
      flash('Order placed successfully!')
  
    } catch (error) {
      console.error('Order saving error:', error)
      flash('Unable to place your order. Please try again.')
    }
  }
  const submitCustom = e => { e.preventDefault(); const next=[{...custom,id:Date.now(),status:'New'} ,...requests];setRequests(next);save('cb-requests',next);setCustom({name:'',email:'',phone:'',occasion:'Birthday',flavor:'Vanilla',size:'1 kg',message:'',date:'',reference:''});flash('Your custom cake request has been sent!');setPage('home') }
  const submitInquiry = e => { e.preventDefault(); const data={...form,id:Date.now()};const next=[data,...inquiries];setInquiries(next);save('cb-inquiries',next);setForm({name:'',email:'',phone:'',address:'',date:'',notes:''});flash('Thank you! Your message has been received.') }
  const signIn = async (e) => {
    e.preventDefault()
  
    try {
      const result = await signInWithEmailAndPassword(
        auth,
        login.email,
        login.password
      )
  
      const email = result.user.email
  
      const u = {
        email,
        role: email.toLowerCase() === 'admin@cakebloom.lk'
          ? 'admin'
          : 'customer'
      }
  
      setUser(u)
      save('cb-user', u)
      setAdmin(u.role === 'admin')
      setPage(u.role === 'admin' ? 'admin' : 'home')
  
      flash('Welcome back to CakeBloom!')
    } catch (error) {
      flash(error.message)
    }
  }
  const signUp = async (e) => {
    e.preventDefault()
  
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        login.email,
        login.password
      )
  
      const u = {
        email: result.user.email,
        role: 'customer'
      }
  
      setUser(u)
      save('cb-user', u)
      setPage('home')
  
      flash('Account created successfully!')
    } catch (error) {
      flash(error.message)
    }
  }
  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
  
      setUser(null)
      save('cb-user', null)
      setAdmin(false)
      setPage('home')
  
      flash('You have signed out.')
    } catch (error) {
      flash(error.message)
    }
  }

  return <div className="app">
    <div className="announcement">Handcrafted with love in Sri Lanka <span>✦</span> Made for your sweetest moments</div>

    <header className="header"><a className="brand" href="#" onClick={()=>setPage('home')}><span className="brand-mark">C</span><span>Cake<span className="brand-light">World</span>
    <small>CAKES MADE WITH LOVE</small>
    </span>
    </a>
      
      <nav>
        <button onClick={()=>setPage('home')}>Home</button>
        <button onClick={()=>{setPage('home');document.getElementById('cakes')?.scrollIntoView({behavior:'smooth'})}}>Our Cakes</button>
        <button onClick={()=>setPage('custom')}>Custom Order</button>
        <button onClick={() => {
            if (page !== 'home') {
              setPage('home')
              setTimeout(() => {
                document.getElementById('contact')?.scrollIntoView({
                  behavior: 'smooth'
                })
              }, 100)
            } else {
              document.getElementById('contact')?.scrollIntoView({
                behavior: 'smooth'
              })
            }
          }}>
            Contact
        </button>
      </nav>

      <div className="header-actions">
      <button
          className="icon-btn"
          onClick={() => setPage(user ? 'account' : 'login')}
        >
          {user ? '◉' : '♙'}
          <span>{user ? 'Account' : 'Sign in'}</span>
      </button>
        <button className="cart-btn" onClick={()=>setShowCart(true)}>Cart <b>{cart.reduce((s,i)=>s+i.qty,0)}</b>
        </button>
        <button className="menu-btn" onClick={()=>setPage('login')}>☰</button>
      </div>
    </header>

    {page==='home'&&<><section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">A LITTLE BIT OF HAPPINESS</p>
          <h1>Every moment<br/>deserves a <i>cake.</i></h1>
        <p className="hero-text">Thoughtfully baked, beautifully decorated, and made just for you. Celebrate life's sweetest moments with CakeBloom.</p>
      
      <div className="hero-buttons">
        <button className="primary" onClick={()=>document.getElementById('cakes').scrollIntoView({behavior:'smooth'})}>Explore our cakes <span>↗</span>
        </button>
        <button className="text-link" onClick={()=>setPage('custom')}>Create your own cake →</button>
      </div>
      
    </div>
    
    <div className="hero-image">
      <img src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200" alt="Beautiful celebration cake"/>
      <div className="image-sticker">Baked<br/><i>with love</i> ♡</div>
    </div>
    </section>
      
      <section className="trust-row">
        <div>
          <b>✿</b>
          <span><strong>Made fresh</strong>
            <small>Prepared for your order</small>
          </span>
        </div>
        
        <div>
          <b>♡</b>
          <span><strong>Made personal</strong>
          <small>Your ideas, our creativity</small>
          </span>
        </div>
          
          <div>
            <span><strong>Made memorable</strong>
            <small>For moments that matter</small>
            </span>
          </div>
      </section>

      <section className="catalog section" id="cakes">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A TASTE OF CAKES</p>
            <h2>Find your <i>favourite.</i></h2>
          </div>
            <p>From little celebrations to once-in-a-lifetime moments,
              <br/>there's something sweet for everyone.
            </p>
        </div>
        
        <div className="filters">
          <div className="categories">
            {['All','Birthday','Chocolate','Wedding','Celebrations'].map(c=>
            <button className={category===c?'active':''} onClick={()=>setCategory(c)} key={c}>{c}</button>)}
          </div>
          
          <input className="search" placeholder="⌕  Find a cake..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>

        <div className="product-grid">
          {filtered.map(p=><article className="product-card" key={p.id}>
            <div className="product-image" onClick={()=>setSelected(p)}>
              <img src={p.image} alt={p.name}/>
              <button className="quick-view"> view ↗</button>
            </div>
          
          <div className="product-info">
            <div>
              <p>{p.category}</p>
            <h3>{p.name}</h3>
            <span>{p.desc}</span>
            </div>
            
            <div className="product-bottom">
              <b>{money(p.price)}</b>
              <button onClick={()=>add(p)}>+ Add to Cart</button>
            </div>
          </div>
          </article>)}
        </div>

        {filtered.length===0&&<p className="empty">No cakes found. Try another search.</p>}
        
        <div className="catalog-bottom">
          <button className="outline" onClick={()=>setPage('custom')}>Can't find what you're dreaming of? Request a custom cake →</button>
        </div>
      </section>

      <section className="custom-banner">
        <div>
          <p className="eyebrow">MADE JUST FOR YOU</p>
          <h2>Dream it. We'll <i>bake it.</i></h2>
          <p>Have a special design in mind? Tell us your ideas, choose your flavours, and let us create something unforgettable.</p>
          
          <button className="primary light" onClick={()=>setPage('custom')}>Start a customize order </button>
        </div>
        
      </section>

      <section className="reviews section">
        <p className="eyebrow">OUR REVIWS</p>
        <h2>Made sweeter by <i>you.</i>
        </h2>
        
        <div className="review-grid">
          <blockquote>“The cake was absolutely beautiful and tasted even better. Everyone loved it!”
            <footer><b>— Nethmi, Colombo</b></footer>
          </blockquote>
          
          <blockquote>“They understood exactly what I wanted. Such a lovely experience from start to finish.”
            <footer><b>— Amaya, Galle</b></footer>
          </blockquote>
            
          <blockquote>“Fresh, delicious and beautifully packed. Definitely ordering again!”
            <footer> <b>— Kavindi, Homagama</b></footer>
          </blockquote>
        </div>
      </section>
    </>}


    {page==='custom'&&
    <section className="form-page">
      <div className="form-intro">
        <p className="eyebrow">YOUR IDEAS</p>
        <h1>A cake as unique<br/>as <i>your moment.</i></h1>
        <p>Share a few details and we'll get back to you to discuss your perfect cake.</p>
        
        <div className="form-tip"> 
        Please submit your customize cake request at least 3 days before your event.
        </div>
      </div>
      
      <form className="panel form" onSubmit={submitCustom}>
        <h2>Custom cake request</h2>
        <div className="form-grid">
          <label>Your name<input required value={custom.name} onChange={e=>setCustom({...custom,name:e.target.value})}/></label>
          <label>Email address<input required type="email" value={custom.email} onChange={e=>setCustom({...custom,email:e.target.value})}/></label>
          <label>Phone number<input required value={custom.phone} onChange={e=>setCustom({...custom,phone:e.target.value})}/></label>
          
          <label>Occasion
            <select value={custom.occasion} onChange={e=>setCustom({...custom,occasion:e.target.value})}>{['Birthday','Wedding','Anniversary','Other'].map(x=>
            <option>{x}</option>)}
            </select>
          </label>

          <label>Preferred flavour
            <select value={custom.flavor} onChange={e=>setCustom({...custom,flavor:e.target.value})}>{['Vanilla','Chocolate','Red velvet','Ribbon','Coffee',].map(x=>
              <option>{x}</option>)}
            </select>
          </label>
          
          <label>Cake size
            <select value={custom.size} onChange={e=>setCustom({...custom,size:e.target.value})}>{['500 g','1 kg','1.5 kg','2 kg','3 kg','Custom size'].map(x=>
              <option>{x}</option>)}#
            </select>
          </label>
          
          <label>Order Required date
            <input required type="date" min={new Date().toISOString().split('T')[0]} value={custom.date} onChange={e=>setCustom({...custom,date:e.target.value})}/>
          </label>
          
          
          <label className="full">Text on the cake
            <input placeholder="e.g. Happy 21st Birthday, Amaya!" value={custom.message} onChange={e=>setCustom({...custom,message:e.target.value})}/>
          </label>
        </div>
        
        <button className="primary wide">Send my cake request ↗</button>
      </form>
    </section>}

          {page === 'login' && (
        <Login
          login={login}
          setLogin={setLogin}
          setPage={setPage}
          signIn={signIn}
        />
      )}

        {page === 'register' && (
          <Register
            login={login}
            setLogin={setLogin}
            setPage={setPage}
            signUp={signUp}
          />
        )}

      {page === 'order' && (
        <Order
          form={form}
          setForm={setForm}
          checkout={checkout}
          setPage={setPage}
        />
      )}

      {page === 'account' && user && (
        <Account
          user={user}
          orders={orders}
          signOut={signOut}
          setPage={setPage}
        />
      )}
          {page === 'admin' && user?.role === 'admin' && (
        <Admin
          orders={orders}
          setOrders={setOrders}
          requests={requests}
          inquiries={inquiries}
          save={save}
        />
      )}

    {user&&<div className="account-strip">
      <span>Signed in as <b>{user.email}</b>
      </span>
    {user.role==='admin'&&
      <button onClick={()=>setPage('admin')}>Admin dashboard</button>}
      <button onClick={signOut}>Sign out</button>
    </div>}

  
<footer className="footer" id="contact">

  <div className="footer-top">

    <a
      className="brand"
      href="#"
      onClick={(e) => {
        e.preventDefault()
        setPage('home')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
    >
      <span className="brand-mark">C</span>

      <span>
        Cake<span className="brand-light">World</span>
        <small>CAKES MADE WITH LOVE</small>
      </span>
    </a>

    <p>
      Life is short. Eat the cake.
      <br />
      And make it a beautiful one.
    </p>

    <button
      className="outline"
      onClick={() => setPage('custom')}
    >
      Let's create something sweet ↗
    </button>

  </div>

  <div className="footer-contact">

    <div className="footer-contact-intro">
      <p className="eyebrow">GET IN TOUCH</p>

      <h2>
        Let's talk <i>cake.</i>
      </h2>

      <p>
        Have questions about our cakes or want to know more
        about our services? We'd love to hear from you.
      </p>
    </div>

    <div className="footer-contact-details">

      <div className="contact-detail">
        <b>✉</b>

        <span>
          <strong>Email</strong>

          <a href="mailto:hello@cakebloom.lk">
            hello@cakebloom.lk
          </a>
        </span>
      </div>

      <div className="contact-detail">
        <b>☎</b>

        <span>
          <strong>Phone</strong>

          <a href="tel:+94771234567">
            +94 71 359 6075
          </a>
        </span>
      </div>

      <div className="contact-detail">
        <b>⌖</b>

        <span>
          <strong>Location</strong>
          <small>Sri Lanka</small>
        </span>
      </div>

    </div>

  </div>

  <div className="footer-bottom">

    <span>© 2026 CakeBloom. All rights reserved.</span>

    <span>Made in Sri Lanka</span>

  </div>

</footer>


    {showCart&&<div className="overlay" onClick={()=>setShowCart(false)}><aside className="drawer" onClick={e=>e.stopPropagation()}>
      <div className="drawer-head"><h2>Your basket <i>({cart.length})</i></h2>
        <button onClick={()=>setShowCart(false)}>✕</button>
      </div>
    {cart.length===0?<div className="empty-cart">
      <span>♡</span>
      <h3>Your basket is waiting.</h3>
      <p>Add something sweet to get started.</p>
      <button className="primary" onClick={()=>setShowCart(false)}>Explore cakes</button>
      </div>:<>
      
      <div className="cart-items">{cart.map(i=>
        <div className="cart-item" key={i.id}><img src={i.image}/>
        <div><b>{i.name}</b>
          <small>{money(i.price)}</small>
        <div className="qty"><button onClick={()=>changeQty(i.id,-1)}>−</button>
        
        {i.qty}<button onClick={()=>changeQty(i.id,1)}>+</button>
      </div>
       </div>
       
       <strong>{money(i.price*i.qty)}</strong>
      </div>)}</div>
      
      <div className="cart-total"><span>Subtotal</span>
        <b>{money(total)}</b>
        </div>
        
        <div className="checkout">
  <button
    className="primary wide"
    onClick={() => {
      setShowCart(false)
      setPage('order')
    }}
  >
    Proceed to Checkout →
  </button>
</div>
      </>}</aside>
      </div>}

    {selected&&<div className="overlay" onClick={()=>setSelected(null)}>
      <div className="quick-modal" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={()=>setSelected(null)}>✕</button>
          <img src={selected.image}/>
      <div>
        
        <p className="eyebrow">{selected.category}</p>
        <h2>{selected.name}</h2>
        <p>{selected.desc}</p>
        <h3>{money(selected.price)}</h3>
        <button className="primary wide" onClick={()=>{add(selected);setSelected(null)}}>Add to basket ↗</button>
      </div>
      </div>
      </div>}

    {notice&&<div className="toast">✓ &nbsp;{notice}</div>}
    <div className="demo-note">{firebaseEnabled?'Firebase configuration detected':'Demo mode · Data is saved in this browser'}</div>
  </div>
}
export default App
