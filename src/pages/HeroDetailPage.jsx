import { ArrowLeft, Sparkles, Layers } from 'lucide-react'

export default function HeroDetailPage({ hero, onBack }) {
  const buildList = hero.recommended_build
    ? hero.recommended_build.split(',').map((b) => b.trim())
    : []

  return (
    <div className="page">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={18} /> Kembali ke Daftar Hero
      </button>

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
