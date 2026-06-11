import jsPDF from 'jspdf'

interface MainPoint {
  id: string
  title: string
  content: string
}

interface SermonData {
  title: string
  theme: string | null
  scripture_reference: string | null
  scripture_text: string | null
  introduction: string | null
  main_points: MainPoint[]
  conclusion: string | null
  tags: string[]
  status: string
  created_at: string
}

interface PDFOptions {
  showBranding: boolean
  organizationName?: string | null
  customFooter?: string | null
  authorName?: string
}

export function generateSermonPDF(sermon: SermonData, options: PDFOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Brand Colors (Christmade)
  const royalBlue: [number, number, number] = [26, 35, 126]
  const gold: [number, number, number] = [212, 175, 0]
  const darkGray: [number, number, number] = [66, 66, 66]
  const lightGray: [number, number, number] = [158, 158, 158]

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)

  let currentY = margin

  // ===== HEADER (Christmade Branding for Free Users) =====
  if (options.showBranding) {
    // Royal Blue header bar
    doc.setFillColor(...royalBlue)
    doc.rect(0, 0, pageWidth, 25, 'F')
    
    // Christmade logo text (gold)
    doc.setTextColor(...gold)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('Christmade', margin, 16)
    
    // Tagline
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text('Tools That Build the Kingdom', margin, 21)
    
    currentY = 35
  } else if (options.organizationName) {
    // Custom organization name for Pro/Church users
    doc.setTextColor(...royalBlue)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(options.organizationName, margin, 16)
    
    // Line separator
    doc.setDrawColor(...gold)
    doc.setLineWidth(0.5)
    doc.line(margin, 20, pageWidth - margin, 20)
    
    currentY = 30
  } else {
    currentY = margin
  }

  // ===== SERMON TITLE =====
  doc.setTextColor(...royalBlue)
  doc.setFont('times', 'bold')
  doc.setFontSize(24)
  const titleLines = doc.splitTextToSize(sermon.title, contentWidth)
  doc.text(titleLines, margin, currentY)
  currentY += (titleLines.length * 10) + 5

  // ===== THEME =====
  if (sermon.theme) {
    doc.setTextColor(...darkGray)
    doc.setFont('times', 'italic')
    doc.setFontSize(12)
    const themeLines = doc.splitTextToSize(sermon.theme, contentWidth)
    doc.text(themeLines, margin, currentY)
    currentY += (themeLines.length * 6) + 5
  }

  // ===== AUTHOR & DATE =====
  doc.setTextColor(...lightGray)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  if (options.authorName) {
    doc.text(`By ${options.authorName}`, margin, currentY)
  }
  const dateStr = new Date(sermon.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
  const dateWidth = doc.getTextWidth(dateStr)
  doc.text(dateStr, pageWidth - margin - dateWidth, currentY)
  currentY += 10

  // ===== SCRIPTURE BOX =====
  if (sermon.scripture_reference || sermon.scripture_text) {
    // Background box
    doc.setFillColor(245, 247, 255)
    doc.roundedRect(margin, currentY, contentWidth, 30, 3, 3, 'F')
    
    let boxY = currentY + 7
    
    if (sermon.scripture_text) {
      doc.setTextColor(...royalBlue)
      doc.setFont('times', 'italic')
      doc.setFontSize(11)
      const scriptureLines = doc.splitTextToSize(`"${sermon.scripture_text}"`, contentWidth - 10)
      doc.text(scriptureLines, margin + 5, boxY)
      boxY += (scriptureLines.length * 5) + 3
    }
    
    if (sermon.scripture_reference) {
      doc.setTextColor(...gold)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(`— ${sermon.scripture_reference} (KJV)`, margin + 5, boxY)
    }
    
    currentY += 40
  }

  // Helper function to check if we need a new page
  const checkPageBreak = (neededSpace: number) => {
    if (currentY + neededSpace > pageHeight - 30) {
      doc.addPage()
      currentY = margin
      return true
    }
    return false
  }

  // ===== INTRODUCTION =====
  if (sermon.introduction) {
    checkPageBreak(20)
    
    doc.setTextColor(...royalBlue)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('INTRODUCTION', margin, currentY)
    currentY += 6
    
    // Gold line under heading
    doc.setDrawColor(...gold)
    doc.setLineWidth(0.5)
    doc.line(margin, currentY, margin + 40, currentY)
    currentY += 5

    doc.setTextColor(...darkGray)
    doc.setFont('times', 'normal')
    doc.setFontSize(11)
    const introLines = doc.splitTextToSize(sermon.introduction, contentWidth)
    
    introLines.forEach((line: string) => {
      checkPageBreak(7)
      doc.text(line, margin, currentY)
      currentY += 6
    })
    currentY += 8
  }

  // ===== MAIN POINTS =====
  if (sermon.main_points && sermon.main_points.length > 0) {
    checkPageBreak(20)
    
    doc.setTextColor(...royalBlue)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('MAIN POINTS', margin, currentY)
    currentY += 6
    
    doc.setDrawColor(...gold)
    doc.setLineWidth(0.5)
    doc.line(margin, currentY, margin + 40, currentY)
    currentY += 8

    sermon.main_points.forEach((point, index) => {
      if (!point.title.trim() && !point.content.trim()) return
      
      checkPageBreak(15)
      
      // Point number circle (gold)
      doc.setFillColor(...gold)
      doc.circle(margin + 4, currentY - 1, 4, 'F')
      doc.setTextColor(...royalBlue)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(`${index + 1}`, margin + 2.5, currentY + 1)

      // Point title
      if (point.title) {
        doc.setTextColor(...royalBlue)
        doc.setFont('times', 'bold')
        doc.setFontSize(13)
        const titleLines = doc.splitTextToSize(point.title, contentWidth - 12)
        doc.text(titleLines, margin + 12, currentY)
        currentY += (titleLines.length * 6) + 3
      }

      // Point content
      if (point.content) {
        doc.setTextColor(...darkGray)
        doc.setFont('times', 'normal')
        doc.setFontSize(11)
        const contentLines = doc.splitTextToSize(point.content, contentWidth - 12)
        
        contentLines.forEach((line: string) => {
          checkPageBreak(7)
          doc.text(line, margin + 12, currentY)
          currentY += 6
        })
      }
      
      currentY += 8
    })
  }

  // ===== CONCLUSION =====
  if (sermon.conclusion) {
    checkPageBreak(20)
    
    doc.setTextColor(...royalBlue)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('CONCLUSION', margin, currentY)
    currentY += 6
    
    doc.setDrawColor(...gold)
    doc.setLineWidth(0.5)
    doc.line(margin, currentY, margin + 40, currentY)
    currentY += 5

    doc.setTextColor(...darkGray)
    doc.setFont('times', 'normal')
    doc.setFontSize(11)
    const conclusionLines = doc.splitTextToSize(sermon.conclusion, contentWidth)
    
    conclusionLines.forEach((line: string) => {
      checkPageBreak(7)
      doc.text(line, margin, currentY)
      currentY += 6
    })
    currentY += 8
  }

  // ===== TAGS =====
  if (sermon.tags && sermon.tags.length > 0) {
    checkPageBreak(15)
    
    doc.setTextColor(...lightGray)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Tags: ${sermon.tags.join(' • ')}`, margin, currentY)
    currentY += 5
  }

  // ===== FOOTER ON EVERY PAGE =====
  const totalPages = doc.getNumberOfPages()
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    
    if (options.showBranding) {
      // Christmade branded footer
      doc.setFillColor(...royalBlue)
      doc.rect(0, pageHeight - 15, pageWidth, 15, 'F')
      
      doc.setTextColor(...gold)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text('Christmade', margin, pageHeight - 7)
      
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.text('Made with Christmade • christmade-platform.netlify.app', margin + 22, pageHeight - 7)
      
      // Page number
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      const pageText = `Page ${i} of ${totalPages}`
      const pageTextWidth = doc.getTextWidth(pageText)
      doc.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 7)
    } else {
      // Clean footer for Pro/Church users
      doc.setDrawColor(...lightGray)
      doc.setLineWidth(0.3)
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)
      
      doc.setTextColor(...lightGray)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      
      if (options.customFooter) {
        doc.text(options.customFooter, margin, pageHeight - 8)
      }
      
      const pageText = `Page ${i} of ${totalPages}`
      const pageTextWidth = doc.getTextWidth(pageText)
      doc.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 8)
    }
  }

  // Generate filename
  const safeTitle = sermon.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  const filename = `${safeTitle}_sermon.pdf`

  // Download the PDF
  doc.save(filename)
}