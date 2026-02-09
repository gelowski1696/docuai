import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, HeadingLevel, AlignmentType } from 'docx';

/**
 * Generate Word (.docx) document from AI-generated content
 * 
 * Supports Invoice, Report, and Memo templates
 */

export async function generateDocx(content: any, templateType: string): Promise<Buffer> {
  let doc: Document;

  switch (templateType.toUpperCase()) {
    case 'INVOICE':
      doc = generateInvoiceDocx(content);
      break;
    case 'REPORT':
      doc = generateReportDocx(content);
      break;
    case 'MEMO':
      doc = generateMemoDocx(content);
      break;
    case 'CONTENT':
      doc = generateContentDocx(content);
      break;
    case 'PRESENTATION':
      doc = generatePresentationDocx(content);
      break;
    case 'RESUME':
      doc = generateResumeDocx(content);
      break;
    case 'LEGAL_CONTRACT':
      doc = generateContractDocx(content);
      break;
    case 'NEWSLETTER':
      doc = generateNewsletterDocx(content);
      break;
    case 'MEETING_MINUTES':
      doc = generateMinutesDocx(content);
      break;
    case 'PROJECT_PROPOSAL':
      doc = generateProposalDocx(content);
      break;
    case 'PRODUCT_SPEC':
      doc = generatePRDDocx(content);
      break;
    case 'PRESS_RELEASE':
      doc = generatePressReleaseDocx(content);
      break;
    case 'CASE_STUDY':
      doc = generateCaseStudyDocx(content);
      break;
    case 'EXPENSE_REPORT':
      doc = generateExpenseReportDocx(content);
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
      doc = generateGenericDocx(content, templateType);
      break;
    default:
      doc = generateGenericDocx(content, templateType);
  }

  return await Packer.toBuffer(doc);
}

function generateExpenseReportDocx(content: any): Document {
  const sections = [];

  sections.push(
    new Paragraph({
      text: 'EXPENSE REPORT',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Employee: ', bold: true }), new TextRun(content.employee || content.employeeName || '')],
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Period: ', bold: true }), new TextRun(content.period || content.reportPeriod || '')],
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Department: ', bold: true }), new TextRun(content.department || '')],
      spacing: { after: 400 },
    })
  );

  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Date', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Category', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Description', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Amount', bold: true })] })] }),
      ],
    }),
  ];

  const items = content.items || content.expenses || [];
  if (Array.isArray(items)) {
    items.forEach((item: any) => {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(item.date || '')] }),
            new TableCell({ children: [new Paragraph(item.category || '')] }),
            new TableCell({ children: [new Paragraph(item.description || '')] }),
            new TableCell({ children: [new Paragraph(`$${(item.amount || 0).toFixed(2)}`)] }),
          ],
        })
      );
    });
  }

  sections.push(
    new Table({
      rows: tableRows,
      width: { size: 100, type: 'pct' },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'TOTAL REIMBURSEMENT: ', bold: true, size: 28 }),
        new TextRun({ text: `$${content.totalAmount.toFixed(2)}`, bold: true, size: 28 }),
      ],
      alignment: AlignmentType.RIGHT,
      spacing: { before: 400 },
    })
  );

  return new Document({
    sections: [{ children: sections }],
  });
}

function generateGenericDocx(content: any, type: string): Document {
  const sections = [];

  sections.push(
    new Paragraph({
      text: type.replace(/_/g, ' '),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  function renderValue(val: any, depth = 0) {
    if (sections.length > 500) return; // Safety limit

    if (Array.isArray(val)) {
      val.forEach((item, index) => {
        if (typeof item === 'object') {
          sections.push(new Paragraph({ text: `Item ${index + 1}`, heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }));
          renderValue(item, depth + 1);
        } else {
          sections.push(new Paragraph({ text: `• ${item}`, bullet: { level: 0 } }));
        }
      });
    } else if (typeof val === 'object' && val !== null) {
      Object.entries(val).forEach(([key, value]) => {
        const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        if (typeof value === 'object') {
          sections.push(new Paragraph({ text: displayKey, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }));
          renderValue(value, depth + 1);
        } else {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${displayKey}: `, bold: true }),
                new TextRun(String(value)),
              ],
              spacing: { after: 100 },
            })
          );
        }
      });
    } else {
      sections.push(new Paragraph(String(val)));
    }
  }

  renderValue(content);

  return new Document({
    sections: [{ children: sections }],
  });
}

function generateResumeDocx(content: any): Document {
  const sections = [];

  // Header
  sections.push(
    new Paragraph({
      text: content.personalInfo.fullName.toUpperCase(),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: `${content.personalInfo.contact}  |  ${content.personalInfo.location}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Summary
  sections.push(
    new Paragraph({
      text: 'PROFESSIONAL SUMMARY',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      text: content.summary,
      spacing: { after: 300 },
    })
  );

  // Experience
  sections.push(
    new Paragraph({
      text: 'WORK EXPERIENCE',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    })
  );

  content.experience.forEach((exp: any) => {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: exp.role, bold: true, size: 24 }),
          new TextRun({ text: `\t${exp.period}`, color: '666666' }),
        ],
      }),
      new Paragraph({
        children: [new TextRun({ text: exp.company, italics: true, color: '444444' })],
        spacing: { after: 100 },
      })
    );

    exp.points.forEach((point: string) => {
      sections.push(
        new Paragraph({
          text: point,
          bullet: { level: 0 },
          spacing: { after: 50 },
        })
      );
    });
    sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  });

  // Education
  sections.push(
    new Paragraph({
      text: 'EDUCATION',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    })
  );

  content.education.forEach((edu: any) => {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: edu.degree, bold: true }),
          new TextRun({ text: `\t${edu.period}`, color: '666666' }),
        ],
      }),
      new Paragraph({
        text: edu.school,
        spacing: { after: 200 },
      })
    );
  });

  // Skills
  sections.push(
    new Paragraph({
      text: 'SKILLS',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Technical: ', bold: true }),
        new TextRun(content.skills.technical.join(', ')),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Soft Skills: ', bold: true }),
        new TextRun(content.skills.soft.join(', ')),
      ],
      spacing: { after: 300 },
    })
  );

  return new Document({
    sections: [{ children: sections }],
  });
}

function generateContractDocx(content: any): Document {
  const sections = [];

  sections.push(
    new Paragraph({
      text: content.title.toUpperCase(),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'BETWEEN: ', bold: true }),
        new TextRun(content.parties.provider),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'AND: ', bold: true }),
        new TextRun(content.parties.client),
      ],
      spacing: { after: 400 },
    })
  );

  content.sections.forEach((section: any) => {
    sections.push(
      new Paragraph({
        text: section.heading,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: section.content,
        spacing: { after: 300 },
      })
    );
  });

  // Signatures
  sections.push(
    new Paragraph({ text: '', spacing: { before: 800 } }),
    new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ text: '____________________' }),
                new Paragraph({ text: 'Provider Signature' }),
                new Paragraph({ text: 'Date: ______________' }),
              ],
              borders: { top: { style: 'none' }, bottom: { style: 'none' }, left: { style: 'none' }, right: { style: 'none' } },
            }),
            new TableCell({
              children: [
                new Paragraph({ text: '____________________' }),
                new Paragraph({ text: 'Client Signature' }),
                new Paragraph({ text: 'Date: ______________' }),
              ],
              borders: { top: { style: 'none' }, bottom: { style: 'none' }, left: { style: 'none' }, right: { style: 'none' } },
            }),
          ],
        }),
      ],
      width: { size: 100, type: 'pct' },
    })
  );

  return new Document({
    sections: [{ children: sections }],
  });
}

function generateNewsletterDocx(content: any): Document {
  const sections = [];

  sections.push(
    new Paragraph({
      text: content.title.toUpperCase(),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: content.edition,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  content.articles.forEach((article: any) => {
    sections.push(
      new Paragraph({
        text: article.headline,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: article.body,
        spacing: { after: 300 },
      })
    );
  });

  if (content.upcomingEvents && content.upcomingEvents.length > 0) {
    sections.push(
      new Paragraph({
        text: 'UPCOMING EVENTS',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );
    content.upcomingEvents.forEach((event: string) => {
      sections.push(
        new Paragraph({
          text: `• ${event}`,
          spacing: { after: 100 },
        })
      );
    });
  }

  return new Document({
    sections: [{ children: sections }],
  });
}

function generateMinutesDocx(content: any): Document {
  const sections = [];

  sections.push(
    new Paragraph({
      text: 'MEETING MINUTES',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: content.title,
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `Date: ${content.dateTime}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Attendees
  sections.push(
    new Paragraph({ children: [new TextRun({ text: 'Attendees:', bold: true })] }),
    new Paragraph({ text: content.attendees.join(', '), spacing: { after: 300 } })
  );

  // Agenda
  sections.push(
    new Paragraph({ text: 'AGENDA', heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } })
  );
  content.agenda.forEach((item: string) => {
    sections.push(new Paragraph({ text: `• ${item}`, spacing: { after: 100 } }));
  });

  // Discussions
  sections.push(
    new Paragraph({ text: 'DISCUSSIONS', heading: HeadingLevel.HEADING_3, spacing: { before: 300, after: 100 } })
  );
  content.discussions.forEach((disc: any) => {
    sections.push(
      new Paragraph({ children: [new TextRun({ text: disc.topic, bold: true })] }),
      new Paragraph({ text: disc.summary, spacing: { after: 200 } })
    );
  });

  // Action Items
  if (content.actionItems && content.actionItems.length > 0) {
    sections.push(
      new Paragraph({ text: 'ACTION ITEMS', heading: HeadingLevel.HEADING_3, spacing: { before: 300, after: 100 } })
    );
    content.actionItems.forEach((action: any) => {
      sections.push(
        new Paragraph({
          text: `• ${action.item} (Assignee: ${action.assignee})`,
          spacing: { after: 100 },
        })
      );
    });
  }

  return new Document({
    sections: [{ children: sections }],
  });
}

function generateInvoiceDocx(content: any): Document {
  const sections = [];

  // Header
  sections.push(
    new Paragraph({
      text: 'INVOICE',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Invoice details
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Invoice Number: ', bold: true }),
        new TextRun(content.header.invoiceNumber),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Date: ', bold: true }),
        new TextRun(content.header.invoiceDate),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Due Date: ', bold: true }),
        new TextRun(content.header.dueDate),
      ],
      spacing: { after: 300 },
    })
  );

  // Client info
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'Bill To:', bold: true })],
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph(content.client.name),
    new Paragraph({
      text: content.client.address,
      spacing: { after: 300 },
    })
  );

  // Items table
  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Description', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Quantity', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Rate', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Amount', bold: true })] })] }),
      ],
    }),
  ];

  content.items.forEach((item: any) => {
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(item.description)] }),
          new TableCell({ children: [new Paragraph(String(item.quantity))] }),
          new TableCell({ children: [new Paragraph(`$${item.rate.toFixed(2)}`)] }),
          new TableCell({ children: [new Paragraph(`$${item.amount.toFixed(2)}`)] }),
        ],
      })
    );
  });

  sections.push(
    new Table({
      rows: tableRows,
      width: { size: 100, type: 'pct' },
    })
  );

  // Totals
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Subtotal: ', bold: true }),
        new TextRun(`$${content.subtotal.toFixed(2)}`),
      ],
      alignment: AlignmentType.RIGHT,
      spacing: { before: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Tax: ', bold: true }),
        new TextRun(`$${content.tax.toFixed(2)}`),
      ],
      alignment: AlignmentType.RIGHT,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'TOTAL: ', bold: true, size: 28 }),
        new TextRun({ text: `$${content.total.toFixed(2)}`, bold: true, size: 28 }),
      ],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 300 },
    })
  );

  // Notes
  if (content.notes) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Notes:', bold: true })],
        spacing: { before: 300, after: 100 },
      }),
      new Paragraph(content.notes)
    );
  }

  return new Document({
    sections: [{ children: sections }],
  });
}

function generateReportDocx(content: any): Document {
  const sections = [];

  // Title
  sections.push(
    new Paragraph({
      text: content.title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Metadata
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Date: ', bold: true }),
        new TextRun(content.date),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Department: ', bold: true }),
        new TextRun(content.department),
      ],
      spacing: { after: 400 },
    })
  );

  // Executive Summary
  sections.push(
    new Paragraph({
      text: 'Executive Summary',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
    }),
    new Paragraph({
      text: content.executiveSummary,
      spacing: { after: 300 },
    })
  );

  // Sections
  content.sections.forEach((section: any) => {
    sections.push(
      new Paragraph({
        text: section.heading,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: section.content,
        spacing: { after: 300 },
      })
    );
  });

  // Findings
  sections.push(
    new Paragraph({
      text: 'Key Findings',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
    })
  );
  content.findings.forEach((finding: string) => {
    sections.push(
      new Paragraph({
        text: `• ${finding}`,
        spacing: { after: 100 },
      })
    );
  });

  // Recommendations
  sections.push(
    new Paragraph({
      text: 'Recommendations',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
    })
  );
  content.recommendations.forEach((rec: string) => {
    sections.push(
      new Paragraph({
        text: `• ${rec}`,
        spacing: { after: 100 },
      })
    );
  });

  // Conclusion
  sections.push(
    new Paragraph({
      text: 'Conclusion',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
    }),
    new Paragraph(content.conclusion)
  );

  return new Document({
    sections: [{ children: sections }],
  });
}

function generateMemoDocx(content: any): Document {
  const sections = [];

  // Header
  sections.push(
    new Paragraph({
      text: 'MEMORANDUM',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Memo header fields
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'TO: ', bold: true }),
        new TextRun(content.header.to),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'FROM: ', bold: true }),
        new TextRun(content.header.from),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'DATE: ', bold: true }),
        new TextRun(content.header.date),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'SUBJECT: ', bold: true }),
        new TextRun(content.header.subject),
      ],
      spacing: { after: 400 },
    })
  );

  // Body
  sections.push(new Paragraph(content.body.opening));
  
  content.body.mainContent.forEach((paragraph: string) => {
    sections.push(
      new Paragraph({
        text: paragraph,
        spacing: { before: 200, after: 200 },
      })
    );
  });

  sections.push(
    new Paragraph({
      text: content.body.closing,
      spacing: { before: 200, after: 300 },
    })
  );

  // Action Items
  if (content.actionItems && content.actionItems.length > 0) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Action Items:', bold: true })],
        spacing: { before: 300, after: 200 },
      })
    );
    content.actionItems.forEach((item: string) => {
      sections.push(
        new Paragraph({
          text: `• ${item}`,
          spacing: { after: 100 },
        })
      );
    });
  }

  return new Document({
    sections: [{ children: sections }],
  });
}

function generateContentDocx(content: any): Document {
  const sections = [];

  // Title
  sections.push(
    new Paragraph({
      text: content.title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Summary
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'Executive Summary', bold: true, size: 28 })],
      spacing: { before: 300, after: 200 },
    }),
    new Paragraph({
      text: content.summary,
      spacing: { after: 400 },
    })
  );

  // Sections
  content.sections.forEach((section: any) => {
    sections.push(
      new Paragraph({
        text: section.subheading,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );
    section.paragraphs.forEach((para: string) => {
      sections.push(
        new Paragraph({
          text: para,
          spacing: { after: 200 },
        })
      );
    });
  });

  // Call to Action
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'Conclusion & Next Steps', bold: true, size: 28 })],
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      text: content.callToActionButton || content.callToAction,
      spacing: { after: 400 },
    })
  );

  return new Document({
    sections: [{ children: sections }],
  });
}

function generatePresentationDocx(content: any): Document {
  const sections = [];

  // Presentation Title Slide
  sections.push(
    new Paragraph({
      text: content.presentationTitle,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 2000, after: 400 },
    }),
    new Paragraph({
      text: 'A DocuAI Presentation',
      alignment: AlignmentType.CENTER,
    })
  );

  // Slides
  content.slides.forEach((slide: any) => {
    // Page Break before each slide (except the first one which is already at the start)
    sections.push(new Paragraph({ text: '', spacing: { before: 200 }, pageBreakBefore: true }));

    sections.push(
      new Paragraph({
        text: slide.title,
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.LEFT,
        spacing: { before: 400, after: 400 },
      })
    );

    slide.content.forEach((point: string) => {
      sections.push(
        new Paragraph({
          text: `• ${point}`,
          spacing: { after: 200 },
        })
      );
    });

    // Image Keyword reference
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: `[Visual Recommendation: ${slide.imageKeyword}]`, color: '888888', italics: true }),
        ],
        spacing: { before: 800 },
      })
    );
  });

  return new Document({
    sections: [{ children: sections }],
  });
}

function generateProposalDocx(content: any): Document {
  const sections = [];

  sections.push(
    new Paragraph({
      text: 'PROJECT PROPOSAL',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: content.title,
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Client: ', bold: true }), new TextRun(content.client)],
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Budget: ', bold: true }), new TextRun(content.budget.total)],
      spacing: { after: 400 },
    })
  );

  sections.push(
    new Paragraph({ text: 'Executive Summary', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
    new Paragraph({ text: content.executiveSummary, spacing: { after: 200 } })
  );

  sections.push(new Paragraph({ text: 'Primary Goals', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
  content.goals.forEach((goal: string) => {
    sections.push(new Paragraph({ text: goal, bullet: { level: 0 } }));
  });

  sections.push(new Paragraph({ text: 'Scope & Deliverables', heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }));
  content.scope.forEach((item: any) => {
    sections.push(
      new Paragraph({ children: [new TextRun({ text: item.deliverable, bold: true })] }),
      new Paragraph({ text: item.description, spacing: { after: 150 } })
    );
  });

  sections.push(new Paragraph({ text: 'Timeline', heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }));
  const rows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Phase', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Duration', bold: true })] })] }),
      ],
    }),
  ];
  content.timeline.forEach((item: any) => {
    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(item.phase)] }),
          new TableCell({ children: [new Paragraph(item.duration)] }),
        ],
      })
    );
  });
  sections.push(new Table({ rows, width: { size: 100, type: 'pct' } }));

  sections.push(
    new Paragraph({ text: 'Next Steps', heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 100 } }),
    new Paragraph({ text: content.callToAction, spacing: { after: 400 } })
  );

  return new Document({
    sections: [{ children: sections }],
  });
}

function generatePRDDocx(content: any): Document {
  const sections = [];

  sections.push(
    new Paragraph({
      text: `${content.productName.toUpperCase()} - PRD`,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 400 },
    }),
    new Paragraph({ text: 'Objectives', heading: HeadingLevel.HEADING_2 }),
    ...content.objectives.map((o: string) => new Paragraph({ text: o, bullet: { level: 0 } })),
    new Paragraph({ text: '', spacing: { after: 200 } })
  );

  sections.push(new Paragraph({ text: 'User Stories', heading: HeadingLevel.HEADING_2 }));
  content.userStories.forEach((s: any) => {
    sections.push(
      new Paragraph({
        text: `As a ${s.user}, I need ${s.need} so that ${s.value}.`,
        spacing: { before: 100, after: 100 },
      })
    );
  });

  sections.push(new Paragraph({ text: 'Functional Requirements', heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }));
  const rows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Feature', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Priority', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Description', bold: true })] })] }),
      ],
    }),
  ];
  content.functionalRequirements.forEach((r: any) => {
    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(r.feature)] }),
          new TableCell({ children: [new TableCell({ children: [new Paragraph(r.priority)] }) as any] }), // Fix for nested cell if needed, but docs says Paragraph
          new TableCell({ children: [new Paragraph(r.description)] }),
        ],
      } as any)
    );
  });
  // Actually docx TableCell children is Paragraph[] or Table[]
  const fixedRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Feature', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Priority', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Description', bold: true })] })] }),
      ],
    }),
  ];
  content.functionalRequirements.forEach((r: any) => {
    fixedRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(r.feature)] }),
          new TableCell({ children: [new Paragraph(r.priority)] }),
          new TableCell({ children: [new Paragraph(r.description)] }),
        ],
      })
    );
  });
  sections.push(new Table({ rows: fixedRows, width: { size: 100, type: 'pct' } }));

  sections.push(
    new Paragraph({ text: 'Success Metrics', heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }),
    ...content.successMetrics.map((m: string) => new Paragraph({ text: m, bullet: { level: 0 } }))
  );

  return new Document({
    sections: [{ children: sections }],
  });
}

function generatePressReleaseDocx(content: any): Document {
  const sections = [];

  sections.push(
    new Paragraph({ text: 'FOR IMMEDIATE RELEASE', alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
    new Paragraph({ text: content.headline, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
    new Paragraph({
      children: [new TextRun({ text: content.subheadline, italics: true })],
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${content.locationDate} — `, bold: true }),
        new TextRun(content.lead),
      ],
      spacing: { after: 200 },
    })
  );

  content.body.forEach((p: string) => {
    sections.push(new Paragraph({ text: p, spacing: { after: 200 } }));
  });

  content.quotes.forEach((q: any) => {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: `"${q.text}"`, italics: true })],
        spacing: { before: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `— ${q.speaker}`, bold: true })],
        spacing: { after: 300 },
      })
    );
  });

  sections.push(
    new Paragraph({ text: '', spacing: { before: 400 } }),
    new Paragraph({ children: [new TextRun({ text: 'About the Company', bold: true })], spacing: { after: 100 } }),
    new Paragraph({ text: content.boilerplate, spacing: { after: 300 } }),
    new Paragraph({ children: [new TextRun({ text: 'Media Contact:', bold: true })] }),
    new Paragraph({ text: content.contact }),
    new Paragraph({ text: '###', alignment: AlignmentType.CENTER, spacing: { before: 600 } })
  );

  return new Document({
    sections: [{ children: sections }],
  });
}

function generateCaseStudyDocx(content: any): Document {
  const sections = [];

  sections.push(
    new Paragraph({ text: 'CASE STUDY', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
    new Paragraph({ text: content.projectTitle, heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
    new Paragraph({ children: [new TextRun({ text: `Client: `, bold: true }), new TextRun(content.client)], alignment: AlignmentType.RIGHT, spacing: { after: 600 } })
  );

  sections.push(
    new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Sector', bold: true })] }), new Paragraph(content.atAGlance.sector)] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Challenge', bold: true })] }), new Paragraph(content.atAGlance.challenge)] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Result', bold: true })] }), new Paragraph(content.atAGlance.result)] }),
          ],
        }),
      ],
      width: { size: 100, type: 'pct' },
    }),
    new Paragraph({ text: '', spacing: { after: 400 } })
  );

  sections.push(
    new Paragraph({ text: 'The Challenge', heading: HeadingLevel.HEADING_3 }),
    new Paragraph({ text: content.theChallenge, spacing: { after: 200 } }),
    new Paragraph({ text: 'The Solution', heading: HeadingLevel.HEADING_3 }),
    new Paragraph({ text: content.theSolution, spacing: { after: 200 } }),
    new Paragraph({ text: 'Impact & Results', heading: HeadingLevel.HEADING_3 })
  );

  content.theResults.forEach((r: string) => {
    sections.push(new Paragraph({ text: r, bullet: { level: 0 } }));
  });

  sections.push(
    new Paragraph({ text: '', spacing: { before: 400 } }),
    new Paragraph({
      children: [new TextRun({ text: `"${content.clientQuote.text}"`, italics: true })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: `— ${content.clientQuote.speaker}`, bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  return new Document({
    sections: [{ children: sections }],
  });
}
