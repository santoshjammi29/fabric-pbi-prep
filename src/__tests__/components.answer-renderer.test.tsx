import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnswerRenderer } from '@/components/ui/answer-renderer';

describe('AnswerRenderer component', () => {
  const samplePhasedAnswer = `### Phase 1: Conceptual Foundation & Core Architecture
Designing a DAG system requires topological ordering and state management.

### Phase 2: Low-Level Mechanics & Implementation
1. **Define Graph**: Create task nodes in Python.
2. **Implementation Snippet**:
\`\`\`python
from graphlib import TopologicalSorter
ts = TopologicalSorter()
ts.add('load', 'transform')
\`\`\`

### Phase 3: Production Hardening & Gotchas
- **Cycle Deadlocks**: Catch loop dependencies in static validation. *Remediation*: Run DAG cycle checker in CI.
- **Partial Failures**: Ensure task idempotency. *Remediation*: Use upserts instead of appends.`;

  it('renders all three architectural phases with badges', () => {
    render(<AnswerRenderer text={samplePhasedAnswer} />);

    expect(screen.getByText(/PHASE 1 · CORE ARCHITECTURE/i)).toBeDefined();
    expect(screen.getByText(/PHASE 2 · PRODUCTION IMPLEMENTATION/i)).toBeDefined();
    expect(screen.getByText(/PHASE 3 · HARDENING, EDGE CASES/i)).toBeDefined();
  });

  it('renders code snippet with syntax highlighting and action buttons', () => {
    render(<AnswerRenderer text={samplePhasedAnswer} />);

    expect(screen.getAllByText('TopologicalSorter').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Copy')).toBeDefined();
  });

  it('renders Phase 3 gotchas with mitigation badges', () => {
    render(<AnswerRenderer text={samplePhasedAnswer} />);

    expect(screen.getByText(/Cycle Deadlocks/)).toBeDefined();
    expect(screen.getByText(/Run DAG cycle checker in CI/)).toBeDefined();
    const mitigations = screen.getAllByText(/Mitigation:/i);
    expect(mitigations.length).toBe(2);
  });

  it('gracefully renders standard non-phased markdown', () => {
    const rawMarkdown = `This is a simple answer explaining **Kafka partitions**.

\`\`\`python
from confluent_kafka import Producer
p = Producer({'bootstrap.servers': 'localhost:9092'})
\`\`\`
`;
    render(<AnswerRenderer text={rawMarkdown} />);

    expect(screen.getByText(/Kafka partitions/i)).toBeDefined();
    expect(screen.getByText(/confluent_kafka/)).toBeDefined();
    expect(screen.getByText(/localhost/)).toBeDefined();
  });

  it('renders numbered lists inline without dropping paragraphs onto separate lines', () => {
    const looseListMarkdown = `1. Conditions for Failure: The target resource has private endpoint limit exhaustion.

2. Timeouts: Azure allocates up to 20 minutes for private endpoint provisioning.

3. Bypassing the Timeout: Pre-create and validate private endpoints before scheduling.`;

    const { container } = render(<AnswerRenderer text={looseListMarkdown} />);
    const ol = container.querySelector('ol');
    expect(ol).toBeDefined();
    expect(ol?.className).toContain('list-outside');
    expect(ol?.className).toContain('pl-5');

    const lis = container.querySelectorAll('li');
    expect(lis.length).toBe(3);
    lis.forEach((li) => {
      expect(li.className).toContain('[&>p:first-child]:inline');
      expect(li.className).toContain('[&>p]:my-0');
    });

    expect(screen.getByText(/Conditions for Failure/)).toBeDefined();
    expect(screen.getByText(/Timeouts/)).toBeDefined();
    expect(screen.getByText(/Bypassing the Timeout/)).toBeDefined();
  });
});
