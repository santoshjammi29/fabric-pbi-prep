// Application Core Logic

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  const state = {
    currentView: 'view-dashboard',
    theme: 'dark', // 'dark' or 'light'
    markStatusEnabled: true,
    progress: {}, // maps questionId -> status ('unseen', 'reviewing', 'mastered')
    questions: (() => {
      const diffWeights = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3 };
      const qList = window.QUESTIONS_DB || [];
      return qList.sort((a, b) => {
        const weightA = diffWeights[a.difficulty] || 3;
        const weightB = diffWeights[b.difficulty] || 3;
        return weightA - weightB;
      });
  })(),
    
    // Active filters
    activeExplainerCategory: 'ALL',
    activePracticeCategory: 'ALL',
    activeDifficulty: 'ALL',
    
    // Concepts Active Filters
    activeConceptsCategory: 'ALL',
    activeConceptsDifficulty: 'ALL',
    
    // Cheat Sheet Active Filters
    activeCheatsheetLang: 'python',
    activeCheatsheetLevel: 'all',
    activeCheatsheetQuery: '',
    
    // Personalised Active Filters
    activePersonalisedDomain: 'ALL',
    activePersonalisedQuery: '',
    
    // Prep Hub & Unified Search State
    activePrepHubSubTab: 'view-personalised',
    unifiedSearchPage: 1,
    activeUnifiedDb: 'ALL',
    activeUnifiedCategory: 'ALL',
    
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
    
    // Mark Status Toggle
    statusToggleBtn: document.getElementById('btn-status-toggle') || null,
    statusToggleLabel: document.querySelectorAll('.theme-toggle-container .theme-toggle-label')[1] || null,
    
    // Dashboard Stats DOM Elements
    stats: {
      'FABRIC': {
        mastered: document.getElementById('count-fabric-mastered'),
        review: document.getElementById('count-fabric-review'),
        unseen: document.getElementById('count-fabric-unseen'),
        chart: document.getElementById('chart-fabric-progress'),
        percent: document.getElementById('label-fabric-percent'),
        badge: document.getElementById('badge-fabric')
      },
      'POWER BI': {
        mastered: document.getElementById('count-pbi-mastered'),
        review: document.getElementById('count-pbi-review'),
        unseen: document.getElementById('count-pbi-unseen'),
        chart: document.getElementById('chart-pbi-progress'),
        percent: document.getElementById('label-pbi-percent'),
        badge: document.getElementById('badge-pbi')
      },
      'ADF': {
        mastered: document.getElementById('count-adf-mastered'),
        review: document.getElementById('count-adf-review'),
        unseen: document.getElementById('count-adf-unseen'),
        chart: document.getElementById('chart-adf-progress'),
        percent: document.getElementById('label-adf-percent'),
        badge: document.getElementById('badge-adf')
      },
      'SQL SERVER': {
        mastered: document.getElementById('count-sql-mastered'),
        review: document.getElementById('count-sql-review'),
        unseen: document.getElementById('count-sql-unseen'),
        chart: document.getElementById('chart-sql-progress'),
        percent: document.getElementById('label-sql-percent'),
        badge: document.getElementById('badge-sql')
      },
      'DATALAKE ARCHITECTURE': {
        mastered: document.getElementById('count-datalake-mastered'),
        review: document.getElementById('count-datalake-review'),
        unseen: document.getElementById('count-datalake-unseen'),
        chart: document.getElementById('chart-datalake-progress'),
        percent: document.getElementById('label-datalake-percent'),
        badge: document.getElementById('badge-datalake')
      },
      'SPARK & DATABRICKS': {
        mastered: document.getElementById('count-spark-mastered'),
        review: document.getElementById('count-spark-review'),
        unseen: document.getElementById('count-spark-unseen'),
        chart: document.getElementById('chart-spark-progress'),
        percent: document.getElementById('label-spark-percent'),
        badge: document.getElementById('badge-spark')
      }
    },
    
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
    practiceStatusSelector: document.getElementById('practice-status-selector'),
    practiceStatusBtns: document.querySelectorAll('#practice-status-selector .status-btn'),
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
    dialogStatusBtns: document.querySelectorAll('#details-dialog .status-btn'),
    
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
      topicsScrollbar: document.getElementById('personalised-topics-scrollbar'),
      search: document.getElementById('personalised-search'),
      container: document.getElementById('personalised-container'),
      matchCount: document.getElementById('personalised-match-count')
    },
    
    // Unified Prep Hub DOM cache
    prephub: {
      subnav: document.getElementById('prep-hub-subnav'),
      unifiedSearchInput: document.getElementById('unified-search-input'),
      unifiedDbScrollbar: document.getElementById('unified-db-scrollbar'),
      unifiedCategoryScrollbar: document.getElementById('unified-category-scrollbar'),
      unifiedSearchContainer: document.getElementById('unified-search-container'),
      unifiedMatchCount: document.getElementById('unified-match-count'),
      btnUnifiedLoadMore: document.getElementById('btn-unified-load-more'),
      unifiedLoadMoreContainer: document.getElementById('unified-load-more-container')
    }
  };

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
    'Governance & Quality': 'Governance & Quality'
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
    'Governance & Quality': 'badge-dl'
  };

  // --- INITIALIZATION & RECOVERY ---
  
  function init() {
    loadProgress();
    loadTheme();
    loadMarkStatusToggle();
    setupEventListeners();
    updateDashboardStats();
    renderExplainer();
    renderNicheSelection();
    initGeneralDe();
    initConcepts();
    initCheatsheet();
    initPersonalised();
    updateUnifiedSearchCounts();
    
    // Check scroll position to show scroll to top button
    const mainContent = document.querySelector('.main-content');
    mainContent.addEventListener('scroll', () => {
      if (mainContent.scrollTop > 300) {
        DOM.btnScrollToTop.classList.remove('hidden');
      } else {
        DOM.btnScrollToTop.classList.add('hidden');
      }
    });

    // Set initial view from URL hash, fallback to localStorage, or default to dashboard
    let initialView = 'view-dashboard';
    const hash = window.location.hash;
    if (hash && document.getElementById(hash.substring(1))) {
      initialView = hash.substring(1);
    } else {
      const savedView = localStorage.getItem('interview_prep_active_view');
      if (savedView && document.getElementById(savedView)) {
        initialView = savedView;
      }
    }
    switchView(initialView);

    // Listen to hashchange events for browser back/forward navigation
    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.substring(1);
      if (newHash && document.getElementById(newHash) && state.currentView !== newHash) {
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
  }

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
    updateDashboardStats();
    
    // Sync UI elements if visible
    const explainerCardIndicator = document.querySelector(`.concept-card[data-id="${questionId}"] .status-indicator`);
    if (explainerCardIndicator) {
      explainerCardIndicator.className = `status-indicator status-${newStatus}${newStatus === 'unseen' ? ' hidden' : ''}`;
      explainerCardIndicator.textContent = newStatus;
    }
  }

  // --- THEME & UTILITIES ---
  
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
  }

  function loadMarkStatusToggle() {
    const savedToggle = localStorage.getItem('interview_prep_mark_status_enabled');
    if (savedToggle !== null) {
      state.markStatusEnabled = savedToggle === 'true';
    }
    applyMarkStatusToggle();
  }

  function applyMarkStatusToggle() {
    const root = document.documentElement;
    if (state.markStatusEnabled) {
      if (DOM.statusToggleBtn) {
        DOM.statusToggleBtn.classList.add('active');
        DOM.statusToggleBtn.textContent = '✓';
      }
      if (DOM.statusToggleLabel) {
        DOM.statusToggleLabel.textContent = 'Mark Status';
      }
      root.classList.remove('mark-status-disabled');
      DOM.practiceStatusSelector.classList.remove('hidden');
      document.querySelectorAll('.dialog-status-selector').forEach(el => el.classList.remove('hidden'));
    } else {
      if (DOM.statusToggleBtn) {
        DOM.statusToggleBtn.classList.remove('active');
        DOM.statusToggleBtn.textContent = '✗';
      }
      if (DOM.statusToggleLabel) {
        DOM.statusToggleLabel.textContent = 'Mark Status';
      }
      root.classList.add('mark-status-disabled');
      DOM.practiceStatusSelector.classList.add('hidden');
      document.querySelectorAll('.dialog-status-selector').forEach(el => el.classList.add('hidden'));
    }
    localStorage.setItem('interview_prep_mark_status_enabled', state.markStatusEnabled);
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

    // Toggle visibility of subview containers
    const subviews = document.querySelectorAll('.prep-hub-subview');
    subviews.forEach(subview => {
      if (subview.id === subTabId) {
        subview.classList.remove('hidden');
        subview.removeAttribute('hidden');
      } else {
        subview.classList.add('hidden');
        subview.setAttribute('hidden', 'true');
      }
    });

    // Re-render launcher or explainer to sync numbers and selections
    if (subTabId === 'view-explainer') {
      renderExplainer();
    } else if (subTabId === 'view-practice') {
      renderNicheSelection();
    } else if (subTabId === 'view-personalised') {
      renderPersonalised();
    } else if (subTabId === 'view-unified-search') {
      renderUnifiedSearch();
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
  }

  function switchView(targetViewId) {
    let actualTargetViewId = targetViewId;
    let targetSubTabId = null;

    const mergedViews = ['view-personalised', 'view-general-de', 'view-practice', 'view-explainer'];
    if (mergedViews.includes(targetViewId)) {
      targetSubTabId = targetViewId;
      actualTargetViewId = 'view-prep-hub';
    }

    const sparkMergedViews = ['view-spark', 'view-pyspark'];
    if (sparkMergedViews.includes(targetViewId) || targetViewId === 'view-spark-hub') {
      targetSubTabId = targetViewId === 'view-spark-hub' ? null : targetViewId;
      actualTargetViewId = 'view-spark-hub';
    }

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
    if (actualTargetViewId === 'view-dashboard') {
      updateDashboardStats();
    } else if (actualTargetViewId === 'view-concepts') {
      renderConcepts();
    } else if (actualTargetViewId === 'view-cheatsheet') {
      renderCheatsheet();
    } else if (actualTargetViewId === 'view-prep-hub') {
      if (!targetSubTabId) {
        targetSubTabId = localStorage.getItem('interview_prep_active_subtab') || 'view-personalised';
      }
      switchPrepHubSubTab(targetSubTabId);
    } else if (actualTargetViewId === 'view-spark-hub') {
      if (!targetSubTabId || targetSubTabId === 'view-spark-hub') {
        targetSubTabId = localStorage.getItem('interview_prep_active_spark_subtab') || 'view-spark';
      }
      switchSparkHubSubTab(targetSubTabId);
    }
    
    // Scroll back to top on view switch
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
    window.scrollTo({ top: 0 });
  }

  // --- STATS & SVG COMPUTATION ---
  
  function updateDashboardStats() {
    const categories = Object.keys(DOM.stats);
    
    categories.forEach(cat => {
      const catQuestions = state.questions.filter(q => q.category === cat);
      const total = catQuestions.length || 200;
      
      let masteredCount = 0;
      let reviewCount = 0;
      
      catQuestions.forEach(q => {
        const status = state.progress[q.id];
        if (status === 'mastered') masteredCount++;
        else if (status === 'reviewing') reviewCount++;
      });
      
      const unseenCount = total - (masteredCount + reviewCount);
      
      // Update DOM Text counts
      const domStats = DOM.stats[cat];
      if (domStats.mastered) domStats.mastered.textContent = `${masteredCount} / ${total}`;
      if (domStats.review) domStats.review.textContent = `${reviewCount} / ${total}`;
      if (domStats.unseen) domStats.unseen.textContent = `${unseenCount} / ${total}`;
      
      // Calculate Percent Mastered
      const percentVal = Math.round((masteredCount / total) * 100);
      if (domStats.percent) domStats.percent.innerHTML = `${percentVal}% <span>Mastered</span>`;
      
      // Sync SVG Radial Progress (Circumference ~ 377px)
      if (domStats.chart) {
        const offset = 377 - (masteredCount / total) * 377;
        domStats.chart.style.strokeDashoffset = offset;
      }
      
      // Update Difficulty Badge
      if (domStats.badge) {
        const easyCount = catQuestions.filter(q => q.difficulty === 'EASY').length;
        const medCount = catQuestions.filter(q => q.difficulty === 'MEDIUM').length;
        const hardCount = catQuestions.filter(q => q.difficulty === 'HARD').length;
        domStats.badge.innerHTML = `E: ${easyCount} | M: ${medCount} | H: ${hardCount}`;
      }
    });
  }

  // --- CONCEPT EXPLAINER ACCORDION & FILTERS ---
  
  function renderExplainer() {
    const filterCat = state.activeExplainerCategory;
    const filterStatus = DOM.explainerFilterStatus.value;
    const filterDifficulty = DOM.explainerFilterDifficulty ? DOM.explainerFilterDifficulty.value : 'ALL';
    const query = DOM.explainerSearch.value.trim().toLowerCase();
    
    // Group active questions by Category -> Niche
    const grouped = {};
    
    state.questions.forEach(q => {
      // Apply filters
      if (filterCat !== 'ALL' && q.category !== filterCat) return;
      
      const status = state.progress[q.id] || 'unseen';
      if (filterStatus !== 'ALL' && status !== filterStatus) return;

      // Apply difficulty filter
      const difficulty = (q.difficulty || 'HARD').toUpperCase();
      if (filterDifficulty !== 'ALL' && difficulty !== filterDifficulty) return;
      
      // Apply text search filter
      if (query) {
        const qText = q.question.toLowerCase();
        const aText = q.answer.toLowerCase();
        if (!qText.includes(query) && !aText.includes(query)) return;
      }
      
      if (!grouped[q.category]) {
        grouped[q.category] = {};
      }
      if (!grouped[q.category][q.niche]) {
        grouped[q.category][q.niche] = [];
      }
      grouped[q.category][q.niche].push(q);
    });
    
    DOM.explainerAccordion.innerHTML = '';
    
    const catKeys = Object.keys(grouped);
    if (catKeys.length === 0) {
      DOM.explainerAccordion.innerHTML = `<div style="text-align:center; padding: 3rem; color:var(--text-secondary);">No questions found matching the selected filters.</div>`;
      return;
    }
    
    // Render Category Groups & Niche Accordions
    catKeys.forEach(cat => {
      const niches = grouped[cat];
      
      // Insert Section Header for Category (Formatted Title)
      const catHeader = document.createElement('h3');
      catHeader.className = 'practice-section-header';
      catHeader.style.margin = '2rem 0 1rem 0';
      catHeader.style.fontSize = '1.4rem';
      catHeader.style.fontWeight = '800';
      catHeader.style.color = 'var(--primary)';
      catHeader.style.textTransform = 'uppercase';
      catHeader.style.letterSpacing = '0.05em';
      catHeader.textContent = displayNames[cat] || cat;
      DOM.explainerAccordion.appendChild(catHeader);
      
      Object.keys(niches).forEach(nicheName => {
        const qList = niches[nicheName];
        
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        
        const header = document.createElement('button');
        header.className = 'accordion-header';
        const diffs = Array.from(new Set(qList.map(q => q.difficulty || 'HARD')));
        const diffsHtml = diffs.map(d => `<span class="difficulty-badge badge-${d.toLowerCase()}">${d}</span>`).join(' ');
        header.innerHTML = `
          <span>${nicheName} (${qList.length} questions) ${diffsHtml}</span>
          <span class="accordion-arrow">▼</span>
        `;
        
        const content = document.createElement('div');
        content.className = 'accordion-content';
        
        const inner = document.createElement('div');
        inner.className = 'accordion-inner';
        
        const cardsGrid = document.createElement('div');
        cardsGrid.className = 'cards-grid';
        
        qList.forEach(q => {
          const card = document.createElement('div');
          card.className = 'concept-card';
          card.setAttribute('data-id', q.id);
          
          const status = state.progress[q.id] || 'unseen';
          const badgeClass = badgeClasses[q.category] || 'badge-spark';
          const categoryDisplayName = displayNames[q.category] || q.category;
          
          card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; gap: 0.5rem; flex-wrap: wrap;">
              <span class="stats-badge ${badgeClass}" style="font-size: 0.65rem; padding: 0.15rem 0.4rem; border-radius: 4px; display: inline-block; width: fit-content;">${categoryDisplayName}</span>
              <span class="difficulty-badge badge-${(q.difficulty || 'hard').toLowerCase()}" style="margin-left: 0;">${q.difficulty || 'HARD'}</span>
            </div>
            <div class="concept-card-title" style="margin-bottom: 0.75rem;">${q.question}</div>
            <div class="concept-card-footer">
              <span class="status-indicator status-${status}${status === 'unseen' ? ' hidden' : ''}">${status}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          `;
          
          card.addEventListener('click', () => {
            openDetailsDialog(q.id);
          });
          
          cardsGrid.appendChild(card);
        });
        
        inner.appendChild(cardsGrid);
        content.appendChild(inner);
        accordionItem.appendChild(header);
        accordionItem.appendChild(content);
        
        // Expand accordions by default so contents are visible immediately
        accordionItem.classList.add('active');
        
        DOM.explainerAccordion.appendChild(accordionItem);
        
        // Accordion toggle behavior
        header.addEventListener('click', () => {
          accordionItem.classList.toggle('active');
        });
      });
    });
  }

  // --- NICHE PRACTICE SELECTION GRID ---
  
  function renderNicheSelection() {
    const filterCat = state.activePracticeCategory;
    
    // Group all niches and counts
    const nicheSummary = {};
    
    state.questions.forEach(q => {
      if (filterCat !== 'ALL' && q.category !== filterCat) return;
      
      if (state.activeDifficulty !== 'ALL') {
        const diff = q.difficulty || 'HARD';
        if (diff !== state.activeDifficulty) return;
      }
      
      if (!nicheSummary[q.niche]) {
        nicheSummary[q.niche] = {
          nicheName: q.niche,
          category: q.category,
          total: 0,
          mastered: 0,
          difficulties: new Set()
        };
      }
      
      nicheSummary[q.niche].total++;
      nicheSummary[q.niche].difficulties.add(q.difficulty || 'HARD');
      if (state.progress[q.id] === 'mastered') {
        nicheSummary[q.niche].mastered++;
      }
    });
    
    DOM.nicheLauncherGrid.innerHTML = '';
    
    const nicheList = Object.values(nicheSummary);
    if (nicheList.length === 0) {
      DOM.nicheLauncherGrid.innerHTML = `<div style="text-align:center; grid-column:1/-1; padding:3rem; color:var(--text-secondary);">No practice niches found for this category.</div>`;
      return;
    }
    
    nicheList.forEach(n => {
      const card = document.createElement('div');
      card.className = 'concept-card';
      card.style.minHeight = '140px';
      
      const badgeClass = badgeClasses[n.category] || 'badge-fabric';
      const diffsHtml = Array.from(n.difficulties).map(d => `<span class="difficulty-badge badge-${d.toLowerCase()}">${d}</span>`).join(' ');
      card.innerHTML = `
        <div>
          <span class="stats-badge ${badgeClass}" style="display:inline-block; margin-bottom: 0.5rem; font-size:0.75rem;">${displayNames[n.category] || n.category}</span>
          <h4 style="font-size: 1rem; font-weight: 500; line-height:1.4; word-break:break-word;">${n.nicheName} <div style="margin-top:0.35rem;">${diffsHtml}</div></h4>
        </div>
        <div class="concept-card-footer" style="margin-top:1rem; border-top:1px solid var(--card-border); padding-top:0.5rem;">
          <span style="font-size: 0.8rem; font-weight: 500; color:var(--text-secondary);">${n.mastered} / ${n.total} Mastered</span>
          <button class="status-btn status-btn-mastered active" style="padding:0.35rem 0.65rem; font-size:0.75rem;">Practice</button>
        </div>
      `;
      
      card.addEventListener('click', () => {
        startPracticeSession(n.nicheName);
      });
      
      DOM.nicheLauncherGrid.appendChild(card);
    });
  }

  // --- ACTIVE FLASHCARD PRACTICE CONTROLLER ---
  
  function startPracticeSession(nicheName) {
    state.practice.nicheName = nicheName;
    state.practice.questionsList = state.questions.filter(q => q.niche === nicheName);
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
      
      const status = state.progress[q.id] || 'unseen';
      
      li.innerHTML = `
        <span class="status-indicator status-${status}${status === 'unseen' ? ' hidden' : ''}" style="font-size:0.6rem; padding:0.15rem 0.35rem;">${status}</span>
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
    
    // Update active status buttons
    const activeStatus = state.progress[activeQ.id] || 'unseen';
    DOM.practiceStatusBtns.forEach(btn => {
      if (btn.getAttribute('data-status') === activeStatus) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
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

  // Parses basic markdown and linebreaks into clean HTML list formatting
  function formatMarkdownAnswer(text) {
    if (!text) return '';
    
    // Clean string formats
    let html = text.replace(/\\n/g, '\n').replace(/\\"/g, '"');
    
    // Extract code blocks first
    const codeBlocks = [];
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function(match, lang, code) {
      const index = codeBlocks.length;
      codeBlocks.push(formatCodeBlock(code, lang));
      return `\n__CODE_BLOCK_PLACEHOLDER_${index}__\n`;
    });
    
    // Normalize inline lists by injecting a newline before " 1) ", " 2. ", etc.
    html = html.replace(/([^\n])(\s)(\d+[\)\.]\s)/g, '$1\n$3');
    
    // Also handle bullet points if they are inline
    html = html.replace(/([^\n])(\s)([\-\*]\s)/g, '$1\n$3');
    
    // Escape HTML characters to prevent rendering placeholders like <table_name> as browser tags
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Restore placeholders from escaping: &lt;code_block_placeholder...
    html = html.replace(/__CODE_BLOCK_PLACEHOLDER_(\d+)__/g, '__CODE_BLOCK_PLACEHOLDER_$1__');
    
    // Convert backticks to code block styling
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
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
      
      let olMatch = line.match(/^(\d+)[\)\.]\s/);
      
      if (olMatch) {
        if (inParagraph) { output += '</p>'; inParagraph = false; }
        
        let num = parseInt(olMatch[1]);
        if (listType === 'ol' && num === 1) {
          output += '</ol><ol>';
        } else if (listType !== 'ol') {
          if (listType === 'ul') output += '</ul>';
          output += '<ol>';
          listType = 'ol';
        }
        let cleanIt = line.replace(/^\d+[\)\.]\s+/, '');
        output += `<li>${cleanIt}</li>`;
      } else if (/^[\-\*]\s/.test(line)) {
        if (inParagraph) { output += '</p>'; inParagraph = false; }
        
        if (listType !== 'ul') {
          if (listType === 'ol') output += '</ol>';
          output += '<ul>';
          listType = 'ul';
        }
        let cleanIt = line.replace(/^[\-\*]\s+/, '');
        output += `<li>${cleanIt}</li>`;
      } else {
        if (listType) {
          output += `</${listType}>`;
          listType = null;
        }
        
        if (!inParagraph) {
          output += '<p>';
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
    
    // Sync active state of status buttons
    const activeStatus = isDe ? (generalDeState.progress[questionId] || 'unseen') : (state.progress[questionId] || 'unseen');
    DOM.dialogStatusBtns.forEach(btn => {
      const btnStatus = btn.getAttribute('data-status');
      if (btnStatus === activeStatus) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
      
      // Bind click triggers directly
      btn.onclick = () => {
        if (isDe) {
          generalDeState.progress[questionId] = btnStatus;
          saveDeProgress();
          // Update the specific card's DOM attribute & status label
          const cardEl = document.querySelector(`#de-questions-container .concept-card[data-id="${questionId}"]`);
          if (cardEl) {
            cardEl.setAttribute('data-status', btnStatus);
            const statusIndicator = cardEl.querySelector('.status-indicator');
            if (statusIndicator) {
              statusIndicator.className = `status-indicator status-${btnStatus}`;
              statusIndicator.textContent = btnStatus;
            }
          }
        } else {
          updateQuestionStatus(questionId, btnStatus);
        }
        DOM.dialogStatusBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
    });
    
    DOM.detailsDialog.classList.remove('hidden');
    DOM.detailsDialog.removeAttribute('hidden');
  }

  function closeDetailsDialog() {
    DOM.detailsDialog.classList.add('hidden');
    DOM.detailsDialog.setAttribute('hidden', 'true');
  }

  // --- EVENT LISTENERS REGISTRATION ---
  
  function setupEventListeners() {
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

    // Unified Search Filter listeners
    if (DOM.prephub && DOM.prephub.unifiedSearchInput) {
      DOM.prephub.unifiedSearchInput.addEventListener('input', () => {
        state.unifiedSearchPage = 1;
        renderUnifiedSearch(true);
      });
    }
    if (DOM.prephub && DOM.prephub.unifiedDbScrollbar) {
      const chips = DOM.prephub.unifiedDbScrollbar.querySelectorAll('.topic-chip');
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          chips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          state.activeUnifiedDb = chip.getAttribute('data-db') || 'ALL';
          state.unifiedSearchPage = 1;
          renderUnifiedSearch(true);
        });
      });
    }
    if (DOM.prephub && DOM.prephub.unifiedCategoryScrollbar) {
      const chips = DOM.prephub.unifiedCategoryScrollbar.querySelectorAll('.topic-chip');
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          chips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          state.activeUnifiedCategory = chip.getAttribute('data-category') || 'ALL';
          state.unifiedSearchPage = 1;
          renderUnifiedSearch(true);
        });
      });
    }
    if (DOM.prephub && DOM.prephub.btnUnifiedLoadMore) {
      DOM.prephub.btnUnifiedLoadMore.addEventListener('click', () => {
        state.unifiedSearchPage = (state.unifiedSearchPage || 1) + 1;
        renderUnifiedSearch(false);
      });
    }

    // Click on Dashboard stats card navigates to Concept Explainer and filters
    document.querySelectorAll('.stats-card').forEach(card => {
      card.addEventListener('click', () => {
        const category = card.getAttribute('data-category');
        if (category) {
          // 1. Switch active chip in explainer scrollbar
          const explainerChips = DOM.explainerTopicsScrollbar.querySelectorAll('.topic-chip');
          explainerChips.forEach(chip => {
            if (chip.getAttribute('data-category') === category) {
              chip.classList.add('active');
            } else {
              chip.classList.remove('active');
            }
          });
          
          // 2. Set state filter
          state.activeExplainerCategory = category;
          
          // 3. Navigate to Concept Explainer page
          switchView('view-explainer');
        }
      });
    });

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

    // Horizontal Explainer Topic Chips Click
    const explainerChips = DOM.explainerTopicsScrollbar.querySelectorAll('.topic-chip');
    explainerChips.forEach(chip => {
      chip.addEventListener('click', () => {
        explainerChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.activeExplainerCategory = chip.getAttribute('data-category');
        renderExplainer();
      });
    });

    // Horizontal Practice Topic Chips Click
    const practiceChips = DOM.practiceTopicsScrollbar.querySelectorAll('.topic-chip');
    practiceChips.forEach(chip => {
      chip.addEventListener('click', () => {
        practiceChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.activePracticeCategory = chip.getAttribute('data-category');
        
        // Exit practice session if active so the filtered grid is visible
        DOM.activePracticeScreen.classList.add('hidden');
        DOM.nicheSelectionScreen.classList.remove('hidden');
        
        renderNicheSelection();
      });
    });

    // Concept Explainer Filters Clicks
    DOM.explainerFilterStatus.addEventListener('change', renderExplainer);
    DOM.explainerSearch.addEventListener('input', renderExplainer);
    if (DOM.explainerFilterDifficulty) {
      DOM.explainerFilterDifficulty.addEventListener('change', renderExplainer);
    }

    // Expand All / Collapse All Buttons clicks
    DOM.btnExplainerExpandAll.addEventListener('click', () => {
      document.querySelectorAll('#explainer-accordion .accordion-item').forEach(item => {
        item.classList.add('active');
      });
    });

    DOM.btnExplainerCollapseAll.addEventListener('click', () => {
      document.querySelectorAll('#explainer-accordion .accordion-item').forEach(item => {
        item.classList.remove('active');
      });
    });

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

    // Practice status selector buttons click bind
    DOM.practiceStatusBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetStatus = btn.getAttribute('data-status');
        const activeQ = state.practice.questionsList[state.practice.currentIndex];
        
        if (activeQ) {
          updateQuestionStatus(activeQ.id, targetStatus);
          
          DOM.practiceStatusBtns.forEach(b => {
            if (b === btn) b.classList.add('active');
            else b.classList.remove('active');
          });
          
          // Re-render side questions list to sync tags
          renderActivePracticeQList();
        }
      });
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

  function initGeneralDe() {
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

    const DOM_DE = getDeDomElements();
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
    const DOM_DE = getDeDomElements();
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
    const DOM_DE = getDeDomElements();
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
    const DOM_DE = getDeDomElements();
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
        <div class="concept-card-footer" style="width: 100%;">
          <span class="status-indicator status-${status}">${status}</span>
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
    let formatted = text;
    
    // Extract and format code blocks first
    const codeBlocks = [];
    formatted = formatted.replace(/```(\w*)\n([\s\S]*?)```/g, function(match, lang, code) {
      const index = codeBlocks.length;
      codeBlocks.push(formatCodeBlock(code, lang));
      return `\n__CODE_BLOCK_PLACEHOLDER_${index}__\n`;
    });
    
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary); font-weight:600;">$1</strong>');
    formatted = formatted.replace(/\n\n/g, '</div><div style="margin-top:0.75rem;">');
    
    // Restore code blocks
    formatted = formatted.replace(/__CODE_BLOCK_PLACEHOLDER_(\d+)__/g, (match, idx) => {
      return codeBlocks[parseInt(idx)];
    });
    
    return `<div style="text-align:left;">${formatted}</div>`;
  }

  function setupDeEventListeners() {
    const DOM_DE = getDeDomElements();
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
    const DOM_DE = getDeDomElements();

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
    const DOM_DE = getDeDomElements();
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
    const DOM_DE = getDeDomElements();
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
    const DOM_DE = getDeDomElements();
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
    const DOM_DE = getDeDomElements();
    DOM_DE.mockActive.classList.add('hidden');
    DOM_DE.mockSummary.classList.add('hidden');
    DOM_DE.mockSetup.classList.remove('hidden');
  }

  // --- KEY CONCEPTS & GLOSSARY VIEW IMPLEMENTATION ---

  function initConcepts() {
    console.log("Initializing Key Concepts glossary...");
    console.log("DOM.concepts search found:", !!DOM.concepts.search);
    console.log("DOM.concepts difficultyFilters found:", !!DOM.concepts.difficultyFilters);
    console.log("DOM.concepts topicsScrollbar found:", !!DOM.concepts.topicsScrollbar);
    console.log("DOM.concepts container found:", !!DOM.concepts.container);
    console.log("window.CONCEPTS_DB count:", window.CONCEPTS_DB ? window.CONCEPTS_DB.length : "undefined");
    setupConceptsListeners();
    renderConcepts();
  }

  function setupConceptsListeners() {
    // Search input field event
    if (DOM.concepts.search) {
      DOM.concepts.search.addEventListener('input', renderConcepts);
    } else {
      console.warn("DOM.concepts.search element not found on page!");
    }

    // Difficulty filter tab button click events
    if (DOM.concepts.difficultyFilters) {
      const diffBtns = DOM.concepts.difficultyFilters.querySelectorAll('.de-diff-chip');
      diffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          diffBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.activeConceptsDifficulty = btn.getAttribute('data-difficulty') || 'ALL';
          renderConcepts();
        });
      });
    } else {
      console.warn("DOM.concepts.difficultyFilters element not found on page!");
    }

    // Topic scrollbar chip click events
    if (DOM.concepts.topicsScrollbar) {
      const topicChips = DOM.concepts.topicsScrollbar.querySelectorAll('.topic-chip');
      topicChips.forEach(chip => {
        chip.addEventListener('click', () => {
          topicChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          state.activeConceptsCategory = chip.getAttribute('data-category') || 'ALL';
          renderConcepts();
        });
      });
    } else {
      console.warn("DOM.concepts.topicsScrollbar element not found on page!");
    }
  }

  function renderConcepts() {
    if (!DOM.concepts.container) {
      console.error("DOM.concepts.container not found on page, cannot render concepts!");
      return;
    }

    const query = DOM.concepts.search ? DOM.concepts.search.value.trim().toLowerCase() : '';
    const filterDiff = state.activeConceptsDifficulty || 'ALL';
    const filterCat = state.activeConceptsCategory || 'ALL';

    console.log(`Rendering Key Concepts (Category: ${filterCat}, Difficulty: ${filterDiff}, Search Query: "${query}")`);

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

    filtered.forEach(item => {
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
    console.log(`Rendered ${filtered.length} concept cards.`);
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
    console.log("Initializing Code Deepdive for DE...");
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

  function renderCheatsheet() {
    if (!DOM.cheatsheet.container) return;

    const lang = state.activeCheatsheetLang || 'python';
    const level = state.activeCheatsheetLevel || 'all';
    const query = (state.activeCheatsheetQuery || '').toLowerCase();

    // Select target dataset
    let dataset = [];
    if (lang === 'python') dataset = window.PYTHON_DATA || [];
    else if (lang === 'mssql') dataset = window.MSSQL_DATA || [];
    else if (lang === 'pyspark') dataset = window.PYSPARK_DATA || [];
    else if (lang === 'sparksql') dataset = window.SPARKSQL_DATA || [];

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
      
      items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = `concept-card ${lang}`;
        card.setAttribute('data-id', item.id);
        card.setAttribute('data-level', item.level);

        const highlightedCode = Highlighter.highlight(item.code || '', lang);
        
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
                <span class="code-lang-badge">${lang === 'python' ? 'Python' : lang === 'mssql' ? 'T-SQL' : lang === 'pyspark' ? 'PySpark' : 'Spark SQL'}</span>
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
                  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              `;
            }, 2000);
          });
        });

        cardsGrid.appendChild(card);
      });

      DOM.cheatsheet.container.appendChild(cardsGrid);
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

  // --- PERSONALISED PREP VIEW ---

  function initPersonalised() {
    console.log("Initializing Personalised Interview Prep...");
    setupPersonalisedListeners();
    renderPersonalised();
  }

  function setupPersonalisedListeners() {
    // Search input
    if (DOM.personalised.search) {
      DOM.personalised.search.addEventListener('input', renderPersonalised);
    }
    
    // Domain chip filters
    if (DOM.personalised.topicsScrollbar) {
      const chips = DOM.personalised.topicsScrollbar.querySelectorAll('.topic-chip');
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          chips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          state.activePersonalisedDomain = chip.getAttribute('data-domain') || 'ALL';
          renderPersonalised();
        });
      });
    }
  }

  function renderPersonalised() {
    if (!DOM.personalised.container) return;
    
    const query = (DOM.personalised.search ? DOM.personalised.search.value : '').toLowerCase().trim();
    const activeDomain = state.activePersonalisedDomain || 'ALL';
    
    // Filter questions
    const sourceQuestions = window.PERSONALISED_QUESTIONS || [];
    const filtered = sourceQuestions.filter(q => {
      const matchesDomain = (activeDomain === 'ALL' || q.domain === activeDomain);
      
      const qText = (q.question || '').toLowerCase();
      const aText = (q.answer || '').toLowerCase();
      const sText = (q.subdomain || '').toLowerCase();
      const matchesSearch = !query || qText.includes(query) || aText.includes(query) || sText.includes(query);
      
      return matchesDomain && matchesSearch;
    });
    
    // Update count
    if (DOM.personalised.matchCount) {
      DOM.personalised.matchCount.textContent = `Showing ${filtered.length} questions`;
    }
    
    // Clear container
    DOM.personalised.container.innerHTML = '';
    
    if (filtered.length === 0) {
      DOM.personalised.container.innerHTML = `
        <div class="no-results-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: var(--card-bg); border: 1px dashed var(--card-border); border-radius: 16px;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 1rem; color: var(--text-secondary); opacity: 0.5;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <h4 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">No matching questions found</h4>
          <p style="color: var(--text-secondary); font-size: 0.88rem;">Try adjusting your filters or search keywords.</p>
        </div>
      `;
      return;
    }
    
    // Render list
    filtered.forEach(q => {
      const card = document.createElement('div');
      card.className = 'concept-accordion-card';
      
      const qIndex = (window.PERSONALISED_QUESTIONS || []).indexOf(q) + 1;
      
      // We will render clean subdomains and tags
      const headerDiv = document.createElement('div');
      headerDiv.className = 'level-card-header';
      headerDiv.style.cursor = 'pointer';
      
      // Construct inner html
      headerDiv.innerHTML = `
        <div class="level-badge" style="background: var(--cat-fabric); color: #fff; font-size: 0.8rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; width: 42px; height: 42px; border-radius: 10px;">Q${qIndex}</div>
        <div class="level-meta" style="flex: 1; min-width: 0;">
          <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: var(--accent); margin-bottom: 2px; display: block;">${q.subdomain}</span>
          <h4 class="level-title" style="margin: 0; font-size: 0.95rem; font-weight: 600; line-height: 1.4; color: var(--text-primary);">${escapeHTML(q.question)}</h4>
        </div>
        <svg class="level-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.25s ease;"><polyline points="6 9 12 15 18 9"/></svg>
      `;
      
      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'level-card-body';
      bodyDiv.style.display = 'none'; // Accordion hidden by default
      bodyDiv.style.borderTop = '1px solid var(--card-border)';
      bodyDiv.style.padding = '1.25rem';
      bodyDiv.style.background = 'rgba(255, 255, 255, 0.01)';
      
      // Render structured answers with paragraphs, lists, etc.
      const formattedAnswer = formatArchitectAnswer(q.answer);
      bodyDiv.innerHTML = `
        <div style="font-family: 'Outfit', sans-serif; font-size: 0.92rem; line-height: 1.6; color: var(--text-secondary);">
          ${formattedAnswer}
        </div>
      `;
      
      card.appendChild(headerDiv);
      card.appendChild(bodyDiv);
      
      // Wire up toggle
      headerDiv.addEventListener('click', () => {
        const isOpen = bodyDiv.style.display !== 'none';
        
        // Toggle chevron rotation
        const chevron = headerDiv.querySelector('.level-chevron');
        if (chevron) {
          chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        }
        
        // Toggle body visibility
        if (isOpen) {
          bodyDiv.style.display = 'none';
          card.classList.remove('expanded');
        } else {
          bodyDiv.style.display = 'block';
          card.classList.add('expanded');
          
          // Re-render LaTeX math if MathJax is present
          if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            MathJax.typesetPromise([bodyDiv]).catch(err => console.error("MathJax error:", err));
          }
        }
      });
      
      DOM.personalised.container.appendChild(card);
    });
  }

  function renderUnifiedSearch(resetResults = true) {
    if (!DOM.prephub || !DOM.prephub.unifiedSearchContainer) return;

    if (resetResults) {
      state.unifiedSearchPage = 1;
      DOM.prephub.unifiedSearchContainer.innerHTML = '';
    }

    const query = (DOM.prephub.unifiedSearchInput ? DOM.prephub.unifiedSearchInput.value : '').toLowerCase().trim();
    const dbFilter = state.activeUnifiedDb || 'ALL';
    const catFilter = state.activeUnifiedCategory || 'ALL';

    const pool = [];

    // 1. Accumulate Personalised Prep
    if (dbFilter === 'ALL' || dbFilter === 'personalised') {
      (window.PERSONALISED_QUESTIONS || []).forEach(q => {
        pool.push({
          ...q,
          sourceDb: 'personalised',
          sourceLabel: 'Personalised',
          categoryLabel: q.subdomain || q.domain || 'Personalised',
          difficulty: q.difficulty || 'HARD'
        });
      });
    }

    // 2. Accumulate Fabric & PBI Prep
    if (dbFilter === 'ALL' || dbFilter === 'fabric_pbi') {
      (window.QUESTIONS_DB || []).forEach(q => {
        pool.push({
          ...q,
          sourceDb: 'fabric_pbi',
          sourceLabel: 'Fabric & PBI',
          categoryLabel: q.category,
          difficulty: q.difficulty || 'MEDIUM'
        });
      });
    }

    // 3. Accumulate General DE Prep
    if (dbFilter === 'ALL' || dbFilter === 'general') {
      (window.QUESTIONS_DE_DB || []).forEach(q => {
        pool.push({
          ...q,
          sourceDb: 'general',
          sourceLabel: 'General DE',
          categoryLabel: q.category,
          difficulty: q.difficulty || 'MEDIUM'
        });
      });
    }

    // Filter items
    const filtered = pool.filter(q => {
      let matchesCat = true;
      if (catFilter !== 'ALL') {
        const itemCat = (q.category || '').toUpperCase().trim();
        const filterCat = catFilter.toUpperCase().trim();
        matchesCat = itemCat.includes(filterCat) || filterCat.includes(itemCat);
      }

      const qText = (q.question || '').toLowerCase();
      const aText = (q.answer || '').toLowerCase();
      const catText = (q.categoryLabel || '').toLowerCase();
      const matchesSearch = !query || qText.includes(query) || aText.includes(query) || catText.includes(query);

      return matchesCat && matchesSearch;
    });

    if (DOM.prephub.unifiedMatchCount) {
      DOM.prephub.unifiedMatchCount.textContent = `Showing ${filtered.length} questions`;
    }

    const itemsPerPage = 50;
    const currentPage = state.unifiedSearchPage || 1;
    const endIndex = currentPage * itemsPerPage;
    const pageItems = filtered.slice(endIndex - itemsPerPage, endIndex);

    if (DOM.prephub.unifiedLoadMoreContainer) {
      if (endIndex < filtered.length) {
        DOM.prephub.unifiedLoadMoreContainer.classList.remove('hidden');
      } else {
        DOM.prephub.unifiedLoadMoreContainer.classList.add('hidden');
      }
    }

    if (filtered.length === 0) {
      DOM.prephub.unifiedSearchContainer.innerHTML = `
        <div class="no-results-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: var(--card-bg); border: 1px dashed var(--card-border); border-radius: 16px;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 1rem; color: var(--text-secondary); opacity: 0.5;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <h4 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">No matching questions found</h4>
          <p style="color: var(--text-secondary); font-size: 0.88rem;">Try adjusting your filters or search keywords.</p>
        </div>
      `;
      return;
    }

    pageItems.forEach((q, idx) => {
      const card = document.createElement('div');
      card.className = 'concept-accordion-card';
      
      const overallIndex = (resetResults ? 0 : DOM.prephub.unifiedSearchContainer.querySelectorAll('.concept-accordion-card').length) + idx + 1;
      
      let badgeBg = 'var(--accent)';
      if (q.sourceDb === 'personalised') {
        badgeBg = 'var(--cat-fabric)';
      } else if (q.sourceDb === 'fabric_pbi') {
        badgeBg = '#3b82f6';
      } else {
        badgeBg = '#10b981';
      }

      const headerDiv = document.createElement('div');
      headerDiv.className = 'level-card-header';
      headerDiv.style.cursor = 'pointer';
      headerDiv.innerHTML = `
        <div class="level-badge" style="background: ${badgeBg}; color: #fff; font-size: 0.8rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif; width: 42px; height: 42px; border-radius: 10px;">#${overallIndex}</div>
        <div class="level-meta" style="flex: 1; min-width: 0;">
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 4px;">
            <span class="stats-badge" style="font-size: 0.65rem; padding: 2px 6px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; background: rgba(255, 255, 255, 0.08); color: var(--text-primary); border-radius: 4px;">${q.sourceLabel}</span>
            <span style="font-size: 0.75rem; font-weight: 600; color: var(--accent);">${q.categoryLabel}</span>
          </div>
          <h4 class="level-title" style="margin: 0; font-size: 0.95rem; font-weight: 600; line-height: 1.4; color: var(--text-primary);">${escapeHTML(q.question)}</h4>
        </div>
        <svg class="level-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.25s ease;"><polyline points="6 9 12 15 18 9"/></svg>
      `;

      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'level-card-body';
      bodyDiv.style.display = 'none';
      bodyDiv.style.borderTop = '1px solid var(--card-border)';
      bodyDiv.style.padding = '1.25rem';
      bodyDiv.style.background = 'rgba(255, 255, 255, 0.01)';
      
      const formattedAnswer = formatArchitectAnswer(q.answer);
      bodyDiv.innerHTML = `
        <div style="font-family: 'Outfit', sans-serif; font-size: 0.92rem; line-height: 1.6; color: var(--text-secondary);">
          ${formattedAnswer}
        </div>
      `;

      card.appendChild(headerDiv);
      card.appendChild(bodyDiv);

      headerDiv.addEventListener('click', () => {
        const isOpen = bodyDiv.style.display !== 'none';
        const chevron = headerDiv.querySelector('.level-chevron');
        if (chevron) {
          chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        }
        if (isOpen) {
          bodyDiv.style.display = 'none';
          card.classList.remove('expanded');
        } else {
          bodyDiv.style.display = 'block';
          card.classList.add('expanded');
          
          if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            MathJax.typesetPromise([bodyDiv]).catch(err => console.error("MathJax error:", err));
          }
        }
      });

      DOM.prephub.unifiedSearchContainer.appendChild(card);
    });
  }

  function updateUnifiedSearchCounts() {
    const totalPersonalised = (window.PERSONALISED_QUESTIONS || []).length;
    const totalGeneral = (window.QUESTIONS_DE_DB || []).length;
    const totalFabricPbi = (window.QUESTIONS_DB || []).length;
    const totalAll = totalPersonalised + totalGeneral + totalFabricPbi;

    const searchInput = document.getElementById('unified-search-input');
    if (searchInput) {
      searchInput.placeholder = `Search across all ${totalAll.toLocaleString()} questions (Fabric, PBI, ADF, SQL, Personalised)...`;
    }

    if (DOM.prephub && DOM.prephub.unifiedDbScrollbar) {
      const chips = DOM.prephub.unifiedDbScrollbar.querySelectorAll('.topic-chip');
      chips.forEach(chip => {
        const db = chip.getAttribute('data-db');
        if (db === 'ALL') {
          chip.textContent = `All Databases (${totalAll.toLocaleString()})`;
        } else if (db === 'personalised') {
          chip.textContent = `Personalised Prep (${totalPersonalised.toLocaleString()})`;
        } else if (db === 'general') {
          chip.textContent = `General DE Prep (${totalGeneral.toLocaleString()})`;
        } else if (db === 'fabric_pbi') {
          chip.textContent = `Fabric & PBI Prep (${totalFabricPbi.toLocaleString()})`;
        }
      });
    }
  }

  // Format architect answer containing numbered lists or bullet points
  function formatArchitectAnswer(text) {
    if (!text) return '';
    
    let html = text.replace(/\\n/g, '\n').replace(/\\"/g, '"');
    
    // Escape HTML characters to prevent issues
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
        output += `<li style="margin-bottom: 0.75rem; padding-left: 0.25rem;">${cleanIt}</li>`;
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

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Start the application!
  init();
});


/* --- SPARK GUIDE INTEGRATED LOGIC --- */

        const brilliantBlues = ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087'];
        const vibrantPalette = ['#7a5195', '#bc5090', '#ef5675', '#ff764a', '#ffa600'];

        let rawResponseText = "";

        // Double-check element definitions before mounting charts
        const ctxRadar = document.getElementById('languageApiChartExtended');
        if (ctxRadar) {
            new Chart(ctxRadar, {
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
                            angleLines: { color: 'rgba(0,0,0,0.1)' },
                            grid: { color: 'rgba(0,0,0,0.1)' },
                            pointLabels: { font: { size: 10 } },
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
                        font: { size: 10 }
                    }
                }
            },
            cutout: '60%'
        };

        const ctxSql = document.getElementById('ecosystemSqlChart');
        if (ctxSql) {
            new Chart(ctxSql, {
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
            new Chart(ctxStreaming, {
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
            new Chart(ctxMl, {
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
            new Chart(ctxGraph, {
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

        // Language API Selection Tab Logic
        function switchLanguageTab(lang) {
            const languages = ['pyspark', 'scala', 'sql', 'java'];
            languages.forEach(l => {
                const btn = document.getElementById(`lang-btn-${l}`);
                const panel = document.getElementById(`lang-panel-${l}`);
                if (l === lang) {
                    btn.className = "px-4 py-2 text-xs font-semibold border-b-2 border-[#7a5195] text-[#7a5195] focus:outline-none";
                    panel.classList.remove('hidden');
                } else {
                    btn.className = "px-4 py-2 text-xs font-semibold border-b-2 border-transparent text-gray-500 hover:text-[#7a5195] focus:outline-none";
                    panel.classList.add('hidden');
                }
            });
        }

        // AI Sandbox Interaction Tab Logic
        function switchSandboxTab(tabId) {
            const tabs = ['optimizer', 'simulator', 'drafter'];
            tabs.forEach(t => {
                const btn = document.getElementById(`tab-btn-${t}`);
                const panel = document.getElementById(`panel-${t}`);
                if (t === tabId) {
                    btn.className = "flex-1 py-3 px-4 text-center font-semibold text-sm border-b-2 border-[#7a5195] text-[#7a5195] focus:outline-none transition-all";
                    panel.classList.remove('hidden');
                } else {
                    btn.className = "flex-1 py-3 px-4 text-center font-semibold text-sm border-b-2 border-transparent text-gray-500 hover:text-[#7a5195] focus:outline-none transition-all";
                    panel.classList.add('hidden');
                }
            });
        }

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
        async function fetchGeminiIntelligence(systemPrompt, userQuery, statusText) {
            const outContainer = document.getElementById('sandbox-output-container');
            const loader = document.getElementById('sandbox-loading');
            const resultBox = document.getElementById('sandbox-result');
            const statusLabel = document.getElementById('sandbox-loading-status');

            outContainer.classList.remove('hidden');
            loader.classList.remove('hidden');
            resultBox.classList.add('hidden');
            resultBox.innerHTML = "";
            statusLabel.textContent = statusText;

            const apiKey = ""; // Implicitly injected during live workspace executions
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
                
                // Re-render LaTeX math notation after inserting dynamic text content
                if (window.MathJax) {
                    MathJax.typesetPromise([resultBox]);
                }
            } else {
                resultBox.innerHTML = `<p class="text-red-600 font-semibold text-xs">Runtime Error: Unable to query Spark Engine Intelligence. Please check cloud connection settings.</p>`;
                resultBox.classList.remove('hidden');
            }
        }

        function formatMarkdown(text) {
            if (!text) return "";
            let html = text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

            // Multi-line code block matching
            html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function(match, lang, code) {
                return formatCodeBlock(code, lang);
            });

            // Single line inline code expressions
            html = html.replace(/`([^`]+)`/g, '<code class="bg-[var(--code-bg)] text-[var(--primary)] px-1.5 py-0.5 rounded font-mono text-xs font-medium border border-[var(--card-border)]">$1</code>');

            // Bold markers
            html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

            // Headers formatting replacements
            html = html.replace(/^### (.*$)/gim, '<h4 class="text-base font-bold text-[#003f5c] mt-4 mb-2">$1</h4>');
            html = html.replace(/^## (.*$)/gim, '<h3 class="text-lg font-bold text-[#003f5c] mt-6 mb-3">$1</h3>');
            html = html.replace(/^# (.*$)/gim, '<h2 class="text-xl font-bold text-[#003f5c] mt-8 mb-4">$1</h2>');

            // List item layouts
            const lines = html.split('\n');
            let inList = false;
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if (line.startsWith('* ') || line.startsWith('- ')) {
                    if (!inList) {
                        lines[i] = '<ul class="list-disc list-inside space-y-1.5 my-2 ml-4 text-xs text-gray-600">' + '<li>' + line.substring(2) + '</li>';
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

            // Line breaks spacing
            html = html.replace(/\n\n/g, '<br><br>');
            return html;
        }

        function runCodeOptimization() {
            const code = document.getElementById('optimizer-code-input').value;
            if (!code.trim()) {
                alert("Please select or enter Spark code transformations.");
                return;
            }
            const systemPrompt = "You are the Lead Core Apache Spark Architect. Analyze this Spark code for architectural bottlenecks like wide shuffles, missing broadcast joins, or uncached RDD lineage. Provide optimized replacement code and explain how the physical plan changes step-by-step. Keep explanations rigorous and technical.";
            const userQuery = `Analyze and optimize this code:\n\n${code}`;
            fetchGeminiIntelligence(systemPrompt, userQuery, "Reconstructing physical execution plans & analyzing Catalyst query trees...");
        }

        function runScenarioSimulation() {
            const context = document.getElementById('simulator-input').value;
            if (!context.trim()) {
                alert("Please select or describe a production scenario.");
                return;
            }
            const systemPrompt = "You are a Senior Infrastructure and Platform Reliability Engineer for large-scale Spark clusters. Diagnose the given memory or runtime issue. Explain the JVM memory overhead patterns, state store concerns, and supply the precise configuration parameters (e.g., spark.sql.shuffle.partitions, spark.memory.offHeap.size) to apply in spark-defaults.conf.";
            const userQuery = `Diagnose and fix this production issue:\n\n${context}`;
            fetchGeminiIntelligence(systemPrompt, userQuery, "Evaluating heap storage distributions & planning state reallocations...");
        }

        function runContentDrafting() {
            const topic = document.getElementById('drafter-custom').value;
            if (!topic.trim()) {
                alert("Please select or define an educational topic.");
                return;
            }
            const systemPrompt = "You are a Distinguished Tech Lead writing a definitive textbook on Apache Spark. Write a highly detailed, technical textbook chapter or blog post explaining this concept. Include clear technical breakdowns, comparisons with raw JVM layouts, and code examples in both PySpark and Scala. Use markdown headers, tables, and clear technical formatting.";
            const userQuery = `Write a deep-dive educational chapter on:\n\n${topic}`;
            fetchGeminiIntelligence(systemPrompt, userQuery, "Generating technical chapter drafts & verifying code syntax structures...");
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
            const buttons = ['all', 'engine', 'optimization', 'memory', 'streaming'];
            buttons.forEach(btn => {
                const el = document.getElementById(`cat-btn-${btn}`);
                if (btn === category) {
                    el.className = "text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--primary)] text-white transition-all";
                } else {
                    el.className = "text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--item-bg)] border border-[var(--card-border)] transition-all";
                }
            });
            filterLexicon();
        }

        function filterLexicon() {
            const query = document.getElementById('lexicon-search').value.toLowerCase().trim();
            const cards = document.getElementsByClassName('lexicon-card');
            
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i];
                const cat = card.getAttribute('data-category');
                const keywords = card.getAttribute('data-keywords').toLowerCase();
                const title = card.querySelector('h4').textContent.toLowerCase();
                const desc = card.querySelector('p').textContent.toLowerCase();
                
                const matchesCategory = (currentLexiconCategory === 'all' || cat === currentLexiconCategory);
                const matchesQuery = (!query || title.includes(query) || desc.includes(query) || keywords.includes(query));
                
                if (matchesCategory && matchesQuery) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            }
        }

        /* --- Interactive Spark Visual Simulator Core Mechanics --- */
        const flowDetails = {
            narrow: {
                title: "Narrow Dependency (Map / Filter)",
                shuffled: "0 Bytes",
                tasks: "2 parallel tasks",
                explain: "<p><strong>Execution Mechanics:</strong> Map and Filter transformations represent pipelining in Spark. Data partitions are modified in isolation within the same core execution thread. The physical plan joins operations together into a single <strong>Stage</strong>.</p><div class='p-3 bg-blue-950/40 rounded border border-blue-900 mt-2'><span class='font-bold text-[#ffa600]'>No Spill Over:</span> Because the boundaries are isolated, JVM Garbage collection spikes and memory spills do not occur here. No network resources are touched.</div>"
            },
            "wide-shuffle": {
                title: "Sort-Merge Shuffle Join (Wide Boundary)",
                shuffled: "2.4 GB across network",
                tasks: "200 default partitions",
                explain: "<p><strong>Execution Mechanics:</strong> To execute a join on keys not already partition-aligned, Spark triggers a physical <strong>Shuffle Exchange</strong> barrier. Rows are hashed, written to shuffle file directories on local storage, and then sorted and fetched across worker nodes.</p><div class='p-3 bg-blue-950/40 rounded border border-blue-900 mt-2'><span class='font-bold text-[#ef5675]'>Critical Spill Warning:</span> A mismatch in partition sizing during a Sort-Merge Join triggers disk spill, forcing Tungsten to fall back onto slower virtual storage paths.</div>"
            },
            broadcast: {
                title: "Broadcast Hash Join (Map-Side Join)",
                shuffled: "14.2 MB (Driver-to-worker)",
                tasks: "Parallel executor maps",
                explain: "<p><strong>Execution Mechanics:</strong> If one side of a join dataset is under 10MB (configured via `spark.sql.autoBroadcastJoinThreshold`), the Driver fetches it and serializes a copy to all Executors. The workers load the metadata directly into memory, converting a Sort-Merge into a rapid map-side hash join.</p><div class='p-3 bg-blue-950/40 rounded border border-blue-900 mt-2'><span class='font-bold text-emerald-400'>Zero Wide Shuffle:</span> Network transfers are completely avoided across executor stages, cutting execution times significantly.</div>"
            },
            aggregation: {
                title: "Aggregation GroupBy: reduceByKey vs groupByKey",
                shuffled: "Reduced: 250MB | groupBy: 2.1GB",
                tasks: "Stage Combiners + Reducers",
                explain: "<p><strong>Execution Mechanics:</strong> While `groupByKey` sends every matching value raw across the network before execution, `reduceByKey` implements local key-value aggregation combiners inside executors before initiating network shuffles.</p><div class='p-3 bg-blue-950/40 rounded border border-blue-900 mt-2'><span class='font-bold text-amber-300'>Combiner Impact:</span> Pre-reducing locally cuts network transfers by up to 90%, preventing major network and memory congestion on active nodes.</div>"
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

            // Convert to percentages relative to total heap for bar scaling
            const reservedPct = (reservedMB / totalHeapMB) * 100;
            const executionPct = (executionMB / totalHeapMB) * 100;
            const storagePct = (storageMB / totalHeapMB) * 100;
            const userPct = (userMB / totalHeapMB) * 100;

            // Scale UI bars
            document.getElementById('bar-reserved').style.width = `${reservedPct}%`;
            document.getElementById('bar-execution').style.width = `${executionPct}%`;
            document.getElementById('bar-storage').style.width = `${storagePct}%`;
            document.getElementById('bar-user').style.width = `${userPct}%`;

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

        // ---- Lexicon Filter Functions ----
        let currentLexiconCategory = 'all';

        function filterLexicon() {
            const query = (document.getElementById('lexicon-search')?.value || '').toLowerCase().trim();
            const cards = document.querySelectorAll('#lexicon-grid .lexicon-card');
            cards.forEach(card => {
                const category = card.dataset.category || '';
                const keywords = (card.dataset.keywords || '').toLowerCase();
                const term = (card.querySelector('.spark-lexicon-term')?.textContent || '').toLowerCase();
                const def = (card.querySelector('.spark-lexicon-def')?.textContent || '').toLowerCase();

                const matchesCategory = currentLexiconCategory === 'all' || category === currentLexiconCategory;
                const matchesQuery = !query || term.includes(query) || def.includes(query) || keywords.includes(query);

                card.style.display = (matchesCategory && matchesQuery) ? '' : 'none';
            });
        }

        function filterLexiconCategory(category) {
            currentLexiconCategory = category;
            // Update button states
            document.querySelectorAll('.spark-filter-btn').forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.getElementById(`cat-btn-${category}`);
            if (activeBtn) activeBtn.classList.add('active');
            filterLexicon();
        }

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
                    btn.style.borderBottomColor = t === tab ? 'var(--accent)' : 'transparent';
                    btn.style.color = t === tab ? 'var(--accent)' : 'var(--text-secondary)';
                }
            });
        }

        // Start default structures on page launch
        window.onload = function () {
            changeSimulatorFlow();
            updateMemoryMapper();
        }
    