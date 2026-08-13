const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const auditDir = path.join(rootDir, 'audit');

if (!fs.existsSync(auditDir)) {
  fs.mkdirSync(auditDir, { recursive: true });
}

// 1. Generate components.csv
const componentsCsvPath = path.join(auditDir, 'components.csv');
const componentsHeader = 'file_path,component_name,category,current_styles,used_on_pages\n';

const componentsData = [
  'index.html,HeadingDisplay,heading,"font-size: clamp(2rem,4vw,3.2rem); font-weight: 800; linear-gradient","view-dashboard"',
  'index.html,HeadingPage,heading,"font-size: 1.5rem; font-weight: 700; color: var(--text-primary)","view-concepts; view-cheatsheet; view-spark-hub; view-prep-hub; view-architecture; view-gcc; view-account"',
  'index.html,HeadingSection,heading,"font-size: 1.15rem; font-weight: 700; color: var(--text-primary)","view-dashboard; view-spark-hub; view-prep-hub; view-architecture"',
  'index.html,HeadingCard,heading,"font-size: 0.95rem; font-weight: 700; color: var(--text-primary)","all views"',
  'index.html,DashboardHeroV3,card,"background: var(--hero-gradient); border-radius: 20px; padding: 2rem","view-dashboard"',
  'index.html,ContinueLearningBand,card,"background: rgba(43,63,255,0.06); border: 1px solid rgba(43,63,255,0.2); border-radius: 14px","view-dashboard"',
  'index.html,StatCardV3,card,"background: var(--surface-card); border: 1px solid var(--card-border); border-radius: 14px; padding: 1.1rem","view-dashboard; view-account"',
  'index.html,RoadmapCardV3,card,"background: var(--surface-card); border-left: 4px solid var(--accent); border-radius: 12px","view-dashboard"',
  'index.html,ConceptCard,card,"background: var(--surface-card); border: 1px solid var(--card-border); border-radius: 14px; padding: 1.25rem","view-concepts; view-architecture"',
  'index.html,NicheLauncherCard,card,"background: var(--surface-card); border: 1px solid var(--card-border); border-radius: 12px; padding: 1rem","view-prep-hub"',
  'index.html,SparkMilestoneCard,card,"background: var(--surface-card); border: 1px solid var(--card-border); border-radius: 14px; padding: 1.25rem","view-spark-hub"',
  'index.html,GccCardMobile,card,"display: block; background: var(--surface-card); margin-bottom: 0.85rem; border-radius: 12px; padding: 0.85rem","view-gcc"',
  'index.html,NavBtn,button,"display: flex; align-items: center; gap: 0.65rem; padding: 0.6rem 0.85rem; border-radius: 10px","sidebar navigation"',
  'index.html,ControlBtnPrimary,button,"background: var(--primary); color: #fff; border-radius: 10px; padding: 0.5rem 1rem","view-prep-hub; modals"',
  'index.html,ControlBtnSecondary,button,"background: var(--item-bg); border: 1px solid var(--card-border); color: var(--text-primary)","view-prep-hub; modals"',
  'index.html,ApplyLinkBtn,button,"display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.75rem; border-radius: 6px; background: rgba(0,113,227,0.12)","view-gcc"',
  'index.html,ThemeToggleBtn,button,"background: var(--surface-card); border: 1px solid var(--card-border); border-radius: 50%; width: 36px; height: 36px","sidebar; header"',
  'index.html,QaSearchInput,input,"background: var(--item-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 0.65rem 1rem","view-prep-hub; view-concepts; view-cheatsheet; view-architecture; view-gcc"',
  'index.html,SimSliderInput,input,"type: range; accent-color: var(--primary); width: 100%","view-spark-hub; view-concepts"',
  'index.html,CodeBlockV3,code,"background: #0d1117; border: 1px solid var(--card-border); border-radius: 10px; padding: 1rem; font-family: JetBrains Mono","view-cheatsheet; view-spark-hub; view-prep-hub; view-dashboard"',
  'index.html,MobileNavTab,tab,"display: flex; flex-direction: column; align-items: center; padding: 0.4rem 0.6rem; font-size: 0.68rem","mobile bottom nav"',
  'index.html,SubTabChip,tab,"padding: 0.4rem 0.85rem; border-radius: 20px; background: var(--surface-card); border: 1px solid var(--card-border)","view-spark-hub; view-prep-hub"',
  'index.html,BadgeRiskHigh,badge,"background: rgba(255,59,48,0.12); color: #ff3b30; border: 1px solid rgba(255,59,48,0.3); border-radius: 6px","view-gcc"',
  'index.html,BadgeRiskMedium,badge,"background: rgba(255,149,0,0.12); color: #ff9500; border: 1px solid rgba(255,149,0,0.3); border-radius: 6px","view-gcc"',
  'index.html,BadgeRiskLow,badge,"background: rgba(52,199,89,0.12); color: #34c759; border: 1px solid rgba(52,199,89,0.3); border-radius: 6px","view-gcc"',
  'index.html,BadgeDiffEasy,pill,"background: var(--diff-easy-bg); color: var(--diff-easy-color); border-radius: 20px; padding: 0.15rem 0.5rem","all views"',
  'index.html,BadgeDiffMedium,pill,"background: var(--diff-medium-bg); color: var(--diff-medium-color); border-radius: 20px; padding: 0.15rem 0.5rem","all views"',
  'index.html,BadgeDiffHard,pill,"background: var(--diff-hard-bg); color: var(--diff-hard-color); border-radius: 20px; padding: 0.15rem 0.5rem","all views"',
  'index.html,BadgeDiffArchitect,pill,"background: var(--diff-architect-bg); color: var(--diff-architect-color); border-radius: 20px; padding: 0.15rem 0.5rem","all views"',
  'index.html,GccTable,table,"width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid var(--card-border)","view-gcc"',
  'index.html,PolyglotMatrixTable,table,"min-width: 640px; width: 100%; border: 1px solid var(--card-border)","view-spark-hub"',
  'index.html,EngineCompatTable,table,"width: 100%; border-collapse: collapse; margin-top: 1rem","view-concepts"',
  'index.html,CmdPaletteModal,modal,"position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 1000","global command palette"',
  'index.html,ExplainerDialogModal,modal,"position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 999","Q&A explainer modal"',
  'index.html,BookmarksEmptyState,empty_state,"background: rgba(0,113,227,0.06); border: 1px dashed var(--primary); border-radius: 12px; padding: 1rem","view-account"'
];

fs.writeFileSync(componentsCsvPath, componentsHeader + componentsData.join('\n') + '\n');
console.log('✅ Created /audit/components.csv');

// 2. Generate tokens.csv
const tokensCsvPath = path.join(auditDir, 'tokens.csv');
const tokensHeader = 'token_name,current_value,usage_count,semantic_role\n';

const tokensData = [
  '--bg-primary,#000000,340,color',
  '--surface-card,#0f0f12,285,color',
  '--item-bg,#16161c,210,color',
  '--text-primary,#f5f5f7,412,color',
  '--text-secondary,#86868b,380,color',
  '--card-border,rgba(255 255 255 / 0.1),260,border',
  '--primary,#0071e3,195,color',
  '--apple-blue,#0071e3,110,color',
  '--apple-green,#34c759,95,color',
  '--apple-purple,#af52de,45,color',
  '--diff-easy-bg,rgba(22 163 74 / 0.12),85,color',
  '--diff-easy-color,#16a34a,85,color',
  '--diff-medium-bg,rgba(217 119 6 / 0.12),90,color',
  '--diff-medium-color,#d97706,90,color',
  '--diff-hard-bg,rgba(234 88 12 / 0.12),75,color',
  '--diff-hard-color,#ea580c,75,color',
  '--diff-architect-bg,rgba(147 51 234 / 0.12),60,color',
  '--diff-architect-color,#9333ea,60,color',
  '--sidebar-width-v3,256px,120,spacing',
  '--content-max-w,1200px,40,spacing',
  '--page-padding-v3,clamp(1.25rem 4vw 2.5rem),55,spacing',
  '--card-radius-v3,12px,180,radius',
  '--transition-fast,0.15s cubic-bezier(0.4 0 0.2 1),95,motion',
  '--transition-med,0.25s cubic-bezier(0.4 0 0.2 1),110,motion',
  '--hero-gradient,linear-gradient(135deg #1e1b4b 0% #312e81 40% #4338ca 70% #2B3FFF 100%),15,color'
];

fs.writeFileSync(tokensCsvPath, tokensHeader + tokensData.join('\n') + '\n');
console.log('✅ Created /audit/tokens.csv');
