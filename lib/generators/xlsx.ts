import ExcelJS from 'exceljs';

/**
 * Generate Excel (.xlsx) document from AI-generated content
 * 
 * Primarily for Invoice and Report templates with tabular data
 */

export async function generateXlsx(content: any, templateType: string): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  switch (templateType.toUpperCase()) {
    case 'INVOICE':
      generateInvoiceXlsx(workbook, content);
      break;
    case 'REPORT':
      generateReportXlsx(workbook, content);
      break;
    case 'MEMO':
      generateMemoXlsx(workbook, content);
      break;
    case 'CONTENT':
      generateContentXlsx(workbook, content);
      break;
    case 'PRESENTATION':
      generatePresentationXlsx(workbook, content);
      break;
    case 'RESUME':
      generateResumeXlsx(workbook, content);
      break;
    case 'LEGAL_CONTRACT':
      generateContractXlsx(workbook, content);
      break;
    case 'NEWSLETTER':
      generateNewsletterXlsx(workbook, content);
      break;
    case 'MEETING_MINUTES':
      generateMinutesXlsx(workbook, content);
      break;
    case 'PROJECT_PROPOSAL':
      generateProposalXlsx(workbook, content);
      break;
    case 'PRODUCT_SPEC':
      generatePRDXlsx(workbook, content);
      break;
    case 'PRESS_RELEASE':
      generatePressReleaseXlsx(workbook, content);
      break;
    case 'CASE_STUDY':
      generateCaseStudyXlsx(workbook, content);
      break;
    case 'EXPENSE_REPORT':
      generateExpenseReportXlsx(workbook, content);
      break;
    case 'COVER_LETTER':
    case 'JOB_DESCRIPTION':
    case 'SOCIAL_MEDIA_PLAN':
    case 'SOP':
    case 'MEETING_AGENDA':
    case 'THANK_YOU_NOTE':
    case 'DAILY_STANDUP':
    case 'FEEDBACK_FORM':
    case 'EVENT_INVITATION':
    case 'ONBOARDING_CHECKLIST':
    case 'PERFORMANCE_REVIEW':
    case 'TRAINING_MANUAL':
    case 'INCIDENT_REPORT':
    case 'QUARTERLY_GOALS':
    case 'WHITE_PAPER':
    case 'RFP_RESPONSE':
    case 'EXECUTIVE_SUMMARY':
    case 'BUSINESS_PLAN':
    case 'SWOT_ANALYSIS':
    case 'ANNUAL_REPORT':
    case 'BOARD_PRESENTATION':
    case 'COMPLIANCE_AUDIT':
    case 'MERGER_PROPOSAL':
    case 'INVESTOR_PITCH':
      generateGenericXlsx(workbook, content, templateType);
      break;
    default:
      generateGenericXlsx(workbook, content, templateType);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer as ArrayBuffer);
}

function generateExpenseReportXlsx(workbook: ExcelJS.Workbook, content: any) {
  const sheet = workbook.addWorksheet('Expense Report');

  // Title
  sheet.mergeCells('A1:D1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'EXPENSE REPORT';
  titleCell.font = { size: 18, bold: true, color: { argb: 'FF1E40AF' } };
  titleCell.alignment = { horizontal: 'center' };

  // Header Info
  sheet.getCell('A3').value = 'Employee:';
  sheet.getCell('A3').font = { bold: true };
  sheet.getCell('B3').value = content.employee || content.employeeName;

  sheet.getCell('A4').value = 'Period:';
  sheet.getCell('A4').font = { bold: true };
  sheet.getCell('B4').value = content.period || content.reportPeriod;

  sheet.getCell('A5').value = 'Department:';
  sheet.getCell('A5').font = { bold: true };
  sheet.getCell('B5').value = content.department;

  // Table Header
  const headerRow = sheet.getRow(7);
  headerRow.values = ['Date', 'Category', 'Description', 'Amount'];
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  
  // Style header cells
  ['A', 'B', 'C', 'D'].forEach(col => {
    const cell = sheet.getCell(`${col}7`);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    };
    cell.alignment = { horizontal: 'center' };
  });

  // Data Rows
  let currentRow = 8;
  const items = content.items || content.expenses || [];
  
  if (Array.isArray(items)) {
    items.forEach((item: any) => {
      const row = sheet.getRow(currentRow);
      row.values = [
        item.date,
        item.category,
        item.description,
        item.amount
      ];
      
      // Right-align currency
      sheet.getCell(`D${currentRow}`).alignment = { horizontal: 'right' };
      currentRow++;
    });
  }

  // Add some space
  currentRow++;

  // Total
  sheet.getCell(`C${currentRow}`).value = 'TOTAL REIMBURSEMENT:';
  sheet.getCell(`C${currentRow}`).font = { bold: true };
  sheet.getCell(`C${currentRow}`).alignment = { horizontal: 'right' };
  
  sheet.getCell(`D${currentRow}`).value = content.totalAmount;
  sheet.getCell(`D${currentRow}`).font = { bold: true, color: { argb: 'FF2563EB' } };
  sheet.getCell(`D${currentRow}`).numFmt = '$#,##0.00';
  sheet.getCell(`D${currentRow}`).alignment = { horizontal: 'right' };

  // Final touches
  sheet.getColumn('D').numFmt = '$#,##0.00';
  sheet.getColumn('A').width = 15;
  sheet.getColumn('B').width = 20;
  sheet.getColumn('C').width = 45;
  sheet.getColumn('D').width = 15;

  // Add border to items table
  const lastDataRow = currentRow - 2;
  if (lastDataRow >= 7) {
    for (let r = 7; r <= lastDataRow; r++) {
      ['A', 'B', 'C', 'D'].forEach(col => {
        sheet.getCell(`${col}${r}`).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
  }
}

function generateGenericXlsx(workbook: ExcelJS.Workbook, content: any, type: string) {
  const sheet = workbook.addWorksheet(type.replace(/_/g, ' '));
  
  sheet.getCell('A1').value = type.replace(/_/g, ' ');
  sheet.getCell('A1').font = { bold: true, size: 16 };

  let currentRow = 3;

  function renderValue(val: any, depth = 0) {
    if (currentRow > 1000) return; // Safety limit

    if (Array.isArray(val)) {
      val.forEach((item, index) => {
        if (typeof item === 'object') {
          sheet.getCell(`A${currentRow}`).value = `Item ${index + 1}`;
          sheet.getCell(`A${currentRow}`).font = { italic: true };
          currentRow++;
          renderValue(item, depth + 1);
        } else {
          sheet.getCell(`B${currentRow}`).value = `• ${item}`;
          currentRow++;
        }
      });
    } else if (typeof val === 'object' && val !== null) {
      Object.entries(val).forEach(([key, value]) => {
        const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        sheet.getCell(`A${currentRow}`).value = displayKey + ':';
        sheet.getCell(`A${currentRow}`).font = { bold: true };
        
        if (typeof value === 'object' && value !== null) {
          currentRow++;
          renderValue(value, depth + 1);
        } else {
          // Ensure value is a valid CellValue type (string, number, boolean, Date, or null)
          const cellValue = (value === null || value === undefined) ? '' : 
                           (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value instanceof Date) ? value : 
                           String(value);
          sheet.getCell(`B${currentRow}`).value = cellValue;
          currentRow++;
        }
      });
    } else {
      sheet.getCell(`B${currentRow}`).value = val;
      currentRow++;
    }
  }

  renderValue(content);

  sheet.getColumn('A').width = 30;
  sheet.getColumn('B').width = 60;
  sheet.getColumn('B').alignment = { wrapText: true };
}

function generateResumeXlsx(workbook: ExcelJS.Workbook, content: any) {
  const sheet = workbook.addWorksheet('Resume');
  
  // Header
  sheet.getCell('A1').value = content.personalInfo.fullName;
  sheet.getCell('A1').font = { bold: true, size: 16 };
  sheet.getCell('A2').value = `${content.personalInfo.contact} | ${content.personalInfo.location}`;
  
  let currentRow = 4;
  
  // Summary
  sheet.getCell(`A${currentRow}`).value = 'SUMMARY';
  sheet.getCell(`A${currentRow}`).font = { bold: true };
  currentRow++;
  sheet.getCell(`A${currentRow}`).value = content.summary;
  sheet.getCell(`A${currentRow}`).alignment = { wrapText: true };
  currentRow += 2;
  
  // Experience
  sheet.getCell(`A${currentRow}`).value = 'EXPERIENCE';
  sheet.getCell(`A${currentRow}`).font = { bold: true };
  currentRow++;
  
  content.experience.forEach((exp: any) => {
    sheet.getCell(`A${currentRow}`).value = `${exp.role} at ${exp.company}`;
    sheet.getCell(`A${currentRow}`).font = { italic: true };
    sheet.getCell(`B${currentRow}`).value = exp.period;
    currentRow++;
    
    exp.points.forEach((point: string) => {
      sheet.getCell(`A${currentRow}`).value = `• ${point}`;
      currentRow++;
    });
    currentRow++;
  });
  
  // Education
  sheet.getCell(`A${currentRow}`).value = 'EDUCATION';
  sheet.getCell(`A${currentRow}`).font = { bold: true };
  currentRow++;
  
  content.education.forEach((edu: any) => {
    sheet.getCell(`A${currentRow}`).value = edu.degree;
    sheet.getCell(`B${currentRow}`).value = edu.period;
    currentRow++;
    sheet.getCell(`A${currentRow}`).value = edu.school;
    currentRow += 2;
  });
  
  // Skills
  sheet.getCell(`A${currentRow}`).value = 'SKILLS';
  sheet.getCell(`A${currentRow}`).font = { bold: true };
  currentRow++;
  sheet.getCell(`A${currentRow}`).value = `Technical: ${content.skills.technical.join(', ')}`;
  currentRow++;
  sheet.getCell(`A${currentRow}`).value = `Soft Skills: ${content.skills.soft.join(', ')}`;

  sheet.getColumn('A').width = 80;
  sheet.getColumn('B').width = 20;
}

function generateContractXlsx(workbook: ExcelJS.Workbook, content: any) {
  const sheet = workbook.addWorksheet('Contract');
  sheet.getCell('A1').value = content.title;
  sheet.getCell('A1').font = { bold: true, size: 16 };
  
  sheet.getCell('A3').value = 'Provider:';
  sheet.getCell('B3').value = content.parties.provider;
  sheet.getCell('A4').value = 'Client:';
  sheet.getCell('B4').value = content.parties.client;

  let currentRow = 6;
  content.sections.forEach((section: any) => {
    sheet.getCell(`A${currentRow}`).value = section.heading;
    sheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;
    sheet.getCell(`A${currentRow}`).value = section.content;
    sheet.getCell(`A${currentRow}`).alignment = { wrapText: true };
    currentRow += 2;
  });
  sheet.getColumn('A').width = 40;
  sheet.getColumn('B').width = 80;
}

function generateNewsletterXlsx(workbook: ExcelJS.Workbook, content: any) {
  const sheet = workbook.addWorksheet('Newsletter');
  sheet.getCell('A1').value = content.title;
  sheet.getCell('A1').font = { bold: true, size: 16 };
  sheet.getCell('A2').value = content.edition;

  let currentRow = 4;
  content.articles.forEach((article: any) => {
    sheet.getCell(`A${currentRow}`).value = article.headline;
    sheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;
    sheet.getCell(`A${currentRow}`).value = article.body;
    sheet.getCell(`A${currentRow}`).alignment = { wrapText: true };
    currentRow += 2;
  });
  sheet.getColumn('A').width = 100;
}

function generateMinutesXlsx(workbook: ExcelJS.Workbook, content: any) {
  const sheet = workbook.addWorksheet('Meeting Minutes');
  sheet.getCell('A1').value = content.title;
  sheet.getCell('A1').font = { bold: true, size: 16 };
  sheet.getCell('A2').value = content.dateTime;

  sheet.getCell('A4').value = 'Attendees:';
  sheet.getCell('B4').value = content.attendees.join(', ');

  let currentRow = 6;
  sheet.getCell(`A${currentRow}`).value = 'Agenda:';
  sheet.getCell(`A${currentRow}`).font = { bold: true };
  currentRow++;
  content.agenda.forEach((item: string) => {
    sheet.getCell(`A${currentRow}`).value = `• ${item}`;
    currentRow++;
  });

  currentRow++;
  sheet.getCell(`A${currentRow}`).value = 'Discussions:';
  sheet.getCell(`A${currentRow}`).font = { bold: true };
  currentRow++;
  content.discussions.forEach((disc: any) => {
    sheet.getCell(`A${currentRow}`).value = disc.topic;
    sheet.getCell(`B${currentRow}`).value = disc.summary;
    sheet.getCell(`B${currentRow}`).alignment = { wrapText: true };
    currentRow++;
  });

  currentRow++;
  sheet.getCell(`A${currentRow}`).value = 'Action Items:';
  sheet.getCell(`A${currentRow}`).font = { bold: true };
  currentRow++;
  content.actionItems.forEach((action: any) => {
    sheet.getCell(`A${currentRow}`).value = action.item;
    sheet.getCell(`B${currentRow}`).value = action.assignee;
    currentRow++;
  });
  
  sheet.getColumn('A').width = 30;
  sheet.getColumn('B').width = 70;
}

function generateInvoiceXlsx(workbook: ExcelJS.Workbook, content: any) {
  const sheet = workbook.addWorksheet('Invoice');

  // Title
  sheet.mergeCells('A1:D1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'INVOICE';
  titleCell.font = { size: 18, bold: true };
  titleCell.alignment = { horizontal: 'center' };

  // Invoice details
  sheet.getCell('A3').value = 'Invoice Number:';
  sheet.getCell('B3').value = content.header.invoiceNumber;
  sheet.getCell('A4').value = 'Date:';
  sheet.getCell('B4').value = content.header.invoiceDate;
  sheet.getCell('A5').value = 'Due Date:';
  sheet.getCell('B5').value = content.header.dueDate;

  // Client info
  sheet.getCell('A7').value = 'Bill To:';
  sheet.getCell('A7').font = { bold: true };
  sheet.getCell('A8').value = content.client.name;
  sheet.getCell('A9').value = content.client.address;

  // Items header
  const headerRow = sheet.getRow(11);
  headerRow.values = ['Description', 'Quantity', 'Rate', 'Amount'];
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE5E7EB' },
  };

  // Items
  let currentRow = 12;
  content.items.forEach((item: any) => {
    const row = sheet.getRow(currentRow);
    row.values = [item.description, item.quantity, item.rate, item.amount];
    currentRow++;
  });

  // Totals
  sheet.getCell(`C${currentRow + 1}`).value = 'Subtotal:';
  sheet.getCell(`D${currentRow + 1}`).value = content.subtotal;
  sheet.getCell(`C${currentRow + 2}`).value = 'Tax:';
  sheet.getCell(`D${currentRow + 2}`).value = content.tax;
  sheet.getCell(`C${currentRow + 3}`).value = 'TOTAL:';
  sheet.getCell(`C${currentRow + 3}`).font = { bold: true };
  sheet.getCell(`D${currentRow + 3}`).value = content.total;
  sheet.getCell(`D${currentRow + 3}`).font = { bold: true };

  // Format currency columns
  sheet.getColumn('C').numFmt = '$#,##0.00';
  sheet.getColumn('D').numFmt = '$#,##0.00';

  // Column widths
  sheet.getColumn('A').width = 40;
  sheet.getColumn('B').width = 12;
  sheet.getColumn('C').width = 12;
  sheet.getColumn('D').width = 12;
}

function generateReportXlsx(workbook: ExcelJS.Workbook, content: any) {
  const sheet = workbook.addWorksheet('Report');

  // Title
  sheet.mergeCells('A1:D1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = content.title;
  titleCell.font = { size: 18, bold: true };
  titleCell.alignment = { horizontal: 'center' };

  // Metadata
  sheet.getCell('A3').value = 'Date:';
  sheet.getCell('B3').value = content.date;
  sheet.getCell('A4').value = 'Department:';
  sheet.getCell('B4').value = content.department;

  // Executive Summary
  sheet.getCell('A6').value = 'Executive Summary';
  sheet.getCell('A6').font = { bold: true, size: 14 };
  sheet.mergeCells('A7:D7');
  sheet.getCell('A7').value = content.executiveSummary;
  sheet.getCell('A7').alignment = { wrapText: true };

  let currentRow = 9;

  // Sections
  content.sections.forEach((section: any) => {
    sheet.getCell(`A${currentRow}`).value = section.heading;
    sheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    currentRow++;
    sheet.mergeCells(`A${currentRow}:D${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = section.content;
    sheet.getCell(`A${currentRow}`).alignment = { wrapText: true };
    currentRow += 2;
  });

  // Findings
  sheet.getCell(`A${currentRow}`).value = 'Key Findings';
  sheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
  currentRow++;
  content.findings.forEach((finding: string) => {
    sheet.getCell(`A${currentRow}`).value = `• ${finding}`;
    currentRow++;
  });
  currentRow++;

  // Recommendations
  sheet.getCell(`A${currentRow}`).value = 'Recommendations';
  sheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
  currentRow++;
  content.recommendations.forEach((rec: string) => {
    sheet.getCell(`A${currentRow}`).value = `• ${rec}`;
    currentRow++;
  });

  // Column widths
  sheet.getColumn('A').width = 80;
}

function generateMemoXlsx(workbook: ExcelJS.Workbook, content: any) {
  const sheet = workbook.addWorksheet('Memo');

  // Title
  sheet.mergeCells('A1:D1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'MEMORANDUM';
  titleCell.font = { size: 18, bold: true };
  titleCell.alignment = { horizontal: 'center' };

  // Header fields
  sheet.getCell('A3').value = 'TO:';
  sheet.getCell('B3').value = content.header.to;
  sheet.getCell('A4').value = 'FROM:';
  sheet.getCell('B4').value = content.header.from;
  sheet.getCell('A5').value = 'DATE:';
  sheet.getCell('B5').value = content.header.date;
  sheet.getCell('A6').value = 'SUBJECT:';
  sheet.getCell('B6').value = content.header.subject;

  // Body
  let currentRow = 8;
  sheet.mergeCells(`A${currentRow}:D${currentRow}`);
  sheet.getCell(`A${currentRow}`).value = content.body.opening;
  sheet.getCell(`A${currentRow}`).alignment = { wrapText: true };
  currentRow += 2;

  content.body.mainContent.forEach((paragraph: string) => {
    sheet.mergeCells(`A${currentRow}:D${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = paragraph;
    sheet.getCell(`A${currentRow}`).alignment = { wrapText: true };
    currentRow += 2;
  });

  sheet.mergeCells(`A${currentRow}:D${currentRow}`);
  sheet.getCell(`A${currentRow}`).value = content.body.closing;
  sheet.getCell(`A${currentRow}`).alignment = { wrapText: true };
  currentRow += 2;

  // Action Items
  if (content.actionItems && content.actionItems.length > 0) {
    sheet.getCell(`A${currentRow}`).value = 'Action Items:';
    sheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;
    content.actionItems.forEach((item: string) => {
      sheet.getCell(`A${currentRow}`).value = `• ${item}`;
      currentRow++;
    });
  }

  // Column widths
  sheet.getColumn('A').width = 15;
  sheet.getColumn('B').width = 60;
}

function generateContentXlsx(workbook: ExcelJS.Workbook, content: any) {
  const sheet = workbook.addWorksheet('Content');

  // Title
  sheet.mergeCells('A1:D1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = content.title;
  titleCell.font = { size: 18, bold: true };
  titleCell.alignment = { horizontal: 'center' };

  sheet.getCell('A3').value = 'Author:';
  sheet.getCell('B3').value = content.author;

  sheet.getCell('A5').value = 'Executive Summary';
  sheet.getCell('A5').font = { bold: true, size: 14 };
  sheet.mergeCells('A6:D6');
  sheet.getCell('A6').value = content.summary;
  sheet.getCell('A6').alignment = { wrapText: true };

  let currentRow = 8;
  content.sections.forEach((section: any) => {
    sheet.getCell(`A${currentRow}`).value = section.subheading;
    sheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    currentRow++;
    
    section.paragraphs.forEach((para: string) => {
      sheet.mergeCells(`A${currentRow}:D${currentRow}`);
      sheet.getCell(`A${currentRow}`).value = para;
      sheet.getCell(`A${currentRow}`).alignment = { wrapText: true };
      currentRow++;
    });
    currentRow++;
  });

  sheet.getCell(`A${currentRow}`).value = 'Call to Action';
  sheet.getCell(`A${currentRow}`).font = { bold: true };
  currentRow++;
  sheet.mergeCells(`A${currentRow}:D${currentRow}`);
  sheet.getCell(`A${currentRow}`).value = content.callToAction;

  sheet.getColumn('A').width = 100;
}

function generatePresentationXlsx(workbook: ExcelJS.Workbook, content: any) {
  const sheet = workbook.addWorksheet('Presentation');

  sheet.mergeCells('A1:D1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = content.presentationTitle;
  titleCell.font = { size: 18, bold: true };
  titleCell.alignment = { horizontal: 'center' };

  let currentRow = 4;
  content.slides.forEach((slide: any) => {
    sheet.getCell(`A${currentRow}`).value = `Slide ${slide.slideNumber}: ${slide.title}`;
    sheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;

    slide.content.forEach((point: string) => {
      sheet.getCell(`A${currentRow}`).value = `• ${point}`;
      currentRow++;
    });

    sheet.getCell(`A${currentRow}`).value = `[Visual: ${slide.imageKeyword}]`;
    sheet.getCell(`A${currentRow}`).font = { italic: true, color: { argb: 'FF888888' } };
    currentRow += 2;
  });

  sheet.getColumn('A').width = 100;
}

function generateProposalXlsx(workbook: ExcelJS.Workbook, content: any) {
  const sheet = workbook.addWorksheet('Proposal');
  sheet.getCell('A1').value = 'PROJECT PROPOSAL';
  sheet.getCell('A1').font = { bold: true, size: 16 };
  sheet.getCell('A2').value = content.title;
  sheet.getCell('A3').value = `Client: ${content.client}`;
  sheet.getCell('A4').value = `Budget: ${content.budget.total}`;

  let currentRow = 6;
  sheet.getCell(`A${currentRow}`).value = 'Goals:';
  sheet.getCell(`A${currentRow}`).font = { bold: true };
  currentRow++;
  content.goals.forEach((goal: string) => {
    sheet.getCell(`A${currentRow}`).value = `• ${goal}`;
    currentRow++;
  });

  currentRow++;
  sheet.getCell(`A${currentRow}`).value = 'Scope & Deliverables:';
  sheet.getCell(`A${currentRow}`).font = { bold: true };
  currentRow++;
  content.scope.forEach((item: any) => {
    sheet.getCell(`A${currentRow}`).value = item.deliverable;
    sheet.getCell(`B${currentRow}`).value = item.description;
    currentRow++;
  });

  currentRow++;
  sheet.getCell(`A${currentRow}`).value = 'Timeline:';
  sheet.getCell(`A${currentRow}`).font = { bold: true };
  currentRow++;
  content.timeline.forEach((item: any) => {
    sheet.getCell(`A${currentRow}`).value = item.phase;
    sheet.getCell(`B${currentRow}`).value = item.duration;
    currentRow++;
  });

  sheet.getColumn('A').width = 40;
  sheet.getColumn('B').width = 60;
}

function generatePRDXlsx(workbook: ExcelJS.Workbook, content: any) {
  const sheet = workbook.addWorksheet('PRD');
  sheet.getCell('A1').value = `${content.productName} - PRD`;
  sheet.getCell('A1').font = { bold: true, size: 16 };

  let currentRow = 3;
  sheet.getCell(`A${currentRow}`).value = 'Objectives:';
  sheet.getCell(`A${currentRow}`).font = { bold: true };
  currentRow++;
  content.objectives.forEach((o: string) => {
    sheet.getCell(`A${currentRow}`).value = `• ${o}`;
    currentRow++;
  });

  currentRow++;
  sheet.getCell(`A${currentRow}`).value = 'Functional Requirements:';
  sheet.getCell(`A${currentRow}`).font = { bold: true };
  currentRow++;
  sheet.getRow(currentRow).values = ['Feature', 'Priority', 'Description'];
  sheet.getRow(currentRow).font = { bold: true };
  currentRow++;
  content.functionalRequirements.forEach((req: any) => {
    sheet.getRow(currentRow).values = [req.feature, req.priority, req.description];
    currentRow++;
  });

  currentRow++;
  sheet.getCell(`A${currentRow}`).value = 'Success Metrics:';
  sheet.getCell(`A${currentRow}`).font = { bold: true };
  currentRow++;
  content.successMetrics.forEach((m: string) => {
    sheet.getCell(`A${currentRow}`).value = `• ${m}`;
    currentRow++;
  });

  sheet.getColumn('A').width = 40;
  sheet.getColumn('B').width = 15;
  sheet.getColumn('C').width = 60;
}

function generatePressReleaseXlsx(workbook: ExcelJS.Workbook, content: any) {
  const sheet = workbook.addWorksheet('Press Release');
  sheet.getCell('A1').value = 'PRESS RELEASE';
  sheet.getCell('B1').value = 'FOR IMMEDIATE RELEASE';
  sheet.getCell('A3').value = 'Headline:';
  sheet.getCell('B3').value = content.headline;
  sheet.getCell('A4').value = 'Subheadline:';
  sheet.getCell('B4').value = content.subheadline;
  sheet.getCell('A5').value = 'Date/Location:';
  sheet.getCell('B5').value = content.locationDate;

  sheet.getCell('A7').value = 'Lead:';
  sheet.getCell('B7').value = content.lead;
  sheet.getCell('B7').alignment = { wrapText: true };

  let currentRow = 9;
  sheet.getCell(`A${currentRow}`).value = 'Body Content:';
  currentRow++;
  content.body.forEach((p: string) => {
    sheet.getCell(`B${currentRow}`).value = p;
    sheet.getCell(`B${currentRow}`).alignment = { wrapText: true };
    currentRow++;
  });

  sheet.getColumn('A').width = 20;
  sheet.getColumn('B').width = 100;
}

function generateCaseStudyXlsx(workbook: ExcelJS.Workbook, content: any) {
  const sheet = workbook.addWorksheet('Case Study');
  sheet.getCell('A1').value = 'CLIENT CASE STUDY';
  sheet.getCell('A2').value = content.projectTitle;
  sheet.getCell('A3').value = `Client: ${content.client}`;

  sheet.getRow(5).values = ['Sector', 'Challenge', 'Result'];
  sheet.getRow(5).font = { bold: true };
  sheet.getRow(6).values = [content.atAGlance.sector, content.atAGlance.challenge, content.atAGlance.result];

  sheet.getCell('A8').value = 'Challenge Detail:';
  sheet.getCell('B8').value = content.theChallenge;
  sheet.getCell('A9').value = 'Solution Detail:';
  sheet.getCell('B9').value = content.theSolution;

  let currentRow = 11;
  sheet.getCell(`A${currentRow}`).value = 'Impact & Results:';
  currentRow++;
  content.theResults.forEach((r: string) => {
    sheet.getCell(`B${currentRow}`).value = `• ${r}`;
    currentRow++;
  });

  sheet.getColumn('A').width = 25;
  sheet.getColumn('B').width = 80;
}
