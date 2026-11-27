import { useState, useEffect, useMemo } from 'react'
import {
  ArrowLeft,
  Trophy,
  Coins,
  RotateCcw,
  Check,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Zap,
  Sparkles,
  Lightbulb,
} from 'lucide-react'
import apiClient from '../config/api'

const isDeletedFlag = (val) =>
  val === true || val === 1 || String(val).toLowerCase() === 'true'

const ROLE_RULES = {
  mage: {
    primary: ['magic'],
    secondary: ['defense', 'movement'],
    weak: ['attack'],
    tip: 'Tips Mage: pakai 1 sepatu (Movement), lalu fokus ke item Magic untuk burst atau poke. Bisa selipkan 1 item Defense jika lawan banyak Assassin.',
  },
  marksman: {
    primary: ['attack'],
    secondary: ['defense', 'movement'],
    weak: ['magic'],
    tip: 'Tips Marksman: gunakan 1 sepatu (Movement) dan mayoritas item Attack (Attack Speed, Crit, atau Penetration). Tambahkan 1 item Defense di late game biar aman.',
  },
  tank: {
    primary: ['defense'],
    secondary: ['movement'],
    weak: ['attack', 'magic'],
    tip: 'Tips Tank: fokus pada 1 sepatu (Movement) dan 5 item Defense (HP, Armor, Magic Defense, Anti-Heal) supaya kuat menahan serangan di garis depan.',
  },
  fighter: {
    primary: ['attack', 'defense'],
    secondary: ['movement'],
    weak: ['magic'],
    tip: 'Tips Fighter: seimbangkan 1 sepatu (Movement) dengan kombinasi item Attack dan Defense agar damage tetap sakit tapi tidak mudah tumbang saat duel.',
  },
  assassin: {
    primary: ['attack', 'magic'],
    secondary: ['movement', 'defense'],
    weak: [],
    tip: 'Tips Assassin: kombinasikan 1 sepatu (Movement) dengan item damage tinggi (Attack atau Magic sesuai hero) untuk mengeliminasi target utama dengan cepat.',
  },
  support: {
    primary: ['defense', 'magic'],
    secondary: ['movement'],
    weak: ['attack'],
    tip: 'Tips Support: pilih 1 sepatu (Movement), lalu gabungkan item Magic (Cooldown Reduction/Heal) dan Defense agar bisa bertahan lama membantu tim.',
  },
}

const getHeroRecText = (hero) =>
  (
    hero?.recommended_items ||
    hero?.build_items ||
    hero?.recommended_build ||
    ''
  ).toLowerCase()

function getItemMatchTag(hero, item) {
  if (!hero) return { tag: null, priority: 3 }

  const roleKey = (hero.role || '').toLowerCase()
  const rule = ROLE_RULES[roleKey] || {
    primary: ['attack', 'magic', 'defense'],
    secondary: ['movement'],
    weak: [],
  }

  const recText = getHeroRecText(hero)
  const cat = (item.category || '').toLowerCase()

  if (recText && item.name && recText.includes(item.name.toLowerCase())) {
    return { tag: 'rekomendasi', label: 'Rekomendasi', priority: 1 }
  }

  if (
    rule.primary.some((p) => cat.includes(p)) ||
    cat.includes('movement')
  ) {
    return { tag: 'cocok', label: 'Cocok', priority: 2 }
  }

  if (rule.secondary.some((s) => cat.includes(s))) {
    return { tag: null, label: '', priority: 3 }
  }

  return { tag: null, label: '', priority: 4 }
}

function evaluateBuild(hero, items) {
  if (!hero || items.length === 0) return null

  const roleKey = (hero.role || '').toLowerCase()
  const rule = ROLE_RULES[roleKey] || {
    primary: ['attack', 'magic', 'defense'],
    secondary: ['movement'],
    weak: [],
  }

  const recText = getHeroRecText(hero)

  let score = 45
  let primaryCount = 0
  let weakCount = 0
  let recMatchCount = 0
  let movementCount = 0
  let defenseCount = 0
  let totalGold = 0

  items.forEach((item) => {
    const cat = (item.category || '').toLowerCase()
    const price = Number(item.price ?? item.gold ?? 0)
    totalGold += Number.isNaN(price) ? 0 : price

    if (cat.includes('movement')) movementCount += 1
    if (cat.includes('defense')) defenseCount += 1

    if (rule.primary.some((p) => cat.includes(p))) {
      score += 6
      primaryCount += 1
    } else if (rule.secondary.some((s) => cat.includes(s))) {
      score += 3
    } else if (rule.weak.some((w) => cat.includes(w))) {
      score -= 8
      weakCount += 1
    } else {
      score += 1
    }

    if (recText && item.name && recText.includes(item.name.toLowerCase())) {
      score += 5
      recMatchCount += 1
    }
  })

  score += Math.round((items.length / 6) * 12)

  if (movementCount === 1) score += 5
  if (movementCount > 1) score -= 7

  if (roleKey === 'fighter' && defenseCount >= 1 && primaryCount >= 2) {
    score += 4
  }

  const winRate = Math.max(15, Math.min(96, Math.round(score)))

  let verdict = 'Eksperimental / Risiko Tinggi'
  let color = '#f87171'
  if (winRate >= 80) {
    verdict = 'Sangat Kuat (Meta Build)'
    color = '#34d399'
  } else if (winRate >= 65) {
    verdict = 'Cukup Solid & Seimbang'
    color = '#38bdf8'
  } else if (winRate >= 50) {
    verdict = 'Standar (Bisa Dioptimalkan)'
    color = '#fbbf24'
  }

  let phase = 'Early Game'
  if (totalGold >= 10000) phase = 'Late Game'
  else if (totalGold >= 5000) phase = 'Mid Game'

  const notes = []

  if (primaryCount > 0) {
    notes.push({
      type: 'good',
      text: `${primaryCount} item cocok dengan kebutuhan utama role ${hero.role}.`,
    })
  }

  if (recMatchCount > 0) {
    notes.push({
      type: 'good',
      text: `${recMatchCount} item sesuai dengan rekomendasi build resmi ${hero.name}.`,
    })
  }

  if (weakCount > 0) {
    notes.push({
      type: 'warn',
      text: `Ada ${weakCount} item yang kurang sinergi dengan role ${hero.role}, berisiko mengurangi efektivitas damage/ketahanan.`,
    })
  }

  if (movementCount === 0 && items.length >= 3) {
    notes.push({
      type: 'info',
      text: 'Belum ada item Movement (sepatu). Tambahkan 1 sepatu agar rotasi lane lebih cepat.',
    })
  } else if (movementCount > 1) {
    notes.push({
      type: 'warn',
      text: `Terdeteksi ${movementCount} item Movement. Efek movement speed sepatu tidak stack, cukup pilih 1 saja.`,
    })
  }

  if (items.length < 6) {
    notes.push({
      type: 'info',
      text: `Slot baru terisi ${items.length}/6. Lengkapi hingga 6 item untuk melihat potensi maksimal di Late Game.`,
    })
  }

  return { winRate, verdict, color, totalGold, phase, notes }
}

export default function BuildSimulatorPage({ onBack }) {
  const [heroes, setHeroes] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedHero, setSelectedHero] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [itemFilter, setItemFilter] = useState('All')
  const [previewItem, setPreviewItem] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [hRes, iRes] = await Promise.all([
          apiClient.get('/heroes'),
          apiClient.get('/items'),
        ])
        setHeroes((hRes.data || []).filter((h) => !isDeletedFlag(h.is_deleted)))
        setItems((iRes.data || []).filter((i) => !isDeletedFlag(i.is_deleted)))
      } catch (err) {
        console.error('Gagal memuat data simulator:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const toggleItem = (item) => {
    const exists = selectedItems.some((i) => i.id === item.id)
    if (exists) {
      setSelectedItems((prev) => prev.filter((i) => i.id !== item.id))
      return
    }
    if (selectedItems.length >= 6) {
      alert('Maksimal 6 item dalam satu build!')
      return
    }
    setSelectedItems((prev) => [...prev, item])
  }

  const handleAutoFill = () => {
    if (!selectedHero || items.length === 0) return

    const roleKey = (selectedHero.role || '').toLowerCase()
    const rule = ROLE_RULES[roleKey] || {
      primary: ['attack', 'magic', 'defense'],
      secondary: ['movement'],
      weak: [],
    }
    const recText = getHeroRecText(selectedHero)

    const picked = []
    const hasId = (id) => picked.some((p) => p.id === id)
    const hasBoots = () =>
      picked.some((p) => (p.category || '').toLowerCase().includes('movement'))

    // 1. Prioritaskan item yang ada di daftar rekomendasi resmi hero
    items.forEach((item) => {
      if (picked.length >= 6 || hasId(item.id)) return
      const isRec =
        recText && item.name && recText.includes(item.name.toLowerCase())
      if (isRec) {
        const isBoot = (item.category || '').toLowerCase().includes('movement')
        if (isBoot && hasBoots()) return
        picked.push(item)
      }
    })

    // 2. Pastikan punya 1 sepatu (Movement) jika tersedia di katalog
    if (picked.length < 6 && !hasBoots()) {
      const boot = items.find(
        (i) =>
          !hasId(i.id) && (i.category || '').toLowerCase().includes('movement')
      )
      if (boot) picked.push(boot)
    }

    // 3. Lengkapi sisa slot dengan item kategori utama role hero
    items.forEach((item) => {
      if (picked.length >= 6 || hasId(item.id)) return
      const cat = (item.category || '').toLowerCase()
      if (cat.includes('movement')) return
      if (rule.primary.some((p) => cat.includes(p))) {
        picked.push(item)
      }
    })

    // 4. Jika masih kurang dari 6, isi dengan kategori sekunder (selain sepatu)
    items.forEach((item) => {
      if (picked.length >= 6 || hasId(item.id)) return
      const cat = (item.category || '').toLowerCase()
      if (cat.includes('movement')) return
      if (rule.secondary.some((s) => cat.includes(s))) {
        picked.push(item)
      }
    })

    setSelectedItems(picked)
  }

  const handleReset = () => {
    setSelectedHero(null)
    setSelectedItems([])
  }

  const filteredItems = useMemo(() => {
    const base =
      itemFilter === 'All'
        ? items
        : items.filter(
            (i) => (i.category || '').toLowerCase() === itemFilter.toLowerCase()
          )

    if (!selectedHero) return base

    // Urutkan otomatis: Rekomendasi -> Cocok -> Opsional -> Kurang cocok
    return [...base].sort((a, b) => {
      const pa = getItemMatchTag(selectedHero, a).priority
      const pb = getItemMatchTag(selectedHero, b).priority
      return pa - pb
    })
  }, [items, itemFilter, selectedHero])

  const result = useMemo(
    () => evaluateBuild(selectedHero, selectedItems),
    [selectedHero, selectedItems]
  )

  const activeRoleTip = selectedHero
    ? ROLE_RULES[(selectedHero.role || '').toLowerCase()]?.tip
    : null

  return (
    <div className="page sim-page">
      <div className="sim-top-bar">
        <button type="button" className="sim-back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Kembali</span>
        </button>
        {(selectedHero || selectedItems.length > 0) && (
          <button type="button" className="sim-reset-btn" onClick={handleReset}>
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>

      <header className="page-header">
        <h1>Simulasi Build & Win Potential</h1>
        <p>
          Pilih hero lalu coba susun build sendiri atau gunakan isi otomatis untuk pemula
        </p>
      </header>

      {loading ? (
        <p className="muted">Memuat daftar hero dan item...</p>
      ) : (
        <>
          {/* HASIL PREDIKSI */}
          <section className="sim-card sim-result-card">
            {!selectedHero || selectedItems.length === 0 ? (
              <div className="sim-empty-result">
                <Zap size={28} color="#38bdf8" />
                <p>
                  Pilih <strong>1 Hero</strong> lalu klik{' '}
                  <strong>Isi Build Rekomendasi</strong> atau pilih item secara manual
                  untuk melihat potensi kemenangannya.
                </p>
              </div>
            ) : (
              <>
                <div className="sim-result-header">
                  <div>
                    <span className="sim-label">Potensi Kemenangan</span>
                    <div className="sim-score-row">
                      <span className="sim-percent" style={{ color: result.color }}>
                        {result.winRate}%
                      </span>
                      <span
                        className="sim-verdict-badge"
                        style={{
                          borderColor: result.color,
                          color: result.color,
                        }}
                      >
                        <Trophy size={13} />
                        {result.verdict}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sim-progress-track">
                  <div
                    className="sim-progress-fill"
                    style={{
                      width: `${result.winRate}%`,
                      backgroundColor: result.color,
                    }}
                  />
                </div>

                <div className="sim-meta-grid">
                  <div className="sim-meta-box">
                    <span>Hero</span>
                    <strong>
                      {selectedHero.name} ({selectedHero.role})
                    </strong>
                  </div>
                  <div className="sim-meta-box">
                    <span>Total Biaya</span>
                    <strong className="sim-gold">
                      <Coins size={14} /> {result.totalGold.toLocaleString('id-ID')} Gold
                    </strong>
                  </div>
                  <div className="sim-meta-box">
                    <span>Power Spike</span>
                    <strong>{result.phase}</strong>
                  </div>
                </div>

                <div className="sim-notes">
                  <h4>Analisis Build</h4>
                  <ul>
                    {result.notes.map((n, idx) => (
                      <li key={idx} className={`sim-note-${n.type}`}>
                        {n.type === 'good' && <CheckCircle2 size={15} />}
                        {n.type === 'warn' && <AlertTriangle size={15} />}
                        {n.type === 'info' && <Info size={15} />}
                        <span>{n.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </section>

          {/* SLOT BUILD TERPILIH (6 SLOT) */}
          <section className="sim-card">
            <div className="sim-section-head">
              <h3>Slot Build ({selectedItems.length}/6)</h3>
              {selectedHero && (
                <button
                  type="button"
                  className="sim-autofill-btn"
                  onClick={handleAutoFill}
                >
                  <Sparkles size={14} />
                  <span>Isi Rekomendasi</span>
                </button>
              )}
            </div>
            <div className="sim-slots-grid">
              {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
                const slotItem = selectedItems[slotIdx]
                return (
                  <div
                    key={slotIdx}
                    className={`sim-slot ${slotItem ? 'filled' : ''}`}
                    onClick={() => slotItem && toggleItem(slotItem)}
                    title={slotItem ? `Hapus ${slotItem.name}` : 'Slot kosong'}
                  >
                    {slotItem ? (
                      <>
                        <img
                          src={slotItem.image_url || slotItem.image}
                          alt={slotItem.name}
                        />
                        <span className="sim-slot-remove">
                          <X size={11} />
                        </span>
                      </>
                    ) : (
                      <span className="sim-slot-num">{slotIdx + 1}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* STEP 1: PILIH HERO */}
          <section className="sim-card">
            <div className="sim-section-head">
              <h3>1. Pilih Hero</h3>
              {selectedHero && (
                <span className="sim-selected-tag">{selectedHero.name}</span>
              )}
            </div>
            <div className="sim-picker-grid">
              {heroes.map((hero) => {
                const active = selectedHero?.id === hero.id
                return (
                  <div
                    key={hero.id}
                    role="button"
                    tabIndex={0}
                    className={`sim-pick-card ${active ? 'active' : ''}`}
                    onClick={() => setSelectedHero(hero)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedHero(hero)}
                  >
                    <div className="sim-pick-img">
                      <img
                        src={hero.image_url || hero.image}
                        alt={hero.name}
                      />
                      {active && (
                        <span className="sim-check">
                          <Check size={12} />
                        </span>
                      )}
                    </div>
                    <strong className="sim-pick-name">{hero.name}</strong>
                    <span className="sim-pick-sub">{hero.role}</span>
                  </div>
                )
              })}
            </div>
          </section>

          {/* STEP 2: PILIH ITEM */}
          <section className="sim-card">
            <div className="sim-section-head">
              <h3>2. Pilih Item (Maks. 6)</h3>
              <span className="sim-hint-mini">Klik ikon i untuk baca efek</span>
            </div>

            {activeRoleTip && (
              <div className="sim-role-tip">
                <Lightbulb size={16} />
                <span>{activeRoleTip}</span>
              </div>
            )}

            <div className="sim-filter-row">
              {['All', 'Attack', 'Magic', 'Defense', 'Movement'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`sim-pill ${itemFilter === cat ? 'active' : ''}`}
                  onClick={() => setItemFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="sim-picker-grid">
              {filteredItems.map((item) => {
                const active = selectedItems.some((i) => i.id === item.id)
                const price = Number(item.price ?? item.gold ?? 0)
                const match = getItemMatchTag(selectedHero, item)

                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    className={`sim-pick-card ${active ? 'active' : ''}`}
                    onClick={() => toggleItem(item)}
                    onKeyDown={(e) => e.key === 'Enter' && toggleItem(item)}
                  >
                    <button
                      type="button"
                      className="sim-info-btn"
                      title={`Lihat info ${item.name}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewItem(item)
                      }}
                    >
                      <Info size={13} />
                    </button>

                    {match.tag && (
                      <span className={`sim-match-badge ${match.tag}`}>
                        {match.label}
                      </span>
                    )}

                    <div className="sim-pick-img">
                      <img
                        src={item.image_url || item.image}
                        alt={item.name}
                      />
                      {active && (
                        <span className="sim-check">
                          <Check size={12} />
                        </span>
                      )}
                    </div>
                    <strong className="sim-pick-name">{item.name}</strong>
                    <span className="sim-pick-sub">
                      {item.category} • {price}g
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}

      {/* POP-UP INFO ITEM */}
      {previewItem && (
        <div
          className="sim-modal-backdrop"
          onClick={() => setPreviewItem(null)}
        >
          <div className="sim-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sim-modal-header">
              <div className="sim-modal-title">
                <img
                  src={previewItem.image_url || previewItem.image}
                  alt={previewItem.name}
                />
                <div>
                  <h3>{previewItem.name}</h3>
                  <span className="sim-modal-sub">
                    {previewItem.category} •{' '}
                    {Number(previewItem.price ?? previewItem.gold ?? 0)} Gold
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="sim-modal-close"
                onClick={() => setPreviewItem(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="sim-modal-body">
              <div className="sim-modal-block">
                <span className="sim-modal-label">Atribut / Statistik</span>
                <p>
                  {previewItem.attributes ||
                    previewItem.stats ||
                    previewItem.stat ||
                    '-'}
                </p>
              </div>
              <div className="sim-modal-block">
                <span className="sim-modal-label">Efek Pasif Unik</span>
                <p>
                  {previewItem.unique_passive ||
                    previewItem.passive ||
                    previewItem.passive_effect ||
                    '-'}
                </p>
              </div>
              <div className="sim-modal-block">
                <span className="sim-modal-label">Deskripsi</span>
                <p>{previewItem.description || '-'}</p>
              </div>
            </div>

            <button
              type="button"
              className="sim-modal-action"
              onClick={() => {
                toggleItem(previewItem)
                setPreviewItem(null)
              }}
            >
              {selectedItems.some((i) => i.id === previewItem.id)
                ? 'Hapus dari Slot Build'
                : 'Pasang ke Slot Build'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
