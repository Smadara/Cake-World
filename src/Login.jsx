
function Login({
  login,
  setLogin,
  setPage,
  signIn,
}) {
  return (
    <section className="login-wrap">
      <form className="panel login" onSubmit={signIn}>
        <p className="eyebrow">WELCOME BACK</p>

        <h1>
          Sign in to <i>CakeWorld.</i>
        </h1>

        <p className="muted">
          Sign in to continue your CakeBloom experience.
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

        <button className="primary wide" type="submit">
          Sign in ↗
        </button>

        

        <p className="muted">
          Don't have an account?

          <button
            type="button"
            className="text-link"
            onClick={() => setPage('register')}
          >
            Sign up
          </button>
        </p>
      </form>
    </section>
  )
}

export default Login
