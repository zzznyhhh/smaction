'use client'

import { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ResultData {
  totalVoters: number
  totalVotes: number
  golput: number
  participationRate: number
  candidates: {
    id: string
    candidateNumber: number
    chairmanName: string
    votes: number
    percentage: number
  }[]
}

export default function ReportPage() {
  const [data, setData] = useState<ResultData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [reportDate] = useState(() => new Date())

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/results')
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleExportPDF = async () => {
    if (!data) return
    setGenerating(true)

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      // Title area
      doc.setFillColor(192, 57, 43)
      doc.rect(0, 0, 210, 40, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('LAPORAN HASIL PEMILIHAN KETUA OSIS', 105, 16, { align: 'center' })
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Tanggal Cetak: ${reportDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
        105,
        26,
        { align: 'center' }
      )
      doc.text(
        `Waktu: ${reportDate.toLocaleTimeString('id-ID')}`,
        105,
        33,
        { align: 'center' }
      )

      // Summary section
      doc.setTextColor(30, 30, 30)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text('REKAPITULASI PARTISIPASI', 14, 52)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const summaryData = [
        ['Total DPT (Daftar Pemilih Tetap)', data.totalVoters.toString()],
        ['Jumlah Suara Masuk', data.totalVotes.toString()],
        ['Golput (Tidak Memilih)', data.golput.toString()],
        ['Tingkat Partisipasi', `${data.participationRate}%`],
      ]

      autoTable(doc, {
        startY: 56,
        head: [['Keterangan', 'Jumlah']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [192, 57, 43], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10 },
        columnStyles: { 1: { halign: 'center', fontStyle: 'bold' } },
      })

      // Candidates section
      const finalY = (doc as any).lastAutoTable.finalY + 10
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text('REKAPITULASI PEROLEHAN SUARA', 14, finalY)

      const sortedCandidates = [...data.candidates].sort((a, b) => b.votes - a.votes)
      const candidateRows = sortedCandidates.map((c, idx) => [
        (idx + 1).toString(),
        c.candidateNumber.toString(),
        c.chairmanName,
        c.votes.toString(),
        `${c.percentage}%`,
      ])

      autoTable(doc, {
        startY: finalY + 4,
        head: [['Ranking', 'No. Paslon', 'Calon Ketua', 'Suara', 'Persentase']],
        body: candidateRows,
        theme: 'striped',
        headStyles: { fillColor: [192, 57, 43], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { halign: 'center' },
          1: { halign: 'center' },
          4: { halign: 'center', fontStyle: 'bold' },
          5: { halign: 'center' },
        },
      })

      // Winner highlight
      if (sortedCandidates.length > 0 && data.totalVotes > 0) {
        const winner = sortedCandidates[0]
        const winnerY = (doc as any).lastAutoTable.finalY + 12

        doc.setFillColor(255, 243, 205)
        doc.roundedRect(14, winnerY - 4, 182, 20, 3, 3, 'F')
        doc.setDrawColor(243, 156, 18)
        doc.roundedRect(14, winnerY - 4, 182, 20, 3, 3, 'S')

        doc.setTextColor(100, 60, 0)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text(`PEMENANG: PASLON ${winner.candidateNumber}`, 105, winnerY + 4, { align: 'center' })
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text(
          `${winner.chairmanName} — ${winner.votes} suara (${winner.percentage}%)`,
          105,
          winnerY + 11,
          { align: 'center' }
        )
      }

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.setFont('helvetica', 'normal')
        doc.text('Dokumen ini digenerate secara otomatis oleh Sistem E-Voting OSIS', 105, 290, { align: 'center' })
        doc.text(`Halaman ${i} dari ${pageCount}`, 105, 295, { align: 'center' })
      }

      const filename = `laporan-evoting-osis-${reportDate.toISOString().slice(0, 10)}.pdf`
      doc.save(filename)
    } catch (err) {
      console.error('PDF generation error:', err)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <span className="spinner" style={{ width: 48, height: 48 }} />
      </div>
    )
  }

  const sortedCandidates = data?.candidates.slice().sort((a, b) => b.votes - a.votes) || []

  return (
    <div className="page-padding" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header-flex mb-6 animate-fade-in-up">
        <div>
          <h1 className="heading-md" style={{ color: 'var(--color-text-primary)', marginBottom: 4 }}>
            📄 Laporan{' '}
            <span className="text-gradient-red">Hasil</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
            Preview laporan akhir pemilihan — {reportDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          id="export-pdf-btn"
          onClick={handleExportPDF}
          disabled={generating || !data}
          className="btn btn-primary btn-lg"
          style={{ boxShadow: 'var(--shadow-glow-red)' }}
        >
          {generating ? (
            <>
              <span className="spinner" style={{ width: 18, height: 18 }} />
              Membuat PDF...
            </>
          ) : (
            <>📥 Export PDF</>
          )}
        </button>
      </div>

      {/* Report preview */}
      <div className="animate-fade-in-up delay-100">
        {/* Report header card */}
        <div
          className="glass-card mb-6"
          style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          {/* Navy header banner — stays dark on light pages for contrast */}
          <div
            style={{
              padding: '24px 32px',
              background: 'var(--gradient-primary)',
              textAlign: 'center',
            }}
          >
            <h2 style={{ fontWeight: 900, fontSize: 20, color: '#FFFFFF', marginBottom: 4 }}>
              LAPORAN HASIL PEMILIHAN KETUA OSIS
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
              {reportDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} — {reportDate.toLocaleTimeString('id-ID')}
            </p>
          </div>

          {/* Summary stats */}
          <div className="report-stats-flex">
            {[
              { label: 'Total DPT', value: data?.totalVoters || 0, color: '#3498DB' },
              { label: 'Suara Masuk', value: data?.totalVotes || 0, color: '#C0392B' },
              { label: 'Golput', value: data?.golput || 0, color: '#F39C12' },
              { label: 'Partisipasi', value: `${data?.participationRate || 0}%`, color: '#2ED573' },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  borderRight: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Candidates ranking */}
        <div
          className="glass-card"
          style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
        >
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)' }}>
              Rekapitulasi Perolehan Suara
            </h3>
          </div>
          <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ranking</th>
                <th>No. Paslon</th>
                <th>Calon Ketua</th>
                <th>Suara</th>
                <th>Persentase</th>
                <th>Bar</th>
              </tr>
            </thead>
            <tbody>
              {sortedCandidates.map((c, idx) => (
                <tr key={c.id}>
                  <td>
                    <span
                      style={{
                        fontWeight: 900,
                        fontSize: 20,
                        color: idx === 0 ? '#F39C12' : 'var(--color-text-muted)',
                      }}
                    >
                      {idx === 0 ? '🏆' : `#${idx + 1}`}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--gradient-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: 16,
                        color: 'white',
                      }}
                    >
                      {c.candidateNumber}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{c.chairmanName}</td>
                  <td>
                    <span style={{ fontWeight: 900, fontSize: 22, color: 'var(--color-primary)' }}>
                      {c.votes}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    {c.percentage}%
                  </td>
                  <td>
                    <div className="progress-bar" style={{ width: 100 }}>
                      <div className="progress-fill" style={{ width: `${c.percentage}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>{/* end table-responsive */}

          {/* Winner highlight */}
          {sortedCandidates.length > 0 && (data?.totalVotes || 0) > 0 && (
            <div
              style={{
                margin: '20px 24px 24px',
                padding: '16px 20px',
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ fontSize: '2rem' }}>🏆</span>
              <div>
                <div style={{ fontWeight: 800, color: '#92400E', fontSize: 16 }}>
                  Pemenang: PASLON {sortedCandidates[0].candidateNumber}
                </div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
                  {sortedCandidates[0].chairmanName} —{' '}
                  {sortedCandidates[0].votes} suara ({sortedCandidates[0].percentage}%)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
