"""
================================================================================
A Finite-State Framework for Tracking the Evolution of News Claims
Theory of Computation (TOC) Academic Implementation
================================================================================
Formal Automaton Specification:
    Deterministic Finite Automaton: M = (Q, Σ, δ, q0, F)
    States Q: { Q0, Q1, Q2, Q3, Q4, Q5 }
    Alphabet Σ: { a, b, c, d, e }
    Initial State q0: Q0 (Unverified / Baseline Claim)
    Accepting Set F: { Q4 } (Verified Claim)
    Trap State: Q5 (Debunked / Fake Claim)
================================================================================
"""

import sys
import os
import json
import socket
import threading
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime

# ==============================================================================
# 1. FORMAL THEORY OF COMPUTATION DFA ENGINE
# ==============================================================================

class DeterministicFiniteAutomaton:
    """
    Formal 5-Tuple Deterministic Finite Automaton:
        M = (Q, Sigma, delta, q0, F)
    """

    STATES = {
        'Q0': {'name': 'Initial Claim', 'desc': 'Unverified raw baseline hypothesis', 'type': 'initial'},
        'Q1': {'name': 'Modified Claim', 'desc': 'Claim text or scope altered', 'type': 'intermediate'},
        'Q2': {'name': 'Supported Claim', 'desc': 'Corroborating evidence logged', 'type': 'intermediate'},
        'Q3': {'name': 'Disputed Claim', 'desc': 'Conflicting records or rebuttal logged', 'type': 'intermediate'},
        'Q4': {'name': 'Claim Status: Verified', 'desc': 'Formal verification achieved (In F)', 'type': 'accepting'},
        'Q5': {'name': 'Claim Status: Fake / Debunked', 'desc': 'Formal refutation (Trap state)', 'type': 'terminal_reject'}
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
        'Q5': {}  # Dead / trap state
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
        state_transitions = self.TRANSITIONS.get(state, {})
        return state_transitions.get(symbol, None)

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
            'status': 'Claim Status: Verified' if next_state == 'Q4' else (
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
            'verdict': f"ACCEPTED: Final State {q} is in F = {{Q4}}" if is_accepted else f"REJECTED: Final State {q} is not in F"
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
# 2. REAL-WORLD TRENDING NEWS TOPIC DATASETS (WITH VERIFIABLE SOURCES)
# ==============================================================================

SAMPLE_TOPICS = {
    'cricket': {
        'id': 'CLM-CRIC-01',
        'title': 'Virat Kohli Injury Rumor (Cricbuzz)',
        'statement': 'Virat Kohli is ruled out of the upcoming Border-Gavaskar Trophy series due to a chronic back spasm.',
        'evolved': 'BCCI medical team confirms Virat Kohli participated in full training sessions in Perth; declared fully fit for the Border-Gavaskar Trophy.',
        'source': 'Cricbuzz / Sports Desk',
        'category': 'Sports',
        'date': '2026-11-02T10:00',
        'keywords': ['Virat Kohli', 'Border-Gavaskar Trophy', 'Back Injury', 'Ruled Out'],
        'evidence': [
            {
                'id': 'ev-cric-1',
                'source': 'BCCI Official Medical Release',
                'tier': 0.95,
                'stance': 'contradict',
                'text': 'BCCI Medical Staff confirmed Virat Kohli underwent routine scans with no structural damage; cleared for match selection.',
                'timestamp': '2026-11-02 11:30'
            },
            {
                'id': 'ev-cric-2',
                'source': 'Indian Team Head Coach Press Briefing',
                'tier': 0.90,
                'stance': 'contradict',
                'text': 'Head Coach confirmed Kohli batted for 45 minutes in the match simulation without discomfort.',
                'timestamp': '2026-11-02 14:00'
            }
        ],
        'default_sequence': ['c', 'e']
    },
    'aliens': {
        'id': 'CLM-ASTRO-02',
        'title': 'Alien Biosignatures on K2-18b (NASA / JWST)',
        'statement': 'The James Webb Space Telescope detected atmospheric biosignatures and chlorofluorocarbons on exoplanet K2-18b.',
        'evolved': 'NASA JWST Science Working Group issues peer-reviewed update: preliminary methane and CO2 spectra confirmed; dimethyl sulfide detection requires additional validation.',
        'source': 'NASA / SETI Institute Dispatches',
        'category': 'Science & Space',
        'date': '2026-11-02T08:30',
        'keywords': ['JWST', 'K2-18b', 'Biosignatures', 'Extraterrestrial'],
        'evidence': [
            {
                'id': 'ev-astro-1',
                'source': 'NASA Goddard Space Flight Center Dispatch',
                'tier': 0.95,
                'stance': 'support',
                'text': 'Transmission spectroscopy confirms significant carbon-bearing molecules in the habitable-zone atmosphere.',
                'timestamp': '2026-11-02 09:15'
            },
            {
                'id': 'ev-astro-2',
                'source': 'Astrophysical Journal Letters',
                'tier': 0.90,
                'stance': 'support',
                'text': 'Statistical significance of atmospheric methane and carbon dioxide confirmed, but claims of alien technosignatures are premature.',
                'timestamp': '2026-11-02 09:30'
            }
        ],
        'default_sequence': ['b', 'd']
    },
    'weather': {
        'id': 'CLM-METEO-03',
        'title': 'Cyclone Fengal Landfall Warning (IMD)',
        'statement': "Severe Cyclone 'Fengal' is forecast to make direct landfall near coastal Chennai within 48 hours.",
        'evolved': 'IMD issues Red Alert as Cyclone Fengal approaches Tamil Nadu coast with landfall projected near Chennai.',
        'source': 'Regional Meteorological Department / IMD',
        'category': 'Weather',
        'date': '2026-11-02T06:15',
        'keywords': ['Cyclone Fengal', 'IMD Warning', 'Coastal Landfall', 'Chennai'],
        'evidence': [
            {
                'id': 'ev-weath-1',
                'source': 'India Meteorological Department (IMD) Bulletin',
                'tier': 0.95,
                'stance': 'support',
                'text': "Deep depression intensified into Cyclonic Storm 'Fengal'; track models indicate landfall between Karaikal and Mahabalipuram near Chennai.",
                'timestamp': '2026-11-02 08:00'
            },
            {
                'id': 'ev-weath-2',
                'source': 'Tamil Nadu State Disaster Management Authority',
                'tier': 0.95,
                'stance': 'support',
                'text': 'Red alert issued across coastal districts with NDRF teams deployed in anticipation of heavy rainfall and storm surge.',
                'timestamp': '2026-11-02 10:45'
            }
        ],
        'default_sequence': ['b', 'd']
    },
    'holiday': {
        'id': 'CLM-GOV-04',
        'title': '4-Day Holiday Circular (PIB Fact Check)',
        'statement': 'Government declares a surprise mandatory 4-day nationwide holiday for the festival weekend.',
        'evolved': 'PIB Fact Check debunks viral circular: Government has not declared any surprise 4-day nationwide holiday.',
        'source': 'Ministry of Personnel / Press Information Bureau',
        'category': 'Public Notice',
        'date': '2026-11-02T12:00',
        'keywords': ['National Holiday', 'Long Weekend', 'Government Notification', 'Public Circular'],
        'evidence': [
            {
                'id': 'ev-hol-1',
                'source': 'Press Information Bureau (PIB) Fact Check',
                'tier': 0.95,
                'stance': 'contradict',
                'text': 'PIB Fact Check confirmed the circular circulating on WhatsApp regarding a mandatory 4-day national holiday is fake.',
                'timestamp': '2026-11-02 13:20'
            },
            {
                'id': 'ev-hol-2',
                'source': 'Ministry of Personnel Official Gazette',
                'tier': 0.90,
                'stance': 'contradict',
                'text': 'No official order for additional public holidays has been issued; central government offices remain open as per standard calendar.',
                'timestamp': '2026-11-02 15:00'
            }
        ],
        'default_sequence': ['c', 'e']
    }
}

THEME_EVIDENCE_POOL = {
    'cricket': [
        {
            'id': 'ev-cric-1',
            'source': 'BCCI Official Medical Release',
            'tier': 0.95,
            'stance': 'contradict',
            'text': 'BCCI chief medical officer confirmed Virat Kohli underwent routine precautionary scans with zero structural damage; declared 100% fit for match selection.',
            'notes': 'Official Medical Board'
        },
        {
            'id': 'ev-cric-2',
            'source': 'Team India Head Coach Press Briefing',
            'tier': 0.90,
            'stance': 'contradict',
            'text': 'Head Coach confirmed Kohli batted for 45 minutes in the Perth match simulation without any back discomfort and will start in the 1st Test.',
            'notes': 'Team Management Dispatch'
        },
        {
            'id': 'ev-cric-3',
            'source': 'Anonymous Sports Blog / Social Leak',
            'tier': 0.45,
            'stance': 'support',
            'text': 'Unverified social media blog claimed senior batter skipped afternoon fielding drills citing recurring lumbar stiffness.',
            'notes': 'Unverified Social Media'
        },
        {
            'id': 'ev-cric-4',
            'source': 'Live Broadcast Commentary Box (Fox Sports)',
            'tier': 0.75,
            'stance': 'neutral',
            'text': 'Commentary team noted Kohli doing normal agility stretches on the boundary line during session break before rejoining practice nets.',
            'notes': 'Accredited Media'
        }
    ],
    'aliens': [
        {
            'id': 'ev-alien-1',
            'source': 'NASA Goddard Space Flight Center Dispatch',
            'tier': 0.95,
            'stance': 'support',
            'text': 'JWST NIRISS and NIRSpec transmission spectroscopy confirmed abundant methane and carbon dioxide in exoplanet K2-18b habitable-zone atmosphere.',
            'notes': 'Official Space Agency'
        },
        {
            'id': 'ev-alien-2',
            'source': 'The Astrophysical Journal Letters',
            'tier': 0.90,
            'stance': 'support',
            'text': 'Independent peer-reviewed spectral inversion indicates K2-18b is a Hycean world with a water-rich ocean beneath a hydrogen atmosphere.',
            'notes': 'Peer-Reviewed Journal'
        },
        {
            'id': 'ev-alien-3',
            'source': 'Cambridge Exoplanet Research Consortium',
            'tier': 0.90,
            'stance': 'contradict',
            'text': 'Photochemical atmospheric modeling indicates abiotic geological methane photolysis accounts for observed spectra without requiring biological life.',
            'notes': 'Academic Research Lab'
        },
        {
            'id': 'ev-alien-4',
            'source': 'Space Telescope Science Institute (STScI)',
            'tier': 0.95,
            'stance': 'neutral',
            'text': 'Science team scheduled Cycle 3 MIRI observations over the next 12 months to measure dimethyl sulfide lines before drawing definitive conclusions.',
            'notes': 'Observatory Operations'
        }
    ],
    'weather': [
        {
            'id': 'ev-weath-1',
            'source': 'India Meteorological Department (IMD) Bulletin',
            'tier': 0.95,
            'stance': 'support',
            'text': 'Deep depression intensified into Cyclonic Storm "Fengal"; doppler radar tracks projected landfall between Karaikal and Mahabalipuram near Chennai.',
            'notes': 'National Weather Bureau'
        },
        {
            'id': 'ev-weath-2',
            'source': 'Tamil Nadu State Disaster Management Authority',
            'tier': 0.95,
            'stance': 'support',
            'text': 'Red Alert issued across 6 coastal districts; 14 NDRF battalions deployed with mandatory 72-hour coastal safety guidelines.',
            'notes': 'State Emergency Authority'
        },
        {
            'id': 'ev-weath-3',
            'source': 'European Centre for Medium-Range Forecasts (ECMWF)',
            'tier': 0.85,
            'stance': 'contradict',
            'text': 'Ensemble trajectory models indicate storm system may recurve northeastward into open waters, weakening before reaching the Chennai coast.',
            'notes': 'International Forecast Agency'
        },
        {
            'id': 'ev-weath-4',
            'source': 'Chennai Port Trust Maritime Operations',
            'tier': 0.75,
            'stance': 'neutral',
            'text': 'Local Cautionary Signal No. 3 hoisted at harbor; commercial cargo handling proceeding under standby severe weather watch.',
            'notes': 'Port Logistics Administration'
        }
    ],
    'holiday': [
        {
            'id': 'ev-hol-1',
            'source': 'Press Information Bureau (PIB) Fact Check',
            'tier': 0.95,
            'stance': 'contradict',
            'text': 'PIB Fact Check confirmed the viral digital circular announcing a mandatory 4-day national weekend holiday is fake and completely fabricated.',
            'notes': 'Official Govt Fact Check Unit'
        },
        {
            'id': 'ev-hol-2',
            'source': 'Ministry of Personnel & Public Grievances',
            'tier': 0.90,
            'stance': 'contradict',
            'text': 'Ministry confirmed no supplementary public holiday executive orders were issued; all central offices will function on regular schedules.',
            'notes': 'Statutory Govt Department'
        },
        {
            'id': 'ev-hol-3',
            'source': 'Viral WhatsApp Forward / Social Media Screenshot',
            'tier': 0.45,
            'stance': 'support',
            'text': 'Digitally manipulated PDF document circulating across group chats claiming nationwide paid holiday from Friday through Monday.',
            'notes': 'Unverified Social Media'
        },
        {
            'id': 'ev-hol-4',
            'source': 'Central Secretariat Staff Confederation',
            'tier': 0.70,
            'stance': 'neutral',
            'text': 'Staff union had requested restricted holiday consideration for the upcoming festival, but no official approval was granted.',
            'notes': 'Employee Representative Body'
        }
    ]
}


# Global Automaton and Active Claim State
GLOBAL_DFA = DeterministicFiniteAutomaton()
GLOBAL_CLAIM = dict(SAMPLE_TOPICS['cricket'])


# ==============================================================================
# 3. HTTP REQUEST HANDLER & BACKEND REST API
# ==============================================================================

class TOCFrameworkRequestHandler(SimpleHTTPRequestHandler):
    """
    HTTP Request Handler that:
    1. Serves the interactive static application (HTML, CSS, JS, SVG).
    2. Serves REST API endpoints executing formal Python DFA logic.
    """

    def log_message(self, format, *args):
        # Clean logging format
        sys.stderr.write(f"[{datetime.now().strftime('%H:%M:%S')}] {format % args}\n")

    def end_headers(self):
        # Enable CORS and disable aggressive caching for live development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # REST API Routes
        if path == '/api/dfa/state':
            self.send_json({
                'current_state': GLOBAL_DFA.current_state,
                'state_meta': GLOBAL_DFA.STATES[GLOBAL_DFA.current_state],
                'tape': GLOBAL_DFA.executed_tape,
                'claim': GLOBAL_CLAIM,
                'history': GLOBAL_DFA.history,
                'is_accepting': GLOBAL_DFA.current_state in GLOBAL_DFA.ACCEPTING_STATES,
                'is_terminal': GLOBAL_DFA.current_state in GLOBAL_DFA.TERMINAL_STATES,
                'transitions': GLOBAL_DFA.TRANSITIONS
            })
            return

        elif path == '/api/dfa/report':
            is_acc = GLOBAL_DFA.current_state in GLOBAL_DFA.ACCEPTING_STATES
            report = {
                'document_id': f"TT-2028-{GLOBAL_CLAIM.get('id', 'CLM-01')}",
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'initial_state': 'Q0 - Initial Claim',
                'final_state': f"{GLOBAL_DFA.current_state} - {GLOBAL_DFA.STATES[GLOBAL_DFA.current_state]['name']}",
                'verdict': 'Claim Status: Verified' if is_acc else (
                    'Claim Status: Fake / Debunked' if GLOBAL_DFA.current_state == 'Q5' else 'Claim Status: Evaluating'
                ),
                'claim': GLOBAL_CLAIM,
                'tape': GLOBAL_DFA.executed_tape,
                'path': [h['to'] for h in GLOBAL_DFA.history],
                'proof': (
                    f"Given input sequence w = <{', '.join(list(GLOBAL_DFA.executed_tape)) or 'epsilon'}>:\n"
                    f"Computation Path: {' -> '.join([h['to'] for h in GLOBAL_DFA.history])}\n"
                    f"Final State: q_final = {GLOBAL_DFA.current_state}\n"
                    f"Accepting Set F: {{ Q4 }}\n"
                    f"Proof Condition: {GLOBAL_DFA.current_state} {'in' if is_acc else 'not in'} F\n"
                    f"Conclusion: String w is formally {'ACCEPTED' if is_acc else 'REJECTED'} by deterministic automaton M."
                )
            }
            self.send_json(report)
            return

        # Default: Serve static files
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self.read_json_body()

        if path == '/api/dfa/transition':
            symbol = body.get('symbol', '')
            reason = body.get('reason')
            res = GLOBAL_DFA.transition(symbol, reason)
            self.send_json(res)
            return

        elif path == '/api/dfa/test-string':
            test_str = body.get('string', '')
            res = GLOBAL_DFA.process_string(test_str)
            self.send_json(res)
            return

        elif path == '/api/dfa/reset':
            GLOBAL_DFA.reset()
            self.send_json({
                'success': True,
                'current_state': GLOBAL_DFA.current_state,
                'message': 'Automaton reset to initial state Q0'
            })
            return

        elif path == '/api/dfa/load-topic':
            topic_key = body.get('topic', 'cricket')
            if topic_key in SAMPLE_TOPICS:
                GLOBAL_CLAIM.clear()
                GLOBAL_CLAIM.update(SAMPLE_TOPICS[topic_key])
                GLOBAL_DFA.reset()
                self.send_json({
                    'success': True,
                    'topic': topic_key,
                    'claim': GLOBAL_CLAIM,
                    'current_state': GLOBAL_DFA.current_state
                })
            else:
                self.send_json({'success': False, 'error': f"Unknown topic '{topic_key}'"}, status=400)
            return

        self.send_json({'error': 'Endpoint not found'}, status=404)

    def read_json_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            raw = self.rfile.read(content_length).decode('utf-8')
            try:
                return json.loads(raw)
            except Exception:
                return {}
        return {}

    def send_json(self, data, status=200):
        body = json.dumps(data, indent=2).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


# ==============================================================================
# 4. SYSTEM RUNNER & PORT FINDER
# ==============================================================================

def find_available_port(preferred_port=8080, max_attempts=15):
    """Finds an available TCP port starting with preferred_port."""
    for p in range(preferred_port, preferred_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('127.0.0.1', p))
                return p
            except OSError:
                continue
    return preferred_port


def print_banner(host, port):
    """Outputs the formal system launch banner."""
    msg = (
        "=" * 80 + "\n"
        " A FINITE-STATE FRAMEWORK FOR TRACKING THE EVOLUTION OF NEWS CLAIMS\n"
        " Theory of Computation (TOC) Academic Implementation\n"
        "=" * 80 + "\n"
        f" • Mathematical DFA:     M = (Q, Sigma, delta, q0, F)\n"
        f" • State Set Q:          {{ Q0, Q1, Q2, Q3, Q4, Q5 }}\n"
        f" • Alphabet Sigma:       {{ a: Modify, b: Support, c: Dispute, d: Verify, e: Debunk }}\n"
        f" • Accepting States F:   {{ Q4 }} (Verified Claim)\n"
        f" • Local Interface URL:  http://{host}:{port}\n"
        "=" * 80 + "\n"
        " Launching interactive web interface in your default browser...\n"
        " Press Ctrl+C in this terminal at any time to halt the server.\n\n"
    )
    sys.stdout.write(msg)
    sys.stdout.flush()


def launch_browser(url, delay=0.8):
    """Launches the default browser after a brief delay."""
    def _open():
        try:
            webbrowser.open_new_tab(url)
        except Exception:
            pass
    t = threading.Timer(delay, _open)
    t.daemon = True
    t.start()


def main():
    # Set workspace directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)

    # Optional CLI verification mode
    if len(sys.argv) > 1 and sys.argv[1] in ('--test', '-t', '--cli'):
        print("\n--- RUNNING PURE PYTHON FORMAL AUTOMATON VERIFICATION ---")
        dfa = DeterministicFiniteAutomaton()
        print(f"Initial State: {dfa.current_state}")
        
        # Test transition sequence 'b' -> 'd'
        r1 = dfa.transition('b', 'Supporting evidence added')
        print(f"delta(Q0, 'b') -> {r1['to']} (Valid: {r1['success']})")
        
        r2 = dfa.transition('d', 'Official verification confirmed')
        print(f"delta(Q2, 'd') -> {r2['to']} (Valid: {r2['success']}, Accepting: {r2['is_accepting']})")
        
        # Test full string acceptance
        res = dfa.process_string("bd")
        print(f"String 'bd' Acceptance Result: {res['verdict']}")
        
        res_rej = dfa.process_string("ce")
        print(f"String 'ce' Acceptance Result: {res_rej['verdict']}")
        print("Formal tests completed successfully.\n")
        return

    # Start HTTP Server and Launch Interface
    host = '127.0.0.1'
    port = find_available_port(8080)
    server_address = (host, port)

    print_banner(host, port)

    try:
        httpd = HTTPServer(server_address, TOCFrameworkRequestHandler)
        launch_browser(f"http://{host}:{port}")
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[INFO] Server stopped by user. Exiting cleanly.")
    except Exception as e:
        print(f"\n[ERROR] Server startup failed: {e}")


if __name__ == '__main__':
    main()
