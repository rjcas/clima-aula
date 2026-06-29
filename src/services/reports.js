/**
 * ReportService — genera PDF y Excel con los datos de evaluaciones
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

const MONTH_NAMES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]

function currentMonthLabel() {
  const d = new Date()
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// ── PDF ────────────────────────────────────────────────────────────────────────

export async function exportPDF({ ranking, courseStats, evaluations, selectedMonth, selectedYear }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const now2ref = new Date(selectedYear, selectedMonth, 1)
  const monthLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`
  const now = new Date().toLocaleDateString('es-AR')

  // ── Encabezado con logo ──────────────────────────────────────────────────────
  // Fondo degradado oscuro
  doc.setFillColor(28, 35, 51)
  doc.rect(0, 0, 210, 36, 'F')

  // Logo
  try {
    const logoUrl = window.location.origin + '/logo.png'
    const resp = await fetch(logoUrl)
    const blob = await resp.blob()
    const reader = new FileReader()
    await new Promise(res => { reader.onload = res; reader.readAsDataURL(blob) })
    doc.addImage(reader.result, 'PNG', 8, 4, 28, 28)
  } catch(e) { /* logo opcional */ }

  // Textos del encabezado
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Escuela Dr. Ángel Gutiérrez', 42, 14)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(200, 220, 240)
  doc.text('Clima del Aula — Sistema de evaluación grupal', 42, 21)
  doc.setTextColor(160, 180, 200)
  doc.text(`Informe mensual: ${monthLabel}`, 42, 28)
  doc.text(`Generado: ${now}`, 196, 28, { align: 'right' })

  let y = 46

  // ── Ranking del mes ─────────────────────────────────────────────────────────
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Ranking institucional del mes', 14, y)
  y += 6

  autoTable(doc, {
    startY: y,
    head: [['#', 'Curso', 'Promedio mes', 'Clima', 'Espacio', 'Participación', 'Convivencia', 'Evaluaciones']],
    body: ranking.map(c => [
      c.rank,
      c.label,
      c.avgMonth > 0 ? c.avgMonth.toFixed(2) : '—',
      c.dimensions.clima         > 0 ? c.dimensions.clima.toFixed(2)         : '—',
      c.dimensions.espacio       > 0 ? c.dimensions.espacio.toFixed(2)       : '—',
      c.dimensions.participacion > 0 ? c.dimensions.participacion.toFixed(2) : '—',
      c.dimensions.convivencia   > 0 ? c.dimensions.convivencia.toFixed(2)   : '—',
      c.totalEvals,
    ]),
    headStyles:    { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles:    { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    columnStyles:  { 0: { cellWidth: 8 }, 2: { fontStyle: 'bold' } },
    margin:        { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 12

  // ── Detalle de evaluaciones ─────────────────────────────────────────────────
  if (y > 240) { doc.addPage(); y = 20 }

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Detalle de evaluaciones del mes', 14, y)
  y += 6

  const monthEvals = evaluations.filter(e => {
    const d = new Date(e.timestamp)
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const courses = courseStats.reduce((acc, c) => { acc[c.id] = c.label; return acc }, {})

  autoTable(doc, {
    startY: y,
    head: [['Fecha', 'Curso', 'Docente', 'Materia', 'Rol', 'Promedio']],
    body: monthEvals.map(e => [
      formatDate(e.timestamp),
      courses[e.courseId] ?? e.courseId,
      e.teacherName,
      e.subject,
      e.role,
      e.average.toFixed(2),
    ]),
    headStyles:    { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles:    { fontSize: 7, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin:        { left: 14, right: 14 },
  })

  // ── Pie de página ───────────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(148, 163, 184)
    doc.text(`Página ${i} de ${pageCount} — Clima del Aula`, 105, 290, { align: 'center' })
  }

  doc.save(`informe-clima-aula-${monthLabel.replace(' ','-').toLowerCase()}.pdf`)
}

// ── Excel ──────────────────────────────────────────────────────────────────────

export function exportExcel({ ranking, evaluations, courseStats, selectedMonth, selectedYear }) {
  const wb = XLSX.utils.book_new()
  const now2ref = new Date(selectedYear, selectedMonth, 1)
  const monthLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`
  const now2 = new Date()
  const courses = courseStats.reduce((acc, c) => { acc[c.id] = c.label; return acc }, {})

  // ── Hoja 1: Ranking ─────────────────────────────────────────────────────────
  const rankingData = [
    ['Ranking Institucional — ' + monthLabel],
    [],
    ['Posición', 'Curso', 'Promedio Mes', 'Clima', 'Espacio', 'Participación', 'Convivencia', 'Variación vs mes anterior', 'Total evaluaciones'],
    ...ranking.map(c => [
      c.rank,
      c.label,
      c.avgMonth > 0 ? c.avgMonth : null,
      c.dimensions.clima         > 0 ? c.dimensions.clima         : null,
      c.dimensions.espacio       > 0 ? c.dimensions.espacio       : null,
      c.dimensions.participacion > 0 ? c.dimensions.participacion : null,
      c.dimensions.convivencia   > 0 ? c.dimensions.convivencia   : null,
      c.improvement !== 0 ? c.improvement : null,
      c.totalEvals,
    ]),
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(rankingData)
  ws1['!cols'] = [{ wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 13 }, { wch: 26 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Ranking')

  // ── Hoja 2: Evaluaciones del mes ────────────────────────────────────────────
  const monthEvals = evaluations.filter(e => {
    const d = new Date(e.timestamp)
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const evalsData = [
    ['Evaluaciones del mes — ' + monthLabel],
    [],
    ['Fecha', 'Curso', 'Docente', 'Materia', 'Rol', 'Clima', 'Espacio', 'Participación', 'Convivencia', 'Promedio'],
    ...monthEvals.map(e => [
      formatDate(e.timestamp),
      courses[e.courseId] ?? e.courseId,
      e.teacherName,
      e.subject,
      e.role,
      e.dimensions.clima,
      e.dimensions.espacio,
      e.dimensions.participacion,
      e.dimensions.convivencia,
      e.average,
    ]),
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(evalsData)
  ws2['!cols'] = [{ wch: 18 }, { wch: 12 }, { wch: 20 }, { wch: 22 }, { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 14 }, { wch: 13 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Evaluaciones')

  // ── Hoja 3: Todas las evaluaciones ──────────────────────────────────────────
  const allData = [
    ['Historial completo de evaluaciones'],
    [],
    ['Fecha', 'Curso', 'Docente', 'Materia', 'Rol', 'Clima', 'Espacio', 'Participación', 'Convivencia', 'Promedio'],
    ...evaluations
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(e => [
        formatDate(e.timestamp),
        courses[e.courseId] ?? e.courseId,
        e.teacherName,
        e.subject,
        e.role,
        e.dimensions.clima,
        e.dimensions.espacio,
        e.dimensions.participacion,
        e.dimensions.convivencia,
        e.average,
      ]),
  ]
  const ws3 = XLSX.utils.aoa_to_sheet(allData)
  ws3['!cols'] = ws2['!cols']
  XLSX.utils.book_append_sheet(wb, ws3, 'Historial completo')

  XLSX.writeFile(wb, `informe-clima-aula-${monthLabel.replace(' ','-').toLowerCase()}.xlsx`)
}
