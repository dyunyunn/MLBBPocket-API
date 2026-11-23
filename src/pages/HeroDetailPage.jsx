import { useState } from 'react'
import { ArrowLeft, Sparkles, Layers, Pencil, Trash2 } from 'lucide-react'
import apiClient from '../config/api'

export default function HeroDetailPage({ hero, onBack, onEdit, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const buildList = hero.recommended_build
    ? hero.recommended_build.split(',').map((b) => b.trim())
    : []

  const handleDelete = async () => {
    if (!window.confirm(`Yakin ingin memindahkan hero "${hero.name}" ke Trash?`)) return
    setDeleting(true)
    try {
      await apiClient.put(`/heroes/${hero.id}`, { ...hero, is_deleted: true })
      onDeleted()
    } catch (err) {
      alert('Gagal menghapus hero.')
      setDeleting(false)
    }
  }

  return (
    <div className="page">
      <div className="detail-top-bar">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> Kembali
        </button>
        <div className="action-group">
          <button className="btn-edit" onClick={() => onEdit(hero)}>
            <Pencil size={15} /> Edit
          </button>
          <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
            <Trash2 size={15} /> {deleting ? 'Menghapus...' : 'Hapus'}
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
          <p className="muted">Specialty: {hero.specialty}</p>

          <section className="detail-section">
            <h4>Lore</h4>
            <p>{hero.lore}</p>
          </section>

          <section className="detail-section">
            <h4><Sparkles size={16} /> Skills</h4>
            <p>{hero.skills}</p>
          </section>

          <section className="detail-section">
            <h4><Layers size={16} /> Rekomendasi Build Item</h4>
            <div className="build-tags">
              {buildList.map((item, idx) => (
                <span key={idx} className="build-tag">
                  {idx + 1}. {item}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}