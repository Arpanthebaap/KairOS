import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('WCAG 2.1 AAA & WAI-ARIA Accessibility Invariants', () => {
  const readComponent = (filename: string) => {
    return fs.readFileSync(path.resolve(__dirname, '../components', filename), 'utf-8');
  };

  const readApp = () => {
    return fs.readFileSync(path.resolve(__dirname, '../App.tsx'), 'utf-8');
  };

  const readIndexHtml = () => {
    return fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf-8');
  };

  const readCss = () => {
    return fs.readFileSync(path.resolve(__dirname, '../index.css'), 'utf-8');
  };

  it('verifies index.html specifies document lang and mobile viewport for accessibility', () => {
    const html = readIndexHtml();
    expect(html).toContain('lang="en"');
    expect(html).toContain('name="viewport"');
  });

  it('verifies Skip to Main Content bypass block link exists in App.tsx', () => {
    const appCode = readApp();
    expect(appCode).toContain('href="#main-content"');
    expect(appCode).toContain('Skip to main content');
    expect(appCode).toContain('sr-only');
    expect(appCode).toContain('focus:not-sr-only');
    expect(appCode).toContain('id="main-content"');
  });

  it('verifies WAI-ARIA 1.2 tablist roving tabindex and panel associations in App.tsx', () => {
    const appCode = readApp();
    expect(appCode).toContain('role="tablist"');
    expect(appCode).toContain('role="tab"');
    expect(appCode).toContain('role="tabpanel"');
    expect(appCode).toContain('aria-selected');
    expect(appCode).toContain('aria-controls');
    expect(appCode).toContain('aria-labelledby');
    expect(appCode).toContain('handleTabKeyDown'); // Arrow key navigation
  });

  it('verifies screen reader live regions (aria-live="polite") exist for dynamic state changes', () => {
    const appCode = readApp();
    expect(appCode).toContain('aria-live="polite"');
    expect(appCode).toContain('role="status"');
  });

  it('verifies modal dialogs adhere to WAI-ARIA dialog and focus specifications', () => {
    const headerCode = readComponent('Header.tsx');
    expect(headerCode).toContain('role="dialog"');
    expect(headerCode).toContain('aria-modal="true"');
    expect(headerCode).toContain('aria-labelledby');
    expect(headerCode).toContain("e.key === 'Escape'");

    const exportCode = readComponent('ExportModal.tsx');
    expect(exportCode).toContain('role="dialog"');
    expect(exportCode).toContain('aria-modal="true"');
    expect(exportCode).toContain("e.key === 'Escape'");

    const mcpCode = readComponent('McpInspector.tsx');
    expect(mcpCode).toContain('role="dialog"');
    expect(mcpCode).toContain('aria-modal="true"');
    expect(mcpCode).toContain("e.key === 'Escape'");
  });

  it('verifies form controls and range sliders feature explicit labels and ARIA slider semantics', () => {
    const wizardCode = readComponent('EventWizard.tsx');
    expect(wizardCode).toContain('htmlFor="event-title-input"');
    expect(wizardCode).toContain('id="event-title-input"');
    expect(wizardCode).toContain('htmlFor="event-budget-input"');
    expect(wizardCode).toContain('id="event-budget-input"');
    expect(wizardCode).toContain('role="radiogroup"');
    expect(wizardCode).toContain('role="radio"');

    const budgetCode = readComponent('BudgetOptimizer.tsx');
    expect(budgetCode).toContain('role="progressbar"');
    expect(budgetCode).toContain('aria-valuenow');
    expect(budgetCode).toContain('role="slider"');
    expect(budgetCode).toContain('aria-valuemin');
    expect(budgetCode).toContain('aria-valuemax');

    const stressCode = readComponent('StressSimulator.tsx');
    expect(stressCode).toContain('role="slider"');
    expect(stressCode).toContain('htmlFor="slider-rain-prob"');
    expect(stressCode).toContain('id="slider-rain-prob"');
  });

  it('verifies CSS contains reduced motion media query and screen-reader utility classes', () => {
    const css = readCss();
    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).toContain('.sr-only');
    expect(css).toContain('.focus\\:not-sr-only');
    expect(css).toContain(':focus-visible');
  });
});
