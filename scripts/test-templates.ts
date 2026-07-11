/**
 * Test harness — renders all 5 templates with sample data.
 * Run: npx tsx scripts/test-templates.ts
 */
import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { selectTemplate } from '../src/lib/pipeline/templates';
import type { TemplateData } from '../src/lib/pipeline/templates';

const FONTS_DIR = join(process.cwd(), 'src', 'lib', 'fonts');
const OUT_DIR = join(process.cwd(), 'c:/tmp/template-tests');

const fonts = [
  { name: 'IBM Plex Mono', data: readFileSync(join(FONTS_DIR, 'IBMPlexMono-Regular.woff')).buffer as ArrayBuffer, weight: 400 as const, style: 'normal' as const },
  { name: 'IBM Plex Mono', data: readFileSync(join(FONTS_DIR, 'IBMPlexMono-Bold.woff')).buffer as ArrayBuffer, weight: 700 as const, style: 'normal' as const },
  { name: 'IBM Plex Sans', data: readFileSync(join(FONTS_DIR, 'IBMPlexSans-Regular.woff')).buffer as ArrayBuffer, weight: 400 as const, style: 'normal' as const },
  { name: 'IBM Plex Sans', data: readFileSync(join(FONTS_DIR, 'IBMPlexSans-Bold.woff')).buffer as ArrayBuffer, weight: 700 as const, style: 'normal' as const },
];

// ── Sample data per intent ───────────────────────────────────

const RANKING_DATA: TemplateData = {
  title: 'TOP 10 BEST SPANISH CITIES TO LIVE IN',
  subtitle: 'Ranked by quality of life, cost of living, healthcare, climate, and expat friendliness (2026)',
  sections: [
    { heading: 'Valencia', keyConcept: 'Best overall value for expats', content: ['Consistently ranked #1 for expats by InterNations', 'Mediterranean climate with 300+ sunny days'], labels: ['QOL Index: 186.2', 'Cost: 40% below London', 'Healthcare: Universal'] },
    { heading: 'Barcelona', keyConcept: 'Culture and career hub', content: ['Strong tech scene and international community', 'Higher cost but unmatched lifestyle'], labels: ['QOL Index: 178.5', 'Avg Rent: EUR 1,200/mo', 'Expat Pop: 350K+'] },
    { heading: 'Madrid', keyConcept: 'Capital with world-class infrastructure', content: ['Best transport network in Spain', 'Growing digital nomad scene'], labels: ['QOL Index: 175.1', 'Metro: 300+ stations', 'Healthcare: #7 globally'] },
    { heading: 'Malaga', keyConcept: 'Rising star for remote workers', content: ['Fastest-growing tech hub in Southern Europe', 'Year-round warm climate'], labels: ['QOL Index: 172.8', 'Sunshine: 320 days/yr', 'Cost: 50% below BCN'] },
    { heading: 'San Sebastian', keyConcept: 'Premium quality of life', content: ['Michelin-star density: highest in world per capita', 'Basque country cultural richness'], labels: ['QOL Index: 170.3', 'Safety: Top 5 in EU', 'Cuisine: World-class'] },
    { heading: 'Seville', keyConcept: 'Authentic Andalusian lifestyle', content: ['Lowest cost among major Spanish cities', 'Rich cultural heritage and festivals'], labels: ['QOL Index: 168.9', 'Rent: EUR 650/mo avg', 'Climate: 35C summers'] },
    { heading: 'Bilbao', keyConcept: 'Industrial renaissance city', content: ['Guggenheim effect transformed the economy', 'Green spaces and Basque gastronomy'], labels: ['QOL Index: 166.4', 'GDP/capita: EUR 33K', 'Rain: 120 days/yr'] },
    { heading: 'Alicante', keyConcept: 'Affordable coastal living', content: ['Popular with Northern European retirees', 'Low cost with high quality of life'], labels: ['QOL Index: 164.1', 'Expats: 45% of pop', 'Healthcare: Excellent'] },
  ],
  statsBar: [
    { label: 'Cities Ranked', value: '10' },
    { label: 'Best QOL', value: 'Valencia' },
    { label: 'Cheapest', value: 'Seville' },
    { label: 'Best Climate', value: 'Malaga' },
    { label: 'Best Healthcare', value: 'Madrid' },
  ],
  sourceAttribution: 'Sources: InterNations Expat Survey 2025 \u00B7 Numbeo \u00B7 EIU \u00B7 WHO',
};

const PROCESS_DATA: TemplateData = {
  title: 'THE LAB-GROWN DIAMOND JOURNEY',
  subtitle: 'From a microscopic carbon seed to a chemically identical brilliant gem in 2-12 weeks',
  sections: [
    { heading: 'Seed Preparation', keyConcept: 'A microscopic diamond slice serves as the foundation', content: ['Natural or synthetic diamond seed, typically <1mm thick', 'Seed quality determines final crystal structure'], labels: ['Thickness: <1 mm', 'Crystal: Type IIa'] },
    { heading: 'HPHT Method', keyConcept: 'Replicating Earth conditions at extreme pressure', content: ['Carbon dissolved in molten metal flux crystallizes on seed', 'Requires massive hydraulic press systems'], labels: ['Pressure: 5-6 GPa', 'Temp: 1,300-1,600\u00B0C', 'Catalyst: Fe/Ni/Co'] },
    { heading: 'CVD Method', keyConcept: 'Atom-by-atom growth in a plasma chamber', content: ['Methane and hydrogen gas ionized into plasma', 'Carbon atoms deposit layer by layer onto seed'], labels: ['Temp: 700-1,200\u00B0C', 'Pressure: Near vacuum', 'Gas: CH4 + H2'] },
    { heading: 'Growth Phase', keyConcept: 'Controlled crystallization over weeks', content: ['Growth rate: 0.1-10 carats per day depending on method', 'HPHT faster for industrial, CVD preferred for gem quality'], labels: ['Duration: 2-12 weeks', 'Rate: 0.1-10 ct/day'] },
    { heading: 'Post-Processing', keyConcept: 'Cutting, polishing, and quality grading', content: ['Same tools and expertise as natural diamond cutting', 'Graded by GIA using identical 4C criteria'], labels: ['4C Grading: GIA', 'Yield: 30-50%'] },
    { heading: 'Final Product', keyConcept: 'Optically and chemically identical to natural', content: ['Indistinguishable without specialized lab equipment', 'Cost: 60-80% less than natural equivalent'], labels: ['Savings: 60-80%', 'Quality: Identical'] },
  ],
  statsBar: [
    { label: 'HPHT Pressure', value: '5-6 GPa' },
    { label: 'HPHT Temp', value: '1,600\u00B0C' },
    { label: 'CVD Temp', value: '1,200\u00B0C' },
    { label: 'Growth Time', value: '2-12 Weeks' },
    { label: 'Cost Savings', value: '60-80%' },
  ],
  sourceAttribution: 'Sources: GIA \u00B7 De Beers Group \u00B7 Diamond Foundry \u00B7 Nature Materials',
};

const COMPARISON_DATA: TemplateData = {
  title: 'IPHONE 16 PRO VS SAMSUNG S25 ULTRA VS GOOGLE PIXEL 9 PRO',
  subtitle: 'A side-by-side comparison of 2025\'s flagship smartphones across key performance metrics',
  sections: [
    { heading: 'iPhone 16 Pro', keyConcept: 'Best ecosystem integration and video', content: ['A18 Pro chip with 6-core GPU', 'ProRes video recording, USB-C Thunderbolt'], labels: ['Chip: A18 Pro', 'Camera: 48MP main', 'Battery: 3,577 mAh', 'Price: $999'] },
    { heading: 'Samsung S25 Ultra', keyConcept: 'Most versatile with S-Pen and AI', content: ['Snapdragon 8 Elite for Galaxy with on-device AI', 'Built-in S-Pen, 200MP camera system'], labels: ['Chip: SD 8 Elite', 'Camera: 200MP main', 'Battery: 5,000 mAh', 'Price: $1,299'] },
    { heading: 'Google Pixel 9 Pro', keyConcept: 'Best computational photography and AI features', content: ['Tensor G4 with Gemini Nano on-device', 'Best Night Sight and Magic Eraser in class'], labels: ['Chip: Tensor G4', 'Camera: 50MP main', 'Battery: 5,060 mAh', 'Price: $999'] },
  ],
  statsBar: [
    { label: 'Best Camera', value: 'Samsung' },
    { label: 'Best AI', value: 'Google' },
    { label: 'Best Video', value: 'Apple' },
    { label: 'Best Battery', value: 'Google' },
    { label: 'Best Value', value: 'Pixel 9' },
  ],
  sourceAttribution: 'Sources: GSMArena \u00B7 DxOMark \u00B7 Tom\'s Guide \u00B7 The Verge',
};

const OVERVIEW_DATA: TemplateData = {
  title: 'WHAT IS CLIMATE CHANGE?',
  subtitle: 'A comprehensive overview of the science, causes, impacts, and solutions driving the global climate crisis',
  sections: [
    { heading: 'The Science', keyConcept: 'Greenhouse gases trap heat in the atmosphere', content: ['CO2 levels at 424 ppm, highest in 800,000 years', 'Global temperature up 1.1\u00B0C since pre-industrial era'], labels: ['CO2: 424 ppm', '+1.1\u00B0C warming'] },
    { heading: 'Primary Causes', keyConcept: 'Fossil fuel combustion drives 75% of emissions', content: ['Energy production: 25%, Industry: 21%, Transport: 16%', 'Deforestation contributes 10% of global emissions'], labels: ['Fossil fuels: 75%', 'Deforestation: 10%'] },
    { heading: 'Current Impacts', keyConcept: 'Extreme weather events increasing in frequency', content: ['Sea levels rising 3.6mm per year, accelerating', 'Arctic ice declining 13% per decade since 1979'], labels: ['Sea rise: 3.6mm/yr', 'Arctic: -13%/decade'] },
    { heading: 'Future Projections', keyConcept: 'Without action, 2.7\u00B0C warming by 2100', content: ['Current pledges insufficient for 1.5\u00B0C target', '3.2 billion people in high-vulnerability zones by 2050'], labels: ['2100: +2.7\u00B0C', '3.2B at risk'] },
    { heading: 'Mitigation Strategies', keyConcept: 'Rapid decarbonization and renewable transition', content: ['Renewable energy must reach 90% by 2050', 'Carbon capture needed for remaining industrial emissions'], labels: ['Target: Net zero 2050', 'Renewables: 90%'] },
    { heading: 'Global Response', keyConcept: 'Paris Agreement and national commitments', content: ['196 parties committed to limiting warming to 1.5\u00B0C', '$100B annual climate finance pledge (partially met)'], labels: ['196 signatories', '$100B/yr pledge'] },
  ],
  statsBar: [
    { label: 'CO2 Level', value: '424 ppm' },
    { label: 'Warming', value: '+1.1\u00B0C' },
    { label: 'Sea Rise', value: '3.6mm/yr' },
    { label: 'At Risk', value: '3.2B people' },
    { label: 'Target', value: 'Net Zero 2050' },
  ],
  sourceAttribution: 'Sources: IPCC AR6 \u00B7 NASA \u00B7 NOAA \u00B7 World Bank Climate Portal',
};

const METRICS_DATA: TemplateData = {
  title: 'NVIDIA Q4 FY2025 EARNINGS BREAKDOWN',
  subtitle: 'Record-breaking quarter driven by data center AI demand \u2014 key financial metrics and segment performance',
  sections: [
    { heading: 'Total Revenue', keyConcept: 'Record quarterly revenue', content: ['Up 122% year-over-year', 'Exceeded analyst consensus by $2.1B'], labels: ['$22.1 Billion', 'YoY: +122%', 'Beat: +$2.1B'] },
    { heading: 'Data Center', keyConcept: 'AI infrastructure driving growth', content: ['H100/H200 GPU demand exceeds supply', 'Hyperscaler spending accelerating'], labels: ['$18.4 Billion', '83% of revenue', 'YoY: +409%'] },
    { heading: 'Gaming', keyConcept: 'Stable segment with RTX momentum', content: ['RTX 4090/4080 Super refresh drove ASP increases', 'GeForce NOW cloud gaming growing'], labels: ['$2.9 Billion', 'YoY: +56%'] },
    { heading: 'Gross Margin', keyConcept: 'Expanding on software and services mix', content: ['CUDA ecosystem creates switching costs', 'Enterprise software revenue doubling annually'], labels: ['76.7%', 'Up from 66.1%', 'Software: 2x'] },
    { heading: 'Free Cash Flow', keyConcept: 'Massive cash generation funding R&D', content: ['$11.2B in FCF, up from $3.8B prior year', 'R&D spending at $2.4B, 11% of revenue'], labels: ['$11.2 Billion', 'R&D: $2.4B'] },
    { heading: 'Forward Guidance', keyConcept: 'Q1 FY2026 guidance above expectations', content: ['Management expects continued supply constraints', 'Blackwell architecture launch in H2 2025'], labels: ['Q1 Guide: $24B', 'Blackwell: H2 2025'] },
  ],
  statsBar: [
    { label: 'Revenue', value: '$22.1B' },
    { label: 'YoY Growth', value: '+122%' },
    { label: 'Gross Margin', value: '76.7%' },
    { label: 'FCF', value: '$11.2B' },
    { label: 'Data Center', value: '83%' },
  ],
  sourceAttribution: 'Sources: NVIDIA 10-Q Filing \u00B7 Bloomberg \u00B7 Reuters \u00B7 SEC EDGAR',
};

// ── Render all templates ─────────────────────────────────────

async function main() {
  // Init WASM
  const wasmPath = join(process.cwd(), 'node_modules', '@resvg', 'resvg-wasm', 'index_bg.wasm');
  try {
    await initWasm(readFileSync(wasmPath));
  } catch (e: any) {
    if (!e.message?.includes('Already initialized')) throw e;
  }

  mkdirSync('c:/tmp/template-tests', { recursive: true });

  const tests: [string, TemplateData][] = [
    ['ranking', RANKING_DATA],
    ['process', PROCESS_DATA],
    ['comparison', COMPARISON_DATA],
    ['overview', OVERVIEW_DATA],
    ['metrics', METRICS_DATA],
  ];

  for (const [intent, data] of tests) {
    console.log(`Rendering ${intent}...`);
    const tree = selectTemplate(intent, data);

    const svg = await satori(tree as any, {
      width: 1920,
      height: 1080,
      fonts,
    });

    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1920 },
    });
    const png = resvg.render().asPng();
    const outPath = `c:/tmp/template-tests/${intent}.png`;
    writeFileSync(outPath, png);
    console.log(`  -> ${outPath} (${png.length} bytes)`);
  }

  console.log('\nDone! Open c:/tmp/template-tests/ to see all 5 templates.');
}

main().catch(e => { console.error(e); process.exit(1); });
