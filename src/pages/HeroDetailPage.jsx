import { useState } from 'react'
import { ArrowLeft, ShieldAlert, Sparkles, Edit3, Trash2 } from 'lucide-react'
import apiClient from '../config/api'

export default function HeroDetailPage({ hero, onBack, onEdit, onDeleted }) {
  const [deleting, setDeleting] = useState(false)

  const buildList = Array.isArray(hero.recommended_build)
    ? hero.recommended_build
    : typeof hero.recommended_build === 'string'
    ? hero.recommended_build.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const handleSoftDelete = async () => {
    const ok = window.confirm(`Pindahkan "${hero.name}" ke Trash?`)
    if (!ok) return

    setDeleting(true)
    try {
      await apiClient.put(`/heroes/${hero.id}`, { is_deleted: true })
      onDeleted()
    } catch {
      alert('Gagal memindahkan hero ke Trash.')
      setDeleting(false)
    }
  }

  return (
    <div className="page">
      <div className="detail-top-bar">
        <button type="button" className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> Kembali
        </button>
        <div className="action-group">
          <button type="button" className="btn-edit" onClick={() => onEdit(hero)}>
            <Edit3 size={16} /> Edit
          </button>
          <button
            type="button"
            className="btn-danger"
            disabled={deleting}
            onClick={handleSoftDelete}
          >
            <Trash2 size={16} /> {deleting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>

      <div className="detail-card">
        <img src={hero.image_url} alt={hero.name} className="detail-banner" />
        <div className="detail-content">
          <div className="detail-badges">
            <span className="badge">{hero.role}</span>
            <span className="badge secondary">{hero.lane}</span>
          </div>
          <h2>{hero.name}</h2>
          <p className="muted">Specialty: {hero.specialty || '-'}</p>

          {hero.lore && (
            <div className="detail-section">
              <h4>Lore</h4>
              <p>{hero.lore}</p>
            </div>
          )}

          {hero.skills && (
            <div className="detail-section">
              <h4>
                <Sparkles size={16} /> Skills & Gameplay
              </h4>
              <p className="detail-preline">{hero.skills}</p>
            </div>
          )}

          {buildList.length > 0 && (
            <div className="detail-section">
              <h4>
                <ShieldAlert size={16} /> Rekomendasi Build Item
              </h4>
              <div className="build-tags">
                {buildList.map((itemName, idx) => (
                  <span key={idx} className="build-tag">
                    {itemName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
