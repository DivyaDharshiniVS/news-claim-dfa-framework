# A Finite-State Framework for Tracking the Evolution of News Claims

> *"As stories evolve and perspectives grow, evidence reveals what we need to know."*

An interactive, academic implementation bridging **Theory of Computation (TOC)** with digital journalism and news verification. The application models the epistemic lifecycle of news reports as a formal **Deterministic Finite Automaton (DFA)**:

$$M = (Q, \Sigma, \delta, q_0, F)$$

Built strictly with **HTML5, CSS3, Vanilla JavaScript, SVG, and LocalStorage**, designed for direct deployment as a static website on **Vercel** or local inspection with zero backend dependencies.

---

## 1. Academic Theory of Computation Formulation

### Formal 5-Tuple Specification

$$M = (Q, \Sigma, \delta, q_0, F)$$

1. **Finite Set of States ($Q$):**
   * $Q_0$: **Original Claim** (Initial start state $q_0$)
   * $Q_1$: **Modified Claim** (Parameters or wording refined)
   * $Q_2$: **Supported Claim** (Corroborating empirical evidence logged)
   * $Q_3$: **Disputed Claim** (Contradictory evidence or refutation logged)
   * $Q_4$: **Verified Claim** (Formal verification criteria satisfied $\in F$)
   * $Q_5$: **Rejected Claim** (Irrefutably debunked / dead trap state)

2. **Input Alphabet ($\Sigma$):**
   * $a$: Claim Modification / Refinement
   * $b$: Ingestion of Corroborating Evidence
   * $c$: Ingestion of Contradictory Evidence
   * $d$: Verification Threshold Satisfied
   * $e$: Rejection / Debunking Threshold Satisfied

3. **Transition Function ($\delta: Q \times \Sigma \to Q$):**

| Current State $Q$ | $a$ (Modify) | $b$ (Support) | $c$ (Dispute) | $d$ (Verify) | $e$ (Reject) |
|:-----------------:|:------------:|:-------------:|:-------------:|:------------:|:------------:|
| **$Q_0$**         | $Q_1$        | $Q_2$         | $Q_3$         | $\emptyset$  | $\emptyset$  |
| **$Q_1$**         | $Q_1$        | $Q_2$         | $Q_3$         | $\emptyset$  | $\emptyset$  |
| **$Q_2$**         | $Q_1$        | $Q_2$         | $Q_3$         | **$Q_4$**    | $\emptyset$  |
| **$Q_3$**         | $Q_1$        | $Q_2$         | $Q_3$         | $\emptyset$  | **$Q_5$**    |
| **$Q_4$** (Accept)| $Q_1$        | $Q_4$         | $Q_3$         | $Q_4$        | $\emptyset$  |
| **$Q_5$** (Trap)  | $\emptyset$  | $\emptyset$   | $\emptyset$   | $\emptyset$  | $\emptyset$  |

4. **Initial State ($q_0$):**
   * $q_0 = Q_0$

5. **Set of Accepting States ($F$):**
   * $F = \{ Q_4 \}$

---

## 2. Interactive Application Architecture

The system features **six dedicated interactive workspaces** accessible via the top navigation bar:

### 1. SOURCE CODE
* Complete architectural overview of the client-side system.
* Readable code viewer displaying the actual implementation files (`script.js`, `index.html`, `style.css`), the DFA Transition Core, and String Acceptance logic.
* Copy-to-clipboard functionality with feedback toast.

### 2. MODULE 1 – Claim Structure & Baseline Formation
* Ingests news statements and extracts semantic tokens and entities.
* Establishes the computational baseline at state $q_0 = Q_0$.
* Circular vector state visualization highlighting the starting state with incoming marker.
* Preloaded real-world demonstration selector.

### 3. MODULE 2 – Claim Evolution & Finite-State Tracking (Core DFA)
* Working interactive vector SVG DFA graph displaying nodes $Q_0$ through $Q_5$.
* Active state highlighted with pulsating rings and animated transition arcs.
* Real-time manual transition dispatcher ($\sigma \in \{a, b, c, d, e\}$).
* Dynamic transition matrix highlighting active state rows and cells.
* Comprehensive chronological transition audit log $\delta(q_i, \sigma_k) \to q_{i+1}$.

### 4. MODULE 3 – Source Reliability & Evidence Mapping
* Institutional credibility weighting model ($0.45 \le w_i \le 0.95$).
* Directional stance categorization: Supporting ($+1.0$), Contradictory ($-1.0$), Neutral ($0.0$).
* Mathematical stance aggregation formula:
  $$\text{Score}_{\text{net}} = \frac{\sum (w_i \cdot s_i)}{\sum w_i}$$
* Interactive vector directed acyclic graph (DAG):
  $$\text{CLAIM} \longrightarrow \text{SOURCE} \longrightarrow \text{EVIDENCE} \longrightarrow \text{EVALUATION}$$
* Direct automated coupling that converts evidence scores into DFA transition symbols.

### 5. MODULE 4 – Evolution Analysis & TruthTrace Reporting
* Full chronological timeline of computational states traversed.
* Semantic delta comparison between original baseline ($Q_0$) and evolved claim.
* Verifiable audit certificate with formal mathematical proof of language membership.
* One-click download of the complete TruthTrace Report as a formatted `.txt` file or print export.

### 6. HOW IT RELATES TO THEORY OF COMPUTATION
* Educational guide detailing the correspondence between news lifecycle and formal language theory.
* **Interactive String Acceptance Engine**:
  * Tests arbitrary input strings $w \in \Sigma^*$ (e.g., `a b d`, `b d`, `c e`, `a d`).
  * Animated tape register with active read head pointer.
  * Real-time step-by-step execution.
  * Formal verdict: $w \in L(M)$ (Accepted) or $w \notin L(M)$ (Rejected / Halted).
* **NFA vs. DFA Interactive Simulation**:
  * Illustrates non-deterministic branching when conflicting breaking reports emerge concurrently.
  * Explains power set construction and subset determinization.
* Real-world justification for formal verification in news auditing.

---

## 3. Technology Stack & Constraints

* **Markup**: HTML5 Semantic Architecture
* **Styles**: Vanilla CSS3 (Custom Emerald & Champagne Gold Theme, Responsive Grid/Flexbox)
* **Scripting**: Vanilla JavaScript (ES6+, Object-Oriented Engine, Web Audio API synthesis)
* **Graphics**: Scalable Vector Graphics (SVG) with dynamic DOM manipulation
* **Persistence**: LocalStorage API
* **Backend**: None (100% Client-Side Static Architecture)
* **Frameworks/Dependencies**: Zero external npm libraries or Python dependencies

---

## 4. Preloaded Demonstrations

1. **Claim 1 (Public Policy)**:
   * *"A metropolitan council has announced a 100% zero-emission electric bus transit policy by 2028."*
   * Trace: $Q_0 \xrightarrow{b} Q_2 \xrightarrow{d} Q_4$ (Verified)
2. **Claim 2 (Science & Technology)**:
   * *"A research laboratory has synthesized a solid-state lithium battery reducing thermal degradation by 40%."*
   * Trace: $Q_0 \xrightarrow{a} Q_1 \xrightarrow{b} Q_2 \xrightarrow{d} Q_4$ (Verified Modified)
3. **Claim 3 (Education)**:
   * *"A national university has introduced an open-book policy for all final-year STEM examinations."*
   * Trace: $Q_0 \xrightarrow{c} Q_3 \xrightarrow{e} Q_5$ (Rejected / Falsified)

---

## 5. Deployment Instructions

### Local Execution
Simply open `index.html` in any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari):
```bash
# Double-click index.html or open via terminal
start index.html
```

### Deploying to Vercel
1. Push the repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: Finite-State Framework for Tracking News Claims"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com).
3. Click **Add New Project** and import your GitHub repository.
4. Leave Framework Preset as **Other** (Root directory: `./`).
5. Click **Deploy**. The static website will deploy in seconds with SSL enabled.

---

## 6. Academic Defense Notes

* **Determinism**: At any state $q \in Q$ and for any symbol $\sigma \in \Sigma$, $|\delta(q, \sigma)| \le 1$. No random or probabilistic state assignment exists.
* **Linear Time Complexity**: Parsing a verification string $w$ takes exactly $O(|w|)$ time.
* **Formal Language**: The language $L(M)$ accepted by the automaton represents all valid informational journeys that culminate in institutional verification.

---
*Created for academic evaluation in Theory of Computation (CS402).*
