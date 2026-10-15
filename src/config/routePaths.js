/**
 * Konfigurasi Jalur URL Tersamarkan (Obfuscated Encrypted-Style Route Paths)
 * Menggunakan kombinasi kode acak dan simbol khusus (RFC 3986 safe symbols)
 * agar seluruh halaman di aplikasi tidak dapat ditebak struktur folder maupun tujuannya.
 */

// Super Admin Secret Route
export const SUPER_ADMIN_SECRET_PATH = '/$&*@_3(0!*((+=super-+a98xK0q2wz~)'

// School Admin Base Route
export const SCHOOL_ADMIN_BASE = '/$&*@!_sch=(~09xK0+mstr88)'

// School Admin Sub-Routes (Child Paths)
export const SCHOOL_ADMIN_SUB = {
  VALIDASI_LEMBAGA: '!@&~vld-inst_7x8q=',
  DAFTAR_KELAS: '*$+!cls-reg_4k9p~',
  DAFTAR_GURU: '&$*@tch-dir_1m5y=',
  SESI_KBM: '+!*~ses-kbm_3r8t=',
  PENGAMPU: '!@$+png-mpl_6w2e~',
  JAM_KOSONG: '&*!_jm-ksg_9p4x=',
  TUGAS_TAMBAHAN: '$*+~tgs-tmb_2z7v=',
  JADWAL_GURU: '!@*&jdw-gru_5c8n~',
  JADWAL_KELAS: '+!$_jdw-kls_8b3m=',
  MATA_PELAJARAN: '*&@~map-sub_4q9k=',
  ANALISIS_GURU: '!$+*anl-tch_7v2r~',
  TUNJANGAN_SERTIFIKASI: '&$!_srf-all_3w6p=',
  PUSAT_BANTUAN: '*!+~hlp-cnt_9y1s='
}

// Full Paths for Easy Navigation across the whole application
export const ROUTES = {
  LOGIN: '/',
  SUPER_ADMIN: SUPER_ADMIN_SECRET_PATH,
  EXPIRED: '/$!*&_exp=(~402_act-lock+9981~)',
  CHECKOUT: '/!@$*&-_pay=(~inv-gate+7710xQ~)',
  TEACHER: '/!@$*&-_tch=(~7732xK0+inst99~)',
  
  // School Admin & Sub-routes
  SCHOOL_ADMIN: SCHOOL_ADMIN_BASE,
  VALIDASI_LEMBAGA: `${SCHOOL_ADMIN_BASE}/${SCHOOL_ADMIN_SUB.VALIDASI_LEMBAGA}`,
  DAFTAR_KELAS: `${SCHOOL_ADMIN_BASE}/${SCHOOL_ADMIN_SUB.DAFTAR_KELAS}`,
  DAFTAR_GURU: `${SCHOOL_ADMIN_BASE}/${SCHOOL_ADMIN_SUB.DAFTAR_GURU}`,
  SESI_WAKTU: `${SCHOOL_ADMIN_BASE}/${SCHOOL_ADMIN_SUB.SESI_KBM}`,
  SESI_KBM: `${SCHOOL_ADMIN_BASE}/${SCHOOL_ADMIN_SUB.SESI_KBM}`,
  MATA_PELAJARAN: `${SCHOOL_ADMIN_BASE}/${SCHOOL_ADMIN_SUB.MATA_PELAJARAN}`,
  PENGAMPU: `${SCHOOL_ADMIN_BASE}/${SCHOOL_ADMIN_SUB.PENGAMPU}`,
  JAM_KOSONG: `${SCHOOL_ADMIN_BASE}/${SCHOOL_ADMIN_SUB.JAM_KOSONG}`,
  TUGAS_TAMBAHAN: `${SCHOOL_ADMIN_BASE}/${SCHOOL_ADMIN_SUB.TUGAS_TAMBAHAN}`,
  JADWAL_GURU: `${SCHOOL_ADMIN_BASE}/${SCHOOL_ADMIN_SUB.JADWAL_GURU}`,
  JADWAL_KELAS: `${SCHOOL_ADMIN_BASE}/${SCHOOL_ADMIN_SUB.JADWAL_KELAS}`,
  ANALISIS_GURU: `${SCHOOL_ADMIN_BASE}/${SCHOOL_ADMIN_SUB.ANALISIS_GURU}`,
  TUNJANGAN_SERTIFIKASI: `${SCHOOL_ADMIN_BASE}/${SCHOOL_ADMIN_SUB.TUNJANGAN_SERTIFIKASI}`,
  PUSAT_BANTUAN: `${SCHOOL_ADMIN_BASE}/${SCHOOL_ADMIN_SUB.PUSAT_BANTUAN}`
}
