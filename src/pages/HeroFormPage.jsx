import { useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
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
    recommended_build: Array.isArray(initialData?.recommended_build)
      ? initialData.recommended_build.join(', ')
      : initialData?.recommended_build || '',
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
    setError('')
    try {
      const base64 = await compressImageToBase64(file)
      setForm((prev) => ({ ...prev, image_url: base64 }))
    } catch {
      setError('Gagal memproses gambar. Coba file lain.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Nama hero wajib diisi.')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      ...form,
      image_url:
        form.image_url.trim() ||
        `https://placehold.co/400x500/1e293b/38bdf8?text=${encodeURIComponent(form.name.trim())}`,
      is_deleted: false,
    }

    try {
      let res
      if (isEdit) {
        res = await apiClient.put(`/heroes/${initialData.id}`, payload)
      } else {
        res = await apiClient.post('/heroes', payload)
      }
      const savedData = Array.isArray(res.data) ? res.data[0] : res.data
      onSaved(savedData || { ...initialData, ...payload })
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

          <form className="crud-form" onSubmit={handleSubmit}>
            <label>
              Nama Hero *
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Contoh: Kagura"
                required
              />
            </label>

            <div className="form-row">
              <label>
                Role *
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="Fighter">Fighter</option>
                  <option value="Marksman">Marksman</option>
                  <option value="Mage">Mage</option>
                  <option value="Tank">Tank</option>
                  <option value="Assassin">Assassin</option>
                  <option value="Support">Support</option>
                </select>
              </label>

              <label>
                Lane *
                <select name="lane" value={form.lane} onChange={handleChange}>
                  <option value="EXP Lane">EXP Lane</option>
                  <option value="Gold Lane">Gold Lane</option>
                  <option value="Mid Lane">Mid Lane</option>
                  <option value="Roam">Roam</option>
                  <option value="Jungling">Jungling</option>
                </select>
              </label>
            </div>

            <label>
              Specialty
              <input
                name="specialty"
                value={form.specialty}
                onChange={handleChange}
                placeholder="Contoh: Poke / Finisher"
              />
            </label>

            <label>
              Lore
              <textarea
                name="lore"
                rows="3"
                value={form.lore}
                onChange={handleChange}
                placeholder="Cerita latar belakang hero..."
              />
            </label>

            <label>
              Skills & Combo
              <textarea
                name="skills"
                rows="5"
                value={form.skills}
                onChange={handleChange}
                placeholder={
                  'Passive: ...\nSkill 1: ...\nSkill 2: ...\nUltimate: ...\nCombo: Skill 1 -> Ultimate -> Skill 1 -> Skill 2'
                }
              />
            </label>

            <label>
              Rekomendasi Build Item
              <input
                name="recommended_build"
                value={form.recommended_build}
                onChange={handleChange}
                placeholder="Pisahkan dengan koma, contoh: Arcane Boots, Clock of Destiny, Holy Crystal"
              />
            </label>

            <label>
              Pilih Gambar dari Direktori (HP / Laptop)
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </label>

            {form.image_url && (
              <img src={form.image_url} alt="Preview" className="img-preview" />
            )}

            <button type="submit" className="btn-primary" disabled={saving}>
              <Save size={18} />{' '}
              {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Hero'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
