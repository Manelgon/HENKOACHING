'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  crearProfile,
  actualizarProfile,
  cambiarEmailProfile,
  resetPasswordProfile,
  desactivarProfile,
  reactivarProfile,
  eliminarProfile,
} from '@/actions/profiles'
import type { UserRole } from '@/lib/supabase/database.types'
import { useAction } from '@/shared/feedback/FeedbackContext'

type ProfileRow = {
  id: string
  email: string
  role: UserRole
  nombre: string
  apellidos: string
  telefono: string
  createdAt: string | null
  banned: boolean
  lastSignIn: string | null
  emailConfirmed: boolean
}

const ROLES: UserRole[] = ['admin', 'recruiter', 'candidato', 'empresa']

const ROLE_BADGE: Record<UserRole, string> = {
  admin: 'bg-henko-purple text-white',
  recruiter: 'bg-henko-turquoise text-white',
  candidato: 'bg-henko-greenblue text-henko-turquoise',
  empresa: 'bg-henko-yellow text-yellow-900',
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  const date = new Date(d)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ProfilesAdmin({ profiles }: { profiles: ProfileRow[] }) {
  const router = useRouter()
  const runAction = useAction()
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<UserRole | 'todos'>('todos')
  const [filterEstado, setFilterEstado] = useState<'todos' | 'activos' | 'desactivados' | 'sin_verificar'>('todos')
  const [openCreate, setOpenCreate] = useState(false)
  const [editing, setEditing] = useState<ProfileRow | null>(null)

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      if (filterRole !== 'todos' && p.role !== filterRole) return false
      if (filterEstado === 'activos' && p.banned) return false
      if (filterEstado === 'desactivados' && !p.banned) return false
      if (filterEstado === 'sin_verificar' && p.emailConfirmed) return false
      if (search) {
        const q = search.toLowerCase()
        const hay = `${p.email} ${p.nombre} ${p.apellidos}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [profiles, search, filterRole, filterEstado])

  async function handle(
    description: string,
    successMessage: string,
    fn: () => Promise<{ error?: string; ok?: boolean }>,
  ) {
    const result = await runAction(description, fn, { successMessage })
    if (result.ok) router.refresh()
  }

  return (
    <div>
      {/* Stats rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-7">
        <Stat label="Total" val={profiles.length} bg="bg-white border border-black/5" />
        <Stat label="Admins" val={profiles.filter(p => p.role === 'admin').length} bg="bg-henko-purple" light />
        <Stat label="Candidatos" val={profiles.filter(p => p.role === 'candidato').length} bg="bg-henko-greenblue" />
        <Stat label="Desactivados" val={profiles.filter(p => p.banned).length} bg="bg-[#f2ebe5]" />
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-black/5 mb-5 flex flex-wrap gap-3 items-center">
        <input
          type="search"
          placeholder="Buscar por email o nombre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-gray-200 text-sm font-raleway focus:outline-none focus:ring-2 focus:ring-henko-turquoise/30"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as UserRole | 'todos')}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-raleway"
        >
          <option value="todos">Todos los roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value as typeof filterEstado)}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-raleway"
        >
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="desactivados">Desactivados</option>
          <option value="sin_verificar">Sin verificar</option>
        </select>
        <button
          type="button"
          onClick={() => setOpenCreate(true)}
          className="px-4 py-2 rounded-xl bg-henko-turquoise text-white text-sm font-raleway font-medium hover:opacity-90"
        >
          + Crear usuario
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <table className="w-full text-sm font-raleway">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="text-left px-5 py-3">Email / Nombre</th>
              <th className="text-left px-5 py-3">Rol</th>
              <th className="text-left px-5 py-3">Estado</th>
              <th className="text-left px-5 py-3">Última sesión</th>
              <th className="text-left px-5 py-3">Registro</th>
              <th className="text-right px-5 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-10">Sin resultados</td>
              </tr>
            ) : filtered.map((p) => (
              <tr key={p.id} className="border-t border-black/5 hover:bg-gray-50/50">
                <td className="px-5 py-3">
                  <div className="font-medium text-gray-900">{p.email}</div>
                  <div className="text-xs text-gray-400">{p.nombre} {p.apellidos}</div>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_BADGE[p.role]}`}>
                    {p.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {p.banned ? (
                    <span className="text-red-600 text-xs font-medium">Desactivado</span>
                  ) : !p.emailConfirmed ? (
                    <span className="text-yellow-700 text-xs font-medium">Sin verificar</span>
                  ) : (
                    <span className="text-green-700 text-xs font-medium">Activo</span>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">{fmtDate(p.lastSignIn)}</td>
                <td className="px-5 py-3 text-gray-500 text-xs">{fmtDate(p.createdAt)}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setEditing(p)}
                    className="text-henko-turquoise hover:underline text-xs font-medium"
                  >
                    Gestionar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal crear */}
      {openCreate && (
        <CreateModal
          onClose={() => setOpenCreate(false)}
          onSubmit={async (data) => {
            await handle('Creando usuario', 'Usuario creado', () => crearProfile(data))
            setOpenCreate(false)
          }}
        />
      )}

      {/* Drawer editar */}
      {editing && (
        <EditDrawer
          profile={editing}
          onClose={() => setEditing(null)}
          onUpdate={(data) => handle('Actualizando perfil', 'Perfil actualizado', () => actualizarProfile(editing.id, data))}
          onChangeEmail={(email) => handle('Cambiando email', 'Email actualizado', () => cambiarEmailProfile(editing.id, email))}
          onResetPassword={() => handle('Enviando email de recuperación', 'Email enviado', () => resetPasswordProfile(editing.id))}
          onDesactivar={() => handle('Desactivando cuenta', 'Cuenta desactivada', () => desactivarProfile(editing.id))}
          onReactivar={() => handle('Reactivando cuenta', 'Cuenta reactivada', () => reactivarProfile(editing.id))}
          onEliminar={() => {
            if (!confirm(`¿Eliminar permanentemente a ${editing.email}? Esta acción no se puede deshacer.`)) return
            handle('Eliminando usuario', 'Usuario eliminado', () => eliminarProfile(editing.id))
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function Stat({ label, val, bg, light }: { label: string; val: number; bg: string; light?: boolean }) {
  return (
    <div className={`${bg} rounded-2xl px-6 py-5`}>
      <p className={`text-3xl font-roxborough ${light ? 'text-white' : 'text-gray-900'}`}>{val}</p>
      <p className={`text-xs mt-0.5 ${light ? 'text-white/75' : 'text-gray-500'}`}>{label}</p>
    </div>
  )
}

function CreateModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (data: { email: string; password: string; nombre: string; apellidos: string; role: UserRole; telefono?: string }) => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [role, setRole] = useState<UserRole>('candidato')
  const [telefono, setTelefono] = useState('')

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-7 w-full max-w-md">
        <h3 className="font-roxborough text-2xl mb-5">Crear usuario</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit({ email, password, nombre, apellidos, role, telefono: telefono || undefined })
          }}
          className="space-y-3 font-raleway text-sm"
        >
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field label="Contraseña inicial" type="text" value={password} onChange={setPassword} required minLength={8} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre" value={nombre} onChange={setNombre} required />
            <Field label="Apellidos" value={apellidos} onChange={setApellidos} />
          </div>
          <Field label="Teléfono" value={telefono} onChange={setTelefono} />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Rol</label>
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full px-3 py-2 rounded-xl border border-gray-200">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 text-sm">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-henko-turquoise text-white text-sm font-medium">
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditDrawer({
  profile,
  onClose,
  onUpdate,
  onChangeEmail,
  onResetPassword,
  onDesactivar,
  onReactivar,
  onEliminar,
}: {
  profile: ProfileRow
  onClose: () => void
  onUpdate: (data: { nombre?: string; apellidos?: string; telefono?: string; role?: UserRole }) => void
  onChangeEmail: (email: string) => void
  onResetPassword: () => void
  onDesactivar: () => void
  onReactivar: () => void
  onEliminar: () => void
}) {
  const [nombre, setNombre] = useState(profile.nombre)
  const [apellidos, setApellidos] = useState(profile.apellidos)
  const [telefono, setTelefono] = useState(profile.telefono)
  const [role, setRole] = useState<UserRole>(profile.role)
  const [newEmail, setNewEmail] = useState(profile.email)

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto p-7 font-raleway">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400">Profile</p>
            <h3 className="font-roxborough text-2xl">{profile.email}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button>
        </div>

        <Section title="Datos">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre" value={nombre} onChange={setNombre} />
            <Field label="Apellidos" value={apellidos} onChange={setApellidos} />
          </div>
          <Field label="Teléfono" value={telefono} onChange={setTelefono} />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Rol</label>
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button
            type="button"
            onClick={() => onUpdate({ nombre, apellidos, telefono, role })}
            className="w-full px-4 py-2.5 rounded-xl bg-henko-turquoise text-white text-sm font-medium disabled:opacity-50"
          >
            Guardar cambios
          </button>
        </Section>

        <Section title="Email">
          <Field label="Nuevo email" type="email" value={newEmail} onChange={setNewEmail} />
          <button
            type="button"
            disabled={newEmail === profile.email}
            onClick={() => onChangeEmail(newEmail)}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-50"
          >
            Cambiar email
          </button>
        </Section>

        <Section title="Contraseña">
          <button
            type="button"
            onClick={onResetPassword}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Enviar email de recuperación
          </button>
        </Section>

        <Section title="Estado de la cuenta">
          {profile.banned ? (
            <button
              type="button"
                onClick={onReactivar}
              className="w-full px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium disabled:opacity-50"
            >
              Reactivar cuenta
            </button>
          ) : (
            <button
              type="button"
                onClick={onDesactivar}
              className="w-full px-4 py-2.5 rounded-xl bg-yellow-500 text-white text-sm font-medium disabled:opacity-50"
            >
              Desactivar cuenta
            </button>
          )}
        </Section>

        <Section title="Zona peligrosa">
          <button
            type="button"
            onClick={onEliminar}
            className="w-full px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium disabled:opacity-50"
          >
            Eliminar permanentemente
          </button>
          <p className="text-xs text-gray-400 mt-2">Borra el usuario y todos sus datos relacionados (CVs, solicitudes, perfil).</p>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7 space-y-3">
      <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold">{title}</h4>
      {children}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  minLength,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  minLength?: number
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-henko-turquoise/30"
      />
    </div>
  )
}
