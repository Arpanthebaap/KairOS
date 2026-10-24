# KairOS Architecture Specification

## 1. System Overview

KairOS is a **research-grade neuro-symbolic multi-agent architecture** engineered for spatiotemporal event synthesis, bounded resource knapsack optimization, biophysical safety verification, and operational vendor procurement.

```
                           +----------------------------------------+
                           |           User Specifications          |
                           |  (Archetype, Budget, Date, Traditions) |
                           +----------------------------------------+
                                               |
                                               v
+---------------------------------------------------------------------------------------------------+
|                                      Neuro-Symbolic Framework                                     |
|                                                                                                   |
|  [Creative GenAI Layer]                       [Deterministic Symbolic Core]                       |
|  - Google Gemini 2.5 Flash / Offline Fallback  - Spatiotemporal CPM DAG Solver (Kahn's Algorithm)  |
|  - Cultural & Thematic Synthesizer            - Bounded Knapsack Allocator (0.00% Drift)          |
|  - Vendor SLA & Legal Clause Agent            - Biophysical & Municipal Safety Governor           |
|  - Universal Storage & Memory Isolation       - Monte Carlo Contingency Engine (N=1,000)          |
|                                               - Runtime Validation & Defensive Type Guard System  |
+---------------------------------------------------------------------------------------------------+
                                               |
                                               v
+---------------------------------------------------------------------------------------------------+
|                                 Multi-Modal Delivery & Interfaces                                 |
|                                                                                                   |
|  - WCAG 2.1 AAA Accessible Web Studio (React, Custom Hooks, Tailwind CSS, TypeScript)             |
|  - Model Context Protocol (MCP v2025-11-25) JSON-RPC 2.0 In-Process Dispatcher                     |
|  - Export Engine (RFC 5545 iCalendar, RFC 4180 CSV, JSON Dossier, Print/PDF)                     |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Core Symbolic Solvers & Strategy Patterns

### 2.1 Spatiotemporal Critical Path Method (`src/core/cpm_solver.ts`, `src/core/scheduler_strategy.ts`)
Formulates event milestones as a Directed Acyclic Graph (DAG) $G = (V, E)$:
- **Strategy & Factory:** Decoupled via `ISchedulerStrategy`, `CPMSchedulerStrategy`, and `SchedulerFactory`.
- **Topological Order:** Computed via Kahn's algorithm in $\mathcal{O}(|V| + |E|)$ time. Detects directed cycles ($\text{indegree}(v) > 0$).
- **Forward Pass:**
  $$ES_j = \max_{i \in \text{Pred}(j)} EF_i, \quad EF_j = ES_j + D_j$$
- **Backward Pass:**
  $$LF_i = \min_{j \in \text{Succ}(i)} LS_j, \quad LS_i = LF_i - D_i$$
- **Total Float (Slack):**
  $$S_i = LS_i - ES_i = LF_i - EF_i$$
- **Critical Path:**
  $$\mathcal{CP} = \{i \in V \mid S_i = 0\}$$

### 2.2 Bounded Knapsack & Convex Resource Allocation (`src/core/knapsack_budget.ts`, `src/core/allocator_strategy.ts`)
Guarantees $0.00\%$ over-budget drift under non-linear tax and gratuity burdens:
- **Strategy & Factory:** Decoupled via `IResourceAllocatorStrategy`, `KnapsackAllocatorStrategy`, and `AllocatorFactory`.
- **Mathematical Formulation:**
  $$\max \sum_{i=1}^{K} U_i(c_i) \quad \text{s.t.} \quad \sum_{i=1}^{K} [c_i(1 + \tau_i + \gamma_i)] + R_{\text{cont}} \le B_{\text{total}}$$
Where:
- $c_i \ge \text{floor}_i$ (contractual minimum vendor floor)
- $R_{\text{cont}} \ge 0.10 \cdot B_{\text{total}}$ (mandatory emergency reserve)
- Overrun reduction gate enforces monotonicity down to base allocations.

### 2.3 Biophysical & Municipal Safety Governor (`src/core/safety_governor.ts`)
Audits 5 foundational safety axioms:
1. `INV-BUDGET-001`: $E_{\text{net}} \le B_{\text{total}}$
2. `INV-CONTINGENCY-002`: $R_{\text{cont}} \ge 0.10 \cdot B_{\text{total}}$
3. `INV-CURFEW-003`: $t_{\text{finish}} \le t_{\text{curfew}}$ for outdoor amplified sound ($\ge 70\text{ dBA}$)
4. `INV-HACCP-004`: Food temperature safety holding time $\Delta t \le 120\text{ minutes}$
5. `INV-ACOUSTIC-005`: Pairwise overlap prevention between loud ($\ge 80\text{ dBA}$) and solemn zones

Emits cryptographic verification receipts with verification hash tokens (`0xKAIROS-[HASH]`).

### 2.4 Monte Carlo Stochastic Disruption Engine (`src/core/monte_carlo_engine.ts`)
Simulates $N=1,000$ trials sampling from Gaussian and Exponential shock distributions:
- Rain onset delays: $\mathcal{N}(\mu=25, \sigma=10)$
- Vendor tardiness: $\text{Exp}(\lambda = 1/20)$
- Transit congestion: $\mathcal{N}(\mu=10, \sigma=5)$
- Computes $P_{95}$ critical delay buffer and Schedule Robustness Index ($\mathcal{R}_{\text{sched}}$).

### 2.5 Runtime Validation & Type Guard Subsystem (`src/core/guards.ts`)
Provides defensive schema verification contracts for untrusted data:
- Type predicates: `isRecord`, `isEventType`, `isVenueType`, `isMilestoneCategory`, `isTimelineMilestone`, `isEventConfig`, `isBudgetCategory`, `isBudgetOptimizationResult`, `isSafetyProofReceipt`, `isCompleteEventPlan`.
- Detailed configuration validation: `validateEventConfig` with granular boundary diagnostics.

---

## 3. Modular Architecture & React Hooks

To enforce the Single Responsibility Principle (SRP) and separation of concerns:
- **`src/services/storage_service.ts`:** Clean storage abstraction with memory fallback for sandboxed environments.
- **`src/core/knowledge_base.ts`:** Domain milestone graph seed generator and acoustic parameters.
- **`src/hooks/useKairOSPlan.ts`:** State machine orchestrating plan synthesis and knapsack optimization.
- **`src/hooks/useTabNavigation.ts`:** WAI-ARIA 1.2 roving tabindex keyboard navigation (`ArrowLeft`, `ArrowRight`, `Home`, `End`).
- **`src/hooks/useModalTrap.ts`:** Accessible modal focus trap and `Escape` keyboard dismissal.

---

## 4. Model Context Protocol (MCP) Integration

Implements the official MCP Specification (v2025-11-25) over JSON-RPC 2.0:
- `kairos_synthesize_event`: Full multi-agent event plan generation.
- `kairos_solve_budget_knapsack`: Deterministic bounded knapsack allocation.
- `kairos_compute_critical_path`: DAG CPM schedule analysis.
- `kairos_audit_spatiotemporal_safety`: Cryptographic 5-point safety invariant audit.
- `kairos_simulate_contingency_stress_test`: Monte Carlo perturbation stress testing.

---

## 5. Test Suite & Static Analysis Verification

The project is verified by a test suite of **93 tests across 16 Vitest suites**:
- `accessibility.test.ts`: WAI-ARIA 1.2 roving tabindex, bypass blocks, live regions, high contrast mode.
- `guards.test.ts`: Defensive type guards and configuration boundary validation.
- `cpm_solver.test.ts`: Forward/backward passes, float calculation, critical path, cycle detection.
- `knapsack_budget.test.ts`: 0.00% drift knapsack, tax/tip scaling, emergency liquidity reserve.
- `safety_governor.test.ts`: Invariant axioms, HACCP thermal windows, acoustic zoning.
- `monte_carlo_engine.test.ts`: Perturbation trials, confidence intervals, robustness index.
- `scheduler_strategy.test.ts` & `allocator_strategy.test.ts`: Strategy and Factory patterns.
- `storage_service.test.ts`: Memory isolation and storage resilience.
- `knowledge_base.test.ts`: Connected milestone DAGs across all event archetypes.
- `errors.test.ts`: Typed domain exception hierarchy.
- `cultural_ontology.test.ts` & `cultural_synthesizer.test.ts`: Liturgical schemas and narrative synthesis.
- `vendor_sla_agent.test.ts`: SLA clauses, force majeure, milestone checklists.
- `mcp_server.test.ts`: JSON-RPC 2.0 tools list and execution dispatcher.
- `gemini_client.test.ts`: Offline deterministic synthesis and API key caching.
