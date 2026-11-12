/**
 * GuruKu SaaS - Smart Auto-Distribution Algorithm & Time Block Splitter
 * 
 * Features:
 * - Dynamic JP Auto-Splitter (generateTimeBlocks): Splits weekly total into optimal 2 JP / 1 JP blocks
 * - Smart Subject & Specialization Matching
 * - Workload Capping (Max 40 JP/week) & Load Balancing across staff
 */

import { ref } from 'vue'

/**
 * Normalizes subject names and codes for fuzzy matching
 */
const normalizeText = (text) => {
  if (!text) return ''
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

/**
 * Mapping of common school abbreviations to subject names
 */
const COMMON_ALIASES = {
  mat: ['matematika', 'math', 'mtk'],
  bin: ['bahasaindonesia', 'bindonesia', 'bhsindonesia', 'indo'],
  bing: ['bahasainggris', 'binggris', 'bhsinggris', 'english'],
  ipa: ['ilmupengetahuanalam', 'sains', 'science', 'biologi', 'fisika'],
  ips: ['ilmupengetahuansosial', 'social', 'geografi', 'ekonomi', 'sejarah'],
  ppkn: ['pendidikanpancasila', 'pancasila', 'kewarganegaraan', 'pkn'],
  pai: ['pendidikanagamaislam', 'agamaislam', 'agama', 'pai'],
  pen: ['penjas', 'penjaskes', 'pjok', 'olahraga', 'olahragakesehatan'],
  seni: ['senibudaya', 'kesenian', 'sbdp', 'senirupa', 'senimusik'],
  tik: ['informatika', 'komputer', 'teknologiinformasi', 'ti']
}

/**
 * DYNAMIC JP AUTO-SPLITTER (Block Generator)
 * 
 * Breaks down total weekly JP for a class into optimal daily meeting blocks.
 * - Rule: Max block size is 2 JP. Min block size is 1 JP.
 * - Examples:
 *   - 2 JP -> [2]
 *   - 3 JP -> [2, 1]
 *   - 4 JP -> [2, 2] (Preferred over [1, 1, 1, 1])
 *   - 5 JP -> [2, 2, 1]
 *   - 6 JP -> [2, 2, 2]
 *   - 1 JP -> [1]
 *   - <= 0 -> []
 * 
 * @param {number|string} totalWeeklyJP 
 * @returns {Array<number>} Array of daily block sizes (e.g. [2, 1])
 */
export const generateTimeBlocks = (totalWeeklyJP) => {
  const total = parseInt(totalWeeklyJP, 10)
  if (isNaN(total) || total <= 0) return []

  const blocks = []
  let remaining = total

  // Greedy approach prioritizing 2 JP blocks for optimal pedagogical retention
  while (remaining > 0) {
    if (remaining >= 2) {
      blocks.push(2)
      remaining -= 2
    } else {
      blocks.push(1)
      remaining -= 1
    }
  }

  return blocks
}

/**
 * Formats time blocks into human-readable text for UI display
 * E.g. [2, 1] -> "(Dipecah menjadi: 2 JP & 1 JP)"
 * 
 * @param {number|string} totalWeeklyJP 
 * @returns {string} Formatted description
 */
export const formatBlockSplit = (totalWeeklyJP) => {
  const blocks = generateTimeBlocks(totalWeeklyJP)
  if (blocks.length === 0) return '(0 JP / Minggu)'
  if (blocks.length === 1) return `(Dipecah menjadi: ${blocks[0]} JP)`

  const formatted = blocks.map(b => `${b} JP`)
  if (formatted.length === 2) {
    return `(Dipecah menjadi: ${formatted[0]} & ${formatted[1]})`
  }

  const allExceptLast = formatted.slice(0, -1).join(', ')
  const last = formatted[formatted.length - 1]
  return `(Dipecah menjadi: ${allExceptLast} & ${last})`
}

/**
 * Checks if a teacher's subject / specialization matches a required subject
 */
export const isTeacherSubjectMatch = (teacher, subject) => {
  if (!teacher || !subject) return false

  const tSubject = normalizeText(teacher.subject || teacher.subject_code || teacher.spesialisasi || '')
  const tCode = normalizeText(teacher.code || '')
  const sCode = normalizeText(subject.code || '')
  const sName = normalizeText(subject.name || '')

  // Exact code or text match
  if (tSubject === sCode || tSubject === sName) return true
  if (sCode && tSubject.includes(sCode)) return true
  if (sName && tSubject.includes(sName)) return true
  if (tSubject && sName.includes(tSubject)) return true

  // Check common aliases
  for (const [key, aliases] of Object.entries(COMMON_ALIASES)) {
    const isTargetKey = sCode.includes(key) || aliases.some(a => sName.includes(a))
    if (isTargetKey) {
      if (tSubject.includes(key) || aliases.some(a => tSubject.includes(a))) {
        return true
      }
    }
  }

  return false
}

/**
 * Pure Auto-Distribute Function
 * 
 * @param {Array} teachers - List of teacher objects
 * @param {Array} classes - List of class names or objects
 * @param {Array} subjects - List of required subjects
 * @param {Object} options - Configuration options (maxWorkload, defaultHoursPerSubject)
 * @returns {Object} { success, rows, classes, unassigned, stats }
 */
export const autoDistribute = (teachers = [], classes = [], subjects = [], options = {}) => {
  const maxWorkload = options.maxWorkload || 40 // Default maximum 40 JP workload
  const defaultHours = options.defaultHoursPerSubject || 4 // Default weekly JP (e.g. 4 JP -> split into [2, 2])

  // Normalize class names
  const normalizedClasses = classes.map(c => {
    if (typeof c === 'string') return c.trim().toUpperCase()
    return (c.name || c.label || '').trim().toUpperCase()
  }).filter(c => c.length > 0)

  // Normalize subjects
  const normalizedSubjects = subjects.map((s, idx) => {
    if (typeof s === 'string') {
      return { id: idx + 1, code: s.toUpperCase(), name: s, hours: defaultHours }
    }
    return {
      id: s.id || idx + 1,
      code: (s.code || s.name?.substring(0, 4) || `MAPEL_${idx + 1}`).toUpperCase().trim(),
      name: s.name || s.code,
      hours: Number(s.hours || s.jp || s.default_hours) || defaultHours
    }
  })

  // Track running workload per teacher
  const teacherWorkloads = new Map()
  teachers.forEach(t => {
    const code = (t.code || '').toUpperCase().trim()
    if (code) teacherWorkloads.set(code, 0)
  })

  // Map to group assignments: Key -> `${teacherCode}__${subjectCode}`
  const assignmentMap = new Map()

  const unassigned = []
  let totalAssignedHours = 0

  // 1. Iterate through each class and each required subject
  normalizedClasses.forEach((clsName, classIdx) => {
    normalizedSubjects.forEach(subj => {
      const neededHours = subj.hours

      // Find all teachers matching this subject specialization
      const candidateTeachers = teachers.filter(t => isTeacherSubjectMatch(t, subj))

      // Filter teachers with capacity <= maxWorkload
      const eligibleTeachers = candidateTeachers.filter(t => {
        const currentJP = teacherWorkloads.get((t.code || '').toUpperCase().trim()) || 0
        return currentJP + neededHours <= maxWorkload
      })

      if (eligibleTeachers.length > 0) {
        // Load balancing: pick the eligible teacher with the LOWEST workload currently
        eligibleTeachers.sort((a, b) => {
          const jpA = teacherWorkloads.get((a.code || '').toUpperCase().trim()) || 0
          const jpB = teacherWorkloads.get((b.code || '').toUpperCase().trim()) || 0
          return jpA - jpB
        })

        const selectedTeacher = eligibleTeachers[0]
        const teacherCode = (selectedTeacher.code || '').toUpperCase().trim()
        const currentJP = teacherWorkloads.get(teacherCode) || 0

        // Increment workload
        teacherWorkloads.set(teacherCode, currentJP + neededHours)
        totalAssignedHours += neededHours

        // Record or update assignment row
        const rowKey = `${teacherCode}__${subj.code}`
        if (!assignmentMap.has(rowKey)) {
          const hoursArray = new Array(normalizedClasses.length).fill(0)
          hoursArray[classIdx] = neededHours

          assignmentMap.set(rowKey, {
            id: `row_${teacherCode}_${subj.code}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            teacher_code: teacherCode,
            teacher_name: selectedTeacher.name || `Guru ${teacherCode}`,
            subject_code: subj.code,
            subject_name: subj.name,
            is_linear: 'true',
            hours: hoursArray,
            // Pre-calculate blocks for each class
            blocks: hoursArray.map(h => generateTimeBlocks(h))
          })
        } else {
          const existingRow = assignmentMap.get(rowKey)
          existingRow.hours[classIdx] = neededHours
          existingRow.blocks = existingRow.hours.map(h => generateTimeBlocks(h))
        }
      } else {
        // Record unassigned requirement
        unassigned.push({
          className: clsName,
          classIdx,
          subjectCode: subj.code,
          subjectName: subj.name,
          neededHours,
          blocks: generateTimeBlocks(neededHours),
          reason: candidateTeachers.length === 0
            ? 'Tidak ada guru dengan spesialisasi mapel ini'
            : `Semua guru (${candidateTeachers.map(t => t.code).join(', ')}) telah mencapai batas maksimal (${maxWorkload} JP)`
        })
      }
    })
  })

  // Convert map to array of rows and ensure blocks are synced
  const rows = Array.from(assignmentMap.values()).map(r => ({
    ...r,
    blocks: (r.hours || []).map(h => generateTimeBlocks(h))
  }))

  // Compute final statistics
  const teachersUsed = Array.from(teacherWorkloads.entries())
    .filter(([_, jp]) => jp > 0)
    .map(([code, totalJP]) => {
      const t = teachers.find(x => (x.code || '').toUpperCase().trim() === code)
      return {
        code,
        name: t?.name || code,
        totalJP,
        percentageOfMax: Math.round((totalJP / maxWorkload) * 100)
      }
    })

  return {
    success: true,
    rows,
    classes: normalizedClasses,
    unassigned,
    stats: {
      totalClasses: normalizedClasses.length,
      totalSubjects: normalizedSubjects.length,
      totalAssignedHours,
      teachersUtilizedCount: teachersUsed.length,
      teachersUsed,
      unassignedCount: unassigned.length,
      isFullyAssigned: unassigned.length === 0,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Composable for Vue 3 Component Integration
 */
export function useAutoDistribution() {
  const isDistributing = ref(false)
  const lastDistributionResult = ref(null)

  const runAutoDistribution = (teachers, classes, subjects, options = {}) => {
    isDistributing.value = true
    try {
      const result = autoDistribute(teachers, classes, subjects, options)
      lastDistributionResult.value = result
      return result
    } finally {
      isDistributing.value = false
    }
  }

  return {
    isDistributing,
    lastDistributionResult,
    runAutoDistribution,
    autoDistribute,
    generateTimeBlocks,
    formatBlockSplit
  }
}
