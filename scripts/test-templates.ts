import { generatePdf } from '../lib/generators/pdf';
import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

async function testTemplates() {
  console.log('🧪 Starting direct verification of generators...');

  const outputDir = path.join(process.cwd(), 'test-output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  // 1. Test Content Document (PDF)
  console.log('\n--- Testing Content Document Generator (PDF) ---');
  const contentInput = {
    title: 'Modern AI Horizons',
    author: 'DocuAI Tester',
    summary: 'A look into the next decade of intelligent systems.',
    sections: [
      { subheading: 'Introduction', paragraphs: ['AI is evolving rapidly...', 'The transformation is systemic.'] },
      { subheading: 'Key Trends', paragraphs: ['Agentic workflows are the new standard.', 'Multi-modal models are everywhere.'] }
    ],
    callToAction: 'Stay ahead of the curve with DocuAI.',
    keywords: ['AI', 'Tech', 'Future']
  };

  try {
    const pdfBuffer = await generatePdf(contentInput, 'CONTENT');
    const filePath = path.join(outputDir, 'content-test.pdf');
    fs.writeFileSync(filePath, pdfBuffer);
    console.log(`✅ Content PDF generated successfully: ${filePath}`);
  } catch (e) {
    console.error('❌ Content PDF generation failed:', e);
  }

  // 2. Test Presentation Deck (PDF)
  console.log('\n--- Testing Presentation Deck Generator (PDF) ---');
  const presoInput = {
    presentationTitle: 'Growth Strategy 2024',
    slides: [
      { slideNumber: 1, title: 'Title Slide', content: ['Welcome to our roadmap'], imageKeyword: 'business' },
      { slideNumber: 2, title: 'The Problem', content: ['Inefficient processes', 'Manual work'], imageKeyword: 'stuck' },
      { slideNumber: 3, title: 'Our Solution', content: ['Automated workflows', 'AI assistance'], imageKeyword: 'rocket' },
      { slideNumber: 4, title: 'The Impact', content: ['2x ROI', '50% time saved'], imageKeyword: 'money' },
      { slideNumber: 5, title: 'Next Steps', content: ['Implementation Phase', 'Phase 2 planning'], imageKeyword: 'success' }
    ]
  };

  try {
    const pdfBuffer = await generatePdf(presoInput, 'PRESENTATION');
    const filePath = path.join(outputDir, 'presentation-test.pdf');
    fs.writeFileSync(filePath, pdfBuffer);
    console.log(`✅ Presentation PDF generated successfully: ${filePath}`);
  } catch (e) {
    console.error('❌ Presentation PDF generation failed:', e);
  }

  console.log('\n🧪 Verification finished. Please check the "test-output" folder for PDFs.');
}

testTemplates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
