import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Admin User
  const adminEmail = 'admin@docuai.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      subscriptionTier: 'PRO',
      billingCycle: 'MONTHLY',
      lastReset: new Date(),
    },
  });

  console.log(`✅ Admin user created: ${admin.email}`);

  // 2. Initial Templates
  const templates = [
    {
      id: 'template-invoice-1',
      name: 'Professional Invoice',
      type: 'INVOICE',
      structure: JSON.stringify({
        fields: [
          { name: 'clientName', label: 'Client Name', type: 'text', required: true, placeholder: 'e.g., Acme Corporation' },
          { name: 'clientAddress', label: 'Client Address', type: 'text', required: false, placeholder: 'e.g., Unit 1204 Ayala Avenue, Makati City 1226, Philippines' },
          { name: 'invoiceNumber', label: 'Invoice Number', type: 'text', required: true, placeholder: 'e.g., INV-001234' },
          { name: 'invoiceDate', label: 'Invoice Date', type: 'date', required: true },
          { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
          { name: 'itemsText', label: 'Line Items', type: 'textarea', required: true, placeholder: 'Enter each item on a new line:\nWeb Development - ₱85,000\nUI/UX Design - ₱45,000\nConsulting - ₱28,000', hint: 'Add description and amount for each service' },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,XLSX',
    },
    {
      id: 'template-report-1',
      name: 'Executive Report',
      type: 'REPORT',
      structure: JSON.stringify({
        fields: [
          { name: 'title', label: 'Report Title', type: 'text', required: true, placeholder: 'e.g., Q1 2024 Performance Report' },
          { name: 'dateRange', label: 'Reporting Period', type: 'text', required: true, placeholder: 'e.g., January - March 2024' },
          { name: 'department', label: 'Department', type: 'text', required: false, placeholder: 'e.g., Sales & Marketing' },
          { name: 'keyPointsText', label: 'Key Findings & Insights', type: 'textarea', required: true, placeholder: 'Enter each finding on a new line:\nRevenue increased by 15%\nCustomer satisfaction improved to 92%\nNew product launch exceeded targets', hint: 'Include metrics and specific outcomes' },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-memo-1',
      name: 'Internal Memo',
      type: 'MEMO',
      structure: JSON.stringify({
        fields: [
          { name: 'to', label: 'To', type: 'text', required: true, placeholder: 'e.g., All Staff or Department Name' },
          { name: 'from', label: 'From', type: 'text', required: true, placeholder: 'e.g., Management Team' },
          { name: 'date', label: 'Date', type: 'date', required: true },
          { name: 'subject', label: 'Subject', type: 'text', required: true, placeholder: 'e.g., Updated Remote Work Policy' },
          { name: 'message', label: 'Message Body', type: 'textarea', required: true, placeholder: 'Write your memo content here...', hint: 'Be clear and concise. Include any action items at the end.' },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-content-1',
      name: 'Strategic Content Piece',
      type: 'CONTENT',
      structure: JSON.stringify({
        fields: [
          { name: 'title', label: 'Document Title', type: 'text', required: true },
          { name: 'topic', label: 'Main Topic', type: 'text', required: true },
          { name: 'targetAudience', label: 'Target Audience', type: 'text', required: false },
          { name: 'tone', label: 'Tone of Voice', type: 'text', required: false },
          { name: 'keyPointsText', label: 'Key Points (one per line)', type: 'textarea', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'DOCX,PDF',
    },
    {
      id: 'template-presentation-1',
      name: 'Visual Presentation Deck',
      type: 'PRESENTATION',
      structure: JSON.stringify({
        fields: [
          { name: 'topic', label: 'Presentation Topic', type: 'text', required: true },
          { name: 'targetAudience', label: 'Target Audience', type: 'text', required: false },
          { name: 'presentationStyle', label: 'Presentation Style', type: 'text', required: false },
          { name: 'keyMessage', label: 'Key Message', type: 'textarea', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF',
    },
    {
      id: 'template-resume-1',
      name: 'Modern Resume',
      type: 'RESUME',
      structure: JSON.stringify({
        fields: [
          { name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g., Alex Rivera' },
          { name: 'contactInfo', label: 'Contact Information', type: 'text', required: true, placeholder: 'e.g., alex@email.com | +63 917 123 4567 | Quezon City, Philippines' },
          { name: 'experienceText', label: 'Work Experience', type: 'textarea', required: true, placeholder: 'Senior Developer at TechCorp (2020-Present)\n- Led team of 5 engineers\n- Shipped 3 major features\n\nDeveloper at StartupXYZ (2018-2020)\n- Built mobile app from scratch', hint: 'Include job title, company, dates, and key achievements' },
          { name: 'educationText', label: 'Education', type: 'textarea', required: true, placeholder: 'BS Computer Science\nUniversity of the Philippines Diliman (2014-2018)' },
          { name: 'skillsText', label: 'Skills', type: 'text', required: true, placeholder: 'e.g., React, TypeScript, Node.js, AWS, Python, Agile' },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-contract-1',
      name: 'Legal Service Agreement',
      type: 'LEGAL_CONTRACT',
      structure: JSON.stringify({
        fields: [
          { name: 'clientName', label: 'Client Name', type: 'text', required: true },
          { name: 'serviceProvider', label: 'Service Provider', type: 'text', required: true },
          { name: 'servicesDescription', label: 'Description of Services', type: 'textarea', required: true },
          { name: 'paymentTerms', label: 'Payment & Fees', type: 'text', required: true },
          { name: 'governingLaw', label: 'Governing Law (State/Country)', type: 'text', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-newsletter-1',
      name: 'Company Newsletter',
      type: 'NEWSLETTER',
      structure: JSON.stringify({
        fields: [
          { name: 'title', label: 'Newsletter Title', type: 'text', required: true },
          { name: 'issueDate', label: 'Issue Date/Edition', type: 'text', required: true },
          { name: 'mainStory', label: 'Main Story Headline', type: 'text', required: true },
          { name: 'contentPoints', label: 'Story Highlights (one per line)', type: 'textarea', required: true },
          { name: 'upcomingEvents', label: 'Upcoming Events (one per line)', type: 'textarea', required: false },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-minutes-1',
      name: 'Meeting Minutes',
      type: 'MEETING_MINUTES',
      structure: JSON.stringify({
        fields: [
          { name: 'meetingTitle', label: 'Meeting Title', type: 'text', required: true },
          { name: 'meetingDate', label: 'Meeting Date', type: 'date', required: true },
          { name: 'attendeesText', label: 'Attendees (one per line)', type: 'textarea', required: true },
          { name: 'agendaText', label: 'Agenda Covered', type: 'textarea', required: true },
          { name: 'discussionText', label: 'Key Discussions', type: 'textarea', required: true },
          { name: 'actionItemsText', label: 'Action Items', type: 'textarea', required: false },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-proposal-1',
      name: 'Business Project Proposal',
      type: 'PROJECT_PROPOSAL',
      structure: JSON.stringify({
        fields: [
          { name: 'projectTitle', label: 'Project Name', type: 'text', required: true, placeholder: 'e.g., Enterprise AI Implementation Project' },
          { name: 'clientName', label: 'Client / Stakeholder', type: 'text', required: true, placeholder: 'e.g., Global Finance Corp' },
          { name: 'goals', label: 'Project Goals', type: 'textarea', required: true, placeholder: 'What are the key objectives?\n- Implement AI-powered analytics\n- Reduce processing time by 40%\n- Ensure compliance' },
          { name: 'scope', label: 'Scope & Deliverables', type: 'textarea', required: true, placeholder: 'What will be delivered?\n- Custom AI model\n- Dashboard integration\n- Training sessions', hint: 'Be specific about what is and is not included' },
          { name: 'timeline', label: 'Timeline', type: 'text', required: true, placeholder: 'e.g., 12 weeks from kickoff' },
          { name: 'budget', label: 'Budget Estimate', type: 'text', required: false, placeholder: 'e.g., ₱4,200,000' },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-prd-1',
      name: 'Product Requirement Document',
      type: 'PRODUCT_SPEC',
      structure: JSON.stringify({
        fields: [
          { name: 'productName', label: 'Product/Feature Name', type: 'text', required: true },
          { name: 'objectives', label: 'Key Objectives', type: 'textarea', required: true },
          { name: 'userStories', label: 'User Stories (one per line)', type: 'textarea', required: true },
          { name: 'requirements', label: 'Functional Requirements', type: 'textarea', required: true },
          { name: 'successMetrics', label: 'Success Metrics (KPIs)', type: 'text', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-press-1',
      name: 'Media Press Release',
      type: 'PRESS_RELEASE',
      structure: JSON.stringify({
        fields: [
          { name: 'headline', label: 'Catchy Headline', type: 'text', required: true },
          { name: 'locationDate', label: 'Location & Date', type: 'text', required: true },
          { name: 'leadParagraph', label: 'Lead Paragraph (The "Hook")', type: 'textarea', required: true },
          { name: 'bodyContent', label: 'Body Content', type: 'textarea', required: true },
          { name: 'companyInfo', label: 'About the Company', type: 'textarea', required: true },
          { name: 'contactMedia', label: 'Media Contact Info', type: 'text', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-case-1',
      name: 'Client Case Study',
      type: 'CASE_STUDY',
      structure: JSON.stringify({
        fields: [
          { name: 'clientName', label: 'Client Name', type: 'text', required: true },
          { name: 'projectTitle', label: 'Project Name', type: 'text', required: true },
          { name: 'challenge', label: 'The Challenge', type: 'textarea', required: true },
          { name: 'solution', label: 'The Solution Provided', type: 'textarea', required: true },
          { name: 'results', label: 'Measurable Results', type: 'textarea', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-job-desc-1',
      name: 'Job Description',
      type: 'JOB_DESCRIPTION',
      structure: JSON.stringify({
        fields: [
          { name: 'jobTitle', label: 'Job Title', type: 'text', required: true },
          { name: 'companyName', label: 'Company Name', type: 'text', required: true },
          { name: 'location', label: 'Location/Remote', type: 'text', required: true },
          { name: 'responsibilities', label: 'Key Responsibilities', type: 'textarea', required: true },
          { name: 'requirements', label: 'Qualifications & Skills', type: 'textarea', required: true },
          { name: 'benefits', label: 'Perks & Benefits', type: 'textarea', required: false },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-cover-letter-1',
      name: 'Professional Cover Letter',
      type: 'COVER_LETTER',
      structure: JSON.stringify({
        fields: [
          { name: 'applicantName', label: 'Your Full Name', type: 'text', required: true },
          { name: 'jobTitle', label: 'Target Job Title', type: 'text', required: true },
          { name: 'companyName', label: 'Hiring Company', type: 'text', required: true },
          { name: 'keySkills', label: 'Top 3 Relevant Skills', type: 'text', required: true },
          { name: 'experienceSummary', label: 'Brief Experience Highlight', type: 'textarea', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-social-plan-1',
      name: 'Social Media Post Plan',
      type: 'SOCIAL_MEDIA_PLAN',
      structure: JSON.stringify({
        fields: [
          { name: 'campaignName', label: 'Campaign Title', type: 'text', required: true },
          { name: 'platforms', label: 'Platforms (e.g. IG, FB, X)', type: 'text', required: true },
          { name: 'targetAudience', label: 'Target Audience', type: 'text', required: true },
          { name: 'goals', label: 'Post Objectives', type: 'textarea', required: true },
          { name: 'keyHashtags', label: 'Niche Hashtags', type: 'text', required: false },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-sop-1',
      name: 'Standard Operating Procedure (SOP)',
      type: 'SOP',
      structure: JSON.stringify({
        fields: [
          { name: 'procTitle', label: 'Procedure Title', type: 'text', required: true },
          { name: 'department', label: 'Department', type: 'text', required: true },
          { name: 'objective', label: 'Procedure Objective', type: 'textarea', required: true },
          { name: 'steps', label: 'Step-by-Step Instructions', type: 'textarea', required: true },
          { name: 'safetyNotes', label: 'Safety or Compliance Notes', type: 'textarea', required: false },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-agenda-1',
      name: 'Meeting Agenda',
      type: 'MEETING_AGENDA',
      structure: JSON.stringify({
        fields: [
          { name: 'meetingTitle', label: 'Meeting Title', type: 'text', required: true },
          { name: 'date', label: 'Meeting Date & Time', type: 'text', required: true },
          { name: 'facilitator', label: 'Facilitator/Leader', type: 'text', required: true },
          { name: 'objectives', label: 'Meeting Objectives', type: 'textarea', required: true },
          { name: 'agendaItems', label: 'Agenda Items (one per line)', type: 'textarea', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    // ========== NEW TEMPLATES (20 total) ==========
    // FREE TIER (5)
    {
      id: 'template-thank-you-1',
      name: 'Professional Thank You Note',
      type: 'THANK_YOU_NOTE',
      structure: JSON.stringify({
        fields: [
          { name: 'recipientName', label: 'Recipient Name', type: 'text', required: true },
          { name: 'occasion', label: 'Occasion/Reason', type: 'text', required: true },
          { name: 'personalMessage', label: 'Personal Message', type: 'textarea', required: true },
          { name: 'senderName', label: 'Your Name', type: 'text', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-expense-1',
      name: 'Expense Report',
      type: 'EXPENSE_REPORT',
      structure: JSON.stringify({
        fields: [
          { name: 'employeeName', label: 'Employee Name', type: 'text', required: true },
          { name: 'department', label: 'Department', type: 'text', required: true },
          { name: 'reportPeriod', label: 'Report Period', type: 'text', required: true },
          { name: 'expenseItems', label: 'Expense Items (one per line)', type: 'textarea', required: true },
          { name: 'totalAmount', label: 'Total Amount', type: 'text', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,XLSX',
    },
    {
      id: 'template-standup-1',
      name: 'Daily Standup Notes',
      type: 'DAILY_STANDUP',
      structure: JSON.stringify({
        fields: [
          { name: 'date', label: 'Date', type: 'date', required: true },
          { name: 'teamName', label: 'Team Name', type: 'text', required: true },
          { name: 'completedYesterday', label: 'Completed Yesterday', type: 'textarea', required: true },
          { name: 'plannedToday', label: 'Planned for Today', type: 'textarea', required: true },
          { name: 'blockers', label: 'Blockers/Impediments', type: 'textarea', required: false },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-feedback-1',
      name: 'Structured Feedback Form',
      type: 'FEEDBACK_FORM',
      structure: JSON.stringify({
        fields: [
          { name: 'feedbackType', label: 'Feedback Type (Praise/Improvement)', type: 'text', required: true },
          { name: 'recipient', label: 'Feedback For', type: 'text', required: true },
          { name: 'context', label: 'Context/Situation', type: 'textarea', required: true },
          { name: 'observations', label: 'Specific Observations', type: 'textarea', required: true },
          { name: 'suggestions', label: 'Suggestions for Improvement', type: 'textarea', required: false },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-invitation-1',
      name: 'Event Invitation',
      type: 'EVENT_INVITATION',
      structure: JSON.stringify({
        fields: [
          { name: 'eventName', label: 'Event Name', type: 'text', required: true },
          { name: 'eventDate', label: 'Date & Time', type: 'text', required: true },
          { name: 'venue', label: 'Venue/Location', type: 'text', required: true },
          { name: 'description', label: 'Event Description', type: 'textarea', required: true },
          { name: 'rsvpDetails', label: 'RSVP Details', type: 'text', required: false },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    // STARTER TIER (5)
    {
      id: 'template-onboarding-1',
      name: 'Employee Onboarding Checklist',
      type: 'ONBOARDING_CHECKLIST',
      structure: JSON.stringify({
        fields: [
          { name: 'employeeName', label: 'New Employee Name', type: 'text', required: true },
          { name: 'startDate', label: 'Start Date', type: 'date', required: true },
          { name: 'department', label: 'Department', type: 'text', required: true },
          { name: 'managerName', label: 'Reporting Manager', type: 'text', required: true },
          { name: 'checklistItems', label: 'Checklist Items (one per line)', type: 'textarea', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-performance-1',
      name: 'Performance Review',
      type: 'PERFORMANCE_REVIEW',
      structure: JSON.stringify({
        fields: [
          { name: 'employeeName', label: 'Employee Name', type: 'text', required: true },
          { name: 'reviewPeriod', label: 'Review Period', type: 'text', required: true },
          { name: 'accomplishments', label: 'Key Accomplishments', type: 'textarea', required: true },
          { name: 'areasForImprovement', label: 'Areas for Improvement', type: 'textarea', required: true },
          { name: 'goals', label: 'Goals for Next Period', type: 'textarea', required: true },
          { name: 'overallRating', label: 'Overall Rating', type: 'text', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-training-1',
      name: 'Training Manual',
      type: 'TRAINING_MANUAL',
      structure: JSON.stringify({
        fields: [
          { name: 'trainingTitle', label: 'Training Title', type: 'text', required: true },
          { name: 'targetAudience', label: 'Target Audience', type: 'text', required: true },
          { name: 'objectives', label: 'Learning Objectives', type: 'textarea', required: true },
          { name: 'content', label: 'Training Content/Steps', type: 'textarea', required: true },
          { name: 'assessmentCriteria', label: 'Assessment Criteria', type: 'textarea', required: false },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-incident-1',
      name: 'Incident Report',
      type: 'INCIDENT_REPORT',
      structure: JSON.stringify({
        fields: [
          { name: 'incidentDate', label: 'Incident Date & Time', type: 'text', required: true },
          { name: 'location', label: 'Location', type: 'text', required: true },
          { name: 'reportedBy', label: 'Reported By', type: 'text', required: true },
          { name: 'description', label: 'Incident Description', type: 'textarea', required: true },
          { name: 'actionsTaken', label: 'Actions Taken', type: 'textarea', required: true },
          { name: 'witnesses', label: 'Witnesses (if any)', type: 'text', required: false },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-quarterly-goals-1',
      name: 'Quarterly Goals Document',
      type: 'QUARTERLY_GOALS',
      structure: JSON.stringify({
        fields: [
          { name: 'quarter', label: 'Quarter (e.g., Q1 2024)', type: 'text', required: true },
          { name: 'department', label: 'Department/Team', type: 'text', required: true },
          { name: 'objectives', label: 'Key Objectives', type: 'textarea', required: true },
          { name: 'keyResults', label: 'Key Results/Metrics', type: 'textarea', required: true },
          { name: 'dependencies', label: 'Dependencies/Resources Needed', type: 'textarea', required: false },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    // PRO TIER (5)
    {
      id: 'template-whitepaper-1',
      name: 'Technical White Paper',
      type: 'WHITE_PAPER',
      structure: JSON.stringify({
        fields: [
          { name: 'title', label: 'White Paper Title', type: 'text', required: true },
          { name: 'abstract', label: 'Executive Abstract', type: 'textarea', required: true },
          { name: 'problemStatement', label: 'Problem Statement', type: 'textarea', required: true },
          { name: 'proposedSolution', label: 'Proposed Solution', type: 'textarea', required: true },
          { name: 'conclusion', label: 'Conclusion & Recommendations', type: 'textarea', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-rfp-1',
      name: 'RFP Response',
      type: 'RFP_RESPONSE',
      structure: JSON.stringify({
        fields: [
          { name: 'rfpTitle', label: 'RFP Title', type: 'text', required: true },
          { name: 'companyName', label: 'Your Company Name', type: 'text', required: true },
          { name: 'executiveSummary', label: 'Executive Summary', type: 'textarea', required: true },
          { name: 'technicalApproach', label: 'Technical Approach', type: 'textarea', required: true },
          { name: 'pricing', label: 'Pricing Overview', type: 'textarea', required: true },
          { name: 'timeline', label: 'Proposed Timeline', type: 'text', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-exec-summary-1',
      name: 'Executive Summary',
      type: 'EXECUTIVE_SUMMARY',
      structure: JSON.stringify({
        fields: [
          { name: 'title', label: 'Document Title', type: 'text', required: true },
          { name: 'purpose', label: 'Purpose/Objective', type: 'textarea', required: true },
          { name: 'keyFindings', label: 'Key Findings', type: 'textarea', required: true },
          { name: 'recommendations', label: 'Recommendations', type: 'textarea', required: true },
          { name: 'nextSteps', label: 'Next Steps', type: 'textarea', required: false },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-business-plan-1',
      name: 'Comprehensive Business Plan',
      type: 'BUSINESS_PLAN',
      structure: JSON.stringify({
        fields: [
          { name: 'companyName', label: 'Company Name', type: 'text', required: true },
          { name: 'missionStatement', label: 'Mission Statement', type: 'textarea', required: true },
          { name: 'marketAnalysis', label: 'Market Analysis', type: 'textarea', required: true },
          { name: 'productsServices', label: 'Products/Services', type: 'textarea', required: true },
          { name: 'financialProjections', label: 'Financial Projections', type: 'textarea', required: true },
          { name: 'fundingNeeds', label: 'Funding Requirements', type: 'text', required: false },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-swot-1',
      name: 'SWOT Analysis',
      type: 'SWOT_ANALYSIS',
      structure: JSON.stringify({
        fields: [
          { name: 'subject', label: 'Subject of Analysis', type: 'text', required: true },
          { name: 'strengths', label: 'Strengths', type: 'textarea', required: true },
          { name: 'weaknesses', label: 'Weaknesses', type: 'textarea', required: true },
          { name: 'opportunities', label: 'Opportunities', type: 'textarea', required: true },
          { name: 'threats', label: 'Threats', type: 'textarea', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    // ENTERPRISE TIER (5)
    {
      id: 'template-annual-report-1',
      name: 'Annual Report',
      type: 'ANNUAL_REPORT',
      structure: JSON.stringify({
        fields: [
          { name: 'companyName', label: 'Company Name', type: 'text', required: true },
          { name: 'fiscalYear', label: 'Fiscal Year', type: 'text', required: true },
          { name: 'ceoLetter', label: 'CEO Letter', type: 'textarea', required: true },
          { name: 'financialHighlights', label: 'Financial Highlights', type: 'textarea', required: true },
          { name: 'operationalReview', label: 'Operational Review', type: 'textarea', required: true },
          { name: 'futureOutlook', label: 'Future Outlook', type: 'textarea', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-board-presentation-1',
      name: 'Board Presentation',
      type: 'BOARD_PRESENTATION',
      structure: JSON.stringify({
        fields: [
          { name: 'meetingDate', label: 'Meeting Date', type: 'date', required: true },
          { name: 'presenter', label: 'Presenter Name/Title', type: 'text', required: true },
          { name: 'agendaTopics', label: 'Agenda Topics', type: 'textarea', required: true },
          { name: 'keyMetrics', label: 'Key Metrics & KPIs', type: 'textarea', required: true },
          { name: 'strategicUpdates', label: 'Strategic Updates', type: 'textarea', required: true },
          { name: 'decisionsRequired', label: 'Decisions Required', type: 'textarea', required: false },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF',
    },
    {
      id: 'template-compliance-1',
      name: 'Compliance Audit Report',
      type: 'COMPLIANCE_AUDIT',
      structure: JSON.stringify({
        fields: [
          { name: 'auditTitle', label: 'Audit Title', type: 'text', required: true },
          { name: 'auditPeriod', label: 'Audit Period', type: 'text', required: true },
          { name: 'scope', label: 'Audit Scope', type: 'textarea', required: true },
          { name: 'findings', label: 'Audit Findings', type: 'textarea', required: true },
          { name: 'recommendations', label: 'Recommendations', type: 'textarea', required: true },
          { name: 'riskLevel', label: 'Overall Risk Level', type: 'text', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-merger-1',
      name: 'Merger & Acquisition Proposal',
      type: 'MERGER_PROPOSAL',
      structure: JSON.stringify({
        fields: [
          { name: 'targetCompany', label: 'Target Company', type: 'text', required: true },
          { name: 'acquiringCompany', label: 'Acquiring Company', type: 'text', required: true },
          { name: 'strategicRationale', label: 'Strategic Rationale', type: 'textarea', required: true },
          { name: 'valuation', label: 'Valuation Overview', type: 'textarea', required: true },
          { name: 'integrationPlan', label: 'Integration Plan', type: 'textarea', required: true },
          { name: 'riskFactors', label: 'Key Risk Factors', type: 'textarea', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-investor-pitch-1',
      name: 'Investor Pitch Deck',
      type: 'INVESTOR_PITCH',
      structure: JSON.stringify({
        fields: [
          { name: 'companyName', label: 'Company Name', type: 'text', required: true },
          { name: 'tagline', label: 'Company Tagline', type: 'text', required: true },
          { name: 'problem', label: 'Problem Being Solved', type: 'textarea', required: true },
          { name: 'solution', label: 'Your Solution', type: 'textarea', required: true },
          { name: 'marketSize', label: 'Market Size & Opportunity', type: 'textarea', required: true },
          { name: 'businessModel', label: 'Business Model', type: 'textarea', required: true },
          { name: 'askAmount', label: 'Funding Ask', type: 'text', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF',
    },
    // ========== ADDITIONAL TEMPLATES (20 total) ==========
    // FREE TIER (+5)
    {
      id: 'template-invoice-2',
      name: 'Freelance Invoice',
      type: 'INVOICE',
      structure: JSON.stringify({
        fields: [
          { name: 'clientName', label: 'Client Name', type: 'text', required: true },
          { name: 'invoiceNumber', label: 'Invoice Number', type: 'text', required: true },
          { name: 'invoiceDate', label: 'Invoice Date', type: 'date', required: true },
          { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
          { name: 'itemsText', label: 'Services (one per line)', type: 'textarea', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,XLSX',
    },
    {
      id: 'template-memo-2',
      name: 'Team Announcement Memo',
      type: 'MEMO',
      structure: JSON.stringify({
        fields: [
          { name: 'to', label: 'To', type: 'text', required: true },
          { name: 'from', label: 'From', type: 'text', required: true },
          { name: 'date', label: 'Date', type: 'date', required: true },
          { name: 'subject', label: 'Subject', type: 'text', required: true },
          { name: 'message', label: 'Message', type: 'textarea', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-resume-2',
      name: 'Entry-Level Resume',
      type: 'RESUME',
      structure: JSON.stringify({
        fields: [
          { name: 'fullName', label: 'Full Name', type: 'text', required: true },
          { name: 'contactInfo', label: 'Contact Info', type: 'text', required: true },
          { name: 'experienceText', label: 'Experience', type: 'textarea', required: true },
          { name: 'educationText', label: 'Education', type: 'textarea', required: true },
          { name: 'skillsText', label: 'Skills', type: 'text', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-thank-you-2',
      name: 'Client Appreciation Note',
      type: 'THANK_YOU_NOTE',
      structure: JSON.stringify({
        fields: [
          { name: 'recipientName', label: 'Recipient Name', type: 'text', required: true },
          { name: 'occasion', label: 'Reason', type: 'text', required: true },
          { name: 'personalMessage', label: 'Message', type: 'textarea', required: true },
          { name: 'senderName', label: 'Sender Name', type: 'text', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-invitation-2',
      name: 'Workshop Invitation',
      type: 'EVENT_INVITATION',
      structure: JSON.stringify({
        fields: [
          { name: 'eventName', label: 'Event Name', type: 'text', required: true },
          { name: 'eventDate', label: 'Date & Time', type: 'text', required: true },
          { name: 'venue', label: 'Venue', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea', required: true },
          { name: 'rsvpDetails', label: 'RSVP', type: 'text', required: false },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    // STARTER TIER (+5)
    {
      id: 'template-report-2',
      name: 'Weekly Team Report',
      type: 'REPORT',
      structure: JSON.stringify({
        fields: [
          { name: 'title', label: 'Report Title', type: 'text', required: true },
          { name: 'dateRange', label: 'Period', type: 'text', required: true },
          { name: 'department', label: 'Department', type: 'text', required: false },
          { name: 'keyPointsText', label: 'Key Points', type: 'textarea', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-content-2',
      name: 'SEO Blog Outline',
      type: 'CONTENT',
      structure: JSON.stringify({
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'topic', label: 'Topic', type: 'text', required: true },
          { name: 'targetAudience', label: 'Target Audience', type: 'text', required: false },
          { name: 'tone', label: 'Tone', type: 'text', required: false },
          { name: 'keyPointsText', label: 'Key Points', type: 'textarea', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-job-desc-2',
      name: 'Remote Job Description',
      type: 'JOB_DESCRIPTION',
      structure: JSON.stringify({
        fields: [
          { name: 'jobTitle', label: 'Job Title', type: 'text', required: true },
          { name: 'companyName', label: 'Company Name', type: 'text', required: true },
          { name: 'location', label: 'Location', type: 'text', required: true },
          { name: 'responsibilities', label: 'Responsibilities', type: 'textarea', required: true },
          { name: 'requirements', label: 'Requirements', type: 'textarea', required: true },
          { name: 'benefits', label: 'Benefits', type: 'textarea', required: false },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-cover-letter-2',
      name: 'Career Change Cover Letter',
      type: 'COVER_LETTER',
      structure: JSON.stringify({
        fields: [
          { name: 'applicantName', label: 'Applicant Name', type: 'text', required: true },
          { name: 'jobTitle', label: 'Job Title', type: 'text', required: true },
          { name: 'companyName', label: 'Company Name', type: 'text', required: true },
          { name: 'keySkills', label: 'Key Skills', type: 'text', required: true },
          { name: 'experienceSummary', label: 'Summary', type: 'textarea', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-sop-2',
      name: 'Customer Support SOP',
      type: 'SOP',
      structure: JSON.stringify({
        fields: [
          { name: 'procTitle', label: 'Procedure Title', type: 'text', required: true },
          { name: 'department', label: 'Department', type: 'text', required: true },
          { name: 'objective', label: 'Objective', type: 'textarea', required: true },
          { name: 'steps', label: 'Steps', type: 'textarea', required: true },
          { name: 'safetyNotes', label: 'Compliance Notes', type: 'textarea', required: false },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    // PRO TIER (+5)
    {
      id: 'template-presentation-2',
      name: 'Product Launch Presentation',
      type: 'PRESENTATION',
      structure: JSON.stringify({
        fields: [
          { name: 'topic', label: 'Topic', type: 'text', required: true },
          { name: 'targetAudience', label: 'Target Audience', type: 'text', required: false },
          { name: 'presentationStyle', label: 'Style', type: 'text', required: false },
          { name: 'keyMessage', label: 'Key Message', type: 'textarea', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF',
    },
    {
      id: 'template-contract-2',
      name: 'Consulting Services Agreement',
      type: 'LEGAL_CONTRACT',
      structure: JSON.stringify({
        fields: [
          { name: 'clientName', label: 'Client Name', type: 'text', required: true },
          { name: 'serviceProvider', label: 'Service Provider', type: 'text', required: true },
          { name: 'servicesDescription', label: 'Services', type: 'textarea', required: true },
          { name: 'paymentTerms', label: 'Payment Terms', type: 'text', required: true },
          { name: 'governingLaw', label: 'Governing Law', type: 'text', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-newsletter-2',
      name: 'Product Update Newsletter',
      type: 'NEWSLETTER',
      structure: JSON.stringify({
        fields: [
          { name: 'title', label: 'Newsletter Title', type: 'text', required: true },
          { name: 'issueDate', label: 'Issue Date', type: 'text', required: true },
          { name: 'mainStory', label: 'Main Story', type: 'text', required: true },
          { name: 'contentPoints', label: 'Highlights', type: 'textarea', required: true },
          { name: 'upcomingEvents', label: 'Upcoming Events', type: 'textarea', required: false },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-whitepaper-2',
      name: 'Industry Trend White Paper',
      type: 'WHITE_PAPER',
      structure: JSON.stringify({
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'abstract', label: 'Abstract', type: 'textarea', required: true },
          { name: 'problemStatement', label: 'Problem Statement', type: 'textarea', required: true },
          { name: 'proposedSolution', label: 'Proposed Solution', type: 'textarea', required: true },
          { name: 'conclusion', label: 'Conclusion', type: 'textarea', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-business-plan-2',
      name: 'Startup Business Plan',
      type: 'BUSINESS_PLAN',
      structure: JSON.stringify({
        fields: [
          { name: 'companyName', label: 'Company Name', type: 'text', required: true },
          { name: 'missionStatement', label: 'Mission Statement', type: 'textarea', required: true },
          { name: 'marketAnalysis', label: 'Market Analysis', type: 'textarea', required: true },
          { name: 'productsServices', label: 'Products/Services', type: 'textarea', required: true },
          { name: 'financialProjections', label: 'Financial Projections', type: 'textarea', required: true },
          { name: 'fundingNeeds', label: 'Funding Needs', type: 'text', required: false },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    // ENTERPRISE TIER (+5)
    {
      id: 'template-proposal-2',
      name: 'Strategic Transformation Proposal',
      type: 'PROJECT_PROPOSAL',
      structure: JSON.stringify({
        fields: [
          { name: 'projectTitle', label: 'Project Title', type: 'text', required: true },
          { name: 'clientName', label: 'Client Name', type: 'text', required: true },
          { name: 'goals', label: 'Goals', type: 'textarea', required: true },
          { name: 'scope', label: 'Scope', type: 'textarea', required: true },
          { name: 'timeline', label: 'Timeline', type: 'text', required: true },
          { name: 'budget', label: 'Budget', type: 'text', required: false },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-prd-2',
      name: 'Enterprise Product Spec',
      type: 'PRODUCT_SPEC',
      structure: JSON.stringify({
        fields: [
          { name: 'productName', label: 'Product Name', type: 'text', required: true },
          { name: 'objectives', label: 'Objectives', type: 'textarea', required: true },
          { name: 'userStories', label: 'User Stories', type: 'textarea', required: true },
          { name: 'requirements', label: 'Requirements', type: 'textarea', required: true },
          { name: 'successMetrics', label: 'Success Metrics', type: 'text', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-case-2',
      name: 'Enterprise Success Case Study',
      type: 'CASE_STUDY',
      structure: JSON.stringify({
        fields: [
          { name: 'clientName', label: 'Client Name', type: 'text', required: true },
          { name: 'projectTitle', label: 'Project Title', type: 'text', required: true },
          { name: 'challenge', label: 'Challenge', type: 'textarea', required: true },
          { name: 'solution', label: 'Solution', type: 'textarea', required: true },
          { name: 'results', label: 'Results', type: 'textarea', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-annual-report-2',
      name: 'Corporate Annual Report',
      type: 'ANNUAL_REPORT',
      structure: JSON.stringify({
        fields: [
          { name: 'companyName', label: 'Company Name', type: 'text', required: true },
          { name: 'fiscalYear', label: 'Fiscal Year', type: 'text', required: true },
          { name: 'ceoLetter', label: 'CEO Letter', type: 'textarea', required: true },
          { name: 'financialHighlights', label: 'Financial Highlights', type: 'textarea', required: true },
          { name: 'operationalReview', label: 'Operational Review', type: 'textarea', required: true },
          { name: 'futureOutlook', label: 'Future Outlook', type: 'textarea', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    },
    {
      id: 'template-compliance-2',
      name: 'Regulatory Compliance Audit',
      type: 'COMPLIANCE_AUDIT',
      structure: JSON.stringify({
        fields: [
          { name: 'auditTitle', label: 'Audit Title', type: 'text', required: true },
          { name: 'auditPeriod', label: 'Audit Period', type: 'text', required: true },
          { name: 'scope', label: 'Scope', type: 'textarea', required: true },
          { name: 'findings', label: 'Findings', type: 'textarea', required: true },
          { name: 'recommendations', label: 'Recommendations', type: 'textarea', required: true },
          { name: 'riskLevel', label: 'Risk Level', type: 'text', required: true },
        ]
      }),
      isActive: true,
      supportedFormats: 'PDF,DOCX',
    }
  ];

  for (const t of templates) {
    await prisma.template.upsert({
      where: { id: t.id },
      update: {
        name: t.name,
        type: t.type,
        structure: t.structure,
        isActive: t.isActive,
        supportedFormats: t.supportedFormats,
      },
      create: t,
    });
  }

  console.log('✅ Templates seeded successfully');

  // 3. Regular User
  const userEmail = 'user@docuai.com';
  const userPassword = await bcrypt.hash('user123', 10);
  await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      password: userPassword,
      role: 'USER',
      subscriptionTier: 'FREE',
      billingCycle: 'MONTHLY',
      lastReset: new Date(),
    },
  });

  console.log(`✅ Regular user created: ${userEmail}`);
  console.log('🚀 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


