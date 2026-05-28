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
    pageViews: document.querySelectorAll('.page-view'),
    
    // Theme Toggle
    themeToggleBtn: document.getElementById('btn-theme-toggle'),
    themeToggleLabel: document.querySelector('.theme-toggle-container .theme-toggle-label'),
    
    // Mark Status Toggle
    statusToggleBtn: document.getElementById('btn-status-toggle'),
    statusToggleLabel: document.querySelectorAll('.theme-toggle-container .theme-toggle-label')[1],
    
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
    btnScrollToTop: document.getElementById('btn-scroll-to-top')
  };

  // Maps category code to nice human readable display name
  const displayNames = {
    'FABRIC': 'Microsoft Fabric',
    'POWER BI': 'Power BI',
    'ADF': 'Azure Data Factory',
    'SQL SERVER': 'SQL Server',
    'DATALAKE ARCHITECTURE': 'Data Lake Architecture',
    'SPARK & DATABRICKS': 'Spark & Databricks'
  };

  // Maps category code to CSS styles badges classes
  const badgeClasses = {
    'FABRIC': 'badge-fabric',
    'POWER BI': 'badge-pbi',
    'ADF': 'badge-adf',
    'SQL SERVER': 'badge-sql',
    'DATALAKE ARCHITECTURE': 'badge-dl',
    'SPARK & DATABRICKS': 'badge-spark'
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
    
    // Check scroll position to show scroll to top button
    const mainContent = document.querySelector('.main-content');
    mainContent.addEventListener('scroll', () => {
      if (mainContent.scrollTop > 300) {
        DOM.btnScrollToTop.classList.remove('hidden');
      } else {
        DOM.btnScrollToTop.classList.add('hidden');
      }
    });
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
      explainerCardIndicator.className = `status-indicator status-${newStatus}`;
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
      DOM.themeToggleBtn.textContent = '🌙';
      DOM.themeToggleLabel.textContent = 'Dark Theme';
    } else {
      root.classList.add('theme-dark');
      root.classList.remove('theme-light');
      DOM.body.classList.add('theme-dark');
      DOM.body.classList.remove('theme-light');
      DOM.themeToggleBtn.textContent = '☀️';
      DOM.themeToggleLabel.textContent = 'Light Theme';
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
      DOM.statusToggleBtn.classList.add('active');
      DOM.statusToggleBtn.textContent = '✓';
      DOM.statusToggleLabel.textContent = 'Mark Status';
      root.classList.remove('mark-status-disabled');
      DOM.practiceStatusSelector.classList.remove('hidden');
      document.querySelectorAll('.dialog-status-selector').forEach(el => el.classList.remove('hidden'));
    } else {
      DOM.statusToggleBtn.classList.remove('active');
      DOM.statusToggleBtn.textContent = '✗';
      DOM.statusToggleLabel.textContent = 'Mark Status';
      root.classList.add('mark-status-disabled');
      DOM.practiceStatusSelector.classList.add('hidden');
      document.querySelectorAll('.dialog-status-selector').forEach(el => el.classList.add('hidden'));
    }
    localStorage.setItem('interview_prep_mark_status_enabled', state.markStatusEnabled);
  }

  // --- SPA ROUTING ---
  
  function switchView(targetViewId) {
    state.currentView = targetViewId;
    
    // Hide active practice when leaving Niche Practice
    if (targetViewId !== 'view-practice') {
      DOM.activePracticeScreen.classList.add('hidden');
      DOM.nicheSelectionScreen.classList.remove('hidden');
    }
    
    // Switch active states of nav buttons
    DOM.navBtns.forEach(btn => {
      if (btn.getAttribute('data-target') === targetViewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Toggle view section visibility with clean starting styles
    DOM.pageViews.forEach(view => {
      if (view.id === targetViewId) {
        view.classList.remove('hidden');
        view.removeAttribute('hidden');
      } else {
        view.classList.add('hidden');
        view.setAttribute('hidden', 'true');
      }
    });

    // Re-render launcher or explainer to sync numbers and selections
    if (targetViewId === 'view-dashboard') {
      updateDashboardStats();
    } else if (targetViewId === 'view-explainer') {
      renderExplainer();
    } else if (targetViewId === 'view-practice') {
      renderNicheSelection();
    }
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
              <span class="status-indicator status-${status}">${status}</span>
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
      const percentMastered = Math.round((n.mastered / n.total) * 100);
      
      const diffsHtml = Array.from(n.difficulties).map(d => `<span class="difficulty-badge badge-${d.toLowerCase()}">${d}</span>`).join(' ');
      card.innerHTML = `
        <div>
          <span class="stats-badge ${badgeClass}" style="display:inline-block; margin-bottom: 0.5rem; font-size:0.75rem;">${displayNames[n.category] || n.category}</span>
          <h4 style="font-size: 1rem; font-weight: 500; line-height:1.4;">${n.nicheName} <div style="margin-top:0.35rem;">${diffsHtml}</div></h4>
        </div>
        <div class="concept-card-footer" style="margin-top:1rem; border-top:1px solid var(--card-border); padding-top:0.5rem;">
          <span style="font-size: 0.8rem; font-weight: 500; color:var(--text-secondary);">${n.mastered} / ${n.total} Mastered (${percentMastered}%)</span>
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
        <span class="status-indicator status-${status}" style="font-size:0.6rem; padding:0.15rem 0.35rem;">${status}</span>
        <div style="font-size:0.85rem; font-weight: 400; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; margin-top:0.25rem;">Q${idx+1}: [${q.difficulty || 'HARD'}] ${q.question}</div>
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

  // Parses basic markdown and linebreaks into clean HTML list formatting
  function formatMarkdownAnswer(text) {
    if (!text) return '';
    
    // Clean string formats
    let html = text.replace(/\\n/g, '\n').replace(/\\"/g, '"');
    
    // Normalize inline lists by injecting a newline before " 1) ", " 2. ", etc.
    html = html.replace(/([^\n])(\s)(\d+[\)\.]\s)/g, '$1\n$3');
    
    // Also handle bullet points if they are inline
    html = html.replace(/([^\n])(\s)([\-\*]\s)/g, '$1\n$3');
    
    // Escape HTML characters to prevent rendering placeholders like <table_name> as browser tags
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
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
    const qObj = state.questions.find(q => q.id === questionId);
    if (!qObj) return;
    
    // Compute current active list context
    const cards = document.querySelectorAll('#explainer-accordion .concept-card');
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
    DOM.dialogAText.innerHTML = formatMarkdownAnswer(qObj.answer);
    
    // Sync active state of status buttons
    const activeStatus = state.progress[questionId] || 'unseen';
    DOM.dialogStatusBtns.forEach(btn => {
      if (btn.getAttribute('data-status') === activeStatus) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
      
      // Bind click triggers directly
      btn.onclick = () => {
        updateQuestionStatus(questionId, btn.getAttribute('data-status'));
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
    DOM.statusToggleBtn.addEventListener('click', () => {
      state.markStatusEnabled = !state.markStatusEnabled;
      applyMarkStatusToggle();
    });

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

    // Scroll to Top Scroll trigger
    DOM.btnScrollToTop.addEventListener('click', () => {
      document.querySelector('.main-content').scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
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
                return `<pre class="terminal-block my-4 overflow-x-auto"><code>${code.trim()}</code></pre>`;
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
            
            // Highlight relevant interface configurations based on selected flow type
            const label1 = document.getElementById('sim-out-1-desc');
            const label2 = document.getElementById('sim-out-2-desc');
            if (flowType === 'narrow') {
                label1.textContent = "Ready (Map-Side)";
                label2.textContent = "Ready (Map-Side)";
                label1.className = "block text-[9px] text-emerald-400 font-mono";
                label2.className = "block text-[9px] text-emerald-400 font-mono";
            } else if (flowType === 'wide-shuffle') {
                label1.textContent = "Merged & Sorted";
                label2.textContent = "Merged & Sorted";
                label1.className = "block text-[9px] text-[#ffa600] font-mono";
                label2.className = "block text-[9px] text-[#ffa600] font-mono";
            } else {
                label1.textContent = "Complete";
                label2.textContent = "Complete";
                label1.className = "block text-[9px] text-teal-400 font-mono";
                label2.className = "block text-[9px] text-teal-400 font-mono";
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
            document.getElementById('sim-exec-1-status').textContent = "Processing task...";
            document.getElementById('sim-exec-1-status').className = "block text-[8px] text-amber-300 font-bold animate-pulse";
            document.getElementById('sim-exec-2-status').textContent = "Processing task...";
            document.getElementById('sim-exec-2-status').className = "block text-[8px] text-amber-300 font-bold animate-pulse";

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
                document.getElementById('sim-exec-1-status').textContent = "Active / Finished";
                document.getElementById('sim-exec-1-status').className = "block text-[8px] text-green-400 font-bold";
                document.getElementById('sim-exec-2-status').textContent = "Active / Finished";
                document.getElementById('sim-exec-2-status').className = "block text-[8px] text-green-400 font-bold";
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

        // Start default structures on page launch
        window.onload = function () {
            changeSimulatorFlow();
            updateMemoryMapper();
        }
    