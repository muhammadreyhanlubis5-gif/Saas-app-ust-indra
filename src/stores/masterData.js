import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { masterDataRepository } from '../core/masterDataRepository.js'
import {
  createDefaultClass,
  validateClass,
  createDefaultTeacher,
  validateTeacher,
  createDefaultSubject,
  validateSubject
} from '../types/masterData.js'

export const useMasterDataStore = defineStore('masterData', () => {
  // ============================================================================
  // STATE
  // ============================================================================
  const classes = ref([])
  const teachers = ref([])
  const subjects = ref([])

  const isLoading = ref(false)
  const isSaving = ref(false)
  const isImporting = ref(false)
  const isDeleting = ref(false)
  const error = ref(null)
  const validationErrors = ref({})

  const classesPagination = ref({ page: 1, limit: 20, total: 0, total_pages: 1 })
  const teachersPagination = ref({ page: 1, limit: 20, total: 0, total_pages: 1 })
  const subjectsPagination = ref({ page: 1, limit: 20, total: 0, total_pages: 1 })

  // ============================================================================
  // COMPUTED / GETTERS
  // ============================================================================
  const activeClasses = computed(() => {
    return (classes.value || []).filter((c) => c.is_active)
  })

  const activeTeachers = computed(() => {
    return (teachers.value || []).filter((t) => t.is_active)
  })

  const activeSubjects = computed(() => {
    return (subjects.value || []).filter((s) => s.is_active)
  })

  const totalStudents = computed(() => {
    return activeClasses.value.reduce((sum, c) => sum + (c.student_count || 0), 0)
  })

  // ============================================================================
  // ACTIONS: CLASSES
  // ============================================================================
  async function loadClasses(filters = {}) {
    isLoading.value = true
    error.value = null
    try {
      const res = await masterDataRepository.getClasses(filters)
      classes.value = res.data || []
      classesPagination.value = res.pagination || { page: 1, limit: 20, total: classes.value.length, total_pages: 1 }
      return res
    } catch (err) {
      error.value = err.message || 'Gagal memuat data kelas dari server'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function addClass(payload) {
    if (isSaving.value) return null
    isSaving.value = true
    error.value = null
    validationErrors.value = {}

    // Client-side domain validation
    const clientVal = validateClass(payload)
    if (!clientVal.valid) {
      validationErrors.value = clientVal.errors
      isSaving.value = false
      const valErr = new Error('Validasi form gagal')
      valErr.fields = clientVal.errors
      throw valErr
    }

    try {
      const created = await masterDataRepository.createClass(payload)
      // Tambahkan ke state lokal jika berhasil
      classes.value.unshift(created)
      classesPagination.value.total++
      return created
    } catch (err) {
      error.value = err.message || 'Gagal menambahkan kelas baru'
      if (err.fields) {
        validationErrors.value = err.fields
      }
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function editClass(id, payload) {
    if (isSaving.value) return null
    isSaving.value = true
    error.value = null
    validationErrors.value = {}

    const clientVal = validateClass(payload)
    if (!clientVal.valid) {
      validationErrors.value = clientVal.errors
      isSaving.value = false
      const valErr = new Error('Validasi form gagal')
      valErr.fields = clientVal.errors
      throw valErr
    }

    try {
      const updated = await masterDataRepository.updateClass(id, payload)
      const idx = classes.value.findIndex((c) => c.id === id)
      if (idx !== -1) {
        classes.value[idx] = updated
      }
      return updated
    } catch (err) {
      error.value = err.message || 'Gagal memperbarui kelas'
      if (err.fields) {
        validationErrors.value = err.fields
      }
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function removeClass(id) {
    if (isDeleting.value) return false
    isDeleting.value = true
    error.value = null

    try {
      await masterDataRepository.deleteClass(id)
      classes.value = classes.value.filter((c) => c.id !== id)
      classesPagination.value.total = Math.max(0, classesPagination.value.total - 1)
      return true
    } catch (err) {
      error.value = err.message || 'Gagal menghapus kelas'
      throw err
    } finally {
      isDeleting.value = false
    }
  }

  async function importClassesBatch(classesList, mode = 'upsert') {
    if (isImporting.value) return null
    isImporting.value = true
    error.value = null

    try {
      const result = await masterDataRepository.batchImportClasses(classesList, mode)
      // Reload daftar kelas setelah import berhasil
      await loadClasses()
      return result
    } catch (err) {
      error.value = err.message || 'Gagal mengimpor data kelas'
      throw err
    } finally {
      isImporting.value = false
    }
  }

  // ============================================================================
  // ACTIONS: TEACHERS
  // ============================================================================
  async function loadTeachers(filters = {}) {
    isLoading.value = true
    error.value = null
    try {
      const res = await masterDataRepository.getTeachers(filters)
      teachers.value = res.data || []
      teachersPagination.value = res.pagination || { page: 1, limit: 20, total: teachers.value.length, total_pages: 1 }
      return res
    } catch (err) {
      error.value = err.message || 'Gagal memuat data guru'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function addTeacher(payload) {
    if (isSaving.value) return null
    isSaving.value = true
    error.value = null
    validationErrors.value = {}

    const clientVal = validateTeacher(payload)
    if (!clientVal.valid) {
      validationErrors.value = clientVal.errors
      isSaving.value = false
      const valErr = new Error('Validasi guru gagal')
      valErr.fields = clientVal.errors
      throw valErr
    }

    try {
      const created = await masterDataRepository.createTeacher(payload)
      teachers.value.unshift(created)
      teachersPagination.value.total++
      return created
    } catch (err) {
      error.value = err.message || 'Gagal menambahkan guru baru'
      if (err.fields) validationErrors.value = err.fields
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function editTeacher(id, payload) {
    if (isSaving.value) return null
    isSaving.value = true
    error.value = null
    validationErrors.value = {}

    const clientVal = validateTeacher(payload)
    if (!clientVal.valid) {
      validationErrors.value = clientVal.errors
      isSaving.value = false
      const valErr = new Error('Validasi guru gagal')
      valErr.fields = clientVal.errors
      throw valErr
    }

    try {
      const updated = await masterDataRepository.updateTeacher(id, payload)
      const idx = teachers.value.findIndex((t) => t.id === id)
      if (idx !== -1) teachers.value[idx] = updated
      return updated
    } catch (err) {
      error.value = err.message || 'Gagal memperbarui guru'
      if (err.fields) validationErrors.value = err.fields
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function removeTeacher(id) {
    if (isDeleting.value) return false
    isDeleting.value = true
    error.value = null
    try {
      await masterDataRepository.deleteTeacher(id)
      teachers.value = teachers.value.filter((t) => t.id !== id)
      teachersPagination.value.total = Math.max(0, teachersPagination.value.total - 1)
      return true
    } catch (err) {
      error.value = err.message || 'Gagal menghapus guru'
      throw err
    } finally {
      isDeleting.value = false
    }
  }

  async function importTeachersBatch(teachersList, mode = 'upsert') {
    if (isImporting.value) return null
    isImporting.value = true
    error.value = null
    try {
      const result = await masterDataRepository.batchImportTeachers(teachersList, mode)
      await loadTeachers()
      return result
    } catch (err) {
      error.value = err.message || 'Gagal import batch guru'
      throw err
    } finally {
      isImporting.value = false
    }
  }

  // ============================================================================
  // ACTIONS: SUBJECTS
  // ============================================================================
  async function loadSubjects(filters = {}) {
    isLoading.value = true
    error.value = null
    try {
      const res = await masterDataRepository.getSubjects(filters)
      subjects.value = res.data || []
      subjectsPagination.value = res.pagination || { page: 1, limit: 20, total: subjects.value.length, total_pages: 1 }
      return res
    } catch (err) {
      error.value = err.message || 'Gagal memuat mata pelajaran'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function addSubject(payload) {
    if (isSaving.value) return null
    isSaving.value = true
    error.value = null
    validationErrors.value = {}

    const clientVal = validateSubject(payload)
    if (!clientVal.valid) {
      validationErrors.value = clientVal.errors
      isSaving.value = false
      const valErr = new Error('Validasi mata pelajaran gagal')
      valErr.fields = clientVal.errors
      throw valErr
    }

    try {
      const created = await masterDataRepository.createSubject(payload)
      subjects.value.unshift(created)
      subjectsPagination.value.total++
      return created
    } catch (err) {
      error.value = err.message || 'Gagal menambahkan mata pelajaran'
      if (err.fields) validationErrors.value = err.fields
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function editSubject(id, payload) {
    if (isSaving.value) return null
    isSaving.value = true
    error.value = null
    validationErrors.value = {}

    const clientVal = validateSubject(payload)
    if (!clientVal.valid) {
      validationErrors.value = clientVal.errors
      isSaving.value = false
      const valErr = new Error('Validasi mata pelajaran gagal')
      valErr.fields = clientVal.errors
      throw valErr
    }

    try {
      const updated = await masterDataRepository.updateSubject(id, payload)
      const idx = subjects.value.findIndex((s) => s.id === id)
      if (idx !== -1) subjects.value[idx] = updated
      return updated
    } catch (err) {
      error.value = err.message || 'Gagal memperbarui mata pelajaran'
      if (err.fields) validationErrors.value = err.fields
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function removeSubject(id) {
    if (isDeleting.value) return false
    isDeleting.value = true
    error.value = null
    try {
      await masterDataRepository.deleteSubject(id)
      subjects.value = subjects.value.filter((s) => s.id !== id)
      subjectsPagination.value.total = Math.max(0, subjectsPagination.value.total - 1)
      return true
    } catch (err) {
      error.value = err.message || 'Gagal menghapus mata pelajaran'
      throw err
    } finally {
      isDeleting.value = false
    }
  }

  async function importSubjectsBatch(subjectsList, mode = 'upsert') {
    if (isImporting.value) return null
    isImporting.value = true
    error.value = null
    try {
      const result = await masterDataRepository.batchImportSubjects(subjectsList, mode)
      await loadSubjects()
      return result
    } catch (err) {
      error.value = err.message || 'Gagal import batch mata pelajaran'
      throw err
    } finally {
      isImporting.value = false
    }
  }

  return {
    // State
    classes,
    teachers,
    subjects,
    isLoading,
    isSaving,
    isImporting,
    isDeleting,
    error,
    validationErrors,
    classesPagination,
    teachersPagination,
    subjectsPagination,

    // Computed
    activeClasses,
    activeTeachers,
    activeSubjects,
    totalStudents,

    // Actions
    loadClasses,
    addClass,
    editClass,
    removeClass,
    importClassesBatch,

    loadTeachers,
    addTeacher,
    editTeacher,
    removeTeacher,
    importTeachersBatch,

    loadSubjects,
    addSubject,
    editSubject,
    removeSubject,
    importSubjectsBatch
  }
})
