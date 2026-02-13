'use server';

import { prisma } from '@/lib/prisma';

export type ResolvedDesign = {
  id: string;
  name: string;
  source: 'selected' | 'default' | 'system';
  primaryColor: string;
  secondaryColor: string;
  headingColor: string;
  bodyColor: string;
  fontHeading: string;
  fontBody: string;
  spacingScale: 'compact' | 'normal' | 'relaxed';
  tableStyle: string;
  coverStyle: string;
  logoUrl?: string | null;
};

const SYSTEM_FALLBACK: Omit<ResolvedDesign, 'id' | 'name' | 'source'> = {
  primaryColor: '#2563EB',
  secondaryColor: '#4F46E5',
  headingColor: '#1E293B',
  bodyColor: '#334155',
  fontHeading: 'Inter',
  fontBody: 'Roboto',
  spacingScale: 'normal',
  tableStyle: 'clean',
  coverStyle: 'classic',
  logoUrl: null,
};

function parseTokens(tokensRaw: string | null | undefined) {
  if (!tokensRaw) return {};
  try {
    const parsed = JSON.parse(tokensRaw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeTokens(tokens: any) {
  const safe = tokens && typeof tokens === 'object' ? tokens : {};
  return {
    primaryColor: String(safe.primaryColor || SYSTEM_FALLBACK.primaryColor),
    secondaryColor: String(safe.secondaryColor || SYSTEM_FALLBACK.secondaryColor),
    headingColor: String(safe.headingColor || SYSTEM_FALLBACK.headingColor),
    bodyColor: String(safe.bodyColor || SYSTEM_FALLBACK.bodyColor),
    fontHeading: String(safe.fontHeading || SYSTEM_FALLBACK.fontHeading),
    fontBody: String(safe.fontBody || SYSTEM_FALLBACK.fontBody),
    spacingScale: (safe.spacingScale || SYSTEM_FALLBACK.spacingScale) as 'compact' | 'normal' | 'relaxed',
    tableStyle: String(safe.tableStyle || SYSTEM_FALLBACK.tableStyle),
    coverStyle: String(safe.coverStyle || SYSTEM_FALLBACK.coverStyle),
  };
}

function supportsFormat(targetFormats: string, format: 'DOCX' | 'PDF' | 'XLSX') {
  const formats = String(targetFormats || '')
    .split(',')
    .map((f) => f.trim().toUpperCase())
    .filter(Boolean);
  return formats.includes(format);
}

export async function resolveDesignForGeneration(options: {
  requestedDesignTemplateId?: string;
  format: 'DOCX' | 'PDF' | 'XLSX';
}): Promise<ResolvedDesign> {
  const brand = await prisma.brandSettings.findUnique({ where: { id: 'singleton' } });

  // Keep template identity distinct: brand settings should not flatten preset colors/fonts.
  // Brand logo is applied globally; color/font defaults are only used for system fallback.
  const applyBrandForTemplate = (base: ReturnType<typeof normalizeTokens>) => ({
    ...base,
    logoUrl: brand?.logoUrl || null,
  });
  const applyBrandForSystemFallback = (base: ReturnType<typeof normalizeTokens>) => ({
    ...base,
    primaryColor: brand?.primaryColor || base.primaryColor,
    secondaryColor: brand?.secondaryColor || base.secondaryColor,
    fontHeading: brand?.fontHeading || base.fontHeading,
    fontBody: brand?.fontBody || base.fontBody,
    logoUrl: brand?.logoUrl || null,
  });

  if (options.requestedDesignTemplateId) {
    const selected = await prisma.designTemplate.findUnique({
      where: { id: options.requestedDesignTemplateId },
    });

    if (!selected || !selected.isActive) {
      throw new Error('Selected design template is not available.');
    }

    if (!supportsFormat(selected.targetFormats, options.format)) {
      throw new Error(`Selected design does not support ${options.format}.`);
    }

    return {
      id: selected.id,
      name: selected.name,
      source: 'selected',
      ...applyBrandForTemplate(normalizeTokens(parseTokens(selected.tokens))),
    };
  }

  const defaultDesign = await prisma.designTemplate.findFirst({
    where: { isActive: true, isDefault: true },
    orderBy: { updatedAt: 'desc' },
  });

  if (defaultDesign && supportsFormat(defaultDesign.targetFormats, options.format)) {
    return {
      id: defaultDesign.id,
      name: defaultDesign.name,
      source: 'default',
      ...applyBrandForTemplate(normalizeTokens(parseTokens(defaultDesign.tokens))),
    };
  }

  return {
    id: 'system-fallback',
    name: 'System Fallback',
    source: 'system',
    ...applyBrandForSystemFallback(SYSTEM_FALLBACK),
  };
}
