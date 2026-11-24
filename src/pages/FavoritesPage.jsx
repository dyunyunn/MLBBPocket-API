import { useState, useEffect } from 'react'
import { Heart, Loader, Filter, Search } from 'lucide-react'
import apiClient from '../config/api'

const DEFAULT_ROLES = ['Fighter', 'Marksman', 'Mage', 'Tank', 'Assassin', 'Support']
const DEFAULT_CATEGORIES = [
  'Attack',
  'Magic',
  'Defense',
  'Movement',
  'Jungling',
  'Roaming',
]

export default function FavoritesPage({
  favHeroIds,
  favItemIds,
  onToggleFavHero,
  onToggleFavItem,
  onSelectHero,
  onSelectItem,
}) {
  const [heroes, setHeroes] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [hRes, iRes] = await Promise.all([
          apiClient.get('/heroes'),
          apiClient.get('/items'),
        ])
        setHeroes(hRes.data.filter((h) => !h.is_deleted))
        setItems(iRes.data.filter((i) => !i.is_deleted))
      } catch (err) {
        console.error('Gagal memuat favorit:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // Cek dari kolom database (is_favorite) ATAU state lokal agar tetap sinkron
  const favHeroesBase = heroes.filter(
    (h) => h.is_favorite || favHeroIds.includes(h.id)
  )
  const favItemsBase = items.filter(
    (i) => i.is_favorite || favItemIds.includes(i.id)
  )

  const heroRoleOptions = [
    ...new Set([...DEFAULT_ROLES, ...favHeroesBase.map((h) => h.role).filter(Boolean)]),
  ]
  const itemCategoryOptions = [
    ...new Set([
      ...DEFAULT_CATEGORIES,
      ...favItemsBase.map((i) => i.category).filter(Boolean),
    ]),
  ]

  const favHeroes = favHeroesBase.filter((hero) => {
    const matchName = hero.name.toLowerCase().includes(search.toLowerCase())
    if (!matchName) return false
    if (selectedFilter === 'all' || selectedFilter === 'type:heroes') return true
    if (selectedFilter === 'type:items') return false
    if (selectedFilter.startsWith('role:')) {
      return hero.role === selectedFilter.replace('role:', '')
    }
    if (selectedFilter.startsWith('cat:')) return false
    return true
  })

  const favItems = favItemsBase.filter((item) => {
    const matchName = item.name.toLowerCase().includes(search.toLowerCase())
    if (!matchName) return false
    if (selectedFilter === 'all' || selectedFilter === 'type:items') return true
    if (selectedFilter === 'type:heroes') return false
    if (selectedFilter.startsWith('cat:')) {
      return item.category === selectedFilter.replace('cat:', '')
    }
    if (selectedFilter.startsWith('role:')) return false
    return true
  })

  const showHeroes = favHeroes.length > 0
  const showItems = favItems.length > 0
  const isFilteredEmpty = favHeroes.length === 0 && favItems.length === 0

  return (
    <div className="page">
      <header className="page-header">
        <h1>Favorites</h1>
        <p>Hero & Item andalan yang kamu simpan</p>
      </header>

      <div className="search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Cari nama hero atau item favorit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-toolbar">
        <label className="filter-select-wrap">
          <Filter size={15} />
          <select
            className="filter-select"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            aria-label="Filter Favorit"
          >
            <option value="all">
              Semua Favorit ({favHeroesBase.length + favItemsBase.length})
            </option>

            <optgroup label="Tipe Data">
              <option value="type:heroes">Heroes ({favHeroesBase.length})</option>
              <option value="type:items">Items ({favItemsBase.length})</option>
            </optgroup>

            <optgroup label="Hero (Role)">
              {heroRoleOptions.map((role) => (
                <option key={`hero-${role}`} value={`role:${role}`}>
                  {role}
                </option>
              ))}
            </optgroup>

            <optgroup label="Item (Kategori)">
              {itemCategoryOptions.map((cat) => (
                <option key={`item-${cat}`} value={`cat:${cat}`}>
                  {cat}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
      </div>

      {loading && (
        <div className="center-state">
          <Loader className="spin" size={28} />
          <p>Memuat daftar favorit...</p>
        </div>
      )}

      {!loading && isFilteredEmpty && (
        <div className="center-state">
          <Heart size={36} style={{ marginBottom: 8, opacity: 0.4 }} />
          <p>
            {selectedFilter === 'all' && !search
              ? 'Belum ada Hero atau Item favorit.'
              : 'Tidak ada favorit yang cocok dengan pencarian/filter.'}
          </p>
          <p className="muted">Klik ikon hati pada kartu untuk menyimpan.</p>
        </div>
      )}

      {!loading && showHeroes && (
        <section className="trash-section">
          <h3 className="trash-title">Hero Favorit ({favHeroes.length})</h3>
          <div className="card-grid">
            {favHeroes.map((hero) => (
              <div key={hero.id} className="card" onClick={() => onSelectHero(hero)}>
                <button
                  type="button"
                  className="fav-btn active"
                  onClick={(e) => {
                    e.stopPropagation()
                    setHeroes((prev) =>
                      prev.map((h) =>
                        h.id === hero.id ? { ...h, is_favorite: false } : h
                      )
                    )
                    onToggleFavHero(hero.id)
                  }}
                >
                  <Heart size={14} fill="currentColor" />
                </button>
                <img src={hero.image_url} alt={hero.name} className="card-img" />
                <div className="card-body">
                  <span className="badge">{hero.role}</span>
                  <h3>{hero.name}</h3>
                  <p className="muted">{hero.lane}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && showItems && (
        <section className="trash-section">
          <h3 className="trash-title">Item Favorit ({favItems.length})</h3>
          <div className="card-grid">
            {favItems.map((item) => (
              <div key={item.id} className="card" onClick={() => onSelectItem(item)}>
                <button
                  type="button"
                  className="fav-btn active"
                  onClick={(e) => {
                    e.stopPropagation()
                    setItems((prev) =>
                      prev.map((i) =>
                        i.id === item.id ? { ...i, is_favorite: false } : i
                      )
                    )
                    onToggleFavItem(item.id)
                  }}
                >
                  <Heart size={14} fill="currentColor" />
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
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
