"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateDocument } from "@/app/actions/generate-document";
import { getTemplates } from "@/app/actions/get-templates";
import { getSubscription } from "@/app/actions/get-subscription";
import SmartSuggestions from "./smart-suggestions";
import TemplateBrowser from "./template-browser";
import DynamicTemplateForm from "./dynamic-form";
import {
  isTemplateLocked,
  getTemplateTier,
  TEMPLATE_CATEGORIES,
} from "@/lib/templates";

export default function GeneratePage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [format, setFormat] = useState<"DOCX" | "PDF" | "XLSX">("DOCX");
  const [tone, setTone] = useState<string>("");
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState<any>(null);
  const [step, setStep] = useState(1); // 1: Select, 2: Configure
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesLoadError, setTemplatesLoadError] = useState("");

  // Fetch templates and session on mount
  useEffect(() => {
    async function init() {
      try {
        setTemplatesLoading(true);
        setTemplatesLoadError("");

        const [templatesResult, subResult] = await Promise.all([
          getTemplates(),
          getSubscription(),
        ]);

        if (templatesResult.success && templatesResult.templates) {
          setTemplates(templatesResult.templates);
        } else {
          setTemplates([]);
          setTemplatesLoadError(
            templatesResult.error || "Failed to load templates.",
          );
        }

        if (subResult.success) {
          setSubscription(subResult.subscription);
        }
      } catch {
        setTemplates([]);
        setTemplatesLoadError("Failed to load templates.");
      } finally {
        setTemplatesLoading(false);
      }
    }
    init();
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setFormData({});
    setStep(2);
  };

  const goBack = () => {
    setStep(1);
    setSelectedTemplate("");
  };

  // ... autoFillTemplate stays the same ...
  // (skipping for brevity in this chunk, but keeping it in the file)

  // Auto-fill sample data for templates
  const autoFillTemplate = () => {
    const today = new Date().toISOString().split("T")[0];
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    if (templateType === "INVOICE") {
      setFormData({
        clientName: "Acme Corporation",
        clientAddress: "Unit 1204 Ayala Avenue, Makati City 1226, Philippines",
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        invoiceDate: today,
        dueDate: futureDate,
        itemsText:
          "Web Development Services\nUI/UX Design\nConsulting & Strategy",
        items: [
          { description: "Web Development Services" },
          { description: "UI/UX Design" },
          { description: "Consulting & Strategy" },
        ],
      });
    } else if (templateType === "REPORT") {
      setFormData({
        title: "Q1 2024 Performance Report",
        dateRange: "January - March 2024",
        department: "Sales & Marketing",
        keyPointsText:
          "Revenue increased by 15%\nCustomer satisfaction improved to 92%\nNew product launch exceeded targets",
        keyPoints: [
          "Revenue increased by 15%",
          "Customer satisfaction improved to 92%",
          "New product launch exceeded targets",
        ],
      });
    } else if (templateType === "MEMO") {
      setFormData({
        to: "All Staff",
        from: "Management Team",
        date: today,
        subject: "Updated Remote Work Policy",
        message:
          "We are pleased to announce updates to our remote work policy. Effective immediately, all employees will have the option to work remotely up to 3 days per week. Please review the full policy document on the company intranet.",
      });
    } else if (templateType === "CONTENT") {
      setFormData({
        title: "The Future of AI in Enterprise",
        topic: "Generative AI and Business Productivity",
        targetAudience: "CTOs and Business Leaders",
        tone: "Professional and Visionary",
        keyPointsText:
          "AI doubles developer productivity\nReducing operational costs with LLMs\nEthical considerations in AI deployment",
        keyPoints: [
          "AI doubles developer productivity",
          "Reducing operational costs with LLMs",
          "Ethical considerations in AI deployment",
        ],
      });
    } else if (templateType === "PRESENTATION") {
      setFormData({
        topic: "Product Roadmap 2024",
        targetAudience: "Internal Stakeholders",
        presentationStyle: "Professional & Modern",
        keyMessage:
          "Scaling our operations while maintaining world-class quality.",
      });
    } else if (templateType === "RESUME") {
      setFormData({
        fullName: "Alex Rivera",
        contactInfo:
          "alex.rivera@example.com | +63 917 123 4567 | Quezon City, Philippines",
        skillsText:
          "Expertise: React, TypeScript, Next.js, Node.js, GraphQL, AWS (Lambda, S3), Docker, CI/CD, Agile Methodologies, System Architecture",
        experienceText:
          "Lead Software Engineer at TechSync Systems (2021-Present)\n- Orchestrated the migration of a monolithic frontend to a micro-frontend architecture using Next.js, reducing bundle size by 60%.\n- Established a global design system adoption across 12 teams, ensuring 100% UI consistency.\n- Improved CI/CD pipelines increasing deployment frequency by 3x.\n\nSenior Web Developer at InnovateSoft Labs (2018-2021)\n- Developed high-performance real-time data visualization dashboards for major Philippine enterprise clients.\n- Optimized data fetching layers reducing API latency by 45%.\n- Led a team of 4 junior developers, providing mentorship and architectural guidance.",
        educationText:
          "Master of Science in Computer Science\nStanford University (2016-2018)\n- Focus on Distributed Systems and Software Engineering\n\nBachelor of Science in Engineering\nUC Berkeley (2012-2016)\n- Dean's List for 6 semesters",
      });
    } else if (templateType === "LEGAL_CONTRACT") {
      setFormData({
        serviceProvider: "Creative Mind Solutions LLC",
        clientName: "Global Retail Ventures Inc.",
        servicesDescription:
          "The Service Provider will provide comprehensive Digital Marketing services, including but not limited to:\n1. Search Engine Optimization (SEO)\n2. Social Media Management\n3. Bi-weekly performance reporting\n4. Content creation for company blog",
        paymentTerms:
          "₱250,000 monthly retainer, payable within 15 days of invoice date.",
        governingLaw: "Republic of the Philippines",
      });
    } else if (templateType === "NEWSLETTER") {
      setFormData({
        title: "The Tech Pulse - February Edition",
        issueDate: "February 15, 2024",
        mainStory: "Launching the DocuAI Enterprise Module",
        contentPoints:
          "New AI features for bulk document generation\nSecurity enhancements for enterprise users\nCustomer Spotlight: How Acme Corp saved 200 hours/month\nTips from the team: Mastering prompt engineering",
        upcomingEvents:
          "Webinar: The Future of Document Automation (Feb 22)\nCommunity Hackathon starts March 1st\nAnnual User Conference - Save the date (June 10-12)",
      });
    } else if (templateType === "MEETING_MINUTES") {
      setFormData({
        meetingTitle: "Monthly Product Strategy Sync",
        meetingDate: today,
        attendeesText:
          "Sarah Johnson (Product Lead)\nDavid Chen (Engineering)\nMaria Garcia (Design)\nTom Wilson (Marketing)",
        agendaText:
          "Review Q1 Roadmap progress\nDiscuss upcoming UI redesign\nResource allocation for Mobile App project",
        discussionText:
          "Sarah shared that the Roadmap is 80% complete for Q1. \nMaria presented the new glassmorphism UI mockups, which were well received. \nDavid raised concerns about backend scalability for the Mobile App API; agreed to conduct a load test next week.",
        actionItemsText:
          "David - Conduct API load test by Friday\nMaria - Share final design assets in Figma by Wednesday\nTom - Prepare marketing teaser for the redesign by end of month",
      });
    } else if (templateType === "PROJECT_PROPOSAL") {
      setFormData({
        title: "Enterprise AI Implementation Project",
        client: "Global Finance Corp",
        budget: "₱4,200,000",
        goalsText:
          "Implement AI-powered risk assessment\nReduce processing time by 40%\nEnsure 100% compliance with financial regulations",
        scopeText:
          "AI Model Development: Custom BERT-based risk engine\nInfrastructure: AWS SageMaker deployment\nSupport: 12 months post-launch technical support",
        timelineText:
          "Phase 1 - Discovery (2 weeks)\nPhase 2 - Model Training (6 weeks)\nPhase 3 - Integration (4 weeks)\nPhase 4 - UAT & Launch (2 weeks)",
        callToAction:
          "We are ready to begin work immediately upon signed authorization. Contact us at partners@docuai.com to finalize the start date.",
      });
    } else if (templateType === "PRODUCT_SPEC") {
      setFormData({
        productName: "DocuAI Mobile (iOS & Android)",
        objectivesText:
          "Mobile accessibility for document generation\nOffline document viewing capabilities\nBiometric security integration",
        userStoriesText: `As a road warrior, I need to generate an invoice on my phone so that I can bill clients immediately after meetings.\nAs a manager, I need to approve document drafts on the go so that my team isn't blocked.`,
        functionalRequirementsText:
          "Requirement 1: Push notifications for generation status\nRequirement 2: Biometric (FaceID/TouchID) lock\nRequirement 3: PDF previewer with annotation support",
        successMetricsText:
          "10,000 active mobile users\n35% of total document generations occurring via mobile\n4.8+ rating in the App Store",
      });
    } else if (templateType === "PRESS_RELEASE") {
      setFormData({
        headline:
          "DocuAI Secures ₱1.1B Series B to Expand Philippine Enterprise AI",
        subheadline:
          "Investment to accelerate AI research and expand global enterprise footprint",
        locationDate: "Makati City, Philippines - February 20, 2024",
        lead: "DocuAI, the leader in generative AI for business documents, today announced it has closed a ₱1.1 billion Series B round led by local and regional investors.",
        bodyText:
          'The funding will be used to double the engineering team and launch "DocuAI Insights," a new predictive analytics engine for compliance.\nOver the last year, DocuAI has seen 400% revenue growth as enterprises seek to automate repetitive administrative tasks.',
        quote1Text:
          '"This funding validates our vision that the future of work is not just writing, but generating structured, compliant knowledge," said Jane Smith, CEO of DocuAI.',
        partnerQuoteText:
          '"DocuAI has the most advanced prompt-to-PDF pipeline we have ever seen," noted Mark Thompson, Partner at Vertex Ventures.',
        boilerplate:
          'DocuAI is the first "Prompt-to-Document" platform designed for highly regulated industries. Founded in 2022, it helps Philippine enterprises automate document lifecycles.',
        contact: "Press Team: press@docuai.com | (555) 987-6543",
      });
    } else if (templateType === "CASE_STUDY") {
      setFormData({
        projectTitle: "Scaling TechHire Operations with DocuAI",
        client: "TechHire Solutions",
        sector: "Human Resources / Staffing",
        challenge:
          "TechHire was spending 40 hours per week manually formatting resumes and job offers.",
        result:
          "Reduced document turnaround time by 90% and saved ₱680,000/month in admin costs.",
        theChallenge:
          "As TechHire grew from 10 to 100 recruiters, the lack of standardized document templates lead to brand inconsistency and slow client responses. Manual data entry for every candidate was prone to errors.",
        theSolution: `TechHire implemented DocuAI's "Resume" and "Legal Contract" templates integrated directly with their ATS. Recruiters now generate branded candidate profiles in seconds using the Magic Auto-fill feature.`,
        theResultsText:
          "90% reduction in document prep time\nZero branding errors in Q4\nRecipient open rate increased by 22% due to improved professional layout",
        clientQuote:
          '"DocuAI has changed our operational DNA. We don\'t write anymore, we just generate and review." - Sarah Jones, COO of TechHire',
      });
    } else if (templateType === "JOB_DESCRIPTION") {
      setFormData({
        jobTitle: "Senior Full Stack Developer (React/Node.js)",
        companyName: "DocuAI Philippines",
        location: "Makati City, Philippines (Hybrid)",
        responsibilities:
          "Lead the development of generative AI document pipelines\nArchitect scalable React frontends using Next.js\nMentor junior developers and conduct code reviews\nCollaborate with product designers to create premium UX",
        requirements:
          "5+ years experience with React and Node.js\nStrong grasp of TypeScript and Prisma ORM\nExperience with AI/LLM integration is a plus\nBachelor's degree in Computer Science or related field",
        benefits:
          "Competitive salary in PHP\nHealth insurance & life insurance\nPerformance bonuses based on token efficiency\nAnnual training budget for AI research",
      });
    } else if (templateType === "COVER_LETTER") {
      setFormData({
        applicantName: "Juan Dela Cruz",
        jobTitle: "Lead Software Engineer",
        companyName: "Cloud Solutions PH, Inc.",
        keySkills:
          "Cloud Architecture, Team Leadership, Full-Stack Development",
        experienceSummary:
          "I have over 8 years of experience building scalable enterprise applications. In my previous role at TechFlow, I led a team of 12 engineers to deliver a high-traffic SaaS platform that processed millions of transactions per day.",
      });
    } else if (templateType === "SOCIAL_MEDIA_PLAN") {
      setFormData({
        campaignName: "DocuAI Summer Launch 2024",
        platforms: "Instagram, LinkedIn, Twitter",
        targetAudience: "Small business owners and freelancers in SEA",
        goals:
          'Increase brand awareness for the new Starter tier\nDrive 1,000 new signups from the Philippines\nShowcase "Magic Auto-fill" efficiency',
        keyHashtags: "#DocuAI #Productivity #StartupPH #FutureOfWork",
      });
    } else if (templateType === "SOP") {
      setFormData({
        procTitle: "Employee Onboarding Process",
        department: "Human Resources",
        objective:
          "To ensure every new hire has a seamless integration into the company and receives all necessary tools and access on day one.",
        steps:
          "Step 1: HR creates employee profile in the portal\nStep 2: IT provisions laptop and creates email/Slack access\nStep 3: Direct supervisor schedules introductory 1-on-1\nStep 4: Admin issues building access card and welcome kit",
        safetyNotes:
          "Compliance: Ensure all NDA and employment contracts are signed before system access is granted.",
      });
    } else if (templateType === "MEETING_AGENDA") {
      setFormData({
        meetingTitle: "Monthly Operations Review",
        date: "February 20, 2024 at 10:00 AM PHT",
        facilitator: "Maria Santos, COO",
        objectives:
          "Review Q1 performance metrics\nDiscuss bottleneck in document generation latency\nAlign on marketing budget for PHP expansion",
        agendaItems:
          "1. Welcome & Icebreaker (5 mins)\n2. Performance Dashboards Review (15 mins)\n3. Technical Latency deep-dive (20 mins)\n4. Q&A and Action Items (10 mins)",
      });
    }
    // ========== NEW FREE TEMPLATES ==========
    else if (templateType === "THANK_YOU_NOTE") {
      setFormData({
        recipientName: "Sarah Chen",
        occasion: "Successful Project Collaboration",
        personalMessage:
          "I wanted to express my sincere gratitude for your outstanding work on the DocuAI integration project. Your attention to detail and commitment to excellence made a significant difference in our delivery timeline. It was a pleasure working with you, and I look forward to future collaborations.",
        senderName: "Michael Torres",
      });
    } else if (templateType === "EXPENSE_REPORT") {
      setFormData({
        employeeName: "Jessica Reyes",
        department: "Sales & Business Development",
        reportPeriod: "January 15-31, 2024",
        expenseItems:
          "Client dinner in BGC - ₱8,200\nGrab rides (5 trips) - ₱2,450\nConference registration fee - ₱16,900\nOffice supplies - ₱2,600\nParking at client site - ₱1,350",
        totalAmount: "₱31,500",
      });
    } else if (templateType === "DAILY_STANDUP") {
      setFormData({
        date: today,
        teamName: "Frontend Engineering Team",
        completedYesterday:
          "Completed the template browser redesign\nFixed pagination bug in document library\nReviewed PRs for authentication module",
        plannedToday:
          "Implement dark mode for new components\nStart work on mobile responsive layout\nPair programming session with junior dev",
        blockers:
          "Waiting for API documentation from backend team\nNeed design assets for new icons",
      });
    } else if (templateType === "FEEDBACK_FORM") {
      setFormData({
        feedbackType: "Constructive Improvement",
        recipient: "David Kim, Junior Developer",
        context:
          "Recent sprint where David worked on the user authentication flow. This was his first major feature implementation on the team.",
        observations:
          "Code quality was good with proper error handling. Showed initiative by adding unit tests unprompted. Communication during daily standups was clear and concise. Some opportunities for improvement in time estimation - the feature took 3 days instead of estimated 1 day.",
        suggestions:
          "Consider breaking down larger tasks into smaller deliverables\nSchedule mid-sprint check-ins for complex features\nPair with senior developers on estimation exercises",
      });
    } else if (templateType === "EVENT_INVITATION") {
      setFormData({
        eventName: "DocuAI Annual Team Summit 2024",
        eventDate: "March 15, 2024 at 6:00 PM PHT",
        venue: "The Grand Ballroom, Marriott Hotel, Makati City",
        description:
          "Join us for an evening of celebration, networking, and inspiration as we mark another year of innovation! The event will feature keynote presentations, team awards, and a gourmet dinner. Dress code: Smart casual.",
        rsvpDetails:
          "Please RSVP by March 10th to events@docuai.com. Plus ones are welcome.",
      });
    }
    // ========== NEW STARTER TEMPLATES ==========
    else if (templateType === "ONBOARDING_CHECKLIST") {
      setFormData({
        employeeName: "Emily Rodriguez",
        startDate: futureDate,
        department: "Product Design",
        managerName: "James Chen, Design Lead",
        checklistItems:
          "Complete HR paperwork and tax forms\nSet up company email and Slack\nReview employee handbook\nAttend IT orientation for security protocols\nMeet with direct manager for 30-day goals\nJoin team lunch on first day\nComplete compliance training modules\nSet up development environment\nReview current design system documentation\nSchedule 1-on-1s with key stakeholders",
      });
    } else if (templateType === "PERFORMANCE_REVIEW") {
      setFormData({
        employeeName: "Marcus Thompson",
        reviewPeriod: "Q4 2023 (October - December)",
        accomplishments:
          "Led the successful launch of the mobile app MVP\nMentored 2 junior developers who are now contributing independently\nReduced API response times by 40% through optimization\nReceived positive feedback from 3 enterprise clients",
        areasForImprovement:
          "Documentation could be more thorough for complex features\nTime management during high-pressure situations\nMore proactive communication when blockers arise",
        goals:
          "Complete AWS Solutions Architect certification\nLead the Q2 infrastructure modernization project\nDevelop and deliver an internal tech talk on performance optimization",
        overallRating: "Exceeds Expectations (4/5)",
      });
    } else if (templateType === "TRAINING_MANUAL") {
      setFormData({
        trainingTitle: "DocuAI Platform Administrator Training",
        targetAudience: "New administrators and power users",
        objectives:
          "Understand the core architecture of DocuAI\nLearn to configure templates and user permissions\nMaster troubleshooting common issues\nBe able to generate reports and analytics",
        content:
          "Module 1: Platform Overview (1 hour)\n- System architecture and components\n- User roles and permissions\n\nModule 2: Template Management (2 hours)\n- Creating and editing templates\n- Field configuration and validation\n- Testing templates before publishing\n\nModule 3: User Administration (1 hour)\n- Adding and managing users\n- Setting up teams and workspaces\n- Audit logs and compliance\n\nModule 4: Troubleshooting (1 hour)\n- Common error messages and solutions\n- When to escalate to support\n- Performance optimization tips",
        assessmentCriteria:
          "Complete hands-on lab exercises\nPass online quiz with 80% or higher\nSuccessfully configure a sample template",
      });
    } else if (templateType === "INCIDENT_REPORT") {
      setFormData({
        incidentDate: `${today} at 2:30 PM`,
        location: "Server Room B, 3rd Floor, Main Office",
        reportedBy: "Robert Chen, IT Operations",
        description:
          "During routine maintenance, a brief power fluctuation caused server rack 3 to restart unexpectedly. The UPS system engaged properly but two servers (SRV-PROD-03 and SRV-PROD-04) required manual intervention to come back online. Total downtime was approximately 15 minutes.",
        actionsTaken:
          "Immediately notified on-call team\nManually restarted affected servers\nVerified all services returned to normal operation\nDocumented affected systems in monitoring dashboard\nScheduled follow-up with facilities team for UPS inspection",
        witnesses: "Anna Lee (IT Support), David Park (Facilities)",
      });
    } else if (templateType === "QUARTERLY_GOALS") {
      setFormData({
        quarter: "Q2 2024",
        department: "Engineering Team",
        objectives:
          "Launch mobile app v2.0 with offline mode\nAchieve 99.9% uptime SLA for production systems\nReduce customer-reported bugs by 30%\nComplete SOC 2 Type II compliance preparation",
        keyResults:
          "Mobile app downloads: 10,000+ in first month\nP0/P1 incidents: <2 per month\nBug resolution time: <48 hours average\nAll compliance documentation submitted by June 15",
        dependencies:
          "Design team to deliver mobile assets by April 15\nSecurity audit scheduled for May\nAWS cost approval for new infrastructure\nHiring 2 additional QA engineers",
      });
    }
    // ========== NEW PRO TEMPLATES ==========
    else if (templateType === "WHITE_PAPER") {
      setFormData({
        title: "The Future of AI-Powered Document Generation in Enterprise",
        abstract:
          "This white paper explores how generative AI is transforming enterprise document workflows. We examine current challenges in document creation, the capabilities of modern AI systems, and provide a framework for evaluating and implementing AI document solutions. Our research indicates that organizations can reduce document creation time by 70% while improving consistency and compliance.",
        problemStatement:
          "Enterprise organizations create millions of documents annually - contracts, reports, proposals, and communications. Traditional approaches rely heavily on manual effort, leading to inconsistencies, compliance risks, and significant time investment. Studies show that knowledge workers spend 30% of their time on document-related tasks.",
        proposedSolution:
          "AI-powered document generation platforms leverage large language models to automate content creation while maintaining organizational standards. Key capabilities include template-based generation, brand consistency enforcement, multi-format output, and integration with existing workflows. Our platform demonstrates these capabilities with enterprise-grade security and compliance features.",
        conclusion:
          "Organizations adopting AI document generation report significant ROI within the first year. We recommend a phased implementation approach starting with high-volume, standardized documents. Key success factors include executive sponsorship, change management, and continuous feedback loops with end users.",
      });
    } else if (templateType === "RFP_RESPONSE") {
      setFormData({
        rfpTitle: "Enterprise Document Management System Implementation",
        companyName: "DocuAI Philippines",
        executiveSummary:
          "DocuAI Philippines is pleased to submit this proposal for the Enterprise Document Management System Implementation. With 5 years of experience serving leading Philippine enterprises and a 98% customer satisfaction rate, we are uniquely positioned to deliver a solution that exceeds your requirements.",
        technicalApproach:
          "Our implementation will follow an agile methodology with bi-weekly sprints and continuous stakeholder engagement. We will leverage our proven platform architecture with custom integrations for your existing systems. Key phases include Discovery (2 weeks), Configuration (4 weeks), Integration (4 weeks), Testing (2 weeks), and Go-Live (1 week).",
        pricing:
          "Implementation Services: ₱4,200,000\nAnnual Platform License: ₱2,700,000\nTraining & Change Management: ₱850,000\nYear 1 Total Investment: ₱7,750,000\n\nVolume discounts available for multi-year commitments.",
        timeline: "13 weeks from contract signing to go-live",
      });
    } else if (templateType === "EXECUTIVE_SUMMARY") {
      setFormData({
        title: "Q1 2024 Strategic Initiative Review",
        purpose:
          "This executive summary provides leadership with a consolidated view of our Q1 strategic initiatives, highlighting key achievements, challenges, and recommendations for Q2 adjustments.",
        keyFindings:
          "Revenue growth exceeded targets by 12%, driven primarily by enterprise segment\nCustomer acquisition cost decreased 18% through improved marketing efficiency\nEmployee satisfaction scores improved from 7.2 to 8.1\nTechnical debt reduction initiative is behind schedule by 3 weeks",
        recommendations:
          "Increase investment in enterprise sales team by 2 FTEs\nAccelerate technical debt reduction with dedicated sprint\nExpand successful marketing campaigns across Luzon, Visayas, and Mindanao\nInitiate cross-functional task force for customer retention",
        nextSteps:
          "Schedule Q2 planning session for March 15\nPrepare detailed budget proposals for recommended investments\nComplete stakeholder interviews by end of February",
      });
    } else if (templateType === "BUSINESS_PLAN") {
      setFormData({
        companyName: "DocuAI Philippines, Inc.",
        missionStatement:
          "To empower every organization to create professional, compliant documents instantly through the power of AI.",
        marketAnalysis:
          "The Philippine document automation market is rapidly expanding, with strong demand from BPO, fintech, healthcare, and government sectors. Key segments include legal (32%), healthcare (24%), and financial services (22%). Current solutions are either too complex for SMBs or lack enterprise-grade features. DocuAI addresses this gap with an intuitive interface backed by enterprise security.",
        productsServices:
          "DocuAI Platform: AI-powered document generation SaaS\n- Free Tier: 10 documents/month, basic templates\n- Starter: ₱999/month, unlimited documents, 20 templates\n- Pro: ₱2,499/month, priority generation, all templates, XLSX support\n- Enterprise: Custom pricing, SSO, dedicated support, custom integrations",
        financialProjections:
          "Year 1: ₱28M ARR, 1,000 paying customers\nYear 2: ₱112M ARR, 5,000 paying customers\nYear 3: ₱280M ARR, 15,000 paying customers\n\nPath to profitability: Month 18\nGross margin target: 75%",
        fundingNeeds:
          "Seeking ₱110M Seed Round for:\n- Engineering team expansion (60%)\n- Sales & Marketing (25%)\n- Operations & Infrastructure (15%)",
      });
    } else if (templateType === "SWOT_ANALYSIS") {
      setFormData({
        subject: "DocuAI Philippines - 2024 Strategic Assessment",
        strengths:
          "Proprietary AI models optimized for document generation\nStrong brand recognition in the SMB segment\nHigh customer satisfaction (NPS 72)\n95% year-over-year revenue growth\nExperienced founding team with enterprise SaaS background",
        weaknesses:
          "Limited presence outside major Philippine business hubs\nDependency on third-party LLM providers\nSmall sales team relative to enterprise ambitions\nTechnical debt in legacy codebase",
        opportunities:
          "Growing demand for AI automation in enterprises\nPartnerships with major productivity suites (Microsoft, Google)\nExpansion into adjacent markets (contracts, compliance)\nStrategic acquisitions of niche players",
        threats:
          "Large tech companies entering the space\nRapidly evolving AI landscape requiring constant innovation\nEconomic downturn affecting SMB spending\nRegulatory changes around AI-generated content",
      });
    }
    // ========== NEW ENTERPRISE TEMPLATES ==========
    else if (templateType === "ANNUAL_REPORT") {
      setFormData({
        companyName: "DocuAI Philippines, Inc.",
        fiscalYear: "2023",
        ceoLetter:
          "Dear Stakeholders,\n\n2023 was a transformative year for DocuAI. We achieved record revenue growth of 95%, expanded our team to 50 employees, and launched our Enterprise tier serving top Philippine organizations. Our AI-powered platform now generates over 1 million documents monthly.\n\nLooking ahead, we are focused on national expansion across the Philippines, continued product innovation, and building a sustainable, profitable business.\n\nThank you for your continued support.\n\nSincerely,\nJane Smith, CEO",
        financialHighlights:
          "Annual Recurring Revenue: ₱134M (+95% YoY)\nTotal Customers: 5,200 (+120% YoY)\nGross Margin: 78%\nNet Revenue Retention: 115%\nCash Position: ₱235M",
        operationalReview:
          "Product: Launched 20 new templates, mobile app, and XLSX export\nEngineering: Reduced latency by 60%, achieved 99.95% uptime\nSales: Closed 12 enterprise deals, expanded to 3 new verticals\nSupport: Maintained <4 hour response time, 94% satisfaction",
        futureOutlook:
          "2024 will focus on three strategic priorities:\n1. International expansion to Europe and Asia-Pacific\n2. Launch of DocuAI Insights analytics platform\n3. Strategic partnerships with enterprise software vendors\n\nWe project 80% revenue growth and path to profitability by Q4 2024.",
      });
    } else if (templateType === "BOARD_PRESENTATION") {
      setFormData({
        meetingDate: futureDate,
        presenter: "Jane Smith, CEO & Co-founder",
        agendaTopics:
          "Q4 2023 Financial Results\nProduct Roadmap Update\nSeries A Fundraising Status\nKey Hires and Organizational Changes\n2024 Strategic Priorities",
        keyMetrics:
          "MRR: ₱11.2M (+15% QoQ)\nARR Runway: ₱134M\nCustomer Count: 5,200\nChurn Rate: 2.1%\nNPS: 72\nBurn Multiple: 1.8x",
        strategicUpdates:
          "Series A: In discussions with 3 tier-1 VCs, targeting ₱560M at ₱2.2B valuation\nProduct: Mobile app launched with 4.8 star rating\nTeam: Hired VP of Sales and VP of Engineering with strong Philippine SaaS backgrounds\nPartnerships: Pilot program with enterprise collaboration partners",
        decisionsRequired:
          "Approval of 2024 operating budget\nStock option pool expansion from 10% to 15%\nAuthorization to negotiate Series A term sheet",
      });
    } else if (templateType === "COMPLIANCE_AUDIT") {
      setFormData({
        auditTitle: "NPC Data Privacy Compliance Audit - DocuAI Platform",
        auditPeriod: "July 1, 2023 - December 31, 2023",
        scope:
          "This audit covers the DocuAI document generation platform, including:\n- Infrastructure (AWS ap-southeast-1 and Philippines-based DR setup)\n- Application security controls\n- Data handling and encryption practices\n- Access management and authentication\n- Incident response procedures\n- Vendor management processes",
        findings:
          "Total Findings: 3\n\nFinding 1 (Low): Password rotation policy not enforced for service accounts\n- Remediation: Implement automated rotation, ETA 2 weeks\n\nFinding 2 (Medium): Incomplete audit logging for admin actions\n- Remediation: Enhance logging coverage, ETA 4 weeks\n\nFinding 3 (Low): Annual security training not documented for contractors\n- Remediation: Update training records, ETA 1 week",
        recommendations:
          "Implement automated compliance monitoring dashboard\nSchedule quarterly security reviews with engineering team\nExpand penetration testing scope to include mobile app\nDocument and test business continuity procedures",
        riskLevel:
          "LOW - Organization demonstrates strong security posture with minor procedural gaps",
      });
    } else if (templateType === "MERGER_PROPOSAL") {
      setFormData({
        targetCompany: "DocuSign Express Ltd.",
        acquiringCompany: "DocuAI Philippines, Inc.",
        strategicRationale:
          "This acquisition accelerates DocuAI's expansion into the e-signature market, adds 50,000 active users to our platform, and brings complementary technology that enhances our document lifecycle offering. The combined entity will be uniquely positioned as the only AI-powered end-to-end document platform.",
        valuation:
          "Proposed Acquisition Price: ₱450M\n- 3.5x trailing twelve-month revenue\n- 40% discount to comparable transactions\n\nTransaction Structure:\n- 60% cash, 40% DocuAI equity\n- 12-month earnout based on retention metrics\n\nSource of Funds:\n- ₱270M from Series A proceeds\n- ₱180M equivalent in new DocuAI shares",
        integrationPlan:
          "Phase 1 (Days 1-30): Stabilization\n- Retain key employees with stay bonuses\n- Maintain existing customer contracts\n- Align branding and communications\n\nPhase 2 (Days 31-90): Integration\n- Migrate infrastructure to DocuAI AWS\n- Integrate user authentication systems\n- Cross-train support teams\n\nPhase 3 (Days 91-180): Optimization\n- Launch combined product offering\n- Consolidate vendor contracts\n- Realize operational synergies",
        riskFactors:
          "Key Employee Retention: Mitigated by stay bonuses and equity incentives\nCustomer Churn: Mitigated by grandfathering existing pricing for 12 months\nTechnology Integration: Mitigated by phased approach and dedicated integration team\nRegulatory Approval: Low risk, no antitrust concerns given market size",
      });
    } else if (templateType === "INVESTOR_PITCH") {
      setFormData({
        companyName: "DocuAI Philippines",
        tagline: "The AI-Powered Document Generation Platform",
        problem:
          "Knowledge workers spend 30% of their time creating documents - contracts, proposals, reports, and communications. Existing solutions are either too complex, too expensive, or lack AI capabilities. This results in wasted time, inconsistent branding, and compliance risks.",
        solution:
          'DocuAI is the first "Prompt-to-Document" platform. Users describe what they need in plain language, and our AI generates professionally formatted documents in seconds. We support 38 template types across invoices, contracts, reports, and more - with export to PDF, DOCX, and XLSX.',
        marketSize:
          "TAM: ₱850B - Southeast Asian document software market\nSAM: ₱160B - Philippine AI-powered document solutions\nSOM: ₱12B - Philippine SMB and mid-market segment\n\nGrowing at 12% CAGR, accelerated by AI adoption trends",
        businessModel:
          "SaaS subscription model:\n- Free: 10 docs/month (conversion funnel)\n- Starter: ₱999/month (SMB)\n- Pro: ₱2,499/month (Power users)\n- Enterprise: Custom (Large organizations)\n\nCurrent metrics:\n- ₱11.2M MRR, 95% YoY growth\n- 5,200 customers\n- 78% gross margin\n- 115% NRR",
        askAmount:
          "₱560M Series A\n\nUse of Funds:\n- 50% Engineering (AI/ML, mobile, integrations)\n- 30% Sales & Marketing (enterprise expansion)\n- 20% Operations (infrastructure, support)\n\n18-month runway to profitability",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await generateDocument({
        templateId: selectedTemplate,
        format,
        userInput: formData,
        tone: tone || undefined,
      });

      if (!result.success) {
        setError(result.error || "Generation failed");
        setLoading(false);
        return;
      }

      // Redirect immediately to library with queuing flag
      router.push(`/documents?queuing=true&id=${result.documentId}`);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);
  const templateType = selectedTemplateData?.type;
  const supportedFormats = selectedTemplateData?.supportedFormats?.split(
    ",",
  ) || ["DOCX", "PDF", "XLSX"];

  // Effect to ensure format is valid for selected template
  useEffect(() => {
    if (selectedTemplate && !supportedFormats.includes(format)) {
      setFormat(supportedFormats[0] as any);
    }
  }, [selectedTemplate, supportedFormats, format]);

  // Group templates by category
  const categories = [
    {
      id: "business",
      name: "Business & Strategy",
      icon: "💼",
      templateTypes: [
        "PROJECT_PROPOSAL",
        "PRODUCT_SPEC",
        "CASE_STUDY",
        "REPORT",
        "LEGAL_CONTRACT",
        "JOB_DESCRIPTION",
        "SOP",
      ],
    },
    {
      id: "communication",
      name: "Marketing & Comms",
      icon: "📣",
      templateTypes: [
        "PRESS_RELEASE",
        "NEWSLETTER",
        "CONTENT",
        "MEMO",
        "SOCIAL_MEDIA_PLAN",
      ],
    },
    {
      id: "essentials",
      name: "Work Essentials",
      icon: "🛠️",
      templateTypes: [
        "INVOICE",
        "RESUME",
        "MEETING_MINUTES",
        "PRESENTATION",
        "COVER_LETTER",
        "MEETING_AGENDA",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-indigo-100 dark:selection:bg-indigo-900 relative">
      {/* Animated Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all duration-500 ${step === 1 ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30" : "bg-green-500 text-white"}`}
            >
              {step > 1 ? "✓" : "1"}
            </div>
            <div
              className={`h-1 w-16 rounded-full transition-all duration-500 ${step > 1 ? "bg-green-500" : "bg-border"}`}
            ></div>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all duration-500 ${step === 2 ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30" : "bg-border text-gray-400"}`}
            >
              2
            </div>
          </div>
        </div>

        {step === 1 ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <header className="mb-16 text-center">
              <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 dark:text-white">
                What are we <span className="gradient-text">Creating</span>{" "}
                today?
              </h1>
              <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
                Choose a base template. Our AI will handle the structure,
                design, and content perfectly.
              </p>

              {subscription && (
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-border/50 rounded-full shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                    {subscription.tier === "FREE" ? (
                      <>{subscription.remaining} generations left this month</>
                    ) : (
                      <>
                        {subscription.remaining} {subscription.tier} Tier
                        generations left
                      </>
                    )}
                  </span>
                </div>
              )}
            </header>

            <div className="mb-10">
              <SmartSuggestions onSelect={handleTemplateSelect} />
            </div>

            {templatesLoading ? (
              <div className="space-y-6 animate-pulse">
                <div className="flex gap-8">
                  <div className="w-64 hidden lg:block space-y-4">
                    <div className="h-40 rounded-2xl bg-gray-200/60 dark:bg-gray-800/60"></div>
                    <div className="h-28 rounded-2xl bg-gray-200/60 dark:bg-gray-800/60"></div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="h-12 rounded-xl bg-gray-200/60 dark:bg-gray-800/60"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-40 rounded-2xl bg-gray-200/60 dark:bg-gray-800/60"
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  Loading templates...
                </p>
              </div>
            ) : templatesLoadError ? (
              <div className="p-6 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-center">
                <p className="font-bold text-red-700 dark:text-red-300">
                  {templatesLoadError}
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 px-5 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <TemplateBrowser
                templates={templates}
                subscription={subscription}
                onSelect={handleTemplateSelect}
              />
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={goBack}
                className="mb-8 flex items-center text-gray-500 hover:text-primary font-bold transition-colors group"
              >
                <svg
                  className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Templates
              </button>

              <div className="glass rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden">
                <div className="p-8 md:p-14">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-b border-border/50 pb-10">
                    <div>
                      <div className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-2">
                        Step 2: Configuration
                      </div>
                      <h2 className="text-3xl font-black">
                        {selectedTemplateData?.name}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={autoFillTemplate}
                      className="px-8 py-4 bg-indigo-50 dark:bg-indigo-900/40 text-primary font-black rounded-2xl hover:bg-primary hover:text-white transition-all duration-300 flex items-center shadow-sm active:scale-95"
                    >
                      <span className="mr-2">✨</span> Magic Auto-fill
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-12">
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-6 py-4 rounded-2xl text-sm font-medium flex items-center">
                        <svg
                          className="w-5 h-5 mr-3 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1-2 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {error}
                      </div>
                    )}

                    <div className="space-y-4">
                      <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-2">
                        Choose Output Format
                      </label>
                      <div className="flex p-2 bg-gray-50/50 dark:bg-gray-800/50 border border-border/50 rounded-3xl h-16 w-full md:w-80">
                        {["DOCX", "PDF", "XLSX"].map((fmt) => {
                          const isTemplateSupported = selectedTemplate
                            ? supportedFormats.includes(fmt)
                            : true;
                          const isSupported = isTemplateSupported;

                          return (
                            <button
                              key={fmt}
                              type="button"
                              disabled={!isSupported}
                              onClick={() => setFormat(fmt as any)}
                              className={`flex-1 h-full rounded-2xl text-sm font-black transition-all duration-300 relative group/fmt ${
                                format === fmt
                                  ? "bg-primary text-white shadow-lg"
                                  : isSupported
                                    ? "text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700"
                                    : "text-gray-300 dark:text-gray-800 cursor-not-allowed opacity-30"
                              }`}
                            >
                              {fmt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-2">
                        Writing Tone (Optional)
                      </label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full md:w-80 h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium appearance-none cursor-pointer"
                      >
                        <option value="">Default</option>
                        <option value="Professional">Professional</option>
                        <option value="Casual">Casual</option>
                        <option value="Technical">Technical</option>
                        <option value="Friendly">Friendly</option>
                        <option value="Formal">Formal</option>
                      </select>
                    </div>

                    <div className="bg-gray-50/30 dark:bg-gray-800/20 rounded-[2.5rem] p-8 md:p-10 border border-border/30">
                      {templateType === "INVOICE" && (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Client Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.clientName || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    clientName: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                                placeholder="e.g. Acme Corp"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Invoice ID *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.invoiceNumber || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    invoiceNumber: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                                placeholder="INV-001"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Address
                            </label>
                            <input
                              type="text"
                              value={formData.clientAddress || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  clientAddress: e.target.value,
                                })
                              }
                              className="w-full h-14 px-6 bg-background border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                              placeholder="123 Business Way, Suite 100"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Issue Date *
                              </label>
                              <input
                                type="date"
                                required
                                value={formData.invoiceDate || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    invoiceDate: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Due Date *
                              </label>
                              <input
                                type="date"
                                required
                                value={formData.dueDate || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    dueDate: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Line Items * (One per line)
                            </label>
                            <textarea
                              required
                              rows={5}
                              value={formData.itemsText || ""}
                              onChange={(e) => {
                                const items = e.target.value
                                  .split("\n")
                                  .filter(Boolean)
                                  .map((desc) => ({ description: desc }));
                                setFormData({
                                  ...formData,
                                  itemsText: e.target.value,
                                  items,
                                });
                              }}
                              className="w-full p-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium leading-relaxed dark:placeholder:text-gray-600"
                              placeholder="Enter items, one per line..."
                            />
                          </div>
                        </div>
                      )}

                      {templateType === "REPORT" && (
                        <div className="space-y-8">
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Report Title *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.title || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  title: e.target.value,
                                })
                              }
                              className="w-full h-14 px-6 bg-background border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                              placeholder="Quarterly Growth Analysis"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Target Period *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.dateRange || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    dateRange: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                                placeholder="Q1 2024"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Department
                              </label>
                              <input
                                type="text"
                                value={formData.department || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    department: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                                placeholder="Corporate Sales"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Key Objectives *
                            </label>
                            <textarea
                              required
                              rows={6}
                              value={formData.keyPointsText || ""}
                              onChange={(e) => {
                                const keyPoints = e.target.value
                                  .split("\n")
                                  .filter(Boolean);
                                setFormData({
                                  ...formData,
                                  keyPointsText: e.target.value,
                                  keyPoints,
                                });
                              }}
                              className="w-full p-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium leading-relaxed dark:placeholder:text-gray-600"
                              placeholder="Detail key performance indicators..."
                            />
                          </div>
                        </div>
                      )}

                      {templateType === "MEMO" && (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                To *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.to || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    to: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                From *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.from || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    from: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Date *
                              </label>
                              <input
                                type="date"
                                required
                                value={formData.date || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    date: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Subject *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.subject || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    subject: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Message Content *
                            </label>
                            <textarea
                              required
                              rows={8}
                              value={formData.message || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  message: e.target.value,
                                })
                              }
                              className="w-full p-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium leading-relaxed dark:placeholder:text-gray-600"
                              placeholder="Write your memo content here..."
                            />
                          </div>
                        </div>
                      )}

                      {templateType === "CONTENT" && (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Document Title *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.title || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    title: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                                placeholder="e.g. 2024 Industry Trends"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Main Topic *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.topic || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    topic: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                                placeholder="What is this document about?"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Target Audience
                              </label>
                              <input
                                type="text"
                                value={formData.targetAudience || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    targetAudience: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                                placeholder="Who is this for?"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Tone
                              </label>
                              <input
                                type="text"
                                value={formData.tone || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    tone: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                                placeholder="e.g. Professional, Casual..."
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Key Points *
                            </label>
                            <textarea
                              required
                              rows={6}
                              value={formData.keyPointsText || ""}
                              onChange={(e) => {
                                const keyPoints = e.target.value
                                  .split("\n")
                                  .filter(Boolean);
                                setFormData({
                                  ...formData,
                                  keyPointsText: e.target.value,
                                  keyPoints,
                                });
                              }}
                              className="w-full p-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium leading-relaxed dark:placeholder:text-gray-600"
                              placeholder="Detail key points to cover (one per line)..."
                            />
                          </div>
                        </div>
                      )}

                      {templateType === "RESUME" && (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Full Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.fullName || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    fullName: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                                placeholder="John Doe"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Contact Info *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.contactInfo || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    contactInfo: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                                placeholder="email@example.com / (555) 000-0000"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Skills * (Comma separated)
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.skillsText || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  skillsText: e.target.value,
                                })
                              }
                              className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                              placeholder="React, TypeScript, Node.js, Project Management..."
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Experience *
                            </label>
                            <textarea
                              required
                              rows={6}
                              value={formData.experienceText || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  experienceText: e.target.value,
                                })
                              }
                              className="w-full p-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium leading-relaxed dark:placeholder:text-gray-600"
                              placeholder="List your work experience, one role per line..."
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Education *
                            </label>
                            <textarea
                              required
                              rows={4}
                              value={formData.educationText || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  educationText: e.target.value,
                                })
                              }
                              className="w-full p-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium leading-relaxed dark:placeholder:text-gray-600"
                              placeholder="Describe your degrees and certifications..."
                            />
                          </div>
                        </div>
                      )}

                      {templateType === "LEGAL_CONTRACT" && (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Service Provider *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.serviceProvider || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    serviceProvider: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                                placeholder="Your Name or Company"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Client Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.clientName || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    clientName: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                                placeholder="Client Name or Company"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Payment Terms *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.paymentTerms || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    paymentTerms: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                                placeholder="e.g. ₱250,000 upfront, net 30"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Governing Law *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.governingLaw || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    governingLaw: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                                placeholder="e.g. Republic of the Philippines"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Description of Services *
                            </label>
                            <textarea
                              required
                              rows={6}
                              value={formData.servicesDescription || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  servicesDescription: e.target.value,
                                })
                              }
                              className="w-full p-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium leading-relaxed dark:placeholder:text-gray-600"
                              placeholder="Detail the scope of work and deliverables..."
                            />
                          </div>
                        </div>
                      )}

                      {templateType === "NEWSLETTER" && (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Newsletter Title *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.title || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    title: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                                placeholder="e.g. Monthly Pulse"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Issue Date *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.issueDate || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    issueDate: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                                placeholder="February 2024"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Main Story Headline *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.mainStory || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  mainStory: e.target.value,
                                })
                              }
                              className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                              placeholder="e.g. Big Wins for Q1"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Story Highlights * (One per line)
                            </label>
                            <textarea
                              required
                              rows={5}
                              value={formData.contentPoints || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  contentPoints: e.target.value,
                                })
                              }
                              className="w-full p-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium leading-relaxed dark:placeholder:text-gray-600"
                              placeholder="Detail key stories and updates..."
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Upcoming Events (One per line)
                            </label>
                            <textarea
                              rows={3}
                              value={formData.upcomingEvents || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  upcomingEvents: e.target.value,
                                })
                              }
                              className="w-full p-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium leading-relaxed dark:placeholder:text-gray-600"
                              placeholder="List any upcoming dates or events..."
                            />
                          </div>
                        </div>
                      )}

                      {templateType === "MEETING_MINUTES" && (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Meeting Title *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.meetingTitle || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    meetingTitle: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                                placeholder="Sync with Marketing"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Meeting Date *
                              </label>
                              <input
                                type="date"
                                required
                                value={formData.meetingDate || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    meetingDate: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Attendees * (One per line)
                              </label>
                              <textarea
                                required
                                rows={4}
                                value={formData.attendeesText || ""}
                                onChange={(e) => {
                                  const attendees = e.target.value
                                    .split("\n")
                                    .filter(Boolean);
                                  setFormData({
                                    ...formData,
                                    attendeesText: e.target.value,
                                    attendees,
                                  });
                                }}
                                className="w-full p-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium leading-relaxed dark:placeholder:text-gray-600"
                                placeholder="List attendees..."
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Agenda * (One per line)
                              </label>
                              <textarea
                                required
                                rows={4}
                                value={formData.agendaText || ""}
                                onChange={(e) => {
                                  const agenda = e.target.value
                                    .split("\n")
                                    .filter(Boolean);
                                  setFormData({
                                    ...formData,
                                    agendaText: e.target.value,
                                    agenda,
                                  });
                                }}
                                className="w-full p-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium leading-relaxed dark:placeholder:text-gray-600"
                                placeholder="List agenda items..."
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Key Discussions *
                            </label>
                            <textarea
                              required
                              rows={5}
                              value={formData.discussionText || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  discussionText: e.target.value,
                                })
                              }
                              className="w-full p-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium leading-relaxed dark:placeholder:text-gray-600"
                              placeholder="Summarize main points talked about..."
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Action Items (One per line)
                            </label>
                            <textarea
                              rows={3}
                              value={formData.actionItemsText || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  actionItemsText: e.target.value,
                                })
                              }
                              className="w-full p-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium leading-relaxed dark:placeholder:text-gray-600"
                              placeholder="Assign tasks and deadlines..."
                            />
                          </div>
                        </div>
                      )}

                      {templateType === "PRESENTATION" && (
                        <div className="space-y-8">
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Presentation Topic *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.topic || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  topic: e.target.value,
                                })
                              }
                              className="w-full h-14 px-6 bg-background border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                              placeholder="e.g. Company Roadmap 2024"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Target Audience
                              </label>
                              <input
                                type="text"
                                value={formData.targetAudience || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    targetAudience: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                                placeholder="e.g. Marketing Team"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Style
                              </label>
                              <input
                                type="text"
                                value={formData.presentationStyle || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    presentationStyle: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium dark:placeholder:text-gray-600"
                                placeholder="e.g. Modern, Minimal, Creative..."
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Key Message *
                            </label>
                            <textarea
                              required
                              rows={4}
                              value={formData.keyMessage || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  keyMessage: e.target.value,
                                })
                              }
                              className="w-full p-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium leading-relaxed dark:placeholder:text-gray-600"
                              placeholder="What is the main takeaway for the audience?"
                            />
                          </div>
                        </div>
                      )}

                      {templateType === "PROJECT_PROPOSAL" && (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Proposal Title *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.title || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    title: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                                placeholder="Consulting Services Proposal"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Client Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.client || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    client: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                                placeholder="Acme Corporation"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Total Budget
                            </label>
                            <input
                              type="text"
                              value={formData.budget || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  budget: e.target.value,
                                })
                              }
                              className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                              placeholder="₱2,800,000"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Key Goals * (One per line)
                            </label>
                            <textarea
                              required
                              rows={3}
                              value={formData.goalsText || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  goalsText: e.target.value,
                                })
                              }
                              className="w-full p-6 bg-background dark:bg-gray-900/50 border border-border/50 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium leading-relaxed"
                              placeholder="What will this project achieve?"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Scope Details * (One per line)
                            </label>
                            <textarea
                              required
                              rows={4}
                              value={formData.scopeText || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  scopeText: e.target.value,
                                })
                              }
                              className="w-full p-6 bg-background dark:bg-gray-900/50 border border-border/50 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium leading-relaxed"
                              placeholder="List deliverables and boundaries..."
                            />
                          </div>
                        </div>
                      )}

                      {templateType === "PRODUCT_SPEC" && (
                        <div className="space-y-8">
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Product Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.productName || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  productName: e.target.value,
                                })
                              }
                              className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                              placeholder="e.g. DocuAI Mobile"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Core Objectives * (One per line)
                            </label>
                            <textarea
                              required
                              rows={3}
                              value={formData.objectivesText || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  objectivesText: e.target.value,
                                })
                              }
                              className="w-full p-6 bg-background dark:bg-gray-900/50 border border-border/50 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium leading-relaxed"
                              placeholder="Define success..."
                            />
                          </div>
                        </div>
                      )}

                      {templateType === "PRESS_RELEASE" && (
                        <div className="space-y-8">
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Headline *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.headline || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  headline: e.target.value,
                                })
                              }
                              className="w-full h-14 px-6 bg-background dark:bg-gray-900/50 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                              placeholder="Breaking News"
                            />
                          </div>
                        </div>
                      )}

                      {templateType === "CASE_STUDY" && (
                        <div className="space-y-8">
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Project/Case Title *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.projectTitle || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  projectTitle: e.target.value,
                                })
                              }
                              className="w-full h-14 px-6 bg-background border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                              placeholder="Case Study Title"
                            />
                          </div>
                        </div>
                      )}

                      {templateType === "JOB_DESCRIPTION" && (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Job Title *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.jobTitle || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    jobTitle: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                                placeholder="e.g. Senior Full Stack Developer"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Company Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.companyName || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    companyName: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                                placeholder="e.g. DocuAI Philippines"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Location *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.location || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  location: e.target.value,
                                })
                              }
                              className="w-full h-14 px-6 bg-background border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                              placeholder="e.g. Makati City, Philippines (Remote)"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Key Responsibilities *
                            </label>
                            <textarea
                              required
                              rows={5}
                              value={formData.responsibilities || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  responsibilities: e.target.value,
                                })
                              }
                              className="w-full p-6 bg-background border border-border/50 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                              placeholder="List key duties..."
                            />
                          </div>
                        </div>
                      )}

                      {templateType === "COVER_LETTER" && (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Your Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.applicantName || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    applicantName: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Target Job Title *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.jobTitle || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    jobTitle: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Hiring Company *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.companyName || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  companyName: e.target.value,
                                })
                              }
                              className="w-full h-14 px-6 bg-background border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Experience Summary *
                            </label>
                            <textarea
                              required
                              rows={5}
                              value={formData.experienceSummary || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  experienceSummary: e.target.value,
                                })
                              }
                              className="w-full p-6 bg-background border border-border/50 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                              placeholder="Briefly describe your relevant background..."
                            />
                          </div>
                        </div>
                      )}

                      {templateType === "SOCIAL_MEDIA_PLAN" && (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Campaign Title *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.campaignName || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    campaignName: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Platforms *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.platforms || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    platforms: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                                placeholder="e.g. Instagram, LinkedIn"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Post Objectives *
                            </label>
                            <textarea
                              required
                              rows={5}
                              value={formData.goals || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  goals: e.target.value,
                                })
                              }
                              className="w-full p-6 bg-background border border-border/50 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                              placeholder="What do you want to achieve?"
                            />
                          </div>
                        </div>
                      )}

                      {templateType === "SOP" && (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Procedure Title *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.procTitle || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    procTitle: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Department *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.department || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    department: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Step-by-Step Instructions *
                            </label>
                            <textarea
                              required
                              rows={8}
                              value={formData.steps || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  steps: e.target.value,
                                })
                              }
                              className="w-full p-6 bg-background border border-border/50 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                              placeholder="List each step clearly..."
                            />
                          </div>
                        </div>
                      )}

                      {templateType === "MEETING_AGENDA" && (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Meeting Title *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.meetingTitle || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    meetingTitle: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Date & Time *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.date || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    date: e.target.value,
                                  })
                                }
                                className="w-full h-14 px-6 bg-background border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                              Agenda Items *
                            </label>
                            <textarea
                              required
                              rows={6}
                              value={formData.agendaItems || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  agendaItems: e.target.value,
                                })
                              }
                              className="w-full p-6 bg-background border border-border/50 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                              placeholder="List items, one per line..."
                            />
                          </div>
                        </div>
                      )}

                      {/* Dynamic Form Fallback for new templates without hardcoded forms */}
                      {![
                        "INVOICE",
                        "REPORT",
                        "MEMO",
                        "CONTENT",
                        "RESUME",
                        "LEGAL_CONTRACT",
                        "NEWSLETTER",
                        "MEETING_MINUTES",
                        "PRESENTATION",
                        "PROJECT_PROPOSAL",
                        "PRODUCT_SPEC",
                        "PRESS_RELEASE",
                        "CASE_STUDY",
                        "JOB_DESCRIPTION",
                        "COVER_LETTER",
                        "SOCIAL_MEDIA_PLAN",
                        "SOP",
                        "MEETING_AGENDA",
                      ].includes(templateType) &&
                        selectedTemplateData?.structure && (
                          <DynamicTemplateForm
                            templateStructure={selectedTemplateData.structure}
                            formData={formData}
                            onChange={setFormData}
                          />
                        )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || subscription?.isLimitReached}
                      className="group relative w-full h-20 rounded-[2rem] bg-primary text-white font-black text-xl shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all duration-500 overflow-hidden active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                      <span className="relative flex items-center justify-center">
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-4 h-8 w-8 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Creating Masterpiece...
                          </>
                        ) : subscription?.isLimitReached ? (
                          <>
                            Monthly Limit Reached
                            <svg
                              className="w-7 h-7 ml-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-11a4 4 0 11-8 0 4 4 0 018 0zM12 7h.01"
                              />
                            </svg>
                          </>
                        ) : (
                          <>
                            Generate {selectedTemplateData?.name}
                            <svg
                              className="w-7 h-7 ml-4 group-hover:translate-x-2 transition-transform duration-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          </>
                        )}
                      </span>
                    </button>

                    {subscription?.isLimitReached && (
                      <div className="mt-6 p-6 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-3xl text-center">
                        <p className="text-indigo-900 dark:text-indigo-100 font-bold mb-2">
                          You've reached your free limit of 2 generations per
                          month.
                        </p>
                        <p className="text-indigo-700/70 dark:text-indigo-300/70 text-sm mb-4">
                          Upgrade to PRO for unlimited generations and premium
                          templates.
                        </p>
                        <Link
                          href="/pricing"
                          className="px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-black hover:bg-indigo-700 transition-colors inline-block"
                        >
                          Upgrade Now
                        </Link>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
