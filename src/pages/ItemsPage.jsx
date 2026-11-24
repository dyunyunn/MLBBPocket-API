import { useState, useEffect } from 'react'
import { Search, Loader, Plus, Heart, Filter } from 'lucide-react'
import apiClient from '../config/api'

const DEFAULT_CATEGORIES = [
  'Attack',
  'Magic',
  'Defense',
  'Movement',
  'Jungling',
  'Roaming',
]

export default function ItemsPage({
  onSelectItem,
  onAddItem,
  favItemIds,
  onToggleFavItem,
}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [priceSort, setPriceSort] = useState('default') // 'default' | 'asc' | 'desc'

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await apiClient.get('/items')
        setItems(res.data.filter((i) => !i.is_deleted))
      } catch {
        setError('Gagal memuat data item dari server.')
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  const categories = [
    'All',
    ...new Set([
      ...DEFAULT_CATEGORIES,
      ...items.map((i) => i.category).filter(Boolean),
    ]),
  ]

  const filtered = items
    .filter((item) => {
      const matchName = item.name.toLowerCase().includes(search.toLowerCase())
      const matchCategory =
        selectedCategory === 'All' || item.category === selectedCategory
      return matchName && matchCategory
    })
    .sort((a, b) => {
      if (priceSort === 'asc') return (Number(a.price) || 0) - (Number(b.price) || 0)
      if (priceSort === 'desc') return (Number(b.price) || 0) - (Number(a.price) || 0)
      return 0
    })

  return (
    <div className="page">
      <header className="page-header header-row">
        <div>
          <h1>Equipment & Items</h1>
          <p>Daftar Item & Statistik Build MLBB</p>
        </div>
        <button type="button" className="btn-add" onClick={onAddItem}>
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

      <div className="filter-toolbar">
        <div className="pills">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <label className="filter-select-wrap">
          <Filter size={15} />
          <select
            className="filter-select"
            value={priceSort}
            onChange={(e) => setPriceSort(e.target.value)}
            aria-label="Urutkan Harga Item"
          >
            <option value="default">Urutan: Default</option>
            <option value="asc">Gold: Termurah</option>
            <option value="desc">Gold: Termahal</option>
          </select>
        </label>
      </div>

      {loading && (
        <div className="center-state">
          <Loader className="spin" size={28} />
          <p>Memuat daftar item...</p>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <div className="center-state">
          <p>Item tidak ditemukan.</p>
        </div>
      )}

      <div className="card-grid">
        {filtered.map((item) => {
          const isFav = favItemIds.includes(item.id)
          return (
            <div
              key={item.id}
              className="card"
              onClick={() => onSelectItem(item)}
            >
              <button
                type="button"
                className={`fav-btn ${isFav ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavItem(item.id)
                }}
              >
                <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
              </button>
              <div className="item-img-wrap">
                <img src={item.image_url} alt={item.name} className="item-img" />
              </div>
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
