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

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function avg(numbers) {
  if (!numbers.length) return 0
  return +(numbers.reduce((a, b) => a + b, 0) / numbers.length).toFixed(2)
}

function evalAvg(e) {
  const vals = Object.values(e.dimensions).filter(v => v !== null && v !== undefined && v > 0)
  return vals.length ? avg(vals) : 0
}

function dimAvg(evals, dimId) {
  const vals = evals.map(e => e.dimensions[dimId]).filter(v => v !== null && v !== undefined && v > 0)
  return avg(vals)
}

// Calcula el ranking para el mes/año seleccionado desde las evaluaciones crudas
function buildPeriodRanking(evaluations, courseStats, selectedMonth, selectedYear) {
  const filtered = evaluations.filter(e => {
    const d = new Date(e.timestamp)
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
  })

  return courseStats
    .map(course => {
      const courseEvals = filtered.filter(e => e.courseId === course.id)
      if (!courseEvals.length) return null

      const avgs = courseEvals.map(evalAvg).filter(v => v > 0)
      const avgMonth = avg(avgs)

      return {
        ...course,
        avgMonth,
        totalEvals: courseEvals.length,
        dimensions: {
          clima:         dimAvg(courseEvals, 'clima'),
          espacio:       dimAvg(courseEvals, 'espacio'),
          participacion: dimAvg(courseEvals, 'participacion'),
          convivencia:   dimAvg(courseEvals, 'convivencia'),
        },
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.avgMonth - a.avgMonth)
    .map((c, i) => ({ ...c, rank: i + 1 }))
}

// ── PDF ────────────────────────────────────────────────────────────────────────

export async function exportPDF({ courseStats, evaluations, selectedMonth, selectedYear }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const monthLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`
  const now = new Date().toLocaleDateString('es-AR')

  // Recalcular ranking para el período seleccionado
  const periodRanking = buildPeriodRanking(evaluations, courseStats, selectedMonth, selectedYear)

  // ── Encabezado con logo ──────────────────────────────────────────────────────
  doc.setFillColor(28, 35, 51)
  doc.rect(0, 0, 210, 36, 'F')

  try {
    const logoUrl = window.location.origin + '/logo.png'
    const resp = await fetch(logoUrl)
    const blob = await resp.blob()
    const reader = new FileReader()
    await new Promise(res => { reader.onload = res; reader.readAsDataURL(blob) })
    doc.addImage(reader.result, 'PNG', 8, 4, 28, 28)
  } catch(e) { /* logo opcional */ }

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

  // ── Ranking del período ─────────────────────────────────────────────────────
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Ranking institucional del mes', 14, y)
  y += 6

  autoTable(doc, {
    startY: y,
    head: [['#', 'Curso', 'Promedio mes', 'Clima', 'Espacio', 'Participación', 'Convivencia', 'Evaluaciones']],
    body: periodRanking.map(c => [
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

  // ── Detalle de evaluaciones del período ─────────────────────────────────────
  if (y > 240) { doc.addPage(); y = 20 }

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Detalle de evaluaciones del mes', 14, y)
  y += 6

  const courses = courseStats.reduce((acc, c) => { acc[c.id] = c.label; return acc }, {})

  const monthEvals = evaluations.filter(e => {
    const d = new Date(e.timestamp)
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  autoTable(doc, {
    startY: y,
    head: [['Fecha', 'Curso', 'Docente', 'Materia', 'Rol', 'Promedio']],
    body: monthEvals.map(e => [
      formatDate(e.timestamp),
      courses[e.courseId] ?? e.courseId,
      e.teacherName,
      e.subject,
      e.role,
      evalAvg(e).toFixed(2),
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

  doc.save(`informe-clima-aula-${monthLabel.replace(' ', '-').toLowerCase()}.pdf`)
}

// ── Excel ──────────────────────────────────────────────────────────────────────

export function exportExcel({ courseStats, evaluations, selectedMonth, selectedYear }) {
  const wb = XLSX.utils.book_new()
  const monthLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`
  const courses = courseStats.reduce((acc, c) => { acc[c.id] = c.label; return acc }, {})

  // Recalcular ranking para el período seleccionado
  const periodRanking = buildPeriodRanking(evaluations, courseStats, selectedMonth, selectedYear)

  // ── Hoja 1: Ranking ─────────────────────────────────────────────────────────
  const rankingData = [
    [`Ranking Institucional — ${monthLabel}`],
    [],
    ['Posición', 'Curso', 'Promedio Mes', 'Clima', 'Espacio', 'Participación', 'Convivencia', 'Total evaluaciones'],
    ...periodRanking.map(c => [
      c.rank,
      c.label,
      c.avgMonth > 0 ? c.avgMonth : null,
      c.dimensions.clima         > 0 ? c.dimensions.clima         : null,
      c.dimensions.espacio       > 0 ? c.dimensions.espacio       : null,
      c.dimensions.participacion > 0 ? c.dimensions.participacion : null,
      c.dimensions.convivencia   > 0 ? c.dimensions.convivencia   : null,
      c.totalEvals,
    ]),
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(rankingData)
  ws1['!cols'] = [{ wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 13 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Ranking')

  // ── Hoja 2: Evaluaciones del período ────────────────────────────────────────
  const monthEvals = evaluations.filter(e => {
    const d = new Date(e.timestamp)
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const evalsData = [
    [`Evaluaciones — ${monthLabel}`],
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
      evalAvg(e),
    ]),
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(evalsData)
  ws2['!cols'] = [{ wch: 22 }, { wch: 12 }, { wch: 22 }, { wch: 28 }, { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 14 }, { wch: 13 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Evaluaciones')

  // ── Hoja 3: Historial completo ───────────────────────────────────────────────
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
        evalAvg(e),
      ]),
  ]
  const ws3 = XLSX.utils.aoa_to_sheet(allData)
  ws3['!cols'] = ws2['!cols']
  XLSX.utils.book_append_sheet(wb, ws3, 'Historial completo')

  XLSX.writeFile(wb, `informe-clima-aula-${monthLabel.replace(' ', '-').toLowerCase()}.xlsx`)
}
