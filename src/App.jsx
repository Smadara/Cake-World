import { useMemo, useState } from 'react'
import {createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut } from 'firebase/auth'
import { products, money } from './data'
import { firebaseEnabled, auth } from './firebase'

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
  const [isRegister, setIsRegister] = useState(false)

  const filtered = useMemo(()=>products.filter(p=>(category==='All'||p.category===category)&&`${p.name} ${p.desc}`.toLowerCase().includes(search.toLowerCase())),[category,search])
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0)
  const updateCart = next => { setCart(next); save('cb-cart',next) }
  const flash = msg => { setNotice(msg); setTimeout(()=>setNotice(''),3200) }
  const add = p => { const exists=cart.find(i=>i.id===p.id); updateCart(exists?cart.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...cart,{...p,qty:1}]); flash('Added to your basket!') }
  const changeQty = (id,delta) => updateCart(cart.map(i=>i.id===id?{...i,qty:i.qty+delta}:i).filter(i=>i.qty>0))
  const checkout = e => { e.preventDefault(); if(!cart.length)return; const next=[{id:Date.now(),items:cart,total,status:'Pending',date:new Date().toLocaleDateString(),customer:form} ,...orders];setOrders(next);save('cb-orders',next);updateCart([]);setPage('home');setShowCart(false);setForm({name:'',email:'',phone:'',address:'',date:'',notes:''});flash('Order placed successfully! We will contact you to confirm.') }
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
    <header className="header"><a className="brand" href="#" onClick={()=>setPage('home')}><span className="brand-mark">C</span><span>Cake<span className="brand-light">Bloom</span><small>CAKES MADE WITH LOVE</small></span></a>
      <nav><button onClick={()=>setPage('home')}>Home</button><button onClick={()=>{setPage('home');document.getElementById('cakes')?.scrollIntoView({behavior:'smooth'})}}>Our Cakes</button><button onClick={()=>setPage('custom')}>Custom Order</button><button onClick={()=>setPage('contact')}>Contact</button></nav>
      <div className="header-actions"><button className="icon-btn" onClick={()=>setPage('login')}>{user?'◉':'♙'} <span>{user?'Account':'Sign in'}</span></button><button className="cart-btn" onClick={()=>setShowCart(true)}>Bag <b>{cart.reduce((s,i)=>s+i.qty,0)}</b></button><button className="menu-btn" onClick={()=>setPage('login')}>☰</button></div>
    </header>

    {page==='home'&&<><section className="hero"><div className="hero-copy"><p className="eyebrow">A LITTLE BIT OF HAPPINESS</p><h1>Every moment<br/>deserves a <i>cake.</i></h1><p className="hero-text">Thoughtfully baked, beautifully decorated, and made just for you. Celebrate life's sweetest moments with CakeBloom.</p><div className="hero-buttons"><button className="primary" onClick={()=>document.getElementById('cakes').scrollIntoView({behavior:'smooth'})}>Explore our cakes <span>↗</span></button><button className="text-link" onClick={()=>setPage('custom')}>Create your own cake →</button></div><div className="hero-note"><span>✦</span> Freshly baked for every order</div></div><div className="hero-image"><img src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200" alt="Beautiful celebration cake"/><div className="image-sticker">Baked<br/><i>with love</i> ♡</div></div></section>
      <section className="trust-row"><div><b>✿</b><span><strong>Made fresh</strong><small>Prepared for your order</small></span></div><div><b>♡</b><span><strong>Made personal</strong><small>Your ideas, our creativity</small></span></div><div><b>♧</b><span><strong>Made memorable</strong><small>For moments that matter</small></span></div></section>
      <section className="catalog section" id="cakes"><div className="section-heading"><div><p className="eyebrow">A TASTE OF JOY</p><h2>Find your <i>favourite.</i></h2></div><p>From little celebrations to once-in-a-lifetime moments,<br/>there's something sweet for everyone.</p></div><div className="filters"><div className="categories">{['All','Birthday','Chocolate','Wedding','Celebration'].map(c=><button className={category===c?'active':''} onClick={()=>setCategory(c)} key={c}>{c}</button>)}</div><input className="search" placeholder="⌕  Find a cake..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <div className="product-grid">{filtered.map(p=><article className="product-card" key={p.id}><div className="product-image" onClick={()=>setSelected(p)}><img src={p.image} alt={p.name}/><span className="tag">{p.tag}</span><button className="quick-view">Quick view ↗</button></div><div className="product-info"><div><p>{p.category}</p><h3>{p.name}</h3><span>{p.desc}</span></div><div className="product-bottom"><b>{money(p.price)}</b><button onClick={()=>add(p)}>+ Add</button></div></div></article>)}</div>
        {filtered.length===0&&<p className="empty">No cakes found. Try another search.</p>}
        <div className="catalog-bottom"><button className="outline" onClick={()=>setPage('custom')}>Can't find what you're dreaming of? Request a custom cake →</button></div>
      </section>
      <section className="custom-banner"><div><p className="eyebrow">MADE JUST FOR YOU</p><h2>Dream it. We'll <i>bake it.</i></h2><p>Have a special design in mind? Tell us your ideas, choose your flavours, and let us create something unforgettable.</p><button className="primary light" onClick={()=>setPage('custom')}>Start a custom order ↗</button></div><div className="banner-quote">“Every cake tells<br/>a little story.”<span>— CakeBloom kitchen</span></div></section>
      <section className="reviews section"><p className="eyebrow">KIND WORDS</p><h2>Made sweeter by <i>you.</i></h2><div className="review-grid"><blockquote>“The cake was absolutely beautiful and tasted even better. Everyone loved it!”<footer>★★★★★ <b>— Nethmi, Colombo</b></footer></blockquote><blockquote>“They understood exactly what I wanted. Such a lovely experience from start to finish.”<footer>★★★★★ <b>— Amaya, Galle</b></footer></blockquote><blockquote>“Fresh, delicious and beautifully packed. Definitely ordering again!”<footer>★★★★★ <b>— Kavindi, Homagama</b></footer></blockquote></div></section>
    </>}

    {page==='custom'&&<section className="form-page"><div className="form-intro"><p className="eyebrow">YOUR IDEA, OUR OVEN</p><h1>A cake as unique<br/>as <i>your moment.</i></h1><p>Share a few details and we'll get back to you to discuss your perfect cake.</p><div className="form-tip">✦ Please submit your request at least 3 days before your event.</div></div><form className="panel form" onSubmit={submitCustom}><h2>Custom cake request</h2><div className="form-grid"><label>Your name<input required value={custom.name} onChange={e=>setCustom({...custom,name:e.target.value})}/></label><label>Email address<input required type="email" value={custom.email} onChange={e=>setCustom({...custom,email:e.target.value})}/></label><label>Phone number<input required value={custom.phone} onChange={e=>setCustom({...custom,phone:e.target.value})}/></label><label>Occasion<select value={custom.occasion} onChange={e=>setCustom({...custom,occasion:e.target.value})}>{['Birthday','Wedding','Anniversary','Graduation','Baby shower','Other'].map(x=><option>{x}</option>)}</select></label><label>Preferred flavour<select value={custom.flavor} onChange={e=>setCustom({...custom,flavor:e.target.value})}>{['Vanilla','Chocolate','Red velvet','Ribbon','Coffee','Fruit'].map(x=><option>{x}</option>)}</select></label><label>Cake size<select value={custom.size} onChange={e=>setCustom({...custom,size:e.target.value})}>{['500 g','1 kg','1.5 kg','2 kg','3 kg','Custom size'].map(x=><option>{x}</option>)}</select></label><label>Required date<input required type="date" min={new Date().toISOString().split('T')[0]} value={custom.date} onChange={e=>setCustom({...custom,date:e.target.value})}/></label><label>Reference image URL <input placeholder="Paste an image link (optional)" value={custom.reference} onChange={e=>setCustom({...custom,reference:e.target.value})}/></label><label className="full">Text on the cake<input placeholder="e.g. Happy 21st Birthday, Amaya!" value={custom.message} onChange={e=>setCustom({...custom,message:e.target.value})}/></label><label className="full">Tell us about your design<textarea rows="4" placeholder="Colours, theme, decorations and any other details..." value={custom.notes||''} onChange={e=>setCustom({...custom,notes:e.target.value})}/></label></div><button className="primary wide">Send my cake request ↗</button></form></section>}

    {page==='contact'&&<section className="form-page contact-page"><div className="form-intro"><p className="eyebrow">LET'S TALK CAKE</p><h1>We'd love to<br/><i>hear from you.</i></h1><p>Questions, ideas or a little cake-related chat? Send us a message.</p><div className="contact-detail"><b>✉</b><span>hello@cakebloom.lk<small>We usually reply within one business day.</small></span></div><div className="contact-detail"><b>⌖</b><span>Sri Lanka<small>Made with love, delivered with care.</small></span></div></div><form className="panel form" onSubmit={submitInquiry}><h2>Send an inquiry</h2><label>Your name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Email address<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Phone number<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label>Your message<textarea required rows="5" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label><button className="primary wide">Send message ↗</button></form></section>}

    {page === 'login' && (
  <section className="login-wrap">
    <form
      className="panel login"
      onSubmit={isRegister ? signUp : signIn}
    >
      <p className="eyebrow">
        {isRegister ? 'CREATE YOUR ACCOUNT' : 'WELCOME BACK'}
      </p>

      <h1>
        {isRegister ? 'Join ' : 'Sign in to '}
        <i>CakeBloom.</i>
      </h1>

      <p className="muted">
        {isRegister
          ? 'Create your account and enjoy our sweetest cakes.'
          : 'Sign in to continue your CakeBloom experience.'}
      </p>

      <label>Email address</label>
      <input
        required
        type="email"
        value={login.email}
        onChange={e =>
          setLogin({ ...login, email: e.target.value })
        }
        placeholder="you@example.com"
      />

      <label>Password</label>
      <input
        required
        type="password"
        minLength="6"
        value={login.password}
        onChange={e =>
          setLogin({ ...login, password: e.target.value })
        }
        placeholder="At least 6 characters"
      />

      <button className="primary wide">
        {isRegister ? 'Create Account ↗' : 'Sign in ↗'}
      </button>

      <p className="muted">
        {isRegister
          ? 'Already have an account?'
          : "Don't have an account?"}

        <button
          type="button"
          className="text-link"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? ' Sign in' : ' Sign up'}
        </button>
      </p>
    </form>
  </section>
)}

    {page==='admin'&&<section className="admin-page section"><p className="eyebrow">CAKEBLOOM MANAGEMENT</p><h1>Admin <i>dashboard.</i></h1><div className="stats"><div><small>Total orders</small><b>{orders.length}</b></div><div><small>Custom requests</small><b>{requests.length}</b></div><div><small>Inquiries</small><b>{inquiries.length}</b></div></div><h2>Recent orders</h2>{orders.length?orders.map(o=><div className="admin-row" key={o.id}><span><b>Order #{String(o.id).slice(-5)}</b><small>{o.customer?.name} · {o.date}</small></span><strong>{money(o.total)}</strong><select value={o.status} onChange={e=>{const n=orders.map(x=>x.id===o.id?{...x,status:e.target.value}:x);setOrders(n);save('cb-orders',n)}}><option>Pending</option><option>Confirmed</option><option>Preparing</option><option>Dispatched</option><option>Completed</option><option>Cancelled</option></select></div>):<p className="muted">No orders yet.</p>}<h2>Custom cake requests</h2>{requests.length?requests.map(r=><div className="admin-row" key={r.id}><span><b>{r.name} · {r.occasion}</b><small>{r.flavor} · {r.size} · {r.date} · {r.message}</small></span><span>{r.phone}</span></div>):<p className="muted">No custom requests yet.</p>}<h2>Customer inquiries</h2>{inquiries.length?inquiries.map(i=><div className="admin-row" key={i.id}><span><b>{i.name}</b><small>{i.email} · {i.notes}</small></span></div>):<p className="muted">No inquiries yet.</p>}</section>}

    {user&&<div className="account-strip"><span>Signed in as <b>{user.email}</b></span>{user.role==='admin'&&<button onClick={()=>setPage('admin')}>Admin dashboard</button>}<button onClick={signOut}>Sign out</button></div>}
    <footer className="footer"><div className="footer-top"><a className="brand" href="#" onClick={()=>setPage('home')}><span className="brand-mark">C</span><span>Cake<span className="brand-light">Bloom</span><small>CAKES MADE WITH LOVE</small></span></a><p>Life is short. Eat the cake.<br/>And make it a beautiful one.</p><button className="outline" onClick={()=>setPage('custom')}>Let's create something sweet ↗</button></div><div className="footer-bottom"><span>© 2026 CakeBloom. All rights reserved.</span><span>Made with ♡ in Sri Lanka</span></div></footer>

    {showCart&&<div className="overlay" onClick={()=>setShowCart(false)}><aside className="drawer" onClick={e=>e.stopPropagation()}><div className="drawer-head"><h2>Your basket <i>({cart.length})</i></h2><button onClick={()=>setShowCart(false)}>✕</button></div>{cart.length===0?<div className="empty-cart"><span>♡</span><h3>Your basket is waiting.</h3><p>Add something sweet to get started.</p><button className="primary" onClick={()=>setShowCart(false)}>Explore cakes</button></div>:<><div className="cart-items">{cart.map(i=><div className="cart-item" key={i.id}><img src={i.image}/><div><b>{i.name}</b><small>{money(i.price)}</small><div className="qty"><button onClick={()=>changeQty(i.id,-1)}>−</button>{i.qty}<button onClick={()=>changeQty(i.id,1)}>+</button></div></div><strong>{money(i.price*i.qty)}</strong></div>)}</div><div className="cart-total"><span>Subtotal</span><b>{money(total)}</b></div><form className="checkout" onSubmit={checkout}><h3>Delivery details</h3><input required placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input required type="email" placeholder="Email address" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input required placeholder="Phone number" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/><textarea required placeholder="Delivery address" rows="2" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/><label>Preferred delivery date<input required type="date" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><div className="cod">✓ Cash on Delivery</div><button className="primary wide">Place order · {money(total)}</button></form></>}</aside></div>}
    {selected&&<div className="overlay" onClick={()=>setSelected(null)}><div className="quick-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setSelected(null)}>✕</button><img src={selected.image}/><div><p className="eyebrow">{selected.category}</p><h2>{selected.name}</h2><p>{selected.desc}</p><h3>{money(selected.price)}</h3><button className="primary wide" onClick={()=>{add(selected);setSelected(null)}}>Add to basket ↗</button></div></div></div>}
    {notice&&<div className="toast">✓ &nbsp;{notice}</div>}
    <div className="demo-note">{firebaseEnabled?'Firebase configuration detected':'Demo mode · Data is saved in this browser'}</div>
  </div>
}
export default App
