import { useState, useEffect } from 'react'
import './App.css'

/* ---------- Helper ---------- */
const day = (n) => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
const fmt = (s) =>
  new Date(s + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
const diff = (s) => Math.round((new Date(s + 'T00:00:00') - new Date(new Date().toDateString())) / 864e5)
const load = (k, d) => {
  try { const x = localStorage.getItem(k); return x ? JSON.parse(x) : d } catch { return d }
}
const persist = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* abaikan */ }
}
const cname = (courses, id) => courses.find((x) => x.id == id)?.name || '(dihapus)'

const PAL = ['#b8ecd6', '#bfe3ff', '#fff1a8', '#d9ccff', '#d8f2a6', '#a8eef0', '#ffe0b3', '#c7f0c0']
const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']

const DEMO_COURSES = () => [
  { id: 1, name: 'Pemrograman Web', code: 'IF301', dosen: 'Dr. Sari Dewi', room: 'Lab 2', sks: 3, c: PAL[0], slots: [{ d: 0, s: 8, l: 2 }, { d: 2, s: 13, l: 2 }] },
  { id: 2, name: 'Basis Data', code: 'IF302', dosen: 'Pak Budi', room: 'R. 304', sks: 3, c: PAL[1], slots: [{ d: 1, s: 9, l: 3 }] },
  { id: 3, name: 'Statistika', code: 'MT201', dosen: 'Bu Ratna', room: 'R. 210', sks: 2, c: PAL[2], slots: [{ d: 3, s: 10, l: 2 }] },
]
const DEMO_TASKS = () => [
  { id: 11, t: 'Membuat landing page', c: 1, due: day(2), done: false },
  { id: 12, t: 'Desain ERD', c: 2, due: day(1), done: false },
  { id: 13, t: 'Latihan soal distribusi', c: 3, due: day(5), done: true },
]

/* ---------- Jadwal Kuliah ---------- */
function Jadwal({ courses }) {
  const hrs = [...Array(9)].map((_, i) => 8 + i)
  const events = courses.flatMap((c) => (c.slots || []).map((x) => ({ ...x, course: c })))
  return (
    <div className="panel">
      <h3>📅 Jadwal Kuliah</h3>
      <div className="sc">
        <div className="sched">
          <div className="sh"></div>
          {DAYS.map((d) => <div className="sh" key={d}>{d}</div>)}
          <div className="tl hrs">
            {hrs.map((h) => <i key={h} style={{ top: (h - 8) * 56 + 'px' }}>{String(h).padStart(2, '0')}:00</i>)}
          </div>
          {DAYS.map((d, di) => (
            <div className="tl" key={d}>
              {hrs.map((h) => <div className="ln" key={h} style={{ top: (h - 8) * 56 + 'px' }}></div>)}
              {events.filter((e) => e.d === di).map((e, i) => (
                <div className="ev" key={i}
                  style={{ top: (e.s - 8) * 56 + 3 + 'px', height: Math.min(e.l, 17 - e.s) * 56 - 6 + 'px', background: e.course.c }}>
                  <b>{e.course.name}</b>{e.course.room}<br />{e.s}:00–{e.s + e.l}:00
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------- Tugas ---------- */
function Tugas({ courses, tasks, setTasks }) {
  const [t, setT] = useState('')
  const [c, setC] = useState('')
  const [d, setD] = useState(day(3))
  const add = () => {
    if (!t.trim() || !courses.length) return
    setTasks([{ id: Date.now(), t: t.trim(), c: +(c || courses[0].id), due: d, done: false }, ...tasks])
    setT('')
  }
  const tog = (id) => setTasks(tasks.map((x) => (x.id === id ? { ...x, done: !x.done } : x)))
  const del = (id) => setTasks(tasks.filter((x) => x.id !== id))
  return (
    <div className="panel">
      <h3>📝 Daftar Tugas</h3>
      {!courses.length && <div className="empty">Tambahkan mata kuliah dulu di menu Mata Kuliah ya 🌱</div>}
      <div className="form">
        <input className="input" placeholder="Nama tugas baru..." value={t}
          onChange={(e) => setT(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <select className="input" value={c} onChange={(e) => setC(e.target.value)}>
          {courses.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        <input className="input" type="date" value={d} onChange={(e) => setD(e.target.value)} />
        <button className="btn sm" onClick={add}>+ Tambah</button>
      </div>
      {tasks.length === 0 && <div className="empty">Belum ada tugas 🎉</div>}
      {tasks.map((x) => (
        <div className={'row ' + (x.done ? 'done' : '')} key={x.id}>
          <button className={'chk ' + (x.done ? 'd' : '')} onClick={() => tog(x.id)}>{x.done ? '✓' : ''}</button>
          <div className="m"><b>{x.t}</b><span>{cname(courses, x.c)} · {fmt(x.due)}</span></div>
          <span className={'tag ' + (x.done ? 'ok' : diff(x.due) < 0 ? 'hot' : '')}>
            {x.done ? 'Selesai' : diff(x.due) < 0 ? 'Terlambat' : 'Belum selesai'}
          </span>
          <button className="ghost" onClick={() => del(x.id)}>🗑</button>
        </div>
      ))}
    </div>
  )
}

/* ---------- Mata Kuliah (input awal semester) ---------- */
const EMPTY = { name: '', code: '', dosen: '', room: '', sks: 3, c: PAL[0], slots: [] }

function Matkul({ courses, setCourses, setTasks }) {
  const [f, setF] = useState(EMPTY)
  const [eid, setEid] = useState(null)
  const [sl, setSl] = useState({ d: 0, s: 8, l: 2 })
  const up = (k, v) => setF({ ...f, [k]: v })
  const num = (k, v) => setSl({ ...sl, [k]: +v })
  const simpan = () => {
    if (!f.name.trim()) return
    const it = { ...f, id: eid || Date.now(), name: f.name.trim() }
    setCourses(eid ? courses.map((x) => (x.id === eid ? it : x)) : [...courses, it])
    setF(EMPTY); setEid(null)
  }
  const edit = (c) => { setF({ ...c, slots: c.slots || [] }); setEid(c.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const del = (id) => { setCourses(courses.filter((x) => x.id !== id)); setTasks((t) => t.filter((x) => x.c !== id)) }
  return (
    <div className="panel">
      <h3>📚 Mata Kuliah Semester Ini</h3>
      <div className="form">
        <input className="input" placeholder="Nama mata kuliah *" value={f.name} onChange={(e) => up('name', e.target.value)} />
        <input className="input" placeholder="Kode (mis. IF301)" value={f.code} onChange={(e) => up('code', e.target.value)} />
        <input className="input" placeholder="Dosen" value={f.dosen} onChange={(e) => up('dosen', e.target.value)} />
        <input className="input" placeholder="Ruangan" value={f.room} onChange={(e) => up('room', e.target.value)} />
        <input className="input" type="number" min="1" max="6" placeholder="SKS" value={f.sks} onChange={(e) => up('sks', e.target.value)} />
      </div>
      <div className="sub">Warna kartu</div>
      <div style={{ marginBottom: 6 }}>
        {PAL.map((c) => <button key={c} className={'sw ' + (f.c === c ? 'on' : '')} style={{ background: c }} onClick={() => up('c', c)} />)}
      </div>
      <div className="sub">Jadwal pertemuan</div>
      <div className="form">
        <select className="input" value={sl.d} onChange={(e) => num('d', e.target.value)}>
          {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
        </select>
        <select className="input" value={sl.s} onChange={(e) => num('s', e.target.value)}>
          {[8, 9, 10, 11, 12, 13, 14, 15].map((h) => <option key={h} value={h}>Mulai {h}:00</option>)}
        </select>
        <select className="input" value={sl.l} onChange={(e) => num('l', e.target.value)}>
          {[1, 2, 3, 4].map((h) => <option key={h} value={h}>{h} jam</option>)}
        </select>
        <button className="btn sm" onClick={() => up('slots', [...f.slots, { ...sl }])}>+ Sesi</button>
      </div>
      <div>
        {f.slots.map((x, i) => (
          <span className="chip" key={i}>
            {DAYS[x.d]} {x.s}:00–{x.s + x.l}:00
            <button onClick={() => up('slots', f.slots.filter((_, j) => j !== i))}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, margin: '10px 0 20px' }}>
        <button className="btn sm" onClick={simpan}>{eid ? '💾 Perbarui' : '✅ Simpan Mata Kuliah'}</button>
        {eid && <button className="ghost" onClick={() => { setF(EMPTY); setEid(null) }}>Batal</button>}
      </div>
      {courses.length === 0 && (
        <div className="empty">
          Belum ada mata kuliah. Isi form di atas untuk memulai semester barumu 🌱<br /><br />
          <button className="ghost" onClick={() => { setCourses(DEMO_COURSES()); setTasks(DEMO_TASKS()) }}>Muat data contoh</button>
        </div>
      )}
      <div className="grid">
        {courses.map((c) => (
          <div className="mk" key={c.id} style={{ background: c.c }}>
            <span>{c.code || '—'} · {c.sks} SKS</span>
            <b>{c.name}</b>
            {c.dosen && <span>👩‍🏫 {c.dosen}</span>}
            {c.room && <span>📍 {c.room}</span>}
            {(c.slots || []).map((x, i) => <span key={i}>🕒 {DAYS[x.d]} {x.s}:00–{x.s + x.l}:00</span>)}
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <button className="ghost" onClick={() => edit(c)}>✏️ Edit</button>
              <button className="ghost" onClick={() => del(c.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Deadline ---------- */
function Deadline({ courses, tasks }) {
  const list = tasks.filter((x) => !x.done).sort((a, b) => a.due.localeCompare(b.due))
  return (
    <div className="panel">
      <h3>⏰ Deadline Terdekat</h3>
      {list.length === 0 && <div className="empty">Tidak ada tugas yang menunggu, kamu keren! ✨</div>}
      {list.map((x) => {
        const n = diff(x.due)
        return (
          <div className="row" key={x.id}>
            <div className="m"><b>{x.t}</b><span>{cname(courses, x.c)} · {fmt(x.due)}</span></div>
            <span className={'tag ' + (n <= 1 ? 'hot' : '')}>
              {n < 0 ? `Lewat ${-n} hari` : n === 0 ? 'Hari ini!' : n === 1 ? 'Besok' : `${n} hari lagi`}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ---------- Progress Akademik ---------- */
function Progress({ courses, tasks }) {
  const done = tasks.filter((x) => x.done).length
  const tot = tasks.length
  const pct = tot ? Math.round((done / tot) * 100) : 0
  const R = 52, C = 2 * Math.PI * R
  return (
    <div className="panel">
      <h3>📈 Progress Akademik</h3>
      <div className="prog">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={R} fill="none" stroke="var(--pink2)" strokeWidth="14" />
          <circle cx="70" cy="70" r={R} fill="none" stroke="#2fa886" strokeWidth="14" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dashoffset .6s' }} />
          <text x="70" y="76" textAnchor="middle" fontSize="26" fontWeight="700" fill="currentColor">{pct}%</text>
        </svg>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{done} dari {tot} tugas selesai</div>
          <span className="tag ok" style={{ display: 'inline-block', marginTop: 8, marginRight: 6 }}>✓ {done} Selesai</span>
          <span className="tag" style={{ display: 'inline-block' }}>⏳ {tot - done} Belum</span>
        </div>
      </div>
      {courses.map((c) => {
        const ts = tasks.filter((x) => x.c === c.id)
        const dn = ts.filter((x) => x.done).length
        const p = ts.length ? Math.round((dn / ts.length) * 100) : 0
        return (
          <div style={{ marginBottom: 12 }} key={c.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <b>{c.name}</b><span>{dn}/{ts.length} · {p}%</span>
            </div>
            <div className="bar"><div style={{ width: p + '%' }}></div></div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------- App (Dashboard) ---------- */
const MENU = [
  ['jadwal', '📅', 'Jadwal Kuliah'],
  ['tugas', '📝', 'Tugas'],
  ['matkul', '📚', 'Mata Kuliah'],
  ['deadline', '⏰', 'Deadline'],
  ['progress', '📈', 'Progress Akademik'],
]

export default function App() {
  const [courses, setCourses] = useState(() => load('sad_courses', []))
  const [tasks, setTasks] = useState(() => load('sad_tasks', []))
  const [v, setV] = useState(() => (load('sad_courses', []).length ? null : 'matkul'))

  useEffect(() => persist('sad_courses', courses), [courses])
  useEffect(() => persist('sad_tasks', tasks), [tasks])

  const urgent = tasks.filter((x) => !x.done && diff(x.due) <= 2).length
  const heroText = !courses.length
    ? 'Awali semestermu: tambah mata kuliah dulu'
    : urgent ? `Ada ${urgent} tugas dengan deadline dekat` : 'Tidak ada deadline mendesak'

  return (
    <div className="wrap">
      <div className="top">
        <div>
          <h2>Halo, Mahasiswa! 🌿</h2>
          <small>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</small>
        </div>
      </div>
      <div className="hero">
        <h3>{heroText}</h3>
        <p>Klik ikon di bawah untuk mengatur kuliahmu. Semangat ya! 💪</p>
      </div>
      <div className="menu">
        {MENU.map(([k, i, l]) => (
          <button key={k} className={'mi ' + (v === k ? 'on' : '')} onClick={() => setV(k)}>
            <span className="ic">{i}</span><b>{l}</b>
          </button>
        ))}
      </div>
      {v === null && <div className="panel empty">Pilih salah satu menu di atas untuk memulai ✨</div>}
      {v === 'jadwal' && <Jadwal courses={courses} />}
      {v === 'tugas' && <Tugas courses={courses} tasks={tasks} setTasks={setTasks} />}
      {v === 'matkul' && <Matkul courses={courses} setCourses={setCourses} setTasks={setTasks} />}
      {v === 'deadline' && <Deadline courses={courses} tasks={tasks} />}
      {v === 'progress' && <Progress courses={courses} tasks={tasks} />}
    </div>
  )
}
