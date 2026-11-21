import { Link, NavLink } from 'react-router-dom'
import { Hotel, Plus, Compass } from 'lucide-react'

export default function Shell({ children }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Atelier Hotels home">
          <span className="brand-mark"><Hotel size={20} /></span>
          <span>ATELIER <b>HOTELS</b><small>HOTEL MANAGEMENT</small></span>
        </Link>
        <nav>
          <NavLink to="/" end>Hotel collection</NavLink>
          <Link className="nav-cta" to="/hotels/new"><Plus size={16} /> Add hotel</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <span>ATELIER HOTEL MANAGEMENT</span>
        <span>Thoughtfully managed hotels.</span>
        <span><Compass size={14} /> Hotel management workspace</span>
      </footer>
    </div>
  )
}
