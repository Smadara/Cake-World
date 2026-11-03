
function Register({
  login,
  setLogin,
  setPage,
  signUp
}) {
  return (
    <section className="login-wrap">
      <form className="panel login" onSubmit={signUp}>

        <p className="eyebrow">CREATE YOUR ACCOUNT</p>

        <h1>
          Join <i>CakeWorld.</i>
        </h1>

        <p className="muted">
          Create your account and enjoy our sweetest cakes.
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
          Create Account ↗
        </button>

        <p className="muted">
          Already have an account?

          <button
            type="button"
            className="text-link"
            onClick={() => setPage('login')}
          >
            Sign in
          </button>
        </p>

      </form>
    </section>
  )
}

export default Register
