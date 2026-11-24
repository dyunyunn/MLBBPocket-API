import { useState, useEffect } from 'react'
import { Heart, Loader, Filter } from 'lucide-react'
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
  const [filter, setFilter] = useState('all') // 'all' | 'heroes' | 'items'
  const [subFilter, setSubFilter] = useState('all')

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

  const favHeroesBase = heroes.filter((h) => favHeroIds.includes(h.id))
  const favItemsBase = items.filter((i) => favItemIds.includes(i.id))

  const heroRoleOptions = [
    ...new Set([...DEFAULT_ROLES, ...favHeroesBase.map((h) => h.role).filter(Boolean)]),
  ]
  const itemCategoryOptions = [
    ...new Set([
      ...DEFAULT_CATEGORIES,
      ...favItemsBase.map((i) => i.category).filter(Boolean),
    ]),
  ]

  const favHeroes = favHeroesBase.filter(
    (h) => subFilter === 'all' || h.role === subFilter
  )
  const favItems = favItemsBase.filter(
    (i) => subFilter === 'all' || i.category === subFilter
  )

  const totalFav = favHeroesBase.length + favItemsBase.length
  const showHeroes = (filter === 'all' || filter === 'heroes') && favHeroes.length > 0
  const showItems = (filter === 'all' || filter === 'items') && favItems.length > 0

  const isFilteredEmpty =
    (filter === 'all' && favHeroes.length === 0 && favItems.length === 0) ||
    (filter === 'heroes' && favHeroes.length === 0) ||
    (filter === 'items' && favItems.length === 0)

  const handleSelectMainFilter = (nextFilter) => {
    setFilter(nextFilter)
    setSubFilter('all')
  }

  const dropdownLabel =
    filter === 'heroes'
      ? 'Semua Role Hero'
      : filter === 'items'
      ? 'Semua Kategori Item'
      : 'Filter Hero / Item'

  return (
    <div className="page">
      <header className="page-header">
        <h1>Favorites</h1>
        <p>Hero & Item andalan yang kamu simpan</p>
      </header>

      <div className="filter-toolbar">
        <div className="pills">
          <button
            type="button"
            className={`pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleSelectMainFilter('all')}
          >
            All ({totalFav})
          </button>
          <button
            type="button"
            className={`pill ${filter === 'heroes' ? 'active' : ''}`}
            onClick={() => handleSelectMainFilter('heroes')}
          >
            Heroes ({favHeroesBase.length})
          </button>
          <button
            type="button"
            className={`pill ${filter === 'items' ? 'active' : ''}`}
            onClick={() => handleSelectMainFilter('items')}
          >
            Items ({favItemsBase.length})
          </button>
        </div>

        <label className="filter-select-wrap">
          <Filter size={15} />
          <select
            className="filter-select"
            value={subFilter}
            onChange={(e) => setSubFilter(e.target.value)}
            aria-label="Filter Role Hero atau Kategori Item Favorit"
          >
            <option value="all">{dropdownLabel}</option>

            {filter === 'all' && (
              <>
                <optgroup label="Hero (Role)">
                  {heroRoleOptions.map((role) => (
                    <option key={`hero-${role}`} value={role}>
                      {role}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Item (Kategori)">
                  {itemCategoryOptions.map((cat) => (
                    <option key={`item-${cat}`} value={cat}>
                      {cat}
                    </option>
                  ))}
                </optgroup>
              </>
            )}

            {filter === 'heroes' &&
              heroRoleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}

            {filter === 'items' &&
              itemCategoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
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
            {filter === 'heroes'
              ? 'Belum ada Hero favorit yang cocok.'
              : filter === 'items'
              ? 'Belum ada Item favorit yang cocok.'
              : 'Belum ada Hero atau Item favorit.'}
          </p>
          <p className="muted">Klik ikon hati pada kartu untuk menyimpan.</p>
        </div>
      )}

      {!loading && showHeroes && (
        <section className="trash-section">
          {filter === 'all' && (
            <h3 className="trash-title">Hero Favorit ({favHeroes.length})</h3>
          )}
          <div className="card-grid">
            {favHeroes.map((hero) => (
              <div key={hero.id} className="card" onClick={() => onSelectHero(hero)}>
                <button
                  type="button"
                  className="fav-btn active"
                  onClick={(e) => {
                    e.stopPropagation()
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
          {filter === 'all' && (
            <h3 className="trash-title">Item Favorit ({favItems.length})</h3>
          )}
          <div className="card-grid">
            {favItems.map((item) => (
              <div key={item.id} className="card" onClick={() => onSelectItem(item)}>
                <button
                  type="button"
                  className="fav-btn active"
                  onClick={(e) => {
                    e.stopPropagation()
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