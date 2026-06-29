/**
 * StorageService — v4 Supabase + Auth email (admin) + usuario/contraseña (docentes)
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapEval(row) {
  return {
    id:          row.id,
    timestamp:   row.timestamp,
    teacherId:   row.teacher_id,
    teacherName: row.teacher_name,
    courseId:    row.course_id,
    subject:     row.subject,
    role:        row.role,
    dimensions: {
      clima:         row.score_clima         ?? null,
      espacio:       row.score_espacio       ?? null,
      participacion: row.score_participacion ?? null,
      convivencia:   row.score_convivencia   ?? null,
    },
    average: parseFloat(row.average),
  }
}

function toRow(e) {
  return {
    id:                   e.id,
    timestamp:            e.timestamp,
    teacher_id:           e.teacherId,
    teacher_name:         e.teacherName,
    course_id:            e.courseId,
    subject:              e.subject,
    role:                 e.role,
    score_clima:          e.dimensions.clima         ?? null,
    score_espacio:        e.dimensions.espacio       ?? null,
    score_participacion:  e.dimensions.participacion ?? null,
    score_convivencia:    e.dimensions.convivencia   ?? null,
    average:              e.average,
  }
}

// ─── API pública ──────────────────────────────────────────────────────────────

export const StorageService = {

  isInitialized: () => true,
  seed: () => {},

  // ── Evaluaciones ─────────────────────────────────────────────────────────────

  async getEvaluations() {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .order('timestamp', { ascending: true })
    if (error) { console.error(error); return [] }
    return data.map(mapEval)
  },

  async saveEvaluation(evaluation) {
    const { data, error } = await supabase
      .from('evaluations')
      .insert(toRow(evaluation))
      .select()
      .single()
    if (error) { console.error(error); return evaluation }
    return mapEval(data)
  },

  async getEvaluationsByCourse(courseId) {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('course_id', courseId)
      .order('timestamp', { ascending: true })
    if (error) { console.error(error); return [] }
    return data.map(mapEval)
  },

  async getEvaluationsByTeacher(teacherId) {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('timestamp', { ascending: false })
      .limit(8)
    if (error) { console.error(error); return [] }
    return data.map(mapEval)
  },

  // ── Catálogos ─────────────────────────────────────────────────────────────────

  async getCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('year')
    if (error) { console.error(error); return [] }
    return data
  },

  async getTeachers() {
    const { data, error } = await supabase
      .from('teachers')
      .select('id, name, role, username, active, must_change_password')
      .order('name')
    if (error) { console.error(error); return [] }
    return data
  },

  async getSubjects() {
    const { data, error } = await supabase
      .from('subjects')
      .select('name')
      .order('name')
    if (error) { console.error(error); return [] }
    return data.map(r => r.name)
  },

  // ── Auth docentes (usuario + contraseña via RPC) ───────────────────────────

  async teacherLogin(username, password) {
    const { data, error } = await supabase.rpc('verify_teacher', {
      p_username: username.trim().toLowerCase(),
      p_password: password,
    })
    if (error || !data?.length) return { teacher: null, error: 'Usuario o contraseña incorrectos.' }
    return { teacher: data[0], error: null }
  },

  async teacherChangePassword(teacherId, newPassword) {
    const { error } = await supabase.rpc('set_teacher_password', {
      p_id:           teacherId,
      p_password:     newPassword,
      p_must_change:  false,
    })
    if (error) return { error: error.message }
    return { error: null }
  },

  // ── Auth admin (email + contraseña via Supabase Auth) ─────────────────────

  async adminLogin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { user: null, error: 'Email o contraseña incorrectos.' }

    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (!admin) {
      await supabase.auth.signOut()
      return { user: null, error: 'No tenés permisos de administrador.' }
    }
    return { user: { ...data.user, name: admin.name }, error: null }
  },

  async adminLogout() {
    await supabase.auth.signOut()
  },

  async getAdminSession() {
    const { data } = await supabase.auth.getSession()
    if (!data.session) return null
    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('id', data.session.user.id)
      .single()
    return admin ? { ...data.session.user, name: admin.name } : null
  },

  // ── ABM Docentes (solo admin) ─────────────────────────────────────────────

  async createTeacher({ id, name, username, tempPassword, role }) {
    // 1. Insertar docente
    const { error: insertError } = await supabase
      .from('teachers')
      .insert({
        id,
        name,
        username: username.trim().toLowerCase(),
        password_hash: '',
        role,
        active: true,
        must_change_password: true,
      })
    if (insertError) return { error: insertError.message }

    // 2. Setear contraseña temporal via RPC
    const { error: pwError } = await supabase.rpc('set_teacher_password', {
      p_id:          id,
      p_password:    tempPassword,
      p_must_change: true,
    })
    if (pwError) return { error: pwError.message }
    return { error: null }
  },

  async updateTeacher(id, fields) {
    const { data, error } = await supabase
      .from('teachers')
      .update(fields)
      .eq('id', id)
      .select('id, name, role, username, active, must_change_password')
      .single()
    if (error) return { data: null, error: error.message }
    return { data, error: null }
  },

  async resetTeacherPassword(id, tempPassword) {
    const { error } = await supabase.rpc('set_teacher_password', {
      p_id:          id,
      p_password:    tempPassword,
      p_must_change: true,
    })
    if (error) return { error: error.message }
    return { error: null }
  },

  async deactivateTeacher(id) {
    return this.updateTeacher(id, { active: false })
  },

  async reactivateTeacher(id) {
    return this.updateTeacher(id, { active: true })
  },

  async deleteTeacher(id) {
    const { error } = await supabase.rpc('delete_teacher', { p_id: id })
    if (error) return { error: error.message }
    return { error: null }
  },

  async updateTeacherData(id, { name, username, role }) {
    const { data, error } = await supabase
      .from('teachers')
      .update({ name, username: username.trim().toLowerCase(), role })
      .eq('id', id)
      .select('id, name, role, username, active, must_change_password')
      .single()
    if (error) return { data: null, error: error.message }
    return { data, error: null }
  },
}
