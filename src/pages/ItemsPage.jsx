import { useState, useEffect } from 'react'
import { Search, Loader } from 'lucide-react'
import apiClient from '../config/api'

export default function ItemsPage({ onSelectItem }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('All')

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await apiClient.get('/items')
        setItems(res.data)
      } catch (err) {
        setError('Gagal memuat data item dari server.')
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  const categories = ['All', ...new Set(items.map((i) => i.category))]

  const filtered = items.filter((item) => {
    const matchName = item.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = selectedCat === 'All' || item.category === selectedCat
    return matchName && matchCat
  })

  return (
    <div className="page">
      <header className="page-header">
        <h1>Equipment & Items</h1>
        <p>Daftar Item dan Efek Pasif Mobile Legends</p>
      </header>

      <div className="search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Cari nama item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="pills">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`pill ${selectedCat === cat ? 'active' : ''}`}
            onClick={() => setSelectedCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && (
        <div className="center-state">
          <Loader className="spin" size={28} />
          <p>Memuat daftar item...</p>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      <div className="card-grid">
        {filtered.map((item) => (
          <div key={item.id} className="card" onClick={() => onSelectItem(item)}>
            <img src={item.image_url} alt={item.name} className="card-img" />
            <div className="card-body">
              <span className="badge">{item.category}</span>
              <h3>{item.name}</h3>
              <p className="price">{item.price} Gold</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
