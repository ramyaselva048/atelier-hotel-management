import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { Search, SlidersHorizontal, Plus, X, LoaderCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { deleteHotel, fetchHotels } from '../redux/hotelsSlice'
import HotelCard from '../components/HotelCard'
import Pagination from '../components/Pagination'

const PAGE_SIZE = 6

export default function HotelsPage() {
  const dispatch = useDispatch()
  const { items, total, loading, error } = useSelector(state => state.hotels)
  const [search, setSearch] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [page, setPage] = useState(1)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    dispatch(fetchHotels({
      search,
      minPrice,
      maxPrice,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE
    }))
  }, [dispatch, search, minPrice, maxPrice, page])

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const remove = async hotel => {
    if (!window.confirm(`Delete "${hotel.title}"? This cannot be undone.`)) return
    try {
      await dispatch(deleteHotel(hotel.id)).unwrap()
      setNotice('Hotel deleted successfully.')
      setTimeout(() => setNotice(''), 3000)
      if (items.length === 1 && page > 1) setPage(page - 1)
      else dispatch(fetchHotels({
        search, minPrice, maxPrice,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE
      }))
    } catch {
      setNotice('Unable to delete this hotel. Please try again.')
    }
  }

  return (
    <>
      <Helmet>
        <title>Hotel Collection | Atelier Hotel Management</title>
        <meta name="description" content="Browse and manage hotel details, prices, images and locations with Atelier Hotel Management." />
      </Helmet>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">THE HOTEL DIRECTORY</span>
          <h1>Places worth<br /><em>staying for.</em></h1>
          <p>A refined directory of hotels. Manage hotel details, nightly pricing and locations from one elegant workspace.</p>
          <div className="hero-meta"><span>HOTEL MANAGEMENT</span><i /><span>EST. 2026</span></div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-circle" />
          <div className="art-caption">HOTEL<br />MANAGEMENT.</div>
          <span className="art-index" />
        </div>
      </section>

      <section className="content-section">
        <div className="section-head">
          <div><span className="eyebrow">YOUR HOTELS</span><h2>Hotel collection <sup>{String(total).padStart(2, '0')}</sup></h2></div>
          <Link className="primary-button" to="/hotels/new"><Plus size={17} /> Add hotel</Link>
        </div>

        <div className="filter-bar">
          <label className="search-box">
            <Search size={18} />
            <input value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} placeholder="Search by hotel name..." aria-label="Search hotels by name" />
            {search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')}><X size={15} /></button>}
          </label>
          <div className="price-filters">
            <SlidersHorizontal size={17} /><span>PRICE / NIGHT</span>
            <input aria-label="Minimum price" type="number" min="0" placeholder="Min ₹" value={minPrice} onChange={event => { setMinPrice(event.target.value); setPage(1) }} />
            <span>—</span>
            <input aria-label="Maximum price" type="number" min="0" placeholder="Max ₹" value={maxPrice} onChange={event => { setMaxPrice(event.target.value); setPage(1) }} />
          </div>
        </div>

        {notice && <div className="notice" role="status">{notice}</div>}
        {error && <div className="notice error" role="alert">{error}. Check that the backend and database are running.</div>}
        {loading
          ? <div className="loading"><LoaderCircle className="spin" /> Loading hotels...</div>
          : items.length
            ? <div className="hotel-grid">{items.map(hotel => <HotelCard key={hotel.id} hotel={hotel} onDelete={remove} />)}</div>
            : <div className="empty-state"><span>NO HOTELS FOUND</span><h3>Your next great hotel starts here.</h3><p>Add a hotel or adjust your search filters.</p><Link className="primary-button" to="/hotels/new"><Plus size={16} /> Add first hotel</Link></div>
        }
        <Pagination page={page} pages={pages} onChange={setPage} />
      </section>
    </>
  )
}
