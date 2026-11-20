import { User, Code, GraduationCap } from 'lucide-react'

export default function ProfilePage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Profile & About</h1>
        <p>Informasi Pengembang Aplikasi</p>
      </header>

      <div className="profile-card">
        <div className="avatar">
          <User size={40} />
        </div>
        <h2>Yunita Dwi Ardilasari</h2>
        <p className="muted">NIM: 21120124120001</p>

        <div className="profile-info">
          <div className="info-row">
            <GraduationCap size={18} />
            <span>Teknik Komputer, Universitas Diponegoro</span>
          </div>
          <div className="info-row">
            <Code size={18} />
            <span>Tugas Akhir Praktikum PPB 2026 (PWA)</span>
          </div>
        </div>

        <section className="about-box">
          <h4>Tentang MLBBPocket</h4>
          <p>
            MLBBPocket adalah Progressive Web App (PWA) katalog hero dan rekomendasi
            build item Mobile Legends yang terintegrasi dengan RESTful API buatan
            sendiri menggunakan Node.js, Express.js, dan Supabase.
          </p>
        </section>
      </div>
    </div>
  )
}
