import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  Trophy,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCheck,
  ShieldCheck,
  Search,
  LockKeyhole,
  Users,
  ListChecks,
  Plus,
  Trash2,
  Save,
  LogOut,
  Copy,
  Download,
  RefreshCw,
  X,
  ChevronRight,
  CircleHelp,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { initialElection, type Election, type PublicData } from '@/lib/election'

type AdminData = {
  election: Election
  version: number
  total: number
  counts: Record<string, Record<string, { name: string; count: number }>>
}
async function api(action: string, data?: unknown) {
  const response = await fetch(`/api/election/${action}`, {
    method: data === undefined ? 'GET' : 'POST',
    headers:
      data === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: data === undefined ? undefined : JSON.stringify(data),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Permintaan tidak berjaya.')
  return result
}
const shortNames = [
  'Ceria & sporting',
  'Kaki borak',
  'Penyelesaian masalah',
  'Ikon warga kerja',
  'Inovasi & inovatif',
  'Paling proaktif',
  'Pegawai cemerlang',
]
const descriptions = [
  'Menceriakan suasana, menyatukan semua.',
  'Sentiasa ada cerita, sentiasa mesra.',
  'Tenang mencari jalan, cekap menyelesaikan.',
  'Menjadi inspirasi kepada warga kerja.',
  'Idea baharu yang membawa perubahan.',
  'Selangkah ke hadapan dalam setiap tindakan.',
  'Komitmen dan kecemerlangan yang dicontohi.',
]
function AwardArt() {
  return (
    <div className="award-art" aria-hidden="true">
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <span className="art-star star-one">✦</span>
      <span className="art-star star-two">✧</span>
      <span className="art-year">2026</span>
      <svg viewBox="0 0 220 250" fill="none">
        <defs>
          <linearGradient
            id="gold"
            x1="45"
            y1="40"
            x2="180"
            y2="230"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#ffebaf" />
            <stop offset=".45" stopColor="#c49a4b" />
            <stop offset="1" stopColor="#816128" />
          </linearGradient>
        </defs>
        <path
          d="M66 38h88v47c0 40-20 61-44 61S66 125 66 85V38Z"
          fill="url(#gold)"
        />
        <path
          d="M67 50H39v25c0 33 22 44 43 44M153 50h28v25c0 33-22 44-43 44"
          stroke="#d5b46d"
          strokeWidth="8"
        />
        <path
          d="M110 145v44m-32 9h64l10 18H68l10-18Z"
          stroke="#d9b66c"
          strokeWidth="9"
        />
        <path d="M62 217h96v15H62z" fill="url(#gold)" />
        <path
          d="m110 64 7 15 17 2-12 12 3 17-15-8-15 8 3-17-12-12 17-2 7-15Z"
          fill="#234c3b"
        />
        <path
          d="M78 46v39c0 22 5 36 17 44"
          stroke="#fff3c7"
          strokeOpacity=".5"
          strokeWidth="3"
        />
      </svg>
      <span className="art-caption">MENGHARGAI • MENGINSPIRASI • MERAIKAN</span>
    </div>
  )
}
export function ElectionApp({ admin = false }: { admin?: boolean }) {
  const [data, setData] = useState<PublicData>({
    election: initialElection,
    version: 1,
    voted: false,
  })
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [active, setActive] = useState(0)
  const [choices, setChoices] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [review, setReview] = useState(false)
  const [busy, setBusy] = useState(false)
  const [help, setHelp] = useState(false)
  async function load() {
    setError('')
    setReady(false)
    try {
      setData(await api('public'))
      setReady(true)
    } catch (e) {
      setError((e as Error).message)
    }
  }
  useEffect(() => {
    if (!admin) void load()
  }, [admin])
  const election = data.election
  const complete = election.categories.filter((c) => choices[c.id]).length
  const category = election.categories[active]
  function go(index: number) {
    setActive(index)
    setSearch('')
  }
  async function submit() {
    setBusy(true)
    setError('')
    try {
      await api('vote', { version: data.version, choices })
      setData((d) => ({ ...d, voted: true }))
      setReview(false)
    } catch (e) {
      setError((e as Error).message)
      setReview(false)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className={`app theme-${election.background}`}>
      <header className="site-header">
        <a className="brand" href="/">
          <span className="brand-icon">
            <Trophy size={23} />
          </span>
          <span>
            ANUGERAH KHAS
            <small>
              KPDN SEGAMAT <b>2026</b>
            </small>
          </span>
        </a>
        <nav>
          <a className={!admin ? 'nav-active' : ''} href="/#undian">
            Ruang undian
          </a>
          <button onClick={() => setHelp(true)}>Panduan undian</button>
          <a
            className={`admin-link ${admin ? 'nav-active' : ''}`}
            href="/admin"
          >
            <LockKeyhole size={14} /> Akses admin <ArrowUpRight size={13} />
          </a>
        </nav>
      </header>
      {admin ? (
        <AdminPanel />
      ) : (
        <main>
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow">
                <span className="status-dot" />
                {election.open ? 'UNDIAN DIBUKA' : 'UNDIAN DITUTUP'}
                <span className="eyebrow-divider" /> EDISI 2026
              </span>
              <h1>
                {election.title === initialElection.title ? (
                  <>
                    Raikan dedikasi.
                    <br />
                    Hargai <em>inspirasi.</em>
                  </>
                ) : (
                  election.title
                )}
              </h1>
              <p>
                Satu pasukan, pelbagai keistimewaan. Berikan penghargaan
                <br className="desktop-break" /> kepada warga kerja pilihan anda
                di KPDN Segamat.
              </p>
              <a className="gold-button" href="#undian">
                Mula mengundi <ArrowUpRight size={17} />
              </a>
              <span className="hero-note">
                <ShieldCheck size={14} /> Pilihan anda dirahsiakan.
              </span>
            </div>
            <AwardArt />
            <div className="hero-bottom">
              <span>
                <Trophy size={15} /> ANUGERAH KHAS KPDN SEGAMAT 2026
              </span>
              <span>Penghargaan bermula dengan anda.</span>
            </div>
          </section>
          <div className="intro-strip">
            <div>
              <span className="strip-icon">
                <ListChecks size={21} />
              </span>
              <span>
                <strong>7 kategori anugerah</strong>
                <small>Pilih seorang bagi setiap kategori</small>
              </span>
            </div>
            <div>
              <span className="strip-icon">
                <Users size={21} />
              </span>
              <span>
                <strong>{election.participants.length} warga kerja</strong>
                <small>Insan hebat di sebalik pasukan kita</small>
              </span>
            </div>
            <div>
              <span className="strip-icon">
                <ShieldCheck size={21} />
              </span>
              <span>
                <strong>Satu peluang mengundi</strong>
                <small>Setiap pilihan anda bermakna</small>
              </span>
            </div>
          </div>
          <section id="undian" className="voting-section">
            <div className="section-heading">
              <div>
                <span className="overline">SUARA ANDA, PENGHARGAAN MEREKA</span>
                <h2>Siapakah pilihan anda?</h2>
                <p>Kenali kategori, pilih calon dan hantarkan undian anda.</p>
              </div>
              <button className="text-button" onClick={() => setHelp(true)}>
                <CircleHelp size={16} /> Cara mengundi
              </button>
            </div>
            {!ready && !error && (
              <div className="public-loading" role="status">
                <span /> Memuatkan senarai undian...
              </div>
            )}
            {error && (
              <div className="error" role="alert">
                {error}
                <button onClick={() => void load()}>
                  <RefreshCw size={14} /> Muat semula
                </button>
              </div>
            )}
            {data.voted ? (
              <div className="success-panel">
                <span className="success-icon">
                  <CheckCheck size={38} />
                </span>
                <span className="overline">UNDIAN BERJAYA DIREKODKAN</span>
                <h2>Terima kasih atas penghargaan anda.</h2>
                <p>
                  Undian daripada pelayar ini telah diterima. Keputusan dikira
                  secara sulit oleh pihak admin.
                </p>
                <a href="/">
                  Kembali ke laman utama <ArrowRight size={16} />
                </a>
              </div>
            ) : !election.open ? (
              <div className="success-panel">
                <LockKeyhole size={35} />
                <h2>Undian telah ditutup.</h2>
                <p>
                  Terima kasih atas sokongan anda kepada warga kerja KPDN
                  Segamat.
                </p>
              </div>
            ) : (
              <div className="voting-layout">
                <aside className="category-sidebar">
                  <div className="sidebar-label">
                    KATEGORI ANUGERAH <span>01—07</span>
                  </div>
                  {election.categories.map((c, i) => (
                    <button
                      key={c.id}
                      className={`category-button ${i === active ? 'selected' : ''} ${choices[c.id] ? 'completed' : ''}`}
                      onClick={() => go(i)}
                    >
                      <span className="category-letter">
                        {choices[c.id] ? <Check size={15} /> : c.id}
                      </span>
                      <span>
                        <small>KATEGORI {c.id}</small>
                        {c.name === initialElection.categories[i].name
                          ? shortNames[i]
                          : c.name.replace(/^ANUGERAH /, '')}
                      </span>
                      <ChevronRight size={15} />
                    </button>
                  ))}
                  <div className="sidebar-note">
                    <LockKeyhole size={15} />
                    <p>
                      Undian adalah sulit.
                      <br />
                      Keputusan hanya boleh dilihat oleh admin.
                    </p>
                  </div>
                </aside>
                <div className="ballot-card">
                  <div className="ballot-top">
                    <span className="category-pill">
                      KATEGORI {category.id}
                    </span>
                    <span>Langkah {active + 1} daripada 7</span>
                  </div>
                  <div className="ballot-title">
                    <div>
                      <h3>
                        {category.name.replace(/^ANUGERAH /, '').toLowerCase()}
                      </h3>
                      <p>{descriptions[active]}</p>
                    </div>
                    <span className="small-award">
                      <Trophy size={25} />
                    </span>
                  </div>
                  <div className="ballot-tools">
                    <span>
                      Pilih <strong>seorang</strong> calon pilihan anda
                    </span>
                    <label className="search">
                      <Search size={16} />
                      <input
                        aria-label="Cari nama peserta"
                        placeholder="Cari nama peserta..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      {search && (
                        <button
                          aria-label="Padam carian"
                          onClick={() => setSearch('')}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </label>
                  </div>
                  <div
                    className={`candidate-grid ${!ready ? 'pending' : ''}`}
                    role="radiogroup"
                    aria-label={category.name}
                    aria-busy={!ready}
                  >
                    {election.participants
                      .filter((p) =>
                        p.name.toLowerCase().includes(search.toLowerCase()),
                      )
                      .map((p) => (
                        <label
                          key={p.id}
                          className={`candidate ${choices[category.id] === p.id ? 'chosen' : ''}`}
                        >
                          <input
                            type="radio"
                            name={category.id}
                            checked={choices[category.id] === p.id}
                            disabled={!ready || busy}
                            onChange={() =>
                              setChoices((old) => ({
                                ...old,
                                [category.id]: p.id,
                              }))
                            }
                          />
                          <span className="candidate-number">
                            {String(
                              election.participants.indexOf(p) + 1,
                            ).padStart(2, '0')}
                          </span>
                          <span className="candidate-name">{p.name}</span>
                          <span className="radio-dot">
                            {choices[category.id] === p.id && (
                              <Check size={11} />
                            )}
                          </span>
                        </label>
                      ))}
                    {election.participants.filter((p) =>
                      p.name.toLowerCase().includes(search.toLowerCase()),
                    ).length === 0 && (
                      <p className="empty">
                        Tiada peserta sepadan dengan carian anda.
                      </p>
                    )}
                  </div>
                  <div className="ballot-footer">
                    <span>
                      <ShieldCheck size={15} /> Pilihan disimpan apabila undian
                      dihantar.
                    </span>
                    <div>
                      {active > 0 && (
                        <button
                          className="icon-button"
                          aria-label="Kategori sebelumnya"
                          onClick={() => go(active - 1)}
                        >
                          <ArrowLeft size={17} />
                        </button>
                      )}
                      {active < 6 ? (
                        <button
                          className="primary-button"
                          disabled={!choices[category.id]}
                          onClick={() => {
                            go(active + 1)
                            document
                              .getElementById('undian')
                              ?.scrollIntoView({ behavior: 'smooth' })
                          }}
                        >
                          Kategori seterusnya <ArrowRight size={16} />
                        </button>
                      ) : (
                        <button
                          className="primary-button"
                          disabled={complete !== 7 || !ready}
                          onClick={() => setReview(true)}
                        >
                          Semak undian <ArrowRight size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!data.voted && election.open && (
              <div className="progress-panel">
                <div>
                  <span className="progress-icon">
                    <ListChecks size={24} />
                  </span>
                  <span>
                    <strong>Perjalanan undian anda</strong>
                    <small>
                      {complete === 7
                        ? 'Semua pilihan lengkap. Anda boleh menyemak undian.'
                        : 'Lengkapkan kesemua 7 kategori sebelum menghantar.'}
                    </small>
                  </span>
                </div>
                <div className="progress-track-wrap">
                  <span>
                    <b>{complete}</b> / 7 kategori dipilih
                  </span>
                  <div className="progress-track">
                    <span
                      style={
                        {
                          '--progress': `${(complete / 7) * 100}%`,
                        } as CSSProperties
                      }
                    />
                  </div>
                </div>
                <button
                  className="primary-button"
                  disabled={complete !== 7 || !ready}
                  onClick={() => setReview(true)}
                >
                  Semak & hantar <ArrowUpRight size={16} />
                </button>
              </div>
            )}
          </section>
        </main>
      )}
      <footer className="site-footer">
        <span>
          <Trophy size={17} /> ANUGERAH KHAS KPDN SEGAMAT 2026
        </span>
        <p>Dibuat untuk menghargai, diundi dengan hati.</p>
        <span>© 2026 KPDN Segamat</span>
      </footer>
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent className="app-dialog">
          <DialogHeader>
            <DialogTitle>Panduan mengundi</DialogTitle>
            <DialogDescription>
              Berikan penghargaan anda dalam tiga langkah.
            </DialogDescription>
          </DialogHeader>
          <ol className="help-list">
            <li>
              Pilih seorang peserta bagi setiap satu daripada tujuh kategori.
            </li>
            <li>
              Semak semua pilihan. Anda boleh kembali untuk mengubahnya sebelum
              penghantaran.
            </li>
            <li>
              Klik Hantar undian. Pilihan yang telah dihantar tidak boleh
              diubah.
            </li>
          </ol>
          <p className="muted">
            Tiada log masuk diperlukan. Had satu undian menggunakan kuki
            pelayar. Peranti atau pelayar lain tidak dapat dikenal pasti sebagai
            orang yang sama.
          </p>
          <button className="primary-button" onClick={() => setHelp(false)}>
            Saya faham <Check size={16} />
          </button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={review}
        onOpenChange={(v) => {
          if (!busy) setReview(v)
        }}
      >
        <DialogContent className="app-dialog">
          <DialogHeader>
            <DialogTitle>Semak pilihan anda</DialogTitle>
            <DialogDescription>
              Pastikan semua pilihan tepat. Undian tidak boleh diubah selepas
              dihantar.
            </DialogDescription>
          </DialogHeader>
          <div className="review-list">
            {election.categories.map((c, i) => (
              <div key={c.id}>
                <span>{c.id}</span>
                <div>
                  <small>{shortNames[i]}</small>
                  <strong>
                    {election.participants.find((p) => p.id === choices[c.id])
                      ?.name || 'Belum dipilih'}
                  </strong>
                </div>
                <button
                  aria-label={`Ubah kategori ${c.id}`}
                  onClick={() => {
                    setReview(false)
                    go(i)
                  }}
                >
                  Ubah
                </button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <button
              className="outline-button"
              disabled={busy}
              onClick={() => setReview(false)}
            >
              Kembali
            </button>
            <button
              className="primary-button"
              disabled={busy || complete !== 7}
              onClick={() => void submit()}
            >
              {busy ? 'Menghantar...' : 'Hantar undian'}{' '}
              <CheckCheck size={16} />
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AdminPanel() {
  const [data, setData] = useState<AdminData | null>(null)
  const [draft, setDraft] = useState<Election | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState('results')
  const [newName, setNewName] = useState('')
  const [resultCategory, setResultCategory] = useState('A')
  const [removeId, setRemoveId] = useState<string | null>(null)
  const dirty =
    !!data && JSON.stringify(data.election) !== JSON.stringify(draft)
  async function load() {
    const value = await api('admin')
    setData(value)
    setDraft(value.election)
  }
  useEffect(() => {
    load()
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [])
  useEffect(() => {
    if (!dirty) return
    const prevent = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', prevent)
    return () => window.removeEventListener('beforeunload', prevent)
  }, [dirty])
  async function login(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('login', { password })
      setPassword('')
      await load()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  async function save() {
    if (!data || !draft) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const result = await api('save', {
        election: draft,
        version: data.version,
      })
      setData({ ...data, ...result })
      setDraft(result.election)
      setNotice('Semua perubahan berjaya disimpan.')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  async function logout() {
    setBusy(true)
    try {
      await api('logout', {})
      setData(null)
      setDraft(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/`)
      setNotice('Link pengundi berjaya disalin.')
    } catch {
      setError('Tidak dapat menyalin. Sila salin pautan yang dipaparkan.')
    }
  }
  function exportResults() {
    if (!data) return
    const rows = [['Kategori', 'Peserta', 'Undian']]
    for (const c of data.election.categories)
      for (const row of resultRows(c.id))
        rows.push([c.name, row.name, String(row.count)])
    const csv =
      '\uFEFF' +
      rows
        .map((r) =>
          r
            .map((s) => `"${s.replace(/"/g, '""').replace(/^[=+@-]/, "'$&")}"`)
            .join(','),
        )
        .join('\r\n')
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = 'keputusan-anugerah-kpdn-2026.csv'
    a.click()
    URL.revokeObjectURL(url)
  }
  function resultRows(id: string) {
    if (!data) return []
    const map = new Map(
      data.election.participants.map((p) => [p.id, { ...p, count: 0 }]),
    )
    Object.entries(data.counts[id] || {}).forEach(([pid, p]) => {
      map.set(pid, {
        id: pid,
        name: map.get(pid)?.name || `${p.name} (dibuang)`,
        count: p.count,
      })
    })
    return Array.from(map.values()).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name),
    )
  }
  if (checking)
    return (
      <main className="admin-main">
        <div className="loading-panel">Menyemak akses admin...</div>
      </main>
    )
  if (!data || !draft)
    return (
      <main className="login-main">
        <div className="login-art">
          <span className="overline">RUANG PENTADBIR</span>
          <h1>
            Di sebalik setiap
            <br />
            <em>penghargaan.</em>
          </h1>
          <p>
            Urus undian, raikan warga kerja dan lihat pilihan mereka di satu
            tempat.
          </p>
          <AwardArt />
        </div>
        <form className="login-card" onSubmit={login}>
          <span className="login-lock">
            <LockKeyhole size={26} />
          </span>
          <h2>Selamat datang, admin.</h2>
          <p>Masukkan kata laluan untuk mengurus anugerah.</p>
          <label>
            Kata laluan
            <input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength={256}
              placeholder="Masukkan kata laluan admin"
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="primary-button" disabled={busy}>
            {busy ? 'Mengesahkan...' : 'Masuk ke ruang admin'}
            <ArrowRight size={17} />
          </button>
          <small>
            <ShieldCheck size={14} /> Akses ini dilindungi kata laluan.
          </small>
          <a href="/">Kembali ke ruang undian</a>
        </form>
      </main>
    )
  return (
    <main className="admin-main">
      <div className="section-heading">
        <div>
          <span className="overline">RUANG PENTADBIR</span>
          <h1>Pengurusan anugerah</h1>
          <p>Urus tetapan dan lihat keputusan undian secara sulit.</p>
        </div>
        <button
          className="outline-button"
          disabled={busy || dirty}
          onClick={() => void logout()}
        >
          <LogOut size={16} /> Log keluar
        </button>
      </div>
      <div className="admin-stats">
        <div>
          <Users />
          <strong>
            {data.total}
            <small>Pengundi selesai</small>
          </strong>
        </div>
        <div>
          <ListChecks />
          <strong>
            {data.total * 7}
            <small>Jumlah pilihan diterima</small>
          </strong>
        </div>
        <div>
          <Trophy />
          <strong>
            {draft.participants.length}
            <small>Peserta · 7 kategori</small>
          </strong>
        </div>
      </div>
      <div className="admin-toolbar">
        <div className="admin-tabs">
          {[
            ['results', 'Keputusan'],
            ['participants', 'Peserta'],
            ['settings', 'Tetapan'],
          ].map(([id, name]) => (
            <button
              key={id}
              className={tab === id ? 'active' : ''}
              onClick={() => setTab(id)}
            >
              {name}
            </button>
          ))}
        </div>
        <button
          className="primary-button"
          disabled={!dirty || busy}
          onClick={() => void save()}
        >
          <Save size={16} />
          {busy ? 'Menyimpan...' : 'Simpan perubahan'}
        </button>
      </div>
      {dirty && (
        <p className="draft-notice">
          Ada perubahan belum disimpan. Klik Simpan perubahan untuk
          menerbitkannya.
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      {tab === 'results' && (
        <section className="admin-card">
          <div className="section-heading">
            <div>
              <h2>Keputusan undian</h2>
              <p>Hanya undian lengkap yang telah dihantar dikira.</p>
            </div>
            <div className="button-row">
              <button
                className="outline-button"
                disabled={dirty || busy}
                onClick={async () => {
                  setBusy(true)
                  setError('')
                  try {
                    await load()
                    setNotice('Keputusan telah dikemas kini.')
                  } catch (e) {
                    setError((e as Error).message)
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                <RefreshCw size={15} /> Segar semula
              </button>
              <button className="outline-button" onClick={exportResults}>
                <Download size={15} /> Eksport CSV
              </button>
            </div>
          </div>
          <label className="field">
            Kategori
            <select
              value={resultCategory}
              onChange={(e) => setResultCategory(e.target.value)}
            >
              {data.election.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}. {c.name}
                </option>
              ))}
            </select>
          </label>
          {data.total === 0 && (
            <p className="empty">
              Belum ada undian diterima. Kongsi link pengundi untuk memulakan.
            </p>
          )}
          <div className="results-table">
            <div className="results-header">
              <span>PESERTA</span>
              <span>UNDIAN</span>
            </div>
            {resultRows(resultCategory).map((p, i) => (
              <div className="result-row" key={p.id}>
                <span className="rank">{String(i + 1).padStart(2, '0')}</span>
                <span className="result-name">
                  {p.name}
                  <span
                    className="result-bar"
                    style={
                      {
                        '--progress': `${data.total ? (p.count / data.total) * 100 : 0}%`,
                      } as CSSProperties
                    }
                  />
                </span>
                <strong>
                  {p.count}
                  <small>
                    {data.total ? Math.round((p.count / data.total) * 100) : 0}%
                  </small>
                </strong>
              </div>
            ))}
          </div>
        </section>
      )}
      {tab === 'participants' && (
        <section className="admin-card">
          <h2>Senarai peserta</h2>
          <p className="muted">
            Senarai yang sama digunakan untuk ketujuh-tujuh kategori. Perubahan
            hanya diterbitkan selepas disimpan.
          </p>
          <form
            className="add-participant"
            onSubmit={(e) => {
              e.preventDefault()
              const name = newName.trim().toUpperCase()
              if (!name) return
              if (
                draft.participants.some((p) => p.name.toUpperCase() === name)
              ) {
                setError('Nama peserta telah wujud.')
                return
              }
              setDraft({
                ...draft,
                participants: [
                  ...draft.participants,
                  { id: crypto.randomUUID(), name },
                ],
              })
              setNewName('')
              setError('')
            }}
          >
            <input
              aria-label="Nama peserta baharu"
              placeholder="Nama penuh peserta baharu"
              required
              minLength={2}
              maxLength={140}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button
              className="primary-button"
              disabled={draft.participants.length >= 300}
            >
              <Plus size={16} /> Tambah peserta
            </button>
          </form>
          <div className="admin-participants">
            {draft.participants.map((p, i) => (
              <div key={p.id}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <input
                  aria-label={`Nama peserta ${i + 1}`}
                  value={p.name}
                  maxLength={140}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      participants: draft.participants.map((v) =>
                        v.id === p.id
                          ? { ...v, name: e.target.value.toUpperCase() }
                          : v,
                      ),
                    })
                  }
                />
                <button
                  className="delete-button"
                  aria-label={`Buang ${p.name}`}
                  disabled={draft.participants.length <= 1}
                  onClick={() => setRemoveId(p.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      {tab === 'settings' && (
        <section className="admin-card settings-card">
          <h2>Tetapan undian</h2>
          <label className="field">
            Nama undian
            <input
              value={draft.title}
              minLength={5}
              maxLength={140}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </label>
          <fieldset>
            <legend>Latar belakang</legend>
            <div className="theme-choices">
              {[
                ['emerald', 'Hijau zamrud'],
                ['midnight', 'Biru malam'],
                ['burgundy', 'Merah delima'],
              ].map(([id, name]) => (
                <label
                  key={id}
                  className={`theme-option ${draft.background === id ? 'active' : ''}`}
                >
                  <span className={`theme-sample theme-${id}`}>
                    <Trophy size={24} />
                  </span>
                  <span>
                    <input
                      type="radio"
                      name="theme"
                      checked={draft.background === id}
                      onChange={() => setDraft({ ...draft, background: id })}
                    />
                    {name}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="toggle-field">
            <span>
              <strong>Buka undian awam</strong>
              <small>
                Tutup untuk menghentikan penghantaran undian baharu.
              </small>
            </span>
            <input
              type="checkbox"
              checked={draft.open}
              onChange={(e) => setDraft({ ...draft, open: e.target.checked })}
            />
          </label>
          <h3>Nama kategori</h3>
          {draft.categories.map((c, i) => (
            <label key={c.id} className="field">
              Kategori {c.id}
              <input
                maxLength={120}
                value={c.name}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    categories: draft.categories.map((v, j) =>
                      j === i ? { ...v, name: e.target.value } : v,
                    ),
                  })
                }
              />
            </label>
          ))}
        </section>
      )}
      <div className="share-panel">
        <span className="strip-icon">
          <ArrowUpRight size={23} />
        </span>
        <div>
          <h3>Jemput semua untuk mengundi</h3>
          <p>Kongsi link ini kepada pengundi. Tiada akses admin diberikan.</p>
          <code>
            {typeof window !== 'undefined' ? window.location.origin : ''}/
          </code>
        </div>
        <button className="outline-button" onClick={() => void copyLink()}>
          <Copy size={16} /> Salin link pengundi
        </button>
      </div>
      <Dialog
        open={!!removeId}
        onOpenChange={(v) => {
          if (!v) setRemoveId(null)
        }}
      >
        <DialogContent className="app-dialog">
          <DialogHeader>
            <DialogTitle>Buang peserta ini?</DialogTitle>
            <DialogDescription>
              {draft.participants.find((p) => p.id === removeId)?.name} akan
              dikeluarkan daripada semua kategori selepas anda menyimpan. Undian
              terdahulu kekal dalam keputusan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              className="outline-button"
              onClick={() => setRemoveId(null)}
            >
              Batal
            </button>
            <button
              className="primary-button"
              onClick={() => {
                setDraft({
                  ...draft,
                  participants: draft.participants.filter(
                    (p) => p.id !== removeId,
                  ),
                })
                setRemoveId(null)
              }}
            >
              Buang peserta
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
