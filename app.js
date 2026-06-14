// Application Core Logic

// Add webdriver active class for automated tests styling overrides
if (typeof navigator !== 'undefined' && navigator.webdriver && typeof document !== 'undefined' && document.documentElement) {
  document.documentElement.classList.add('webdriver-active');
}

// Prevent Puppeteer scrollIntoView hang on fixed elements or automated browsers
if (typeof Element !== 'undefined') {
  const originalScrollIntoView = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function(options) {
    if (typeof navigator !== 'undefined' && navigator.webdriver) {
      return;
    }
    try {
      const style = window.getComputedStyle(this);
      if (style && style.position === 'fixed') {
        return;
      }
    } catch (e) {}
    return originalScrollIntoView.call(this, options);
  };
  
  const originalScrollIntoViewIfNeeded = Element.prototype.scrollIntoViewIfNeeded;
  Element.prototype.scrollIntoViewIfNeeded = function(centerIfNeeded) {
    if (typeof navigator !== 'undefined' && navigator.webdriver) {
      return;
    }
    if (originalScrollIntoViewIfNeeded) {
      try {
        const style = window.getComputedStyle(this);
        if (style && style.position === 'fixed') {
          return;
        }
      } catch (e) {}
      return originalScrollIntoViewIfNeeded.call(this, centerIfNeeded);
    }
  };
}

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  const state = {
    currentView: 'view-concepts',
    theme: 'dark', // 'dark' or 'light'
    progress: {},
    questions: [],
    
    // Dataset Loading Status
    loadedDatasets: {},
    
    // Active filters
    activeExplainerCategory: 'ALL',
    activePracticeCategory: 'ALL',
    activeDifficulty: 'ALL',
    
    // Concepts Active Filters
    activeConceptsCategory: 'ALL',
    activeConceptsDifficulty: 'ALL',
    
    // Cheat Sheet Active Filters
    activeCheatsheetLang: 'all',
    activeCheatsheetLevel: 'all',
    activeCheatsheetQuery: '',
    
    // Personalised Active Filters
    activePersonalisedDomain: 'ALL',
    activePersonalisedQuery: '',
    
    // Prep Hub & Unified Search State
    activePrepHubSubTab: 'view-unified-search',
    unifiedSearchPage: 1,
    activeUnifiedDb: 'ALL',
    activeUnifiedCategory: 'ALL',
    activeUnifiedDifficulty: 'ALL',
    activeUnifiedStatus: 'ALL',
    expandedUnifiedSections: {},
    unifiedSectionLimits: {},
    
    // Personalised Prep State
    activePersonalisedDifficulty: 'ALL',
    activePersonalisedDomain: 'ALL',
    expandedPersonalisedSections: {},
    
    // Niche Practice State
    activePracticeDifficulty: 'ALL',
    activePracticeCategory: 'ALL',
    expandedPracticeSections: {},
    
    // Concept Explainer State
    activeExplainerDifficulty: 'ALL',
    activeExplainerCategory: 'ALL',
    expandedExplainerSections: {},
    
    // Active practice session state
    practice: {
      nicheName: '',
      questionsList: [], // holds ordered or shuffled list of active niche questions
      currentIndex: 0,
      isAnswerRevealed: false
    }
  };

  // --- SELECTORS ---
  const DOM = {
    body: document.body,
    navBtns: document.querySelectorAll('.nav-btn'),
    pageViews: document.querySelectorAll('.main-content > .page-view'),
    
    // Theme Toggle
    themeToggleBtn: document.getElementById('btn-theme-toggle'),
    themeToggleLabel: document.querySelector('.theme-toggle-container .theme-toggle-label'),
    mobileThemeBtn: document.getElementById('btn-mobile-theme') || null,
    // Concept Explainer Filters & Accordion
    explainerTopicsScrollbar: document.getElementById('explainer-topics-scrollbar'),
    explainerSearch: document.getElementById('explainer-search'),
    explainerFilterStatus: document.getElementById('explainer-filter-status'),
    explainerFilterDifficulty: document.getElementById('difficulty-filter'),
    explainerAccordion: document.getElementById('explainer-accordion'),
    btnExplainerExpandAll: document.getElementById('btn-explainer-expand-all'),
    btnExplainerCollapseAll: document.getElementById('btn-explainer-collapse-all'),
    
    // Niche Practice Launcher
    practiceTopicsScrollbar: document.getElementById('practice-topics-scrollbar'),
    nicheSelectionScreen: document.getElementById('niche-selection-screen'),
    nicheLauncherGrid: document.getElementById('niche-launcher-grid'),
    
    // Active Practice Session Screen
    activePracticeScreen: document.getElementById('active-practice-screen'),
    activeNicheTitle: document.getElementById('active-niche-title'),
    practiceProgressIndicator: document.getElementById('practice-progress-indicator'),
    activePracticeQText: document.getElementById('active-practice-q-text'),
    activePracticeAContainer: document.getElementById('active-practice-a-container'),
    activePracticeRevealBtn: document.getElementById('btn-practice-reveal'),
    activePracticeAText: document.getElementById('active-practice-a-text'),
    btnPracticeBack: document.getElementById('btn-practice-back'),
    btnPracticeShuffle: document.getElementById('btn-practice-shuffle'),
    btnPracticePrev: document.getElementById('btn-practice-prev'),
    btnPracticeNext: document.getElementById('btn-practice-next'),
    
    // Detail Modal Dialog
    detailsDialog: document.getElementById('details-dialog'),
    dialogCategory: document.getElementById('dialog-category'),
    dialogQText: document.getElementById('dialog-q-text'),
    dialogAText: document.getElementById('dialog-a-text'),
    btnDialogClose: document.getElementById('btn-dialog-close'),
    btnDialogDone: document.getElementById('btn-dialog-done'),
    btnDialogPrev: document.getElementById('btn-dialog-prev'),
    btnDialogNext: document.getElementById('btn-dialog-next'),
    
    // Scroll To Top
    btnScrollToTop: document.getElementById('btn-scroll-to-top'),

    // Key Concepts DOM cache
    concepts: {
      search: document.getElementById('concepts-search'),
      difficultyFilters: document.getElementById('concepts-difficulty-filters'),
      topicsScrollbar: document.getElementById('concepts-topics-scrollbar'),
      container: document.getElementById('concepts-container')
    },

    // DE Cheat Sheet DOM cache
    cheatsheet: {
      langNav: document.getElementById('cheatsheet-lang-nav'),
      search: document.getElementById('cheatsheet-search'),
      levelFilters: document.getElementById('cheatsheet-level-filters'),
      progressBar: document.getElementById('cheatsheet-progress-bar'),
      container: document.getElementById('cheatsheet-container'),
      compTbody: document.getElementById('cheatsheet-comp-tbody')
    },
    
    // Personalised Prep DOM cache
    personalised: {
      domainList: document.getElementById('personalised-domain-list'),
      search: document.getElementById('personalised-search'),
      container: document.getElementById('personalised-container'),
      matchCount: document.getElementById('personalised-match-count'),
      difficultySelector: document.getElementById('personalised-difficulty-selector')
    },
    
    // Unified Prep Hub DOM cache
    prephub: {
      subnav: document.getElementById('prep-hub-subnav'),
      unifiedSearchInput: document.getElementById('unified-search-input'),
      unifiedSearchContainer: document.getElementById('unified-search-container'),
      unifiedMatchCount: document.getElementById('unified-match-count'),
      dbList: document.getElementById('unified-db-list'),
      domainList: document.getElementById('unified-domain-list'),
      difficultySelector: document.getElementById('unified-difficulty-selector'),
      statusSelector: document.getElementById('unified-status-selector'),
      clearFiltersBtn: document.getElementById('btn-unified-clear-filters')
    }
  };

  // --- DYNAMIC DATASET LOADING SYSTEM ---
  const DATASET_FILES = {
    'fabric_pbi': 'questions.js?v=1.0.2',
    'general': 'data_de.js?v=1.0.2',
    'concepts': 'data_concepts.js?v=1.0.2',
    'python': 'data_python.js?v=1.0.2',
    'mssql': 'data_mssql.js?v=1.0.2',
    'pyspark': 'data_pyspark.js?v=1.0.2',
    'sparksql': 'data_sparksql.js?v=1.0.2',
    'personalised': 'data_personalised.js?v=1.5.0'
  };

  const DATASET_GLOBALS = {
    'fabric_pbi': 'QUESTIONS_DB',
    'general': 'QUESTIONS_DE_DB',
    'concepts': 'CONCEPTS_DB',
    'python': 'PYTHON_DATA',
    'mssql': 'MSSQL_DATA',
    'pyspark': 'PYSPARK_DATA',
    'sparksql': 'SPARKSQL_DATA',
    'personalised': 'PERSONALISED_QUESTIONS'
  };

  function ensureDatasetsLoaded(keys) {
    const toLoad = keys.filter(key => {
      const globalVarName = DATASET_GLOBALS[key];
      // Mark as loaded if already defined on window (e.g. by unit tests / previous requests)
      if (window[globalVarName]) {
        state.loadedDatasets[key] = true;
      }
      return !state.loadedDatasets[key];
    });

    if (navigator.userAgent && navigator.userAgent.includes("jsdom")) {
      toLoad.forEach(key => {
        const globalVarName = DATASET_GLOBALS[key];
        if (!window[globalVarName]) {
          window[globalVarName] = [];
        }
        state.loadedDatasets[key] = true;
      });
      repopulateStateQuestions();
      return Promise.resolve();
    }

    if (toLoad.length === 0) {
      repopulateStateQuestions();
      return Promise.resolve();
    }

    showDbLoader(toLoad);

    const promises = toLoad.map(key => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = DATASET_FILES[key];
        script.async = true;
        script.onload = () => {
          state.loadedDatasets[key] = true;
          resolve();
        };
        script.onerror = (err) => {
          reject(new Error(`Failed to load dataset: ${key}`));
        };
        document.head.appendChild(script);
      });
    });

    return Promise.all(promises)
      .then(() => {
        repopulateStateQuestions();
        hideDbLoader();
      })
      .catch(err => {
        console.error(err);
        hideDbLoader();
        alert("Failed to load some interview database files. Please check your network connection.");
      });
  }

  function ensureDatasetsInBackground(keys) {
    const toLoad = keys.filter(key => {
      const globalVarName = DATASET_GLOBALS[key];
      if (window[globalVarName]) {
        state.loadedDatasets[key] = true;
      }
      return !state.loadedDatasets[key];
    });

    if (toLoad.length === 0) {
      return Promise.resolve();
    }

    const promises = toLoad.map(key => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = DATASET_FILES[key];
        script.async = true;
        script.onload = () => {
          state.loadedDatasets[key] = true;
          resolve();
        };
        script.onerror = () => {
          resolve();
        };
        document.head.appendChild(script);
      });
    });

    return Promise.all(promises).then(() => {
      repopulateStateQuestions();
      updateUnifiedSearchCounts();
    });
  }

  function showDbLoader(keys) {
    const overlay = document.getElementById('db-loader-overlay');
    const textEl = document.getElementById('db-loader-text');
    if (overlay && textEl) {
      const labels = keys.map(k => k.replace('_', ' ').toUpperCase());
      textEl.textContent = `Loading Database: ${labels.join(', ')}...`;
      overlay.classList.remove('hidden');
      overlay.style.opacity = '1';
    }
  }

  function hideDbLoader() {
    const overlay = document.getElementById('db-loader-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.classList.add('hidden');
      }, 300);
    }
  }

  function normalizeDifficulty(difficulty) {
    if (!difficulty) return 'MEDIUM';
    const d = String(difficulty).toUpperCase().trim();
    if (d === 'BEGINNER' || d === 'EASY') return 'EASY';
    if (d === 'INTERMEDIATE' || d === 'MEDIUM') return 'MEDIUM';
    if (d === 'ADVANCED' || d === 'HARD') return 'HARD';
    if (d === 'ARCHITECT') return 'ARCHITECT';
    return 'MEDIUM';
  }

  // Fix F: Dirty-flag to skip rebuild when data hasn't changed
  let _repopulateSignature = '';
  function repopulateStateQuestions() {
    // Build a signature from which datasets are currently loaded
    const sig = Object.keys(state.loadedDatasets).sort().join(',');
    if (sig === _repopulateSignature && state.questions.length > 0) return;
    _repopulateSignature = sig;

    const diffWeights = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3, 'ARCHITECT': 4 };
    const qList = [];

    // Update generalDeState.questions
    if (window.QUESTIONS_DE_DB) {
      generalDeState.questions = window.QUESTIONS_DE_DB;
    }

    // 1. Fabric & PBI
    if (window.QUESTIONS_DB) {
      window.QUESTIONS_DB.forEach(q => {
        qList.push({
          ...q,
          db: 'fabric_pbi',
          sourceDb: 'fabric_pbi',
          sourceLabel: 'Fabric & PBI',
          categoryLabel: q.category,
          difficulty: normalizeDifficulty(q.difficulty)
        });
      });
    }

    // 2. Personalised
    if (window.PERSONALISED_QUESTIONS) {
      window.PERSONALISED_QUESTIONS.forEach(q => {
        qList.push({
          ...q,
          db: 'personalised',
          sourceDb: 'personalised',
          sourceLabel: 'Personalised',
          categoryLabel: q.subdomain || q.domain || 'Personalised',
          difficulty: normalizeDifficulty(q.difficulty)
        });
      });
    }

    // 3. General DE
    if (window.QUESTIONS_DE_DB) {
      window.QUESTIONS_DE_DB.forEach(q => {
        qList.push({
          ...q,
          db: 'general',
          sourceDb: 'general',
          sourceLabel: 'General DE',
          categoryLabel: q.category,
          difficulty: normalizeDifficulty(q.difficulty)
        });
      });
    }

    // 4. Python
    if (window.PYTHON_DATA) {
      window.PYTHON_DATA.forEach(q => {
        qList.push({
          ...q,
          question: q.title,
          answer: q.description || '',
          db: 'python',
          sourceDb: 'python',
          sourceLabel: 'Python Coding',
          categoryLabel: q.category || 'Python',
          difficulty: normalizeDifficulty(q.level)
        });
      });
    }

    // 5. MSSQL
    if (window.MSSQL_DATA) {
      window.MSSQL_DATA.forEach(q => {
        qList.push({
          ...q,
          question: q.title,
          answer: q.description || '',
          db: 'mssql',
          sourceDb: 'mssql',
          sourceLabel: 'Advanced SQL',
          categoryLabel: q.category || 'SQL',
          difficulty: normalizeDifficulty(q.level)
        });
      });
    }

    // 6. PySpark
    if (window.PYSPARK_DATA) {
      window.PYSPARK_DATA.forEach(q => {
        qList.push({
          ...q,
          question: q.title,
          answer: q.description || '',
          db: 'pyspark',
          sourceDb: 'pyspark',
          sourceLabel: 'PySpark Coding',
          categoryLabel: q.category || 'PySpark',
          difficulty: normalizeDifficulty(q.level)
        });
      });
    }

    // 7. Spark SQL
    if (window.SPARKSQL_DATA) {
      window.SPARKSQL_DATA.forEach(q => {
        qList.push({
          ...q,
          question: q.title,
          answer: q.description || '',
          db: 'sparksql',
          sourceDb: 'sparksql',
          sourceLabel: 'Spark SQL Coding',
          categoryLabel: q.category || 'Spark SQL',
          difficulty: normalizeDifficulty(q.level)
        });
      });
    }

    state.questions = qList.sort((a, b) => {
      const weightA = diffWeights[a.difficulty] || 3;
      const weightB = diffWeights[b.difficulty] || 3;
      return weightA - weightB;
    });
  }

  function getNeededDatasetsForView(viewId, subTabId) {
    if (viewId === 'view-concepts') return ['concepts'];
    if (viewId === 'view-cheatsheet') return ['python', 'mssql', 'pyspark', 'sparksql'];
    if (viewId === 'view-spark-hub' || viewId === 'view-spark' || viewId === 'view-pyspark' || viewId === 'view-sparksql' || viewId === 'view-spark-compare') {
      if (subTabId === 'view-sparksql' || viewId === 'view-sparksql') return ['sparksql'];
      return ['general'];
    }
    if (viewId === 'view-prep-hub') {
      return ['fabric_pbi', 'general', 'personalised', 'python', 'mssql', 'pyspark', 'sparksql'];
    }
    return [];
  }

  function getUnifiedSearchNeededDatasets() {
    const dbFilter = state.activeUnifiedDb || 'ALL';
    if (dbFilter === 'ALL') {
      return ['fabric_pbi', 'general', 'personalised', 'python', 'mssql', 'pyspark', 'sparksql'];
    }
    return [dbFilter];
  }

  // Maps category code to nice human readable display name
  const displayNames = {
    'FABRIC': 'Microsoft Fabric',
    'POWER BI': 'Power BI',
    'ADF': 'Azure Data Factory',
    'SQL SERVER': 'SQL Server',
    'DATALAKE ARCHITECTURE': 'Data Lake Architecture',
    'SPARK & DATABRICKS': 'Spark & Databricks',
    'Databases & SQL': 'Databases & SQL',
    'Big Data': 'Big Data',
    'Cloud Platforms': 'Cloud Platforms',
    'ETL & Pipelines': 'ETL & Pipelines',
    'Data Engineering': 'Data Engineering',
    'Data Engineering (General)': 'Data Engineering',
    'Excel & Analytics': 'Excel & Analytics',
    'Data Visualization': 'Data Visualization',
    'Governance & Quality': 'Governance & Quality',
    'RAG': 'RAG (Retrieval-Augmented)',
    'DAG': 'DAG (Directed Acyclic Graph)',
    'AIRFLOW': 'Apache Airflow',
    'KAFKA': 'Apache Kafka',
    'SPARK_PYSPARK': 'Apache Spark / PySpark',
    'FLINK': 'Apache Flink',
    'DBT': 'dbt (Data Build Tool)',
    'VECTOR_DB': 'Vector Databases',
    'LLM_FRAMEWORKS': 'LLMs & Frameworks',
    'LAKEHOUSE': 'Data Lakehouse Formats',
    'CLOUD_DATA': 'Cloud Data Platforms',
    'CDC': 'Change Data Capture (CDC)',
    'INGESTION': 'Data Ingestion'
  };

  // Maps category code to CSS styles badges classes
  const badgeClasses = {
    'FABRIC': 'badge-fabric',
    'POWER BI': 'badge-pbi',
    'ADF': 'badge-adf',
    'SQL SERVER': 'badge-sql',
    'DATALAKE ARCHITECTURE': 'badge-dl',
    'SPARK & DATABRICKS': 'badge-spark',
    'Databases & SQL': 'badge-sql',
    'Big Data': 'badge-spark',
    'Cloud Platforms': 'badge-dl',
    'ETL & Pipelines': 'badge-adf',
    'Data Engineering': 'badge-fabric',
    'Data Engineering (General)': 'badge-fabric',
    'Excel & Analytics': 'badge-pbi',
    'Data Visualization': 'badge-pbi',
    'Governance & Quality': 'badge-dl',
    'RAG': 'badge-de',
    'DAG': 'badge-de',
    'AIRFLOW': 'badge-etl',
    'KAFKA': 'badge-spark',
    'SPARK_PYSPARK': 'badge-spark',
    'FLINK': 'badge-spark',
    'DBT': 'badge-de',
    'VECTOR_DB': 'badge-cloud',
    'LLM_FRAMEWORKS': 'badge-de',
    'LAKEHOUSE': 'badge-dl',
    'CLOUD_DATA': 'badge-cloud',
    'CDC': 'badge-etl',
    'INGESTION': 'badge-etl'
  };

  // --- INITIALIZATION & RECOVERY ---
  
  function init() {
    // Register Service Worker
    if ('serviceWorker' in navigator && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => console.log('Service Worker registered successfully:', reg.scope))
          .catch((err) => console.warn('Service Worker registration failed:', err));
      });
    }

    loadTheme();

    // Restore sidebar minimized preference
    const isSidebarCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    if (isSidebarCollapsed) {
      document.getElementById('app-container')?.classList.add('sidebar-collapsed');
    }

    loadProgress();
    setupEventListeners();
    
    // Check scroll position to show scroll to top button
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.addEventListener('scroll', () => {
        if (mainContent.scrollTop > 300) {
          DOM.btnScrollToTop.classList.remove('hidden');
        } else {
          DOM.btnScrollToTop.classList.add('hidden');
        }
      });
    }

    // Set initial view from URL hash, fallback to localStorage, or default to concepts
    let initialView = 'view-concepts';
    const hash = window.location.hash;
    const validViews = ['view-prep-hub', 'view-spark-hub', 'view-gcc', 'view-concepts', 'view-cheatsheet',
                        'view-personalised', 'view-general-de', 'view-practice', 'view-explainer', 'view-spark', 'view-pyspark', 'view-unified-search'];
    if (hash && (document.getElementById(hash.substring(1)) || validViews.includes(hash.substring(1)))) {
      initialView = hash.substring(1);
    } else {
      const savedView = localStorage.getItem('interview_prep_active_view');
      if (savedView && (document.getElementById(savedView) || validViews.includes(savedView))) {
        initialView = savedView;
      }
    }

    let subTab = null;
    if (initialView === 'view-prep-hub' || ['view-personalised', 'view-general-de', 'view-practice', 'view-explainer', 'view-unified-search'].includes(initialView)) {
      subTab = initialView === 'view-general-de' ? 'view-unified-search' : initialView;
      if (subTab === 'view-prep-hub') {
        subTab = 'view-unified-search';
      }
      initialView = 'view-prep-hub';
    } else if (initialView === 'view-spark-hub' || ['view-spark', 'view-pyspark'].includes(initialView)) {
      subTab = initialView === 'view-spark-hub' ? null : initialView;
      initialView = 'view-spark-hub';
    }

    const needed = getNeededDatasetsForView(initialView, subTab);
    ensureDatasetsLoaded(needed).then(() => {
      initExplainer();
      initPractice();
      initGeneralDe();
      initConcepts();
      initCheatsheet();
      initPersonalised();
      updateUnifiedSearchCounts();

      if (initialView === 'view-prep-hub') {
        switchView('view-prep-hub');
        switchPrepHubSubTab(subTab || 'view-unified-search');
      } else if (initialView === 'view-spark-hub') {
        switchView('view-spark-hub');
        if (subTab) switchSparkHubSubTab(subTab);
      } else {
        switchView(initialView);
      }

      // Listen to hashchange events for browser back/forward navigation
      window.addEventListener('hashchange', () => {
        const newHash = window.location.hash.substring(1);
        if (newHash && (document.getElementById(newHash) || validViews.includes(newHash)) && state.currentView !== newHash) {
          switchView(newHash);
        }
      });

      // Reveal the page now that JS has fully initialized (prevents FOUC / wrong counts flash)
      const revealPage = () => {
        document.body.style.transition = 'opacity 0.25s ease';
        document.body.style.opacity = '1';
      };
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(revealPage);
      } else {
        setTimeout(revealPage, 0);
      }

      // Background pre-fetch remaining datasets to ensure instant transitions
      setTimeout(() => {
        const remaining = Object.keys(DATASET_FILES).filter(k => !needed.includes(k));
        ensureDatasetsInBackground(remaining);
      }, 200);
    });
  }



  // --- THEME & UTILITIES ---

  // Load and apply progress from localStorage
  function loadProgress() {
    try {
      const savedProgress = localStorage.getItem('interview_prep_progress');
      if (savedProgress) {
        state.progress = JSON.parse(savedProgress);
      } else {
        state.progress = {};
      }
    } catch (e) {
      console.error("Could not load progress", e);
      state.progress = {};
    }
  }

  // Save progress to localStorage
  function saveProgress() {
    try {
      localStorage.setItem('interview_prep_progress', JSON.stringify(state.progress));
    } catch (e) {
      console.error("Could not save progress", e);
    }
  }

  // Update a single question status
  function updateQuestionStatus(questionId, newStatus) {
    if (newStatus === 'unseen') {
      delete state.progress[questionId];
    } else {
      state.progress[questionId] = newStatus;
    }
    saveProgress();
    
    // Sync UI elements if visible
    const explainerCardIndicator = document.querySelector(`.concept-card[data-id="${questionId}"] .status-indicator`);
    if (explainerCardIndicator) {
      explainerCardIndicator.className = `status-indicator status-${newStatus}${newStatus === 'unseen' ? ' hidden' : ''}`;
      explainerCardIndicator.textContent = newStatus;
    }
  }

  function loadTheme() {
    const savedTheme = localStorage.getItem('interview_prep_theme');
    if (savedTheme) {
      state.theme = savedTheme;
    } else {
      state.theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    applyTheme();
  }

  function applyTheme() {
    const root = document.documentElement;
    if (state.theme === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark');
      DOM.body.classList.add('theme-light');
      DOM.body.classList.remove('theme-dark');
      if (DOM.themeToggleBtn) DOM.themeToggleBtn.textContent = '🌙';
      if (DOM.themeToggleLabel) DOM.themeToggleLabel.textContent = 'Dark Theme';
      if (DOM.mobileThemeBtn) DOM.mobileThemeBtn.textContent = '🌙';
    } else {
      root.classList.add('theme-dark');
      root.classList.remove('theme-light');
      DOM.body.classList.add('theme-dark');
      DOM.body.classList.remove('theme-light');
      if (DOM.themeToggleBtn) DOM.themeToggleBtn.textContent = '☀️';
      if (DOM.themeToggleLabel) DOM.themeToggleLabel.textContent = 'Light Theme';
      if (DOM.mobileThemeBtn) DOM.mobileThemeBtn.textContent = '☀️';
    }
    localStorage.setItem('interview_prep_theme', state.theme);
    
    if (typeof updateChartThemes === 'function') {
      updateChartThemes();
    }
  }



  // --- SPA ROUTING ---
  
  function switchPrepHubSubTab(subTabId) {
    state.activePrepHubSubTab = subTabId;
    localStorage.setItem('interview_prep_active_subtab', subTabId);

    // Toggle active state of sub-tab chips
    const subnavChips = document.querySelectorAll('#prep-hub-subnav .topic-chip');
    subnavChips.forEach(chip => {
      if (chip.getAttribute('data-subtab') === subTabId) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    const needed = getNeededDatasetsForView('view-prep-hub', subTabId);
    
    // Check if everything is already loaded
    const allLoaded = needed.every(key => {
      const globalVarName = DATASET_GLOBALS[key];
      return state.loadedDatasets[key] || (window[globalVarName]);
    });

    const performSwitch = () => {
      // Keep all subview containers visible simultaneously
      const subviews = document.querySelectorAll('.prep-hub-subview');
      subviews.forEach(subview => {
        subview.classList.remove('hidden');
        subview.removeAttribute('hidden');
      });

      // Fix I: Only render the targeted section — not all four — to avoid 4x redundant work
      if (subTabId === 'view-unified-search' || subTabId === 'view-general-de') {
        updateUnifiedSearchCounts();
        renderUnifiedSearch(true);
      } else if (subTabId === 'view-explainer') {
        updateExplainerCounts();
        renderExplainer(true);
      } else if (subTabId === 'view-practice') {
        updatePracticeCounts();
        renderNicheSelection();
      } else if (subTabId === 'view-personalised') {
        updatePersonalisedCounts();
        renderPersonalised(true);
      } else {
        // Fallback: render all (first load or unknown tab)
        updateExplainerCounts(); renderExplainer();
        updatePracticeCounts(); renderNicheSelection();
        updatePersonalisedCounts(); renderPersonalised();
        updateUnifiedSearchCounts(); renderUnifiedSearch();
      }

      // Smoothly scroll the target section into view
      const targetElement = document.getElementById(subTabId);
      if (targetElement) {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
          const containerRect = mainContent.getBoundingClientRect();
          const elemRect = targetElement.getBoundingClientRect();
          const relativeTop = elemRect.top - containerRect.top + mainContent.scrollTop;
          mainContent.scrollTo({
            top: relativeTop - 16,
            behavior: 'smooth'
          });
        }
      }
    };

    if (allLoaded) {
      performSwitch();
    } else {
      ensureDatasetsLoaded(needed).then(performSwitch);
    }
  }

  function switchSparkHubSubTab(subTabId) {
    state.activeSparkHubSubTab = subTabId;
    localStorage.setItem('interview_prep_active_spark_subtab', subTabId);

    // Toggle active state of sub-tab chips
    const subnavChips = document.querySelectorAll('#spark-hub-subnav .topic-chip');
    subnavChips.forEach(chip => {
      if (chip.getAttribute('data-subtab') === subTabId) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    // Toggle visibility of subview containers
    const subviews = document.querySelectorAll('.spark-hub-subview');
    subviews.forEach(subview => {
      if (subview.id === subTabId) {
        subview.classList.remove('hidden');
        subview.removeAttribute('hidden');
      } else {
        subview.classList.add('hidden');
        subview.setAttribute('hidden', 'true');
      }
    });

    if (subTabId === 'view-sparksql') {
      renderSparkSqlCurriculum();
    }
  }

  function switchView(targetViewId) {
    let actualTargetViewId = targetViewId;
    let targetSubTabId = null;

    const mergedViews = ['view-personalised', 'view-general-de', 'view-practice', 'view-explainer', 'view-unified-search'];
    if (mergedViews.includes(targetViewId)) {
      targetSubTabId = targetViewId === 'view-general-de' ? 'view-unified-search' : targetViewId;
      actualTargetViewId = 'view-prep-hub';
    }

    const sparkMergedViews = ['view-spark', 'view-pyspark', 'view-sparksql', 'view-spark-compare'];
    if (sparkMergedViews.includes(targetViewId) || targetViewId === 'view-spark-hub') {
      targetSubTabId = targetViewId === 'view-spark-hub' ? null : targetViewId;
      actualTargetViewId = 'view-spark-hub';
    }

    const needed = getNeededDatasetsForView(actualTargetViewId, targetSubTabId);

    // Check if everything is already loaded
    const allLoaded = needed.every(key => {
      const globalVarName = DATASET_GLOBALS[key];
      return state.loadedDatasets[key] || (window[globalVarName]);
    });

    const performSwitch = () => {
      state.currentView = actualTargetViewId;
      localStorage.setItem('interview_prep_active_view', actualTargetViewId);
      
      // Update hash if different
      if (window.location.hash !== '#' + targetViewId) {
        window.location.hash = targetViewId;
      }
      
      // Hide active practice when leaving Niche Practice
      if (actualTargetViewId !== 'view-prep-hub' || targetSubTabId !== 'view-practice') {
        DOM.activePracticeScreen.classList.add('hidden');
        DOM.nicheSelectionScreen.classList.remove('hidden');
        
        const prHeader = document.getElementById('practice-header');
        const prScrollbar = document.getElementById('practice-topics-scrollbar');
        if (prHeader) prHeader.classList.remove('hidden');
        if (prScrollbar) prScrollbar.classList.remove('hidden');
      }
      
      // Switch active states of nav buttons (desktop sidebar)
      DOM.navBtns.forEach(btn => {
        const target = btn.getAttribute('data-target');
        if (target === actualTargetViewId || target === targetViewId) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // Sync mobile bottom nav tabs active state
      const mobileNavTabs = document.querySelectorAll('.mobile-nav-tab[data-target]');
      mobileNavTabs.forEach(tab => {
        const target = tab.getAttribute('data-target');
        if (target === actualTargetViewId || target === targetViewId) {
          tab.classList.add('active');
          // Scroll the active tab pill into view in the horizontal scroll container
          try { tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); } catch(e) {}
        } else {
          tab.classList.remove('active');
        }
      });

      // Sync More drawer items active state (kept for legacy compatibility)
      const moreDrawerItems = document.querySelectorAll('.mobile-more-item[data-target]');
      moreDrawerItems.forEach(item => {
        const target = item.getAttribute('data-target');
        if (target === actualTargetViewId || target === targetViewId) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      // Toggle view section visibility with clean starting styles
      DOM.pageViews.forEach(view => {
        if (view.id === actualTargetViewId) {
          view.classList.remove('hidden');
          view.removeAttribute('hidden');
          
          // Dynamically move the global footer to the bottom of the active page view
          const footer = document.getElementById('global-footer');
          if (footer) {
            view.appendChild(footer);
          }
        } else {
          view.classList.add('hidden');
          view.setAttribute('hidden', 'true');
        }
      });

      // Re-render appropriate contents
      if (actualTargetViewId === 'view-concepts') {
        renderConcepts();
      } else if (actualTargetViewId === 'view-cheatsheet') {
        renderCheatsheet();
      } else if (actualTargetViewId === 'view-prep-hub') {
        if (!targetSubTabId) {
          targetSubTabId = 'view-unified-search';
        }
        switchPrepHubSubTab(targetSubTabId);
      } else if (actualTargetViewId === 'view-spark-hub') {
        if (!targetSubTabId || targetSubTabId === 'view-spark-hub') {
          targetSubTabId = localStorage.getItem('interview_prep_active_spark_subtab') || 'view-spark';
        }
        switchSparkHubSubTab(targetSubTabId);
      }
      
      // Scroll back to top on view switch, unless navigating to a specific sub-tab inside Prep Hub or Spark Hub
      if (actualTargetViewId !== 'view-prep-hub' && actualTargetViewId !== 'view-spark-hub') {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
          mainContent.scrollTop = 0;
        }
        window.scrollTo({ top: 0 });
      }
    };

    if (allLoaded) {
      performSwitch();
    } else {
      ensureDatasetsLoaded(needed).then(performSwitch);
    }
  }
  // --- STATS & SVG COMPUTATION ---
  
  function getCategorySectionKey(q) {
    if (!q) return 'PLATFORM_STORAGE';
    const db = q.db || q.sourceDb || '';
    const cat = q.category || '';
    const lowerDb = db.toLowerCase();
    const lowerCat = cat.toLowerCase();
    
    // Check by database source first:
    if (lowerDb === 'python') return 'LANGUAGES_CLOUD';
    if (lowerDb === 'mssql') return 'LANGUAGES_CLOUD';
    if (lowerDb === 'pyspark') return 'COMPUTE_STREAMING';
    if (lowerDb === 'sparksql') return 'COMPUTE_STREAMING';
    
    // AI & Vector DBs
    if (
      lowerCat.includes('rag') || lowerCat.includes('vector') || lowerCat.includes('llm') || lowerCat.includes('ai')
    ) {
      return 'AI_VECTOR_DB';
    }

    // Languages & Cloud
    if (
      lowerCat.includes('python') || lowerCat.includes('decorator') || lowerCat.includes('generator') ||
      lowerCat.includes('concurrency') || lowerCat.includes('threading') || lowerCat.includes('pattern') ||
      lowerCat.includes('language') || lowerCat.includes('foundation') || lowerCat.includes('cleaning') ||
      lowerCat.includes('manipulation') || lowerCat.includes('functional') || lowerCat.includes('cloud') ||
      lowerCat.includes('finops') || lowerCat.includes('devops') || lowerCat.includes('personalised') ||
      lowerCat.includes('custom') || lowerCat.includes('error handling')
    ) {
      return 'LANGUAGES_CLOUD';
    }

    // Pipelines & Integration
    if (
      lowerCat.includes('adf') || lowerCat.includes('factory') || lowerCat.includes('pipeline') ||
      lowerCat.includes('orchestration') || lowerCat.includes('etl') || lowerCat.includes('elt') ||
      lowerCat.includes('ingestion') || lowerCat.includes('cdc') || lowerCat.includes('dbt') ||
      lowerCat.includes('airflow') || lowerCat.includes('dag') || lowerCat.includes('integration') ||
      lowerCat.includes('delta live tables')
    ) {
      return 'PIPELINES_INTEGRATION';
    }

    // Compute & Streaming
    if (
      lowerCat.includes('spark') || lowerCat.includes('pyspark') || lowerCat.includes('databricks') ||
      lowerCat.includes('distributed') || lowerCat.includes('kafka') || lowerCat.includes('flink') ||
      lowerCat.includes('streaming') || lowerCat.includes('big data') || lowerCat.includes('engineering') ||
      lowerCat.includes('tuning') || lowerCat.includes('resource') || lowerCat.includes('performance') ||
      lowerCat.includes('observability') || lowerCat.includes('monitoring') || lowerCat.includes('optimization')
    ) {
      return 'COMPUTE_STREAMING';
    }

    // Platform & Storage
    return 'PLATFORM_STORAGE';
  }

  function getStandardizedDomain(q) {
    if (!q) return 'General Data Engineering';
    const sourceDb = q.sourceDb || q.db || '';
    const cat = (q.categoryLabel || q.category || '').toUpperCase().trim();
    
    // 1. Compute & Orchestration
    if (
      cat.includes('SPARK') || 
      cat.includes('DATABRICKS') || 
      cat.includes('AIRFLOW') || 
      cat.includes('FLINK') || 
      cat.includes('BIG DATA') || 
      cat.includes('DISTRIBUTED') || 
      cat.includes('RESOURCE') ||
      sourceDb === 'pyspark'
    ) {
      return 'Compute & Orchestration';
    }
    
    // 2. Databases, SQL & Storage
    if (
      cat.includes('SQL') || 
      cat.includes('DATABASE') || 
      cat.includes('QUERY') || 
      cat.includes('JOINS') || 
      cat.includes('AGGREGATION') || 
      cat.includes('DML') || 
      cat.includes('DDL') || 
      cat.includes('PROGRAMMABILITY') || 
      sourceDb === 'mssql' || 
      sourceDb === 'sparksql'
    ) {
      return 'Databases, SQL & Storage';
    }
    
    // 3. Data Pipelines & Ingestion
    if (
      cat.includes('ADF') || 
      cat.includes('PIPELINE') || 
      cat.includes('INGESTION') || 
      cat.includes('CDC') || 
      cat.includes('KAFKA') || 
      cat.includes('DBT') || 
      cat.includes('ETL') || 
      cat.includes('INTEGRATION')
    ) {
      return 'Data Pipelines & Ingestion';
    }
    
    // 4. Data Lakehouse & Architecture
    if (
      cat.includes('LAKEHOUSE') || 
      cat.includes('DATALAKE') || 
      cat.includes('DELTA') || 
      cat.includes('MODELING') || 
      cat.includes('VAULT') || 
      cat.includes('STORAGE') || 
      cat.includes('ARCHITECTURE') || 
      cat.includes('MEDALLION') || 
      cat.includes('FORMAT')
    ) {
      return 'Data Lakehouse & Architecture';
    }
    
    // 5. Data Governance & Quality
    if (
      cat.includes('GOVERNANCE') || 
      cat.includes('QUALITY') || 
      cat.includes('SECURITY') || 
      cat.includes('DEVOPS') || 
      cat.includes('METADATA') || 
      cat.includes('CATALOG') || 
      cat.includes('TOPOGRAPHY') || 
      cat.includes('LINEAGE')
    ) {
      return 'Data Governance & Quality';
    }
    
    // 6. Analytics, BI & AI
    if (
      cat.includes('FABRIC') || 
      cat.includes('POWER BI') || 
      cat.includes('VISUALIZATION') || 
      cat.includes('EXCEL') || 
      cat.includes('ANALYTICS') || 
      cat.includes('RAG') || 
      cat.includes('VECTOR') || 
      cat.includes('LLM') || 
      cat.includes('SEMANTIC')
    ) {
      return 'Analytics, BI & AI';
    }
    
    // 7. FinOps & Performance Optimization
    if (
      cat.includes('FINOPS') || 
      cat.includes('COST') || 
      cat.includes('PERFORMANCE') || 
      cat.includes('OPTIMIZATION') || 
      cat.includes('TUNING') || 
      cat.includes('DEBUG')
    ) {
      return 'FinOps & Performance Optimization';
    }
    
    return 'General Data Engineering';
  }



  // --- CONCEPT EXPLAINER ACCORDION & FILTERS ---
  
  function updateExplainerCounts() {
    const query = (document.getElementById('explainer-search') ? document.getElementById('explainer-search').value : '').toLowerCase().trim();
    const activeDiff = state.activeExplainerDifficulty || 'ALL';
    
    // Compile pool of questions
    const pool = state.questions.filter(q => q.db === 'fabric_pbi');
    
    // Get unique categories present in pool
    const categoriesMap = new Map();
    pool.forEach(q => {
      if (q.category) {
        categoriesMap.set(q.category, true);
      }
    });
    const categories = Array.from(categoriesMap.keys()).sort();
    
    const container = document.getElementById('explainer-topic-list');
    if (container) {
      container.innerHTML = '';
      
      // All Topics button count
      const totalMatching = pool.filter(q => {
        const matchesSearch = !query || 
                              (q.question || '').toLowerCase().includes(query) || 
                              (q.answer || '').toLowerCase().includes(query) || 
                              (q.category || '').toLowerCase().includes(query);
        const matchesDiff = (activeDiff === 'ALL' || (q.difficulty || 'HARD').toUpperCase() === activeDiff);
        return matchesSearch && matchesDiff;
      }).length;
      
      const allBtn = document.createElement('button');
      allBtn.setAttribute('data-category', 'ALL');
      allBtn.className = 'qa-sidebar-btn' + (state.activeExplainerCategory === 'ALL' ? ' active' : '');
      allBtn.innerHTML = `
        <span>📂 All Topics</span>
        <span class="qa-btn-count-badge">${totalMatching.toLocaleString()}</span>
      `;
      allBtn.addEventListener('click', () => {
        state.activeExplainerCategory = 'ALL';
        container.querySelectorAll('.qa-sidebar-btn').forEach(b => b.classList.remove('active'));
        allBtn.classList.add('active');
        renderExplainer(true);
      });
      container.appendChild(allBtn);
      
      categories.forEach(catName => {
        const catPool = pool.filter(q => q.category === catName);
        
        const matchCount = catPool.filter(q => {
          const matchesSearch = !query || 
                                (q.question || '').toLowerCase().includes(query) || 
                                (q.answer || '').toLowerCase().includes(query) || 
                                (q.category || '').toLowerCase().includes(query);
          const matchesDiff = (activeDiff === 'ALL' || (q.difficulty || 'HARD').toUpperCase() === activeDiff);
          return matchesSearch && matchesDiff;
        }).length;
        
        if (matchCount === 0) return;
        
        const displayName = displayNames[catName] || catName;
        
        const btn = document.createElement('button');
        btn.setAttribute('data-category', catName);
        btn.className = 'qa-sidebar-btn' + (state.activeExplainerCategory === catName ? ' active' : '');
        btn.innerHTML = `
          <span>${displayName}</span>
          <span class="qa-btn-count-badge">${matchCount}</span>
        `;
        btn.addEventListener('click', () => {
          state.activeExplainerCategory = catName;
          container.querySelectorAll('.qa-sidebar-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderExplainer(true);
        });
        container.appendChild(btn);
      });
    }
  }

  function renderExplainer(resetResults = true) {
    const filterCat = state.activeExplainerCategory || 'ALL';
    const activeDiff = state.activeExplainerDifficulty || 'ALL';
    const query = (document.getElementById('explainer-search') ? document.getElementById('explainer-search').value : '').toLowerCase().trim();
    
    // Group active questions by Category
    const pool = state.questions.filter(q => q.db === 'fabric_pbi');
    
    const filtered = pool.filter(q => {
      const matchesCat = (filterCat === 'ALL' || q.category === filterCat);
      const matchesDiff = (activeDiff === 'ALL' || (q.difficulty || 'HARD').toUpperCase() === activeDiff);
      const matchesSearch = !query || 
                            (q.question || '').toLowerCase().includes(query) || 
                            (q.answer || '').toLowerCase().includes(query) || 
                            (q.category || '').toLowerCase().includes(query);
      return matchesCat && matchesDiff && matchesSearch;
    });
    
    const container = document.getElementById('explainer-accordion');
    if (!container) return;
    container.innerHTML = '';
    
    if (document.getElementById('explainer-match-count')) {
      document.getElementById('explainer-match-count').textContent = `Showing ${filtered.length.toLocaleString()} matching concepts`;
    }
    
    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="no-results-card" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: var(--card-bg); border: 1px dashed var(--card-border); border-radius: 16px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 1.25rem; color: var(--text-secondary); opacity: 0.4;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <h4 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.15rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">No matching concepts found</h4>
          <p style="color: var(--text-secondary); font-size: 0.88rem;">Try adjusting your filters or search keywords.</p>
        </div>
      `;
      return;
    }
    
    // Group questions by Category
    const categoriesMap = {};
    filtered.forEach(q => {
      if (!categoriesMap[q.category]) {
        categoriesMap[q.category] = [];
      }
      categoriesMap[q.category].push(q);
    });
    
    const sortedCats = Object.keys(categoriesMap).sort();
    
    if (!state.explainerLimits) state.explainerLimits = {};
    if (resetResults) {
      state.expandedExplainerSections = {};
      state.explainerLimits = {};
      if (sortedCats.length > 0) {
        state.expandedExplainerSections[sortedCats[0]] = true;
      }
    }
    
    let overallIdx = 1;
    
    sortedCats.forEach(catName => {
      const sectItems = categoriesMap[catName];
      const isExpanded = !!state.expandedExplainerSections[catName];
      
      const sectionWrapper = document.createElement('div');
      sectionWrapper.className = 'unified-section-wrapper reveal-on-scroll';
      sectionWrapper.style.marginBottom = '1.25rem';
      sectionWrapper.style.border = '1px solid var(--card-border)';
      sectionWrapper.style.borderRadius = '16px';
      sectionWrapper.style.overflow = 'hidden';
      
      const badgeClass = badgeClasses[catName] || 'badge-fabric';
      const sectEmoji = catName.includes('FABRIC') ? '📊' :
                        catName.includes('POWER BI') ? '📊' :
                        catName.includes('ADF') ? '⚡' :
                        catName.includes('SQL') ? '🔷' :
                        catName.includes('LAKEHOUSE') ? '🔥' : '⚙️';
      
      const headerDiv = document.createElement('div');
      headerDiv.className = 'unified-section-header';
      headerDiv.style.cursor = 'pointer';
      headerDiv.style.display = 'flex';
      headerDiv.style.alignItems = 'center';
      headerDiv.style.justifyContent = 'space-between';
      headerDiv.style.padding = '1.1rem 1.5rem';
      headerDiv.style.background = 'rgba(255, 255, 255, 0.02)';
      
      headerDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 1.15rem;">${sectEmoji}</span>
          <span style="font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.95rem; color: var(--text-primary); letter-spacing: 0.02em;">${displayNames[catName] || catName}</span>
          <span style="background: rgba(255, 255, 255, 0.08); color: var(--text-secondary); font-size: 0.72rem; padding: 2px 8px; border-radius: 99px; font-weight: 600;">${sectItems.length}</span>
        </div>
        <svg class="section-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.25s ease; transform: ${isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}; color: var(--text-secondary);"><polyline points="6 9 12 15 18 9"/></svg>
      `;
      sectionWrapper.appendChild(headerDiv);
      
      // Body
      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'unified-section-body';
      bodyDiv.style.display = isExpanded ? 'block' : 'none';
      bodyDiv.style.padding = '1.5rem';
      bodyDiv.style.borderTop = '1px solid var(--card-border)';
      bodyDiv.style.background = 'rgba(0, 0, 0, 0.1)';
      
      {
        // Section sub-header controls (counts and expand/collapse pills)
        const subHeaderDiv = document.createElement('div');
        subHeaderDiv.className = 'qa-section-controls';
        subHeaderDiv.style.display = 'flex';
        subHeaderDiv.style.justifyContent = 'space-between';
        subHeaderDiv.style.alignItems = 'center';
        subHeaderDiv.style.marginBottom = '1.25rem';
        subHeaderDiv.style.padding = '0.5rem 1rem';
        subHeaderDiv.style.background = 'rgba(255, 255, 255, 0.02)';
        subHeaderDiv.style.borderRadius = '10px';
        subHeaderDiv.style.border = '1px solid var(--card-border)';
        
        const countText = document.createElement('span');
        countText.style.fontSize = '0.8rem';
        countText.style.fontWeight = '600';
        countText.style.color = 'var(--text-secondary)';
        countText.textContent = `Showing ${sectItems.length} matching questions`;
        subHeaderDiv.appendChild(countText);
        
        const pillsContainer = document.createElement('div');
        pillsContainer.style.display = 'flex';
        pillsContainer.style.gap = '0.5rem';
        
        const expandPill = document.createElement('button');
        expandPill.className = 'control-btn';
        expandPill.style.padding = '0.3rem 0.6rem';
        expandPill.style.fontSize = '0.7rem';
        expandPill.style.borderRadius = '6px';
        expandPill.style.cursor = 'pointer';
        expandPill.style.border = '1px solid var(--card-border)';
        expandPill.style.background = 'rgba(255, 255, 255, 0.02)';
        expandPill.style.color = 'var(--text-secondary)';
        expandPill.textContent = 'Expand All';
        expandPill.addEventListener('click', (e) => {
          e.stopPropagation();
          subGrid.querySelectorAll('.concept-accordion-card').forEach(card => {
            card.classList.add('expanded');
            const body = card.querySelector('.level-card-body');
            if (body) body.style.display = 'block';
            const chevron = card.querySelector('.level-chevron');
            if (chevron) chevron.style.transform = 'rotate(180deg)';
          });
        });
        
        const collapsePill = document.createElement('button');
        collapsePill.className = 'control-btn';
        collapsePill.style.padding = '0.3rem 0.6rem';
        collapsePill.style.fontSize = '0.7rem';
        collapsePill.style.borderRadius = '6px';
        collapsePill.style.cursor = 'pointer';
        collapsePill.style.border = '1px solid var(--card-border)';
        collapsePill.style.background = 'rgba(255, 255, 255, 0.02)';
        collapsePill.style.color = 'var(--text-secondary)';
        collapsePill.textContent = 'Collapse All';
        collapsePill.addEventListener('click', (e) => {
          e.stopPropagation();
          subGrid.querySelectorAll('.concept-accordion-card').forEach(card => {
            card.classList.remove('expanded');
            const body = card.querySelector('.level-card-body');
            if (body) body.style.display = 'none';
            const chevron = card.querySelector('.level-chevron');
            if (chevron) chevron.style.transform = 'rotate(0deg)';
          });
        });
        
        pillsContainer.appendChild(expandPill);
        pillsContainer.appendChild(collapsePill);
        subHeaderDiv.appendChild(pillsContainer);
        bodyDiv.appendChild(subHeaderDiv);
        
        // Sub-grid
        const subGrid = document.createElement('div');
        subGrid.className = 'concepts-grid';
        bodyDiv.appendChild(subGrid);
        
        const limit = state.explainerLimits[catName] || 30;
        const visibleItems = sectItems.slice(0, limit);
        
        visibleItems.forEach(q => {
          const card = document.createElement('div');
          card.className = 'concept-accordion-card';
          
          const cardHeader = document.createElement('div');
          cardHeader.className = 'level-card-header';
          cardHeader.style.cursor = 'pointer';
          cardHeader.innerHTML = `
            <div class="level-badge" style="background: var(--cat-fabric); color: #fff; font-size: 0.8rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; width: 42px; height: 42px; border-radius: 10px;">${overallIdx++}</div>
            <div class="level-meta" style="flex: 1; min-width: 0;">
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 4px; align-items: center;">
                <span class="stats-badge ${badgeClass}" style="font-size: 0.65rem; padding: 2px 6px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; background: rgba(255, 255, 255, 0.08); color: var(--text-primary); border-radius: 4px;">${q.niche}</span>
                <span style="font-size: 0.75rem; font-weight: 600; color: var(--accent);">${q.difficulty || 'HARD'}</span>
              </div>
              <h4 class="level-title" style="margin: 0; font-size: 0.95rem; font-weight: 600; line-height: 1.4; color: var(--text-primary);">${escapeHTML(q.question)}</h4>
            </div>
            <svg class="level-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.25s ease;"><polyline points="6 9 12 15 18 9"/></svg>
          `;
          
          const cardBody = document.createElement('div');
          cardBody.className = 'level-card-body';
          cardBody.style.display = 'none';
          cardBody.style.borderTop = '1px solid var(--card-border)';
          cardBody.style.padding = '1.25rem';
          cardBody.style.background = 'rgba(255, 255, 255, 0.01)';
          
          const formattedAnswer = formatArchitectAnswer(q.answer);
          cardBody.innerHTML = `
            <div style="font-family: 'Outfit', sans-serif; font-size: 0.92rem; line-height: 1.6; color: var(--text-secondary);">
              ${formattedAnswer}
            </div>
          `;
          
          card.appendChild(cardHeader);
          card.appendChild(cardBody);
          
          cardHeader.addEventListener('click', () => {
            const isOpen = cardBody.style.display !== 'none';
            const chevron = cardHeader.querySelector('.level-chevron');
            if (chevron) {
              chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            }
            if (isOpen) {
              cardBody.style.display = 'none';
              card.classList.remove('expanded');
            } else {
              cardBody.style.display = 'block';
              card.classList.add('expanded');
              if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                MathJax.typesetPromise([cardBody]).catch(err => console.error("MathJax error:", err));
              }
            }
          });
          
          subGrid.appendChild(card);
        });

        // Load More button inside section
        if (sectItems.length > limit) {
          const loadMoreWrap = document.createElement('div');
          loadMoreWrap.style.display = 'flex';
          loadMoreWrap.style.justifyContent = 'center';
          loadMoreWrap.style.marginTop = '1.5rem';

          const loadMoreBtn = document.createElement('button');
          loadMoreBtn.className = 'de-load-more-btn';
          loadMoreBtn.style.padding = '0.5rem 1.5rem';
          loadMoreBtn.style.fontSize = '0.85rem';
          loadMoreBtn.textContent = `Show More Questions (showing ${limit} of ${sectItems.length})`;
          
          loadMoreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            state.explainerLimits[catName] = limit + 30;
            renderExplainer(false);
          });

          loadMoreWrap.appendChild(loadMoreBtn);
          bodyDiv.appendChild(loadMoreWrap);
        }
      }
      
      sectionWrapper.appendChild(bodyDiv);
      
      headerDiv.addEventListener('click', () => {
        state.expandedExplainerSections[catName] = !state.expandedExplainerSections[catName];
        renderExplainer(false);
      });
      
      container.appendChild(sectionWrapper);
    });
  }

  // --- NICHE PRACTICE SELECTION GRID ---

  function initExplainer() {
    setupExplainerListeners();
    updateExplainerCounts();
    renderExplainer();
  }

  function setupExplainerListeners() {
    const searchInput = document.getElementById('explainer-search');
    if (searchInput) {
      let _explainerSearchDebounce;
      searchInput.addEventListener('input', () => {
        clearTimeout(_explainerSearchDebounce);
        _explainerSearchDebounce = setTimeout(() => {
          updateExplainerCounts();
          renderExplainer(true);
        }, 250);
      });
    }

    const diffSelector = document.getElementById('explainer-difficulty-selector');
    if (diffSelector) {
      const btns = diffSelector.querySelectorAll('.qa-sidebar-btn[data-difficulty]');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.activeExplainerDifficulty = btn.getAttribute('data-difficulty') || 'ALL';
          updateExplainerCounts();
          renderExplainer(true);
        });
      });
    }

    const btnExpandAll = document.getElementById('btn-explainer-expand-all');
    if (btnExpandAll) {
      btnExpandAll.addEventListener('click', () => {
        const pool = state.questions.filter(q => q.db === 'fabric_pbi');
        const categoriesMap = new Map();
        pool.forEach(q => {
          if (q.category) categoriesMap.set(q.category, true);
        });
        categoriesMap.forEach((val, catName) => {
          state.expandedExplainerSections[catName] = true;
        });
        renderExplainer(false);
        document.querySelectorAll('#explainer-accordion .concept-accordion-card').forEach(card => {
          card.classList.add('expanded');
          const body = card.querySelector('.level-card-body');
          if (body) body.style.display = 'block';
          const chevron = card.querySelector('.level-chevron');
          if (chevron) chevron.style.transform = 'rotate(180deg)';
        });
      });
    }

    const btnCollapseAll = document.getElementById('btn-explainer-collapse-all');
    if (btnCollapseAll) {
      btnCollapseAll.addEventListener('click', () => {
        state.expandedExplainerSections = {};
        renderExplainer(false);
        document.querySelectorAll('#explainer-accordion .concept-accordion-card').forEach(card => {
          card.classList.remove('expanded');
          const body = card.querySelector('.level-card-body');
          if (body) body.style.display = 'none';
          const chevron = card.querySelector('.level-chevron');
          if (chevron) chevron.style.transform = 'rotate(0deg)';
        });
      });
    }
  }

  function initPractice() {
    setupPracticeListeners();
    updatePracticeCounts();
    renderNicheSelection();
  }

  function setupPracticeListeners() {
    const searchInput = document.getElementById('practice-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        updatePracticeCounts();
        renderNicheSelection(true);
      });
    }

    const diffSelector = document.getElementById('practice-difficulty-selector');
    if (diffSelector) {
      const btns = diffSelector.querySelectorAll('.qa-sidebar-btn[data-difficulty]');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.activePracticeDifficulty = btn.getAttribute('data-difficulty') || 'ALL';
          updatePracticeCounts();
          renderNicheSelection(true);
        });
      });
    }

    const btnExpandAll = document.getElementById('btn-practice-expand-all');
    if (btnExpandAll) {
      btnExpandAll.addEventListener('click', () => {
        const pool = state.questions.filter(q => q.db === 'fabric_pbi');
        const categoriesMap = new Map();
        pool.forEach(q => {
          if (q.category) categoriesMap.set(q.category, true);
        });
        categoriesMap.forEach((val, catName) => {
          state.expandedPracticeSections[catName] = true;
        });
        renderNicheSelection(false);
      });
    }

    const btnCollapseAll = document.getElementById('btn-practice-collapse-all');
    if (btnCollapseAll) {
      btnCollapseAll.addEventListener('click', () => {
        state.expandedPracticeSections = {};
        renderNicheSelection(false);
      });
    }
  }

  function updatePracticeCounts() {
    const query = (document.getElementById('practice-search') ? document.getElementById('practice-search').value : '').toLowerCase().trim();
    const activeDiff = state.activePracticeDifficulty || 'ALL';
    const pool = state.questions.filter(q => q.db === 'fabric_pbi');
    
    const categoriesMap = new Map();
    pool.forEach(q => {
      if (q.category) {
        categoriesMap.set(q.category, true);
      }
    });
    const categories = Array.from(categoriesMap.keys()).sort();
    
    const container = document.getElementById('practice-category-list');
    if (container) {
      container.innerHTML = '';
      
      const totalMatching = pool.filter(q => {
        const matchesSearch = !query || 
                              (q.niche || '').toLowerCase().includes(query) ||
                              (q.category || '').toLowerCase().includes(query) ||
                              (q.question || '').toLowerCase().includes(query) || 
                              (q.answer || '').toLowerCase().includes(query);
        const matchesDiff = (activeDiff === 'ALL' || (q.difficulty || 'HARD').toUpperCase() === activeDiff);
        return matchesSearch && matchesDiff;
      }).length;
      
      const allBtn = document.createElement('button');
      allBtn.setAttribute('data-category', 'ALL');
      allBtn.className = 'qa-sidebar-btn' + (state.activePracticeCategory === 'ALL' ? ' active' : '');
      allBtn.innerHTML = `
        <span>📂 All Topics</span>
        <span class="qa-btn-count-badge">${totalMatching.toLocaleString()}</span>
      `;
      allBtn.addEventListener('click', () => {
        state.activePracticeCategory = 'ALL';
        container.querySelectorAll('.qa-sidebar-btn').forEach(b => b.classList.remove('active'));
        allBtn.classList.add('active');
        renderNicheSelection(true);
      });
      container.appendChild(allBtn);
      
      categories.forEach(catName => {
        const catPool = pool.filter(q => q.category === catName);
        
        const matchCount = catPool.filter(q => {
          const matchesSearch = !query || 
                                (q.niche || '').toLowerCase().includes(query) ||
                                (q.category || '').toLowerCase().includes(query) ||
                                (q.question || '').toLowerCase().includes(query) || 
                                (q.answer || '').toLowerCase().includes(query);
          const matchesDiff = (activeDiff === 'ALL' || (q.difficulty || 'HARD').toUpperCase() === activeDiff);
          return matchesSearch && matchesDiff;
        }).length;
        
        if (matchCount === 0) return;
        
        const displayName = displayNames[catName] || catName;
        
        const btn = document.createElement('button');
        btn.setAttribute('data-category', catName);
        btn.className = 'qa-sidebar-btn' + (state.activePracticeCategory === catName ? ' active' : '');
        btn.innerHTML = `
          <span>${displayName}</span>
          <span class="qa-btn-count-badge">${matchCount}</span>
        `;
        btn.addEventListener('click', () => {
          state.activePracticeCategory = catName;
          container.querySelectorAll('.qa-sidebar-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderNicheSelection(true);
        });
        container.appendChild(btn);
      });
    }
  }

  function renderNicheSelection(resetResults = true) {
    const query = (document.getElementById('practice-search') ? document.getElementById('practice-search').value : '').toLowerCase().trim();
    const activeDiff = state.activePracticeDifficulty || 'ALL';
    const filterCat = state.activePracticeCategory || 'ALL';
    
    const pool = state.questions.filter(q => q.db === 'fabric_pbi');
    
    const filteredQuestions = pool.filter(q => {
      const matchesCat = (filterCat === 'ALL' || q.category === filterCat);
      const matchesDiff = (activeDiff === 'ALL' || (q.difficulty || 'HARD').toUpperCase() === activeDiff);
      const matchesSearch = !query || 
                            (q.niche || '').toLowerCase().includes(query) ||
                            (q.category || '').toLowerCase().includes(query) ||
                            (q.question || '').toLowerCase().includes(query) || 
                            (q.answer || '').toLowerCase().includes(query);
      return matchesCat && matchesDiff && matchesSearch;
    });
    
    const container = document.getElementById('niche-launcher-grid');
    if (!container) return;
    container.innerHTML = '';
    
    const uniqueNiches = new Set(filteredQuestions.map(q => q.niche));
    if (document.getElementById('practice-match-count')) {
      document.getElementById('practice-match-count').textContent = `Showing ${uniqueNiches.size.toLocaleString()} matching niches`;
    }
    
    if (filteredQuestions.length === 0) {
      container.innerHTML = `
        <div class="no-results-card" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: var(--card-bg); border: 1px dashed var(--card-border); border-radius: 16px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 1.25rem; color: var(--text-secondary); opacity: 0.4;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <h4 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.15rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">No matching practice niches found</h4>
          <p style="color: var(--text-secondary); font-size: 0.88rem;">Try adjusting your filters or search keywords.</p>
        </div>
      `;
      return;
    }
    
    const nicheSummary = {};
    filteredQuestions.forEach(q => {
      if (!nicheSummary[q.niche]) {
        nicheSummary[q.niche] = {
          nicheName: q.niche,
          category: q.category,
          total: 0,
          difficulties: new Set()
        };
      }
      nicheSummary[q.niche].total++;
      nicheSummary[q.niche].difficulties.add(q.difficulty || 'HARD');
    });
    
    const categoriesMap = {};
    Object.values(nicheSummary).forEach(n => {
      if (!categoriesMap[n.category]) {
        categoriesMap[n.category] = [];
      }
      categoriesMap[n.category].push(n);
    });
    
    const sortedCats = Object.keys(categoriesMap).sort();
    
    if (resetResults) {
      state.expandedPracticeSections = {};
      if (sortedCats.length > 0) {
        state.expandedPracticeSections[sortedCats[0]] = true;
      }
    }
    
    sortedCats.forEach(catName => {
      const sectItems = categoriesMap[catName];
      const isExpanded = !!state.expandedPracticeSections[catName];
      
      const sectionWrapper = document.createElement('div');
      sectionWrapper.className = 'unified-section-wrapper reveal-on-scroll';
      sectionWrapper.style.marginBottom = '1.25rem';
      sectionWrapper.style.border = '1px solid var(--card-border)';
      sectionWrapper.style.borderRadius = '16px';
      sectionWrapper.style.overflow = 'hidden';
      
      const badgeClass = badgeClasses[catName] || 'badge-fabric';
      const sectEmoji = catName.includes('FABRIC') ? '📊' :
                        catName.includes('POWER BI') ? '📊' :
                        catName.includes('ADF') ? '⚡' :
                        catName.includes('SQL') ? '🔷' :
                        catName.includes('LAKEHOUSE') ? '🔥' : '⚙️';
      
      const headerDiv = document.createElement('div');
      headerDiv.className = 'unified-section-header';
      headerDiv.style.cursor = 'pointer';
      headerDiv.style.display = 'flex';
      headerDiv.style.alignItems = 'center';
      headerDiv.style.justifyContent = 'space-between';
      headerDiv.style.padding = '1.1rem 1.5rem';
      headerDiv.style.background = 'rgba(255, 255, 255, 0.02)';
      
      headerDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 1.15rem;">${sectEmoji}</span>
          <span style="font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.95rem; color: var(--text-primary); letter-spacing: 0.02em;">${displayNames[catName] || catName}</span>
          <span style="background: rgba(255, 255, 255, 0.08); color: var(--text-secondary); font-size: 0.72rem; padding: 2px 8px; border-radius: 99px; font-weight: 600;">${sectItems.length}</span>
        </div>
        <svg class="section-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.25s ease; transform: ${isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}; color: var(--text-secondary);"><polyline points="6 9 12 15 18 9"/></svg>
      `;
      sectionWrapper.appendChild(headerDiv);
      
      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'unified-section-body';
      bodyDiv.style.display = isExpanded ? 'block' : 'none';
      bodyDiv.style.padding = '1.5rem';
      bodyDiv.style.borderTop = '1px solid var(--card-border)';
      bodyDiv.style.background = 'rgba(0, 0, 0, 0.1)';
      
      {
        const subHeaderDiv = document.createElement('div');
        subHeaderDiv.className = 'qa-section-controls';
        subHeaderDiv.style.display = 'flex';
        subHeaderDiv.style.justifyContent = 'space-between';
        subHeaderDiv.style.alignItems = 'center';
        subHeaderDiv.style.marginBottom = '1.25rem';
        subHeaderDiv.style.padding = '0.5rem 1rem';
        subHeaderDiv.style.background = 'rgba(255, 255, 255, 0.02)';
        subHeaderDiv.style.borderRadius = '10px';
        subHeaderDiv.style.border = '1px solid var(--card-border)';
        
        const countText = document.createElement('span');
        countText.style.fontSize = '0.8rem';
        countText.style.fontWeight = '600';
        countText.style.color = 'var(--text-secondary)';
        countText.textContent = `Showing ${sectItems.length} matching niches`;
        subHeaderDiv.appendChild(countText);
        bodyDiv.appendChild(subHeaderDiv);
        
        const subGrid = document.createElement('div');
        subGrid.className = 'concepts-grid';
        bodyDiv.appendChild(subGrid);
        
        sectItems.forEach(n => {
          const card = document.createElement('div');
          card.className = 'concept-card';
          card.style.minHeight = '140px';
          card.style.cursor = 'pointer';
          
          const diffsHtml = Array.from(n.difficulties).map(d => `<span class="difficulty-badge badge-${d.toLowerCase()}">${d}</span>`).join(' ');
          card.innerHTML = `
            <div>
              <span class="stats-badge ${badgeClass}" style="display:inline-block; margin-bottom: 0.5rem; font-size:0.75rem;">${displayNames[n.category] || n.category}</span>
              <h4 style="font-size: 1rem; font-weight: 500; line-height:1.4; word-break:break-word;">${n.nicheName} <div style="margin-top:0.35rem;">${diffsHtml}</div></h4>
            </div>
            <div class="concept-card-footer" style="margin-top:1rem; border-top:1px solid var(--card-border); padding-top:0.5rem; display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size: 0.8rem; font-weight: 500; color:var(--text-secondary);">${n.total} questions</span>
              <button class="status-btn status-btn-mastered active" style="padding:0.35rem 0.65rem; font-size:0.75rem;">Practice</button>
            </div>
          `;
          
          card.addEventListener('click', (e) => {
            startPracticeSession(n.nicheName);
          });
          
          subGrid.appendChild(card);
        });
      }
      
      sectionWrapper.appendChild(bodyDiv);
      
      headerDiv.addEventListener('click', () => {
        state.expandedPracticeSections[catName] = !state.expandedPracticeSections[catName];
        renderNicheSelection(false);
      });
      
      container.appendChild(sectionWrapper);
    });
  }

  // --- ACTIVE FLASHCARD PRACTICE CONTROLLER ---
  
  function startPracticeSession(nicheName) {
    state.practice.nicheName = nicheName;
    state.practice.questionsList = state.questions.filter(q => q.db === 'fabric_pbi' && q.niche === nicheName);
    state.practice.currentIndex = 0;
    state.practice.isAnswerRevealed = false;
    
    DOM.nicheSelectionScreen.classList.add('hidden');
    DOM.activePracticeScreen.classList.remove('hidden');
    
    // Hide practice page header and filter scrollbar during active practice to save vertical space
    const prHeader = document.getElementById('practice-header');
    const prScrollbar = document.getElementById('practice-topics-scrollbar');
    if (prHeader) prHeader.classList.add('hidden');
    if (prScrollbar) prScrollbar.classList.add('hidden');
    
    DOM.activeNicheTitle.textContent = nicheName;
    
    renderActivePracticeQList();
    loadActivePracticeQuestion();
  }

  // Renders the side list of questions in practice mode
  function renderActivePracticeQList() {
    const listContainer = document.getElementById('active-practice-q-list');
    listContainer.innerHTML = '';
    
    // Set sidebar domain title
    document.getElementById('practice-sidebar-domain').textContent = state.practice.nicheName;
    
    state.practice.questionsList.forEach((q, idx) => {
      const li = document.createElement('li');
      li.className = 'practice-q-item';
      if (idx === state.practice.currentIndex) {
        li.classList.add('active');
      }
      
      li.innerHTML = `
        <div class="q-text-line">Q${idx+1}: [${q.difficulty || 'HARD'}] ${q.question}</div>
      `;
      
      li.addEventListener('click', () => {
        state.practice.currentIndex = idx;
        state.practice.isAnswerRevealed = false;
        loadActivePracticeQuestion();
      });
      
      listContainer.appendChild(li);
    });
  }

  function loadActivePracticeQuestion() {
    const qList = state.practice.questionsList;
    const idx = state.practice.currentIndex;
    
    if (qList.length === 0) return;
    
    const activeQ = qList[idx];
    
    // Update active highlight in side list
    const sideItems = document.querySelectorAll('#active-practice-q-list .practice-q-item');
    sideItems.forEach((item, sIdx) => {
      if (sIdx === idx) item.classList.add('active');
      else item.classList.remove('active');
    });
    
    // Update progress counters
    DOM.practiceProgressIndicator.textContent = `Question ${idx + 1} of ${qList.length}`;
    
    // Update active question text
    DOM.activePracticeQText.innerHTML = `${activeQ.question} <span class="difficulty-badge badge-${(activeQ.difficulty || 'hard').toLowerCase()}" style="vertical-align: text-bottom; margin-left: 0.5rem; font-size: 0.85rem;">${activeQ.difficulty || 'HARD'}</span>`;
    
    // Format and load answer markdown details
    DOM.activePracticeAText.innerHTML = formatMarkdownAnswer(activeQ.answer);
    
    // Active Category Tag (Formatted Title)
    const tagEl = document.getElementById('active-practice-category-tag');
    tagEl.textContent = displayNames[activeQ.category] || activeQ.category;
    tagEl.className = 'stats-badge ' + (badgeClasses[activeQ.category] || 'badge-spark');
    tagEl.style.display = 'inline-block';
    tagEl.style.width = 'fit-content';
    
    // Sync Reveal Answer Overlay state
    if (state.practice.isAnswerRevealed) {
      DOM.activePracticeAContainer.classList.add('revealed');
    } else {
      DOM.activePracticeAContainer.classList.remove('revealed');
    }
    

    
    // Enable/disable navigation buttons
    DOM.btnPracticePrev.disabled = idx === 0;
    DOM.btnPracticeNext.disabled = idx === qList.length - 1;
  }

  function formatCodeBlock(code, lang) {
    lang = lang ? lang.trim().toLowerCase() : 'code';
    let langClass = '';
    let langLabel = 'Code';
    if (lang === 'python') {
      langClass = 'python';
      langLabel = 'Python';
    } else if (lang === 'mssql' || lang === 'sql' || lang === 't-sql' || lang === 'tsql') {
      langClass = 'mssql';
      langLabel = 'T-SQL';
    } else if (lang === 'pyspark') {
      langClass = 'pyspark';
      langLabel = 'PySpark';
    } else if (lang === 'sparksql' || lang === 'spark-sql') {
      langClass = 'sparksql';
      langLabel = 'Spark SQL';
    } else if (lang === 'kql' || lang === 'kusto') {
      langClass = 'mssql';
      langLabel = 'KQL';
    } else if (lang === 'bash' || lang === 'sh') {
      langClass = 'pyspark';
      langLabel = 'Bash';
    } else if (lang) {
      langLabel = lang.toUpperCase();
    }
    
    return `<div class="code-wrapper ${langClass} my-4">
      <div class="code-toolbar">
        <span class="code-lang-badge">${langLabel}</span>
        <button class="copy-btn" title="Copy code">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy
        </button>
      </div>
      <pre class="code-block"><code>${code.trim()}</code></pre>
    </div>`;
  }

  // Unified markdown parser that handles code blocks, lists, headings, and bold text cleanly
  function formatMarkdownToHTML(text) {
    if (!text) return '';
    
    // Normalize newlines and quotes
    let html = text.replace(/\\n/g, '\n').replace(/\\"/g, '"');
    
    // Extract code blocks first to protect comments and indentation
    const codeBlocks = [];
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function(match, lang, code) {
      const index = codeBlocks.length;
      const escapedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      codeBlocks.push(formatCodeBlock(escapedCode, lang));
      return `\n__CODE_BLOCK_PLACEHOLDER_${index}__\n`;
    });
    
    // Normalize inline lists (inject newline if lists are squashed on the same line)
    // Only match if preceded by end-of-sentence punctuation or closing characters, to avoid splitting prose
    html = html.replace(/([.!?;:]\s)(\d+[\)\.]\s)/g, '$1\n$2');
    html = html.replace(/([.!?;:]\s)([\-\*]\s)/g, '$1\n$2');
    
    // Escape HTML characters for the rest of the text
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Convert backticks to code block styling
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert bold markdown to strong tags
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary); font-weight:600;">$1</strong>');
    
    let lines = html.split('\n');
    let output = '';
    let listType = null;
    let inParagraph = false;

    lines.forEach(line => {
      line = line.trim();
      if (!line) {
         if (inParagraph) {
            output += '</p>';
            inParagraph = false;
         }
         return;
      }

      // If it is a placeholder, output it directly and close any lists/paragraphs
      const placeholderMatch = line.match(/^__CODE_BLOCK_PLACEHOLDER_(\d+)__$/);
      if (placeholderMatch) {
         if (inParagraph) { output += '</p>'; inParagraph = false; }
         if (listType) { output += `</${listType}>`; listType = null; }
         
         const idx = parseInt(placeholderMatch[1]);
         output += codeBlocks[idx];
         return;
      }

      // Parse markdown headings (e.g. ### Phase 1)
      let headingMatch = line.match(/^(#+)\s*(.*)$/);
      if (headingMatch) {
        if (inParagraph) { output += '</p>'; inParagraph = false; }
        if (listType) { output += `</${listType}>`; listType = null; }
        
        let headingText = headingMatch[2].replace(/#+$/, '').trim();
        let level = headingMatch[1].length;
        
        // Pick appropriate heading tag and styling
        let fontSize = '0.95rem';
        let margin = '1.25rem 0 0.5rem 0';
        if (level === 1) {
          fontSize = '1.15rem';
          margin = '1.5rem 0 0.75rem 0';
        } else if (level === 2) {
          fontSize = '1.05rem';
          margin = '1.35rem 0 0.65rem 0';
        } else if (level === 3) {
          fontSize = '0.98rem';
          margin = '1.25rem 0 0.55rem 0';
        }
        
        output += `<h5 style="color: var(--text-primary); font-weight: 700; margin: ${margin}; font-size: ${fontSize}; font-family: 'Space Grotesk', sans-serif;">${headingText}</h5>`;
        return;
      }
      
      let olMatch = line.match(/^(\d+)[\)\.]\s/);
      
      if (olMatch) {
        if (inParagraph) { output += '</p>'; inParagraph = false; }
        
        let num = parseInt(olMatch[1]);
        if (listType === 'ol' && num === 1) {
          output += '</ol><ol style="margin: 0.5rem 0 1rem 1.25rem; list-style-type: decimal; padding-left: 0;">';
        } else if (listType !== 'ol') {
          if (listType === 'ul') output += '</ul>';
          output += `<ol start="${num}" style="margin: 0.5rem 0 1rem 1.25rem; list-style-type: decimal; padding-left: 0;">`;
          listType = 'ol';
        }
        let cleanIt = line.replace(/^\d+[\)\.]\s+/, '');
        output += `<li style="margin-bottom: 0.5rem; padding-left: 0.25rem;">${cleanIt}</li>`;
      } else if (/^[\-\*]\s/.test(line)) {
        if (inParagraph) { output += '</p>'; inParagraph = false; }
        
        if (listType !== 'ul') {
          if (listType === 'ol') output += '</ol>';
          output += '<ul style="margin: 0.5rem 0 1rem 1.25rem; list-style-type: disc; padding-left: 0;">';
          listType = 'ul';
        }
        let cleanIt = line.replace(/^[\-\*]\s+/, '');
        output += `<li style="margin-bottom: 0.5rem; padding-left: 0.25rem;">${cleanIt}</li>`;
      } else {
        if (listType) {
          output += `</${listType}>`;
          listType = null;
        }
        
        if (!inParagraph) {
          output += '<p style="margin: 0 0 1rem 0;">';
          inParagraph = true;
          output += line;
        } else {
          output += '<br>' + line;
        }
      }
    });
    
    if (inParagraph) output += '</p>';
    if (listType) output += `</${listType}>`;
    
    return output;
  }

  // Parses basic markdown and linebreaks into clean HTML list formatting
  function formatMarkdownAnswer(text) {
    return formatMarkdownToHTML(text);
  }

  // Helper prototype extension string
  String.prototype.stripOuterQuotes = function() {
    let str = this.trim();
    if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
      return str.slice(1, -1);
    }
    return str;
  };

  // --- DETAIL MODAL DIALOG CONTROLLER ---
  
  let activeExplainerIds = [];
  let currentExplainerIndex = -1;

  function openDetailsDialog(questionId) {
    let qObj = state.questions.find(q => q.id === questionId);
    let isDe = false;
    
    if (!qObj) {
      qObj = generalDeState.questions.find(q => q.id === questionId);
      isDe = true;
    }
    if (!qObj) return;
    
    // Compute current active list context
    let cards;
    if (isDe) {
      cards = document.querySelectorAll('#de-questions-container .concept-card');
    } else {
      cards = document.querySelectorAll('#explainer-accordion .concept-card');
    }
    activeExplainerIds = Array.from(cards).map(card => card.getAttribute('data-id'));
    currentExplainerIndex = activeExplainerIds.indexOf(questionId);
    
    // Update Prev/Next button states
    if (DOM.btnDialogPrev) DOM.btnDialogPrev.disabled = currentExplainerIndex <= 0;
    if (DOM.btnDialogNext) DOM.btnDialogNext.disabled = currentExplainerIndex === -1 || currentExplainerIndex >= activeExplainerIds.length - 1;
    
    DOM.dialogCategory.textContent = displayNames[qObj.category] || qObj.category;
    DOM.dialogCategory.className = 'dialog-category-tag stats-badge ' + (badgeClasses[qObj.category] || 'badge-spark');
    DOM.dialogCategory.style.display = 'inline-block';
    DOM.dialogCategory.style.width = 'fit-content';
    DOM.dialogCategory.style.marginBottom = '0.5rem';
    DOM.dialogQText.textContent = qObj.question;
    
    // Build explanation details layout
    DOM.dialogAText.innerHTML = isDe ? formatDeAnswer(qObj.answer) : formatMarkdownAnswer(qObj.answer);
    

    
    DOM.detailsDialog.classList.remove('hidden');
    DOM.detailsDialog.removeAttribute('hidden');
  }

  function closeDetailsDialog() {
    DOM.detailsDialog.classList.add('hidden');
    DOM.detailsDialog.setAttribute('hidden', 'true');
  }

  // --- EVENT LISTENERS REGISTRATION ---
  
  function setupEventListeners() {
    // Sidebar Minimize/Expand Toggle
    const btnSidebarToggle = document.getElementById('btn-sidebar-toggle');
    const appContainer = document.getElementById('app-container');
    if (btnSidebarToggle && appContainer) {
      btnSidebarToggle.addEventListener('click', () => {
        const collapsed = appContainer.classList.toggle('sidebar-collapsed');
        localStorage.setItem('sidebar_collapsed', collapsed);
      });
    }

    // Navigation Views Switch
    DOM.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        switchView(target);
      });
    });

    // Prep Hub Subnav Tabs Switch
    if (DOM.prephub && DOM.prephub.subnav) {
      DOM.prephub.subnav.querySelectorAll('.topic-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const subTab = chip.getAttribute('data-subtab');
          if (subTab) switchPrepHubSubTab(subTab);
        });
      });
    }

    // Spark Hub Subnav Tabs Switch
    const sparkHubSubnav = document.getElementById('spark-hub-subnav');
    if (sparkHubSubnav) {
      sparkHubSubnav.querySelectorAll('.topic-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const subTab = chip.getAttribute('data-subtab');
          if (subTab) switchSparkHubSubTab(subTab);
        });
      });
    }

    // Unified Search Filter listeners — debounced to avoid freeze on every keystroke
    if (DOM.prephub && DOM.prephub.unifiedSearchInput) {
      let _unifiedSearchDebounce;
      DOM.prephub.unifiedSearchInput.addEventListener('input', () => {
        clearTimeout(_unifiedSearchDebounce);
        _unifiedSearchDebounce = setTimeout(() => {
          state.unifiedSearchPage = 1;
          updateUnifiedSearchCounts();
          renderUnifiedSearch(true);
        }, 250);
      });
    }

    // Database filter removed — always show all DBs
    // (DB Sources row no longer exists in the UI)

    // Difficulty Level selector click binding
    if (DOM.prephub && DOM.prephub.difficultySelector) {
      const btns = DOM.prephub.difficultySelector.querySelectorAll('.qa-sidebar-btn[data-difficulty]');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.activeUnifiedDifficulty = btn.getAttribute('data-difficulty') || 'ALL';
          state.unifiedSearchPage = 1;
          // Fix L: Must update counts before rendering so badge counts are in sync
          updateUnifiedSearchCounts();
          renderUnifiedSearch(true);
        });
      });
    }


    // Expand All / Collapse All buttons click binding
    const btnQaExpandAll = document.getElementById('btn-qa-expand-all');
    if (btnQaExpandAll) {
      btnQaExpandAll.addEventListener('click', () => {
        const domainsList = [
          'Analytics, BI & AI',
          'Compute & Orchestration',
          'Databases, SQL & Storage',
          'Data Pipelines & Ingestion',
          'Data Lakehouse & Architecture',
          'Data Governance & Quality',
          'FinOps & Performance Optimization',
          'General Data Engineering'
        ];
        domainsList.forEach(domName => {
          state.expandedUnifiedSections[domName] = true;
        });
        renderUnifiedSearch(false);
        document.querySelectorAll('#unified-search-container .concept-accordion-card').forEach(card => {
          card.classList.add('expanded');
          const body = card.querySelector('.level-card-body');
          if (body) body.style.display = 'block';
          const chevron = card.querySelector('.level-chevron');
          if (chevron) chevron.style.transform = 'rotate(180deg)';
        });
      });
    }

    const btnQaCollapseAll = document.getElementById('btn-qa-collapse-all');
    if (btnQaCollapseAll) {
      btnQaCollapseAll.addEventListener('click', () => {
        const domainsList = [
          'Analytics, BI & AI',
          'Compute & Orchestration',
          'Databases, SQL & Storage',
          'Data Pipelines & Ingestion',
          'Data Lakehouse & Architecture',
          'Data Governance & Quality',
          'FinOps & Performance Optimization',
          'General Data Engineering'
        ];
        domainsList.forEach(domName => {
          state.expandedUnifiedSections[domName] = false;
        });
        renderUnifiedSearch(false);
        document.querySelectorAll('#unified-search-container .concept-accordion-card').forEach(card => {
          card.classList.remove('expanded');
          const body = card.querySelector('.level-card-body');
          if (body) body.style.display = 'none';
          const chevron = card.querySelector('.level-chevron');
          if (chevron) chevron.style.transform = 'rotate(0deg)';
        });
      });
    }
    // Reset Filters button click binding
    if (DOM.prephub && DOM.prephub.clearFiltersBtn) {
      DOM.prephub.clearFiltersBtn.addEventListener('click', () => {
        if (DOM.prephub.unifiedSearchInput) DOM.prephub.unifiedSearchInput.value = '';
        state.activeUnifiedCategory = 'ALL';
        state.activeUnifiedDifficulty = 'ALL';
        state.unifiedSearchPage = 1;

        // Reset difficulty buttons
        if (DOM.prephub.difficultySelector) {
          DOM.prephub.difficultySelector.querySelectorAll('.qa-sidebar-btn').forEach(b => {
            if (b.getAttribute('data-difficulty') === 'ALL') b.classList.add('active');
            else b.classList.remove('active');
          });
        }

        updateUnifiedSearchCounts();
        renderUnifiedSearch(true);
      });
    }

    // Theme Toggle Trigger
    DOM.themeToggleBtn.addEventListener('click', () => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      applyTheme();
    });
    
    // Mark Status Toggle Trigger
    if (DOM.statusToggleBtn) {
      DOM.statusToggleBtn.addEventListener('click', () => {
        state.markStatusEnabled = !state.markStatusEnabled;
        applyMarkStatusToggle();
      });
    }

    // ---- Mobile Bottom Navigation (scrollable tab bar) ----
    const mobileBottomNav = document.getElementById('mobile-bottom-nav');

    // Wire up all tab clicks in the scrollable bottom nav
    if (mobileBottomNav) {
      mobileBottomNav.querySelectorAll('.mobile-nav-tab[data-target]').forEach(tab => {
        tab.addEventListener('click', () => {
          const target = tab.getAttribute('data-target');
          if (target) switchView(target);
        });
      });
    }

    // Theme toggle in mobile top bar
    if (DOM.mobileThemeBtn) {
      DOM.mobileThemeBtn.addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        applyTheme();
      });
    }

    // Concept Explainer and Niche Practice event listeners are registered via separate setup listeners

    // Active practice reveal button
    DOM.activePracticeRevealBtn.addEventListener('click', () => {
      state.practice.isAnswerRevealed = true;
      DOM.activePracticeAContainer.classList.add('revealed');
    });

    // Practice navigations clicks
    DOM.btnPracticePrev.addEventListener('click', () => {
      if (state.practice.currentIndex > 0) {
        state.practice.currentIndex--;
        state.practice.isAnswerRevealed = false;
        loadActivePracticeQuestion();
      }
    });

    DOM.btnPracticeNext.addEventListener('click', () => {
      if (state.practice.currentIndex < state.practice.questionsList.length - 1) {
        state.practice.currentIndex++;
        state.practice.isAnswerRevealed = false;
        loadActivePracticeQuestion();
      }
    });

    DOM.btnPracticeBack.addEventListener('click', () => {
      DOM.activePracticeScreen.classList.add('hidden');
      DOM.nicheSelectionScreen.classList.remove('hidden');
      
      // Restore practice page header and filter scrollbar
      const prHeader = document.getElementById('practice-header');
      const prScrollbar = document.getElementById('practice-topics-scrollbar');
      if (prHeader) prHeader.classList.remove('hidden');
      if (prScrollbar) prScrollbar.classList.remove('hidden');
      
      renderNicheSelection();
    });

    DOM.btnPracticeShuffle.addEventListener('click', () => {
      const arr = [...state.practice.questionsList];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      state.practice.questionsList = arr;
      state.practice.currentIndex = 0;
      state.practice.isAnswerRevealed = false;
      
      renderActivePracticeQList();
      loadActivePracticeQuestion();
    });



    // Close Dialog Modal bindings
    DOM.btnDialogClose.addEventListener('click', closeDetailsDialog);
    DOM.btnDialogDone.addEventListener('click', closeDetailsDialog);
    
    if (DOM.btnDialogPrev) {
      DOM.btnDialogPrev.addEventListener('click', () => {
        if (currentExplainerIndex > 0) {
          openDetailsDialog(activeExplainerIds[currentExplainerIndex - 1]);
        }
      });
    }
    
    if (DOM.btnDialogNext) {
      DOM.btnDialogNext.addEventListener('click', () => {
        if (currentExplainerIndex !== -1 && currentExplainerIndex < activeExplainerIds.length - 1) {
          openDetailsDialog(activeExplainerIds[currentExplainerIndex + 1]);
        }
      });
    }
    
    // Close modal on click outside box
    DOM.detailsDialog.addEventListener('click', (e) => {
      if (e.target === DOM.detailsDialog) {
        closeDetailsDialog();
      }
    });

    // --- HYDERABAD GCC DIRECTORY INTERACTION ---
    const gccSearchInput = document.getElementById('gcc-search-input');
    const gccChips = document.querySelectorAll('.gcc-chip');
    const gccRows = document.querySelectorAll('#gcc-directory-table tbody tr');

    if (gccSearchInput && gccChips.length > 0 && gccRows.length > 0) {
      const filterGccTable = () => {
        const searchText = gccSearchInput.value.toLowerCase().trim();
        const activeChip = document.querySelector('.gcc-chip.active');
        const filterValue = activeChip ? activeChip.getAttribute('data-filter') : 'all';

        gccRows.forEach(row => {
          const risk = row.getAttribute('data-risk');
          const name = row.querySelector('.company-name').textContent.toLowerCase();
          const sector = row.cells[2].textContent.toLowerCase();
          const justification = row.querySelector('.justification').textContent.toLowerCase();

          const matchesRisk = (filterValue === 'all' || risk === filterValue);
          const matchesSearch = (!searchText || name.includes(searchText) || sector.includes(searchText) || justification.includes(searchText));

          if (matchesRisk && matchesSearch) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      };

      gccSearchInput.addEventListener('input', filterGccTable);

      gccChips.forEach(chip => {
        chip.addEventListener('click', () => {
          gccChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          filterGccTable();
        });
      });
    }

    // --- PYSPARK CURRICULUM PHASE NAVIGATION ---
    const pysparkPhaseNav = document.getElementById('pyspark-phase-nav');
    if (pysparkPhaseNav) {
      const phaseBtns = pysparkPhaseNav.querySelectorAll('.pyspark-phase-btn');
      const phaseBlocks = document.querySelectorAll('.pyspark-phase-block');

      const filterPhase = (selectedPhase) => {
        phaseBtns.forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-phase') === selectedPhase);
        });
        phaseBlocks.forEach(block => {
          const blockPhase = block.getAttribute('data-phase');
          if (selectedPhase === 'all' || blockPhase === selectedPhase) {
            block.classList.remove('hidden-phase');
          } else {
            block.classList.add('hidden-phase');
          }
        });
      };

      phaseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterPhase(btn.getAttribute('data-phase'));
        });
      });
    }

    // --- SPARK SQL CURRICULUM PHASE NAVIGATION ---
    const sparksqlPhaseNav = document.getElementById('sparksql-phase-nav');
    if (sparksqlPhaseNav) {
      const phaseBtns = sparksqlPhaseNav.querySelectorAll('.sparksql-phase-btn');
      
      const filterSparkSqlPhase = (selectedPhase) => {
        const phaseBlocks = document.querySelectorAll('.sparksql-phase-block');
        phaseBtns.forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-phase') === selectedPhase);
        });
        phaseBlocks.forEach(block => {
          const blockPhase = block.getAttribute('data-phase');
          if (selectedPhase === 'all' || blockPhase === selectedPhase) {
            block.classList.remove('hidden-phase');
          } else {
            block.classList.add('hidden-phase');
          }
        });
      };

      phaseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterSparkSqlPhase(btn.getAttribute('data-phase'));
        });
      });
    }

    // --- SYNTAX COMPARISON FILTERS ---
    const compFiltersContainer = document.getElementById('comp-filters-container');
    if (compFiltersContainer) {
      const compChips = compFiltersContainer.querySelectorAll('.topic-chip');
      const compCards = document.querySelectorAll('.comparison-card');

      compChips.forEach(chip => {
        chip.addEventListener('click', () => {
          const category = chip.getAttribute('data-category');
          
          compChips.forEach(c => c.classList.toggle('active', c === chip));
          
          compCards.forEach(card => {
            const cardCat = card.getAttribute('data-comp-cat');
            if (category === 'all' || cardCat === category) {
              card.classList.remove('hidden-comp');
            } else {
              card.classList.add('hidden-comp');
            }
          });
        });
      });
    }

    // Scroll to Top Scroll trigger
    DOM.btnScrollToTop.addEventListener('click', () => {
      document.querySelector('.main-content').scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Global copy button event delegation for dynamic code blocks
    document.addEventListener('click', (e) => {
      const copyBtn = e.target.closest('.copy-btn');
      if (!copyBtn) return;
      
      e.stopPropagation();
      const wrapper = copyBtn.closest('.code-wrapper');
      if (!wrapper) return;
      
      const preEl = wrapper.querySelector('pre.code-block code') || wrapper.querySelector('pre code');
      const preText = preEl ? (preEl.innerText || preEl.textContent) : '';
      if (!preText) return;
      
      navigator.clipboard.writeText(preText.trim()).then(() => {
        copyBtn.classList.add('copied');
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Copied!
        `;
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = originalHTML;
        }, 2000);
      });
    });
  }

  // --- GENERAL DE PREP INTEGRATION ---
  
  const categoryNichesDe = {
    "all": ["All", "Python", "SQL", "Spark", "Cloud", "Pipeline", "Dashboard", "Excel", "Lineage"],
    "Databases & SQL": ["All", "PostgreSQL", "MySQL", "NoSQL", "MongoDB", "Redis", "Cassandra", "Index", "Query Optimization"],
    "Big Data": ["All", "Spark", "Hadoop", "HDFS", "MapReduce", "Hive", "Scala", "Distributed"],
    "Cloud Platforms": ["All", "AWS", "Azure", "GCP", "S3", "Redshift", "Snowflake", "Databricks"],
    "ETL & Pipelines": ["All", "Airflow", "DBT", "Kafka", "Kinesis", "Orchestration", "Ingestion", "Streaming"],
    "Data Engineering": ["All", "Python", "Data Structure", "Algorithm", "Modeling", "Git"],
    "Data Engineering (General)": ["All", "Python", "Data Structure", "Algorithm", "Modeling", "Git"],
    "Excel & Analytics": ["All", "Formula", "VLOOKUP", "INDEX-MATCH", "Power Query", "Power Pivot", "VBA", "Macro", "Pivot"],
    "Data Visualization": ["All", "Tableau", "Power BI", "Chart", "Dashboard", "Storytelling"],
    "Governance & Quality": ["All", "Lineage", "Quality", "Metadata", "Privacy", "Compliance", "Security", "Audit"]
  };

  const generalDeState = {
    questions: window.QUESTIONS_DE_DB || [],
    progress: {},
    activeCategory: 'all',
    activeStatus: 'all',
    activeDifficulty: 'all',
    activeNiche: 'All',
    searchQuery: '',
    currentMode: 'bank',
    loadedQuestionsLimit: 50,
    mockSession: {
      active: false,
      questions: [],
      currentIndex: 0,
      timerVal: 90,
      timerMax: 90,
      timerInterval: null
    }
  };

  function getDeDomElements() {
    return {
      btnModeBank: document.getElementById('btn-de-mode-bank'),
      btnModeMock: document.getElementById('btn-de-mode-mock'),
      viewBank: document.getElementById('de-view-bank'),
      viewMock: document.getElementById('de-view-mock'),
      searchInput: document.getElementById('de-search-input'),
      filterStatusSelect: document.getElementById('de-filter-status'),
      filterDifficultySelect: document.getElementById('de-filter-difficulty'),
      difficultyChips: document.querySelectorAll('.de-diff-chip'),
      categoriesScrollbar: document.getElementById('de-categories-scrollbar'),
      nichesScrollbar: document.getElementById('de-niches-scrollbar'),
      statTotal: document.getElementById('de-stat-total'),
      statMastered: document.getElementById('de-stat-mastered'),
      statReviewing: document.getElementById('de-stat-reviewing'),
      statNotStarted: document.getElementById('de-stat-not-started'),
      overallProgressBar: document.getElementById('de-overall-progress-bar'),
      overallProgressPercent: document.getElementById('de-overall-progress-percent'),
      masteredCountSidebar: document.getElementById('de-mastered-count-sidebar'),
      totalCountSidebar: document.getElementById('de-total-count-sidebar'),
      questionsContainer: document.getElementById('de-questions-container'),
      loadMoreContainer: document.getElementById('de-load-more-container'),
      btnLoadMore: document.getElementById('btn-de-load-more'),
      filterStatus: document.getElementById('de-filter-status-text'),
      mockSetup: document.getElementById('de-mock-setup'),
      mockTimerSelect: document.getElementById('de-mock-timer-select'),
      btnStartMock: document.getElementById('btn-de-start-mock'),
      mockActive: document.getElementById('de-mock-active'),
      mockMetaCategory: document.getElementById('de-mock-meta-category'),
      mockMetaDifficulty: document.getElementById('de-mock-meta-difficulty'),
      mockMetaProgress: document.getElementById('de-mock-meta-progress'),
      mockQuestionText: document.getElementById('de-mock-question-text'),
      mockTimerContainer: document.getElementById('de-mock-timer-container'),
      mockTimerBar: document.getElementById('de-mock-timer-bar'),
      mockTimerText: document.getElementById('de-mock-timer-text'),
      mockAnswerContent: document.getElementById('de-mock-answer-content'),
      btnQuitMock: document.getElementById('btn-de-quit-mock'),
      btnRevealMock: document.getElementById('btn-de-reveal-mock'),
      btnNextMock: document.getElementById('btn-de-next-mock'),
      mockSummary: document.getElementById('de-mock-summary'),
      btnRestartMock: document.getElementById('btn-de-restart-mock'),
      mockSummaryTotal: document.getElementById('de-mock-summary-total')
    };
  }

  // Fix C: Cached DOM reference — computed once, reused everywhere
  let _DOM_DE = null;

  function initGeneralDe() {
    _DOM_DE = getDeDomElements(); // Cache once after DOM is ready
    loadDeProgress();
    updateDeStats();
    renderDeCategories();
    renderDeNiches();
    renderDeQuestionsList(true);
    setupDeEventListeners();
  }

  function loadDeProgress() {
    try {
      const saved = localStorage.getItem('interview_pro_de_progress');
      if (saved) {
        generalDeState.progress = JSON.parse(saved);
      } else {
        generalDeState.progress = {};
      }
      generalDeState.questions.forEach(q => {
        if (!generalDeState.progress[q.id]) {
          generalDeState.progress[q.id] = 'unseen';
        }
      });
    } catch (e) {
      console.error("Could not load DE progress", e);
      generalDeState.progress = {};
    }
  }

  function saveDeProgress() {
    localStorage.setItem('interview_pro_de_progress', JSON.stringify(generalDeState.progress));
    updateDeStats();
  }

  function updateDeStats() {
    let total = generalDeState.questions.length;
    let mastered = 0;
    let reviewing = 0;
    let unseen = 0;

    generalDeState.questions.forEach(q => {
      const status = generalDeState.progress[q.id] || 'unseen';
      if (status === 'mastered') mastered++;
      else if (status === 'reviewing') reviewing++;
      else unseen++;
    });

    const DOM_DE = _DOM_DE || getDeDomElements();
    if (!DOM_DE.statTotal) return;

    DOM_DE.statTotal.textContent = total.toLocaleString();
    DOM_DE.statMastered.textContent = mastered.toLocaleString();
    DOM_DE.statReviewing.textContent = reviewing.toLocaleString();
    DOM_DE.statNotStarted.textContent = unseen.toLocaleString();

    DOM_DE.masteredCountSidebar.textContent = mastered.toLocaleString();
    DOM_DE.totalCountSidebar.textContent = total.toLocaleString();

    const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;
    DOM_DE.overallProgressPercent.textContent = `${percent}%`;

    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (percent / 100) * circumference;
    if (DOM_DE.overallProgressBar) {
      DOM_DE.overallProgressBar.style.strokeDasharray = `${circumference} ${circumference}`;
      DOM_DE.overallProgressBar.style.strokeDashoffset = offset;
    }
  }

  function renderDeCategories() {
    const DOM_DE = _DOM_DE || getDeDomElements();
    if (!DOM_DE.categoriesScrollbar) return;

    const categories = ["All Topics", ...new Set(generalDeState.questions.map(q => q.category).filter(Boolean))];
    DOM_DE.categoriesScrollbar.innerHTML = '';

    categories.forEach(cat => {
      const key = cat === "All Topics" ? "all" : cat;
      const btn = document.createElement('button');
      btn.className = `topic-chip ${generalDeState.activeCategory === key ? 'active' : ''}`;
      btn.textContent = cat;
      btn.addEventListener('click', () => {
        DOM_DE.categoriesScrollbar.querySelectorAll('.topic-chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        generalDeState.activeCategory = key;
        generalDeState.activeNiche = 'All';
        generalDeState.loadedQuestionsLimit = 50;
        renderDeNiches();
        renderDeQuestionsList(true);
      });
      DOM_DE.categoriesScrollbar.appendChild(btn);
    });
  }

  function renderDeNiches() {
    const DOM_DE = _DOM_DE || getDeDomElements();
    if (!DOM_DE.nichesScrollbar) return;

    const category = generalDeState.activeCategory;
    const niches = categoryNichesDe[category] || ["All"];
    DOM_DE.nichesScrollbar.innerHTML = '';

    niches.forEach(niche => {
      const btn = document.createElement('button');
      btn.className = `topic-chip ${generalDeState.activeNiche === niche ? 'active' : ''}`;
      btn.textContent = niche;
      btn.addEventListener('click', () => {
        DOM_DE.nichesScrollbar.querySelectorAll('.topic-chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        generalDeState.activeNiche = niche;
        generalDeState.loadedQuestionsLimit = 50;
        renderDeQuestionsList(true);
      });
      DOM_DE.nichesScrollbar.appendChild(btn);
    });
  }

  function renderDeQuestionsList(resetScroll = false) {
    const DOM_DE = _DOM_DE || getDeDomElements();
    if (!DOM_DE.questionsContainer) return;

    const filtered = generalDeState.questions.filter(q => {
      const catMatches = generalDeState.activeCategory === 'all' || q.category === generalDeState.activeCategory;
      const diffMatches = generalDeState.activeDifficulty === 'all' || q.difficulty.toLowerCase() === generalDeState.activeDifficulty.toLowerCase();
      
      const status = generalDeState.progress[q.id] || 'unseen';
      const statusMatches = generalDeState.activeStatus === 'all' || status === generalDeState.activeStatus;
      
      let nicheMatches = true;
      if (generalDeState.activeNiche !== 'All') {
        const nicheLower = generalDeState.activeNiche.toLowerCase();
        nicheMatches = q.question.toLowerCase().includes(nicheLower) || q.answer.toLowerCase().includes(nicheLower);
      }
      
      const searchMatches = !generalDeState.searchQuery || 
        q.question.toLowerCase().includes(generalDeState.searchQuery) ||
        q.answer.toLowerCase().includes(generalDeState.searchQuery) ||
        q.category.toLowerCase().includes(generalDeState.searchQuery);

      return catMatches && diffMatches && statusMatches && nicheMatches && searchMatches;
    });

    DOM_DE.filterStatus.textContent = `Showing ${filtered.length.toLocaleString()} of ${generalDeState.questions.length.toLocaleString()} questions`;

    if (filtered.length === 0) {
      DOM_DE.questionsContainer.innerHTML = `
        <div style="text-align:center; padding:3rem; color:var(--text-secondary); grid-column: 1 / -1;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 1rem; opacity: 0.5;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          No questions found matching the selected filters.
        </div>
      `;
      DOM_DE.loadMoreContainer.classList.add('hidden');
      return;
    }

    const chunk = filtered.slice(0, generalDeState.loadedQuestionsLimit);
    DOM_DE.questionsContainer.innerHTML = '';

    const badgeClasses = {
      "Databases & SQL": "badge-sql",
      "Big Data": "badge-spark",
      "Cloud Platforms": "badge-cloud",
      "ETL & Pipelines": "badge-etl",
      "Data Engineering": "badge-de",
      "Data Engineering (General)": "badge-de",
      "Excel & Analytics": "badge-excel",
      "Data Visualization": "badge-viz",
      "Governance & Quality": "badge-gov"
    };
    const displayNames = {
      "Databases & SQL": "SQL",
      "Big Data": "Big Data",
      "Cloud Platforms": "Cloud",
      "ETL & Pipelines": "ETL",
      "Data Engineering": "DE",
      "Data Engineering (General)": "DE",
      "Excel & Analytics": "Excel",
      "Data Visualization": "Viz",
      "Governance & Quality": "Gov"
    };

    chunk.forEach(q => {
      const status = generalDeState.progress[q.id] || 'unseen';
      const card = document.createElement('div');
      card.className = `concept-card`;
      card.setAttribute('data-id', q.id);
      card.setAttribute('data-status', status);

      const badgeClass = badgeClasses[q.category] || 'badge-spark';
      const categoryDisplayName = displayNames[q.category] || q.category;

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; gap: 0.5rem; flex-wrap: wrap; width: 100%;">
          <span class="stats-badge ${badgeClass}" style="font-size: 0.65rem; padding: 0.15rem 0.4rem; border-radius: 4px; display: inline-block; width: fit-content;">${categoryDisplayName}</span>
          <span class="difficulty-badge badge-${q.difficulty.toLowerCase()}" style="margin-left: 0;">${q.difficulty}</span>
        </div>
        <div class="concept-card-title" style="margin-bottom: 0.75rem; text-align: left; width: 100%;">${q.question}</div>
        <div class="concept-card-footer" style="width: 100%; display: flex; justify-content: flex-end;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      `;

      card.addEventListener('click', () => {
        openDetailsDialog(q.id);
      });

      DOM_DE.questionsContainer.appendChild(card);
    });

    if (filtered.length > generalDeState.loadedQuestionsLimit) {
      DOM_DE.loadMoreContainer.classList.remove('hidden');
    } else {
      DOM_DE.loadMoreContainer.classList.add('hidden');
    }

    if (resetScroll) {
      DOM_DE.questionsContainer.scrollTo({ top: 0 });
    }
  }

  function formatDeAnswer(text) {
    if (!text) return '';
    return `<div style="text-align:left;">${formatMarkdownToHTML(text)}</div>`;
  }

  function setupDeEventListeners() {
    const DOM_DE = _DOM_DE || getDeDomElements();
    if (!DOM_DE.btnModeBank) return;
    
    document.addEventListener('click', () => {
      document.querySelectorAll('.de-status-options').forEach(p => p.style.display = 'none');
    });

    DOM_DE.btnModeBank.addEventListener('click', () => {
      DOM_DE.btnModeBank.classList.add('active');
      DOM_DE.btnModeMock.classList.remove('active');
      DOM_DE.viewBank.classList.remove('hidden');
      DOM_DE.viewMock.classList.add('hidden');
      generalDeState.currentMode = 'bank';
      if (generalDeState.mockSession.active) quitDeMockSession();
    });

    DOM_DE.btnModeMock.addEventListener('click', () => {
      DOM_DE.btnModeMock.classList.add('active');
      DOM_DE.btnModeBank.classList.remove('active');
      DOM_DE.viewMock.classList.remove('hidden');
      DOM_DE.viewBank.classList.add('hidden');
      generalDeState.currentMode = 'mock';
    });

    let searchDebounce;
    DOM_DE.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        generalDeState.searchQuery = e.target.value.toLowerCase().trim();
        generalDeState.loadedQuestionsLimit = 50;
        renderDeQuestionsList(true);
      }, 200);
    });

    DOM_DE.filterStatusSelect.addEventListener('change', (e) => {
      generalDeState.activeStatus = e.target.value;
      generalDeState.loadedQuestionsLimit = 50;
      renderDeQuestionsList(true);
    });

    DOM_DE.filterDifficultySelect.addEventListener('change', (e) => {
      generalDeState.activeDifficulty = e.target.value;
      generalDeState.loadedQuestionsLimit = 50;
      renderDeQuestionsList(true);
    });

    DOM_DE.difficultyChips.forEach(chip => {
      chip.addEventListener('click', () => {
        DOM_DE.difficultyChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        generalDeState.activeDifficulty = chip.getAttribute('data-difficulty');
        generalDeState.loadedQuestionsLimit = 50;
        renderDeQuestionsList(true);
      });
    });

    DOM_DE.btnLoadMore.addEventListener('click', () => {
      generalDeState.loadedQuestionsLimit += 100;
      renderDeQuestionsList(false);
    });

    DOM_DE.btnStartMock.addEventListener('click', startDeMockSession);
    DOM_DE.btnQuitMock.addEventListener('click', quitDeMockSession);
    DOM_DE.btnRevealMock.addEventListener('click', revealDeMockAnswer);
    DOM_DE.btnNextMock.addEventListener('click', nextDeMockQuestion);
    DOM_DE.btnRestartMock.addEventListener('click', resetDeMockSetupView);
  }

  function startDeMockSession() {
    let pool = generalDeState.questions.filter(q => {
      const catMatches = generalDeState.activeCategory === 'all' || q.category === generalDeState.activeCategory;
      const diffMatches = generalDeState.activeDifficulty === 'all' || q.difficulty.toLowerCase() === generalDeState.activeDifficulty.toLowerCase();
      return catMatches && diffMatches;
    });

    if (pool.length === 0) pool = generalDeState.questions;

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    generalDeState.mockSession.questions = shuffled.slice(0, 5);

    const DOM_DE = getDeDomElements();
    if (generalDeState.mockSession.questions.length === 0) {
      alert("No questions available for mock session.");
      return;
    }

    const duration = parseInt(DOM_DE.mockTimerSelect.value);
    generalDeState.mockSession.timerMax = duration;
    generalDeState.mockSession.timerVal = duration;
    generalDeState.mockSession.currentIndex = 0;
    generalDeState.mockSession.active = true;

    DOM_DE.mockSetup.classList.add('hidden');
    DOM_DE.mockSummary.classList.add('hidden');
    DOM_DE.mockActive.classList.remove('hidden');

    loadDeMockQuestion();
  }

  function loadDeMockQuestion() {
    const q = generalDeState.mockSession.questions[generalDeState.mockSession.currentIndex];
    const DOM_DE = _DOM_DE || getDeDomElements();

    DOM_DE.mockAnswerContent.classList.add('blurred');
    DOM_DE.mockAnswerContent.innerHTML = formatDeAnswer(q.answer);

    DOM_DE.btnNextMock.classList.add('hidden');
    DOM_DE.btnRevealMock.classList.remove('hidden');

    DOM_DE.mockMetaCategory.textContent = q.category;
    DOM_DE.mockMetaDifficulty.textContent = q.difficulty;
    DOM_DE.mockMetaDifficulty.className = `de-badge-diff ${q.difficulty.toLowerCase()}`;
    DOM_DE.mockMetaProgress.textContent = `Question ${generalDeState.mockSession.currentIndex + 1} of ${generalDeState.mockSession.questions.length}`;
    DOM_DE.mockQuestionText.textContent = q.question;

    clearInterval(generalDeState.mockSession.timerInterval);
    if (generalDeState.mockSession.timerMax > 0) {
      DOM_DE.mockTimerContainer.classList.remove('hidden');
      generalDeState.mockSession.timerVal = generalDeState.mockSession.timerMax;
      updateDeTimerDisplay();

      generalDeState.mockSession.timerInterval = setInterval(() => {
        generalDeState.mockSession.timerVal--;
        updateDeTimerDisplay();
        if (generalDeState.mockSession.timerVal <= 0) {
          clearInterval(generalDeState.mockSession.timerInterval);
          revealDeMockAnswer();
        }
      }, 1000);
    } else {
      DOM_DE.mockTimerContainer.classList.add('hidden');
    }
  }

  function updateDeTimerDisplay() {
    const DOM_DE = _DOM_DE || getDeDomElements();
    DOM_DE.mockTimerText.textContent = `${generalDeState.mockSession.timerVal}s`;
    const percentage = (generalDeState.mockSession.timerVal / generalDeState.mockSession.timerMax) * 100;
    DOM_DE.mockTimerBar.style.width = `${percentage}%`;

    if (percentage <= 25) {
      DOM_DE.mockTimerBar.style.background = 'var(--danger)';
    } else if (percentage <= 50) {
      DOM_DE.mockTimerBar.style.background = 'var(--warning)';
    } else {
      DOM_DE.mockTimerBar.style.background = 'linear-gradient(90deg, #a855f7, #ec4899)';
    }
  }

  function revealDeMockAnswer() {
    clearInterval(generalDeState.mockSession.timerInterval);
    const DOM_DE = _DOM_DE || getDeDomElements();
    DOM_DE.mockAnswerContent.classList.remove('blurred');
    DOM_DE.btnRevealMock.classList.add('hidden');
    DOM_DE.btnNextMock.classList.remove('hidden');

    const q = generalDeState.mockSession.questions[generalDeState.mockSession.currentIndex];
    if (q) {
      const status = generalDeState.progress[q.id] || 'unseen';
      if (status === 'unseen') {
        generalDeState.progress[q.id] = 'reviewing';
        saveDeProgress();
        const cardEl = document.querySelector(`#de-questions-container .concept-card[data-id="${q.id}"]`);
        if (cardEl) {
          cardEl.setAttribute('data-status', 'reviewing');
          const indicator = cardEl.querySelector('.status-indicator');
          if (indicator) {
            indicator.className = 'status-indicator status-reviewing';
            indicator.textContent = 'reviewing';
          }
        }
      }
    }
  }

  function nextDeMockQuestion() {
    generalDeState.mockSession.currentIndex++;
    if (generalDeState.mockSession.currentIndex < generalDeState.mockSession.questions.length) {
      loadDeMockQuestion();
    } else {
      finishDeMockSession();
    }
  }

  function finishDeMockSession() {
    generalDeState.mockSession.active = false;
    const DOM_DE = _DOM_DE || getDeDomElements();
    DOM_DE.mockActive.classList.add('hidden');
    DOM_DE.mockSummary.classList.remove('hidden');
    DOM_DE.mockSummaryTotal.textContent = generalDeState.mockSession.questions.length;
  }

  function quitDeMockSession() {
    clearInterval(generalDeState.mockSession.timerInterval);
    generalDeState.mockSession.active = false;
    resetDeMockSetupView();
  }

  function resetDeMockSetupView() {
    const DOM_DE = _DOM_DE || getDeDomElements();
    DOM_DE.mockActive.classList.add('hidden');
    DOM_DE.mockSummary.classList.add('hidden');
    DOM_DE.mockSetup.classList.remove('hidden');
  }

  // --- KEY CONCEPTS & GLOSSARY VIEW IMPLEMENTATION ---

  function initConcepts() {
    setupConceptsListeners();
    renderConcepts();
  }

  function setupConceptsListeners() {
    // Search input field event — instant search
    if (DOM.concepts.search) {
      DOM.concepts.search.addEventListener('input', () => {
        state.conceptsLimit = 30;
        renderConcepts();
      });
    }

    // Difficulty filter tab button click events
    if (DOM.concepts.difficultyFilters) {
      const diffBtns = DOM.concepts.difficultyFilters.querySelectorAll('.de-diff-chip');
      diffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          diffBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.activeConceptsDifficulty = btn.getAttribute('data-difficulty') || 'ALL';
          state.conceptsLimit = 30;
          renderConcepts();
        });
      });
    }

    // Topic scrollbar chip click events
    if (DOM.concepts.topicsScrollbar) {
      const topicChips = DOM.concepts.topicsScrollbar.querySelectorAll('.topic-chip');
      topicChips.forEach(chip => {
        chip.addEventListener('click', () => {
          topicChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          state.activeConceptsCategory = chip.getAttribute('data-category') || 'ALL';
          state.conceptsLimit = 30;
          renderConcepts();
        });
      });
    }
  }
  function renderConcepts() {
    if (!DOM.concepts.container) return;

    const query = DOM.concepts.search ? DOM.concepts.search.value.trim().toLowerCase() : '';
    const filterDiff = state.activeConceptsDifficulty || 'ALL';
    const filterCat = state.activeConceptsCategory || 'ALL';

    // Filter concepts
    const filtered = (window.CONCEPTS_DB || []).filter(item => {
      const matchesCategory = (filterCat === 'ALL' || item.category === filterCat);
      const matchesDifficulty = (filterDiff === 'ALL' || item.difficulty === filterDiff);
      
      const termMatch = item.term ? item.term.toLowerCase().includes(query) : false;
      const defMatch = item.definition ? item.definition.toLowerCase().includes(query) : false;
      const expMatch = item.explanation ? item.explanation.toLowerCase().includes(query) : false;
      const pointsMatch = (item.keyPoints || []).some(p => p.toLowerCase().includes(query));
      const queryMatch = !query || termMatch || defMatch || expMatch || pointsMatch;

      return matchesCategory && matchesDifficulty && queryMatch;
    });

    // Sort concepts by increasing order of difficulty: EASY -> MEDIUM -> HARD
    const difficultyWeights = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3 };
    filtered.sort((a, b) => {
      const weightA = difficultyWeights[a.difficulty] || 3;
      const weightB = difficultyWeights[b.difficulty] || 3;
      return weightA - weightB;
    });

    DOM.concepts.container.innerHTML = '';

    if (filtered.length === 0) {
      DOM.concepts.container.innerHTML = `<div style="text-align:center; padding: 3rem; color:var(--text-secondary);">No concepts found matching the selected filters.</div>`;
      return;
    }

    if (state.conceptsLimit === undefined) state.conceptsLimit = 30;
    const visible = filtered.slice(0, state.conceptsLimit);

    visible.forEach(item => {
      const card = document.createElement('div');
      card.className = 'concept-accordion-card';
      card.setAttribute('data-id', item.id);

      const categoryClass = badgeClasses[item.category] || 'badge-spark';
      const categoryLabel = displayNames[item.category] || item.category;

      card.innerHTML = `
        <div class="concept-card-header">
          <div class="concept-card-header-left">
            <h3 class="concept-term">${item.term}</h3>
            <span class="difficulty-badge badge-${(item.difficulty || 'easy').toLowerCase()}">${item.difficulty || 'EASY'}</span>
            <span class="stats-badge ${categoryClass}">${categoryLabel}</span>
          </div>
          <svg class="accordion-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transition: transform 0.25s ease;"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="concept-card-body">
          <div class="concept-card-body-inner">
            <div class="concept-label">Definition</div>
            <p class="concept-definition">${item.definition || ''}</p>
            
            <div class="concept-label">Explanation</div>
            <p class="concept-explanation">${item.explanation || ''}</p>
            
            <div class="concept-label">Key Takeaways</div>
            <ul class="concept-key-points">
              ${(item.keyPoints || []).map(point => `<li>${point}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;

      const header = card.querySelector('.concept-card-header');
      const body = card.querySelector('.concept-card-body');
      const icon = card.querySelector('.accordion-icon');

      header.addEventListener('click', () => {
        const isOpen = card.classList.contains('active');

        // Accordion behavior: collapse all other cards
        const allCards = DOM.concepts.container.querySelectorAll('.concept-accordion-card');
        allCards.forEach(c => {
          if (c !== card && c.classList.contains('active')) {
            c.classList.remove('active');
            c.querySelector('.concept-card-body').style.maxHeight = '0px';
            c.querySelector('.accordion-icon').style.transform = 'rotate(0deg)';
          }
        });

        if (isOpen) {
          card.classList.remove('active');
          body.style.maxHeight = '0px';
          icon.style.transform = 'rotate(0deg)';
        } else {
          card.classList.add('active');
          body.style.maxHeight = body.scrollHeight + 'px';
          icon.style.transform = 'rotate(180deg)';
        }
      });

      DOM.concepts.container.appendChild(card);
    });

    if (filtered.length > state.conceptsLimit) {
      const loadMoreWrap = document.createElement('div');
      loadMoreWrap.style.display = 'flex';
      loadMoreWrap.style.justifyContent = 'center';
      loadMoreWrap.style.marginTop = '1.5rem';
      loadMoreWrap.style.width = '100%';

      const loadMoreBtn = document.createElement('button');
      loadMoreBtn.className = 'de-load-more-btn';
      loadMoreBtn.style.padding = '0.5rem 1.5rem';
      loadMoreBtn.style.fontSize = '0.85rem';
      loadMoreBtn.textContent = `Show More Concepts (showing ${state.conceptsLimit} of ${filtered.length})`;
      
      loadMoreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.conceptsLimit += 30;
        renderConcepts();
      });

      loadMoreWrap.appendChild(loadMoreBtn);
      DOM.concepts.container.appendChild(loadMoreWrap);
    }
  }
  // --- DATA ENGINEERING CHEAT SHEET IMPLEMENTATION ---

  const Highlighter = {
    escape(s) {
      return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    },

    python(code) {
      let s = this.escape(code);
      s = s.replace(/(#[^\n]*)/g, '<span class="comment">$1</span>');
      s = s.replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')/g, '<span class="str">$1</span>');
      s = s.replace(/(@\w+)/g, '<span class="dec">$1</span>');
      s = s.replace(/\b(def|class|import|from|as|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|try|except|finally|raise|with|lambda|yield|async|await|pass|break|continue|global|nonlocal|del|assert)\b/g, '<span class="kw">$1</span>');
      s = s.replace(/\b(print|len|range|type|str|int|float|list|dict|set|tuple|bool|open|enumerate|zip|map|filter|sorted|reversed|any|all|sum|min|max|abs|round|isinstance|issubclass|hasattr|getattr|setattr)\b/g, '<span class="fn">$1</span>');
      s = s.replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>');
      return s;
    },

    sql(code) {
      let s = this.escape(code);
      s = s.replace(/(--[^\n]*)/g, '<span class="comment">$1</span>');
      s = s.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
      s = s.replace(/('[^']*')/g, '<span class="str">$1</span>');
      const kws = 'SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|FULL|ON|GROUP BY|HAVING|ORDER BY|INSERT INTO|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE|VIEW|INDEX|WITH|AS|UNION|INTERSECT|EXCEPT|DISTINCT|TOP|LIMIT|OFFSET|SET|VALUES|INTO|MERGE|USING|MATCHED|WHEN|THEN|ELSE|END|CASE|AND|OR|NOT|IN|EXISTS|BETWEEN|LIKE|IS|NULL|NULLS|BEGIN|COMMIT|ROLLBACK|TRANSACTION|PROCEDURE|FUNCTION|TRIGGER|RETURNS|RETURN|DECLARE|EXEC|EXECUTE|IF|ELSE|WHILE|CURSOR|FETCH|OPEN|CLOSE|DEALLOCATE|PRINT|RAISERROR|THROW|TRY|CATCH|USE|GO|DATABASE|SCHEMA|GRANT|REVOKE|DENY|PARTITION|BY|OVER|ROW|ROWS|RANGE|UNBOUNDED|PRECEDING|FOLLOWING|CURRENT ROW|PRIMARY KEY|FOREIGN KEY|REFERENCES|CONSTRAINT|DEFAULT|CHECK|UNIQUE|IDENTITY|OUTPUT|APPLY|CROSS|PIVOT|UNPIVOT|FOR|XML|JSON|PATH|AUTO|INCLUDE|COLUMNSTORE|CLUSTERED|NONCLUSTERED|OPTIMIZE|VACUUM|DESCRIBE|SHOW|EXPLAIN|ANALYZE|USING DELTA|GENERATE ALWAYS|PERIOD FOR SYSTEM_TIME|SYSTEM_VERSIONING|TEMPORAL|HISTORY|FORCESEEK|FORCESCAN|RECOMPILE|MAXDOP|NOLOCK|READUNCOMMITTED|SNAPSHOT|SERIALIZABLE';
      s = s.replace(new RegExp(`\\b(${kws})\\b`, 'gi'), '<span class="kw">$1</span>');
      s = s.replace(/\b(COUNT|SUM|AVG|MIN|MAX|ROW_NUMBER|RANK|DENSE_RANK|NTILE|LAG|LEAD|FIRST_VALUE|LAST_VALUE|PERCENTILE_CONT|COALESCE|ISNULL|NULLIF|CAST|CONVERT|DATEADD|DATEDIFF|GETDATE|GETUTCDATE|FORMAT|YEAR|MONTH|DAY|DATENAME|DATEPART|TRIM|LTRIM|RTRIM|UPPER|LOWER|LEN|CHARINDEX|SUBSTRING|REPLACE|STUFF|STRING_AGG|OPENJSON|JSON_VALUE|FOR JSON|NEWID|SCOPE_IDENTITY|IDENT_CURRENT|OBJECT_ID|DB_NAME|USER_NAME|SUSER_SNAME|HASHBYTES|COMPRESS|DECOMPRESS|IIF|CHOOSE)\b/gi, '<span class="fn">$1</span>');
      s = s.replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>');
      return s;
    },

    highlight(code, lang) {
      if (!code) return '';
      if (lang === 'python' || lang === 'pyspark') return this.python(code);
      return this.sql(code); // mssql, sparksql
    }
  };

  function initCheatsheet() {
    setupCheatsheetListeners();
    renderCheatsheet();
    renderCheatsheetComparison();
  }

  function setupCheatsheetListeners() {
    // 1. Search filter input
    if (DOM.cheatsheet.search) {
      let debounce;
      DOM.cheatsheet.search.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          state.activeCheatsheetQuery = DOM.cheatsheet.search.value.trim();
          renderCheatsheet();
        }, 150);
      });
    }

    // 2. Language tabs navigation
    if (DOM.cheatsheet.langNav) {
      const tabs = DOM.cheatsheet.langNav.querySelectorAll('.topic-chip');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          state.activeCheatsheetLang = tab.getAttribute('data-lang') || 'python';
          renderCheatsheet();
        });
      });
    }

    // 3. Difficulty/Level chips filters
    if (DOM.cheatsheet.levelFilters) {
      const chips = DOM.cheatsheet.levelFilters.querySelectorAll('.de-diff-chip');
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          chips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          state.activeCheatsheetLevel = chip.getAttribute('data-level') || 'all';
          renderCheatsheet();
        });
      });
    }
  }

  function renderCheatsheet(resetResults = true) {
    if (!DOM.cheatsheet.container) return;

    if (!state.cheatsheetLimits) state.cheatsheetLimits = {};
    if (resetResults) {
      state.cheatsheetLimits = {};
    }

    const lang = state.activeCheatsheetLang || 'all';
    const level = state.activeCheatsheetLevel || 'all';
    const query = (state.activeCheatsheetQuery || '').toLowerCase();

    // Select target dataset
    let dataset = [];
    if (lang === 'all') {
      dataset = [
        ...(window.PYTHON_DATA || []).map(item => ({ ...item, sourceDb: 'python' })),
        ...(window.MSSQL_DATA || []).map(item => ({ ...item, sourceDb: 'mssql' })),
        ...(window.PYSPARK_DATA || []).map(item => ({ ...item, sourceDb: 'pyspark' })),
        ...(window.SPARKSQL_DATA || []).map(item => ({ ...item, sourceDb: 'sparksql' }))
      ];
    } else {
      let rawData = [];
      if (lang === 'python') rawData = window.PYTHON_DATA || [];
      else if (lang === 'mssql') rawData = window.MSSQL_DATA || [];
      else if (lang === 'pyspark') rawData = window.PYSPARK_DATA || [];
      else if (lang === 'sparksql') rawData = window.SPARKSQL_DATA || [];
      dataset = rawData.map(item => ({ ...item, sourceDb: lang }));
    }

    const totalInLang = dataset.length;

    // Filter concepts
    const filtered = dataset.filter(item => {
      const matchesLevel = (level === 'all' || item.level === level);
      
      const titleMatch = item.title ? item.title.toLowerCase().includes(query) : false;
      const descMatch = item.description ? item.description.toLowerCase().includes(query) : false;
      const catMatch = item.category ? item.category.toLowerCase().includes(query) : false;
      const codeMatch = item.code ? item.code.toLowerCase().includes(query) : false;
      const ucMatch = item.use_case ? item.use_case.toLowerCase().includes(query) : false;
      const notesMatch = (item.notes || []).some(n => n.toLowerCase().includes(query));
      
      const queryMatch = !query || titleMatch || descMatch || catMatch || codeMatch || ucMatch || notesMatch;

      return matchesLevel && queryMatch;
    });

    // Update Progress Bar segments based on levels
    const levels = ['beginner', 'intermediate', 'advanced', 'architect'];
    const countByLevel = {};
    levels.forEach(lvl => {
      countByLevel[lvl] = dataset.filter(d => d.level === lvl).length;
    });

    // Update progress bar flex widths
    levels.forEach(lvl => {
      const segment = DOM.cheatsheet.progressBar.querySelector(`.prog-${lvl}`);
      if (segment) {
        const pct = totalInLang ? (countByLevel[lvl] / totalInLang) * 100 : 0;
        segment.style.flex = pct ? `${pct}` : '0';
        segment.style.display = pct ? 'block' : 'none';
      }
    });

    // Render cards grouped by level
    DOM.cheatsheet.container.innerHTML = '';

    if (filtered.length === 0) {
      DOM.cheatsheet.container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No Code Deepdive concepts found</h3>
          <p>Try adjusting your search query or level filters.</p>
        </div>
      `;
      return;
    }

    const byLevelFiltered = {};
    levels.forEach(lvl => {
      byLevelFiltered[lvl] = filtered.filter(d => d.level === lvl);
    });

    levels.forEach(lvl => {
      const items = byLevelFiltered[lvl];
      if (!items || items.length === 0) return;

      const limit = state.cheatsheetLimits[lvl] || 20;
      const visibleItems = items.slice(0, limit);

      // Render Level Section Header
      const levelHeader = document.createElement('div');
      levelHeader.className = 'level-section-header';
      const levelLabels = {
        beginner: { label: 'Beginner', emoji: '🌱' },
        intermediate: { label: 'Intermediate', emoji: '⚡' },
        advanced: { label: 'Advanced', emoji: '🔥' },
        architect: { label: 'Architect', emoji: '🏛️' }
      };
      const lvlMeta = levelLabels[lvl];
      levelHeader.innerHTML = `
        <span class="level-section-badge lsb-${lvl}">${lvlMeta.emoji} ${lvlMeta.label}</span>
        <div class="level-section-line"></div>
        <span class="level-section-count">${items.length} concept${items.length !== 1 ? 's' : ''}</span>
      `;
      DOM.cheatsheet.container.appendChild(levelHeader);

      // Render Cards Grid
      const cardsGrid = document.createElement('div');
      cardsGrid.className = 'concepts-grid';
      
      visibleItems.forEach((item, index) => {
        const card = document.createElement('div');
        const cardLang = item.sourceDb || 'python';
        card.className = `concept-card ${cardLang}`;
        card.setAttribute('data-id', item.id);
        card.setAttribute('data-level', item.level);

        const highlightedCode = Highlighter.highlight(item.code || '', cardLang);
        
        card.innerHTML = `
          <div class="card-header" role="button" aria-expanded="false" tabindex="0">
            <div class="card-num">${String(index + 1).padStart(2, '0')}</div>
            <div class="card-meta">
              <div class="card-title">${escapeHTML(item.title)}</div>
              <div class="card-tags">
                <span class="tag tag-level ${item.level}">${lvlMeta.emoji} ${lvlMeta.label}</span>
                <span class="tag tag-category">${escapeHTML(item.category || '')}</span>
              </div>
            </div>
            <svg class="card-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
          <div class="card-description">${escapeHTML(item.description || '')}</div>
          <div class="card-body">
            <div class="use-case-banner">
              <span class="uc-icon">🎯</span>
              <div class="uc-content">
                <div class="uc-label">Real-World Use Case</div>
                <div class="uc-text">${escapeHTML(item.use_case || '')}</div>
              </div>
            </div>
            <div class="code-wrapper">
              <div class="code-toolbar">
                <span class="code-lang-badge">${cardLang === 'python' ? 'Python' : cardLang === 'mssql' ? 'T-SQL' : cardLang === 'pyspark' ? 'PySpark' : 'Spark SQL'}</span>
                <button class="copy-btn" title="Copy code">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy
                </button>
              </div>
              <pre class="code-block"><code>${highlightedCode}</code></pre>
            </div>
            ${item.notes && item.notes.length ? `
            <div class="card-notes">
              <div class="notes-label">Key Points</div>
              ${item.notes.map(n => `
                <div class="note-item">
                  <div class="note-bullet"></div>
                  <span>${escapeHTML(n)}</span>
                </div>
              `).join('')}
            </div>` : ''}
          </div>
        `;

        // Click event on card header toggles expansion
        const headerEl = card.querySelector('.card-header');
        headerEl.addEventListener('click', () => {
          const isOpen = card.classList.toggle('open');
          headerEl.setAttribute('aria-expanded', isOpen);
        });

        // Copy button click event
        const copyBtn = card.querySelector('.copy-btn');
        copyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const preText = card.querySelector('pre.code-block').innerText || '';
          navigator.clipboard.writeText(preText).then(() => {
            copyBtn.classList.add('copied');
            copyBtn.innerHTML = `
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Copied!
            `;
            setTimeout(() => {
              copyBtn.classList.remove('copied');
              copyBtn.innerHTML = `
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              `;
            }, 2000);
          });
        });

        cardsGrid.appendChild(card);
      });

      DOM.cheatsheet.container.appendChild(cardsGrid);

      // Load More button inside level section
      if (items.length > limit) {
        const loadMoreWrap = document.createElement('div');
        loadMoreWrap.style.display = 'flex';
        loadMoreWrap.style.justifyContent = 'center';
        loadMoreWrap.style.marginTop = '1.5rem';
        loadMoreWrap.style.marginBottom = '1.5rem';

        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'de-load-more-btn';
        loadMoreBtn.style.padding = '0.5rem 1.5rem';
        loadMoreBtn.style.fontSize = '0.85rem';
        loadMoreBtn.textContent = `Show More Concepts (showing ${limit} of ${items.length})`;
        
        loadMoreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          state.cheatsheetLimits[lvl] = limit + 20;
          renderCheatsheet(false);
        });

        loadMoreWrap.appendChild(loadMoreBtn);
        DOM.cheatsheet.container.appendChild(loadMoreWrap);
      }
    });
  }

  function renderCheatsheetComparison() {
    if (!DOM.cheatsheet.compTbody) return;
    
    const rows = [
      { topic: 'Primary Use',       python: 'General-purpose ETL, scripting, ML pipelines', mssql: 'RDBMS analytics, transactional workloads', pyspark: 'Distributed big data processing', sparksql: 'SQL-first distributed analytics' },
      { topic: 'Scale',             python: 'Single-node (Dask/Ray for distributed)', mssql: 'Vertical scale; horizontal with sharding', pyspark: 'Horizontal scale — TBs to PBs', sparksql: 'Horizontal scale — TBs to PBs' },
      { topic: 'Execution Engine',  python: 'CPython interpreter', mssql: 'SQL Server / Azure SQL engine', pyspark: 'Spark JVM with Python driver', sparksql: 'Spark Catalyst optimizer' },
      { topic: 'Data Format',       python: 'Any (CSV, Parquet, Delta, Avro)', mssql: 'Row-based tables, columnstore, JSON', pyspark: 'Any (native Parquet/Delta best)', sparksql: 'Any (native Parquet/Delta best)' },
      { topic: 'ACID Transactions', python: '⚠️ Via Delta Lake library', mssql: '✅ Native full ACID', pyspark: '✅ Via Delta Lake', sparksql: '✅ Via Delta Lake' },
      { topic: 'Streaming',         python: '⚠️ Kafka-python / Faust', mssql: '⚠️ CDC + Service Broker', pyspark: '✅ Structured Streaming', sparksql: '⚠️ Limited via spark.sql()' },
      { topic: 'Delta Lake',        python: '✅ deltalake / delta-spark', mssql: '❌ Not native', pyspark: '✅ Native', sparksql: '✅ Native SQL support' },
      { topic: 'Microsoft Fabric',  python: '✅ Fabric notebooks', mssql: '✅ Fabric SQL endpoint', pyspark: '✅ Fabric Spark notebooks', sparksql: '✅ Fabric Spark notebooks' },
      { topic: 'Medallion Arch.',   python: '✅ Custom classes', mssql: '⚠️ Via schemas/views', pyspark: '✅ Native Bronze/Silver/Gold', sparksql: '✅ DLT multi-hop' },
      { topic: 'SCD Type 2',        python: '⚠️ Manual implementation', mssql: '✅ MERGE INTO + temporal', pyspark: '✅ Delta MERGE', sparksql: '✅ APPLY CHANGES INTO' },
      { topic: 'Performance Tuning',python: 'Profiling, vectorization, Polars', mssql: 'Query plans, indexes, Query Store', pyspark: 'AQE, partitioning, skew joins', sparksql: 'EXPLAIN, hints, Z-ORDER' },
      { topic: 'GDPR / Security',   python: 'Azure Key Vault SDK, encryption libs', mssql: 'TDE, Dynamic Data Masking, RLS', pyspark: 'Unity Catalog, Delta deletes', sparksql: 'Unity Catalog row/column masks' },
      { topic: 'Cloud FinOps',      python: 'Azure SDK cost APIs', mssql: 'DTU/vCore sizing, elastic pools', pyspark: 'AQE, cluster sizing, Photon', sparksql: 'Partition pruning, OPTIMIZE' },
      { topic: 'Learning Curve',    python: 'Low → High (ecosystem)', mssql: 'Low → Medium', pyspark: 'Medium → High', sparksql: 'Low → Medium (SQL-first)' },
    ];

    DOM.cheatsheet.compTbody.innerHTML = rows.map(row => `
      <tr>
        <td style="padding: 12px 16px; font-weight:600; color:var(--text-primary); border-bottom: 1px solid var(--card-border);">${row.topic}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid var(--card-border);">${formatCompCell(row.python)}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid var(--card-border);">${formatCompCell(row.mssql)}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid var(--card-border);">${formatCompCell(row.pyspark)}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid var(--card-border);">${formatCompCell(row.sparksql)}</td>
      </tr>
    `).join('');
  }

  function formatCompCell(text) {
    if (!text) return '—';
    return text
      .replace(/✅/g, '<span class="comp-check">✅</span>')
      .replace(/❌/g, '<span class="comp-x">❌</span>')
      .replace(/⚠️/g, '<span class="comp-part">⚠️</span>');
  }

  let sparkSqlCurriculumRendered = false;
  function renderSparkSqlCurriculum() {
    if (sparkSqlCurriculumRendered) return;
    const container = document.getElementById('sparksql-phase-blocks-container');
    if (!container) return;

    if (!window.SPARKSQL_DATA || window.SPARKSQL_DATA.length === 0) {
      container.innerHTML = '<p class="error-msg">Error: Spark SQL curriculum data not loaded.</p>';
      return;
    }

    const phases = {
      1: {
        title: "Spark SQL Fundamentals & DDL",
        desc: "Levels 1–8 · Basic queries, DB/schema creation, Delta Lake DDL, file queries, CTEs",
        levels: window.SPARKSQL_DATA.filter(item => item.level === 'beginner')
      },
      2: {
        title: "Querying & Relational Operations",
        desc: "Levels 9–18 · Window functions, complex types (Arrays/Maps/Structs), joins, groupings, pivot/unpivot, date/time functions",
        levels: window.SPARKSQL_DATA.filter(item => item.level === 'intermediate')
      },
      3: {
        title: "Delta Lake Deep Dive & Tuning",
        desc: "Levels 19–26 · DML (Merge/Update/Delete), time travel, subqueries, SCD Type 2, optimization, CDF, schema enforcement",
        levels: window.SPARKSQL_DATA.filter(item => item.level === 'advanced')
      },
      4: {
        title: "Enterprise Architecture & Governance",
        desc: "Levels 27–36 · DLT, Unity Catalog, Data Vault, GDPR compliance, FinOps, Fabric SQL endpoint, SQL UDFs, data quality",
        levels: window.SPARKSQL_DATA.filter(item => item.level === 'architect')
      }
    };

    let html = '';
    let globalLevelCounter = 1;

    for (let pNum in phases) {
      const phase = phases[pNum];
      html += `
        <div class="sparksql-phase-block" data-phase="${pNum}">
          <div class="sparksql-phase-header">
            <div class="phase-badge phase-badge-${pNum}">Phase ${pNum}</div>
            <div>
              <h3 class="phase-title">${phase.title}</h3>
              <p class="phase-desc">${phase.desc}</p>
            </div>
          </div>
      `;

      phase.levels.forEach(lvl => {
        const tags = [lvl.category || 'Spark SQL'];
        const notesHtml = (lvl.notes || []).map(note => `<li>${note}</li>`).join('');
        
        const escapedCode = lvl.code
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        html += `
          <div class="sparksql-level-card" data-phase="${pNum}">
            <div class="level-card-header" onclick="this.parentElement.classList.toggle('expanded')">
              <div class="level-badge">L${globalLevelCounter++}</div>
              <div class="level-meta">
                <h4 class="level-title">${lvl.title}</h4>
                <p class="level-tag">${tags.join(' · ')}</p>
              </div>
              <svg class="level-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="level-card-body">
              <div class="level-scenario">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                <p><strong>Enterprise Scenario:</strong> ${lvl.use_case || 'Production Spark SQL use-case.'}</p>
              </div>
              <pre class="code-block"><code class="language-sql">${escapedCode}</code></pre>
              <div class="level-mechanics">
                <h5>Physical Execution &amp; Internal Mechanics</h5>
                <p>${lvl.description}</p>
                ${notesHtml ? `<ul>${notesHtml}</ul>` : ''}
              </div>
            </div>
          </div>
        `;
      });

      html += `</div>`;
    }

    container.innerHTML = html;
    sparkSqlCurriculumRendered = true;
    
    if (window.anim && typeof window.anim.observeRevealTargets === 'function') {
      window.anim.observeRevealTargets(container);
    }
  }

  // --- PERSONALISED PREP VIEW ---

  function initPersonalised() {
    setupPersonalisedListeners();
    updatePersonalisedCounts();
    renderPersonalised();
  }

  function setupPersonalisedListeners() {
    // Search input — debounced to avoid freeze on fast typing
    if (DOM.personalised.search) {
      let _personalisedSearchDebounce;
      DOM.personalised.search.addEventListener('input', () => {
        clearTimeout(_personalisedSearchDebounce);
        _personalisedSearchDebounce = setTimeout(() => {
          updatePersonalisedCounts();
          renderPersonalised(true);
        }, 250);
      });
    }
    
    // Difficulty Selector click binding
    if (DOM.personalised.difficultySelector) {
      const btns = DOM.personalised.difficultySelector.querySelectorAll('.qa-sidebar-btn[data-difficulty]');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.activePersonalisedDifficulty = btn.getAttribute('data-difficulty') || 'ALL';
          updatePersonalisedCounts();
          renderPersonalised(true);
        });
      });
    }

    // Expand All / Collapse All buttons click binding
    const btnExpandAll = document.getElementById('btn-personalised-expand-all');
    if (btnExpandAll) {
      btnExpandAll.addEventListener('click', () => {
        const personalisedDomains = [
          'Microsoft Fabric, OneLake & Direct Lake Architecture',
          'Azure Native Data Engineering & Orchestration',
          'Delta Lake Technology & High-Performance ETL/ELT',
          'Data Modeling, Architecture Paradigms & Governance',
          'Cloud FinOps, Performance Optimization & CI/CD DevOps'
        ];
        personalisedDomains.forEach(domName => {
          state.expandedPersonalisedSections[domName] = true;
        });
        renderPersonalised(false);
        document.querySelectorAll('#personalised-container .concept-accordion-card').forEach(card => {
          card.classList.add('expanded');
          const body = card.querySelector('.level-card-body');
          if (body) body.style.display = 'block';
          const chevron = card.querySelector('.level-chevron');
          if (chevron) chevron.style.transform = 'rotate(180deg)';
        });
      });
    }

    const btnCollapseAll = document.getElementById('btn-personalised-collapse-all');
    if (btnCollapseAll) {
      btnCollapseAll.addEventListener('click', () => {
        const personalisedDomains = [
          'Microsoft Fabric, OneLake & Direct Lake Architecture',
          'Azure Native Data Engineering & Orchestration',
          'Delta Lake Technology & High-Performance ETL/ELT',
          'Data Modeling, Architecture Paradigms & Governance',
          'Cloud FinOps, Performance Optimization & CI/CD DevOps'
        ];
        personalisedDomains.forEach(domName => {
          state.expandedPersonalisedSections[domName] = false;
        });
        renderPersonalised(false);
        document.querySelectorAll('#personalised-container .concept-accordion-card').forEach(card => {
          card.classList.remove('expanded');
          const body = card.querySelector('.level-card-body');
          if (body) body.style.display = 'none';
          const chevron = card.querySelector('.level-chevron');
          if (chevron) chevron.style.transform = 'rotate(0deg)';
        });
      });
    }
  }

  function updatePersonalisedCounts() {
    const query = (DOM.personalised.search ? DOM.personalised.search.value : '').toLowerCase().trim();
    const activeDiff = state.activePersonalisedDifficulty || 'ALL';
    
    const personalisedDomains = [
      'Microsoft Fabric, OneLake & Direct Lake Architecture',
      'Azure Native Data Engineering & Orchestration',
      'Delta Lake Technology & High-Performance ETL/ELT',
      'Data Modeling, Architecture Paradigms & Governance',
      'Cloud FinOps, Performance Optimization & CI/CD DevOps'
    ];
    
    const container = DOM.personalised.domainList;
    if (container) {
      container.innerHTML = '';
      
      const pool = window.PERSONALISED_QUESTIONS || [];
      // Count total matching difficulty & search in the pool
      const totalMatching = pool.filter(q => {
        const matchesSearch = !query || 
                              (q.question || '').toLowerCase().includes(query) || 
                              (q.answer || '').toLowerCase().includes(query) || 
                              (q.subdomain || '').toLowerCase().includes(query);
        const matchesDiff = (activeDiff === 'ALL' || (q.difficulty || 'HARD').toUpperCase() === activeDiff);
        return matchesSearch && matchesDiff;
      }).length;
      
      // All Domains button
      const allBtn = document.createElement('button');
      allBtn.setAttribute('data-domain', 'ALL');
      allBtn.className = 'qa-sidebar-btn' + (state.activePersonalisedDomain === 'ALL' ? ' active' : '');
      allBtn.innerHTML = `
        <span>📂 All Domains</span>
        <span class="qa-btn-count-badge">${totalMatching.toLocaleString()}</span>
      `;
      allBtn.addEventListener('click', () => {
        state.activePersonalisedDomain = 'ALL';
        container.querySelectorAll('.qa-sidebar-btn').forEach(b => b.classList.remove('active'));
        allBtn.classList.add('active');
        renderPersonalised(true);
      });
      container.appendChild(allBtn);
      
      personalisedDomains.forEach(domName => {
        const domPool = pool.filter(q => q.domain === domName);
        if (domPool.length === 0) return;
        
        const matchCount = domPool.filter(q => {
          const matchesSearch = !query || 
                                (q.question || '').toLowerCase().includes(query) || 
                                (q.answer || '').toLowerCase().includes(query) || 
                                (q.subdomain || '').toLowerCase().includes(query);
          const matchesDiff = (activeDiff === 'ALL' || (q.difficulty || 'HARD').toUpperCase() === activeDiff);
          return matchesSearch && matchesDiff;
        }).length;
        
        if (matchCount === 0) return; // Hide domain if no match
        
        // nice domain display label
        const displayLabel = domName.includes('Fabric') ? 'Microsoft Fabric & OneLake' :
                             domName.includes('Azure Native') ? 'Azure Native Orchestration' :
                             domName.includes('Delta Lake') ? 'Delta Lake & ETL' :
                             domName.includes('Data Modeling') ? 'Data Modeling & Governance' : 'FinOps & DevOps';
        
        const btn = document.createElement('button');
        btn.setAttribute('data-domain', domName);
        btn.className = 'qa-sidebar-btn' + (state.activePersonalisedDomain === domName ? ' active' : '');
        btn.innerHTML = `
          <span>${displayLabel}</span>
          <span class="qa-btn-count-badge">${matchCount}</span>
        `;
        btn.addEventListener('click', () => {
          state.activePersonalisedDomain = domName;
          container.querySelectorAll('.qa-sidebar-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderPersonalised(true);
        });
        container.appendChild(btn);
      });
    }
  }

  function renderPersonalised(resetResults = true) {
    if (!DOM.personalised.container) return;
    
    const query = (DOM.personalised.search ? DOM.personalised.search.value : '').toLowerCase().trim();
    const activeDomain = state.activePersonalisedDomain || 'ALL';
    const activeDiff = state.activePersonalisedDifficulty || 'ALL';
    
    const pool = window.PERSONALISED_QUESTIONS || [];
    
    const filtered = pool.filter(q => {
      const matchesDomain = (activeDomain === 'ALL' || q.domain === activeDomain);
      const matchesDiff = (activeDiff === 'ALL' || (q.difficulty || 'HARD').toUpperCase() === activeDiff);
      const matchesSearch = !query || 
                            (q.question || '').toLowerCase().includes(query) || 
                            (q.answer || '').toLowerCase().includes(query) || 
                            (q.subdomain || '').toLowerCase().includes(query);
      return matchesDomain && matchesDiff && matchesSearch;
    });
    
    if (DOM.personalised.matchCount) {
      DOM.personalised.matchCount.textContent = `Showing ${filtered.length.toLocaleString()} matching questions`;
    }
    
    DOM.personalised.container.innerHTML = '';
    
    if (filtered.length === 0) {
      DOM.personalised.container.innerHTML = `
        <div class="no-results-card" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: var(--card-bg); border: 1px dashed var(--card-border); border-radius: 16px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 1.25rem; color: var(--text-secondary); opacity: 0.4;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <h4 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.15rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">No matching questions found</h4>
          <p style="color: var(--text-secondary); font-size: 0.88rem;">Try adjusting your filters or search keywords.</p>
        </div>
      `;
      return;
    }
    
    const personalisedDomains = [
      'Microsoft Fabric, OneLake & Direct Lake Architecture',
      'Azure Native Data Engineering & Orchestration',
      'Delta Lake Technology & High-Performance ETL/ELT',
      'Data Modeling, Architecture Paradigms & Governance',
      'Cloud FinOps, Performance Optimization & CI/CD DevOps'
    ];
    
    const sections = {};
    personalisedDomains.forEach(d => {
      sections[d] = [];
    });
    
    filtered.forEach(q => {
      if (sections[q.domain]) {
        sections[q.domain].push(q);
      }
    });
    
    const activeSections = personalisedDomains.filter(d => sections[d].length > 0);
    
    if (!state.personalisedLimits) state.personalisedLimits = {};
    if (resetResults) {
      state.expandedPersonalisedSections = {};
      state.personalisedLimits = {};
      if (activeSections.length > 0) {
        state.expandedPersonalisedSections[activeSections[0]] = true;
      }
    }
    
    let overallIdx = 1;
    
    activeSections.forEach(sectKey => {
      const sectItems = sections[sectKey];
      if (!sectItems || sectItems.length === 0) return;
      
      const isExpanded = !!state.expandedPersonalisedSections[sectKey];
      
      // Section Wrapper
      const sectionWrapper = document.createElement('div');
      sectionWrapper.className = 'unified-section-wrapper reveal-on-scroll';
      sectionWrapper.style.marginBottom = '1.25rem';
      sectionWrapper.style.border = '1px solid var(--card-border)';
      sectionWrapper.style.borderRadius = '16px';
      sectionWrapper.style.overflow = 'hidden';
      
      const sectionIcons = {
        'Microsoft Fabric, OneLake & Direct Lake Architecture': '📊',
        'Azure Native Data Engineering & Orchestration': '⚙️',
        'Delta Lake Technology & High-Performance ETL/ELT': '⚡',
        'Data Modeling, Architecture Paradigms & Governance': '🛡️',
        'Cloud FinOps, Performance Optimization & CI/CD DevOps': '💸'
      };
      
      const sectEmoji = sectionIcons[sectKey] || '📁';
      
      // Header
      const headerDiv = document.createElement('div');
      headerDiv.className = 'unified-section-header';
      headerDiv.style.cursor = 'pointer';
      headerDiv.style.display = 'flex';
      headerDiv.style.alignItems = 'center';
      headerDiv.style.justifyContent = 'space-between';
      headerDiv.style.padding = '1.1rem 1.5rem';
      headerDiv.style.background = 'rgba(255, 255, 255, 0.02)';
      
      headerDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 1.15rem;">${sectEmoji}</span>
          <span style="font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.95rem; color: var(--text-primary); letter-spacing: 0.02em;">${sectKey}</span>
          <span style="background: rgba(255, 255, 255, 0.08); color: var(--text-secondary); font-size: 0.72rem; padding: 2px 8px; border-radius: 99px; font-weight: 600;">${sectItems.length}</span>
        </div>
        <svg class="section-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.25s ease; transform: ${isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}; color: var(--text-secondary);"><polyline points="6 9 12 15 18 9"/></svg>
      `;
      sectionWrapper.appendChild(headerDiv);
      
      // Body
      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'unified-section-body';
      bodyDiv.style.display = isExpanded ? 'block' : 'none';
      bodyDiv.style.padding = '1.5rem';
      bodyDiv.style.borderTop = '1px solid var(--card-border)';
      bodyDiv.style.background = 'rgba(0, 0, 0, 0.1)';
      
      {
        // Section sub-header controls (counts and expand/collapse pills)
        const subHeaderDiv = document.createElement('div');
        subHeaderDiv.className = 'qa-section-controls';
        subHeaderDiv.style.display = 'flex';
        subHeaderDiv.style.justifyContent = 'space-between';
        subHeaderDiv.style.alignItems = 'center';
        subHeaderDiv.style.marginBottom = '1.25rem';
        subHeaderDiv.style.padding = '0.5rem 1rem';
        subHeaderDiv.style.background = 'rgba(255, 255, 255, 0.02)';
        subHeaderDiv.style.borderRadius = '10px';
        subHeaderDiv.style.border = '1px solid var(--card-border)';
        
        const countText = document.createElement('span');
        countText.style.fontSize = '0.8rem';
        countText.style.fontWeight = '600';
        countText.style.color = 'var(--text-secondary)';
        countText.textContent = `Showing ${sectItems.length} matching questions`;
        subHeaderDiv.appendChild(countText);
        
        const pillsContainer = document.createElement('div');
        pillsContainer.style.display = 'flex';
        pillsContainer.style.gap = '0.5rem';
        
        const expandPill = document.createElement('button');
        expandPill.className = 'control-btn';
        expandPill.style.padding = '0.3rem 0.6rem';
        expandPill.style.fontSize = '0.7rem';
        expandPill.style.borderRadius = '6px';
        expandPill.style.cursor = 'pointer';
        expandPill.style.border = '1px solid var(--card-border)';
        expandPill.style.background = 'rgba(255, 255, 255, 0.02)';
        expandPill.style.color = 'var(--text-secondary)';
        expandPill.textContent = 'Expand All';
        expandPill.addEventListener('click', (e) => {
          e.stopPropagation();
          subGrid.querySelectorAll('.concept-accordion-card').forEach(card => {
            card.classList.add('expanded');
            const body = card.querySelector('.level-card-body');
            if (body) body.style.display = 'block';
            const chevron = card.querySelector('.level-chevron');
            if (chevron) chevron.style.transform = 'rotate(180deg)';
          });
        });
        
        const collapsePill = document.createElement('button');
        collapsePill.className = 'control-btn';
        collapsePill.style.padding = '0.3rem 0.6rem';
        collapsePill.style.fontSize = '0.7rem';
        collapsePill.style.borderRadius = '6px';
        collapsePill.style.cursor = 'pointer';
        collapsePill.style.border = '1px solid var(--card-border)';
        collapsePill.style.background = 'rgba(255, 255, 255, 0.02)';
        collapsePill.style.color = 'var(--text-secondary)';
        collapsePill.textContent = 'Collapse All';
        collapsePill.addEventListener('click', (e) => {
          e.stopPropagation();
          subGrid.querySelectorAll('.concept-accordion-card').forEach(card => {
            card.classList.remove('expanded');
            const body = card.querySelector('.level-card-body');
            if (body) body.style.display = 'none';
            const chevron = card.querySelector('.level-chevron');
            if (chevron) chevron.style.transform = 'rotate(0deg)';
          });
        });
        
        pillsContainer.appendChild(expandPill);
        pillsContainer.appendChild(collapsePill);
        subHeaderDiv.appendChild(pillsContainer);
        bodyDiv.appendChild(subHeaderDiv);
        
        // Sub-grid
        const subGrid = document.createElement('div');
        subGrid.className = 'concepts-grid';
        bodyDiv.appendChild(subGrid);
        
        const limit = state.personalisedLimits[sectKey] || 30;
        const visibleItems = sectItems.slice(0, limit);
        
        visibleItems.forEach(q => {
          const card = document.createElement('div');
          card.className = 'concept-accordion-card';
          
          const cardHeader = document.createElement('div');
          cardHeader.className = 'level-card-header';
          cardHeader.style.cursor = 'pointer';
          cardHeader.innerHTML = `
            <div class="level-badge" style="background: var(--cat-fabric); color: #fff; font-size: 0.8rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; width: 42px; height: 42px; border-radius: 10px;">${overallIdx++}</div>
            <div class="level-meta" style="flex: 1; min-width: 0;">
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 4px; align-items: center;">
                <span style="font-size: 0.75rem; font-weight: 600; color: var(--accent);">${q.subdomain}</span>
              </div>
              <h4 class="level-title" style="margin: 0; font-size: 0.95rem; font-weight: 600; line-height: 1.4; color: var(--text-primary);">${escapeHTML(q.question)}</h4>
            </div>
            <svg class="level-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.25s ease;"><polyline points="6 9 12 15 18 9"/></svg>
          `;
          
          const cardBody = document.createElement('div');
          cardBody.className = 'level-card-body';
          cardBody.style.display = 'none';
          cardBody.style.borderTop = '1px solid var(--card-border)';
          cardBody.style.padding = '1.25rem';
          cardBody.style.background = 'rgba(255, 255, 255, 0.01)';
          
          const formattedAnswer = formatArchitectAnswer(q.answer);
          cardBody.innerHTML = `
            <div style="font-family: 'Outfit', sans-serif; font-size: 0.92rem; line-height: 1.6; color: var(--text-secondary);">
              ${formattedAnswer}
            </div>
          `;
          
          card.appendChild(cardHeader);
          card.appendChild(cardBody);
          
          cardHeader.addEventListener('click', () => {
            const isOpen = cardBody.style.display !== 'none';
            const chevron = cardHeader.querySelector('.level-chevron');
            if (chevron) {
              chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            }
            if (isOpen) {
              cardBody.style.display = 'none';
              card.classList.remove('expanded');
            } else {
              cardBody.style.display = 'block';
              card.classList.add('expanded');
              if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                MathJax.typesetPromise([cardBody]).catch(err => console.error("MathJax error:", err));
              }
            }
          });
          
          subGrid.appendChild(card);
        });

        // Load More button inside section
        if (sectItems.length > limit) {
          const loadMoreWrap = document.createElement('div');
          loadMoreWrap.style.display = 'flex';
          loadMoreWrap.style.justifyContent = 'center';
          loadMoreWrap.style.marginTop = '1.5rem';

          const loadMoreBtn = document.createElement('button');
          loadMoreBtn.className = 'de-load-more-btn';
          loadMoreBtn.style.padding = '0.5rem 1.5rem';
          loadMoreBtn.style.fontSize = '0.85rem';
          loadMoreBtn.textContent = `Show More Questions (showing ${limit} of ${sectItems.length})`;
          
          loadMoreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            state.personalisedLimits[sectKey] = limit + 30;
            renderPersonalised(false);
          });

          loadMoreWrap.appendChild(loadMoreBtn);
          bodyDiv.appendChild(loadMoreWrap);
        }
      }
      
      sectionWrapper.appendChild(bodyDiv);
      
      headerDiv.addEventListener('click', () => {
        state.expandedPersonalisedSections[sectKey] = !state.expandedPersonalisedSections[sectKey];
        renderPersonalised(false);
      });
      
      DOM.personalised.container.appendChild(sectionWrapper);
    });
  }

  function matchesSearchQuery(q, query, sourceDb) {
    if (!query) return true;
    const qText = (q.question || q.title || '').toLowerCase();
    let aText = '';
    if (['python', 'mssql', 'pyspark', 'sparksql'].includes(sourceDb)) {
      aText = (q.description || '') + ' ' + (q.use_case || '') + ' ' + (q.notes || []).join(' ') + ' ' + (q.code || '');
      aText = aText.toLowerCase();
    } else {
      aText = (q.answer || '').toLowerCase();
    }
    const catLabel = sourceDb === 'personalised' ? (q.subdomain || q.domain || 'Personalised') :
                     sourceDb === 'fabric_pbi' ? q.category :
                     sourceDb === 'general' ? q.category :
                     sourceDb === 'python' ? (q.category || 'Python') :
                     sourceDb === 'mssql' ? (q.category || 'SQL') :
                     sourceDb === 'pyspark' ? (q.category || 'PySpark') :
                     sourceDb === 'sparksql' ? (q.category || 'Spark SQL') : '';
    const catText = (catLabel || '').toLowerCase();
    return qText.includes(query) || aText.includes(query) || catText.includes(query);
  }



  function renderUnifiedSearch(resetResults = true) {
    if (!DOM.prephub || !DOM.prephub.unifiedSearchContainer) return;

    if (resetResults) {
      state.unifiedSearchPage = 1;
    }
    DOM.prephub.unifiedSearchContainer.innerHTML = '';

    const query = (DOM.prephub.unifiedSearchInput ? DOM.prephub.unifiedSearchInput.value : '').toLowerCase().trim();
    const catFilter = state.activeUnifiedCategory || 'ALL';
    const diffFilter = state.activeUnifiedDifficulty || 'ALL';

    // DB filter removed — pool is all questions
    const pool = state.questions;

    // Filter items
    const filtered = pool.filter(q => {
      // 1. Text Search Filter
      const qText = (q.question || '').toLowerCase();
      let aText = '';
      if (['python', 'mssql', 'pyspark', 'sparksql'].includes(q.sourceDb)) {
        aText = (q.description || '') + ' ' + (q.use_case || '') + ' ' + (q.notes || []).join(' ') + ' ' + (q.code || '');
        aText = aText.toLowerCase();
      } else {
        aText = (q.answer || '').toLowerCase();
      }
      const catText = (q.categoryLabel || '').toLowerCase();
      const matchesSearch = !query || qText.includes(query) || aText.includes(query) || catText.includes(query);
      if (!matchesSearch) return false;

      // 2. Standardized Domain Category Filter
      if (catFilter !== 'ALL') {
        const itemDomain = getStandardizedDomain(q);
        if (itemDomain !== catFilter) return false;
      }

      // 3. Difficulty Filter
      if (diffFilter !== 'ALL') {
        const itemDiff = q.difficulty;
        if (itemDiff !== diffFilter) return false;
      }

      return true;
    });

    // Update match count display
    if (DOM.prephub.unifiedMatchCount) {
      DOM.prephub.unifiedMatchCount.textContent = `Showing ${filtered.length.toLocaleString()} matching questions`;
    }

    if (filtered.length === 0) {
      DOM.prephub.unifiedSearchContainer.innerHTML = `
        <div class="no-results-card" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: var(--card-bg); border: 1px dashed var(--card-border); border-radius: 16px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 1.25rem; color: var(--text-secondary); opacity: 0.4;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <h4 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.15rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">No matching questions found</h4>
          <p style="color: var(--text-secondary); font-size: 0.88rem;">Try adjusting your filters or search keywords.</p>
        </div>
      `;
      return;
    }

    // Group items into standardized domains
    const sections = {};
    const domainsList = [
      'Analytics, BI & AI',
      'Compute & Orchestration',
      'Databases, SQL & Storage',
      'Data Pipelines & Ingestion',
      'Data Lakehouse & Architecture',
      'Data Governance & Quality',
      'FinOps & Performance Optimization',
      'General Data Engineering'
    ];

    domainsList.forEach(domName => {
      sections[domName] = [];
    });

    filtered.forEach(item => {
      const domName = getStandardizedDomain(item);
      if (sections[domName]) {
        sections[domName].push(item);
      }
    });

    const activeSections = domainsList.filter(domName => sections[domName].length > 0);

    if (resetResults) {
      state.unifiedSectionLimits = {};
      state.expandedUnifiedSections = {};
      if (activeSections.length > 0) {
        state.expandedUnifiedSections[activeSections[0]] = true;
      }
    }

    let overallIdx = 1;

    activeSections.forEach(sectKey => {
      const sectItems = sections[sectKey];
      if (!sectItems || sectItems.length === 0) return;

      const isExpanded = !!state.expandedUnifiedSections[sectKey];
      const limit = state.unifiedSectionLimits[sectKey] || 30;

      // Section Wrapper
      const sectionWrapper = document.createElement('div');
      sectionWrapper.className = 'unified-section-wrapper reveal-on-scroll';
      sectionWrapper.style.marginBottom = '1.25rem';
      sectionWrapper.style.border = '1px solid var(--card-border)';
      sectionWrapper.style.borderRadius = '16px';
      sectionWrapper.style.overflow = 'hidden';
      sectionWrapper.style.transition = 'all 0.3s ease';

      // Section Icon Map
      const sectionIcons = {
        'Analytics, BI & AI': '📊',
        'Compute & Orchestration': '⚙️',
        'Databases, SQL & Storage': '🔷',
        'Data Pipelines & Ingestion': '⚡',
        'Data Lakehouse & Architecture': '🔥',
        'Data Governance & Quality': '🛡️',
        'FinOps & Performance Optimization': '💸',
        'General Data Engineering': '📚'
      };

      const sectEmoji = sectionIcons[sectKey] || '📁';

      // Header
      const headerDiv = document.createElement('div');
      headerDiv.className = 'unified-section-header';
      headerDiv.style.cursor = 'pointer';
      headerDiv.style.display = 'flex';
      headerDiv.style.alignItems = 'center';
      headerDiv.style.justifyContent = 'space-between';
      headerDiv.style.padding = '1.1rem 1.5rem';
      headerDiv.style.background = 'rgba(255, 255, 255, 0.02)';
      headerDiv.style.transition = 'background 0.2s';
      
      headerDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 1.15rem;">${sectEmoji}</span>
          <span style="font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.95rem; color: var(--text-primary); letter-spacing: 0.02em;">${sectKey}</span>
          <span style="background: rgba(255, 255, 255, 0.08); color: var(--text-secondary); font-size: 0.72rem; padding: 2px 8px; border-radius: 99px; font-weight: 600;">${sectItems.length}</span>
        </div>
        <svg class="section-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.25s ease; transform: ${isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}; color: var(--text-secondary);"><polyline points="6 9 12 15 18 9"/></svg>
      `;

      sectionWrapper.appendChild(headerDiv);

      // Body (only rendered/expanded if active)
      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'unified-section-body';
      bodyDiv.style.display = isExpanded ? 'block' : 'none';
      bodyDiv.style.padding = '1.5rem';
      bodyDiv.style.borderTop = '1px solid var(--card-border)';
      bodyDiv.style.background = 'rgba(0, 0, 0, 0.1)';

      if (isExpanded) {
        // Section sub-header controls (counts and expand/collapse pills)
        const subHeaderDiv = document.createElement('div');
        subHeaderDiv.className = 'qa-section-controls';
        subHeaderDiv.style.display = 'flex';
        subHeaderDiv.style.justifyContent = 'space-between';
        subHeaderDiv.style.alignItems = 'center';
        subHeaderDiv.style.marginBottom = '1.25rem';
        subHeaderDiv.style.padding = '0.5rem 1rem';
        subHeaderDiv.style.background = 'rgba(255, 255, 255, 0.02)';
        subHeaderDiv.style.borderRadius = '10px';
        subHeaderDiv.style.border = '1px solid var(--card-border)';
        
        // Count text
        const countText = document.createElement('span');
        countText.style.fontSize = '0.8rem';
        countText.style.fontWeight = '600';
        countText.style.color = 'var(--text-secondary)';
        countText.textContent = `Showing ${Math.min(limit, sectItems.length)} of ${sectItems.length} matching questions`;
        subHeaderDiv.appendChild(countText);
        
        // Pill Buttons Container
        const pillsContainer = document.createElement('div');
        pillsContainer.style.display = 'flex';
        pillsContainer.style.gap = '0.5rem';
        
        const expandPill = document.createElement('button');
        expandPill.className = 'control-btn';
        expandPill.style.padding = '0.3rem 0.6rem';
        expandPill.style.fontSize = '0.7rem';
        expandPill.style.borderRadius = '6px';
        expandPill.style.cursor = 'pointer';
        expandPill.style.border = '1px solid var(--card-border)';
        expandPill.style.background = 'rgba(255, 255, 255, 0.02)';
        expandPill.style.color = 'var(--text-secondary)';
        expandPill.textContent = 'Expand All';
        expandPill.addEventListener('click', (e) => {
          e.stopPropagation();
          // Expand all cards in this section's sub-grid
          subGrid.querySelectorAll('.concept-accordion-card').forEach(card => {
            card.classList.add('expanded');
            const body = card.querySelector('.level-card-body');
            if (body) body.style.display = 'block';
            const chevron = card.querySelector('.level-chevron');
            if (chevron) chevron.style.transform = 'rotate(180deg)';
          });
        });
        
        const collapsePill = document.createElement('button');
        collapsePill.className = 'control-btn';
        collapsePill.style.padding = '0.3rem 0.6rem';
        collapsePill.style.fontSize = '0.7rem';
        collapsePill.style.borderRadius = '6px';
        collapsePill.style.cursor = 'pointer';
        collapsePill.style.border = '1px solid var(--card-border)';
        collapsePill.style.background = 'rgba(255, 255, 255, 0.02)';
        collapsePill.style.color = 'var(--text-secondary)';
        collapsePill.textContent = 'Collapse All';
        collapsePill.addEventListener('click', (e) => {
          e.stopPropagation();
          // Collapse all cards in this section's sub-grid
          subGrid.querySelectorAll('.concept-accordion-card').forEach(card => {
            card.classList.remove('expanded');
            const body = card.querySelector('.level-card-body');
            if (body) body.style.display = 'none';
            const chevron = card.querySelector('.level-chevron');
            if (chevron) chevron.style.transform = 'rotate(0deg)';
          });
        });
        
        pillsContainer.appendChild(expandPill);
        pillsContainer.appendChild(collapsePill);
        subHeaderDiv.appendChild(pillsContainer);
        
        bodyDiv.appendChild(subHeaderDiv);

        // Render sub-grid
        const subGrid = document.createElement('div');
        subGrid.className = 'concepts-grid';
        bodyDiv.appendChild(subGrid);

        // Slice items
        const visibleSectItems = sectItems.slice(0, limit);
        visibleSectItems.forEach(q => {
          const card = document.createElement('div');
          card.className = 'concept-accordion-card';
          
          let badgeBg = 'var(--accent)';
          if (q.sourceDb === 'personalised') {
            badgeBg = '#ef4444';
          } else if (q.sourceDb === 'fabric_pbi') {
            badgeBg = '#3b82f6';
          } else if (q.sourceDb === 'general') {
            badgeBg = '#10b981';
          } else if (q.sourceDb === 'python') {
            badgeBg = '#eab308';
          } else if (q.sourceDb === 'mssql') {
            badgeBg = '#ec4899';
          } else if (q.sourceDb === 'pyspark') {
            badgeBg = '#f97316';
          } else if (q.sourceDb === 'sparksql') {
            badgeBg = '#8b5cf6';
          }

          const qStatus = state.progress[q.id] || 'unseen';

          const cardHeader = document.createElement('div');
          cardHeader.className = 'level-card-header';
          cardHeader.style.cursor = 'pointer';
          cardHeader.innerHTML = `
            <div class="level-badge" style="background: ${badgeBg}; color: #fff; font-size: 0.8rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; width: 42px; height: 42px; border-radius: 10px;">${overallIdx++}</div>
            <div class="level-meta" style="flex: 1; min-width: 0;">
              <div style="margin-bottom: 4px;">
                <span style="font-size: 0.75rem; font-weight: 600; color: var(--accent);">${q.categoryLabel}</span>
              </div>
              <h4 class="level-title" style="margin: 0; font-size: 0.95rem; font-weight: 600; line-height: 1.4; color: var(--text-primary);">${escapeHTML(q.question)}</h4>
            </div>
            <svg class="level-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.25s ease;"><polyline points="6 9 12 15 18 9"/></svg>
          `;

          const cardBody = document.createElement('div');
          cardBody.className = 'level-card-body';
          cardBody.style.display = 'none';
          cardBody.style.borderTop = '1px solid var(--card-border)';
          cardBody.style.padding = '1.25rem';
          cardBody.style.background = 'rgba(255, 255, 255, 0.01)';
          // Fix H: Lazy rendering — store question index; render content on first expand
          cardBody.dataset.qIdx = String(visibleSectItems.indexOf(q));
          cardBody.dataset.rendered = 'false';

          card.appendChild(cardHeader);
          card.appendChild(cardBody);

          // Card Expand Toggle — lazy-renders answer on first open
          cardHeader.addEventListener('click', () => {
            const isOpen = cardBody.style.display !== 'none';
            const chevron = cardHeader.querySelector('.level-chevron');
            if (chevron) {
              chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            }
            if (isOpen) {
              cardBody.style.display = 'none';
              card.classList.remove('expanded');
            } else {
              // Lazy-render the answer HTML on first expand
              if (cardBody.dataset.rendered === 'false') {
                cardBody.dataset.rendered = 'true';
                let answerHtml = '';
                if (['python', 'mssql', 'pyspark', 'sparksql'].includes(q.sourceDb)) {
                  const lang = q.sourceDb;
                  const highlightedCode = typeof Highlighter !== 'undefined' ? Highlighter.highlight(q.code || '', lang) : escapeHTML(q.code || '');
                  let notesHtml = '';
                  if (q.notes && q.notes.length) {
                    notesHtml = `
                      <div class="card-notes" style="margin-top: 1rem;">
                        <div class="notes-label" style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; font-size: 0.88rem;">Key Points:</div>
                        ${q.notes.map(n => `
                          <div class="note-item" style="display: flex; gap: 0.5rem; align-items: flex-start; margin-bottom: 0.35rem; font-size: 0.88rem; color: var(--text-secondary);">
                            <div class="note-bullet" style="width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-top: 6px; flex-shrink: 0;"></div>
                            <span>${escapeHTML(n)}</span>
                          </div>
                        `).join('')}
                      </div>
                    `;
                  }
                  answerHtml = `
                    <div style="font-family: 'Outfit', sans-serif; font-size: 0.92rem; line-height: 1.6;">
                      <p style="color: var(--text-primary); margin-bottom: 1rem; font-weight: 500;">${escapeHTML(q.description || '')}</p>
                      <div class="use-case-banner" style="display: flex; gap: 0.75rem; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--card-border); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1rem;">
                        <span class="uc-icon" style="font-size: 1.1rem; line-height: 1;">🎯</span>
                        <div class="uc-content">
                          <div class="uc-label" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--accent); letter-spacing: 0.05em; margin-bottom: 2px;">Real-World Use Case</div>
                          <div class="uc-text" style="font-size: 0.88rem; color: var(--text-secondary);">${escapeHTML(q.use_case || '')}</div>
                        </div>
                      </div>
                      <div class="code-wrapper" style="border: 1px solid var(--card-border); border-radius: 8px; overflow: hidden; background: #0b0d19; margin-bottom: 1rem;">
                        <div class="code-toolbar" style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 1rem; background: rgba(255, 255, 255, 0.03); border-bottom: 1px solid var(--card-border); font-size: 0.75rem;">
                          <span class="code-lang-badge" style="color: var(--text-secondary); font-weight: 600;">${lang === 'python' ? 'Python' : lang === 'mssql' ? 'T-SQL' : lang === 'pyspark' ? 'PySpark' : 'Spark SQL'}</span>
                          <button class="copy-btn" title="Copy code" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; gap: 4px; font-family: inherit; font-size: 0.75rem; transition: color 0.2s;">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                            Copy
                          </button>
                        </div>
                        <pre class="code-block" style="margin: 0; padding: 1rem; overflow-x: auto; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.85rem; line-height: 1.5; color: #e2e8f0; max-height: 400px;"><code class="language-${lang === 'mssql' ? 'sql' : lang}">${highlightedCode}</code></pre>
                      </div>
                      ${notesHtml}
                    </div>
                  `;
                } else {
                  const formattedAnswer = formatArchitectAnswer(q.answer);
                  answerHtml = `
                    <div style="font-family: 'Outfit', sans-serif; font-size: 0.92rem; line-height: 1.6; color: var(--text-secondary);">
                      ${formattedAnswer}
                    </div>
                  `;
                }
                cardBody.innerHTML = answerHtml;
                // Wire up copy button for code cards after lazy render
                if (['python', 'mssql', 'pyspark', 'sparksql'].includes(q.sourceDb)) {
                  const copyBtn = cardBody.querySelector('.copy-btn');
                  if (copyBtn) {
                    copyBtn.addEventListener('click', (e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(q.code || '').then(() => {
                        copyBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
                        setTimeout(() => {
                          copyBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`;
                        }, 2000);
                      });
                    });
                  }
                }
              }
              cardBody.style.display = 'block';
              card.classList.add('expanded');
              
              if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                MathJax.typesetPromise([cardBody]).catch(err => console.error("MathJax error:", err));
              }
            }
          });

          subGrid.appendChild(card);
        });

        // Load More button inside section
        if (sectItems.length > limit) {
          const loadMoreWrap = document.createElement('div');
          loadMoreWrap.style.display = 'flex';
          loadMoreWrap.style.justifyContent = 'center';
          loadMoreWrap.style.marginTop = '1.5rem';

          const loadMoreBtn = document.createElement('button');
          loadMoreBtn.className = 'de-load-more-btn';
          loadMoreBtn.style.padding = '0.5rem 1.5rem';
          loadMoreBtn.style.fontSize = '0.85rem';
          loadMoreBtn.textContent = `Show More Questions (showing ${limit} of ${sectItems.length})`;
          
          loadMoreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            state.unifiedSectionLimits[sectKey] = limit + 30;
            renderUnifiedSearch(false);
          });

          loadMoreWrap.appendChild(loadMoreBtn);
          bodyDiv.appendChild(loadMoreWrap);
        }
      }

      sectionWrapper.appendChild(bodyDiv);

      // Section Header Click Listener — debounced to prevent rapid re-renders
      let _sectionToggleTimeout;
      headerDiv.addEventListener('click', () => {
        state.expandedUnifiedSections[sectKey] = !state.expandedUnifiedSections[sectKey];
        clearTimeout(_sectionToggleTimeout);
        _sectionToggleTimeout = setTimeout(() => renderUnifiedSearch(false), 60);
      });

      DOM.prephub.unifiedSearchContainer.appendChild(sectionWrapper);
    });
  }

  function updateUnifiedSearchCounts() {
    const query = (DOM.prephub && DOM.prephub.unifiedSearchInput ? DOM.prephub.unifiedSearchInput.value : '').toLowerCase().trim();
    const activeDiff = state.activeUnifiedDifficulty || 'ALL';
    const activeCat = state.activeUnifiedCategory || 'ALL';

    // Single-pass accumulation — DB filter removed, so only diff + domain axes needed
    const diffCounts = { ALL: 0, EASY: 0, MEDIUM: 0, HARD: 0, ARCHITECT: 0 };
    const domainCounts = { ALL: 0 };

    const DOMAINS = [
      'Analytics, BI & AI', 'Compute & Orchestration', 'Databases, SQL & Storage',
      'Data Pipelines & Ingestion', 'Data Lakehouse & Architecture', 'Data Governance & Quality',
      'FinOps & Performance Optimization', 'General Data Engineering'
    ];
    DOMAINS.forEach(d => { domainCounts[d] = 0; });

    state.questions.forEach(q => {
      const qMatchesQuery = query ? matchesSearchQuery(q, query, q.sourceDb) : true;
      if (!qMatchesQuery) return;

      const qDiff = q.difficulty;
      const qDomain = getStandardizedDomain(q);

      // Diff counts: cross-filter with query + domain (no DB axis)
      const qMatchesDomain = activeCat === 'ALL' || qDomain === activeCat;
      if (qMatchesDomain) {
        diffCounts.ALL++;
        if (diffCounts[qDiff] !== undefined) diffCounts[qDiff]++;
      }

      // Domain counts: cross-filter with query + diff (no DB axis)
      const qMatchesDiff = activeDiff === 'ALL' || qDiff === activeDiff;
      if (qMatchesDiff) {
        domainCounts.ALL++;
        if (domainCounts[qDomain] !== undefined) domainCounts[qDomain]++;
      }
    });

    const getDiffCount = (diffKey) => diffCounts[diffKey] !== undefined ? diffCounts[diffKey] : 0;
    const getDomainCount = (domVal) => domainCounts[domVal] !== undefined ? domainCounts[domVal] : 0;

    // 2. Calculate difficulty/level counts and update UI badges
    const diffKeys = {
      'count-diff-all': 'ALL',
      'count-diff-easy': 'EASY',
      'count-diff-medium': 'MEDIUM',
      'count-diff-hard': 'HARD',
      'count-diff-architect': 'ARCHITECT'
    };

    for (const [id, diffVal] of Object.entries(diffKeys)) {
      const el = document.getElementById(id);
      if (el) {
        const count = getDiffCount(diffVal);
        el.textContent = count.toLocaleString();
        
        // Adjust style dynamically (fade out and disable if count is 0)
        const btn = el.closest('.qa-sidebar-btn');
        if (btn) {
          if (count === 0 && diffVal !== 'ALL') {
            btn.style.opacity = '0.35';
            btn.style.pointerEvents = 'none';
          } else {
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
          }
        }
      }
    }

    // 3. Rebuild domains sidebar selector inside #unified-domain-list
    const domains = [
      'Analytics, BI & AI',
      'Compute & Orchestration',
      'Databases, SQL & Storage',
      'Data Pipelines & Ingestion',
      'Data Lakehouse & Architecture',
      'Data Governance & Quality',
      'FinOps & Performance Optimization',
      'General Data Engineering'
    ];

    const container = document.getElementById('unified-domain-list');
    if (container) {
      container.innerHTML = '';

      const allDomainsCount = getDomainCount('ALL');

      // Add "All Domains" button
      const allBtn = document.createElement('button');
      allBtn.className = 'qa-sidebar-btn' + (state.activeUnifiedCategory === 'ALL' ? ' active' : '');
      allBtn.setAttribute('data-domain', 'ALL');
      allBtn.innerHTML = `
        <span>📂 All Domains</span>
        <span class="qa-btn-count-badge">${allDomainsCount.toLocaleString()}</span>
      `;
      allBtn.addEventListener('click', () => {
        state.activeUnifiedCategory = 'ALL';
        container.querySelectorAll('.qa-sidebar-btn').forEach(b => b.classList.remove('active'));
        allBtn.classList.add('active');
        state.unifiedSearchPage = 1;
        renderUnifiedSearch(true);
      });
      container.appendChild(allBtn);

      domains.forEach(domName => {
        const matchCount = getDomainCount(domName);
        if (matchCount === 0) return; // Hide domain if no matching questions for current filter combinations

        const btn = document.createElement('button');
        btn.className = 'qa-sidebar-btn' + (state.activeUnifiedCategory === domName ? ' active' : '');
        btn.setAttribute('data-domain', domName);
        btn.innerHTML = `
          <span>${domName}</span>
          <span class="qa-btn-count-badge">${matchCount}</span>
        `;
        btn.addEventListener('click', () => {
          state.activeUnifiedCategory = domName;
          container.querySelectorAll('.qa-sidebar-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.unifiedSearchPage = 1;
          renderUnifiedSearch(true);
        });
        container.appendChild(btn);
      });
    }
  }

  // Format architect answer containing numbered lists or bullet points
  function formatArchitectAnswer(text) {
    return formatMarkdownToHTML(text);
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Application init deferred to the end of DOMContentLoaded wrapper


/* --- SPARK GUIDE INTEGRATED LOGIC --- */

        const brilliantBlues = ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087'];
        const vibrantPalette = ['#7a5195', '#bc5090', '#ef5675', '#ff764a', '#ffa600'];

        let rawResponseText = "";

        // Chart instances stored globally in this scope for theme switching
        let myRadarChart = null;
        let mySqlChart = null;
        let myStreamingChart = null;
        let myMlChart = null;
        let myGraphChart = null;

        // Theme updater function for charts
        function updateChartThemes() {
            const isDark = state.theme === 'dark';
            const labelColor = isDark ? '#cbd5e1' : '#1e293b';
            const gridColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
            const angleColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';

            if (myRadarChart && myRadarChart.options && myRadarChart.options.scales && myRadarChart.options.scales.r) {
                myRadarChart.options.scales.r.grid.color = gridColor;
                myRadarChart.options.scales.r.angleLines.color = angleColor;
                myRadarChart.options.scales.r.pointLabels.color = labelColor;
                myRadarChart.update();
            }

            const donutCharts = [mySqlChart, myStreamingChart, myMlChart, myGraphChart];
            donutCharts.forEach(chart => {
                if (chart && chart.options && chart.options.plugins && chart.options.plugins.legend) {
                    chart.options.plugins.legend.labels.color = labelColor;
                    chart.update();
                }
            });
        }
        window.updateChartThemes = updateChartThemes;

        // Double-check element definitions before mounting charts
        const ctxRadar = document.getElementById('languageApiChartExtended');
        if (ctxRadar) {
            myRadarChart = new Chart(ctxRadar, {
                type: 'radar',
                data: {
                    labels: ['Performance (Direct Execution)', 'Ease of Use', 'Ecosystem Integration', 'Type Safety (Compile Time)', 'Memory Footprint'],
                    datasets: [{
                        label: 'Scala / Java',
                        data: [10, 6, 9, 10, 9],
                        borderColor: brilliantBlues[0],
                        backgroundColor: 'rgba(0, 63, 92, 0.1)',
                        pointBackgroundColor: brilliantBlues[0]
                    }, {
                        label: 'PySpark (Python)',
                        data: [8, 10, 10, 4, 7],
                        borderColor: brilliantBlues[2],
                        backgroundColor: 'rgba(102, 81, 145, 0.1)',
                        pointBackgroundColor: brilliantBlues[2]
                    }, {
                        label: 'Spark SQL Engine',
                        data: [9, 9, 8, 5, 8],
                        borderColor: brilliantBlues[4],
                        backgroundColor: 'rgba(212, 80, 135, 0.1)',
                        pointBackgroundColor: brilliantBlues[4]
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            angleLines: { color: state.theme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)' },
                            grid: { color: state.theme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)' },
                            pointLabels: { 
                                font: { size: 10, family: 'Inter' },
                                color: state.theme === 'light' ? '#1e293b' : '#cbd5e1'
                            },
                            ticks: { display: false }
                        }
                    }
                }
            });
        }

        const donutOptions = {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 10,
                        padding: 10,
                        font: { size: 10, family: 'Inter' },
                        color: state.theme === 'light' ? '#1e293b' : '#cbd5e1'
                    }
                }
            },
            cutout: '60%'
        };

        const ctxSql = document.getElementById('ecosystemSqlChart');
        if (ctxSql) {
            mySqlChart = new Chart(ctxSql, {
                type: 'doughnut',
                data: {
                    labels: ['Declarative ETL', 'Interactive BI', 'Data Lakes', 'Federated Queries'],
                    datasets: [{
                        data: [45, 25, 18, 12],
                        backgroundColor: vibrantPalette
                    }]
                },
                options: donutOptions
            });
        }

        const ctxStreaming = document.getElementById('ecosystemStreamingChart');
        if (ctxStreaming) {
            myStreamingChart = new Chart(ctxStreaming, {
                type: 'doughnut',
                data: {
                    labels: ['Stateful Processing', 'IoT Sensor Logging', 'Dynamic Alerting', 'Data Lake Ingestion'],
                    datasets: [{
                        data: [40, 25, 20, 15],
                        backgroundColor: vibrantPalette
                    }]
                },
                options: donutOptions
            });
        }

        const ctxMl = document.getElementById('ecosystemMlChart');
        if (ctxMl) {
            myMlChart = new Chart(ctxMl, {
                type: 'doughnut',
                data: {
                    labels: ['Distributed Training', 'Feature Pipelines', 'Linear Models', 'Ensembles'],
                    datasets: [{
                        data: [35, 30, 20, 15],
                        backgroundColor: vibrantPalette
                    }]
                },
                options: donutOptions
            });
        }

        const ctxGraph = document.getElementById('ecosystemGraphChart');
        if (ctxGraph) {
            myGraphChart = new Chart(ctxGraph, {
                type: 'doughnut',
                data: {
                    labels: ['Network Paths', 'Fraud Rings', 'PageRank', 'Entity Graph Modeling'],
                    datasets: [{
                        data: [35, 25, 20, 20],
                        backgroundColor: vibrantPalette
                    }]
                },
                options: donutOptions
            });
        }

        // (Visual Language and Sandbox tab switcher functions consolidated at the bottom of the file)

        const presets = {
            optimizer: {
                "pyspark-join": "df_large = spark.read.parquet(\"hdfs:///data/large_sales_events\")\ndf_small = spark.read.parquet(\"hdfs:///data/store_details\")\n# The store master lookup table is small (under 15MB), join triggers full shuffle exchange\nresult = df_large.join(df_small, df_large.store_id == df_small.store_id)",
                "rdd-groupby": "rdd = sc.textFile(\"hdfs:///logs/raw_events.log\")\n# Running full global groupByKey inside executors causing extreme in-memory GC churn\ncounts = rdd.map(lambda line: (line.split()[0], 1)).groupByKey().mapValues(len)",
                "uncached-actions": "df = spark.read.json(\"s3a://clicks.json\").filter(\"event_type = 'PURCHASE'\")\n# Running multiple independent actions on un-cached raw datasets\ncnt = df.count()\ndf.write.partitionBy(\"country\").mode(\"overwrite\").parquet(\"/analytics/purchases\")"
            },
            simulator: {
                "oom": "Diagnostic Context: EMR Core Instance node size 16GB. Iterative graph expansion algorithm using GraphX over 800M edges keeps failing with OutOfMemory: GC overhead limit exceeded. Dynamic allocation is set to true.",
                "skew": "Diagnostic Context: Join transaction ledger with customer metadata. Key 'customer_id' contains highly skewed values (anonymous accounts mapped to ID 99999). 1 partition hangs at 99% for 2 hours while all other 199 tasks finish in under 3 seconds.",
                "streaming": "Diagnostic Context: Stateful pipeline reading from Kafka cluster with 24 partitions. SLA is under 1 second latency. Senders spike traffic at 9:00 AM, causing latency to climb to 5 minutes, triggering cluster failure."
            },
            drafter: {
                "tungsten": "Compare Tungsten's Binary Row memory layout with the memory overhead of raw JVM objects. Focus on off-heap storage and Whole-Stage Code Generation.",
                "aqe": "Deep-dive on Adaptive Query Execution. Explain the mechanics of runtime coalescing of shuffle partitions, dynamic join adaptation, and automatic partition skew optimization.",
                "dpp": "Write an architectural guide on Dynamic Partition Pruning (DPP). Illustrate how dimension filters dynamically inject partition pruning into large-scale fact tables."
            }
        };

        function applyOptimizerPreset() {
            const val = document.getElementById('optimizer-preset').value;
            if (val && presets.optimizer[val]) {
                document.getElementById('optimizer-code-input').value = presets.optimizer[val];
            }
        }

        function applySimulatorPreset() {
            const val = document.getElementById('simulator-preset').value;
            if (val && presets.simulator[val]) {
                document.getElementById('simulator-input').value = presets.simulator[val];
            }
        }

        function applyDrafterPreset() {
            const val = document.getElementById('drafter-preset').value;
            if (val && presets.drafter[val]) {
                document.getElementById('drafter-custom').value = presets.drafter[val];
            }
        }

        // Live API Orchestrator Block
        // Local Offline Mock Generator
        function getOfflineMockResponse(type, presetValue, customInput) {
            const mockDb = {
                optimizer: {
                    "pyspark-join": `### Spark Code Optimization: Broadcast Hash Join (Map-side Join)
                    
#### 1. Catalyst Optimizer Analysis
In the unoptimized query plan, joining \`df_large\` and \`df_small\` triggers a **SortMergeJoin (SMJ)** or a **ShuffleHashJoin**. The physical plan injects an \`Exchange hashpartitioning\` node for both datasets. For the large dataset, this results in serializing, partitioning, and transferring gigabytes of event data across the network, leading to heavy I/O overhead.

#### 2. Optimized Code
\`\`\`python
from pyspark.sql.functions import broadcast

# Use broadcast join to load the small lookup table (df_small) in executor memory
result = df_large.join(broadcast(df_small), "store_id")
\`\`\`

#### 3. How the Physical Plan Changes
- **Before**: 
  \`SortMergeJoin\` -> \`Exchange\` -> \`FileScan (Parquet)\`
- **After**: 
  \`BroadcastHashJoin\` -> \`BroadcastExchange\` on \`df_small\`, direct \`FileScan\` on \`df_large\` without any shuffle exchange.
- **Performance Benefit**: Reduces shuffle write/read bytes to zero for the event dataset. Run time drops from minutes to seconds.`,
                    
                    "rdd-groupby": `### Spark Code Optimization: Map-Side Aggregations via reduceByKey

#### 1. Catalyst Optimizer Analysis
The unoptimized code uses \`groupByKey()\`, which forces Spark to transfer all values associated with a key across the network during the shuffle phase. This prevents map-side combining, causing immense memory pressure and GC churn inside executors if a key has millions of records.

#### 2. Optimized Code
\`\`\`python
# Use reduceByKey to combine values locally before shuffling
counts = rdd.map(lambda line: (line.split()[0], 1)).reduceByKey(lambda a, b: a + b)
\`\`\`

#### 3. How the Physical Plan Changes
- **Before**: Spark builds \`ShuffledRDD\` containing collections of elements, leading to OutOfMemory (OOM) errors for skewed keys.
- **After**: Spark injects a map-side combine step. Executors aggregate counts locally before sending partition updates over the wire, shrinking network payload sizes by up to 99%.`,
                    
                    "uncached-actions": `### Spark Code Optimization: Lineage Caching for Multi-Action DAGs

#### 1. Catalyst Optimizer Analysis
The DataFrame \`df\` is evaluated twice: once for \`df.count()\` (Action 1) and once for \`df.write\` (Action 2). Without caching, Spark recompiles the entire execution plan and reads the raw source files from cloud storage (S3) twice, doubling storage I/O cost.

#### 2. Optimized Code
\`\`\`python
# Cache the DataFrame in memory (MEM_AND_DISK_SER by default for DataFrames)
df.cache()

# Action 1: Triggers initial computation and populates the cache
cnt = df.count()

# Action 2: Pulls data directly from memory/disk cache
df.write.partitionBy("country").mode("overwrite").parquet("/analytics/purchases")

# Clean up memory resources
df.unpersist()
\`\`\`

#### 3. How the Physical Plan Changes
- **Before**: Two independent DAGs are submitted, each starting with \`FileScan (JSON)\`.
- **After**: The first DAG computes and writes to \`InMemoryRelation\`. The second DAG uses \`InMemoryTableScan\`, bypassing the file parser and network fetch.`
                },
                simulator: {
                    "oom": `### Incident Diagnosis: OutOfMemory (OOM) / GC Overhead Limit Exceeded

#### 1. Root Cause Analysis
The \`OutOfMemoryError: GC overhead limit exceeded\` indicates that Spark executors are spending more than 98% of their time on garbage collection while recovering less than 2% of the heap. This occurs when large graph structures or massive data frames are stored as raw JVM objects (causing high memory overhead) or when dynamic allocation spawns tasks faster than JVM can collect memory.

#### 2. Recommended Configuration Adjustments
Apply these parameters in \`spark-defaults.conf\`:
\`\`\`properties
# Switch to serialized storage level for GraphX or intermediate RDDs
spark.memory.offHeap.enabled true
spark.memory.offHeap.size 4g

# Adjust G1GC garbage collector settings for low-pause performance
spark.executor.extraJavaOptions -XX:+UseG1GC -XX:InitiatingHeapOccupancyPercent=35 -XX:G1ReservePercent=15

# Tune memory fractions (Storage vs Execution)
spark.memory.fraction 0.6
spark.memory.storageFraction 0.4
\`\`\`

#### 3. Remediation Plan
- Serialize RDD partitions using \`StorageLevel.MEMORY_AND_DISK_SER\`.
- Increase \`spark.executor.memoryOverhead\` to \`2048\` (or 15% of executor memory) to allow for native off-heap storage.`,
                    
                    "skew": `### Incident Diagnosis: Data Skew during SortMergeJoin

#### 1. Root Cause Analysis
Data skew occurs when a single join key (e.g. \`customer_id = 99999\`) has disproportionately more rows than other keys. When Spark partitions the data using \`HashPartitioning\`, all records with key \`99999\` land in the same partition. This single task handles gigabytes of data while other tasks handle kilobytes, causing the stage to hang.

#### 2. Recommended Configuration Adjustments
Enable **Adaptive Query Execution (AQE)** skew optimization:
\`\`\`properties
# Enable AQE (On by default in Spark 3.x)
spark.sql.adaptive.enabled true

# Enable skew join optimization
spark.sql.adaptive.skewJoin.enabled true
spark.sql.adaptive.skewJoin.skewedPartitionFactor 5
spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes 268435456
\`\`\`

#### 3. Code-Level Remediation (Salting)
If AQE cannot optimize the plan, manually salt the join key:
\`\`\`python
import pyspark.sql.functions as F

# Add random salt (0-9) to the large skewed table
df_large = df_large.withColumn("salt", F.concat(F.col("customer_id"), F.lit("_"), F.randint(0, 9)))

# Replicate the small table 10x with salt suffixes
df_small_salted = df_small.withColumn("salt_array", F.array([F.lit(i) for i in range(10)])) \
                           .withColumn("exploded_salt", F.explode("salt_array")) \
                           .withColumn("salt", F.concat(F.col("customer_id"), F.lit("_"), F.col("exploded_salt")))
                           
# Perform join on the salted key
result = df_large.join(df_small_salted, "salt")
\`\`\`\n`,
                    
                    "streaming": `### Incident Diagnosis: Kafka Source Consumer Lag Spike

#### 1. Root Cause Analysis
When Kafka traffic spikes, a stateful streaming engine can ingest partitions faster than it can process window aggregations or write to sinks. Without rate limiting, the micro-batch size grows unchecked, exceeding the executor heap limits, triggering long GC pauses, and causing a cascading performance degradation.

#### 2. Recommended Configuration Adjustments
Configure explicit backpressure and rate limiting parameters:
\`\`\`properties
# Enable Backpressure mechanism
spark.streaming.backpressure.enabled true

# Set max messages per partition per second for Structured Streaming Kafka source
spark.sql.streaming.maxFilesPerTrigger 100
spark.sql.streaming.kafka.maxRatePerPartition 500

# Tune task-scheduler delays
spark.locality.wait 0s
\`\`\`

#### 3. Remediation Plan
- Switch task execution trigger from Processing Time to a micro-batch interval: \`.trigger(processingTime='10 seconds')\`.
- Scale Kafka partitions and executor counts in a 1:1 match to maximize concurrent partition reading.`
                },
                drafter: {
                    "tungsten": `# Project Tungsten: JVM Garbage Collection vs. Off-Heap Execution

### 1. The Bottleneck: JVM Object Overheads
In standard Java applications, storing a simple 4-byte integer inside a heap object incurs massive byte overheads:
- 12-byte object header (Mark Word + Klass Word)
- 4-byte padding
This results in a 400% memory inflation rate. Furthermore, millions of short-lived row objects trigger heavy garbage collection cycles, pausing Spark execution.

### 2. Tungsten Binary Row Representation
Tungsten avoids JVM overhead by storing rows in contiguous, off-heap native memory buffers:
- **Null Bitmap**: Preceding bits indicating nullability of each column.
- **Fixed-Width Fields**: Raw primitive bytes (8 bytes each).
- **Variable-Length Fields**: Offsets and lengths pointing to variable data (e.g. String UTF-8 blocks).

| Section | Size | Contents |
| :--- | :--- | :--- |
| Null Bitmap | 8 bytes | Bit flag representation of column states |
| Column 1 (id) | 8 bytes | Raw 64-bit Long Value |
| Column 2 (name) | 8 bytes | Offset (32-bit) + Length (32-bit) of string |

### 3. Whole-Stage Code Generation (CodeGen)
Rather than calling virtual function methods (Iterator pattern) for each operator (e.g. Filter -> Project -> Aggregate) on every row, Tungsten generates clean Java bytecode at compile time using the Java compiler (\`Janino\`). This flattens the processing loop into a single optimized CPU loop:

\`\`\`scala
// Tungsten generates highly-optimized flat loops like:
while (rows.hasNext()) {
  long val = rows.getLong(0);
  if (val > 100) {
    // Direct operation on off-heap memory
    output.writeLong(val * 2);
  }
}
\`\`\`\n`,
                    
                    "aqe": `# Adaptive Query Execution (AQE): Dynamic Optimization Internals

### 1. The Core Innovation
Before Spark 3.0, the Catalyst Optimizer compiled a static physical plan based on estimated data statistics. If statistics were missing or outdated, Spark chose poor plans (e.g. SortMergeJoin instead of BroadcastJoin). AQE solves this by intercepting the physical plan at **Materialization Points** (between query stages), inspecting partition statistics, and optimizing the plan on-the-fly.

### 2. Three Dimensions of AQE Optimization

#### A. Coalescing Post-Shuffle Partitions
When shuffling, Spark defaults to 200 partitions (\`spark.sql.shuffle.partitions\`). If the output dataset is small, this results in hundreds of "small task" overheads. AQE automatically coalesces adjacent small partitions into single larger tasks.

#### B. Dynamic Join Conversion
If a SortMergeJoin stage finishes and AQE detects that one side of the dataset is smaller than \`spark.sql.autoBroadcastJoinThreshold\` (default 10MB), AQE dynamically converts the execution plan to a **Broadcast Hash Join**, eliminating the shuffle for the next stage.

#### C. Skew Join Remediation
If one partition is significantly larger than the median partition size, AQE splits the skewed partition into multiple sub-partitions, reads them concurrently, and joins them with duplicated chunks of the target table.

### 3. Execution Logic Flowchart
\`\`\`
[Logical Plan] -> [Physical Plan] 
                      |
                [Stage 1 Run] 
                      |
             [Inspect Statistics] -> (Any Skew or Small Partitions?)
                      |
            [Optimize Shuffle Plan] -> [Stage 2 Run]
\`\`\`\n`,
                    
                    "dpp": `# Dynamic Partition Pruning (DPP): Star-Schema Join Acceleration

### 1. Traditional Partition Pruning
Static partition pruning works when the filter condition is applied directly to the partition column:
\`WHERE date_id = '2026-06-04'\`.
However, in star-schema warehousing (Fact table joined with Dimension table), filters are applied to the dimension table:
\`WHERE dim_date.quarter = 'Q2'\`.
Traditionally, Spark had to scan the entire partition layout of the Fact table and filter rows *after* reading.

### 2. DPP Mechanics: The Inner Loop
DPP injects the dimension filter directly into the Fact table scan at runtime:

1. Spark evaluates the filter on the Dimension table: \`dim_date.quarter = 'Q2'\`.
2. It builds a **Subquery Broadcast** containing the matching keys (\`date_id\`s).
3. It injects this list of keys directly as a dynamic filter inside the Fact table file scanner.
4. The Fact table scanner reads ONLY the matching partitions, skipping directories that do not contain matching records.

\`\`\`
[Fact Table]                      [Dim Table]
 (Partitioned by date_id)          (Filter: quarter = 'Q2')
      |                                  |
      |<-- [Broadcast Keys] <------------| (Subquery)
      |
[Reads matching partitions ONLY]
\`\`\`

### 3. Catalyst Plan Signature
In the physical query plan, DPP is represented as a \`DynamicPartitionPruning\` node:
\`FileScan parquet default.fact_sales [partitionFilters: [date_id#123 IN dynamicpruning#456]]\`\n`
                }
            };

            let responseText = "";
            if (presetValue && mockDb[type] && mockDb[type][presetValue]) {
                responseText = mockDb[type][presetValue];
            } else {
                const queryLower = (customInput || "").toLowerCase();
                if (queryLower.includes("memory") || queryLower.includes("gc") || queryLower.includes("oom") || queryLower.includes("heap")) {
                    responseText = `### Spark Memory Management Analysis

We have analyzed your configuration containing references to memory bottlenecks.

#### 1. Core Architecture Checks
- Ensure \`spark.memory.fraction\` is set appropriately. The default of \`0.6\` allocates 60% of the executor JVM heap to Spark execution and storage memory, leaving 40% for user metadata and internal tracking.
- If GC pause times exceed 10% of total run time, enable G1GC using \`spark.executor.extraJavaOptions = -XX:+UseG1GC\`.

#### 2. Local Recommendations
- Switch to serialized structures like Spark DataFrames instead of raw Java RDDs, to reduce the heap overhead.
- Ensure that memory is freed up by running \`unpersist()\` after you are done with cached DataFrames.`;
                } else if (queryLower.includes("join") || queryLower.includes("shuffle") || queryLower.includes("broadcast") || queryLower.includes("merge")) {
                    responseText = `### Spark Join & Shuffle Optimization

We have analyzed your join query constraints.

#### 1. Core Architecture Checks
- Check if your smaller dataset is under 10MB. If so, Spark's Catalyst Optimizer should automatically convert the join to a **Broadcast Hash Join** using \`broadcast(df_small)\`.
- Shuffling can be tuned by modifying \`spark.sql.shuffle.partitions\` to prevent high numbers of small files or executor bottlenecks.

#### 2. Local Recommendations
- Salt highly skewed keys by appending a random integer suffix to distribute the workload evenly across executors.
- Ensure that partition filters are pushed down to the storage layer before executing the join.`;
                } else {
                    responseText = `### Spark Engine Architecture Insights
Thank you for your custom query. Since your workspace is running locally, we have executed an offline query evaluation.

#### 1. Configuration Review
Your input highlights the need for dynamic optimization of distributed executors. We recommend verifying:
- \`spark.sql.shuffle.partitions\` (set to \`2 * total_cores\` as a baseline)
- \`spark.serializer\` (set to \`org.apache.spark.serializer.KryoSerializer\`)

#### 2. Performance Checkpoints
- Avoid operations like \`count()\` in raw pipelines unless strictly necessary, as they block stage materialization.
- Always filter partitions as early as possible in your DAG to allow predicate pushdowns.`;
                }
            }

            return responseText + "\n\n---\n*⚡ Evaluated via Local Workspace Offline Engine (API key not configured).*";
        }

        // Live API Orchestrator Block
        async function fetchGeminiIntelligence(systemPrompt, userQuery, statusText, type, presetValue) {
            const outContainer = document.getElementById('sandbox-output-container');
            const loader = document.getElementById('sandbox-loading');
            const resultBox = document.getElementById('sandbox-result');
            const statusLabel = document.getElementById('sandbox-loading-status');

            outContainer.classList.remove('hidden');
            loader.classList.remove('hidden');
            resultBox.classList.add('hidden');
            resultBox.innerHTML = "";
            statusLabel.textContent = statusText;

            const apiKey = localStorage.getItem('gemini_api_key') || window.GEMINI_API_KEY || "";
            if (!apiKey) {
                await new Promise(resolve => setTimeout(resolve, 800));
                loader.classList.add('hidden');
                
                const customInput = type === 'optimizer' ? document.getElementById('optimizer-code-input').value :
                                    type === 'simulator' ? document.getElementById('simulator-input').value :
                                    document.getElementById('drafter-custom').value;
                const generatedText = getOfflineMockResponse(type, presetValue, customInput);
                rawResponseText = generatedText;
                resultBox.innerHTML = formatMarkdown(generatedText);
                resultBox.classList.remove('hidden');
                if (window.MathJax) {
                    MathJax.typesetPromise([resultBox]);
                }
                return;
            }

            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-preview:generateContent?key=${apiKey}`;

            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] }
            };

            let delay = 1000;
            let success = false;
            let responseData = null;

            for (let attempt = 0; attempt < 5; attempt++) {
                try {
                    const res = await fetch(endpoint, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });
                    if (res.ok) {
                        responseData = await res.json();
                        success = true;
                        break;
                    }
                } catch (err) {
                    // Fail-safe retry logic
                }
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            }

            loader.classList.add('hidden');
            if (success && responseData) {
                const generatedText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis generated by Spark Architect mind.";
                rawResponseText = generatedText;
                resultBox.innerHTML = formatMarkdown(generatedText);
                resultBox.classList.remove('hidden');
                
                if (window.MathJax) {
                    MathJax.typesetPromise([resultBox]);
                }
            } else {
                const customInput = type === 'optimizer' ? document.getElementById('optimizer-code-input').value :
                                    type === 'simulator' ? document.getElementById('simulator-input').value :
                                    document.getElementById('drafter-custom').value;
                const generatedText = getOfflineMockResponse(type, presetValue, customInput) + "\n\n*⚠️ Warning: Cloud intelligence API failed. Serviced via offline backup.*";
                rawResponseText = generatedText;
                resultBox.innerHTML = formatMarkdown(generatedText);
                resultBox.classList.remove('hidden');
                if (window.MathJax) {
                    MathJax.typesetPromise([resultBox]);
                }
            }
        }

        function formatMarkdown(text) {
            if (!text) return "";
            let html = text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

            html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function(match, lang, code) {
                return formatCodeBlock(code, lang);
            });

            html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

            html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

            html = html.replace(/^### (.*$)/gim, '<h4 class="markdown-h4">$1</h4>');
            html = html.replace(/^## (.*$)/gim, '<h3 class="markdown-h3">$1</h3>');
            html = html.replace(/^# (.*$)/gim, '<h2 class="markdown-h2">$1</h2>');

            const lines = html.split('\n');
            let inList = false;
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if (line.startsWith('* ') || line.startsWith('- ')) {
                    if (!inList) {
                        lines[i] = '<ul class="markdown-ul"><li>' + line.substring(2) + '</li>';
                        inList = true;
                    } else {
                        lines[i] = '<li>' + line.substring(2) + '</li>';
                    }
                } else {
                    if (inList) {
                        lines[i - 1] = lines[i - 1] + '</ul>';
                        inList = false;
                    }
                }
            }
            if (inList) {
                lines[lines.length - 1] = lines[lines.length - 1] + '</ul>';
            }
            html = lines.join('\n');

            html = html.replace(/\n\n/g, '<br><br>');
            return html;
        }

        function runCodeOptimization() {
            const code = document.getElementById('optimizer-code-input').value;
            if (!code.trim()) {
                alert("Please select or enter Spark code transformations.");
                return;
            }
            const presetValue = document.getElementById('optimizer-preset').value;
            const systemPrompt = "You are the Lead Core Apache Spark Architect. Analyze this Spark code for architectural bottlenecks like wide shuffles, missing broadcast joins, or uncached RDD lineage. Provide optimized replacement code and explain how the physical plan changes step-by-step. Keep explanations rigorous and technical.";
            const userQuery = `Analyze and optimize this code:\n\n${code}`;
            fetchGeminiIntelligence(systemPrompt, userQuery, "Reconstructing physical execution plans & analyzing Catalyst query trees...", "optimizer", presetValue);
        }

        function runScenarioSimulation() {
            const context = document.getElementById('simulator-input').value;
            if (!context.trim()) {
                alert("Please select or describe a production scenario.");
                return;
            }
            const presetValue = document.getElementById('simulator-preset').value;
            const systemPrompt = "You are a Senior Infrastructure and Platform Reliability Engineer for large-scale Spark clusters. Diagnose the given memory or runtime issue. Explain the JVM memory overhead patterns, state store concerns, and supply the precise configuration parameters (e.g., spark.sql.shuffle.partitions, spark.memory.offHeap.size) to apply in spark-defaults.conf.";
            const userQuery = `Diagnose and fix this production issue:\n\n${context}`;
            fetchGeminiIntelligence(systemPrompt, userQuery, "Evaluating heap storage distributions & planning state reallocations...", "simulator", presetValue);
        }

        function runContentDrafting() {
            const topic = document.getElementById('drafter-custom').value;
            if (!topic.trim()) {
                alert("Please select or define an educational topic.");
                return;
            }
            const presetValue = document.getElementById('drafter-preset').value;
            const systemPrompt = "You are a Distinguished Tech Lead writing a definitive textbook on Apache Spark. Write a highly detailed, technical textbook chapter or blog post explaining this concept. Include clear technical breakdowns, comparisons with raw JVM layouts, and code examples in both PySpark and Scala. Use markdown headers, tables, and clear technical formatting.";
            const userQuery = `Write a deep-dive educational chapter on:\n\n${topic}`;
            fetchGeminiIntelligence(systemPrompt, userQuery, "Generating technical chapter drafts & verifying code syntax structures...", "drafter", presetValue);
        }

        function copyOutputContent() {
            if (!rawResponseText) {
                alert("No output generated yet.");
                return;
            }
            navigator.clipboard.writeText(rawResponseText).then(() => {
                alert("Content copied to clipboard!");
            });
        }

        // Searchable Lexicon filter code logic
        let currentLexiconCategory = 'all';

        function filterLexiconCategory(category) {
            currentLexiconCategory = category;
            // Update spark-filter-btn active state
            document.querySelectorAll('.spark-filter-btn').forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.getElementById(`cat-btn-${category}`);
            if (activeBtn) activeBtn.classList.add('active');
            filterLexicon();
        }

        function filterLexicon() {
            const query = (document.getElementById('lexicon-search')?.value || '').toLowerCase().trim();
            const cards = document.querySelectorAll('#lexicon-grid .lexicon-card');
            cards.forEach(card => {
                const cat = card.dataset.category || '';
                const keywords = (card.dataset.keywords || '').toLowerCase();
                // Support both old h4/p selectors and new spark-lexicon-term/def selectors
                const titleEl = card.querySelector('.spark-lexicon-term') || card.querySelector('h4');
                const descEl = card.querySelector('.spark-lexicon-def') || card.querySelector('p');
                const title = (titleEl?.textContent || '').toLowerCase();
                const desc = (descEl?.textContent || '').toLowerCase();

                const matchesCategory = (currentLexiconCategory === 'all' || cat === currentLexiconCategory);
                const matchesQuery = (!query || title.includes(query) || desc.includes(query) || keywords.includes(query));

                card.style.display = (matchesCategory && matchesQuery) ? '' : 'none';
            });
        }

        /* --- Interactive Spark Visual Simulator Core Mechanics --- */
        const flowDetails = {
            narrow: {
                title: "Narrow Dependency (Map / Filter)",
                shuffled: "0 Bytes",
                tasks: "2 parallel tasks",
                explain: "<p><strong>Execution Mechanics:</strong> Map and Filter transformations represent pipelining in Spark. Data partitions are modified in isolation within the same core execution thread. The physical plan joins operations together into a single <strong>Stage</strong>.</p><div class=\"spark-log-insight\"><span style=\"font-weight:700; color:#ffa600;\">No Spill Over:</span> Because the boundaries are isolated, JVM Garbage collection spikes and memory spills do not occur here. No network resources are touched.</div>"
            },
            "wide-shuffle": {
                title: "Sort-Merge Shuffle Join (Wide Boundary)",
                shuffled: "2.4 GB across network",
                tasks: "200 default partitions",
                explain: "<p><strong>Execution Mechanics:</strong> To execute a join on keys not already partition-aligned, Spark triggers a physical <strong>Shuffle Exchange</strong> barrier. Rows are hashed, written to shuffle file directories on local storage, and then sorted and fetched across worker nodes.</p><div class=\"spark-log-insight\" style=\"background:rgba(239, 86, 117, 0.08); border-color:rgba(239, 86, 117, 0.25); color:#ef5675;\"><span style=\"font-weight:700; color:#ef5675;\">Critical Spill Warning:</span> A mismatch in partition sizing during a Sort-Merge Join triggers disk spill, forcing Tungsten to fall back onto slower virtual storage paths.</div>"
            },
            broadcast: {
                title: "Broadcast Hash Join (Map-Side Join)",
                shuffled: "14.2 MB (Driver-to-worker)",
                tasks: "Parallel executor maps",
                explain: "<p><strong>Execution Mechanics:</strong> If one side of a join dataset is under 10MB (configured via <code>spark.sql.autoBroadcastJoinThreshold</code>), the Driver fetches it and serializes a copy to all Executors. The workers load the metadata directly into memory, converting a Sort-Merge into a rapid map-side hash join.</p><div class=\"spark-log-insight\" style=\"background:rgba(34, 197, 94, 0.08); border-color:rgba(34, 197, 94, 0.25); color:#22c55e;\"><span style=\"font-weight:700; color:#22c55e;\">Zero Wide Shuffle:</span> Network transfers are completely avoided across executor stages, cutting execution times significantly.</div>"
            },
            aggregation: {
                title: "Aggregation GroupBy: reduceByKey vs groupByKey",
                shuffled: "Reduced: 250MB | groupBy: 2.1GB",
                tasks: "Stage Combiners + Reducers",
                explain: "<p><strong>Execution Mechanics:</strong> While <code>groupByKey</code> sends every matching value raw across the network before execution, <code>reduceByKey</code> implements local key-value aggregation combiners inside executors before initiating network shuffles.</p><div class=\"spark-log-insight\" style=\"background:rgba(255, 179, 71, 0.08); border-color:rgba(255, 179, 71, 0.25); color:#FFB347;\"><span style=\"font-weight:700; color:#FFB347;\">Combiner Impact:</span> Pre-reducing locally cuts network transfers by up to 90%, preventing major network and memory congestion on active nodes.</div>"
            }
        };

        function changeSimulatorFlow() {
            const flowType = document.getElementById('simulator-flow-type').value;
            const details = flowDetails[flowType];
            
            document.getElementById('sim-explain-title').textContent = details.title;
            document.getElementById('sim-explain-text').innerHTML = details.explain;
            document.getElementById('sim-stat-shuffled').textContent = details.shuffled;
            document.getElementById('sim-stat-tasks').textContent = details.tasks;
            
            // Update stages stat
            const stagesEl = document.getElementById('sim-stat-stages');
            if (stagesEl) {
                if (flowType === 'narrow') stagesEl.textContent = '0 Stages';
                else if (flowType === 'wide-shuffle') stagesEl.textContent = '2 Stages';
                else if (flowType === 'broadcast') stagesEl.textContent = '1 Stage';
                else stagesEl.textContent = '2 Stages';
            }
            
            // Highlight relevant interface configurations based on selected flow type
            const label1 = document.getElementById('sim-out-1-desc');
            const label2 = document.getElementById('sim-out-2-desc');
            if (flowType === 'narrow') {
                label1.textContent = "Ready (Map-Side)";
                label2.textContent = "Ready (Map-Side)";
                label1.style.color = '#22c55e';
                label2.style.color = '#22c55e';
            } else if (flowType === 'wide-shuffle') {
                label1.textContent = "Merged & Sorted";
                label2.textContent = "Merged & Sorted";
                label1.style.color = '#FFB347';
                label2.style.color = '#FFB347';
            } else {
                label1.textContent = "Complete";
                label2.textContent = "Complete";
                label1.style.color = '#22c55e';
                label2.style.color = '#22c55e';
            }
        }

        function triggerSimulatorAnimation() {
            const container = document.getElementById('sim-particles-container');
            container.innerHTML = ""; // Clear existing animations
            
            const flowType = document.getElementById('simulator-flow-type').value;
            const inputElements = [
                document.getElementById('sim-input-1'),
                document.getElementById('sim-input-2'),
                document.getElementById('sim-input-3')
            ];
            const executorElements = [
                document.getElementById('sim-exec-1'),
                document.getElementById('sim-exec-2')
            ];
            const outputElements = [
                document.getElementById('sim-output-1'),
                document.getElementById('sim-output-2')
            ];

            const colors = ['#ffa600', '#bc5090', '#ef5675'];

            // Temporary set executor status indicators
            const exec1Status = document.getElementById('sim-exec-1-status');
            const exec2Status = document.getElementById('sim-exec-2-status');
            const exec1Node = document.getElementById('sim-exec-1');
            const exec2Node = document.getElementById('sim-exec-2');
            exec1Status.textContent = "Processing task...";
            exec1Status.style.color = '#FFB347';
            exec2Status.textContent = "Processing task...";
            exec2Status.style.color = '#FFB347';
            exec1Node.classList.add('active');
            exec2Node.classList.add('active');
            
            // Mark inputs as processing
            inputElements.forEach(el => el.classList.add('processing'));

            // Helper to get coordinates
            function getRelativeCoords(fromEl, toEl) {
                const fromRect = fromEl.getBoundingClientRect();
                const toRect = toEl.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                
                return {
                    x1: fromRect.left - containerRect.left + fromRect.width / 2,
                    y1: fromRect.top - containerRect.top + fromRect.height / 2,
                    x2: toRect.left - containerRect.left + toRect.width / 2,
                    y2: toRect.top - containerRect.top + toRect.height / 2
                };
            }

            // Launching step 1: inputs -> executors
            inputElements.forEach((input, i) => {
                const execTarget = executorElements[i % executorElements.length];
                const coords = getRelativeCoords(input, execTarget);
                
                // Create particle
                const particle = document.createElement('div');
                particle.className = "spark-particle";
                particle.style.left = `${coords.x1}px`;
                particle.style.top = `${coords.y1}px`;
                particle.style.backgroundColor = colors[i];
                particle.style.setProperty('--tx', `${coords.x2 - coords.x1}px`);
                particle.style.setProperty('--ty', `${coords.y2 - coords.y1}px`);
                particle.style.animation = `flowParticle 1s ease-in-out forwards`;
                
                container.appendChild(particle);
            });

            // Launching step 2: executors -> outputs (simulating shuffles and direct writes)
            setTimeout(() => {
                if (flowType === 'wide-shuffle') {
                    // Wide dependency shuffle: Executors route to output partitions crosswise
                    executorElements.forEach((exec, i) => {
                        outputElements.forEach((output, j) => {
                            const coords = getRelativeCoords(exec, output);
                            const particle = document.createElement('div');
                            particle.className = "spark-particle";
                            particle.style.left = `${coords.x1}px`;
                            particle.style.top = `${coords.y1}px`;
                            particle.style.backgroundColor = colors[j % colors.length];
                            particle.style.setProperty('--tx', `${coords.x2 - coords.x1}px`);
                            particle.style.setProperty('--ty', `${coords.y2 - coords.y1}px`);
                            particle.style.animation = `flowParticle 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards`;
                            container.appendChild(particle);
                        });
                    });
                } else if (flowType === 'broadcast') {
                    // Broadcast map join: Direct mapped paths + broadcast animation lines
                    executorElements.forEach((exec, i) => {
                        const output = outputElements[i];
                        const coords = getRelativeCoords(exec, output);
                        const particle = document.createElement('div');
                        particle.className = "spark-particle";
                        particle.style.left = `${coords.x1}px`;
                        particle.style.top = `${coords.y1}px`;
                        particle.style.backgroundColor = '#2f4b7c';
                        particle.style.setProperty('--tx', `${coords.x2 - coords.x1}px`);
                        particle.style.setProperty('--ty', `${coords.y2 - coords.y1}px`);
                        particle.style.animation = `flowParticle 0.8s ease-out forwards`;
                        container.appendChild(particle);
                    });
                } else {
                    // Narrow execution maps direct straight lines: A0->E0->Out0, A1->E1->Out1
                    executorElements.forEach((exec, i) => {
                        const output = outputElements[i % outputElements.length];
                        const coords = getRelativeCoords(exec, output);
                        const particle = document.createElement('div');
                        particle.className = "spark-particle";
                        particle.style.left = `${coords.x1}px`;
                        particle.style.top = `${coords.y1}px`;
                        particle.style.backgroundColor = colors[i];
                        particle.style.setProperty('--tx', `${coords.x2 - coords.x1}px`);
                        particle.style.setProperty('--ty', `${coords.y2 - coords.y1}px`);
                        particle.style.animation = `flowParticle 0.8s ease-in-out forwards`;
                        container.appendChild(particle);
                    });
                }
            }, 1000);

            // Clean up status indications
            setTimeout(() => {
                exec1Status.textContent = "✓ Finished";
                exec1Status.style.color = '#22c55e';
                exec2Status.textContent = "✓ Finished";
                exec2Status.style.color = '#22c55e';
                exec1Node.classList.remove('active');
                exec2Node.classList.remove('active');
                inputElements.forEach(el => el.classList.remove('processing'));
                outputElements.forEach(el => el.classList.add('done'));
                setTimeout(() => outputElements.forEach(el => el.classList.remove('done')), 2000);
            }, 2200);
        }

        /* --- Interactive JVM Heap Memory Allocator Logic --- */
        function updateMemoryMapper() {
            const heapInput = parseFloat(document.getElementById('mem-heap-size').value);
            const fractionInput = parseFloat(document.getElementById('mem-fraction').value) / 100;
            const storageInput = parseFloat(document.getElementById('mem-storage').value) / 100;

            // Render slider textual label changes
            document.getElementById('lbl-heap-size').textContent = heapInput;
            document.getElementById('lbl-fraction').textContent = fractionInput.toFixed(2);
            document.getElementById('lbl-storage').textContent = storageInput.toFixed(2);

            // Mathematics calculation for spark JVM structure
            const totalHeapMB = heapInput * 1024;
            const reservedMB = 300;
            const usableMB = totalHeapMB - reservedMB;
            
            const unifiedMB = usableMB * fractionInput;
            const executionMB = unifiedMB * (1 - storageInput);
            const storageMB = unifiedMB * storageInput;
            const userMB = usableMB * (1 - fractionInput);

            // Convert to percentages relative to total heap for chart scaling
            const reservedPct = (reservedMB / totalHeapMB) * 100;
            const executionPct = (executionMB / totalHeapMB) * 100;
            const storagePct = (storageMB / totalHeapMB) * 100;
            const userPct = (userMB / totalHeapMB) * 100;

            // Calculate cumulative limits for conic-gradient
            const p1 = reservedPct;
            const p2 = p1 + executionPct;
            const p3 = p2 + storagePct;

            // Render interactive pie/donut chart
            const chartEl = document.getElementById('memory-pie-chart');
            if (chartEl) {
                chartEl.style.background = `conic-gradient(#ef4444 0% ${p1.toFixed(2)}%, #7c3aed ${p1.toFixed(2)}% ${p2.toFixed(2)}%, #d97706 ${p2.toFixed(2)}% ${p3.toFixed(2)}%, #0d9488 ${p3.toFixed(2)}% 100%)`;
            }
            
            // Update Center heap label
            const labelCenterEl = document.getElementById('lbl-total-heap-center');
            if (labelCenterEl) {
                labelCenterEl.textContent = `${heapInput} GB`;
            }

            // Render value labels
            document.getElementById('lbl-val-reserved').textContent = "300 MB";
            document.getElementById('lbl-val-execution').textContent = formatSpace(executionMB);
            document.getElementById('lbl-val-storage').textContent = formatSpace(storageMB);
            document.getElementById('lbl-val-user').textContent = formatSpace(userMB);
        }

        function formatSpace(valueMB) {
            if (valueMB >= 1024) {
                return `${(valueMB / 1024).toFixed(2)} GB`;
            }
            return `${Math.round(valueMB)} MB`;
        }

        // (Lexicon and category filter functions defined above at line ~3330)

        // ---- Language Tab Switcher ----
        function switchLanguageTab(lang) {
            const panels = ['pyspark', 'scala', 'sql', 'java'];
            panels.forEach(l => {
                const panel = document.getElementById(`lang-panel-${l}`);
                const btn = document.getElementById(`lang-btn-${l}`);
                if (panel) panel.classList.toggle('hidden', l !== lang);
                if (btn) {
                    btn.style.borderBottomColor = l === lang ? '#FF6B35' : 'transparent';
                    btn.style.color = l === lang ? '#FF6B35' : 'var(--text-secondary)';
                }
            });
        }

        // ---- Sandbox Tab Switcher ----
        function switchSandboxTab(tab) {
            const tabs = ['optimizer', 'simulator', 'drafter'];
            tabs.forEach(t => {
                const panel = document.getElementById(`panel-${t}`);
                const btn = document.getElementById(`tab-btn-${t}`);
                if (panel) panel.classList.toggle('hidden', t !== tab);
                if (btn) {
                    btn.classList.toggle('active', t === tab);
                }
            });
        }

        // Start default structures on page launch
        changeSimulatorFlow();
        updateMemoryMapper();

        // Start the application!
        init();

        // Expose handlers globally so inline HTML handlers can find them
        window.switchSandboxTab = switchSandboxTab;
        window.switchLanguageTab = switchLanguageTab;
        window.applyOptimizerPreset = applyOptimizerPreset;
        window.applySimulatorPreset = applySimulatorPreset;
        window.applyDrafterPreset = applyDrafterPreset;
        window.runCodeOptimization = runCodeOptimization;
        window.runScenarioSimulation = runScenarioSimulation;
        window.runContentDrafting = runContentDrafting;
        window.copyOutputContent = copyOutputContent;
        window.changeSimulatorFlow = changeSimulatorFlow;
        window.triggerSimulatorAnimation = triggerSimulatorAnimation;
        window.updateMemoryMapper = updateMemoryMapper;
        window.filterLexiconCategory = filterLexiconCategory;
        window.filterLexicon = filterLexicon;
});
    