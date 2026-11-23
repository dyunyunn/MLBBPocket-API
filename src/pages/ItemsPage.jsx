import { useState, useEffect } from 'react'
import { Search, Loader, Plus, Heart } from 'lucide-react'
import apiClient from '../config/api'

export default function ItemsPage({ onSelectItem, onAddItem, favItemIds, onToggleFavItem }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('All')

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await apiClient.get('/items')
        setItems(res.data.filter((i) => !i.is_deleted))
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
      <header className="page-header header-row">
        <div>
          <h1>Equipment & Items</h1>
          <p>Daftar Item dan Efek Pasif Mobile Legends</p>
        </div>
        <button className="btn-add" onClick={onAddItem}>
          <Plus size={16} /> Tambah
        </button>
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
        {filtered.map((item) => {
          const isFav = favItemIds.includes(item.id)
          return (
            <div key={item.id} className="card" onClick={() => onSelectItem(item)}>
              <button
                type="button"
                className={`fav-btn ${isFav ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavItem(item.id)
                }}
              >
                <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
              </button>
              <img src={item.image_url} alt={item.name} className="card-img" />
              <div className="card-body">
                <span className="badge">{item.category}</span>
                <h3>{item.name}</h3>
                <p className="price">{item.price} Gold</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
