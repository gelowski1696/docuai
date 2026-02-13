import puppeteer from 'puppeteer';
import type { ResolvedDesign } from '@/lib/generators/design/resolve-design';

/**
 * Generate PDF document from AI-generated content using Puppeteer
 * 
 * Renders HTML templates and converts to PDF
 */

export async function generatePdf(
  content: any,
  templateType: string,
  design?: ResolvedDesign
): Promise<Buffer> {
  const normalizedType = templateType.toUpperCase();
  const resolvedContent =
    normalizedType === 'PRESENTATION'
      ? await enrichPresentationImages(content)
      : content;
  const html = generateHtml(resolvedContent, templateType, design);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Extra wait for images to ensure they are rendered correctly
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
      printBackground: true,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

async function enrichPresentationImages(content: any): Promise<any> {
  const slides = Array.isArray(content?.slides) ? content.slides : [];
  if (slides.length === 0) return content;

  const presentationTitle = String(content?.presentationTitle || '');
  const enrichedSlides = await Promise.all(
    slides.map(async (slide: any) => {
      const imageUrl = await findBestSlideImageUrl(presentationTitle, slide);
      return { ...slide, imageUrl };
    })
  );

  return { ...content, slides: enrichedSlides };
}

async function findBestSlideImageUrl(presentationTitle: string, slide: any): Promise<string | null> {
  const queries = [
    `${slide?.imageKeyword || ''} ${slide?.title || ''} ${presentationTitle} philippines`,
    `${slide?.title || ''} ${presentationTitle} philippines`,
    `${slide?.imageKeyword || ''} ${presentationTitle} philippines`,
  ]
    .map((q) => q.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  for (const query of queries) {
    const url = await searchWikimediaCommonsImage(query);
    if (url) return url;
  }

  return null;
}

async function searchWikimediaCommonsImage(query: string): Promise<string | null> {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      query
    )}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|mime&iiurlwidth=1200&format=json&origin=*`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'DocuAI/1.0 (presentation-image-resolver)',
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const data = await res.json();
    const pages = data?.query?.pages ? Object.values(data.query.pages as Record<string, any>) : [];

    for (const page of pages) {
      const info = Array.isArray(page?.imageinfo) ? page.imageinfo[0] : null;
      const mime = String(info?.mime || '');
      if (!mime.startsWith('image/')) continue;
      if (mime === 'image/svg+xml') continue;
      const candidate = info?.thumburl || info?.url;
      if (candidate) return candidate;
    }
  } catch {
    return null;
  }

  return null;
}

function sanitizeCssValue(value: string | undefined, fallback: string): string {
  return String(value || fallback).trim().replace(/[;<>{}`"]/g, '');
}

function generateHtml(content: any, templateType: string, design?: ResolvedDesign): string {
  const primaryColor = sanitizeCssValue(design?.primaryColor, '#2563eb');
  const secondaryColor = sanitizeCssValue(design?.bodyColor || design?.secondaryColor, '#4b5563');
  const accentColor = sanitizeCssValue(design?.secondaryColor || design?.primaryColor, '#1e40af');
  const textMain = sanitizeCssValue(design?.headingColor, '#1e293b');
  const textMuted = sanitizeCssValue(design?.bodyColor, '#64748b');
  const headingFont = sanitizeCssValue(design?.fontHeading, 'Inter');
  const bodyFont = sanitizeCssValue(design?.fontBody, 'Roboto');

  const baseStyles = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
    <style>
      :root {
        --primary: ${primaryColor};
        --secondary: ${secondaryColor};
        --accent: ${accentColor};
        --bg-alt: #f8fafc;
        --border: #e2e8f0;
        --text-main: ${textMain};
        --text-muted: ${textMuted};
      }
      
      body {
        font-family: '${bodyFont}', sans-serif;
        line-height: 1.6;
        color: var(--text-main);
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
        -webkit-print-color-adjust: exact;
      }
      
      h1, h2, h3, .heading-font {
        font-family: '${headingFont}', sans-serif;
        font-weight: 700;
        letter-spacing: -0.02em;
      }
      
      h1 {
        font-size: 2.5rem;
        color: var(--primary);
        margin-bottom: 2rem;
        border-bottom: 2px solid var(--primary);
        padding-bottom: 0.5rem;
        font-weight: 900;
      }
      
      h2 {
        font-size: 1.5rem;
        color: var(--accent);
        margin-top: 2rem;
        margin-bottom: 1rem;
        border-left: 4px solid var(--primary);
        padding-left: 1rem;
      }
      
      .meta-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 2.5rem;
        padding: 1.5rem;
        background: var(--bg-alt);
        border-radius: 12px;
        border: 1px solid var(--border);
      }
      
      .meta-field {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      
      .meta-label {
        color: var(--text-muted);
        font-weight: 700;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.05em;
        width: 120px;
        flex-shrink: 0;
      }
      
      .meta-value {
        font-weight: 500;
        color: var(--text-main);
      }
      
      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        margin: 2rem 0;
        border: 1px solid var(--border);
        border-radius: 12px;
        overflow: hidden;
      }
      
      th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid var(--border);
      }
      
      th {
        background-color: var(--bg-alt);
        font-family: 'Inter', sans-serif;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.05em;
      }
      
      tr:last-child td {
        border-bottom: none;
      }
      
      tr:nth-child(even) td {
        background-color: #fafafa;
      }
      
      .total-section {
        margin-left: auto;
        width: 300px;
        padding: 1.5rem;
        background: var(--bg-alt);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .total-amount {
        font-size: 1.5rem;
        font-weight: 900;
        color: var(--primary);
        font-family: 'Inter', sans-serif;
      }
      
      .slide {
        page-break-after: always;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 60px;
        box-sizing: border-box;
      }
      
      .slide-image-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 2rem 0;
        overflow: hidden;
        border-radius: 16px;
        background: #000;
      }
      
      .slide-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: cover;
        opacity: 0.8;
        filter: grayscale(0.5) contrast(1.1);
        transition: opacity 0.3s ease;
      }
      
      .slide-title {
        font-size: 3rem;
        color: var(--primary);
        margin-bottom: 1rem;
        font-weight: 900;
        text-align: center;
      }
      
      .slide-content {
        font-size: 1.25rem;
        color: var(--secondary);
      }
      
      .bullet-list {
        list-style: none;
        padding: 0;
      }
      
      .bullet-list li {
        position: relative;
        padding-left: 1.5rem;
        margin-bottom: 0.75rem;
      }
      
      .bullet-list li::before {
        content: '→';
        position: absolute;
        left: 0;
        color: var(--primary);
        font-weight: bold;
      }
    </style>
  `;

  switch (templateType.toUpperCase()) {
    case 'INVOICE':
      return generateInvoiceHtml(content, baseStyles);
    case 'REPORT':
      return generateReportHtml(content, baseStyles);
    case 'MEMO':
      return generateMemoHtml(content, baseStyles);
    case 'CONTENT':
      return generateContentHtml(content, baseStyles);
    case 'PRESENTATION':
      return generatePresentationHtml(content, baseStyles);
    case 'RESUME':
      return generateResumeHtml(content, baseStyles);
    case 'LEGAL_CONTRACT':
      return generateContractHtml(content, baseStyles);
    case 'NEWSLETTER':
      return generateNewsletterHtml(content, baseStyles);
    case 'MEETING_MINUTES':
      return generateMinutesHtml(content, baseStyles);
    case 'PROJECT_PROPOSAL':
      return generateProposalHtml(content, baseStyles);
    case 'PRODUCT_SPEC':
      return generatePRDHtml(content, baseStyles);
    case 'PRESS_RELEASE':
      return generatePressReleaseHtml(content, baseStyles);
    case 'CASE_STUDY':
      return generateCaseStudyHtml(content, baseStyles);
    case 'EXPENSE_REPORT':
      return generateExpenseReportHtml(content, baseStyles);
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
      return generateGenericHtml(content, baseStyles, templateType);
    default:
      return generateGenericHtml(content, baseStyles, templateType);
  }
}

function generateExpenseReportHtml(content: any, styles: string): string {
  const items = content.items || content.expenses || [];
  const expenseRows = items
    .map(
      (item: any) => `
      <tr>
        <td>${item.date || ''}</td>
        <td>${item.category || ''}</td>
        <td style="text-align: left;">${item.description || ''}</td>
        <td style="text-align: right; font-weight: 700;">$${(item.amount || 0).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${styles}
      <style>
        table { border-radius: 8px; overflow: hidden; margin-top: 2rem; }
        th { background-color: var(--primary); color: white; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; }
        tr:nth-child(even) td { background-color: var(--bg-alt); }
        td { padding: 12px; border-bottom: 1px solid var(--border); text-align: center; }
        .meta-label { width: 150px; }
        .total-box { 
          margin-top: 2rem; 
          padding: 1.5rem; 
          background: #eff6ff; 
          border-radius: 12px; 
          border: 2px solid #bfdbfe;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      </style>
    </head>
    <body>
      <div style="text-align: center; margin-bottom: 3rem;">
        <h1 style="border: none; padding: 0; margin: 0; color: var(--primary); font-size: 2.5rem; letter-spacing: -0.04em;">EXPENSE REPORT</h1>
        <div style="height: 4px; width: 60px; background: var(--primary); margin: 1rem auto;"></div>
      </div>
      
      <div class="meta-container">
        <div class="meta-field">
          <span class="meta-label">Employee</span>
          <span class="meta-value">${content.employee || content.employeeName || ''}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Period</span>
          <span class="meta-value">${content.period || content.reportPeriod || ''}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Department</span>
          <span class="meta-value">${content.department || ''}</span>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th style="width: 15%;">Date</th>
            <th style="width: 20%;">Category</th>
            <th style="text-align: left;">Description</th>
            <th style="width: 15%; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${expenseRows}
        </tbody>
      </table>
      
      <div class="total-box">
        <span style="font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em;">Total Reimbursement Amount</span>
        <span style="font-size: 1.75rem; font-weight: 900; color: var(--primary);">$${(content.totalAmount || 0).toFixed(2)}</span>
      </div>

      ${content.notes ? `
        <div style="margin-top: 3rem; padding: 1.5rem; background: var(--bg-alt); border-radius: 12px; border-left: 4px solid var(--primary);">
          <h3 style="margin-top: 0; font-size: 0.9rem; text-transform: uppercase; color: var(--text-muted);">Notes</h3>
          <p style="margin: 0; font-style: italic; color: var(--text-main);">${content.notes}</p>
        </div>
      ` : ''}
    </body>
    </html>
  `;
}

function generateGenericHtml(content: any, styles: string, type: string): string {
  function renderContent(val: any, depth = 0): string {
    if (depth > 5) return ''; // Safety limit

    if (Array.isArray(val)) {
      return `
        <ul class="bullet-list">
          ${val.map(item => `<li>${typeof item === 'object' ? renderContent(item, depth + 1) : item}</li>`).join('')}
        </ul>
      `;
    } else if (typeof val === 'object' && val !== null) {
      return Object.entries(val)
        .map(([key, value]) => {
          const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          if (typeof value === 'object') {
            return `
              <div style="margin-top: 1.5rem;">
                <h3 style="font-size: 1.1rem; color: var(--primary);">${displayKey}</h3>
                ${renderContent(value, depth + 1)}
              </div>
            `;
          } else {
            return `
              <div style="margin-bottom: 0.5rem; display: flex; gap: 1rem;">
                <span style="font-weight: 700; min-width: 150px; color: var(--text-muted); text-transform: uppercase; font-size: 0.8rem;">${displayKey}:</span>
                <span>${value}</span>
              </div>
            `;
          }
        })
        .join('');
    } else {
      return `<div>${val}</div>`;
    }
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${styles}
    </head>
    <body>
      <h1 style="text-align: center;">${type.replace(/_/g, ' ')}</h1>
      <div style="background: white; padding: 2rem; border-radius: 16px; border: 1px solid var(--border); margin-top: 2rem;">
        ${renderContent(content)}
      </div>
    </body>
    </html>
  `;
}

// ... existing HTML functions (Invoice, Report, Memo, Content, Presentation) ...

function generateResumeHtml(content: any, styles: string): string {
  const experienceHtml = content.experience
    .map(
      (exp: any) => `
      <div style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.25rem;">
          <h3 style="margin: 0; color: var(--text-main); font-size: 1.2rem;">${exp.role}</h3>
          <span style="color: var(--text-muted); font-size: 0.85rem; font-weight: 500;">${exp.period}</span>
        </div>
        <div style="color: var(--primary); font-weight: 700; font-size: 0.95rem; margin-bottom: 0.75rem;">${exp.company}</div>
        <ul style="margin: 0; padding-left: 1.2rem; color: var(--secondary); font-size: 0.9rem;">
          ${exp.points.map((p: string) => `<li style="margin-bottom: 0.4rem;">${p}</li>`).join('')}
        </ul>
      </div>
    `
    )
    .join('');

  const educationHtml = content.education
    .map(
      (edu: any) => `
      <div style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <h3 style="margin: 0; color: var(--text-main); font-size: 1.1rem;">${edu.degree}</h3>
          <span style="color: var(--text-muted); font-size: 0.85rem;">${edu.period}</span>
        </div>
        <div style="color: var(--secondary); font-size: 0.95rem;">${edu.school}</div>
      </div>
    `
    )
    .join('');

  const techSkillsHtml = content.skills.technical
    .map((s: string) => `<span style="display: inline-block; background: rgba(255,255,255,0.1); padding: 0.2rem 0.6rem; border-radius: 4px; margin: 0 0.4rem 0.4rem 0; font-size: 0.8rem;">${s}</span>`)
    .join('');

  const softSkillsHtml = content.skills.soft
    .map((s: string) => `<li style="margin-bottom: 0.3rem;">${s}</li>`)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${styles}
      <style>
        .resume-container {
          display: flex;
          min-height: 1000px;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.1);
          margin: -40px; /* Offset body padding */
        }
        
        .sidebar {
          width: 32%;
          background: #1e293b;
          color: white;
          padding: 40px 30px;
        }
        
        .main-content {
          width: 68%;
          padding: 50px 40px;
          background: white;
        }
        
        .sidebar h2 {
          color: #60a5fa;
          border-left: none;
          padding-left: 0;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 0.5rem;
        }
        
        .sidebar-item {
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .sidebar-icon {
          color: #60a5fa;
          width: 16px;
        }
        
        .section-title {
          font-family: 'Inter', sans-serif;
          font-weight: 900;
          font-size: 1.4rem;
          color: var(--primary);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .section-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }
      </style>
    </head>
    <body style="padding: 40px; background: #f1f5f9;">
      <div class="resume-container">
        <div class="sidebar">
          <div style="text-align: center; margin-bottom: 3rem;">
            <div style="width: 80px; height: 80px; background: #60a5fa; border-radius: 50%; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 900; color: #1e293b;">
              ${content.personalInfo.fullName.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <h1 style="color: white; border: none; padding: 0; margin: 0; font-size: 1.6rem; line-height: 1.2;">${content.personalInfo.fullName}</h1>
          </div>
          
          <h2>Contact</h2>
          <div class="sidebar-item">
            <span class="sidebar-icon">✉</span>
            <span>${content.personalInfo.contact}</span>
          </div>
          <div class="sidebar-item">
            <span class="sidebar-icon">📍</span>
            <span>${content.personalInfo.location}</span>
          </div>
          
          <h2>Technical Skills</h2>
          <div style="margin-top: 1rem;">
            ${techSkillsHtml}
          </div>
          
          <h2>Soft Skills</h2>
          <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.85rem; color: #cbd5e1;">
            ${softSkillsHtml}
          </ul>
          
          ${content.languages ? `
            <h2>Languages</h2>
            <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.85rem; color: #cbd5e1;">
              ${content.languages.map((l: string) => `<li style="margin-bottom: 0.3rem;">${l}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
        
        <div class="main-content">
          <div class="section-title">PROFESSIONAL SUMMARY</div>
          <p style="color: var(--secondary); font-size: 1rem; line-height: 1.7; margin-bottom: 3rem;">
            ${content.summary}
          </p>
          
          <div class="section-title">WORK EXPERIENCE</div>
          ${experienceHtml}
          
          <div class="section-title">EDUCATION</div>
          ${educationHtml}
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateContractHtml(content: any, styles: string): string {
  const sectionsHtml = content.sections
    .map(
      (section: any) => `
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.25rem;">${section.heading}</h2>
        <p>${section.content}</p>
      </div>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${styles}
    </head>
    <body style="text-align: justify;">
      <h1 style="text-align: center; border-bottom: 4px solid var(--primary); padding-bottom: 1rem;">${content.title}</h1>
      
      <div class="meta-container">
        <div class="meta-field">
          <span class="meta-label">Provider</span>
          <span class="meta-value">${content.parties.provider}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Client</span>
          <span class="meta-value">${content.parties.client}</span>
        </div>
      </div>
      
      <p style="margin-bottom: 3rem;">This Service Agreement is entered into by and between the parties mentioned above.</p>
      
      ${sectionsHtml}
      
      <div style="margin-top: 5rem; display: flex; justify-content: space-between; gap: 4rem;">
        <div style="flex: 1; border-top: 1px solid black; padding-top: 1rem;">
          <p style="font-weight: 700; margin-bottom: 2rem;">For ${content.parties.provider}:</p>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Signature & Date</p>
        </div>
        <div style="flex: 1; border-top: 1px solid black; padding-top: 1rem;">
          <p style="font-weight: 700; margin-bottom: 2rem;">For ${content.parties.client}:</p>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Signature & Date</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateNewsletterHtml(content: any, styles: string): string {
  const articlesHtml = content.articles
    .map(
      (article: any) => `
      <div style="margin-bottom: 3rem; background: var(--bg-alt); padding: 2rem; border-radius: 16px;">
        <h2 style="margin-top: 0; color: var(--primary); border: none; padding: 0;">${article.headline}</h2>
        <div style="column-count: 2; column-gap: 2rem; text-align: justify;">${article.body}</div>
      </div>
    `
    )
    .join('');

  const eventsHtml = content.upcomingEvents
    .map((event: string) => `<li>${event}</li>`)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${styles}
    </head>
    <body>
      <div style="text-align: center; background: var(--primary); color: white; padding: 3rem; border-radius: 24px; margin-bottom: 3rem;">
        <h1 style="color: white; border: none; margin: 0; font-size: 3.5rem;">${content.title}</h1>
        <p style="font-size: 1.25rem; font-weight: 700; opacity: 0.8;">${content.edition}</p>
      </div>
      
      ${articlesHtml}
      
      <div style="border-top: 4px solid var(--primary); padding-top: 2rem;">
        <h2 style="border: none; padding: 0;">Upcoming Events</h2>
        <ul class="bullet-list">${eventsHtml}</ul>
      </div>
    </body>
    </html>
  `;
}

function generateMinutesHtml(content: any, styles: string): string {
  const discussionsHtml = content.discussions
    .map(
      (d: any) => `
      <div style="margin-bottom: 1.5rem;">
        <div style="font-weight: 700; color: var(--accent);">${d.topic}</div>
        <p style="margin: 0.25rem 0;">${d.summary}</p>
      </div>
    `
    )
    .join('');

  const actionsHtml = content.actionItems
    .map(
      (a: any) => `
      <div style="display: flex; gap: 1rem; margin-bottom: 0.5rem; background: #fff; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border);">
        <div style="font-weight: 700; color: var(--primary); min-width: 100px;">${a.assignee}</div>
        <div>${a.item}</div>
      </div>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${styles}
    </head>
    <body>
      <h1 style="text-align: center;">${content.title}</h1>
      <p style="text-align: center; font-weight: 700; color: var(--text-muted);">${content.dateTime}</p>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 3rem 0;">
        <div style="background: var(--bg-alt); padding: 1.5rem; border-radius: 12px;">
          <h3 style="margin-top: 0;">Attendees</h3>
          <ul style="margin: 0; padding-left: 1.25rem;">${content.attendees.map((at: string) => `<li>${at}</li>`).join('')}</ul>
        </div>
        <div style="background: var(--bg-alt); padding: 1.5rem; border-radius: 12px;">
          <h3 style="margin-top: 0;">Agenda</h3>
          <ul style="margin: 0; padding-left: 1.25rem;">${content.agenda.map((ag: string) => `<li>${ag}</li>`).join('')}</ul>
        </div>
      </div>
      
      <h2>Discussion Points</h2>
      ${discussionsHtml}
      
      <h2 style="margin-top: 4rem;">Action Items</h2>
      <div style="background: var(--bg-alt); padding: 1.5rem; border-radius: 12px;">
        ${actionsHtml}
      </div>
    </body>
    </html>
  `;
}

function generateInvoiceHtml(content: any, styles: string): string {
  const itemsRows = content.items
    .map(
      (item: any) => `
      <tr>
        <td>${item.description}</td>
        <td>${item.quantity}</td>
        <td>$${item.rate.toFixed(2)}</td>
        <td>$${item.amount.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${styles}
    </head>
    <body>
      <h1>INVOICE</h1>
      
      <div class="meta-container">
        <div class="meta-field">
          <span class="meta-label">Invoice No</span>
          <span class="meta-value">${content.header.invoiceNumber}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Date</span>
          <span class="meta-value">${content.header.invoiceDate}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Due Date</span>
          <span class="meta-value">${content.header.dueDate}</span>
        </div>
      </div>
      
      <h2>Bill To</h2>
      <div style="margin-bottom: 2rem; padding-left: 1.25rem; border-left: 2px solid var(--border);">
        <div style="font-weight: 700; font-size: 1.1rem;">${content.client.name}</div>
        <div style="color: var(--text-muted);">${content.client.address}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
      
      <div class="total-section">
        <div class="total-row" style="color: var(--text-muted); font-size: 0.9rem;">
          <span>Subtotal</span>
          <span>$${content.subtotal.toFixed(2)}</span>
        </div>
        <div class="total-row" style="color: var(--text-muted); font-size: 0.9rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
          <span>Tax (10%)</span>
          <span>$${content.tax.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span style="font-weight: 700;">Total</span>
          <span class="total-amount">$${content.total.toFixed(2)}</span>
        </div>
      </div>
      
      ${content.notes ? `
        <div style="margin-top: 4rem;">
          <h2 style="font-size: 1rem; color: var(--text-muted); border: none; padding: 0; text-transform: uppercase; letter-spacing: 0.1em;">Notes</h2>
          <p style="font-size: 0.9rem; font-style: italic;">${content.notes}</p>
        </div>
      ` : ''}
    </body>
    </html>
  `;
}

function generateReportHtml(content: any, styles: string): string {
  const sectionsHtml = content.sections
    .map(
      (section: any) => `
      <h2>${section.heading}</h2>
      <p>${section.content}</p>
    `
    )
    .join('');

  const findingsHtml = content.findings
    .map((finding: string) => `<li>${finding}</li>`)
    .join('');

  const recommendationsHtml = content.recommendations
    .map((rec: string) => `<li>${rec}</li>`)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${styles}
    </head>
    <body>
      <h1>${content.title}</h1>
      
      <div class="meta-container">
        <div class="meta-field">
          <span class="meta-label">Date</span>
          <span class="meta-value">${content.date}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Department</span>
          <span class="meta-value">${content.department}</span>
        </div>
      </div>
      
      <h2>Executive Summary</h2>
      <p style="font-size: 1.1rem; color: var(--secondary); font-style: italic;">${content.executiveSummary}</p>
      
      ${sectionsHtml}
      
      <h2>Key Findings</h2>
      <ul class="bullet-list">${findingsHtml}</ul>
      
      <h2>Recommendations</h2>
      <ul class="bullet-list">${recommendationsHtml}</ul>
      
      <h2>Conclusion</h2>
      <div style="background: var(--bg-alt); padding: 1.5rem; border-radius: 12px; margin-top: 1rem;">
        <p style="margin: 0;">${content.conclusion}</p>
      </div>
    </body>
    </html>
  `;
}

function generateMemoHtml(content: any, styles: string): string {
  const mainContentHtml = content.body.mainContent
    .map((paragraph: string) => `<p>${paragraph}</p>`)
    .join('');

  const actionItemsHtml = content.actionItems
    .map((item: string) => `<li>${item}</li>`)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${styles}
    </head>
    <body>
      <h1>MEMORANDUM</h1>
      
      <div class="meta-container" style="border-left: 4px solid var(--primary);">
        <div class="meta-field">
          <span class="meta-label">To</span>
          <span class="meta-value">${content.header.to}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">From</span>
          <span class="meta-value">${content.header.from}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Date</span>
          <span class="meta-value">${content.header.date}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Subject</span>
          <span class="meta-value" style="font-weight: 700;">${content.header.subject}</span>
        </div>
      </div>
      
      <p style="font-weight: 500; margin-bottom: 2rem;">${content.body.opening}</p>
      ${mainContentHtml}
      <p style="margin-top: 2rem; border-top: 1px solid var(--border); padding-top: 1rem; color: var(--text-muted);">${content.body.closing}</p>
      
      ${actionItemsHtml ? `
        <div style="background: #eff6ff; padding: 1.5rem; border-radius: 12px; margin-top: 2rem;">
          <h2 style="margin-top: 0; font-size: 1rem; border: none; padding: 0;">Action Items</h2>
          <ul class="bullet-list" style="margin: 0;">${actionItemsHtml}</ul>
        </div>
      ` : ''}
    </body>
    </html>
  `;
}

function generateContentHtml(content: any, styles: string): string {
  const sectionsHtml = content.sections
    .map(
      (section: any) => `
      <h2>${section.subheading}</h2>
      ${section.paragraphs.map((p: string) => `<p>${p}</p>`).join('')}
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${styles}
    </head>
    <body>
      <div style="text-align: center; margin-bottom: 4rem;">
        <h1 style="border: none; padding: 0; margin-bottom: 1rem;">${content.title}</h1>
        <div style="color: var(--text-muted); font-weight: 500;">By ${content.author}</div>
      </div>
      
      <div style="background: var(--bg-alt); padding: 2.5rem; border-radius: 20px; border-left: 6px solid var(--primary); margin-bottom: 3rem;">
        <p style="font-size: 1.25rem; line-height: 1.5; color: var(--text-main); margin: 0; font-family: 'Inter', sans-serif; font-weight: 500;">
          ${content.summary}
        </p>
      </div>
      
      ${sectionsHtml}
      
      <div style="margin-top: 4rem; padding: 2rem; background: #1e293b; color: white; border-radius: 16px;">
        <h2 style="color: #60a5fa; border: none; padding: 0; margin-top: 0;">Conclusion & Next Steps</h2>
        <p style="font-size: 1.1rem; color: #cbd5e1;">${content.callToAction}</p>
      </div>
      
      <div style="margin-top: 3rem; display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
        <span style="font-weight: 700; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Tags:</span>
        ${content.keywords.map((kw: string) => `
          <span style="background: var(--bg-alt); padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.8rem; border: 1px solid var(--border); color: var(--text-muted);">
            #${kw}
          </span>
        `).join('')}
      </div>
    </body>
    </html>
  `;
}

function generatePresentationHtml(content: any, styles: string): string {
  const slides = Array.isArray(content?.slides) ? content.slides : [];
  const slidesHtml = slides
    .map(
      (slide: any) => {
        const imageBlock = slide?.imageUrl
          ? `<img
              class="slide-image"
              src="${slide.imageUrl}"
              alt="${slide.imageKeyword || slide.title || 'presentation visual'}"
              loading="eager"
              onerror="this.replaceWith((() => { const el = document.createElement('div'); el.style.cssText='display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#94a3b8;font-weight:700;letter-spacing:.04em;text-transform:uppercase;background:#0f172a;'; el.textContent='Add your image here'; return el; })())"
            >`
          : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#94a3b8;font-weight:700;letter-spacing:.04em;text-transform:uppercase;background:#0f172a;">Add your image here</div>`;
        return `
      <div class="slide">
        <h1 class="slide-title">${slide.title}</h1>
        <div class="slide-image-container">
          ${imageBlock}
        </div>
        <div class="slide-content">
          <ul class="bullet-list">
            ${(Array.isArray(slide.content) ? slide.content : []).map((p: string) => `<li>${p}</li>`).join('')}
          </ul>
        </div>
        <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; color: var(--text-muted); font-size: 0.8rem; font-weight: 700;">
          <span>${content.presentationTitle}</span>
          <span style="background: var(--bg-alt); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 6px;">${slide.slideNumber}</span>
        </div>
      </div>
    `;
      }
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${content.presentationTitle}</title>
      ${styles}
    </head>
    <body style="padding: 0; margin: 0; max-width: none;">
      ${slidesHtml}
    </body>
    </html>
  `;
}

function generateProposalHtml(content: any, styles: string): string {
  const scopeHtml = content.scope
    .map(
      (item: any) => `
      <div style="margin-bottom: 1.5rem;">
        <div style="font-weight: 700; color: var(--accent);">${item.deliverable}</div>
        <p style="margin: 0.25rem 0;">${item.description}</p>
      </div>
    `
    )
    .join('');

  const timelineHtml = content.timeline
    .map(
      (item: any) => `
      <tr>
        <td style="font-weight: 700;">${item.phase}</td>
        <td>${item.duration}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${styles}
    </head>
    <body>
      <h1 style="text-align: center;">PROJECT PROPOSAL</h1>
      
      <div class="meta-container">
        <div class="meta-field">
          <span class="meta-label">Title</span>
          <span class="meta-value">${content.title}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Client</span>
          <span class="meta-value">${content.client}</span>
        </div>
        <div class="meta-field">
          <span class="meta-label">Estimated Budget</span>
          <span class="meta-value" style="color: var(--primary); font-weight: 900;">${content.budget.total}</span>
        </div>
      </div>
      
      <h2>Executive Summary</h2>
      <p>${content.executiveSummary}</p>
      
      <h2>Primary Goals</h2>
      <ul class="bullet-list">${content.goals.map((g: string) => `<li>${g}</li>`).join('')}</ul>
      
      <h2>Scope & Deliverables</h2>
      ${scopeHtml}
      
      <h2>Project Timeline</h2>
      <table>
        <thead>
          <tr>
            <th>Phase</th>
            <th>Expected Duration</th>
          </tr>
        </thead>
        <tbody>
          ${timelineHtml}
        </tbody>
      </table>
      
      <div style="margin-top: 4rem; text-align: center; background: var(--bg-alt); padding: 2rem; border-radius: 12px; border: 2px dashed var(--primary);">
        <h3 style="margin-top: 0; color: var(--primary);">Next Steps</h3>
        <p>${content.callToAction}</p>
      </div>
    </body>
    </html>
  `;
}

function generatePRDHtml(content: any, styles: string): string {
  const storiesHtml = content.userStories
    .map(
      (story: any) => `
      <div style="margin-bottom: 1rem; padding: 1rem; background: var(--bg-alt); border-radius: 8px;">
        <span style="font-weight: 700; color: var(--primary);">As a ${story.user}</span>, I need <span style="font-weight: 700;">${story.need}</span> so that <span style="font-style: italic;">${story.value}</span>.
      </div>
    `
    )
    .join('');

  const reqRows = content.functionalRequirements
    .map(
      (req: any) => `
      <tr>
        <td style="font-weight: 700;">${req.feature}</td>
        <td>
          <span style="display: inline-block; padding: 0.25rem 0.5rem; border-radius: 40px; font-size: 0.7rem; font-weight: 900; background: ${
            req.priority === 'High' ? '#fee2e2; color: #991b1b;' : req.priority === 'Medium' ? '#fef3c7; color: #92400e;' : '#f0f9ff; color: #075985;'
          }">
            ${req.priority}
          </span>
        </td>
        <td>${req.description}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${styles}
    </head>
    <body>
      <h1 style="color: #0f172a; border-bottom: 8px solid var(--primary);">${content.productName} - PRD</h1>
      
      <h2>Objectives</h2>
      <ul class="bullet-list">${content.objectives.map((o: string) => `<li>${o}</li>`).join('')}</ul>
      
      <h2>Target Audience</h2>
      <p style="font-size: 1.1rem; color: var(--secondary);">${content.targetAudience}</p>
      
      <h2>User Stories</h2>
      ${storiesHtml}
      
      <h2>Functional Requirements</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Feature</th>
            <th style="width: 15%;">Priority</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${reqRows}
        </tbody>
      </table>
      
      <h2>Success Metrics (KPIs)</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
        ${content.successMetrics.map((m: string) => `
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 1rem; border-radius: 8px; color: #166534; font-weight: 700; text-align: center;">
            ${m}
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `;
}

function generatePressReleaseHtml(content: any, styles: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${styles}
      <style>
        .pr-header { text-align: center; margin-bottom: 3rem; }
        .pr-headline { font-size: 2.2rem; font-weight: 900; line-height: 1.1; margin-bottom: 0.5rem; color: #000; }
        .pr-subheadline { font-size: 1.25rem; color: var(--secondary); font-style: italic; margin-bottom: 2rem; }
        .dateline { font-weight: 900; text-transform: uppercase; margin-right: 0.5rem; }
      </style>
    </head>
    <body>
      <div class="pr-header">
        <div style="font-weight: 900; letter-spacing: 0.3em; color: var(--text-muted); margin-bottom: 1rem;">FOR IMMEDIATE RELEASE</div>
        <h1 class="pr-headline">${content.headline}</h1>
        <div class="pr-subheadline">${content.subheadline}</div>
      </div>
      
      <p>
        <span class="dateline">${content.locationDate} —</span>
        ${content.lead}
      </p>
      
      ${content.body.map((p: string) => `<p>${p}</p>`).join('')}
      
      ${content.quotes.map((q: any) => `
        <blockquote style="margin: 2rem 0; padding: 1.5rem; background: var(--bg-alt); border-left: 4px solid var(--primary); font-size: 1.1rem; font-style: italic;">
          "${q.text}"
          <cite style="display: block; margin-top: 1rem; font-weight: 700; font-style: normal; color: var(--primary);">— ${q.speaker}</cite>
        </blockquote>
      `).join('')}
      
      <hr style="margin: 4rem 0; border: none; border-top: 1px solid var(--border);">
      
      <div style="background: var(--bg-alt); padding: 1.5rem; border-radius: 12px; font-size: 0.9rem;">
        <h3 style="margin-top: 0;">About the Company</h3>
        <p>${content.boilerplate}</p>
        
        <div style="margin-top: 2rem;">
          <h3 style="margin-top: 0; font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted);">Media Contact</h3>
          <p style="font-weight: 700; margin: 0;">${content.contact}</p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 3rem; font-weight: 900; letter-spacing: 0.5em;">###</div>
    </body>
    </html>
  `;
}

function generateCaseStudyHtml(content: any, styles: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${styles}
    </head>
    <body>
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4rem; border-bottom: 4px solid var(--primary); padding-bottom: 1rem;">
        <div style="flex: 1;">
          <div style="font-weight: 900; color: var(--primary); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem;">Case Study</div>
          <h1 style="border: none; padding: 0; margin: 0; line-height: 1;">${content.projectTitle}</h1>
        </div>
        <div style="text-align: right; color: var(--text-muted); font-weight: 700;">Client: ${content.client}</div>
      </div>
      
      <div style="background: #1e293b; color: white; padding: 2rem; border-radius: 16px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-bottom: 4rem; text-align: center;">
        <div>
          <div style="color: #60a5fa; font-size: 0.8rem; text-transform: uppercase; font-weight: 900; margin-bottom: 0.5rem;">Sector</div>
          <div style="font-size: 1.1rem; font-weight: 700;">${content.atAGlance.sector}</div>
        </div>
        <div>
          <div style="color: #60a5fa; font-size: 0.8rem; text-transform: uppercase; font-weight: 900; margin-bottom: 0.5rem;">Core Challenge</div>
          <div style="font-size: 1.1rem; font-weight: 700;">${content.atAGlance.challenge}</div>
        </div>
        <div>
          <div style="color: #60a5fa; font-size: 0.8rem; text-transform: uppercase; font-weight: 900; margin-bottom: 0.5rem;">Key Result</div>
          <div style="font-size: 1.1rem; font-weight: 700;">${content.atAGlance.result}</div>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin-bottom: 4rem;">
        <div>
          <h2>The Challenge</h2>
          <p>${content.theChallenge}</p>
        </div>
        <div>
          <h2>The Solution</h2>
          <p>${content.theSolution}</p>
        </div>
      </div>
      
      <div style="background: var(--bg-alt); padding: 3rem; border-radius: 24px; border: 1px solid var(--border);">
        <h2 style="text-align: center; margin-top: 0; border: none; padding: 0; margin-bottom: 2rem;">Impact & Results</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          ${content.theResults.map((r: string) => `
            <div style="display: flex; align-items: flex-start; gap: 1rem;">
              <div style="width: 24px; height: 24px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; font-size: 0.8rem;">✓</div>
              <div style="font-weight: 500;">${r}</div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <blockquote style="margin-top: 4rem; padding: 2rem; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); text-align: center;">
        <div style="font-size: 1.5rem; font-family: 'Inter', sans-serif; font-style: italic; margin-bottom: 1.5rem; color: var(--text-main);">
          "${content.clientQuote.text}"
        </div>
        <cite style="font-weight: 900; color: var(--primary); font-style: normal; text-transform: uppercase; font-size: 0.9rem;">
          — ${content.clientQuote.speaker}
        </cite>
      </blockquote>
    </body>
    </html>
  `;
}

