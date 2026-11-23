import { useState } from 'react'
import { ArrowLeft, Save, Loader } from 'lucide-react'
import apiClient from '../config/api'
import { compressImageToBase64 } from '../utils/imageHelper'

export default function HeroFormPage({ initialData, onBack, onSaved }) {
  const isEdit = Boolean(initialData)
  const [form, setForm] = useState({
    name: initialData?.name || '',
    role: initialData?.role || 'Fighter',
    lane: initialData?.lane || 'EXP Lane',
    specialty: initialData?.specialty || '',
    lore: initialData?.lore || '',
    skills: initialData?.skills || '',
    recommended_build: initialData?.recommended_build || '',
    image_url: initialData?.image_url || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const base64 = await compressImageToBase64(file)
      setForm((prev) => ({ ...prev, image_url: base64 }))
    } catch {
      setError('Gagal memproses gambar. Coba file lain.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      image_url:
        form.image_url.trim() ||
        `https://placehold.co/400x400/1e293b/38bdf8?text=${encodeURIComponent(form.name)}`,
    }

    try {
      const res = isEdit
        ? await apiClient.put(`/heroes/${initialData.id}`, payload)
        : await apiClient.post('/heroes', payload)
      onSaved(res.data)
    } catch (err) {
      setError('Gagal menyimpan data hero. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={18} /> Kembali
      </button>

      <div className="detail-card">
        <div className="detail-content">
          <h2>{isEdit ? `Edit Hero: ${initialData.name}` : 'Tambah Hero Baru'}</h2>
          {error && <p className="error-text">{error}</p>}

          <form onSubmit={handleSubmit} className="crud-form">
            <label>
              Nama Hero *
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Contoh: Chou" />
            </label>

            <div className="form-row">
              <label>
                Role *
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="Fighter">Fighter</option>
                  <option value="Mage">Mage</option>
                  <option value="Marksman">Marksman</option>
                  <option value="Assassin">Assassin</option>
                  <option value="Tank">Tank</option>
                  <option value="Support">Support</option>
                </select>
              </label>

              <label>
                Lane *
                <select name="lane" value={form.lane} onChange={handleChange}>
                  <option value="EXP Lane">EXP Lane</option>
                  <option value="Mid Lane">Mid Lane</option>
                  <option value="Gold Lane">Gold Lane</option>
                  <option value="Jungle">Jungle</option>
                  <option value="Roam">Roam</option>
                </select>
              </label>
            </div>

            <label>
              Specialty
              <input name="specialty" value={form.specialty} onChange={handleChange} placeholder="Contoh: Chase / Control" />
            </label>

            <label>
              Lore
              <textarea name="lore" rows="3" value={form.lore} onChange={handleChange} placeholder="Kisah singkat hero..." />
            </label>

            <label>
              Skills
              <textarea name="skills" rows="3" value={form.skills} onChange={handleChange} placeholder="Passive: ... | Skill 1: ... | Ultimate: ..." />
            </label>

            <label>
              Rekomendasi Build Item (pisahkan dengan koma)
              <input name="recommended_build" value={form.recommended_build} onChange={handleChange} placeholder="Tough Boots, Blade of Heptaseas, Endless Battle..." />
            </label>

<label>
              Pilih Gambar dari Direktori (HP / Laptop)
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </label>

            {form.image_url && (
              <img src={form.image_url} alt="Preview" className="img-preview" />
            )}

            <label>
                opsional
              <input
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="Contoh: /images/argus.jpg atau kosongkan"
              />
            </label>

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader size={16} className="spin" /> : <Save size={16} />}
              {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Hero'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
