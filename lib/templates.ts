import { SubscriptionTier } from './subscription';

export type TemplateType = 
  | 'INVOICE' | 'REPORT' | 'MEMO' | 'CONTENT' | 'PRESENTATION' 
  | 'RESUME' | 'LEGAL_CONTRACT' | 'NEWSLETTER' | 'MEETING_MINUTES' 
  | 'PROJECT_PROPOSAL' | 'PRODUCT_SPEC' | 'PRESS_RELEASE' | 'CASE_STUDY'
  | 'JOB_DESCRIPTION' | 'COVER_LETTER' | 'SOCIAL_MEDIA_PLAN' | 'SOP' | 'MEETING_AGENDA'
  // New FREE templates
  | 'THANK_YOU_NOTE' | 'EXPENSE_REPORT' | 'DAILY_STANDUP' | 'FEEDBACK_FORM' | 'EVENT_INVITATION'
  // New STARTER templates
  | 'ONBOARDING_CHECKLIST' | 'PERFORMANCE_REVIEW' | 'TRAINING_MANUAL' | 'INCIDENT_REPORT' | 'QUARTERLY_GOALS'
  // New PRO templates
  | 'WHITE_PAPER' | 'RFP_RESPONSE' | 'EXECUTIVE_SUMMARY' | 'BUSINESS_PLAN' | 'SWOT_ANALYSIS'
  // New ENTERPRISE templates
  | 'ANNUAL_REPORT' | 'BOARD_PRESENTATION' | 'COMPLIANCE_AUDIT' | 'MERGER_PROPOSAL' | 'INVESTOR_PITCH';

const TIER_GROUPS = {
  ENTERPRISE_ONLY: [
    'PROJECT_PROPOSAL', 'PRODUCT_SPEC', 'PRESS_RELEASE', 'CASE_STUDY',
    'ANNUAL_REPORT', 'BOARD_PRESENTATION', 'COMPLIANCE_AUDIT', 'MERGER_PROPOSAL', 'INVESTOR_PITCH'
  ],
  PRO_PLUS: [
    'PRESENTATION', 'LEGAL_CONTRACT', 'NEWSLETTER', 'MEETING_MINUTES',
    'WHITE_PAPER', 'RFP_RESPONSE', 'EXECUTIVE_SUMMARY', 'BUSINESS_PLAN', 'SWOT_ANALYSIS'
  ],
  STARTER_PLUS: [
    'REPORT', 'CONTENT', 'JOB_DESCRIPTION', 'COVER_LETTER', 'SOCIAL_MEDIA_PLAN', 'SOP', 'MEETING_AGENDA',
    'ONBOARDING_CHECKLIST', 'PERFORMANCE_REVIEW', 'TRAINING_MANUAL', 'INCIDENT_REPORT', 'QUARTERLY_GOALS'
  ],
  FREE_PLUS: [
    'INVOICE', 'MEMO', 'RESUME',
    'THANK_YOU_NOTE', 'EXPENSE_REPORT', 'DAILY_STANDUP', 'FEEDBACK_FORM', 'EVENT_INVITATION'
  ]
};

export function isTemplateLocked(tier: SubscriptionTier | string, templateType: string): boolean {
  const userTier = tier as SubscriptionTier;
  const type = templateType.toUpperCase();

  if (userTier === 'ENTERPRISE') return false;

  if (TIER_GROUPS.ENTERPRISE_ONLY.includes(type)) {
    return true;
  }

  if (TIER_GROUPS.PRO_PLUS.includes(type) && !['PRO', 'ENTERPRISE'].includes(userTier)) {
    return true;
  }

  if (TIER_GROUPS.STARTER_PLUS.includes(type) && !['STARTER', 'PRO', 'ENTERPRISE'].includes(userTier)) {
    return true;
  }

  return false;
}

export function getTemplateTier(templateType: string): SubscriptionTier {
  const type = templateType.toUpperCase();
  if (TIER_GROUPS.ENTERPRISE_ONLY.includes(type)) return 'ENTERPRISE';
  if (TIER_GROUPS.PRO_PLUS.includes(type)) return 'PRO';
  if (TIER_GROUPS.STARTER_PLUS.includes(type)) return 'STARTER';
  return 'FREE';
}

export function getAccessibleTemplatesCount(tier: SubscriptionTier | string, allTemplates: any[]): number {
  return allTemplates.filter(t => !isTemplateLocked(tier, t.type)).length;
}

export const TEMPLATE_CATEGORIES = [
  { 
    id: 'business', 
    name: 'Business & Strategy', 
    icon: '💼',
    templateTypes: [
      'PROJECT_PROPOSAL', 'PRODUCT_SPEC', 'CASE_STUDY', 'REPORT', 'LEGAL_CONTRACT', 'JOB_DESCRIPTION', 'SOP',
      'BUSINESS_PLAN', 'SWOT_ANALYSIS', 'ANNUAL_REPORT', 'MERGER_PROPOSAL', 'INVESTOR_PITCH', 'COMPLIANCE_AUDIT'
    ] 
  },
  { 
    id: 'communication', 
    name: 'Marketing & Comms', 
    icon: '📣',
    templateTypes: [
      'PRESS_RELEASE', 'NEWSLETTER', 'CONTENT', 'MEMO', 'SOCIAL_MEDIA_PLAN',
      'WHITE_PAPER', 'THANK_YOU_NOTE', 'EVENT_INVITATION'
    ] 
  },
  { 
    id: 'essentials', 
    name: 'Work Essentials', 
    icon: '🛠️',
    templateTypes: [
      'INVOICE', 'RESUME', 'MEETING_MINUTES', 'PRESENTATION', 'COVER_LETTER', 'MEETING_AGENDA',
      'EXPENSE_REPORT', 'DAILY_STANDUP', 'FEEDBACK_FORM'
    ] 
  },
  {
    id: 'hr',
    name: 'HR & Training',
    icon: '👥',
    templateTypes: [
      'ONBOARDING_CHECKLIST', 'PERFORMANCE_REVIEW', 'TRAINING_MANUAL', 'INCIDENT_REPORT', 'QUARTERLY_GOALS',
      'RFP_RESPONSE', 'EXECUTIVE_SUMMARY', 'BOARD_PRESENTATION'
    ]
  }
];
