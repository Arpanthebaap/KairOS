# KairOS Architecture Specification

## 1. System Overview

KairOS is a **neuro-symbolic multi-agent architecture** engineered for spatiotemporal event synthesis, bounded resource knapsack optimization, biophysical safety verification, and operational vendor procurement.

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
|                                               - Monte Carlo Contingency Engine (N=1,000)          |
+---------------------------------------------------------------------------------------------------+
                                               |
                                               v
+---------------------------------------------------------------------------------------------------+
|                                 Multi-Modal Delivery & Interfaces                                 |
|                                                                                                   |
|  - WCAG 2.1 AAA Accessible Web Studio (React, Tailwind CSS, TypeScript)                           |
|  - Model Context Protocol (MCP v2025-11-25) JSON-RPC 2.0 In-Process Dispatcher                     |
|  - Export Engine (RFC 5545 iCalendar, RFC 4180 CSV, JSON Dossier, Print/PDF)                     |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Core Symbolic Solvers

### 2.1 Spatiotemporal Critical Path Method (`src/core/cpm_solver.ts`)
Formulates event milestones as a Directed Acyclic Graph (DAG) $G = (V, E)$:
- **Topological Order:** Computed via Kahn's algorithm in $\mathcal{O}(|V| + |E|)$ time. Detects directed cycles ($\text{indegree}(v) > 0$).
- **Forward Pass:**
  $$ES_j = \max_{i \in \text{Pred}(j)} EF_i, \quad EF_j = ES_j + D_j$$
- **Backward Pass:**
  $$LF_i = \min_{j \in \text{Succ}(i)} LS_j, \quad LS_i = LF_i - D_i$$
- **Total Float (Slack):**
  $$S_i = LS_i - ES_i = LF_i - EF_i$$
- **Critical Path:**
  $$\mathcal{CP} = \{i \in V \mid S_i = 0\}$$

### 2.2 Bounded Knapsack & Convex Resource Allocation (`src/core/knapsack_budget.ts`)
Guarantees $0.00\%$ over-budget drift under non-linear tax and gratuity burdens:
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

---

## 3. Model Context Protocol (MCP) Integration

Implements the official MCP Specification (v2025-11-25) over JSON-RPC 2.0:
- `kairos_synthesize_event`: Full multi-agent event plan generation.
- `kairos_solve_budget_knapsack`: Deterministic bounded knapsack allocation.
- `kairos_compute_critical_path`: DAG CPM schedule analysis.
- `kairos_audit_spatiotemporal_safety`: Cryptographic 5-point safety invariant audit.
- `kairos_simulate_contingency_stress_test`: Monte Carlo perturbation stress testing.
