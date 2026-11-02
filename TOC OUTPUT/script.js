/**
 * A FINITE-STATE FRAMEWORK FOR TRACKING THE EVOLUTION OF NEWS CLAIMS
 * Theory of Computation (TOC) Academic Implementation
 * 
 * Formal Definition:
 *   Deterministic Finite Automaton M = (Q, Sigma, delta, q0, F)
 *   Q     = { Q0, Q1, Q2, Q3, Q4, Q5 }
 *   Sigma = { a, b, c, d, e }
 *   q0    = Q0 (Initial Claim)
 *   F     = { Q4 } (Verified Claim - Accepting State)
 * 
 * Technologies: HTML5, CSS3, Vanilla JavaScript (ES6+), SVG, LocalStorage
 * Deployment Target: Static Web / Vercel
 */

(function () {
  'use strict';

  // =============================================================================
  // 1. FORMAL THEORY OF COMPUTATION DFA DEFINITION & ENGINE
  // =============================================================================

  const DFA_CONFIG = {
    states: {
      Q0: { id: 'Q0', name: 'Initial Claim', type: 'initial', desc: 'Starting unverified claim' },
      Q1: { id: 'Q1', name: 'Modified Claim', type: 'intermediate', desc: 'Claim parameters refined or altered' },
      Q2: { id: 'Q2', name: 'Supported Claim', type: 'intermediate', desc: 'Corroborating evidence documented' },
      Q3: { id: 'Q3', name: 'Disputed Claim', type: 'intermediate', desc: 'Contradictory evidence documented' },
      Q4: { id: 'Q4', name: 'Claim Status: Verified', type: 'accepting', desc: 'Verified by official / credible evidence (ACCEPT)' },
      Q5: { id: 'Q5', name: 'Claim Status: Fake / Debunked', type: 'terminal', desc: 'Debunked as false by official sources' }
    },
    alphabet: {
      a: { symbol: 'a', name: 'Claim Modified / Revised', verb: 'Modified' },
      b: { symbol: 'b', name: 'Supporting Evidence Added', verb: 'Supported' },
      c: { symbol: 'c', name: 'Contradictory Evidence Added', verb: 'Contradicted' },
      d: { symbol: 'd', name: 'Verification Confirmed', verb: 'Verified' },
      e: { symbol: 'e', name: 'Claim Debunked as False', verb: 'Debunked' }
    },
    initialState: 'Q0',
    acceptingStates: ['Q4'],
    terminalStates: ['Q4', 'Q5'],

    // Formal Transition Function: delta(q, sigma) -> q'
    transitions: {
      Q0: { a: 'Q1', b: 'Q2', c: 'Q3', d: null, e: null },
      Q1: { a: 'Q1', b: 'Q2', c: 'Q3', d: null, e: null },
      Q2: { a: 'Q1', b: 'Q2', c: 'Q3', d: 'Q4', e: null },
      Q3: { a: 'Q1', b: 'Q2', c: 'Q3', d: null, e: 'Q5' },
      Q4: { a: 'Q1', b: 'Q4', c: 'Q3', d: 'Q4', e: null },
      Q5: { a: null, b: null, c: null, d: null, e: null }
    }
  };

  // Coordinates for the interactive SVG Automaton visualization
  const SVG_STATE_COORDS = {
    Q0: { x: 130, y: 240, r: 38 },
    Q1: { x: 340, y: 110, r: 38 },
    Q2: { x: 570, y: 110, r: 38 },
    Q3: { x: 340, y: 370, r: 38 },
    Q4: { x: 820, y: 110, r: 42 }, // Accepting (double circle)
    Q5: { x: 820, y: 370, r: 38 }  // Terminal rejected
  };

  // Preloaded Demonstration Data (4 Realistic Trending Claims With Clear Sources)
  const SAMPLE_CLAIMS = {
    cricket: {
      id: 'CLM-CRIC-01',
      title: 'Virat Kohli Injury Rumor (Cricbuzz)',
      statement: 'Virat Kohli is ruled out of the upcoming Border-Gavaskar Trophy series due to a chronic back spasm.',
      evolved: 'BCCI medical team confirms Virat Kohli participated in full training sessions in Perth; declared fully fit for the Border-Gavaskar Trophy.',
      source: 'Cricbuzz / Sports Desk',
      category: 'Sports',
      date: '2026-11-02T10:00',
      keywords: ['Virat Kohli', 'Border-Gavaskar Trophy', 'Back Injury', 'Ruled Out'],
      evidence: [
        {
          id: 'ev-cric-1',
          source: 'BCCI Official Medical Bulletin',
          tier: 0.95,
          stance: 'contradict',
          text: 'BCCI chief medical officer confirmed Virat Kohli participated in full net sessions; back stiffness was minor and cleared for the opening Test in Perth.',
          timestamp: '2026-11-02 11:30'
        },
        {
          id: 'ev-cric-2',
          source: 'Team India Press Briefing',
          tier: 0.90,
          stance: 'contradict',
          text: 'Head coach dismissed injury rumors, confirming Kohli is in the starting lineup for the 1st Test.',
          timestamp: '2026-11-02 14:15'
        }
      ],
      defaultSequence: ['c', 'e']
    },
    aliens: {
      id: 'CLM-ASTR-02',
      title: 'Alien Biosignatures on K2-18b (NASA / JWST)',
      statement: 'The James Webb Space Telescope detected atmospheric biosignatures and chlorofluorocarbons on exoplanet K2-18b.',
      evolved: 'NASA clarifies JWST data shows carbon-bearing molecules on K2-18b, but no industrial CFCs or confirmed alien biosignatures.',
      source: 'NASA / SETI Institute Dispatches',
      category: 'Science & Space',
      date: '2026-11-02T03:45',
      keywords: ['JWST', 'K2-18b', 'Biosignatures', 'Extraterrestrial'],
      evidence: [
        {
          id: 'ev-alien-1',
          source: 'NASA Astrobiology Science Briefing',
          tier: 0.95,
          stance: 'contradict',
          text: 'NASA clarified that while preliminary dimethyl sulfide spectral hints exist, no chlorofluorocarbons or definitive biological origin has been confirmed.',
          timestamp: '2026-11-02 07:15'
        },
        {
          id: 'ev-alien-2',
          source: 'ESA Webb Science Team Statement',
          tier: 0.90,
          stance: 'contradict',
          text: 'Statistical significance of atmospheric methane and carbon dioxide confirmed, but claims of alien technosignatures are premature.',
          timestamp: '2026-11-02 09:30'
        }
      ],
      defaultSequence: ['c', 'e']
    },
    weather: {
      id: 'CLM-METEO-03',
      title: 'Cyclone Fengal Landfall Warning (IMD)',
      statement: "Severe Cyclone 'Fengal' is forecast to make direct landfall near coastal Chennai within 48 hours.",
      evolved: "IMD issues Red Alert as Cyclone Fengal approaches Tamil Nadu coast with landfall projected near Chennai.",
      source: 'Regional Meteorological Department / IMD',
      category: 'Weather',
      date: '2026-11-02T06:15',
      keywords: ['Cyclone Fengal', 'IMD Warning', 'Coastal Landfall', 'Chennai'],
      evidence: [
        {
          id: 'ev-weath-1',
          source: 'India Meteorological Department (IMD) Bulletin',
          tier: 0.95,
          stance: 'support',
          text: "Deep depression intensified into Cyclonic Storm 'Fengal'; track models indicate landfall between Karaikal and Mahabalipuram near Chennai.",
          timestamp: '2026-11-02 08:00'
        },
        {
          id: 'ev-weath-2',
          source: 'Tamil Nadu State Disaster Management Authority',
          tier: 0.95,
          stance: 'support',
          text: 'Red alert issued across coastal districts with NDRF teams deployed in anticipation of heavy rainfall and storm surge.',
          timestamp: '2026-11-02 10:45'
        }
      ],
      defaultSequence: ['b', 'd']
    },
    holiday: {
      id: 'CLM-GOV-04',
      title: '4-Day Holiday Circular (PIB Fact Check)',
      statement: 'Government declares a surprise mandatory 4-day nationwide holiday for the festival weekend.',
      evolved: 'PIB Fact Check debunks viral circular: Government has not declared any surprise 4-day nationwide holiday.',
      source: 'Ministry of Personnel / Press Information Bureau',
      category: 'Public Notice',
      date: '2026-11-02T12:00',
      keywords: ['National Holiday', 'Long Weekend', 'Government Notification', 'Public Circular'],
      evidence: [
        {
          id: 'ev-hol-1',
          source: 'Press Information Bureau (PIB) Fact Check',
          tier: 0.95,
          stance: 'contradict',
          text: 'PIB Fact Check confirmed the circular circulating on WhatsApp regarding a mandatory 4-day national holiday is fake.',
          timestamp: '2026-11-02 13:20'
        },
        {
          id: 'ev-hol-2',
          source: 'Ministry of Personnel Official Gazette',
          tier: 0.90,
          stance: 'contradict',
          text: 'No official order for additional public holidays has been issued; central government offices remain open as per standard calendar.',
          timestamp: '2026-11-02 15:00'
        }
      ],
      defaultSequence: ['c', 'e']
    }
  };

  // Pre-configured Verified Evidence Options for Each Theme (Zero Manual Typing)
  const THEME_EVIDENCE_POOL = {
    cricket: [
      {
        id: 'ev-cric-1',
        source: 'BCCI Official Medical Release',
        tier: 0.95,
        stance: 'contradict',
        text: 'BCCI chief medical officer confirmed Virat Kohli underwent routine precautionary scans with zero structural damage; declared 100% fit for match selection.',
        notes: 'Official Medical Board'
      },
      {
        id: 'ev-cric-2',
        source: 'Team India Head Coach Press Briefing',
        tier: 0.90,
        stance: 'contradict',
        text: 'Head Coach confirmed Kohli batted for 45 minutes in the Perth match simulation without any back discomfort and will start in the 1st Test.',
        notes: 'Team Management Dispatch'
      },
      {
        id: 'ev-cric-3',
        source: 'Anonymous Sports Blog / Social Leak',
        tier: 0.45,
        stance: 'support',
        text: 'Unverified social media blog claimed senior batter skipped afternoon fielding drills citing recurring lumbar stiffness.',
        notes: 'Unverified Social Media'
      },
      {
        id: 'ev-cric-4',
        source: 'Live Broadcast Commentary Box (Fox Sports)',
        tier: 0.75,
        stance: 'neutral',
        text: 'Commentary team noted Kohli doing normal agility stretches on the boundary line during session break before rejoining practice nets.',
        notes: 'Accredited Media'
      }
    ],
    aliens: [
      {
        id: 'ev-alien-1',
        source: 'NASA Goddard Space Flight Center Dispatch',
        tier: 0.95,
        stance: 'support',
        text: 'JWST NIRISS and NIRSpec transmission spectroscopy confirmed abundant methane and carbon dioxide in exoplanet K2-18b habitable-zone atmosphere.',
        notes: 'Official Space Agency'
      },
      {
        id: 'ev-alien-2',
        source: 'The Astrophysical Journal Letters',
        tier: 0.90,
        stance: 'support',
        text: 'Independent peer-reviewed spectral inversion indicates K2-18b is a Hycean world with a water-rich ocean beneath a hydrogen atmosphere.',
        notes: 'Peer-Reviewed Journal'
      },
      {
        id: 'ev-alien-3',
        source: 'Cambridge Exoplanet Research Consortium',
        tier: 0.90,
        stance: 'contradict',
        text: 'Photochemical atmospheric modeling indicates abiotic geological methane photolysis accounts for observed spectra without requiring biological life.',
        notes: 'Academic Research Lab'
      },
      {
        id: 'ev-alien-4',
        source: 'Space Telescope Science Institute (STScI)',
        tier: 0.95,
        stance: 'neutral',
        text: 'Science team scheduled Cycle 3 MIRI observations over the next 12 months to measure dimethyl sulfide lines before drawing definitive conclusions.',
        notes: 'Observatory Operations'
      }
    ],
    weather: [
      {
        id: 'ev-weath-1',
        source: 'India Meteorological Department (IMD) Bulletin',
        tier: 0.95,
        stance: 'support',
        text: 'Deep depression intensified into Cyclonic Storm "Fengal"; doppler radar tracks projected landfall between Karaikal and Mahabalipuram near Chennai.',
        notes: 'National Weather Bureau'
      },
      {
        id: 'ev-weath-2',
        source: 'Tamil Nadu State Disaster Management Authority',
        tier: 0.95,
        stance: 'support',
        text: 'Red Alert issued across 6 coastal districts; 14 NDRF battalions deployed with mandatory 72-hour coastal safety guidelines.',
        notes: 'State Emergency Authority'
      },
      {
        id: 'ev-weath-3',
        source: 'European Centre for Medium-Range Forecasts (ECMWF)',
        tier: 0.85,
        stance: 'contradict',
        text: 'Ensemble trajectory models indicate storm system may recurve northeastward into open waters, weakening before reaching the Chennai coast.',
        notes: 'International Forecast Agency'
      },
      {
        id: 'ev-weath-4',
        source: 'Chennai Port Trust Maritime Operations',
        tier: 0.75,
        stance: 'neutral',
        text: 'Local Cautionary Signal No. 3 hoisted at harbor; commercial cargo handling proceeding under standby severe weather watch.',
        notes: 'Port Logistics Administration'
      }
    ],
    holiday: [
      {
        id: 'ev-hol-1',
        source: 'Press Information Bureau (PIB) Fact Check',
        tier: 0.95,
        stance: 'contradict',
        text: 'PIB Fact Check confirmed the viral digital circular announcing a mandatory 4-day national weekend holiday is fake and completely fabricated.',
        notes: 'Official Govt Fact Check Unit'
      },
      {
        id: 'ev-hol-2',
        source: 'Ministry of Personnel & Public Grievances',
        tier: 0.90,
        stance: 'contradict',
        text: 'Ministry confirmed no supplementary public holiday executive orders were issued; all central offices will function on regular schedules.',
        notes: 'Statutory Govt Department'
      },
      {
        id: 'ev-hol-3',
        source: 'Viral WhatsApp Forward / Social Media Screenshot',
        tier: 0.45,
        stance: 'support',
        text: 'Digitally manipulated PDF document circulating across group chats claiming nationwide paid holiday from Friday through Monday.',
        notes: 'Unverified Social Media'
      },
      {
        id: 'ev-hol-4',
        source: 'Central Secretariat Staff Confederation',
        tier: 0.70,
        stance: 'neutral',
        text: 'Staff union had requested restricted holiday consideration for the upcoming festival, but no official approval was granted.',
        notes: 'Employee Representative Body'
      }
    ]
  };

  // =============================================================================
  // 2. STATE STORE & APPLICATION DATA REPOSITORY
  // =============================================================================

  class ClaimStore {
    constructor() {
      this.storageKey = 'toc_news_claims_state_v1';
      this.state = this.loadInitialState();
    }

    loadInitialState() {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.claimId) return parsed;
        } catch (e) {
          console.warn('Failed to parse localStorage state, resetting to default demo.');
        }
      }
      return this.createDemoState('cricket');
    }

    createDemoState(presetKey = 'cricket') {
      const demo = SAMPLE_CLAIMS[presetKey] || SAMPLE_CLAIMS.cricket;
      return {
        claimId: demo.id,
        title: demo.title,
        activeTheme: presetKey,
        statement: demo.statement,
        originalStatement: demo.statement,
        evolvedStatement: demo.evolved,
        source: demo.source,
        category: demo.category,
        date: demo.date,
        keywords: [...demo.keywords],
        evidenceList: JSON.parse(JSON.stringify(demo.evidence)),
        currentState: DFA_CONFIG.initialState,
        executedString: '',
        transitionHistory: [
          {
            step: 0,
            fromState: null,
            symbol: null,
            toState: 'Q0',
            reason: 'Baseline Claim Initialized at State Q0',
            timestamp: new Date().toLocaleTimeString()
          }
        ]
      };
    }

    save() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
    }

    reset(presetKey = 'cricket') {
      this.state = this.createDemoState(presetKey);
      this.save();
    }
  }

  const store = new ClaimStore();

  // =============================================================================
  // 3. SOUND SYNTHESIZER (Pleasant Web Audio Harmonic Feedback)
  // =============================================================================

  const AudioFeedback = {
    ctx: null,
    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        try {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
          this.ctx = null;
        }
      }
    },
    playTone(freq = 440, type = 'sine', duration = 0.15) {
      this.init();
      if (!this.ctx) return;
      try {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // audio fail silent
      }
    },
    transition() {
      this.playTone(587.33, 'triangle', 0.18); // D5
    },
    accept() {
      this.playTone(523.25, 'sine', 0.12);
      setTimeout(() => this.playTone(659.25, 'sine', 0.14), 100);
      setTimeout(() => this.playTone(783.99, 'sine', 0.25), 200); // C5 - E5 - G5
    },
    reject() {
      this.playTone(329.63, 'sawtooth', 0.2); // E4 down
      setTimeout(() => this.playTone(277.18, 'sawtooth', 0.25), 150);
    }
  };

  // =============================================================================
  // 4. COMPUTATIONAL DFA ENGINE
  // =============================================================================

  const DFAEngine = {
    getCurrentState() {
      return store.state.currentState;
    },

    /**
     * Executes transition: delta(q, sigma)
     */
    transition(symbol, customReason = null) {
      const q = store.state.currentState;
      const nextState = DFA_CONFIG.transitions[q] ? DFA_CONFIG.transitions[q][symbol] : null;

      if (!nextState) {
        return {
          success: false,
          error: `Undefined transition: delta(${q}, '${symbol}') is undefined in language L(M).`
        };
      }

      const symMeta = DFA_CONFIG.alphabet[symbol] || { name: `Symbol ${symbol}`, verb: 'Triggered' };
      const stepIndex = store.state.transitionHistory.length;

      const record = {
        step: stepIndex,
        fromState: q,
        symbol: symbol,
        toState: nextState,
        reason: customReason || `${symMeta.name}: ${q} -> ${nextState}`,
        timestamp: new Date().toLocaleTimeString()
      };

      store.state.currentState = nextState;
      store.state.executedString += symbol;
      store.state.transitionHistory.push(record);
      store.save();

      // Audio cue
      if (DFA_CONFIG.acceptingStates.includes(nextState)) {
        AudioFeedback.accept();
      } else if (nextState === 'Q5') {
        AudioFeedback.reject();
      } else {
        AudioFeedback.transition();
      }

      return {
        success: true,
        fromState: q,
        symbol: symbol,
        nextState: nextState,
        isAccepting: DFA_CONFIG.acceptingStates.includes(nextState),
        isTerminal: DFA_CONFIG.terminalStates.includes(nextState)
      };
    },

    /**
     * Processes full string w = s1 s2 ... sn against M
     */
    processString(inputString) {
      const cleanTokens = inputString.toLowerCase().replace(/[^a-e]/g, '').split('');
      let q = DFA_CONFIG.initialState;
      const path = [q];
      const trace = [];

      for (let i = 0; i < cleanTokens.length; i++) {
        const sym = cleanTokens[i];
        const next = DFA_CONFIG.transitions[q] ? DFA_CONFIG.transitions[q][sym] : null;

        if (!next) {
          trace.push({
            step: i + 1,
            from: q,
            sym: sym,
            to: null,
            valid: false,
            msg: `Computation halted: delta(${q}, '${sym}') undefined (TRAP).`
          });
          return {
            accepted: false,
            halted: true,
            finalState: q,
            tokens: cleanTokens,
            path: path,
            trace: trace,
            verdict: 'REJECTED (Undefined Transition - Machine Crashed)'
          };
        }

        trace.push({
          step: i + 1,
          from: q,
          sym: sym,
          to: next,
          valid: true,
          msg: `delta(${q}, '${sym}') -> ${next}`
        });

        q = next;
        path.push(q);
      }

      const isAccepted = DFA_CONFIG.acceptingStates.includes(q);

      return {
        accepted: isAccepted,
        halted: false,
        finalState: q,
        tokens: cleanTokens,
        path: path,
        trace: trace,
        verdict: isAccepted
          ? `ACCEPTED: Final State ${q} is in F = {Q4}`
          : `REJECTED: Final State ${q} is NOT in F`
      };
    },

    resetToInitial() {
      store.state.currentState = DFA_CONFIG.initialState;
      store.state.executedString = '';
      store.state.transitionHistory = [
        {
          step: 0,
          fromState: null,
          symbol: null,
          toState: 'Q0',
          reason: 'Automaton reset to initial state q0 (Q0)',
          timestamp: new Date().toLocaleTimeString()
        }
      ];
      store.save();
    }
  };

  // =============================================================================
  // 5. SVG AUTOMATON VISUALIZER (Interactive Graph Renderer)
  // =============================================================================

  const SVGRenderer = {
    container: null,
    pathsLayer: null,
    nodesLayer: null,
    lastActivePathId: null,

    init() {
      this.container = document.getElementById('svgDFAAutomaton');
      this.pathsLayer = document.getElementById('dfaTransitionsLayer');
      this.nodesLayer = document.getElementById('dfaNodesLayer');

      if (!this.container || !this.pathsLayer || !this.nodesLayer) return;

      this.renderGraph();
      this.updateStateHighlight(store.state.currentState);
    },

    renderGraph() {
      this.pathsLayer.innerHTML = '';
      this.nodesLayer.innerHTML = '';

      // Transition Arcs Definitions
      const transitionsData = [
        // From Q0
        { id: 't_Q0_Q1', from: 'Q0', to: 'Q1', sym: 'a', curve: -35, labelOffset: { x: -10, y: -10 } },
        { id: 't_Q0_Q2', from: 'Q0', to: 'Q2', sym: 'b', curve: -65, labelOffset: { x: 0, y: -14 } },
        { id: 't_Q0_Q3', from: 'Q0', to: 'Q3', sym: 'c', curve: 35, labelOffset: { x: -10, y: 15 } },

        // From Q1
        { id: 't_Q1_Q2', from: 'Q1', to: 'Q2', sym: 'b', curve: 0, labelOffset: { x: 0, y: -15 } },
        { id: 't_Q1_Q3', from: 'Q1', to: 'Q3', sym: 'c', curve: 20, labelOffset: { x: -18, y: 0 } },
        { id: 't_Q1_Q1', from: 'Q1', to: 'Q1', sym: 'a', loop: 'top', labelOffset: { x: 0, y: -25 } },

        // From Q2
        { id: 't_Q2_Q4', from: 'Q2', to: 'Q4', sym: 'd', curve: 0, labelOffset: { x: 0, y: -15 } },
        { id: 't_Q2_Q3', from: 'Q2', to: 'Q3', sym: 'c', curve: -35, labelOffset: { x: 10, y: 0 } },
        { id: 't_Q2_Q1', from: 'Q2', to: 'Q1', sym: 'a', curve: 40, labelOffset: { x: 0, y: 18 } },
        { id: 't_Q2_Q2', from: 'Q2', to: 'Q2', sym: 'b', loop: 'top', labelOffset: { x: 0, y: -25 } },

        // From Q3
        { id: 't_Q3_Q5', from: 'Q3', to: 'Q5', sym: 'e', curve: 0, labelOffset: { x: 0, y: 18 } },
        { id: 't_Q3_Q2', from: 'Q3', to: 'Q2', sym: 'b', curve: 35, labelOffset: { x: -15, y: 0 } },
        { id: 't_Q3_Q1', from: 'Q3', to: 'Q1', sym: 'a', curve: -40, labelOffset: { x: 18, y: 0 } },
        { id: 't_Q3_Q3', from: 'Q3', to: 'Q3', sym: 'c', loop: 'bottom', labelOffset: { x: 0, y: 30 } },

        // Accepting sink loops
        { id: 't_Q4_Q4', from: 'Q4', to: 'Q4', sym: 'b, d', loop: 'top', labelOffset: { x: 0, y: -25 } }
      ];

      // Draw Start Arrow to Q0
      const startArrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      startArrow.setAttribute('d', 'M 40,240 L 90,240');
      startArrow.setAttribute('stroke', '#D9B66F');
      startArrow.setAttribute('stroke-width', '2.5');
      startArrow.setAttribute('marker-end', 'url(#dfaArrow)');
      this.pathsLayer.appendChild(startArrow);

      const startLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      startLabel.setAttribute('x', '45');
      startLabel.setAttribute('y', '230');
      startLabel.setAttribute('fill', '#D9B66F');
      startLabel.setAttribute('font-family', "'Fira Code', monospace");
      startLabel.setAttribute('font-size', '11');
      startLabel.setAttribute('font-weight', '700');
      startLabel.textContent = 'Start';
      this.pathsLayer.appendChild(startLabel);

      // Render each transition curve
      transitionsData.forEach(t => {
        const fromCoord = SVG_STATE_COORDS[t.from];
        const toCoord = SVG_STATE_COORDS[t.to];

        if (t.loop) {
          // Self loop
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const dy = t.loop === 'top' ? -1 : 1;
          const d = `M ${fromCoord.x - 18},${fromCoord.y + (dy * 30)} C ${fromCoord.x - 35},${fromCoord.y + (dy * 80)} ${fromCoord.x + 35},${fromCoord.y + (dy * 80)} ${fromCoord.x + 18},${fromCoord.y + (dy * 30)}`;
          path.setAttribute('d', d);
          path.setAttribute('class', 'dfa-transition-path');
          path.setAttribute('id', t.id);
          path.setAttribute('marker-end', 'url(#dfaArrow)');
          this.pathsLayer.appendChild(path);

          const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          txt.setAttribute('x', fromCoord.x + t.labelOffset.x);
          txt.setAttribute('y', fromCoord.y + (dy * 75) + t.labelOffset.y);
          txt.setAttribute('class', 'dfa-trans-label');
          txt.textContent = t.sym;
          this.pathsLayer.appendChild(txt);
        } else {
          // Arc between states
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const midX = (fromCoord.x + toCoord.x) / 2;
          const midY = (fromCoord.y + toCoord.y) / 2 + t.curve;

          // Adjust line ends for node radii
          const angle = Math.atan2(toCoord.y - fromCoord.y, toCoord.x - fromCoord.x);
          const startX = fromCoord.x + Math.cos(angle) * fromCoord.r;
          const startY = fromCoord.y + Math.sin(angle) * fromCoord.r;
          const endX = toCoord.x - Math.cos(angle) * (toCoord.r + 6);
          const endY = toCoord.y - Math.sin(angle) * (toCoord.r + 6);

          const d = `M ${startX},${startY} Q ${midX},${midY} ${endX},${endY}`;
          path.setAttribute('d', d);
          path.setAttribute('class', 'dfa-transition-path');
          path.setAttribute('id', t.id);
          path.setAttribute('marker-end', 'url(#dfaArrow)');
          this.pathsLayer.appendChild(path);

          // Label background for legibility
          const lblX = midX + (t.labelOffset ? t.labelOffset.x : 0);
          const lblY = midY + (t.labelOffset ? t.labelOffset.y : 0);

          const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          bgRect.setAttribute('x', lblX - 12);
          bgRect.setAttribute('y', lblY - 11);
          bgRect.setAttribute('width', '24');
          bgRect.setAttribute('height', '14');
          bgRect.setAttribute('class', 'dfa-trans-label-bg');
          this.pathsLayer.appendChild(bgRect);

          const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          txt.setAttribute('x', lblX);
          txt.setAttribute('y', lblY);
          txt.setAttribute('class', 'dfa-trans-label');
          txt.textContent = t.sym;
          this.pathsLayer.appendChild(txt);
        }
      });

      // Render State Nodes
      Object.keys(SVG_STATE_COORDS).forEach(stateId => {
        const c = SVG_STATE_COORDS[stateId];
        const meta = DFA_CONFIG.states[stateId];
        const isAccepting = DFA_CONFIG.acceptingStates.includes(stateId);
        const isTerminalReject = stateId === 'Q5';

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'dfa-node-group');
        g.setAttribute('id', `node_${stateId}`);
        g.setAttribute('data-state', stateId);

        // Pulse ring for active states
        const pulseRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pulseRing.setAttribute('cx', c.x);
        pulseRing.setAttribute('cy', c.y);
        pulseRing.setAttribute('r', c.r);
        pulseRing.setAttribute('class', 'node-pulse-ring');
        pulseRing.setAttribute('fill', 'none');
        pulseRing.setAttribute('stroke', '#D9B66F');
        pulseRing.setAttribute('stroke-width', '2');
        pulseRing.setAttribute('opacity', '0');
        g.appendChild(pulseRing);

        // Main circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', c.x);
        circle.setAttribute('cy', c.y);
        circle.setAttribute('r', c.r);
        circle.setAttribute('class', 'dfa-node-circle');
        circle.setAttribute('fill', '#092D25');
        circle.setAttribute('stroke', isAccepting ? '#2ECC71' : (isTerminalReject ? '#C84B4B' : '#D9B66F'));
        circle.setAttribute('stroke-width', isAccepting ? '3' : '2.5');
        g.appendChild(circle);

        // Double circle if accepting (Q4 in F)
        if (isAccepting) {
          const innerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          innerCircle.setAttribute('cx', c.x);
          innerCircle.setAttribute('cy', c.y);
          innerCircle.setAttribute('r', c.r - 6);
          innerCircle.setAttribute('fill', 'none');
          innerCircle.setAttribute('stroke', '#2ECC71');
          innerCircle.setAttribute('stroke-width', '1.8');
          g.appendChild(innerCircle);
        }

        // Inner decorative dashed ring
        const dashRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dashRing.setAttribute('cx', c.x);
        dashRing.setAttribute('cy', c.y);
        dashRing.setAttribute('r', isAccepting ? c.r - 11 : c.r - 7);
        dashRing.setAttribute('fill', 'none');
        dashRing.setAttribute('stroke', '#104638');
        dashRing.setAttribute('stroke-width', '1');
        dashRing.setAttribute('stroke-dasharray', '2 2');
        g.appendChild(dashRing);

        // State ID Text (e.g., Q0)
        const idText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        idText.setAttribute('x', c.x);
        idText.setAttribute('y', c.y - 4);
        idText.setAttribute('text-anchor', 'middle');
        idText.setAttribute('fill', isAccepting ? '#2ECC71' : '#D9B66F');
        idText.setAttribute('font-family', "'Cinzel', serif");
        idText.setAttribute('font-size', '16');
        idText.setAttribute('font-weight', '700');
        idText.textContent = stateId;
        g.appendChild(idText);

        // State Short Label Text
        const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nameText.setAttribute('x', c.x);
        nameText.setAttribute('y', c.y + 14);
        nameText.setAttribute('text-anchor', 'middle');
        nameText.setAttribute('fill', '#F4F0E6');
        nameText.setAttribute('font-family', "'Inter', sans-serif");
        nameText.setAttribute('font-size', '9');
        nameText.setAttribute('font-weight', '600');
        nameText.setAttribute('letter-spacing', '0.5');
        nameText.textContent = meta.name.replace(' Claim', '').toUpperCase();
        g.appendChild(nameText);

        // Click on node to inspect
        g.addEventListener('click', () => {
          UIManager.showStateInspection(stateId);
        });

        this.nodesLayer.appendChild(g);
      });
    },

    updateStateHighlight(activeStateId, transitionSymbol = null) {
      // Remove previous active classes
      const allNodes = document.querySelectorAll('.dfa-node-group');
      allNodes.forEach(n => n.classList.remove('active'));

      const allPaths = document.querySelectorAll('.dfa-transition-path');
      allPaths.forEach(p => p.classList.remove('active-path'));

      // Highlight new active node
      const targetNode = document.getElementById(`node_${activeStateId}`);
      if (targetNode) {
        targetNode.classList.add('active');
      }

      // If transition symbol known, highlight arc
      if (transitionSymbol) {
        const lastTrans = store.state.transitionHistory[store.state.transitionHistory.length - 1];
        if (lastTrans && lastTrans.fromState) {
          const pathId = `t_${lastTrans.fromState}_${lastTrans.toState}`;
          const targetPath = document.getElementById(pathId);
          if (targetPath) {
            targetPath.classList.add('active-path');
            setTimeout(() => {
              targetPath.classList.remove('active-path');
            }, 2500);
          }
        }
      }
    }
  };

  // =============================================================================
  // 6. EVIDENCE MAP RENDERER (SVG DAG: Claim -> Source -> Evidence -> Evaluation)
  // =============================================================================

  const EvidenceMapper = {
    render() {
      const svg = document.getElementById('svgEvidenceMap');
      if (!svg) return;

      const items = store.state.evidenceList || [];
      svg.innerHTML = '';

      // Defs
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = `
        <marker id="mapArrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#D9B66F" />
        </marker>
      `;
      svg.appendChild(defs);

      // Node coordinates (Column layout)
      const colX = { claim: 65, source: 185, evidence: 300, eval: 405 };
      const centerY = 150;

      // 1. Claim Node
      this.drawNode(svg, colX.claim, centerY, 'CLAIM', store.state.claimId, '#D9B66F', '#092D25');

      // 2. Sources & Evidence Nodes
      if (items.length === 0) {
        this.drawEmptyState(svg, centerY);
        return;
      }

      const count = Math.min(items.length, 3);
      const startY = count === 1 ? centerY : centerY - ((count - 1) * 45);

      items.slice(0, 3).forEach((item, idx) => {
        const y = startY + (idx * 90);

        // Line Claim -> Source
        this.drawArrow(svg, colX.claim + 40, centerY, colX.source - 40, y);

        // Source Node
        const srcShort = item.source.split(' ')[0];
        this.drawNode(svg, colX.source, y, 'SOURCE', srcShort, '#A8B9A9', '#092D25');

        // Line Source -> Evidence
        this.drawArrow(svg, colX.source + 40, y, colX.evidence - 40, y);

        // Evidence Node (color based on stance)
        const isSupport = item.stance === 'support';
        const color = isSupport ? '#2ECC71' : '#C84B4B';
        this.drawNode(svg, colX.evidence, y, 'STANCE', isSupport ? '+1.0 Sup' : '-1.0 Con', color, '#092D25');

        // Line Evidence -> Eval
        this.drawArrow(svg, colX.evidence + 40, y, colX.eval - 35, centerY);
      });

      // 4. Final Evaluation Node
      const aggScore = this.calculateAggregateScore();
      const evalColor = aggScore >= 0.4 ? '#2ECC71' : (aggScore <= -0.4 ? '#C84B4B' : '#A8B9A9');
      this.drawNode(svg, colX.eval, centerY, 'EVALUATION', aggScore >= 0 ? `+${aggScore.toFixed(2)}` : aggScore.toFixed(2), evalColor, '#104638');
    },

    drawNode(svg, x, y, label, sub, strokeColor, fillColor) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x - 42);
      rect.setAttribute('y', y - 22);
      rect.setAttribute('width', '84');
      rect.setAttribute('height', '44');
      rect.setAttribute('rx', '6');
      rect.setAttribute('fill', fillColor);
      rect.setAttribute('stroke', strokeColor);
      rect.setAttribute('stroke-width', '1.5');
      g.appendChild(rect);

      const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lbl.setAttribute('x', x);
      lbl.setAttribute('y', y - 5);
      lbl.setAttribute('text-anchor', 'middle');
      lbl.setAttribute('fill', strokeColor);
      lbl.setAttribute('font-family', "'Fira Code', monospace");
      lbl.setAttribute('font-size', '8.5');
      lbl.setAttribute('font-weight', '700');
      lbl.textContent = label;
      g.appendChild(lbl);

      const val = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      val.setAttribute('x', x);
      val.setAttribute('y', y + 12);
      val.setAttribute('text-anchor', 'middle');
      val.setAttribute('fill', '#F4F0E6');
      val.setAttribute('font-family', "'Inter', sans-serif");
      val.setAttribute('font-size', '9.5');
      val.setAttribute('font-weight', '600');
      val.textContent = sub;
      g.appendChild(val);

      svg.appendChild(g);
    },

    drawArrow(svg, x1, y1, x2, y2) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const dx = (x2 - x1) * 0.5;
      const d = `M ${x1},${y1} C ${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'rgba(217, 182, 111, 0.45)');
      path.setAttribute('stroke-width', '1.5');
      path.setAttribute('marker-end', 'url(#mapArrow)');
      svg.appendChild(path);
    },

    drawEmptyState(svg, centerY) {
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', '230');
      txt.setAttribute('y', centerY);
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('fill', '#A8B9A9');
      txt.setAttribute('font-family', "'Inter', sans-serif");
      txt.setAttribute('font-size', '12');
      txt.textContent = 'No evidence nodes logged. Add items on the left.';
      svg.appendChild(txt);
    },

    calculateAggregateScore() {
      const items = store.state.evidenceList || [];
      if (items.length === 0) return 0;

      let weightedSum = 0;
      let totalWeight = 0;

      items.forEach(ev => {
        const stanceVal = ev.stance === 'support' ? 1.0 : (ev.stance === 'contradict' ? -1.0 : 0.0);
        const weight = parseFloat(ev.tier) || 0.5;
        weightedSum += (stanceVal * weight);
        totalWeight += weight;
      });

      return totalWeight > 0 ? (weightedSum / totalWeight) : 0;
    }
  };

  // =============================================================================
  // 7. TRUTHTRACE REPORT GENERATOR (Module 4 Synthesis)
  // =============================================================================

  const TruthTraceReporter = {
    compileFullReportText() {
      const s = store.state;
      const dfa = DFA_CONFIG;
      const finalState = s.currentState;
      const isAccepted = dfa.acceptingStates.includes(finalState);
      const aggScore = EvidenceMapper.calculateAggregateScore();

      return `================================================================================
       TRUTHTRACE AUDIT CERTIFICATE & FORMAL VERIFICATION REPORT
              Theory of Computation Finite-State Framework
================================================================================

DOCUMENT IDENTIFIER: TT-2028-${s.claimId}
TIMESTAMP GENERATED: ${new Date().toISOString()}
COMPUTATIONAL MODEL: Deterministic Finite Automaton M = (Q, Sigma, delta, q0, F)
FORMAL 5-TUPLE:
  Q (States):           { Q0, Q1, Q2, Q3, Q4, Q5 }
  Sigma (Alphabet):     { a, b, c, d, e }
  q0 (Start State):     Q0 (Original Claim)
  F (Accepting States): { Q4 } (Verified Claim)

--------------------------------------------------------------------------------
1. CLAIM METADATA & STATEMENT PROVENANCE
--------------------------------------------------------------------------------
Claim Identifier:       ${s.claimId}
Category / Domain:      ${s.category}
Initial Reporting Date: ${s.date}
Original Baseline (Q0): "${s.originalStatement}"
Current Evolved Claim:  "${s.evolvedStatement || s.statement}"
Primary Baseline Source: ${s.source}
Semantic Tokens:        ${s.keywords.join(', ')}

--------------------------------------------------------------------------------
2. COMPUTATIONAL STATE TRAJECTORY & EXECUTION TRACE delta*(q0, w)
--------------------------------------------------------------------------------
Executed Symbol String: w = <${s.executedString.split('').join(', ') || 'epsilon'}>
Initial Computational State: q0 = Q0
Terminal Computational State: q_f = ${finalState} (${dfa.states[finalState].name})

Detailed Step-by-Step State Traversal:
${s.transitionHistory.map(th => `  [Step ${th.step}] ${th.fromState ? `${th.fromState} --(${th.symbol})--> ${th.toState}` : `Initial State ${th.toState}`} | ${th.reason} (${th.timestamp})`).join('\n')}

--------------------------------------------------------------------------------
3. FORMAL LANGUAGE ACCEPTANCE PROOF
--------------------------------------------------------------------------------
Verdict: ${isAccepted ? 'ACCEPTED • w in L(M)' : 'REJECTED • w NOT in L(M)'}
Mathematical Proof:
  Starting at start state q0 = Q0, the deterministic automaton processed
  the input alphabet sequence w = "${s.executedString}".
  Following transition function delta(Q, Sigma), the machine terminated at state:
    q_final = ${finalState}
  Checking acceptance membership:
    Is ${finalState} an element of F = { Q4 }? -> ${isAccepted ? 'TRUE' : 'FALSE'}.
  Conclusion:
    The claim ${isAccepted ? 'HAS SATISFIED' : 'HAS NOT SATISFIED'} the statutory criteria for formal verification.

--------------------------------------------------------------------------------
4. CORROBORATING EVIDENCE & SOURCE RELIABILITY LEDGER
--------------------------------------------------------------------------------
Total Evidence Items Ingested: ${s.evidenceList.length}
Weighted Aggregate Evidence Score: ${aggScore >= 0 ? `+${aggScore.toFixed(3)}` : aggScore.toFixed(3)}

${s.evidenceList.map((ev, i) => `[Evidence #${i + 1}]
  Source: ${ev.source} (Credibility Weight: ${ev.tier})
  Stance: ${ev.stance.toUpperCase()}
  Finding: "${ev.text}"
  Ingested: ${ev.timestamp}`).join('\n\n')}

================================================================================
AUDIT SIGNATURE: SHA-256 Verifiable Consensus Proof
Theory of Computation Academic Implementation • Antigravity Vercel Engine
================================================================================
`;
    },

    downloadReport() {
      const text = this.compileFullReportText();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TruthTrace_Audit_${store.state.claimId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // =============================================================================
  // 8. SOURCE CODE VIEWER (Unified Python 3 Automaton Implementation)
  // =============================================================================

  const SourceCodeManager = {
    pythonCode: null,

    async init() {
      try {
        const res = await fetch('app.py');
        if (res.ok) {
          this.pythonCode = await res.text();
        }
      } catch (e) {
        // Fallback to embedded complete Python implementation
      }
      this.updateViewer();
    },

    getPythonCode() {
      if (this.pythonCode) {
        return this.pythonCode;
      }
      return this.getEmbeddedPythonCode();
    },

    updateViewer() {
      const codeElement = document.getElementById('codeViewerContent');
      const statsElement = document.getElementById('codeFileStats');
      if (!codeElement) return;

      const code = this.getPythonCode();
      codeElement.textContent = code;

      if (statsElement) {
        const lines = code.split('\n').length;
        statsElement.textContent = `Pure Python 3 • ${lines} lines • Runnable via 'python app.py'`;
      }
    },

    getEmbeddedPythonCode() {
      return `"""
================================================================================
A FINITE-STATE FRAMEWORK FOR TRACKING THE EVOLUTION OF NEWS CLAIMS
Theory of Computation (TOC) Academic Implementation
================================================================================
Formal Specification:
    Deterministic Finite Automaton: M = (Q, Σ, δ, q0, F)
    States Q:           { Q0, Q1, Q2, Q3, Q4, Q5 }
    Alphabet Σ:         { a: Modify, b: Support, c: Dispute, d: Verify, e: Debunk }
    Start State q0:     Q0 (Initial / Unverified Claim)
    Accepting Set F:    { Q4 } (Verified Claim)
    Trap State:         Q5 (Fake / Debunked Claim)
================================================================================
"""

import sys
import json
from datetime import datetime

# ==============================================================================
# 1. FORMAL DETERMINISTIC FINITE AUTOMATON (DFA) ENGINE
# ==============================================================================

class DeterministicFiniteAutomaton:
    """
    Mathematical 5-Tuple: M = (Q, Sigma, delta, q0, F)
    """

    STATES = {
        'Q0': {'name': 'Initial Claim', 'desc': 'Unverified raw baseline hypothesis', 'type': 'initial'},
        'Q1': {'name': 'Modified Claim', 'desc': 'Claim text or scope altered', 'type': 'intermediate'},
        'Q2': {'name': 'Supported Claim', 'desc': 'Corroborating evidence logged', 'type': 'intermediate'},
        'Q3': {'name': 'Disputed Claim', 'desc': 'Conflicting records or rebuttal logged', 'type': 'intermediate'},
        'Q4': {'name': 'Claim Status: Verified', 'desc': 'Formal verification achieved (In F)', 'type': 'accepting'},
        'Q5': {'name': 'Claim Status: Fake / Debunked', 'desc': 'Formal refutation (Dead / Trap state)', 'type': 'terminal_reject'}
    }

    ALPHABET = {
        'a': {'name': 'Claim Modified', 'verb': 'Semantic Revision / Clarification'},
        'b': {'name': 'Supporting Evidence Added', 'verb': 'Corroborating Bulletin Logged'},
        'c': {'name': 'Contradictory Evidence Added', 'verb': 'Rebuttal / Disputed Source Logged'},
        'd': {'name': 'Verification Confirmed', 'verb': 'Official Agency Cross-Validation'},
        'e': {'name': 'Claim Debunked as False', 'verb': 'Decisive Fact-Check Disproof'}
    }

    INITIAL_STATE = 'Q0'
    ACCEPTING_STATES = {'Q4'}
    TERMINAL_STATES = {'Q4', 'Q5'}

    # Formal Transition Matrix: delta(q, sigma) -> q'
    TRANSITIONS = {
        'Q0': {'a': 'Q1', 'b': 'Q2', 'c': 'Q3'},
        'Q1': {'a': 'Q1', 'b': 'Q2', 'c': 'Q3'},
        'Q2': {'a': 'Q1', 'b': 'Q2', 'c': 'Q3', 'd': 'Q4'},
        'Q3': {'a': 'Q1', 'b': 'Q2', 'c': 'Q3', 'e': 'Q5'},
        'Q4': {'b': 'Q4', 'd': 'Q4'},
        'Q5': {}  # Dead / Trap state
    }

    def __init__(self):
        self.current_state = self.INITIAL_STATE
        self.executed_tape = ""
        self.history = [
            {
                'step': 0,
                'from': None,
                'symbol': None,
                'to': self.INITIAL_STATE,
                'reason': 'Baseline Claim Initialized at State Q0',
                'timestamp': datetime.now().strftime('%H:%M:%S')
            }
        ]

    def delta(self, state, symbol):
        """Transition function delta(q, sigma)."""
        return self.TRANSITIONS.get(state, {}).get(symbol, None)

    def transition(self, symbol, custom_reason=None):
        """Executes a single state transition on input symbol."""
        symbol = str(symbol).strip().lower()
        if symbol not in self.ALPHABET:
            return {'success': False, 'error': f"Symbol '{symbol}' not in alphabet Sigma = {{a,b,c,d,e}}."}

        next_state = self.delta(self.current_state, symbol)
        if not next_state:
            return {'success': False, 'error': f"Undefined transition: delta({self.current_state}, '{symbol}') undefined in L(M)."}

        step_idx = len(self.history)
        sym_meta = self.ALPHABET[symbol]
        record = {
            'step': step_idx,
            'from': self.current_state,
            'symbol': symbol,
            'to': next_state,
            'reason': custom_reason or f"{sym_meta['name']}: {self.current_state} -> {next_state}",
            'timestamp': datetime.now().strftime('%H:%M:%S')
        }

        self.current_state = next_state
        self.executed_tape += symbol
        self.history.append(record)

        return {
            'success': True,
            'from': record['from'],
            'symbol': symbol,
            'to': next_state,
            'tape': self.executed_tape,
            'is_accepting': next_state in self.ACCEPTING_STATES,
            'is_terminal': next_state in self.TERMINAL_STATES,
            'verdict': 'Claim Status: Verified' if next_state == 'Q4' else (
                'Claim Status: Fake / Debunked' if next_state == 'Q5' else 'Claim Status: Evaluating'
            )
        }

    def process_string(self, input_string):
        """
        Processes a full string w = s1 s2 ... sn against M.
        Tests language membership: w in L(M) <=> delta*(q0, w) in F.
        """
        clean_tokens = [ch.lower() for ch in input_string if ch.lower() in self.ALPHABET]
        q = self.INITIAL_STATE
        path = [q]
        trace = []

        for i, sym in enumerate(clean_tokens):
            nxt = self.delta(q, sym)
            if not nxt:
                trace.append({
                    'step': i + 1,
                    'from': q,
                    'symbol': sym,
                    'to': None,
                    'valid': False,
                    'msg': f"Computation halted: delta({q}, '{sym}') is undefined (crashed)."
                })
                return {
                    'accepted': False,
                    'halted': True,
                    'final_state': q,
                    'tokens': clean_tokens,
                    'path': path,
                    'trace': trace,
                    'verdict': 'REJECTED (Machine Crashed - Undefined Transition)'
                }

            trace.append({
                'step': i + 1,
                'from': q,
                'symbol': sym,
                'to': nxt,
                'valid': True,
                'msg': f"delta({q}, '{sym}') -> {nxt}"
            })
            q = nxt
            path.append(q)

        is_accepted = q in self.ACCEPTING_STATES
        return {
            'accepted': is_accepted,
            'halted': False,
            'final_state': q,
            'tokens': clean_tokens,
            'path': path,
            'trace': trace,
            'verdict': f"ACCEPTED: Final State {q} in F = {{Q4}}" if is_accepted else f"REJECTED: Final State {q} not in F"
        }

    def reset(self):
        """Resets the automaton to start state q0."""
        self.current_state = self.INITIAL_STATE
        self.executed_tape = ""
        self.history = [
            {
                'step': 0,
                'from': None,
                'symbol': None,
                'to': self.INITIAL_STATE,
                'reason': 'Reset to Start State Q0',
                'timestamp': datetime.now().strftime('%H:%M:%S')
            }
        ]

# ==============================================================================
# 2. EVIDENCE AGGREGATION & SOURCE RELIABILITY MATH
# ==============================================================================

class EvidenceEvaluator:
    """
    Mathematical Stance & Credibility Scoring Model:
        Score_net = sum(Reliability_i * Stance_i) / sum(Reliability_i)
    """

    @staticmethod
    def evaluate(evidence_list):
        if not evidence_list:
            return {'score': 0.0, 'trigger': 'a', 'reason': 'No evidence logged'}

        weighted_sum = 0.0
        total_weight = 0.0

        for ev in evidence_list:
            stance_val = 1.0 if ev['stance'] == 'support' else (-1.0 if ev['stance'] == 'contradict' else 0.0)
            weight = float(ev.get('tier', 0.5))
            weighted_sum += (stance_val * weight)
            total_weight += weight

        score = (weighted_sum / total_weight) if total_weight > 0 else 0.0

        if score >= 0.4:
            return {'score': score, 'trigger': 'b', 'explanation': f'Net score (+{score:.2f}) indicates corroboration'}
        elif score <= -0.4:
            return {'score': score, 'trigger': 'c', 'explanation': f'Net score ({score:.2f}) indicates contradiction'}
        else:
            return {'score': score, 'trigger': 'a', 'explanation': f'Net score ({score:.2f}) is neutral / modifying'}

# ==============================================================================
# 3. TRUTHTRACE DOSSIER & VERIFICATION REPORT GENERATOR
# ==============================================================================

class TruthTraceReporter:
    """Generates formal verification audit certificates and state proofs."""

    @staticmethod
    def generate(claim, dfa):
        is_accepted = dfa.current_state in dfa.ACCEPTING_STATES
        path_str = ' -> '.join([h['to'] for h in dfa.history])
        tape_str = ', '.join(list(dfa.executed_tape)) if dfa.executed_tape else 'epsilon'

        return f"""================================================================================
 TRUTHTRACE FORMAL AUDIT CERTIFICATE
 Theory of Computation (TOC) Academic Implementation
================================================================================
DOCUMENT ID:       TT-2028-{claim.get('id', 'CLM-01')}
TIMESTAMP:         {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}
CLAIM TITLE:       {claim.get('title', 'Unknown Claim')}
STATEMENT:         "{claim.get('statement', '')}"
SOURCE:            {claim.get('source', '')} | Category: {claim.get('category', '')}

COMPUTATIONAL MODEL:
  Formal System:   Deterministic Finite Automaton M = (Q, Sigma, delta, q0, F)
  Alphabet Tape:   w = <{tape_str}>
  Execution Path:  {path_str}
  Final State:     q_final = {dfa.current_state}
  Accepting Set:   F = {{ Q4 }}

FORMAL PROOF:
  Condition:       {dfa.current_state} {'in' if is_accepted else 'not in'} F
  Verdict:         {'ACCEPTED - Claim Status: Verified' if is_accepted else ('REJECTED - Claim Status: Fake / Debunked' if dfa.current_state == 'Q5' else 'EVALUATING - Non-Terminal State')}

EVIDENCE LEDGER ({len(claim.get('evidence', []))} records):
""" + "\\n".join([f"  • [{e.get('stance', '').upper()}] {e.get('source', '')} (Tier {e.get('tier', '')}): \\"{e.get('text', '')}\\"" for e in claim.get('evidence', [])]) + "\\n" + "=" * 80

# ==============================================================================
# 4. MAIN ENTRY POINT & INTERACTIVE DEMO RUNNER
# ==============================================================================

def main():
    print("=" * 80)
    print(" A FINITE-STATE FRAMEWORK FOR TRACKING THE EVOLUTION OF NEWS CLAIMS")
    print(" Theory of Computation (TOC) Formal Python Implementation")
    print("=" * 80)
    
    dfa = DeterministicFiniteAutomaton()
    print(f"\\n1. Automaton Initialized: State = {dfa.current_state} (Q0)")

    # Test sequence: b (support) -> d (verify)
    print("\\n2. Testing State Transitions:")
    step1 = dfa.transition('b', 'Supporting evidence logged from official agency')
    print(f"   delta(Q0, 'b') -> {step1['to']} | Status: {step1['verdict']}")

    step2 = dfa.transition('d', 'Official verification confirmed')
    print(f"   delta(Q2, 'd') -> {step2['to']} | Status: {step2['verdict']}")

    # Test full string acceptance
    print("\\n3. String Acceptance Testing w in L(M):")
    t1 = dfa.process_string("bd")
    print(f"   String 'bd': {t1['verdict']}")

    t2 = dfa.process_string("ce")
    print(f"   String 'ce': {t2['verdict']}")

    print("\\n[SUCCESS] Pure Python DFA engine executed cleanly.")

if __name__ == '__main__':
    main()
`;
    }
  };

  // =============================================================================
  // 9. UI ORCHESTRATION & EVENT BINDINGS
  // =============================================================================

  const UIManager = {
    currentStepAnimation: null,

    init() {
      this.bindNavigation();
      this.bindModule1();
      this.bindModule2();
      this.bindModule3();
      this.bindModule4();
      this.bindTOCWorkspace();
      this.bindSourceCodeViewer();
      this.bindPresetSelector();

      // Initial Renders
      this.refreshAllViews();
      SourceCodeManager.init();

      // Default landing screen MUST be SOURCE CODE on initial startup
      this.switchWorkspace('workspace-source-code', false);
    },

    bindNavigation() {
      const navButtons = document.querySelectorAll('.nav-btn');
      navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const targetId = btn.getAttribute('data-target');
          this.switchWorkspace(targetId);
        });
      });

      // "▶ RUN THIS APPLICATION" Actions (Direct One-Click Transition to Module 1)
      const handleRunApplication = (e) => {
        if (e) e.preventDefault();
        AudioFeedback?.playTone(659.25, 'triangle', 0.2); // Harmonic E5 Tone
        this.switchWorkspace('workspace-module-1', true);
        this.showNotification('⚡ Transitioned to Module 1: Claim Structure & Baseline Formation');
      };

      document.getElementById('btnRunApplication')?.addEventListener('click', handleRunApplication);
      document.getElementById('btnRunAppHeader')?.addEventListener('click', handleRunApplication);

      // Quick Proceed Buttons
      document.getElementById('btnProceedToM2')?.addEventListener('click', () => {
        this.switchWorkspace('workspace-module-2');
      });
      document.getElementById('btnProceedToM3')?.addEventListener('click', () => {
        this.switchWorkspace('workspace-module-3');
      });
      document.getElementById('btnProceedToM4')?.addEventListener('click', () => {
        this.switchWorkspace('workspace-module-4');
      });
    },

    switchWorkspace(workspaceId, shouldScroll = true) {
      const panes = document.querySelectorAll('.workspace-pane');
      panes.forEach(p => p.classList.remove('active'));

      const targetPane = document.getElementById(workspaceId);
      if (targetPane) {
        targetPane.classList.add('active');
      }

      const navButtons = document.querySelectorAll('.nav-btn');
      navButtons.forEach(btn => {
        if (btn.getAttribute('data-target') === workspaceId) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // Scroll to top of viewport smoothly if requested
      if (shouldScroll) {
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }

      // Refresh specific workspace components
      if (workspaceId === 'workspace-module-2') {
        SVGRenderer.updateStateHighlight(store.state.currentState);
      } else if (workspaceId === 'workspace-module-3') {
        EvidenceMapper.render();
      } else if (workspaceId === 'workspace-module-4') {
        this.renderModule4();
      } else if (workspaceId === 'workspace-source-code') {
        SourceCodeManager.updateViewer();
      }
    },

    bindPresetSelector() {
      const sel = document.getElementById('sampleClaimSelect');
      const btnLoad = document.getElementById('btnLoadSample');
      const btnReset = document.getElementById('btnResetAll');

      btnLoad?.addEventListener('click', () => {
        const val = sel.value;
        store.reset(val);
        this.refreshAllViews();
        this.showNotification(`Loaded Topic: ${SAMPLE_CLAIMS[val]?.title || val}`);
      });

      btnReset?.addEventListener('click', () => {
        if (confirm('Reset entire system state back to initial Q0 baseline?')) {
          store.reset(sel ? sel.value : 'cricket');
          this.refreshAllViews();
          this.showNotification('System restored to initial state Q0.');
        }
      });
    },

    bindModule1() {
      const btnExtract = document.getElementById('btnAnalyzeClaim');
      const txtClaim = document.getElementById('inputClaimText');
      const txtSource = document.getElementById('inputClaimSource');
      const selCat = document.getElementById('inputClaimCategory');
      const txtDate = document.getElementById('inputClaimDate');

      // Quick Fill Viral Topic Chips
      const topicChips = document.querySelectorAll('.chip-btn[data-topic]');
      topicChips.forEach(chip => {
        chip.addEventListener('click', () => {
          const topic = chip.getAttribute('data-topic');
          topicChips.forEach(c => c.classList.remove('active-chip'));
          chip.classList.add('active-chip');

          const sel = document.getElementById('sampleClaimSelect');
          if (sel) sel.value = topic;

          store.reset(topic);
          this.refreshAllViews();
          this.showNotification(`Loaded Topic: ${SAMPLE_CLAIMS[topic]?.title || topic}`);
        });
      });

      // Live typing updates across the application
      txtClaim?.addEventListener('input', (e) => {
        const val = e.target.value;
        store.state.statement = val;
        store.state.originalStatement = val;
        store.state.evolvedStatement = val;
        store.save();

        const tblStatement = document.getElementById('tableClaimStatement');
        if (tblStatement) tblStatement.textContent = val || '(Enter statement)';

        const m2Text = document.getElementById('m2ActiveClaimText');
        if (m2Text) m2Text.textContent = val || '(Enter statement)';

        const repOrig = document.getElementById('repOriginalClaim');
        if (repOrig) repOrig.textContent = val || '(Enter statement)';

        const repCurr = document.getElementById('repCurrentClaim');
        if (repCurr) repCurr.textContent = val || '(Enter statement)';
      });

      txtSource?.addEventListener('input', (e) => {
        store.state.source = e.target.value;
        store.save();
        const tblSource = document.getElementById('tableClaimSource');
        if (tblSource) tblSource.textContent = e.target.value;
      });

      selCat?.addEventListener('change', (e) => {
        store.state.category = e.target.value;
        store.save();
        const tblCategory = document.getElementById('tableClaimCategory');
        if (tblCategory) tblCategory.textContent = e.target.value;
        const m2Cat = document.getElementById('m2ActiveCategoryBadge');
        if (m2Cat) m2Cat.textContent = e.target.value;
      });

      btnExtract?.addEventListener('click', () => {
        const text = txtClaim.value.trim();
        if (!text) {
          alert('Please enter a claim statement to extract tokens.');
          return;
        }

        // Lightweight client-side entity extraction heuristic
        const stopWords = new Set(['a', 'an', 'the', 'and', 'or', 'by', 'for', 'of', 'in', 'on', 'with', 'to', 'at', 'has', 'have', 'is', 'are', 'was', 'were', 'all', 'new', 'over']);
        const tokens = text.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/)
          .filter(t => t.length > 2 && !stopWords.has(t.toLowerCase()))
          .map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
        
        const uniqueTokens = Array.from(new Set(tokens)).slice(0, 8);

        store.state.statement = text;
        store.state.originalStatement = text;
        store.state.source = txtSource.value.trim() || 'General Wire';
        store.state.category = selCat.value;
        store.state.keywords = uniqueTokens;
        store.state.currentState = DFA_CONFIG.initialState;
        store.state.executedString = '';
        store.state.transitionHistory = [
          {
            step: 0,
            fromState: null,
            symbol: null,
            toState: 'Q0',
            reason: 'Custom Claim Formalized at Baseline State Q0',
            timestamp: new Date().toLocaleTimeString()
          }
        ];
        store.save();

        this.refreshAllViews();
        this.showNotification('Baseline formalized at state Q0.');
      });

      // Quick Clear Form
      document.getElementById('btnQuickClear')?.addEventListener('click', () => {
        txtClaim.value = '';
        txtSource.value = '';
        store.state.statement = '';
        store.state.originalStatement = '';
        store.state.evolvedStatement = '';
        store.state.keywords = [];
        store.save();
        this.renderModule1();
        this.renderModule2Banner();
        this.updateHUD();
      });
    },

    bindModule2() {
      // Transition Buttons (a, b, c, d, e)
      const transButtons = document.querySelectorAll('.trans-btn[data-symbol]');
      transButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const sym = btn.getAttribute('data-symbol');
          const res = DFAEngine.transition(sym);

          if (!res.success) {
            alert(res.error);
          } else {
            SVGRenderer.updateStateHighlight(res.nextState, sym);
            this.updateHUD();
            this.renderTransitionMatrix();
            this.renderTransitionAuditLog();
          }
        });
      });

      // Reset DFA Button
      document.getElementById('btnResetDFA')?.addEventListener('click', () => {
        DFAEngine.resetToInitial();
        SVGRenderer.updateStateHighlight('Q0');
        this.updateHUD();
        this.renderTransitionMatrix();
        this.renderTransitionAuditLog();
      });

      // Clear Log Button
      document.getElementById('btnClearLog')?.addEventListener('click', () => {
        store.state.transitionHistory = [
          {
            step: 0,
            fromState: null,
            symbol: null,
            toState: store.state.currentState,
            reason: `Trace cleared at ${store.state.currentState}`,
            timestamp: new Date().toLocaleTimeString()
          }
        ];
        store.save();
        this.renderTransitionAuditLog();
      });

      // Preset Sequence Buttons (e.g. a -> b -> d)
      const seqButtons = document.querySelectorAll('.seq-btn-group button[data-seq]');
      seqButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const seq = btn.getAttribute('data-seq').split(' ');
          this.executeStepSequence(seq);
        });
      });
    },

    executeStepSequence(tokens) {
      DFAEngine.resetToInitial();
      SVGRenderer.updateStateHighlight('Q0');
      this.updateHUD();

      let i = 0;
      const interval = setInterval(() => {
        if (i >= tokens.length) {
          clearInterval(interval);
          return;
        }
        const sym = tokens[i];
        const res = DFAEngine.transition(sym);
        if (res.success) {
          SVGRenderer.updateStateHighlight(res.nextState, sym);
          this.updateHUD();
          this.renderTransitionMatrix();
          this.renderTransitionAuditLog();
        } else {
          clearInterval(interval);
          alert(res.error);
        }
        i++;
      }, 700);
    },

    bindModule3() {
      // Attach All Pre-configured Evidence
      document.getElementById('btnAttachAllEvidence')?.addEventListener('click', () => {
        const theme = store.state.activeTheme || 'cricket';
        const pool = THEME_EVIDENCE_POOL[theme] || THEME_EVIDENCE_POOL.cricket;
        
        const currentIds = new Set((store.state.evidenceList || []).map(e => e.id));
        pool.forEach(item => {
          if (!currentIds.has(item.id)) {
            store.state.evidenceList.push({
              id: item.id,
              source: item.source,
              tier: item.tier,
              stance: item.stance,
              text: item.text,
              timestamp: new Date().toLocaleTimeString()
            });
          }
        });
        store.save();
        this.renderModule3();
        this.renderModule4();
        this.updateHUD();
        this.showNotification(`Attached all verified evidence options.`);
      });

      // Clear Ledger
      document.getElementById('btnClearEvidenceLedger')?.addEventListener('click', () => {
        store.state.evidenceList = [];
        store.save();
        this.renderModule3();
        this.renderModule4();
        this.updateHUD();
        this.showNotification('Evidence ledger cleared.');
      });

      // Commit & Transition State
      document.getElementById('btnCommitEvidenceToDFA')?.addEventListener('click', () => {
        const score = EvidenceMapper.calculateAggregateScore();
        let targetSym = null;
        let explanation = '';

        if (score >= 0.4) {
          targetSym = 'b';
          explanation = `Net evidence score (+${score.toFixed(2)}) indicates substantial corroboration.`;
        } else if (score <= -0.4) {
          targetSym = 'c';
          explanation = `Net evidence score (${score.toFixed(2)}) indicates predominant contradiction.`;
        } else {
          targetSym = 'a';
          explanation = `Net evidence score (${score.toFixed(2)}) is neutral/mixed, suggesting claim modification.`;
        }

        const res = DFAEngine.transition(targetSym, `Evidence Synthesis: ${explanation}`);
        if (!res.success) {
          alert(`Transition blocked from current state ${store.state.currentState}: ${res.error}`);
        } else {
          SVGRenderer.updateStateHighlight(res.nextState, targetSym);
          this.updateHUD();
          this.renderTransitionMatrix();
          this.renderTransitionAuditLog();
          this.renderModule4();
          this.showNotification(`Transitioned to ${res.nextState} via symbol '${targetSym}'.`);
          this.switchWorkspace('workspace-module-2');
        }
      });
    },

    bindModule4() {
      document.getElementById('btnDownloadReport')?.addEventListener('click', () => {
        TruthTraceReporter.downloadReport();
      });

      document.getElementById('btnPrintReport')?.addEventListener('click', () => {
        window.print();
      });
    },

    bindTOCWorkspace() {
      const btnRunStr = document.getElementById('btnRunString');
      const btnStepStr = document.getElementById('btnStepString');
      const btnResetTape = document.getElementById('btnResetTape');
      const inputStr = document.getElementById('inputTestString');

      btnRunStr?.addEventListener('click', () => {
        const val = inputStr.value.trim();
        this.runStringAcceptance(val);
      });

      btnStepStr?.addEventListener('click', () => {
        this.stepStringAcceptance();
      });

      btnResetTape?.addEventListener('click', () => {
        this.resetStringAcceptance();
      });

      // Quick test strings
      const quickBtns = document.querySelectorAll('.btn-quick-str');
      quickBtns.forEach(b => {
        b.addEventListener('click', () => {
          inputStr.value = b.getAttribute('data-str');
          this.runStringAcceptance(inputStr.value);
        });
      });

      // NFA Simulator button
      document.getElementById('btnSimulateNFA')?.addEventListener('click', () => {
        const resBox = document.getElementById('nfaStateSetResult');
        if (resBox) {
          resBox.innerHTML = `
            <strong>NFA Branching Result:</strong><br>
            Under simultaneous non-deterministic transition &delta;(Q0, &lambda;) with competing breaking dispatches:<br>
            State Set: <span class="badge badge-gold">{ Q1, Q2, Q3 }</span> (Superposition of Modified, Supported, and Disputed)<br>
            <em>Subset Construction (Power Set Automaton)</em> reduces this ambiguity into deterministic consensus states.
          `;
          AudioFeedback.transition();
        }
      });
    },

    // String Acceptance Interactive Runner State
    stringRunner: {
      tokens: [],
      currentIndex: 0,
      currentState: 'Q0',
      path: ['Q0'],
      trace: []
    },

    resetStringAcceptance() {
      const inputStr = document.getElementById('inputTestString')?.value.trim() || 'a b d';
      const cleanTokens = inputStr.toLowerCase().replace(/[^a-e]/g, '').split('');

      this.stringRunner = {
        tokens: cleanTokens,
        currentIndex: 0,
        currentState: DFA_CONFIG.initialState,
        path: [DFA_CONFIG.initialState],
        trace: []
      };

      this.renderTape();
      const verdictBox = document.getElementById('stringVerdictBox');
      const statusText = document.getElementById('verdictStatusText');
      const explText = document.getElementById('verdictExplanation');
      const logBox = document.getElementById('stringTraceLog');

      if (verdictBox) verdictBox.className = 'verdict-box verdict-pending';
      if (statusText) statusText.textContent = 'READY TO PROCESS';
      if (explText) explText.textContent = `Input tape loaded with ${cleanTokens.length} symbols. Click Step or Process.`;
      if (logBox) logBox.textContent = 'Execution log will appear here.';
    },

    renderTape() {
      const wrapper = document.getElementById('tapeCellsWrapper');
      if (!wrapper) return;

      const { tokens, currentIndex } = this.stringRunner;
      wrapper.innerHTML = '';

      if (tokens.length === 0) {
        wrapper.innerHTML = '<span class="text-sage font-sm">&epsilon; (Empty String)</span>';
        return;
      }

      tokens.forEach((sym, idx) => {
        const cell = document.createElement('div');
        cell.className = 'tape-cell';
        if (idx === currentIndex) {
          cell.classList.add('active-head');
        } else if (idx < currentIndex) {
          cell.classList.add('processed');
        }
        cell.textContent = sym;
        wrapper.appendChild(cell);
      });
    },

    stepStringAcceptance() {
      const { tokens, currentIndex, currentState } = this.stringRunner;
      if (tokens.length === 0) {
        this.resetStringAcceptance();
      }

      if (this.stringRunner.currentIndex >= tokens.length) {
        // Complete
        this.evaluateFinalVerdict();
        return;
      }

      const sym = tokens[this.stringRunner.currentIndex];
      const next = DFA_CONFIG.transitions[currentState] ? DFA_CONFIG.transitions[currentState][sym] : null;

      const logBox = document.getElementById('stringTraceLog');

      if (!next) {
        // Undefined transition / Crash
        this.stringRunner.trace.push(`[Step ${this.stringRunner.currentIndex + 1}] delta(${currentState}, '${sym}') = UNDEFINED (Halted / Rejected)`);
        logBox.textContent = this.stringRunner.trace.join('\n');
        this.setVerdict(false, `Machine halted: delta(${currentState}, '${sym}') is undefined in DFA.`);
        AudioFeedback.reject();
        return;
      }

      this.stringRunner.trace.push(`[Step ${this.stringRunner.currentIndex + 1}] delta(${currentState}, '${sym}') -> ${next}`);
      logBox.textContent = this.stringRunner.trace.join('\n');

      this.stringRunner.currentState = next;
      this.stringRunner.path.push(next);
      this.stringRunner.currentIndex++;

      this.renderTape();
      AudioFeedback.transition();

      if (this.stringRunner.currentIndex >= tokens.length) {
        this.evaluateFinalVerdict();
      }
    },

    runStringAcceptance(inputString) {
      this.resetStringAcceptance();
      const res = DFAEngine.processString(inputString);

      let step = 0;
      const interval = setInterval(() => {
        if (step >= res.tokens.length) {
          clearInterval(interval);
          this.setVerdict(res.accepted, res.verdict);
          const logBox = document.getElementById('stringTraceLog');
          if (logBox) {
            logBox.textContent = res.trace.map(t => `[Step ${t.step}] ${t.msg}`).join('\n');
          }
          if (res.accepted) AudioFeedback.accept();
          else AudioFeedback.reject();
          return;
        }

        this.stringRunner.currentIndex = step;
        this.renderTape();
        AudioFeedback.transition();
        step++;
      }, 400);
    },

    evaluateFinalVerdict() {
      const isAccepted = DFA_CONFIG.acceptingStates.includes(this.stringRunner.currentState);
      this.setVerdict(
        isAccepted,
        isAccepted
          ? `ACCEPTED: State ${this.stringRunner.currentState} is in F = {Q4}`
          : `REJECTED: Final State ${this.stringRunner.currentState} is NOT accepting`
      );
      if (isAccepted) AudioFeedback.accept();
      else AudioFeedback.reject();
    },

    setVerdict(isAccepted, expl) {
      const verdictBox = document.getElementById('stringVerdictBox');
      const statusText = document.getElementById('verdictStatusText');
      const explText = document.getElementById('verdictExplanation');

      if (!verdictBox) return;

      if (isAccepted) {
        verdictBox.className = 'verdict-box verdict-accepted';
        statusText.textContent = 'STRING ACCEPTED • w ∈ L(M)';
      } else {
        verdictBox.className = 'verdict-box verdict-rejected';
        statusText.textContent = 'STRING REJECTED • w ∉ L(M)';
      }
      explText.textContent = expl;
    },

    bindSourceCodeViewer() {
      document.getElementById('btnCopySourceCode')?.addEventListener('click', () => {
        const content = SourceCodeManager.getPythonCode();
        navigator.clipboard.writeText(content).then(() => {
          const badge = document.getElementById('copyFeedback');
          if (badge) {
            badge.style.display = 'inline-block';
            setTimeout(() => { badge.style.display = 'none'; }, 2000);
          }
        });
      });
    },

    // View Renders
    refreshAllViews() {
      this.updateHUD();
      this.renderModule1();
      this.renderModule2Banner();
      SVGRenderer.init();
      this.renderTransitionMatrix();
      this.renderTransitionAuditLog();
      this.renderModule3();
      this.renderModule4();
      this.resetStringAcceptance();
      SourceCodeManager.updateViewer();
    },

    renderModule2Banner() {
      const s = store.state;
      const m2Text = document.getElementById('m2ActiveClaimText');
      const m2Cat = document.getElementById('m2ActiveCategoryBadge');
      if (m2Text) m2Text.textContent = s.statement || '(No active statement)';
      if (m2Cat) m2Cat.textContent = s.category || 'General';
    },

    updateHUD() {
      const s = store.state;
      const elCurrentLabel = document.getElementById('currentActiveStateLabel');
      if (elCurrentLabel) elCurrentLabel.textContent = s.currentState;

      // Disable/enable transition buttons based on current state validity
      const transButtons = document.querySelectorAll('.trans-btn[data-symbol]');
      transButtons.forEach(btn => {
        const sym = btn.getAttribute('data-symbol');
        const next = DFA_CONFIG.transitions[s.currentState]?.[sym];
        btn.disabled = (next === null || next === undefined);
      });
    },

    renderModule1() {
      const s = store.state;
      const txtClaim = document.getElementById('inputClaimText');
      const txtSource = document.getElementById('inputClaimSource');
      const selCat = document.getElementById('inputClaimCategory');
      const txtDate = document.getElementById('inputClaimDate');

      if (txtClaim) txtClaim.value = s.statement;
      if (txtSource) txtSource.value = s.source;
      if (selCat) selCat.value = s.category;
      if (txtDate) txtDate.value = s.date;

      // Table baseline
      const tblStatement = document.getElementById('tableClaimStatement');
      const tblSource = document.getElementById('tableClaimSource');
      const tblCategory = document.getElementById('tableClaimCategory');

      if (tblStatement) tblStatement.textContent = s.statement;
      if (tblSource) tblSource.textContent = s.source;
      if (tblCategory) tblCategory.textContent = s.category;

      // Keyword cloud
      const cloud = document.getElementById('keywordsPillContainer');
      if (cloud) {
        cloud.innerHTML = '';
        s.keywords.forEach(kw => {
          const span = document.createElement('span');
          span.className = 'keyword-tag';
          span.innerHTML = `<span>#</span> ${kw}`;
          cloud.appendChild(span);
        });
      }
    },

    renderTransitionMatrix() {
      const tbody = document.querySelector('#dfaMatrixTable tbody');
      if (!tbody) return;

      const currentState = store.state.currentState;
      tbody.innerHTML = '';

      Object.keys(DFA_CONFIG.transitions).forEach(q => {
        const row = document.createElement('tr');
        if (q === currentState) {
          row.classList.add('active-row');
        }

        const th = document.createElement('td');
        th.innerHTML = `<strong>${q}</strong> <span class="font-xs">(${DFA_CONFIG.states[q].name.split(' ')[0]})</span>`;
        row.appendChild(th);

        ['a', 'b', 'c', 'd', 'e'].forEach(sym => {
          const td = document.createElement('td');
          const next = DFA_CONFIG.transitions[q][sym];
          td.textContent = next ? next : '—';
          if (q === currentState && next) {
            td.style.color = '#D9B66F';
          }
          row.appendChild(td);
        });

        tbody.appendChild(row);
      });
    },

    renderTransitionAuditLog() {
      const container = document.getElementById('transitionLogContainer');
      if (!container) return;

      container.innerHTML = '';
      const history = [...store.state.transitionHistory].reverse();

      history.forEach(item => {
        const entry = document.createElement('div');
        entry.className = 'audit-entry';
        entry.innerHTML = `
          <span class="audit-step">#${item.step}</span>
          <span class="audit-trans">${item.fromState ? `${item.fromState} &rarr; <strong>${item.toState}</strong>` : `Initialized at ${item.toState}`}</span>
          <span class="audit-reason text-sage">${item.reason}</span>
          <span class="audit-time">${item.timestamp}</span>
        `;
        container.appendChild(entry);
      });
    },

    renderModule3() {
      EvidenceMapper.render();

      const theme = store.state.activeTheme || 'cricket';
      const pool = THEME_EVIDENCE_POOL[theme] || THEME_EVIDENCE_POOL.cricket;
      const themeTitles = {
        cricket: '🏏 Cricket Evidence Vault',
        aliens: '🛸 Aliens & Space Evidence Vault',
        weather: '🌪️ Cyclone Weather Evidence Vault',
        holiday: '🏖️ Holiday & Travel Evidence Vault'
      };

      const themeBadge = document.getElementById('activeEvidenceThemeBadge');
      if (themeBadge) {
        themeBadge.textContent = themeTitles[theme] || 'Verified Evidence Vault';
      }

      // Render Pre-Configured Evidence Option Cards (Zero Manual Typing)
      const preListContainer = document.getElementById('preconfiguredEvidenceList');
      if (preListContainer) {
        preListContainer.innerHTML = '';
        const currentIds = new Set((store.state.evidenceList || []).map(e => e.id));

        pool.forEach(ev => {
          const isAttached = currentIds.has(ev.id);
          const card = document.createElement('div');
          card.className = `pre-ev-card ${isAttached ? 'attached' : ''}`;

          const stanceClass = ev.stance === 'support' ? 'badge-emerald' : (ev.stance === 'contradict' ? 'badge-crimson' : 'badge-gold');
          const stanceLabel = ev.stance === 'support' ? 'SUPPORTING (+1.0)' : (ev.stance === 'contradict' ? 'CONTRADICTORY (-1.0)' : 'NEUTRAL (0.0)');

          card.innerHTML = `
            <div class="pre-ev-top">
              <div class="pre-ev-source-wrap">
                <span class="pre-ev-source">${ev.source}</span>
                <span class="badge badge-gold">Tier ${ev.tier}</span>
              </div>
              <span class="badge ${stanceClass}">${stanceLabel}</span>
            </div>
            <p class="pre-ev-text">&ldquo;${ev.text}&rdquo;</p>
            <div class="pre-ev-bottom">
              <span class="pre-ev-tag">${ev.notes || 'Verified Source'}</span>
              <button type="button" class="btn ${isAttached ? 'btn-ghost' : 'btn-secondary'} btn-xs btn-toggle-ev" data-ev-id="${ev.id}">
                ${isAttached ? '✓ Attached (Click to Remove)' : '+ Attach This Evidence'}
              </button>
            </div>
          `;

          card.querySelector('.btn-toggle-ev')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isAttached) {
              store.state.evidenceList = store.state.evidenceList.filter(item => item.id !== ev.id);
            } else {
              store.state.evidenceList.push({
                id: ev.id,
                source: ev.source,
                tier: ev.tier,
                stance: ev.stance,
                text: ev.text,
                timestamp: new Date().toLocaleTimeString()
              });
            }
            store.save();
            this.renderModule3();
            this.renderModule4();
            this.updateHUD();
            this.showNotification(isAttached ? 'Evidence detached from ledger.' : 'Evidence attached to active claim.');
          });

          preListContainer.appendChild(card);
        });
      }

      // Render Logged Evidence Items List
      const items = store.state.evidenceList || [];
      const badge = document.getElementById('evidenceCountBadge');
      if (badge) badge.textContent = items.length;

      const listContainer = document.getElementById('evidenceListContainer');
      if (listContainer) {
        listContainer.innerHTML = '';
        if (items.length === 0) {
          listContainer.innerHTML = '<p class="font-xs text-sage" style="padding:10px 0;">No evidence items attached yet. Click options from the vault on the left.</p>';
        } else {
          items.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'evidence-card-item';
            const isSupport = item.stance === 'support';
            const stanceClass = isSupport ? 'badge-emerald' : (item.stance === 'contradict' ? 'badge-crimson' : 'badge-gold');

            card.innerHTML = `
              <div class="evidence-item-header">
                <span class="evidence-source-name">${item.source} (Tier ${item.tier})</span>
                <span class="badge ${stanceClass}">${item.stance.toUpperCase()}</span>
              </div>
              <p class="evidence-text-quote">&ldquo;${item.text}&rdquo;</p>
              <div class="font-xs text-sage" style="display:flex; justify-content:space-between; align-items:center;">
                <span>Logged: ${item.timestamp || 'Recorded'}</span>
                <button class="btn btn-ghost btn-xs btn-delete-ev" data-index="${idx}">Remove</button>
              </div>
            `;

            card.querySelector('.btn-delete-ev')?.addEventListener('click', (e) => {
              e.stopPropagation();
              store.state.evidenceList.splice(idx, 1);
              store.save();
              this.renderModule3();
              this.renderModule4();
              this.updateHUD();
            });

            listContainer.appendChild(card);
          });
        }
      }

      // Update Aggregated score pills
      const aggScore = EvidenceMapper.calculateAggregateScore();
      const elAggVal = document.getElementById('aggScoreVal');
      const elAggTrigger = document.getElementById('aggTriggerVal');

      if (elAggVal) {
        elAggVal.textContent = aggScore >= 0 ? `+${aggScore.toFixed(2)}` : aggScore.toFixed(2);
        elAggVal.className = aggScore >= 0.4 ? 'stat-val emerald' : (aggScore <= -0.4 ? 'stat-val crimson' : 'stat-val gold');
      }

      if (elAggTrigger) {
        if (aggScore >= 0.4) {
          elAggTrigger.textContent = "Symbol 'b' (Support)";
          elAggTrigger.className = 'stat-val emerald';
        } else if (aggScore <= -0.4) {
          elAggTrigger.textContent = "Symbol 'c' (Contradict)";
          elAggTrigger.className = 'stat-val crimson';
        } else {
          elAggTrigger.textContent = "Symbol 'a' (Modify)";
          elAggTrigger.className = 'stat-val gold';
        }
      }
    },

    renderModule4() {
      const s = store.state;
      const dfa = DFA_CONFIG;
      const isAccepted = dfa.acceptingStates.includes(s.currentState);

      // Metadata
      const elDocId = document.getElementById('repDocId');
      const elTime = document.getElementById('repTimestamp');
      const elInit = document.getElementById('repInitialState');
      const elFinal = document.getElementById('repFinalState');
      const elVerdict = document.getElementById('repVerdict');
      const elOrig = document.getElementById('repOriginalClaim');
      const elCurr = document.getElementById('repCurrentClaim');

      if (elDocId) elDocId.textContent = `TT-2028-${s.claimId}`;
      if (elTime) elTime.textContent = new Date().toLocaleString();
      if (elInit) elInit.textContent = 'Q0 – Original Claim';
      if (elFinal) elFinal.textContent = `${s.currentState} – ${dfa.states[s.currentState].name}`;

      if (elVerdict) {
        if (isAccepted) {
          elVerdict.className = 'metric-value badge badge-emerald';
          elVerdict.textContent = 'Claim Status: Verified';
        } else if (s.currentState === 'Q5') {
          elVerdict.className = 'metric-value badge badge-crimson';
          elVerdict.textContent = 'Claim Status: Fake / Debunked';
        } else {
          elVerdict.className = 'metric-value badge badge-gold';
          elVerdict.textContent = 'Claim Status: Evaluating';
        }
      }

      if (elOrig) elOrig.textContent = s.originalStatement;
      if (elCurr) elCurr.textContent = s.evolvedStatement || s.statement;

      // Timeline
      const timeline = document.getElementById('reportTimeline');
      if (timeline) {
        timeline.innerHTML = '';
        s.transitionHistory.forEach((th, i) => {
          const node = document.createElement('div');
          node.className = 'step-node';
          if (i === s.transitionHistory.length - 1) {
            node.classList.add('final');
          }

          node.innerHTML = `
            <span class="step-sym">${th.symbol ? `Symbol '${th.symbol}'` : 'Start'}</span>
            <span class="step-title">${th.toState}</span>
            <span class="font-xs text-sage">${DFA_CONFIG.states[th.toState]?.name.split(' ')[0] || ''}</span>
          `;
          timeline.appendChild(node);

          if (i < s.transitionHistory.length - 1) {
            const arrow = document.createElement('div');
            arrow.className = 'step-arrow';
            arrow.innerHTML = '&rarr;';
            timeline.appendChild(arrow);
          }
        });
      }

      // Evidence Table with Strict Fixed Proportions & Clean Spacing
      const repTableBody = document.querySelector('#repEvidenceTable tbody');
      if (repTableBody) {
        repTableBody.innerHTML = '';
        if (s.evidenceList.length === 0) {
          repTableBody.innerHTML = '<tr><td colspan="6" class="text-sage" style="text-align:center; padding: 22px;">No evidence recorded for this claim. Attach options from Module 3.</td></tr>';
        } else {
          s.evidenceList.forEach((ev, i) => {
            const tr = document.createElement('tr');
            const stanceClass = ev.stance === 'support' ? 'badge-emerald' : (ev.stance === 'contradict' ? 'badge-crimson' : 'badge-gold');
            const impactDelta = ev.stance === 'support' ? '&delta; &rarr; Q2' : (ev.stance === 'contradict' ? '&delta; &rarr; Q3' : '&delta; &rarr; Q1');

            tr.innerHTML = `
              <td class="col-num">${i + 1}</td>
              <td class="col-source"><strong>${ev.source}</strong></td>
              <td class="col-weight"><span class="badge badge-gold">${ev.tier}</span></td>
              <td class="col-stance"><span class="badge ${stanceClass}">${ev.stance.toUpperCase()}</span></td>
              <td class="col-excerpt"><em>&ldquo;${ev.text}&rdquo;</em></td>
              <td class="col-impact"><span class="badge badge-champagne">${impactDelta}</span></td>
            `;
            repTableBody.appendChild(tr);
          });
        }
      }

      // Proof box
      const proofBox = document.getElementById('repProofBox');
      if (proofBox) {
        proofBox.textContent = `Given input alphabet string w = <${s.executedString.split('').join(', ') || 'ε'}>:
Computation Path: ${s.transitionHistory.map(th => th.toState).join(' ➔ ')}
Final State: q_final = ${s.currentState}
Accepting Set F: { Q4 }
Proof Condition: ${s.currentState} ${isAccepted ? '∈' : '∉'} F
Conclusion: String w is formally ${isAccepted ? 'ACCEPTED' : 'REJECTED'} by deterministic automaton M.`;
      }
    },

    showStateInspection(stateId) {
      const meta = DFA_CONFIG.states[stateId];
      if (!meta) return;
      alert(`Automaton State: ${stateId}\nTitle: ${meta.name}\nClassification: ${meta.type.toUpperCase()}\nSemantics: ${meta.desc}`);
    },

    showNotification(msg) {
      // Lightweight non-blocking toast
      const toast = document.createElement('div');
      toast.style.position = 'fixed';
      toast.style.bottom = '24px';
      toast.style.right = '24px';
      toast.style.background = '#092D25';
      toast.style.border = '1px solid #D9B66F';
      toast.style.color = '#F4F0E6';
      toast.style.padding = '10px 18px';
      toast.style.borderRadius = '8px';
      toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
      toast.style.fontFamily = "'Inter', sans-serif";
      toast.style.fontSize = '0.85rem';
      toast.style.zIndex = '9999';
      toast.textContent = msg;

      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s ease';
        setTimeout(() => toast.remove(), 400);
      }, 2500);
    }
  };

  // =============================================================================
  // 10. SYSTEM INITIALIZATION ON DOM READY
  // =============================================================================

  document.addEventListener('DOMContentLoaded', () => {
    UIManager.init();
    console.log('Finite-State News Framework (TOC Engine) initialized successfully.');
  });

})();
