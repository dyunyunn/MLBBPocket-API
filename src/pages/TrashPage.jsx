import { useState, useEffect } from 'react'
import { Trash2, RotateCcw, Loader, Filter, Search } from 'lucide-react'
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

export default function TrashPage() {
  const [heroes, setHeroes] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const fetchTrash = async () => {
    setLoading(true)
    try {
      const [hRes, iRes] = await Promise.all([
        apiClient.get('/heroes'),
        apiClient.get('/items'),
      ])
      setHeroes(hRes.data.filter((h) => h.is_deleted))
      setItems(iRes.data.filter((i) => i.is_deleted))
    } catch (err) {
      console.error('Gagal memuat data sampah:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrash()
  }, [])

  const handleRestore = async (type, id) => {
    setBusyId(`${type}-${id}`)
    try {
      await apiClient.put(`/${type}/${id}`, { is_deleted: false })
      if (type === 'heroes') {
        setHeroes((prev) => prev.filter((h) => h.id !== id))
      } else {
        setItems((prev) => prev.filter((i) => i.id !== id))
      }
    } catch {
      alert('Gagal memulihkan data.')
    } finally {
      setBusyId(null)
    }
  }

  const handlePermanentDelete = async (type, id, name) => {
    const ok = window.confirm(`Hapus permanen "${name}"? Data tidak bisa dikembalikan.`)
    if (!ok) return

    setBusyId(`${type}-${id}`)
    try {
      await apiClient.delete(`/${type}/${id}`)
      if (type === 'heroes') {
        setHeroes((prev) => prev.filter((h) => h.id !== id))
      } else {
        setItems((prev) => prev.filter((i) => i.id !== id))
      }
    } catch {
      alert('Gagal menghapus permanen.')
    } finally {
      setBusyId(null)
    }
  }

  const heroRoleOptions = [
    ...new Set([...DEFAULT_ROLES, ...heroes.map((h) => h.role).filter(Boolean)]),
  ]
  const itemCategoryOptions = [
    ...new Set([
      ...DEFAULT_CATEGORIES,
      ...items.map((i) => i.category).filter(Boolean),
    ]),
  ]

  const filteredHeroes = heroes.filter((hero) => {
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

  const filteredItems = items.filter((item) => {
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

  const showHeroes = filteredHeroes.length > 0
  const showItems = filteredItems.length > 0
  const isFilteredEmpty = filteredHeroes.length === 0 && filteredItems.length === 0

  return (
    <div className="page">
      <header className="page-header">
        <h1>Trash / Sampah</h1>
        <p>Pulihkan data terhapus atau hapus permanen</p>
      </header>

      <div className="search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Cari hero atau item di sampah..."
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
            aria-label="Filter Sampah"
          >
            <option value="all">
              Semua Sampah ({heroes.length + items.length})
            </option>

            <optgroup label="Tipe Data">
              <option value="type:heroes">Heroes ({heroes.length})</option>
              <option value="type:items">Items ({items.length})</option>
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
          <p>Memuat data sampah...</p>
        </div>
      )}

      {!loading && isFilteredEmpty && (
        <div className="center-state">
          <Trash2 size={36} style={{ marginBottom: 8, opacity: 0.4 }} />
          <p>
            {selectedFilter === 'all' && !search
              ? 'Tempat sampah kosong.'
              : 'Tidak ada data sampah yang cocok dengan pencarian/filter.'}
          </p>
          <p className="muted">Hero atau Item yang dihapus akan muncul di sini.</p>
        </div>
      )}

      {!loading && showHeroes && (
        <section className="trash-section">
          <h3 className="trash-title">Heroes ({filteredHeroes.length})</h3>
          <div className="trash-list">
            {filteredHeroes.map((hero) => {
              const isBusy = busyId === `heroes-${hero.id}`
              return (
                <div key={hero.id} className="trash-item">
                  <div className="trash-left">
                    <img
                      src={hero.image_url}
                      alt={hero.name}
                      className="trash-thumb"
                    />
                    <div className="trash-info">
                      <h4>{hero.name}</h4>
                      <p className="muted">
                        {hero.role} • {hero.lane}
                      </p>
                    </div>
                  </div>
                  <div className="action-group">
                    <button
                      className="btn-restore"
                      disabled={isBusy}
                      onClick={() => handleRestore('heroes', hero.id)}
                    >
                      <RotateCcw size={15} /> Restore
                    </button>
                    <button
                      className="btn-danger"
                      disabled={isBusy}
                      onClick={() => handlePermanentDelete('heroes', hero.id, hero.name)}
                      title="Hapus Permanen"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {!loading && showItems && (
        <section className="trash-section">
          <h3 className="trash-title">Items ({filteredItems.length})</h3>
          <div className="trash-list">
            {filteredItems.map((item) => {
              const isBusy = busyId === `items-${item.id}`
              return (
                <div key={item.id} className="trash-item">
                  <div className="trash-left">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="trash-thumb item-thumb"
                    />
                    <div className="trash-info">
                      <h4>{item.name}</h4>
                      <p className="muted">
                        {item.category} • {item.price} Gold
                      </p>
                    </div>
                  </div>
                  <div className="action-group">
                    <button
                      className="btn-restore"
                      disabled={isBusy}
                      onClick={() => handleRestore('items', item.id)}
                    >
                      <RotateCcw size={15} /> Restore
                    </button>
                    <button
                      className="btn-danger"
                      disabled={isBusy}
                      onClick={() => handlePermanentDelete('items', item.id, item.name)}
                      title="Hapus Permanen"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
