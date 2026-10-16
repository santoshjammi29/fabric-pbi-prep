import re

with open('src/app/guided-learning/page.tsx', 'r') as f:
    content = f.read()

# 1. Topic Selector Grid
content = content.replace(
    '''<div className="min-w-0">
                  <h3 className="text-xs font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors truncate">
                    {topic.label}
                  </h3>
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5 truncate">
                    {totalItems} items
                  </p>
                </div>''',
    '''<div className="min-w-0 flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors truncate">
                    {topic.label}
                  </h3>
                  <span className="text-[10px] text-[var(--muted-foreground)] shrink-0">
                    {totalItems} items
                  </span>
                </div>'''
)

# 2. Stats Strip
content = content.replace(
    '''<div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-xs">
              <div className="text-[var(--muted-foreground)]">
                {totalItemsCount} items · {getTopicCounts(selectedTopic).concepts} concepts · {getTopicCounts(selectedTopic).qa} Q&As · {getTopicCounts(selectedTopic).arch} architecture · Est. {Math.round(estTimeMins/60)}h {estTimeMins%60}m
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-semibold">{pctComplete}%</span>
                  <div className="h-1 w-24 bg-[var(--surface-3)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-150 ease-out"
                      style={{ width: `${pctComplete}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>''',
    '''<div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--muted-foreground)]">
              <div>
                {totalItemsCount} items · {getTopicCounts(selectedTopic).concepts} concepts · {getTopicCounts(selectedTopic).qa} Q&As · {getTopicCounts(selectedTopic).arch} architecture · Est. {Math.round(estTimeMins/60)}h {estTimeMins%60}m
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-semibold">{pctComplete}%</span>
                <div className="h-1 w-24 bg-[var(--surface-3)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all duration-150 ease-out"
                    style={{ width: `${pctComplete}%` }}
                  />
                </div>
              </div>
            </div>'''
)

# 3. Filter Bar
content = content.replace(
    '''<div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-auto sm:flex-1">''',
    '''<div className="flex items-center gap-2 overflow-x-auto scrollbar-none w-full">
              <div className="relative shrink-0 w-32 sm:w-48">'''
)

content = content.replace(
    '''className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-purple-500/50 transition-all duration-150"''',
    '''className="w-full pl-8 pr-2 py-0.5 rounded bg-[var(--surface-1)] border border-[var(--border)] text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-purple-500/50 transition-all duration-150"'''
)

content = content.replace(
    '''<div className="flex items-center gap-1 overflow-x-auto scrollbar-none w-full sm:w-auto">''',
    '''<div className="flex items-center gap-1 shrink-0">'''
)

content = content.replace(
    '''px-2.5 py-1 rounded-md text-[10px]''',
    '''px-2 py-0.5 rounded text-[10px]'''
)

content = content.replace(
    '''<div className="hidden sm:block w-px h-4 bg-[var(--border)] mx-1" />''',
    '''<div className="w-px h-3 bg-[var(--border)] mx-1 shrink-0" />'''
)

# 4. Checkbox w-4 h-4
content = content.replace(
    '''{isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}''',
    '''{isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}'''
)

# Write back
with open('src/app/guided-learning/page.tsx', 'w') as f:
    f.write(content)

print("Done")
