/**
 * Prompt Engineering Utilities
 * 
 * This module contains prompt templates for generating different document types.
 * Each function builds a structured prompt that instructs the AI to generate
 * valid JSON output matching the expected schema.
 */

interface InvoiceInput {
  clientName: string;
  clientAddress?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: Array<{
    description: string;
    quantity?: number;
    rate?: number;
  }>;
}

interface ReportInput {
  title: string;
  dateRange: string;
  keyPoints: string[];
  department?: string;
}

interface MemoInput {
  to: string;
  from: string;
  subject: string;
  date: string;
  message: string;
}

interface ContentInput {
  title: string;
  topic: string;
  targetAudience?: string;
  tone?: string;
  keyPoints: string[];
}

interface PresentationInput {
  topic: string;
  targetAudience?: string;
  presentationStyle?: string;
  keyMessage: string;
}

const PH_CONTEXT_INSTRUCTION = `Context requirements:
- Generate content for the Philippines only.
- Use Philippine locations, organizations, regulations, and practical business context where relevant.
- Use Philippine Peso (PHP, symbol: ₱) for any currency amounts.
- Use Philippine English and common local date/city conventions when examples are included.`;

function applyPhilippinesContext(prompt: { systemPrompt: string; userPrompt: string }): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt: `${prompt.systemPrompt}\n\n${PH_CONTEXT_INSTRUCTION}`,
    userPrompt: `${prompt.userPrompt}\n\nCountry context: Philippines only. Currency: PHP (₱).`,
  };
}

/**
 * Build prompt for Invoice generation
 */
export function buildInvoicePrompt(input: InvoiceInput, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? `\n\nWrite all text fields (descriptions, notes) in a ${tone} tone.` : '';
  const systemPrompt = `You are a professional invoice generator. Generate a complete, detailed invoice in JSON format.
Respond ONLY with a valid JSON object. Do not include any explanations, markdown headers, or surrounding text.

The JSON must have this exact structure:
{
  "header": {
    "invoiceNumber": "string",
    "invoiceDate": "string",
    "dueDate": "string"
  },
  "client": {
    "name": "string",
    "address": "string"
  },
  "items": [
    {
      "description": "string",
      "quantity": number,
      "rate": number,
      "amount": number
    }
  ],
  "subtotal": number,
  "tax": number,
  "total": number,
  "notes": "string"
}

Calculate amounts, subtotal, tax (12% VAT), and total automatically. Add professional payment terms in notes.${toneInstruction}`;

  const userPrompt = `Generate an invoice with the following details:

Client: ${input.clientName}
${input.clientAddress ? `Address: ${input.clientAddress}` : ''}
Invoice Number: ${input.invoiceNumber}
Invoice Date: ${input.invoiceDate}
Due Date: ${input.dueDate}

Items:
${input.items.map((item, i) => `${i + 1}. ${item.description}${item.quantity ? ` (Qty: ${item.quantity}, Rate: ₱${item.rate || 0})` : ''}`).join('\n')}

Provide realistic rates and quantities if not specified. Ensure all calculations are accurate.`;

  return { systemPrompt, userPrompt };
}

/**
 * Build prompt for Report generation
 */
export function buildReportPrompt(input: ReportInput, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Adopt a ${tone} writing style throughout the report.` : '';
  const systemPrompt = `You are a professional business report writer. Generate a comprehensive report in JSON format.
Respond ONLY with a valid JSON object. Do not include any explanations, markdown headers, or surrounding text.

The JSON must have this exact structure:
{
  "title": "string",
  "date": "string",
  "department": "string",
  "executiveSummary": "string",
  "sections": [
    {
      "heading": "string",
      "content": "string"
    }
  ],
  "findings": ["string"],
  "recommendations": ["string"],
  "conclusion": "string"
}

Write professionally with clear, actionable insights.${toneInstruction}`;

  const userPrompt = `Generate a business report with the following details:

Title: ${input.title}
Date Range: ${input.dateRange}
${input.department ? `Department: ${input.department}` : ''}

Key Points to Cover:
${input.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

Create a comprehensive report with executive summary, detailed sections covering each key point, findings, and actionable recommendations.`;

  return { systemPrompt, userPrompt };
}

/**
 * Build prompt for Memo generation
 */
export function buildMemoPrompt(input: MemoInput, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone throughout the memo.` : '';
  const systemPrompt = `You are a professional memo writer. Generate a clear, concise internal memo in JSON format.
Respond ONLY with a valid JSON object. Do not include any explanations, markdown headers, or surrounding text.

The JSON must have this exact structure:
{
  "header": {
    "to": "string",
    "from": "string",
    "date": "string",
    "subject": "string"
  },
  "body": {
    "opening": "string",
    "mainContent": ["string"],
    "closing": "string"
  },
  "actionItems": ["string"]
}

Write professionally and concisely. Break main content into clear paragraphs.${toneInstruction}`;

  const userPrompt = `Generate an internal memo with the following details:

To: ${input.to}
From: ${input.from}
Date: ${input.date}
Subject: ${input.subject}

Message: ${input.message}

Expand this into a professional memo with proper structure, clear communication, and any relevant action items.`;

  return { systemPrompt, userPrompt };
}

/**
 * Build prompt for Content Document generation
 */
export function buildContentPrompt(input: ContentInput, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Write in a ${tone} tone.` : '';
  const systemPrompt = `You are an expert content creator and copywriter. Generate a high-quality, structured article or document in JSON format.
Respond ONLY with a valid JSON object. Do not include any explanations, markdown headers, or surrounding text.

The JSON must have this exact structure:
{
  "title": "string",
  "summary": "string",
  "author": "DocuAI Content Engine",
  "sections": [
    {
      "subheading": "string",
      "paragraphs": ["string"]
    }
  ],
  "callToAction": "string",
  "keywords": ["string"]
}

Write in an engaging, informative style tailored to the specified audience and tone.${toneInstruction}`;

  const userPrompt = `Generate structured content with the following details:

Title: ${input.title}
Topic: ${input.topic}
Target Audience: ${input.targetAudience || 'General Professionals'}
Tone: ${input.tone || 'Professional and Informative'}

Key Points to Include:
${input.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

Create a compelling article with a strong introduction, detailed sections for each key point, and a concluding call to action.`;

  return { systemPrompt, userPrompt };
}

/**
 * Build prompt for Presentation Deck generation
 */
export function buildPresentationPrompt(input: PresentationInput, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone in all slide content.` : '';
  const systemPrompt = `You are a professional presentation designer. Generate a structured 5-slide presentation deck in JSON format.
Respond ONLY with a valid JSON object. Do not include any explanations, markdown headers, or surrounding text.

The JSON must have this exact structure:
{
  "presentationTitle": "string",
  "slides": [
    {
      "slideNumber": number,
      "title": "string",
      "content": ["string"],
      "imageKeyword": "string"
    }
  ]
}

- There MUST be exactly 5 slides.
- Slide 1 should be a Title Slide.
- Each slide should have an 'imageKeyword' that is directly related to BOTH the main topic and that slide's message.
- Make 'imageKeyword' specific (2-6 words), concrete, and visual (avoid generic terms like "business", "success", "growth" by themselves).
- Use minimalist, high-quality, professional concepts for 'imageKeyword' (e.g., 'fintech app onboarding flow', 'manila skyline at sunrise', 'team workshop whiteboard').
- Content should be punchy and bulleted.${toneInstruction}`;

  const userPrompt = `Generate a 5-slide presentation deck with the following details:

Topic: ${input.topic}
${input.targetAudience ? `Target Audience: ${input.targetAudience}` : ''}
${input.presentationStyle ? `Style: ${input.presentationStyle}` : ''}
Key Message: ${input.keyMessage}

Ensure each slide flows logically to deliver the key message effectively.`;

  return { systemPrompt, userPrompt };
}

export function buildResumePrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? `\n\nWrite all descriptions and summaries in a ${tone} tone.` : '';
  const systemPrompt = `You are a professional resume writer. Generate a complete, polished resume in JSON format.
Respond ONLY with a valid JSON object. Do not include markdown headers or surrounding text.

The JSON must follow this exact structure:
{
  "personalInfo": {
    "fullName": "string",
    "contact": "string",
    "location": "string"
  },
  "summary": "string",
  "experience": [
    {
      "role": "string",
      "company": "string",
      "period": "string",
      "points": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "school": "string",
      "period": "string"
    }
  ],
  "skills": {
    "technical": ["string"],
    "soft": ["string"]
  },
  "languages": ["string"]
}

Optimize information for maximum professional impact and ATS compatibility.${toneInstruction}`;

  const userPrompt = `Generate a professional resume for:

Name: ${input.fullName}
Contact: ${input.contactInfo}

Experience Details:
${input.experienceText}

Education:
${input.educationText}

Skills:
${input.skillsText}`;

  return { systemPrompt, userPrompt };
}

export function buildContractPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? `\n\nUse a ${tone} tone while maintaining legal clarity.` : '';
  const systemPrompt = `You are a legal assistant. Generate a professional service agreement in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "title": "string",
  "parties": {
    "client": "string",
    "provider": "string"
  },
  "sections": [
    {
      "heading": "string",
      "content": "string"
    }
  ]
}

Include standard clauses for Scope of Work, Payment, Term, Termination, and Governing Law.${toneInstruction}`;

  const userPrompt = `Generate a legal contract between ${input.serviceProvider} and ${input.clientName}.

Services:
${input.servicesDescription}

Payment Info: ${input.paymentTerms}
Jurisdiction: ${input.governingLaw}`;

  return { systemPrompt, userPrompt };
}

export function buildNewsletterPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? `\n\nWrite all articles in a ${tone} tone.` : '';
  const systemPrompt = `You are an editor for a company newsletter. Generate a structured newsletter in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "title": "string",
  "edition": "string",
  "articles": [
    {
      "headline": "string",
      "body": "string"
    }
  ],
  "upcomingEvents": ["string"]
}

Make headlines catchy and content engaging.${toneInstruction}`;

  const userPrompt = `Generate a newsletter titled "${input.title}" for ${input.issueDate}.

Main Feature: ${input.mainStory}
Highlights:
${input.contentPoints}

${input.upcomingEvents ? `Events:\n${input.upcomingEvents}` : ''}`;

  return { systemPrompt, userPrompt };
}

export function buildMeetingMinutesPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? `\n\nWrite the discussion points and actions in a ${tone} tone.` : '';
  const systemPrompt = `You are a professional secretary. Generate highly organized meeting minutes in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "title": "string",
  "dateTime": "string",
  "attendees": ["string"],
  "agenda": ["string"],
  "discussions": [
    { "topic": "string", "summary": "string" }
  ],
  "actionItems": [
    { "item": "string", "assignee": "string" }
  ]
}

Focus on clarity and accountability.${toneInstruction}`;

  const userPrompt = `Generate meeting minutes for "${input.meetingTitle}" held on ${input.meetingDate}.

Attendees:
${input.attendeesText}

Agenda:
${input.agendaText}

Summary of Discussions:
${input.discussionText}

${input.actionItemsText ? `Action Items:\n${input.actionItemsText}` : ''}`;

  return { systemPrompt, userPrompt };
}

export function buildProposalPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? `\n\nUse a ${tone} tone throughout the proposal.` : '';
  const systemPrompt = `You are a professional business consultant. Generate a compelling project proposal in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "title": "string",
  "client": "string",
  "executiveSummary": "string",
  "goals": ["string"],
  "scope": [
    { "deliverable": "string", "description": "string" }
  ],
  "timeline": [
    { "phase": "string", "duration": "string" }
  ],
  "budget": { "total": "string", "breakdown": ["string"] },
  "callToAction": "string"
}

Focus on value proposition and clear deliverables.${toneInstruction}`;

  const userPrompt = `Generate a project proposal for "${input.projectTitle}" for client "${input.clientName}".
Goals: ${input.goals}
Scope: ${input.scope}
Timeline: ${input.timeline}
${input.budget ? `Budget: ${input.budget}` : ''}`;

  return { systemPrompt, userPrompt };
}

export function buildPRDPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? `\n\nWrite the requirements in a ${tone} tone.` : '';
  const systemPrompt = `You are a senior product manager. Generate a detailed Product Requirement Document (PRD) in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "productName": "string",
  "objectives": ["string"],
  "targetAudience": "string",
  "userStories": [
    { "user": "string", "need": "string", "value": "string" }
  ],
  "functionalRequirements": [
    { "feature": "string", "priority": "High|Medium|Low", "description": "string" }
  ],
  "successMetrics": ["string"]
}

Focus on clarity, technical feasibility, and user value.${toneInstruction}`;

  const userPrompt = `Generate a PRD for "${input.productName}".
Objectives: ${input.objectives}
User Stories: ${input.userStories}
Requirements: ${input.requirements}
KPIs/Metrics: ${input.successMetrics}`;

  return { systemPrompt, userPrompt };
}

export function buildPressReleasePrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? `\n\nWrite the release in a ${tone} tone.` : '';
  const systemPrompt = `You are a public relations expert. Generate a professional media press release in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "headline": "string",
  "subheadline": "string",
  "locationDate": "string",
  "lead": "string",
  "body": ["string"],
  "quotes": [
    { "speaker": "string", "text": "string" }
  ],
  "boilerplate": "string",
  "contact": "string"
}

Identify the most newsworthy elements and use professional journalism standards appropriate for Philippine media communications.${toneInstruction}`;

  const userPrompt = `Generate a press release for:
Headline: ${input.headline}
Location/Date: ${input.locationDate}
Lead: ${input.leadParagraph}
Body: ${input.bodyContent}
Company info: ${input.companyInfo}
Contact: ${input.contactMedia}`;

  return { systemPrompt, userPrompt };
}

export function buildCaseStudyPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? `\n\nUse a ${tone} tone to highlight success.` : '';
  const systemPrompt = `You are a marketing strategist. Generate a compelling client case study in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "title": "string",
  "client": "string",
  "atAGlance": { "sector": "string", "challenge": "string", "result": "string" },
  "theChallenge": "string",
  "theSolution": "string",
  "theResults": ["string"],
  "clientQuote": { "text": "string", "speaker": "string" }
}

Focus on ROI and problem-solving impact.${toneInstruction}`;

  const userPrompt = `Generate a case study for "${input.projectTitle}" featuring client "${input.clientName}".
Challenge: ${input.challenge}
Solution: ${input.solution}
Results: ${input.results}`;

  return { systemPrompt, userPrompt };
}

export function buildJobDescriptionPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? `\n\nWrite the description in a ${tone} tone.` : '';
  const systemPrompt = `You are an expert HR consultant. Generate a professional job description in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "title": "string",
  "company": "string",
  "overview": "string",
  "responsibilities": ["string"],
  "qualifications": ["string"],
  "benefits": ["string"],
  "closing": "string"
}

Ensure the content is attractive to top talent and legally compliant.${toneInstruction}`;

  const userPrompt = `Generate a job description for "${input.jobTitle}" at "${input.companyName}".
Location: ${input.location}
Responsibilities: ${input.responsibilities}
Requirements: ${input.requirements}
Benefits: ${input.benefits || 'Standard competitive package'}`;

  return { systemPrompt, userPrompt };
}

export function buildCoverLetterPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone.` : '';
  const systemPrompt = `You are a career coach. Generate a professional cover letter in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "header": { "name": "string", "targetRole": "string", "company": "string" },
  "body": {
    "opening": "string",
    "background": "string",
    "whyThisCompany": "string",
    "closing": "string"
  }
}

Write persuasively and highlight value.${toneInstruction}`;

  const userPrompt = `Generate a cover letter for ${input.applicantName} applying for ${input.jobTitle} at ${input.companyName}.
Top Skills: ${input.keySkills}
Background: ${input.experienceSummary}`;

  return { systemPrompt, userPrompt };
}

export function buildSocialMediaPlanPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone.` : '';
  const systemPrompt = `You are a social media strategist. Generate a campaign post plan in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "campaign": "string",
  "strategy": "string",
  "posts": [
    { "platform": "string", "caption": "string", "visualSuggestion": "string", "hashtags": ["string"] }
  ]
}

Create engaging, platform-specific content.${toneInstruction}`;

  const userPrompt = `Generate a social media plan for "${input.campaignName}".
Platforms: ${input.platforms}
Audience: ${input.targetAudience}
Goals: ${input.goals}
Hashtags: ${input.keyHashtags}`;

  return { systemPrompt, userPrompt };
}

export function buildSOPPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone.` : '';
  const systemPrompt = `You are an operations expert. Generate a Standard Operating Procedure (SOP) in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "title": "string",
  "department": "string",
  "objective": "string",
  "steps": [
    { "stepNumber": number, "action": "string", "details": "string" }
  ],
  "complianceNotes": "string"
}

Use highly structured and clear language.${toneInstruction}`;

  const userPrompt = `Generate an SOP for "${input.procTitle}" in ${input.department}.
Objective: ${input.objective}
Instructions: ${input.steps}
Safety/Notes: ${input.safetyNotes}`;

  return { systemPrompt, userPrompt };
}

export function buildMeetingAgendaPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone.` : '';
  const systemPrompt = `You are a productivity consultant. Generate a structured meeting agenda in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "title": "string",
  "header": { "date": "string", "facilitator": "string" },
  "objective": "string",
  "items": [
    { "time": "string", "topic": "string", "owner": "string" }
  ],
  "preparation": ["string"]
}

Focus on outcome-driven agendas.${toneInstruction}`;

  const userPrompt = `Generate a meeting agenda for "${input.meetingTitle}".
Date/Time: ${input.date}
Facilitator: ${input.facilitator}
Objectives: ${input.objectives}
Items: ${input.agendaItems}`;

  return { systemPrompt, userPrompt };
}

// ========== NEW FREE TEMPLATES ==========

export function buildThankYouNotePrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone.` : '';
  const systemPrompt = `You are a professional writer. Generate a warm and professional thank you note in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "recipient": "string",
  "occasion": "string",
  "message": "string",
  "closing": "string",
  "sender": "string"
}
${toneInstruction}`;

  const userPrompt = `Generate a thank you note for ${input.recipientName}.
Occasion: ${input.occasion}
Personal Message/Context: ${input.personalMessage}
Sender: ${input.senderName}`;

  return { systemPrompt, userPrompt };
}

export function buildExpenseReportPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone for any descriptions.` : '';
  const systemPrompt = `You are a financial clerk. Generate a structured expense report in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "employee": "string",
  "department": "string",
  "period": "string",
  "items": [
    { "date": "string", "description": "string", "category": "string", "amount": number }
  ],
  "totalAmount": number,
  "notes": "string"
}

Calculate the totalAmount accurately.${toneInstruction}`;

  const userPrompt = `Generate an expense report for ${input.employeeName} in ${input.department}.
Period: ${input.reportPeriod}
Items: ${input.expenseItems}
Expected Total: ${input.totalAmount}`;

  return { systemPrompt, userPrompt };
}

export function buildDailyStandupPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone.` : '';
  const systemPrompt = `You are a project manager. Generate clear daily standup notes in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "date": "string",
  "team": "string",
  "completed": ["string"],
  "planned": ["string"],
  "blockers": ["string"]
}
${toneInstruction}`;

  const userPrompt = `Generate daily standup notes for ${input.teamName} on ${input.date}.
Completed Yesterday: ${input.completedYesterday}
Planned for Today: ${input.plannedToday}
Blockers: ${input.blockers}`;

  return { systemPrompt, userPrompt };
}

export function buildFeedbackFormPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone.` : '';
  const systemPrompt = `You are a talent development specialist. Generate a structured feedback document in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "feedbackType": "string",
  "recipient": "string",
  "context": "string",
  "observations": ["string"],
  "suggestions": ["string"],
  "conclusion": "string"
}
${toneInstruction}`;

  const userPrompt = `Generate feedback for ${input.recipient}.
Type: ${input.feedbackType}
Context: ${input.context}
Observations: ${input.observations}
Suggestions: ${input.suggestions}`;

  return { systemPrompt, userPrompt };
}

export function buildEventInvitationPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone.` : '';
  const systemPrompt = `You are an event coordinator. Generate a compelling event invitation in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "eventName": "string",
  "dateTime": "string",
  "venue": "string",
  "description": "string",
  "schedule": ["string"],
  "rsvpInfo": "string"
}
${toneInstruction}`;

  const userPrompt = `Generate an invitation for ${input.eventName}.
Date/Time: ${input.eventDate}
Venue: ${input.venue}
Description: ${input.description}
RSVP: ${input.rsvpDetails}`;

  return { systemPrompt, userPrompt };
}

// ========== NEW STARTER TEMPLATES ==========

export function buildOnboardingChecklistPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone.` : '';
  const systemPrompt = `You are an HR manager. Generate a professional onboarding checklist in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "employeeName": "string",
  "startDate": "string",
  "department": "string",
  "manager": "string",
  "phases": [
    { "title": "string", "tasks": ["string"] }
  ]
}
${toneInstruction}`;

  const userPrompt = `Generate an onboarding checklist for ${input.employeeName} starting on ${input.startDate}.
Department: ${input.department}
Manager: ${input.managerName}
Key Tasks: ${input.checklistItems}`;

  return { systemPrompt, userPrompt };
}

export function buildPerformanceReviewPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone.` : '';
  const systemPrompt = `You are a manager conducting a performance review. Generate a professional review document in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "employee": "string",
  "period": "string",
  "summary": "string",
  "achievements": ["string"],
  "developmentAreas": ["string"],
  "goals": ["string"],
  "rating": "string"
}
${toneInstruction}`;

  const userPrompt = `Generate a performance review for ${input.employeeName} for ${input.reviewPeriod}.
Accomplishments: ${input.accomplishments}
Improvement Areas: ${input.areasForImprovement}
Goals: ${input.goals}
Rating: ${input.overallRating}`;

  return { systemPrompt, userPrompt };
}

export function buildTrainingManualPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone.` : '';
  const systemPrompt = `You are a technical writer. Generate a structured training manual in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "title": "string",
  "audience": "string",
  "objectives": ["string"],
  "modules": [
    { "title": "string", "content": ["string"] }
  ],
  "assessment": "string"
}
${toneInstruction}`;

  const userPrompt = `Generate a training manual for ${input.trainingTitle}.
Audience: ${input.targetAudience}
Objectives: ${input.objectives}
Content Details: ${input.content}
Assessment: ${input.assessmentCriteria}`;

  return { systemPrompt, userPrompt };
}

export function buildIncidentReportPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone.` : '';
  const systemPrompt = `You are a safety officer. Generate a detailed incident report in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "header": { "date": "string", "location": "string", "reportedBy": "string" },
  "description": "string",
  "timeline": ["string"],
  "actionsTaken": ["string"],
  "witnesses": ["string"],
  "followUp": "string"
}
${toneInstruction}`;

  const userPrompt = `Generate an incident report for an event on ${input.incidentDate} at ${input.location}.
Reported By: ${input.reportedBy}
Description: ${input.description}
Actions: ${input.actionsTaken}
Witnesses: ${input.witnesses}`;

  return { systemPrompt, userPrompt };
}

export function buildQuarterlyGoalsPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone.` : '';
  const systemPrompt = `You are a strategic planner. Generate a quarterly goals document in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "quarter": "string",
  "department": "string",
  "objectives": [
    { "title": "string", "keyResults": ["string"] }
  ],
  "dependencies": ["string"]
}
${toneInstruction}`;

  const userPrompt = `Generate quarterly goals for ${input.quarter}.
Department: ${input.department}
Objectives: ${input.objectives}
Key Results: ${input.keyResults}
Dependencies: ${input.dependencies}`;

  return { systemPrompt, userPrompt };
}

// ========== NEW PRO TEMPLATES ==========

export function buildWhitePaperPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Write in a ${tone} tone.` : '';
  const systemPrompt = `You are a thought leader and technical expert. Generate a high-impact technical white paper in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "title": "string",
  "abstract": "string",
  "introduction": "string",
  "problemStatement": "string",
  "solutionOverview": "string",
  "technicalDeepDive": [
    { "heading": "string", "content": ["string"] }
  ],
  "conclusion": "string",
  "references": ["string"]
}
${toneInstruction}`;

  const userPrompt = `Generate a white paper for "${input.title}".
Abstract/Topic: ${input.abstract}
Problem: ${input.problemStatement}
Solution: ${input.proposedSolution}
Conclusion: ${input.conclusion}`;

  return { systemPrompt, userPrompt };
}

export function buildRFPResponsePrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Write in a ${tone} tone.` : '';
  const systemPrompt = `You are a professional bid manager. Generate a winning RFP response in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "rfpTitle": "string",
  "responder": "string",
  "executiveSummary": "string",
  "technicalProposal": [
    { "requirement": "string", "response": "string" }
  ],
  "pricing": { "total": "string", "details": ["string"] },
  "timeline": "string",
  "whyUs": ["string"]
}
${toneInstruction}`;

  const userPrompt = `Generate an RFP response for "${input.rfpTitle}" from "${input.companyName}".
Executive Summary: ${input.executiveSummary}
Approach: ${input.technicalApproach}
Pricing: ${input.pricing}
Timeline: ${input.timeline}`;

  return { systemPrompt, userPrompt };
}

export function buildExecutiveSummarySliderPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone.` : '';
  const systemPrompt = `You are an executive assistant. Generate a high-level executive summary in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "title": "string",
  "purpose": "string",
  "keyHighlights": ["string"],
  "financialImpact": "string",
  "strategicRecommendations": ["string"],
  "nextSteps": ["string"]
}
${toneInstruction}`;

  const userPrompt = `Generate an executive summary for "${input.title}".
Purpose: ${input.purpose}
Findings: ${input.keyFindings}
Recommendations: ${input.recommendations}
Next Steps: ${input.nextSteps}`;

  return { systemPrompt, userPrompt };
}

export function buildBusinessPlanPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Write in a ${tone} tone.` : '';
  const systemPrompt = `You are a startup consultant and venture capitalist. Generate a comprehensive business plan in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "company": "string",
  "mission": "string",
  "marketOpportunity": "string",
  "productService": "string",
  "marketingStrategy": "string",
  "opsPlan": "string",
  "financials": { "projections": "string", "fundingNeeds": "string" },
  "team": "string"
}
${toneInstruction}`;

  const userPrompt = `Generate a business plan for "${input.companyName}".
Mission: ${input.missionStatement}
Market: ${input.marketAnalysis}
Products: ${input.productsServices}
Financials: ${input.financialProjections}
Funding: ${input.fundingNeeds}`;

  return { systemPrompt, userPrompt };
}

export function buildSWOTAnalysisPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone.` : '';
  const systemPrompt = `You are a strategic analyst. Generate a detailed SWOT analysis in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "subject": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "opportunities": ["string"],
  "threats": ["string"],
  "strategicImplications": "string"
}
${toneInstruction}`;

  const userPrompt = `Generate a SWOT analysis for "${input.subject}".
Strengths: ${input.strengths}
Weaknesses: ${input.weaknesses}
Opportunities: ${input.opportunities}
Threats: ${input.threats}`;

  return { systemPrompt, userPrompt };
}

// ========== NEW ENTERPRISE TEMPLATES ==========

export function buildAnnualReportPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Write in a ${tone} tone.` : '';
  const systemPrompt = `You are a corporate communications expert. Generate a structured annual report in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "company": "string",
  "fiscalYear": "string",
  "ceoLetter": "string",
  "highlights": ["string"],
  "financialReview": "string",
  "operationalAchievements": ["string"],
  "riskManagement": "string",
  "outlook": "string"
}
${toneInstruction}`;

  const userPrompt = `Generate an annual report for "${input.companyName}" for ${input.fiscalYear}.
CEO Letter: ${input.ceoLetter}
Financials: ${input.financialHighlights}
Ops: ${input.operationalReview}
Future: ${input.futureOutlook}`;

  return { systemPrompt, userPrompt };
}

export function buildBoardPresentationPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone.` : '';
  const systemPrompt = `You are a corporate strategist. Generate a board-level presentation deck in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "date": "string",
  "presenter": "string",
  "agenda": ["string"],
  "metrics": [
    { "label": "string", "value": "string", "trend": "string" }
  ],
  "strategicUpdates": ["string"],
  "boardDecisions": ["string"]
}
${toneInstruction}`;

  const userPrompt = `Generate a board presentation for ${input.meetingDate}.
Presenter: ${input.presenter}
Agenda: ${input.agendaTopics}
Metrics: ${input.keyMetrics}
Updates: ${input.strategicUpdates}
Decisions: ${input.decisionsRequired}`;

  return { systemPrompt, userPrompt };
}

export function buildComplianceAuditPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone.` : '';
  const systemPrompt = `You are a compliance auditor. Generate a detailed compliance audit report in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "title": "string",
  "period": "string",
  "scope": "string",
  "findings": [
    { "issue": "string", "severity": "High|Medium|Low", "description": "string" }
  ],
  "recommendations": ["string"],
  "riskLevel": "string"
}
${toneInstruction}`;

  const userPrompt = `Generate a compliance audit report titled "${input.auditTitle}".
Period: ${input.auditPeriod}
Scope: ${input.scope}
Findings: ${input.findings}
Recommendations: ${input.recommendations}
Risk: ${input.riskLevel}`;

  return { systemPrompt, userPrompt };
}

export function buildMergerProposalPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Write in a ${tone} tone.` : '';
  const systemPrompt = `You are an M&A advisor. Generate a professional merger proposal in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "target": "string",
  "acquirer": "string",
  "strategicRationale": "string",
  "valuationBasis": "string",
  "offerTerms": "string",
  "integrationPlan": ["string"],
  "riskAnalysis": ["string"]
}
${toneInstruction}`;

  const userPrompt = `Generate a merger proposal for "${input.targetCompany}" by "${input.acquiringCompany}".
Rationale: ${input.strategicRationale}
Valuation: ${input.valuation}
Integration: ${input.integrationPlan}
Risks: ${input.riskFactors}`;

  return { systemPrompt, userPrompt };
}

export function buildInvestorPitchPrompt(input: any, tone?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const toneInstruction = tone ? ` Use a ${tone} tone.` : '';
  const systemPrompt = `You are a venture capitalist. Generate a high-impact investor pitch deck in JSON format.
Respond ONLY with a valid JSON object.

Structure:
{
  "company": "string",
  "tagline": "string",
  "problem": "string",
  "solution": "string",
  "marketSize": "string",
  "businessModel": "string",
  "traction": ["string"],
  "ask": "string"
}
${toneInstruction}`;

  const userPrompt = `Generate an investor pitch for "${input.companyName}".
Tagline: ${input.tagline}
Problem: ${input.problem}
Solution: ${input.solution}
Market: ${input.marketSize}
Model: ${input.businessModel}
Ask: ${input.askAmount}`;

  return { systemPrompt, userPrompt };
}

/**
 * Helper function to get prompts for any template type
 */
export function buildPromptForTemplate(
  templateType: string,
  input: any,
  tone?: string
): { systemPrompt: string; userPrompt: string } {
  switch (templateType.toUpperCase()) {
    case 'INVOICE':
      return applyPhilippinesContext(buildInvoicePrompt(input, tone));
    case 'REPORT':
      return applyPhilippinesContext(buildReportPrompt(input, tone));
    case 'MEMO':
      return applyPhilippinesContext(buildMemoPrompt(input, tone));
    case 'CONTENT':
      return applyPhilippinesContext(buildContentPrompt(input, tone));
    case 'PRESENTATION':
      return applyPhilippinesContext(buildPresentationPrompt(input, tone));
    case 'RESUME':
      return applyPhilippinesContext(buildResumePrompt(input, tone));
    case 'LEGAL_CONTRACT':
      return applyPhilippinesContext(buildContractPrompt(input, tone));
    case 'NEWSLETTER':
      return applyPhilippinesContext(buildNewsletterPrompt(input, tone));
    case 'MEETING_MINUTES':
      return applyPhilippinesContext(buildMeetingMinutesPrompt(input, tone));
    case 'PROJECT_PROPOSAL':
      return applyPhilippinesContext(buildProposalPrompt(input, tone));
    case 'PRODUCT_SPEC':
      return applyPhilippinesContext(buildPRDPrompt(input, tone));
    case 'PRESS_RELEASE':
      return applyPhilippinesContext(buildPressReleasePrompt(input, tone));
    case 'CASE_STUDY':
      return applyPhilippinesContext(buildCaseStudyPrompt(input, tone));
    case 'JOB_DESCRIPTION':
      return applyPhilippinesContext(buildJobDescriptionPrompt(input, tone));
    case 'COVER_LETTER':
      return applyPhilippinesContext(buildCoverLetterPrompt(input, tone));
    case 'SOCIAL_MEDIA_PLAN':
      return applyPhilippinesContext(buildSocialMediaPlanPrompt(input, tone));
    case 'SOP':
      return applyPhilippinesContext(buildSOPPrompt(input, tone));
    case 'MEETING_AGENDA':
      return applyPhilippinesContext(buildMeetingAgendaPrompt(input, tone));
    // New FREE templates
    case 'THANK_YOU_NOTE':
      return applyPhilippinesContext(buildThankYouNotePrompt(input, tone));
    case 'EXPENSE_REPORT':
      return applyPhilippinesContext(buildExpenseReportPrompt(input, tone));
    case 'DAILY_STANDUP':
      return applyPhilippinesContext(buildDailyStandupPrompt(input, tone));
    case 'FEEDBACK_FORM':
      return applyPhilippinesContext(buildFeedbackFormPrompt(input, tone));
    case 'EVENT_INVITATION':
      return applyPhilippinesContext(buildEventInvitationPrompt(input, tone));
    // New STARTER templates
    case 'ONBOARDING_CHECKLIST':
      return applyPhilippinesContext(buildOnboardingChecklistPrompt(input, tone));
    case 'PERFORMANCE_REVIEW':
      return applyPhilippinesContext(buildPerformanceReviewPrompt(input, tone));
    case 'TRAINING_MANUAL':
      return applyPhilippinesContext(buildTrainingManualPrompt(input, tone));
    case 'INCIDENT_REPORT':
      return applyPhilippinesContext(buildIncidentReportPrompt(input, tone));
    case 'QUARTERLY_GOALS':
      return applyPhilippinesContext(buildQuarterlyGoalsPrompt(input, tone));
    // New PRO templates
    case 'WHITE_PAPER':
      return applyPhilippinesContext(buildWhitePaperPrompt(input, tone));
    case 'RFP_RESPONSE':
      return applyPhilippinesContext(buildRFPResponsePrompt(input, tone));
    case 'EXECUTIVE_SUMMARY':
      return applyPhilippinesContext(buildExecutiveSummarySliderPrompt(input, tone));
    case 'BUSINESS_PLAN':
      return applyPhilippinesContext(buildBusinessPlanPrompt(input, tone));
    case 'SWOT_ANALYSIS':
      return applyPhilippinesContext(buildSWOTAnalysisPrompt(input, tone));
    // New ENTERPRISE templates
    case 'ANNUAL_REPORT':
      return applyPhilippinesContext(buildAnnualReportPrompt(input, tone));
    case 'BOARD_PRESENTATION':
      return applyPhilippinesContext(buildBoardPresentationPrompt(input, tone));
    case 'COMPLIANCE_AUDIT':
      return applyPhilippinesContext(buildComplianceAuditPrompt(input, tone));
    case 'MERGER_PROPOSAL':
      return applyPhilippinesContext(buildMergerProposalPrompt(input, tone));
    case 'INVESTOR_PITCH':
      return applyPhilippinesContext(buildInvestorPitchPrompt(input, tone));
    default:
      throw new Error(`No prompt builder for template type: ${templateType}`);
  }
}
