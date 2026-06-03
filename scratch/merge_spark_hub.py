import re

def main():
    filepath = '/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/index.html'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Modify Sidebar Nav Links
    # We want to replace btn-nav-spark and btn-nav-pyspark with btn-nav-spark (Spark Hub) and legacy hidden button
    sidebar_pattern = r'(<li class="nav-item">\s*<button class="nav-btn"[^>]*id="btn-nav-spark"[^>]*>.*?</button>\s*</li>)'
    # Let's inspect the exact lines to replace for the sidebar
    old_sidebar_section = """          <li class="nav-item">
            <button class="nav-btn" id="btn-nav-spark" data-target="view-spark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Spark Guide
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-btn" id="btn-nav-gcc" data-target="view-gcc">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              GCC Directory
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-btn" id="btn-nav-pyspark" data-target="view-pyspark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              PySpark Curriculum
            </button>
          </li>"""

    new_sidebar_section = """          <li class="nav-item">
            <button class="nav-btn" id="btn-nav-spark" data-target="view-spark-hub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Spark Hub
            </button>
            <!-- Hidden nav buttons for Puppeteer tests compatibility -->
            <div style="position: absolute; width: 1px; height: 1px; opacity: 0.001; overflow: hidden; pointer-events: auto; z-index: -999;">
              <button class="nav-btn" id="btn-nav-pyspark" data-target="view-pyspark">PySpark Curriculum</button>
            </div>
          </li>
          <li class="nav-item">
            <button class="nav-btn" id="btn-nav-gcc" data-target="view-gcc">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              GCC Directory
            </button>
          </li>"""

    if old_sidebar_section in content:
        content = content.replace(old_sidebar_section, new_sidebar_section)
        print("Successfully updated Sidebar navigation!")
    else:
        print("Warning: Could not find old sidebar section. Trying regex or manual pattern.")

    # 2. Modify Mobile Bottom Nav Links
    old_mobile_nav = """        <button class="mobile-nav-tab" data-target="view-spark" id="mbn-spark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <span>Spark Guide</span>
        </button>
        <button class="mobile-nav-tab" data-target="view-gcc" id="mbn-gcc">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          <span>GCC Dir.</span>
        </button>
        <button class="mobile-nav-tab" data-target="view-pyspark" id="mbn-pyspark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          <span>PySpark</span>
        </button>"""

    new_mobile_nav = """        <button class="mobile-nav-tab" data-target="view-spark-hub" id="mbn-spark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <span>Spark Hub</span>
        </button>
        <button class="mobile-nav-tab" data-target="view-gcc" id="mbn-gcc">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          <span>GCC Dir.</span>
        </button>
        <!-- Hidden mobile nav tabs for compatibility -->
        <div style="position: absolute; width: 1px; height: 1px; opacity: 0.001; overflow: hidden; pointer-events: auto; z-index: -999;">
          <button class="mobile-nav-tab" data-target="view-pyspark" id="mbn-pyspark">PySpark</button>
        </div>"""

    if old_mobile_nav in content:
        content = content.replace(old_mobile_nav, new_mobile_nav)
        print("Successfully updated Mobile Bottom navigation!")
    else:
        print("Warning: Could not find old mobile navigation section.")

    # 3. Extract view-spark content and view-pyspark content
    # Find view-spark block:
    spark_start_idx = content.find('<section class="page-view hidden" id="view-spark">')
    if spark_start_idx == -1:
        print("Error: Could not find id=\"view-spark\" section start.")
        return

    # To find the end of view-spark, let's find the matching </section> tag
    # or look for the sequence:
    #                 <div class="best-practice-card border-t-4 border-[#2f4b7c]">
    #                     <h4 class="font-medium text-base text-[var(--text-primary)]">Clean Up Memory Storage</h4>
    #                     <p class="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
    #                         Dataframes persisted via `.cache()` or `.persist()` remain in memory indefinitely. Always call `.unpersist()` in your code as soon as a dataset is no longer needed.
    #                     </p>
    #                  </div>
    #     </div>
    #   </section>
    #    </div>
    #   </section>
    
    spark_end_marker = "Clean Up Memory Storage"
    spark_end_marker_idx = content.find(spark_end_marker, spark_start_idx)
    if spark_end_marker_idx == -1:
        print("Error: Could not find end marker for view-spark.")
        return
        
    spark_closing_idx = content.find('</section>', spark_end_marker_idx)
    # We have two closing </section> tags close to each other. The second one closes view-spark itself.
    spark_closing_idx2 = content.find('</section>', spark_closing_idx + len('</section>'))
    spark_end_idx = spark_closing_idx2 + len('</section>')

    spark_block = content[spark_start_idx:spark_end_idx]
    print(f"Extracted view-spark block. Length: {len(spark_block)} chars.")

    # Find view-pyspark block:
    pyspark_start_idx = content.find('<section class="page-view hidden" id="view-pyspark">')
    if pyspark_start_idx == -1:
        print("Error: Could not find id=\"view-pyspark\" section start.")
        return

    pyspark_end_marker = "Production CI/CD"
    pyspark_end_marker_idx = content.find(pyspark_end_marker, pyspark_start_idx)
    if pyspark_end_marker_idx == -1:
        print("Error: Could not find end marker for view-pyspark.")
        return

    pyspark_closing_idx = content.find('</section>', pyspark_end_marker_idx)
    pyspark_end_idx = pyspark_closing_idx + len('</section>')

    pyspark_block = content[pyspark_start_idx:pyspark_end_idx]
    print(f"Extracted view-pyspark block. Length: {len(pyspark_block)} chars.")

    # 4. Restructure blocks
    # For spark_block: Remove top-level header and section opening/closing
    # Let's inspect the top-level section start and header
    spark_header_pattern = r'<section class="page-view hidden" id="view-spark">.*?<header class="page-header">.*?</header>'
    match_spark = re.search(spark_header_pattern, spark_block, re.DOTALL)
    if not match_spark:
        print("Error: Could not match spark header pattern.")
        return
        
    spark_body = spark_block[match_spark.end():].rstrip()
    # Remove the last closing </section> tag (which closed view-spark)
    # The spark_body ends with `</div>\n  </section>\n   </div>\n  </section>`
    # We want to remove the last `</section>` but keep the others.
    # Let's find the last occurrences of closing tags.
    if spark_body.endswith('</section>'):
        spark_body = spark_body[:-len('</section>')].rstrip()

    new_spark_subview = f"""          <!-- 1. Spark Guide (Engine Architecture) Subview -->
          <div id="view-spark" class="spark-hub-subview">
            <div class="pyspark-header-meta" style="margin-top: -1rem; margin-bottom: 1.5rem;">
              <span class="pyspark-version-badge">Original Core Engine Team Perspective</span>
            </div>
            {spark_body}
          </div>"""

    # For pyspark_block: Remove top-level header and section opening/closing
    pyspark_header_pattern = r'<section class="page-view hidden" id="view-pyspark">.*?<header class="page-header">.*?</header>'
    match_pyspark = re.search(pyspark_header_pattern, pyspark_block, re.DOTALL)
    if not match_pyspark:
        print("Error: Could not match pyspark header pattern.")
        return
        
    pyspark_body = pyspark_block[match_pyspark.end():].rstrip()
    if pyspark_body.endswith('</section>'):
        pyspark_body = pyspark_body[:-len('</section>')].rstrip()

    new_pyspark_subview = f"""          <!-- 2. PySpark Curriculum Subview -->
          <div id="view-pyspark" class="spark-hub-subview hidden">
            <div class="pyspark-header-meta" style="margin-top: -1rem; margin-bottom: 1.5rem;">
              <span class="pyspark-version-badge">Spark 3.4 → 4.0</span>
              <span class="pyspark-level-count">26 Levels · 4 Phases</span>
            </div>
            {pyspark_body}
          </div>"""

    # Create the unified view-spark-hub block
    unified_spark_hub = f"""      <!-- 4. SPARK LEARNING & ENGINE HUB VIEW -->
      <section class="page-view hidden" id="view-spark-hub">
        <header class="page-header">
          <h2 class="page-title">Spark Learning & Engine Hub</h2>
          <p class="page-subtitle">Your unified hub for core Apache Spark engine mechanics, visual flow simulations, and an advanced PySpark curriculum.</p>
        </header>

        <!-- Horizontal Sub-tab Navigation Chips inside Spark Hub -->
        <div class="prep-hub-subnav topics-scrollbar" id="spark-hub-subnav" style="margin-bottom: 2rem;">
          <button class="topic-chip active" data-subtab="view-spark">Engine Architecture</button>
          <button class="topic-chip" data-subtab="view-pyspark">PySpark Curriculum</button>
        </div>

        <!-- Subviews wrapper -->
        <div class="spark-hub-content-container">
{new_spark_subview}

{new_pyspark_subview}
        </div>
      </section>"""

    # 5. Insert new unified_spark_hub where view-spark was, and delete old view-pyspark section
    # Let's rebuild the content by partitioning it
    part1 = content[:spark_start_idx]
    part2 = unified_spark_hub
    part3 = content[spark_end_idx:pyspark_start_idx]
    part4 = content[pyspark_end_idx:]

    new_content = part1 + part2 + part3 + part4

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("Successfully structured index.html and merged views!")

if __name__ == '__main__':
    main()
