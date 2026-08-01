#!/usr/bin/env python3
"""
Revamp Data Engineering Mindmap — Apple-Inspired Jelly Physics & Curved Design:
- Replace rigid static layout with soft, organic, floating jelly simulation and draggable nodes.
- Smooth Bezier curved paths (`Q cx,cy x2,y2`) that dynamically re-curve as nodes gently oscillate.
- Elastic node drag physics: pick up, stretch, and release nodes like soft jelly.
- Apple Glassmorphism design tokens (backdrop blur, rounded pill badges, smooth spring transitions).
- Update both data-engineering-mindmap/index.html and data-engineering-mindmap.html.
"""

import json
import os
import re

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
source_html = os.path.join(base_dir, 'data-engineering-mindmap', 'index.html')

with open(source_html, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract DATA_GRAPH JSON block
match = re.search(r'const\s+DATA_GRAPH\s*=\s*(\{.*?\});\s*\n', content, re.DOTALL)
if not match:
    print("Error: Could not extract DATA_GRAPH from source HTML!")
    exit(1)

data_graph_json = match.group(1)

# Verify JSON validity
try:
    graph_obj = json.loads(data_graph_json)
    print(f"Loaded DATA_GRAPH successfully with {len(graph_obj.get('nodes', []))} nodes.")
except Exception as e:
    print(f"Error parsing DATA_GRAPH JSON: {e}")
    exit(1)

apple_jelly_template = """<!DOCTYPE html>
<html lang="en" class="theme-dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DE.UNIVERSE — Data Engineering Knowledge Graph</title>
  <meta name="description" content="Editorial, data-dense interactive knowledge graph covering 250+ data engineering concepts with smooth curved Apple-style jelly physics.">

  <!-- Inter & JetBrains Mono fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- D3.js -->
  <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>

  <style>
    :root, .theme-dark {
      --bg-base:             #080C14;
      --bg-elevated:         rgba(15, 22, 36, 0.75);
      --bg-overlay:          rgba(24, 34, 54, 0.80);
      --line:                rgba(255, 255, 255, 0.08);
      --line-strong:         rgba(255, 255, 255, 0.16);
      --text-primary:        #F8FAFC;
      --text-secondary:      #94A3B8;
      --text-tertiary:       #64748B;
      --accent:              #6366F1;
      --accent-hover:        #4F46E5;
      --accent-soft:         rgba(99, 102, 241, 0.18);
      --focus-ring:          #818CF8;

      --graph-edge:          rgba(148, 163, 184, 0.22);
      --graph-edge-dim:      rgba(255, 255, 255, 0.04);
      --graph-edge-strong:   #818CF8;
      --graph-node:          #94A3B8;
      --graph-node-l2:       #0F1624;
      --graph-node-stroke:   rgba(255, 255, 255, 0.12);
      --graph-node-halo:     rgba(99, 102, 241, 0.35);
      --graph-label:         #F8FAFC;
      --graph-label-bg:      rgba(15, 22, 36, 0.88);
      --glass-blur:          blur(20px) saturate(180%);
      --glass-shadow:        0 8px 32px 0 rgba(0, 0, 0, 0.37);

      /* Domain Palette */
      --d-foundations:  #38BDF8;
      --d-ingestion:    #22D3EE;
      --d-storage:      #A78BFA;
      --d-processing:   #FBBF24;
      --d-modeling:     #F472B6;
      --d-orchestration:#34D399;
      --d-quality:      #2DD4BF;
      --d-governance:   #F87171;
      --d-analytics:    #A3E635;
      --d-architecture: #FB923C;

      /* Difficulty Tokens */
      --diff-b: #34D399;
      --diff-i: #38BDF8;
      --diff-a: #FBBF24;
      --diff-x: #F87171;
    }

    .theme-light {
      --bg-base:             #F8FAFC;
      --bg-elevated:         rgba(255, 255, 255, 0.82);
      --bg-overlay:          rgba(241, 245, 249, 0.88);
      --line:                rgba(0, 0, 0, 0.08);
      --line-strong:         rgba(0, 0, 0, 0.16);
      --text-primary:        #0F172A;
      --text-secondary:      #475569;
      --text-tertiary:       #64748B;
      --accent:              #4F46E5;
      --accent-hover:        #4338CA;
      --accent-soft:         rgba(79, 70, 229, 0.12);
      --focus-ring:          #4F46E5;

      --graph-edge:          rgba(71, 85, 105, 0.22);
      --graph-edge-dim:      rgba(0, 0, 0, 0.04);
      --graph-edge-strong:   #4F46E5;
      --graph-node:          #475569;
      --graph-node-l2:       #FFFFFF;
      --graph-node-stroke:   rgba(0, 0, 0, 0.12);
      --graph-node-halo:     rgba(79, 70, 229, 0.25);
      --graph-label:         #0F172A;
      --graph-label-bg:      rgba(255, 255, 255, 0.92);
      --glass-blur:          blur(20px) saturate(180%);
      --glass-shadow:        0 8px 32px 0 rgba(0, 0, 0, 0.08);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg-base);
      color: var(--text-primary);
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      font-size: 0.875rem;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    :focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    button, input, select, a {
      font-family: inherit;
      color: inherit;
    }

    .mono {
      font-family: 'JetBrains Mono', monospace;
    }

    /* TOP BAR — APPLE GLASS HEADER (56px) */
    .header-bar {
      height: 56px;
      width: 100%;
      background: var(--bg-elevated);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border-bottom: 1px solid var(--line);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 100;
      flex-shrink: 0;
      gap: 16px;
      box-shadow: var(--glass-shadow);
    }

    .brand-section {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }

    .brand-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-badge {
      font-size: 0.6875rem;
      color: var(--accent);
      background: var(--accent-soft);
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 2px 10px;
      border-radius: 9999px;
      font-weight: 600;
    }

    .header-center {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      max-width: 620px;
    }

    .search-trigger {
      flex: 1;
      background: var(--bg-overlay);
      border: 1px solid var(--line);
      border-radius: 9999px;
      padding: 6px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--text-secondary);
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .search-trigger:hover {
      border-color: var(--line-strong);
      color: var(--text-primary);
    }

    .cmd-badge {
      margin-left: auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6875rem;
      background: var(--bg-base);
      border: 1px solid var(--line);
      padding: 2px 8px;
      border-radius: 9999px;
      color: var(--text-tertiary);
    }

    .filter-select {
      background: var(--bg-overlay);
      border: 1px solid var(--line);
      border-radius: 9999px;
      padding: 6px 14px;
      font-size: 0.8125rem;
      color: var(--text-primary);
      cursor: pointer;
      outline: none;
      transition: all 0.2s ease;
    }

    .filter-select:hover {
      border-color: var(--line-strong);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-action {
      background: var(--bg-overlay);
      border: 1px solid var(--line);
      border-radius: 9999px;
      padding: 6px 14px;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .btn-action:hover {
      border-color: var(--line-strong);
      color: var(--text-primary);
      transform: translateY(-1px);
    }

    .progress-pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: var(--text-secondary);
      background: var(--bg-overlay);
      border: 1px solid var(--line);
      padding: 4px 12px;
      border-radius: 9999px;
    }

    /* MAIN CONTAINER */
    .app-main {
      flex: 1;
      display: flex;
      position: relative;
      overflow: hidden;
    }

    /* LEFT SIDEBAR — APPLE GLASS NAV (260px) */
    .sidebar-left {
      width: 260px;
      background: var(--bg-elevated);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border-right: 1px solid var(--line);
      display: flex;
      flex-direction: column;
      z-index: 10;
      flex-shrink: 0;
      box-shadow: var(--glass-shadow);
    }

    .sidebar-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--line);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--text-tertiary);
    }

    .domain-list {
      flex: 1;
      overflow-y: auto;
      list-style: none;
      padding: 8px;
    }

    .domain-item {
      padding: 8px 12px;
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-secondary);
      transition: all 0.2s ease;
    }

    .domain-item:hover, .domain-item.active {
      background: var(--bg-overlay);
      color: var(--text-primary);
      transform: translateX(2px);
    }

    .domain-label {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .domain-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      box-shadow: 0 0 8px currentColor;
    }

    .domain-count {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6875rem;
      color: var(--text-tertiary);
      background: var(--bg-base);
      border: 1px solid var(--line);
      padding: 2px 8px;
      border-radius: 9999px;
    }

    /* CENTER CANVAS */
    .graph-viewport-container {
      flex: 1;
      position: relative;
      background: var(--bg-base);
      overflow: hidden;
    }

    #svg-graph {
      width: 100%;
      height: 100%;
      display: block;
    }

    /* CURVED CONNECTOR STYLES */
    .graph-edge-path {
      fill: none;
      stroke: var(--graph-edge);
      stroke-width: 1.5px;
      stroke-opacity: 0.55;
      stroke-linecap: round;
      transition: stroke 0.3s ease, stroke-width 0.3s ease, stroke-opacity 0.3s ease;
    }

    .graph-edge-path.highlighted {
      stroke: var(--graph-edge-strong);
      stroke-width: 2.5px;
      stroke-opacity: 0.95;
      filter: drop-shadow(0 0 8px var(--accent-soft));
    }

    /* JELLY NODE ANIMATIONS & STYLES */
    .node-group {
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .node-group:hover {
      cursor: grab;
    }

    .node-group:active {
      cursor: grabbing;
    }

    .concept-circle {
      transition: r 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), fill 0.3s ease, stroke 0.3s ease;
    }

    /* FLOATING APPLE ZOOM TOOLBAR */
    .zoom-toolbar {
      position: absolute;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      background: var(--bg-elevated);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--line);
      border-radius: 9999px;
      box-shadow: var(--glass-shadow);
      z-index: 20;
      padding: 4px;
      gap: 2px;
    }

    .zoom-btn {
      width: 36px;
      height: 36px;
      background: transparent;
      border: none;
      border-radius: 50%;
      color: var(--text-primary);
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .zoom-btn:hover {
      background: var(--bg-overlay);
      transform: scale(1.1);
    }

    /* RIGHT INSPECTOR — APPLE GLASS CARD (360px) */
    .inspector-panel {
      width: 360px;
      background: var(--bg-elevated);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border-left: 1px solid var(--line);
      display: flex;
      flex-direction: column;
      z-index: 10;
      flex-shrink: 0;
      overflow-y: auto;
      box-shadow: var(--glass-shadow);
    }

    .inspector-header {
      padding: 24px;
      border-bottom: 1px solid var(--line);
    }

    .breadcrumb {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: var(--text-tertiary);
      margin-bottom: 8px;
    }

    .node-title-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .node-title {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--text-primary);
    }

    .btn-close-ins {
      background: var(--bg-overlay);
      border: 1px solid var(--line);
      border-radius: 50%;
      width: 28px;
      height: 28px;
      color: var(--text-tertiary);
      font-size: 0.875rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .btn-close-ins:hover {
      color: var(--text-primary);
      border-color: var(--line-strong);
    }

    .badge-row {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .diff-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
      border: 1px solid transparent;
    }

    .diff-b { background: rgba(52, 211, 153, 0.15); color: var(--diff-b); border-color: rgba(52, 211, 153, 0.3); }
    .diff-i { background: rgba(56, 189, 248, 0.15); color: var(--diff-i); border-color: rgba(56, 189, 248, 0.3); }
    .diff-a { background: rgba(251, 191, 36, 0.15); color: var(--diff-a); border-color: rgba(251, 191, 36, 0.3); }
    .diff-x { background: rgba(248, 113, 113, 0.15); color: var(--diff-x); border-color: rgba(248, 113, 113, 0.3); }

    .inspector-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .section-title {
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-tertiary);
      margin-bottom: 10px;
    }

    .summary-text {
      font-size: 0.875rem;
      line-height: 1.65;
      color: var(--text-secondary);
    }

    .callout-box {
      background: var(--bg-overlay);
      border-left: 3px solid var(--accent);
      border-radius: 0 10px 10px 0;
      padding: 14px;
      font-size: 0.8125rem;
      color: var(--text-primary);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .concept-bullets {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .concept-bullet-item {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .concept-bullet-item::before {
      content: "•";
      color: var(--accent);
      font-weight: bold;
      font-size: 1.1rem;
      line-height: 1;
    }

    .prereq-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .prereq-chip {
      background: var(--bg-overlay);
      border: 1px solid var(--line);
      border-radius: 9999px;
      padding: 5px 12px;
      font-size: 0.75rem;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .prereq-chip:hover {
      border-color: var(--accent);
      color: var(--text-primary);
      transform: translateY(-1px);
    }

    .link-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .resource-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--bg-overlay);
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 0.8125rem;
      color: var(--text-primary);
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .resource-link:hover {
      border-color: var(--accent);
      background: var(--accent-soft);
      transform: translateY(-1px);
    }

    .inspector-actions {
      padding: 20px;
      border-top: 1px solid var(--line);
      display: flex;
      gap: 10px;
    }

    .btn-complete {
      flex: 1;
      background: var(--accent);
      color: #FFFFFF;
      border: none;
      border-radius: 9999px;
      padding: 12px;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .btn-complete:hover {
      background: var(--accent-hover);
      transform: translateY(-1px);
    }

    .btn-complete.done {
      background: var(--diff-b);
      box-shadow: 0 4px 12px rgba(52, 211, 153, 0.3);
    }

    /* FOOTER STATUS BAR (32px) */
    .footer-bar {
      height: 32px;
      background: var(--bg-elevated);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border-top: 1px solid var(--line);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      font-size: 0.75rem;
      color: var(--text-tertiary);
      z-index: 100;
      flex-shrink: 0;
    }

    .history-trail {
      color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace;
    }

    /* COMMAND PALETTE MODAL */
    .palette-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 100px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }

    .palette-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }

    .palette-card {
      width: 580px;
      background: var(--bg-elevated);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--line-strong);
      border-radius: 16px;
      box-shadow: var(--glass-shadow);
      overflow: hidden;
    }

    .palette-input {
      width: 100%;
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--line);
      padding: 18px 24px;
      font-size: 1rem;
      color: var(--text-primary);
      outline: none;
    }

    .palette-results {
      max-height: 360px;
      overflow-y: auto;
      list-style: none;
    }

    .palette-item {
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--line);
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .palette-item:hover, .palette-item.active {
      background: var(--bg-overlay);
    }

    .palette-item-name {
      font-weight: 500;
      color: var(--text-primary);
    }

    .palette-item-domain {
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }

    /* ACCESSIBLE LIST VIEW MODAL */
    .list-view-overlay {
      position: fixed;
      inset: 0;
      background: var(--bg-base);
      z-index: 900;
      overflow-y: auto;
      padding: 40px;
      display: none;
    }

    .list-view-overlay.open {
      display: block;
    }
  </style>
</head>
<body>

  <!-- APPLE GLASS HEADER BAR -->
  <header class="header-bar">
    <a href="/" class="brand-section">
      <span class="brand-title">DE.UNIVERSE <span class="brand-badge">250+ CONCEPTS</span></span>
    </a>

    <div class="header-center">
      <div class="search-trigger" id="cmd-search-btn" role="button" tabindex="0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <span>Search node or concept...</span>
        <span class="cmd-badge">⌘K</span>
      </div>

      <select class="filter-select" id="domain-filter-select" aria-label="Filter domain">
        <option value="ALL">All 10 Domains</option>
        <option value="foundations">Data Foundations</option>
        <option value="ingestion">Data Ingestion</option>
        <option value="storage">Data Storage</option>
        <option value="processing">Data Processing</option>
        <option value="modeling">Data Modeling</option>
        <option value="orchestration">Orchestration & Workflow</option>
        <option value="quality">Data Quality & Observability</option>
        <option value="governance">Data Governance & Security</option>
        <option value="analytics">Analytics, BI & Activation</option>
        <option value="architecture">Architecture, Cloud & DevOps</option>
      </select>

      <select class="filter-select" id="diff-filter-select" aria-label="Filter difficulty">
        <option value="ALL">All Levels</option>
        <option value="B">Beginner (B)</option>
        <option value="I">Intermediate (I)</option>
        <option value="A">Advanced (A)</option>
        <option value="X">Architect (X)</option>
      </select>
    </div>

    <div class="header-actions">
      <div class="progress-pill" id="read-progress-pill">0 / 250 Read (0%)</div>

      <button class="btn-action" id="btn-reset-view" title="Reset Camera View">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        <span>Reset</span>
      </button>

      <button class="btn-action" id="btn-theme-toggle" title="Toggle Theme" aria-label="Toggle Theme">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      </button>
    </div>
  </header>

  <!-- MAIN AREA -->
  <main class="app-main">
    <!-- LEFT SIDEBAR -->
    <aside class="sidebar-left">
      <div class="sidebar-header">
        <span>Domains Navigator</span>
        <span class="mono" id="sidebar-total-badge">10 Domains</span>
      </div>
      <ul class="domain-list" id="domain-index-list">
        <!-- Dynamically rendered -->
      </ul>
    </aside>

    <!-- GRAPH CANVAS -->
    <section class="graph-viewport-container" id="graph-container">
      <svg id="svg-graph">
        <defs>
          <filter id="glow-halo" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <g id="graph-viewport">
          <g id="edges-layer"></g>
          <g id="nodes-layer"></g>
        </g>
      </svg>

      <!-- FLOATING APPLE ZOOM TOOLBAR -->
      <div class="zoom-toolbar">
        <button class="zoom-btn" id="btn-zoom-in" title="Zoom In">+</button>
        <button class="zoom-btn" id="btn-zoom-out" title="Zoom Out">−</button>
        <button class="zoom-btn" id="btn-zoom-reset" title="Reset Camera">⟲</button>
      </div>
    </section>

    <!-- RIGHT INSPECTOR PANEL -->
    <aside class="inspector-panel" id="inspector-panel">
      <div class="inspector-header">
        <div class="breadcrumb" id="ins-breadcrumb">Data Engineering › Architecture</div>
        <div class="node-title-row">
          <h2 class="node-title" id="ins-title">DATA ENGINEERING</h2>
          <button class="btn-close-ins" id="btn-close-inspector" title="Close Panel">✕</button>
        </div>
        <div class="badge-row">
          <span class="diff-badge diff-x" id="ins-diff-badge">ARCHITECT</span>
        </div>
      </div>

      <div class="inspector-body">
        <div>
          <div class="section-title">SUMMARY</div>
          <p class="summary-text" id="ins-summary">
            Select any node in the knowledge graph to view its detailed architectural definition, key concepts, prerequisites, and learning resources.
          </p>
        </div>

        <div id="ins-why-box" class="callout-box">
          <strong>Why It Matters:</strong> Powers reliable analytical data pipelines across modern enterprise platforms.
        </div>

        <div>
          <div class="section-title">KEY CONCEPTS</div>
          <ul class="concept-bullets" id="ins-key-concepts">
            <!-- Dynamically populated -->
          </ul>
        </div>

        <div>
          <div class="section-title">PREREQUISITES</div>
          <div class="prereq-container" id="ins-prereqs">
            <!-- Dynamically populated -->
          </div>
        </div>

        <div>
          <div class="section-title">RESOURCES & EXTERNAL DOCS</div>
          <div class="link-list" id="ins-resources">
            <!-- Dynamically populated -->
          </div>
        </div>
      </div>

      <div class="inspector-actions">
        <button class="btn-complete" id="btn-mark-completed">Mark as Completed</button>
      </div>
    </aside>
  </main>

  <!-- FOOTER STATUS BAR -->
  <footer class="footer-bar">
    <div>
      <span>Visited: </span>
      <span class="history-trail" id="visited-trail">root</span>
    </div>
    <div>
      <span>Shortcuts: ⌘K (Search) · R (Reset View) · L (List View) · Esc (Close)</span>
    </div>
  </footer>

  <!-- COMMAND PALETTE MODAL -->
  <div class="palette-backdrop" id="palette-backdrop">
    <div class="palette-card">
      <input type="text" id="palette-input" class="palette-input" placeholder="Type concept or domain name..." autocomplete="off">
      <ul class="palette-results" id="palette-results">
        <!-- Dynamically rendered -->
      </ul>
    </div>
  </div>

  <!-- ACCESSIBLE LIST VIEW MODAL -->
  <div class="list-view-overlay" id="list-view-overlay">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h2 style="font-size: 1.5rem; font-weight: 700;">Data Engineering Knowledge Graph — List View</h2>
      <button class="btn-action" id="btn-close-list-view">Close (Esc)</button>
    </div>
    <ul id="list-view-ul" style="list-style: none; display: flex; flex-direction: column; gap: 16px;">
      <!-- Dynamically populated -->
    </ul>
  </div>

  <script>
    // Embedded Sanitized Taxonomy Dataset
    const DATA_GRAPH = """ + data_graph_json + """;

    // DOMAIN MAP TOKENS & COLORS
    const DOMAIN_TOKENS = {
      'root':         { name: 'Root Hub',                    color: '#6366F1' },
      'foundations':  { name: 'Data Foundations',            color: '#38BDF8' },
      'ingestion':    { name: 'Data Ingestion',              color: '#22D3EE' },
      'storage':      { name: 'Data Storage',                color: '#A78BFA' },
      'processing':   { name: 'Data Processing',             color: '#FBBF24' },
      'modeling':     { name: 'Data Modeling',               color: '#F472B6' },
      'orchestration':{ name: 'Orchestration & Workflow',    color: '#34D399' },
      'quality':      { name: 'Data Quality & Observability',color: '#2DD4BF' },
      'governance':   { name: 'Data Governance & Security',  color: '#F87171' },
      'analytics':    { name: 'Analytics, BI & Activation', color: '#A3E635' },
      'architecture': { name: 'Architecture, Cloud & DevOps',color: '#FB923C' }
    };

    // STATE
    const nodesMap = new Map();
    DATA_GRAPH.nodes.forEach(n => nodesMap.set(n.id, n));

    const linksList = [];
    DATA_GRAPH.nodes.forEach(n => {
      if (n.prerequisites && Array.isArray(n.prerequisites)) {
        n.prerequisites.forEach(prereqId => {
          if (nodesMap.has(prereqId)) {
            linksList.push({ source: prereqId, target: n.id, id: `${prereqId}->${n.id}` });
          }
        });
      }
    });

    let selectedNodeId = 'root';
    let hoveredNodeId = null;
    let readNodes = new Set(JSON.parse(localStorage.getItem('mindmap_read_nodes') || '[]'));
    let visitedHistory = ['root'];

    // D3 CANVAS SETUP
    const svg = d3.select("#svg-graph");
    const container = d3.select("#graph-viewport");
    const edgesLayer = d3.select("#edges-layer");
    const nodesLayer = d3.select("#nodes-layer");

    // D3 Zoom Setup
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3.0])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

    // D3 CONTINUOUS JELLY PHYSICS SIMULATION
    const simulation = d3.forceSimulation(DATA_GRAPH.nodes)
      .force("link", d3.forceLink(linksList).id(d => d.id).distance(95).strength(0.45))
      .force("charge", d3.forceManyBody().strength(-200).distanceMax(450))
      .force("center", d3.forceCenter(0, 0).strength(0.04))
      .force("collide", d3.forceCollide(d => (d.level === 0 ? 40 : (d.level === 1 ? 26 : 14))).strength(0.7))
      .alphaDecay(0.006)   // Slow decay for smooth continuous jelly float
      .alphaTarget(0.015);  // Keeps gentle floating oscillation alive!

    // Warm up initial layout
    for (let i = 0; i < 150; ++i) simulation.tick();

    // HELPER: CALCULATE SMOOTH CURVED BEZIER PATH (Apple-Style Curves)
    function calcCurvedPath(d) {
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const dr = Math.sqrt(dx * dx + dy * dy);
      if (dr === 0) return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
      
      // Calculate smooth midpoint control point for organic curvature
      const mx = (d.source.x + d.target.x) / 2;
      const my = (d.source.y + d.target.y) / 2;
      const offset = Math.min(dr * 0.18, 40);
      const cx = mx - (dy / dr) * offset;
      const cy = my + (dx / dr) * offset;
      return `M ${d.source.x},${d.source.y} Q ${cx},${cy} ${d.target.x},${d.target.y}`;
    }

    // Render Edges with Organic Curved Paths
    const linkElements = edgesLayer.selectAll("path")
      .data(linksList)
      .enter()
      .append("path")
      .attr("class", "graph-edge-path")
      .attr("vector-effect", "non-scaling-stroke")
      .attr("d", calcCurvedPath);

    // ELASTIC JELLY DRAG BEHAVIOR
    const dragBehavior = d3.drag()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.2).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.015);
        d.fx = null;
        d.fy = null;
      });

    // Render Nodes Group with Drag Physics
    const nodeElements = nodesLayer.selectAll("g")
      .data(DATA_GRAPH.nodes)
      .enter()
      .append("g")
      .attr("class", "node-group")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .call(dragBehavior)
      .on("click", (event, d) => {
        selectNode(d.id);
        centerCameraOnNode(d);
      })
      .on("mouseenter", (event, d) => {
        hoveredNodeId = d.id;
        updateGraphStyles();
      })
      .on("mouseleave", () => {
        hoveredNodeId = null;
        updateGraphStyles();
      });

    // TICK HANDLER FOR LIVE JELLY OSCILLATION & DYNAMIC CURVES
    simulation.on("tick", () => {
      const time = Date.now() * 0.0012;

      // Soft sine-wave jelly oscillation for unpinned nodes
      DATA_GRAPH.nodes.forEach((d, i) => {
        if (d.level > 0 && !d.fx) {
          d.vx += Math.sin(time + i * 0.6) * 0.04;
          d.vy += Math.cos(time + i * 0.8) * 0.04;
        }
      });

      // Position node groups
      nodeElements.attr("transform", d => `translate(${d.x},${d.y})`);

      // Re-curve edges dynamically as nodes wobble!
      linkElements.attr("d", calcCurvedPath);
    });

    // Render Node SVG Shapes & Clean Labels
    nodeElements.each(function(d) {
      const g = d3.select(this);
      const domainColor = DOMAIN_TOKENS[d.domain] ? DOMAIN_TOKENS[d.domain].color : 'var(--accent)';

      if (d.level === 0) {
        g.append("circle")
          .attr("r", 18)
          .attr("fill", "var(--bg-elevated)")
          .attr("stroke", domainColor)
          .attr("stroke-width", 3);

        g.append("text")
          .text("DE")
          .attr("text-anchor", "middle")
          .attr("dy", 4)
          .attr("fill", "var(--text-primary)")
          .attr("font-family", "JetBrains Mono")
          .attr("font-size", "12px")
          .attr("font-weight", "700");

        g.append("text")
          .text("DATA ENGINEERING")
          .attr("text-anchor", "middle")
          .attr("dy", 34)
          .attr("fill", "var(--text-primary)")
          .attr("font-size", "12px")
          .attr("font-weight", "700");
      } else if (d.level === 1) {
        g.append("circle")
          .attr("r", 11)
          .attr("fill", "var(--bg-elevated)")
          .attr("stroke", domainColor)
          .attr("stroke-width", 2.5);

        g.append("text")
          .text(d.name)
          .attr("text-anchor", "middle")
          .attr("dy", -18)
          .attr("fill", "var(--text-primary)")
          .attr("font-family", "Inter")
          .attr("font-size", "10px")
          .attr("font-weight", "600");
      } else if (d.level === 2) {
        g.append("circle")
          .attr("r", 7.5)
          .attr("fill", "var(--graph-node-l2)")
          .attr("stroke", domainColor)
          .attr("stroke-width", 2);

        g.append("text")
          .text(d.name)
          .attr("text-anchor", "middle")
          .attr("dy", -14)
          .attr("fill", "var(--text-secondary)")
          .attr("font-family", "Inter")
          .attr("font-size", "9px")
          .attr("font-weight", "500");
      } else {
        g.append("circle")
          .attr("class", "concept-circle")
          .attr("r", 5.5)
          .attr("fill", "var(--graph-node)")
          .attr("stroke", "none");
      }
    });

    // Update Styles on Selection/Hover
    function updateGraphStyles() {
      nodeElements.each(function(d) {
        const g = d3.select(this);
        const circle = g.select(".concept-circle");
        if (circle.empty()) return;

        const isSelected = d.id === selectedNodeId;
        const isHovered = d.id === hoveredNodeId;
        const isRead = readNodes.has(d.id);
        const domainColor = DOMAIN_TOKENS[d.domain] ? DOMAIN_TOKENS[d.domain].color : 'var(--accent)';

        if (isSelected) {
          circle.attr("r", 8)
            .attr("fill", domainColor)
            .attr("stroke", "var(--focus-ring)")
            .attr("stroke-width", 2.5);
        } else if (isHovered) {
          circle.attr("r", 8)
            .attr("fill", domainColor)
            .attr("stroke", "var(--bg-base)")
            .attr("stroke-width", 1.5)
            .attr("filter", "url(#glow-halo)");
        } else if (isRead) {
          circle.attr("r", 5.5)
            .attr("fill", "var(--graph-node)")
            .attr("stroke", "var(--diff-b)")
            .attr("stroke-width", 2);
        } else {
          circle.attr("r", 5.5)
            .attr("fill", "var(--graph-node)")
            .attr("stroke", "none")
            .attr("filter", null);
        }
      });

      // Highlight Curved Edge Paths
      linkElements.each(function(l) {
        const edge = d3.select(this);
        const isSelectedEdge = l.source.id === selectedNodeId || l.target.id === selectedNodeId;
        const isHoveredEdge = l.source.id === hoveredNodeId || l.target.id === hoveredNodeId;

        if (isSelectedEdge || isHoveredEdge) {
          edge.classed("highlighted", true);
        } else {
          edge.classed("highlighted", false);
        }
      });
    }

    // Camera Navigation Helper
    function centerCameraOnNode(node) {
      const width = document.getElementById('graph-container').clientWidth;
      const height = document.getElementById('graph-container').clientHeight;
      const targetX = width * 0.4 - node.x * 1.2;
      const targetY = height * 0.5 - node.y * 1.2;

      svg.transition()
        .duration(450)
        .ease(d3.easeCubicInOut)
        .call(zoom.transform, d3.zoomIdentity.translate(targetX, targetY).scale(1.2));
    }

    function resetGraphView() {
      const width = document.getElementById('graph-container').clientWidth;
      const height = document.getElementById('graph-container').clientHeight;
      svg.transition()
        .duration(500)
        .ease(d3.easeCubicOut)
        .call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.7));
    }

    // Select Node & Render Inspector Panel
    function selectNode(id) {
      selectedNodeId = id;
      const node = nodesMap.get(id);
      if (!node) return;

      // Update visited history
      if (visitedHistory[visitedHistory.length - 1] !== node.id) {
        visitedHistory.push(node.id);
        if (visitedHistory.length > 5) visitedHistory.shift();
        document.getElementById('visited-trail').innerText = visitedHistory.map(hId => nodesMap.get(hId)?.name || hId).join(' › ');
      }

      // Header fields
      document.getElementById('ins-title').innerText = node.name;
      const domainObj = DOMAIN_TOKENS[node.domain];
      const domName = domainObj ? domainObj.name : 'Data Engineering';
      document.getElementById('ins-breadcrumb').innerText = `${domName} › ${node.name}`;

      // Difficulty Badge
      const diffBadge = document.getElementById('ins-diff-badge');
      const diffMap = { 'B': ['BEGINNER', 'diff-b'], 'I': ['INTERMEDIATE', 'diff-i'], 'A': ['ADVANCED', 'diff-a'], 'X': ['ARCHITECT', 'diff-x'] };
      const [diffText, diffClass] = diffMap[node.difficulty] || ['INTERMEDIATE', 'diff-i'];
      diffBadge.innerText = diffText;
      diffBadge.className = `diff-badge ${diffClass}`;

      // Summary & Why It Matters
      document.getElementById('ins-summary').innerText = node.description || 'Architectural concept definition.';
      document.getElementById('ins-why-box').innerHTML = `<strong>Why It Matters:</strong> ${escapeHTML(node.whyItMatters || 'Essential component of enterprise data architectures.')}`;

      // Key Concepts
      const conceptsList = document.getElementById('ins-key-concepts');
      const concepts = node.keyConcepts || ['Core principles', 'Production standards', 'Tooling selection'];
      conceptsList.innerHTML = concepts.map(c => `<li class="concept-bullet-item"><span>${escapeHTML(c)}</span></li>`).join('');

      // Prerequisites
      const prereqsBox = document.getElementById('ins-prereqs');
      const prereqs = node.prerequisites || [];
      if (prereqs.length === 0) {
        prereqsBox.innerHTML = `<span style="font-size: 0.75rem; color: var(--text-tertiary);">None (Foundational)</span>`;
      } else {
        prereqsBox.innerHTML = prereqs.map(pId => {
          const pNode = nodesMap.get(pId);
          return `<button class="prereq-chip" onclick="selectNode('${pId}'); centerCameraOnNode(nodesMap.get('${pId}'));">${escapeHTML(pNode ? pNode.name : pId)}</button>`;
        }).join('');
      }

      // External Resources & Links
      const resourcesBox = document.getElementById('ins-resources');
      const resources = node.resources || [{ label: 'Microsoft Learn Hub', url: 'https://learn.microsoft.com/fabric/' }];
      resourcesBox.innerHTML = resources.map(r => `
        <a href="${escapeHTML(r.url)}" target="_blank" rel="noopener noreferrer" class="resource-link">
          <span>${escapeHTML(r.label)}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      `).join('');

      // Mark Complete button state
      const btnComplete = document.getElementById('btn-mark-completed');
      if (readNodes.has(node.id)) {
        btnComplete.innerText = '✓ Completed';
        btnComplete.classList.add('done');
      } else {
        btnComplete.innerText = 'Mark as Completed';
        btnComplete.classList.remove('done');
      }

      updateGraphStyles();
    }

    // TOGGLE READ STATUS
    document.getElementById('btn-mark-completed').addEventListener('click', () => {
      if (!selectedNodeId) return;
      if (readNodes.has(selectedNodeId)) {
        readNodes.delete(selectedNodeId);
      } else {
        readNodes.add(selectedNodeId);
      }
      localStorage.setItem('mindmap_read_nodes', JSON.stringify(Array.from(readNodes)));
      selectNode(selectedNodeId);
      updateProgressPill();
    });

    function updateProgressPill() {
      const total = DATA_GRAPH.nodes.length;
      const count = readNodes.size;
      const pct = Math.round((count / total) * 100);
      document.getElementById('read-progress-pill').innerText = `${count} / ${total} Read (${pct}%)`;
    }

    // DOMAIN INDEX SIDEBAR POPULATION
    function renderDomainSidebar() {
      const list = document.getElementById('domain-index-list');
      const domains = Object.keys(DOMAIN_TOKENS).filter(d => d !== 'root');

      list.innerHTML = domains.map(dKey => {
        const dObj = DOMAIN_TOKENS[dKey];
        const count = DATA_GRAPH.nodes.filter(n => n.domain === dKey).length;
        return `
          <li class="domain-item" data-domain="${dKey}" onclick="filterByDomain('${dKey}')">
            <div class="domain-label">
              <span class="domain-dot" style="background: ${dObj.color};"></span>
              <span>${escapeHTML(dObj.name)}</span>
            </div>
            <span class="domain-count">${count}</span>
          </li>
        `;
      }).join('');
    }

    function filterByDomain(domainKey) {
      document.querySelectorAll('.domain-item').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-domain') === domainKey);
      });

      const select = document.getElementById('domain-filter-select');
      if (select) select.value = domainKey;

      applyGraphFilters();
    }

    function applyGraphFilters() {
      const domFilter = document.getElementById('domain-filter-select').value;
      const diffFilter = document.getElementById('diff-filter-select').value;

      nodeElements.each(function(d) {
        const g = d3.select(this);
        const matchesDom = domFilter === 'ALL' || d.domain === domFilter || d.level === 0;
        const matchesDiff = diffFilter === 'ALL' || d.difficulty === diffFilter || d.level === 0;

        if (matchesDom && matchesDiff) {
          g.style("display", "block");
        } else {
          g.style("display", "none");
        }
      });

      linkElements.each(function(l) {
        const edge = d3.select(this);
        const sourceMatches = domFilter === 'ALL' || l.source.domain === domFilter || l.source.level === 0;
        const targetMatches = domFilter === 'ALL' || l.target.domain === domFilter || l.target.level === 0;
        const diffMatches = diffFilter === 'ALL' || l.target.difficulty === diffFilter || l.target.level === 0;

        if (sourceMatches && targetMatches && diffMatches) {
          edge.style("display", "block");
        } else {
          edge.style("display", "none");
        }
      });
    }

    // LISTENERS FOR FILTERS
    document.getElementById('domain-filter-select').addEventListener('change', (e) => {
      const domKey = e.target.value;
      document.querySelectorAll('.domain-item').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-domain') === domKey);
      });
      applyGraphFilters();
    });

    document.getElementById('diff-filter-select').addEventListener('change', () => {
      applyGraphFilters();
    });

    // ZOOM TOOLBAR BUTTONS
    document.getElementById('btn-zoom-in').addEventListener('click', () => {
      svg.transition().duration(250).call(zoom.scaleBy, 1.3);
    });

    document.getElementById('btn-zoom-out').addEventListener('click', () => {
      svg.transition().duration(250).call(zoom.scaleBy, 0.7);
    });

    document.getElementById('btn-zoom-reset').addEventListener('click', resetGraphView);
    document.getElementById('btn-reset-view').addEventListener('click', resetGraphView);

    // THEME TOGGLE
    document.getElementById('btn-theme-toggle').addEventListener('click', () => {
      const html = document.documentElement;
      if (html.classList.contains('theme-dark')) {
        html.classList.remove('theme-dark');
        html.classList.add('theme-light');
        localStorage.setItem('mindmap_theme', 'light');
      } else {
        html.classList.remove('theme-light');
        html.classList.add('theme-dark');
        localStorage.setItem('mindmap_theme', 'dark');
      }
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('mindmap_theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('theme-dark');
      document.documentElement.classList.add('theme-light');
    }

    // COMMAND PALETTE MODAL (⌘K)
    const paletteBackdrop = document.getElementById('palette-backdrop');
    const paletteInput = document.getElementById('palette-input');
    const paletteResults = document.getElementById('palette-results');

    function openPalette() {
      paletteBackdrop.classList.add('open');
      paletteInput.value = '';
      paletteInput.focus();
      renderPaletteResults('');
    }

    function closePalette() {
      paletteBackdrop.classList.remove('open');
    }

    document.getElementById('cmd-search-btn').addEventListener('click', openPalette);
    paletteBackdrop.addEventListener('click', (e) => {
      if (e.target === paletteBackdrop) closePalette();
    });

    paletteInput.addEventListener('input', (e) => {
      renderPaletteResults(e.target.value);
    });

    function renderPaletteResults(query) {
      const q = query.toLowerCase().trim();
      const matches = DATA_GRAPH.nodes.filter(n => {
        return !q || n.name.toLowerCase().includes(q) || (n.description || '').toLowerCase().includes(q);
      }).slice(0, 12);

      paletteResults.innerHTML = matches.map(n => `
        <li class="palette-item" onclick="selectNode('${n.id}'); centerCameraOnNode(nodesMap.get('${n.id}')); closePalette();">
          <span class="palette-item-name">${escapeHTML(n.name)}</span>
          <span class="palette-item-domain">${escapeHTML(DOMAIN_TOKENS[n.domain] ? DOMAIN_TOKENS[n.domain].name : n.domain)}</span>
        </li>
      `).join('');
    }

    // KEYBOARD SHORTCUTS
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openPalette();
      } else if (e.key === 'Escape') {
        closePalette();
        document.getElementById('list-view-overlay').classList.remove('open');
      } else if (e.key === 'r' || e.key === 'R') {
        if (document.activeElement.tagName !== 'INPUT') {
          resetGraphView();
        }
      } else if (e.key === 'l' || e.key === 'L') {
        if (document.activeElement.tagName !== 'INPUT') {
          toggleListView();
        }
      }
    });

    // ACCESSIBLE LIST VIEW
    const listViewOverlay = document.getElementById('list-view-overlay');
    document.getElementById('btn-close-list-view').addEventListener('click', () => {
      listViewOverlay.classList.remove('open');
    });

    function toggleListView() {
      const isOpen = listViewOverlay.classList.contains('open');
      if (isOpen) {
        listViewOverlay.classList.remove('open');
      } else {
        listViewOverlay.classList.add('open');
        renderListView();
      }
    }

    function renderListView() {
      const ul = document.getElementById('list-view-ul');
      ul.innerHTML = DATA_GRAPH.nodes.map(n => `
        <li style="background: var(--bg-elevated); border: 1px solid var(--line); border-radius: 12px; padding: 16px;">
          <div style="font-weight: 700; font-size: 1rem; color: var(--text-primary);">${escapeHTML(n.name)}</div>
          <div style="font-size: 0.75rem; color: var(--accent); margin: 4px 0;">${escapeHTML(DOMAIN_TOKENS[n.domain] ? DOMAIN_TOKENS[n.domain].name : n.domain)}</div>
          <p style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 6px;">${escapeHTML(n.description || '')}</p>
        </li>
      `).join('');
    }

    // UTILS
    function escapeHTML(str) {
      if (!str) return '';
      return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      })[m]);
    }

    // INIT
    renderDomainSidebar();
    updateProgressPill();
    resetGraphView();
    selectNode('root');
  </script>
</body>
</html>
"""

# Write to data-engineering-mindmap/index.html
target_file_1 = os.path.join(base_dir, 'data-engineering-mindmap', 'index.html')
with open(target_file_1, 'w', encoding='utf-8') as f:
    f.write(apple_jelly_template)

# Write to data-engineering-mindmap.html
target_file_2 = os.path.join(base_dir, 'data-engineering-mindmap.html')
with open(target_file_2, 'w', encoding='utf-8') as f:
    f.write(apple_jelly_template)

print("Successfully applied jelly physics & Apple curved design to mindmap!")
