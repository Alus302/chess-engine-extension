// Chess Engine Extension - Content Script with Proper Stockfish Integration
// Real-time analysis with automatic board detection

console.log('🎯 Chess Engine content script loaded');

let analysisEnabled = false;
let stockfishWorker = null;
let engineReady = false;
let currentFEN = '';
let lastAnalyzedFEN = '';
let topMoves = [];
let boardHighlights = [];
let analyzeTimeout = null;

// Initialize on load
chrome.storage.local.get(['enabled'], (result) => {
    analysisEnabled = result.enabled || false;
    console.log('Analysis enabled:', analysisEnabled);
    if (analysisEnabled) {
        initializeEngine();
        startBoardMonitoring();
    }
});

// Listen for toggle messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📨 Message received:', message.type);
    
    if (message.type === 'toggleAnalysis') {
        analysisEnabled = message.enabled;
        
        if (analysisEnabled) {
            console.log('✅ Starting analysis');
            initializeEngine();
            startBoardMonitoring();
        } else {
            console.log('⏸ Stopping analysis');
            clearAllHighlights();
            hidePanel();
            if (stockfishWorker) {
                stockfishWorker.postMessage({ type: 'stop' });
            }
        }
        sendResponse({ success: true });
    }
});

// Initialize Stockfish engine
function initializeEngine() {
    if (engineReady) {
        console.log('Engine already ready');
        return;
    }
    
    console.log('🚀 Initializing Stockfish engine...');
    
    try {
        // Load Stockfish from CDN as worker
        const workerCode = `
            let stockfish = null;
            let ready = false;
            
            importScripts('https://cdn.jsdelivr.net/npm/stockfish@15.1');
            
            self.onmessage = function(e) {
                if (e.data.type === 'init') {
                    try {
                        stockfish = Stockfish();
                        ready = true;
                        self.postMessage({ type: 'ready' });
                    } catch(err) {
                        self.postMessage({ type: 'error', message: err.message });
                    }
                } else if (e.data.type === 'command') {
                    if (stockfish && ready) {
                        stockfish.postMessage(e.data.command);
                    }
                } else if (e.data.type === 'stop') {
                    if (stockfish) {
                        stockfish.postMessage('stop');
                    }
                }
            };
            
            // Capture engine output
            let originalPostMessage = self.postMessage.bind(self);
            self.engineOutput = function(line) {
                self.postMessage({ type: 'output', data: line });
            };
        `;
        
        // Create worker blob
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        
        stockfishWorker = new Worker(workerUrl);
        
        stockfishWorker.onmessage = handleEngineMessage;
        stockfishWorker.onerror = (error) => {
            console.error('❌ Worker error:', error);
            
            // Fallback: Load Stockfish directly
            console.log('Trying direct Stockfish load...');
            loadStockfishDirect();
        };
        
        stockfishWorker.postMessage({ type: 'init' });
        
        // Timeout
        setTimeout(() => {
            if (!engineReady) {
                console.warn('⚠️ Engine init timeout, trying direct load...');
                loadStockfishDirect();
            }
        }, 3000);
        
    } catch (error) {
        console.error('❌ Worker creation failed:', error);
        loadStockfishDirect();
    }
}

// Direct Stockfish loading (fallback)
function loadStockfishDirect() {
    console.log('Loading Stockfish directly from CDN...');
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/stockfish@15.1';
    
    script.onload = () => {
        console.log('Stockfish script loaded');
        
        setTimeout(() => {
            if (window.Stockfish) {
                try {
                    const engine = window.Stockfish();
                    engineReady = true;
                    console.log('✅ Engine ready (direct load)');
                    
                    // Send init command
                    engine.postMessage('uci');
                    
                    // Mock worker for compatibility
                    stockfishWorker = {
                        postMessage: (msg) => {
                            if (typeof msg === 'string') {
                                engine.postMessage(msg);
                            } else if (msg.type === 'command') {
                                engine.postMessage(msg.command);
                            }
                        }
                    };
                } catch (err) {
                    console.error('Failed to create engine:', err);
                }
            }
        }, 500);
    };
    
    script.onerror = () => {
        console.error('❌ Failed to load Stockfish');
    };
    
    document.head.appendChild(script);
}

// Handle engine messages
function handleEngineMessage(e) {
    const msg = e.data;
    
    if (msg.type === 'ready') {
        engineReady = true;
        console.log('✅ Engine ready');
        sendEngineCommand('uci');
    } else if (msg.type === 'output') {
        parseEngineOutput(msg.data);
    } else if (msg.type === 'error') {
        console.error('Engine error:', msg.message);
    }
}

// Send command to engine
function sendEngineCommand(command) {
    if (!stockfishWorker || !engineReady) {
        console.log('⚠️ Engine not ready');
        return;
    }
    
    try {
        if (stockfishWorker.postMessage) {
            stockfishWorker.postMessage({ type: 'command', command: command });
        }
    } catch (error) {
        console.error('Error sending command:', error);
    }
}

// Parse engine output
function parseEngineOutput(line) {
    if (!line) return;
    
    console.log('📊 Engine:', line);
    
    // Parse info line
    if (line.includes('info')) {
        parseInfoLine(line);
    }
    
    // Parse best move
    if (line.includes('bestmove')) {
        parseBestMove(line);
    }
}

// Parse info line with moves and evaluations
function parseInfoLine(line) {
    try {
        const parts = line.split(' ');
        let depth = 0;
        let score = 0;
        let pv = [];
        
        for (let i = 0; i < parts.length; i++) {
            if (parts[i] === 'depth') {
                depth = parseInt(parts[i + 1]);
            }
            if (parts[i] === 'score') {
                const type = parts[i + 1];
                const value = parseInt(parts[i + 2]);
                score = type === 'cp' ? value / 100 : value;
            }
            if (parts[i] === 'pv') {
                pv = parts.slice(i + 1, Math.min(i + 15, parts.length));
            }
        }
        
        // Update moves if deep enough
        if (pv.length > 0 && depth >= 12) {
            updateTopMoves(pv, score);
            highlightMoves();
            updatePanel();
        }
    } catch (error) {
        console.error('Parse error:', error);
    }
}

// Parse best move
function parseBestMove(line) {
    try {
        const match = line.match(/bestmove\s+(\S+)/);
        if (match) {
            const move = match[1];
            console.log('🏆 Best move:', move);
            highlightBestMove(move);
        }
    } catch (error) {
        console.error('Best move parse error:', error);
    }
}

// Update top moves list
function updateTopMoves(pv, baseEval) {
    topMoves = [];
    
    pv.forEach((move, index) => {
        if (index < 10 && move.length >= 4) {
            topMoves.push({
                san: move,
                eval: baseEval,
                rank: index + 1,
                from: move.substring(0, 2),
                to: move.substring(2, 4)
            });
        }
    });
    
    console.log('📋 Top moves:', topMoves.length);
}

// Start monitoring board changes
function startBoardMonitoring() {
    console.log('👀 Starting board monitoring');
    
    const interval = setInterval(() => {
        if (!analysisEnabled) {
            clearInterval(interval);
            return;
        }
        
        if (!engineReady) {
            return;
        }
        
        try {
            const fen = extractBoardFEN();
            
            if (fen && fen !== lastAnalyzedFEN) {
                console.log('🔄 New position detected');
                lastAnalyzedFEN = fen;
                currentFEN = fen;
                
                showPanel();
                
                // Analyze position
                clearTimeout(analyzeTimeout);
                analyzeTimeout = setTimeout(() => {
                    sendEngineCommand('ucinewgame');
                    sendEngineCommand('position fen ' + fen);
                    sendEngineCommand('go depth 18');
                }, 100);
            }
        } catch (error) {
            console.error('Monitoring error:', error);
        }
    }, 300);
}

// Extract FEN from board
function extractBoardFEN() {
    // Try chess.com first
    const chessComBoard = document.querySelector('[data-testid="chessboard"]');
    if (chessComBoard) {
        return extractChessComFEN(chessComBoard);
    }
    
    // Try lichess
    const lichessBoard = document.querySelector('cg-board');
    if (lichessBoard) {
        return extractLichessFEN(lichessBoard);
    }
    
    return null;
}

// Extract Chess.com FEN
function extractChessComFEN(board) {
    try {
        let fen = '';
        
        // Scan board from rank 8 to 1
        for (let rank = 8; rank >= 1; rank--) {
            let rankStr = '';
            let emptyCount = 0;
            
            // Scan files a-h
            for (let file = 0; file < 8; file++) {
                const fileChar = String.fromCharCode(97 + file);
                const squareId = fileChar + rank;
                const square = board.querySelector(`[data-square="${squareId}"]`);
                
                if (square) {
                    const piece = detectPiece(square);
                    
                    if (piece) {
                        if (emptyCount > 0) {
                            rankStr += emptyCount;
                            emptyCount = 0;
                        }
                        rankStr += piece;
                    } else {
                        emptyCount++;
                    }
                } else {
                    emptyCount++;
                }
            }
            
            if (emptyCount > 0) rankStr += emptyCount;
            fen += rankStr;
            
            if (rank > 1) fen += '/';
        }
        
        // Add standard ending
        return fen + ' w KQkq - 0 1';
    } catch (error) {
        console.error('Chess.com FEN extract error:', error);
        return null;
    }
}

// Extract Lichess FEN
function extractLichessFEN(board) {
    try {
        let fen = '';
        
        for (let rank = 7; rank >= 0; rank--) {
            let rankStr = '';
            let emptyCount = 0;
            
            for (let file = 0; file < 8; file++) {
                const square = board.querySelector(`[data-square="${file}${rank}"]`) ||
                              board.querySelector(`[data-rank="${rank}"][data-file="${file}"]`);
                
                if (square) {
                    const piece = detectPiece(square);
                    
                    if (piece) {
                        if (emptyCount > 0) {
                            rankStr += emptyCount;
                            emptyCount = 0;
                        }
                        rankStr += piece;
                    } else {
                        emptyCount++;
                    }
                } else {
                    emptyCount++;
                }
            }
            
            if (emptyCount > 0) rankStr += emptyCount;
            fen += rankStr;
            
            if (rank > 0) fen += '/';
        }
        
        return fen + ' w KQkq - 0 1';
    } catch (error) {
        console.error('Lichess FEN extract error:', error);
        return null;
    }
}

// Detect piece on square
function detectPiece(square) {
    if (!square) return null;
    
    const classes = square.className || '';
    const html = square.innerHTML || '';
    const text = square.textContent || '';
    
    // Check class-based detection
    const classMap = {
        'wP': 'P', 'bP': 'p',
        'wN': 'N', 'bN': 'n',
        'wB': 'B', 'bB': 'b',
        'wR': 'R', 'bR': 'r',
        'wQ': 'Q', 'bQ': 'q',
        'wK': 'K', 'bK': 'k'
    };
    
    for (const [cls, piece] of Object.entries(classMap)) {
        if (classes.includes(cls)) return piece;
    }
    
    // Check for piece emoji/unicode
    const pieceMap = {
        '♔': 'K', '♕': 'Q', '♖': 'R', '♗': 'B', '♘': 'N', '♙': 'P',
        '♚': 'k', '♛': 'q', '♜': 'r', '♝': 'b', '♞': 'n', '♟': 'p'
    };
    
    for (const [symbol, piece] of Object.entries(pieceMap)) {
        if (html.includes(symbol) || text.includes(symbol)) return piece;
    }
    
    // Check for SVG or other piece representations
    const svg = square.querySelector('svg');
    if (svg) {
        const svgClass = svg.className?.baseVal || svg.getAttribute('class') || '';
        for (const [cls, piece] of Object.entries(classMap)) {
            if (svgClass.includes(cls)) return piece;
        }
    }
    
    return null;
}

// Highlight best moves on board
function highlightMoves() {
    clearAllHighlights();
    
    if (!analysisEnabled || topMoves.length === 0) return;
    
    const board = document.querySelector('[data-testid="chessboard"]') || 
                  document.querySelector('cg-board');
    if (!board) return;
    
    // Highlight top 3 moves
    topMoves.slice(0, 3).forEach((move, idx) => {
        const colors = ['#4caf50', '#8bc34a', '#ffc107'];
        const color = colors[idx];
        
        // Highlight from and to squares
        addSquareHighlight(board, move.from, color);
        addSquareHighlight(board, move.to, color);
        
        // Add evaluation label
        addEvaluationLabel(board, move.to, move.eval.toFixed(2));
    });
}

// Add highlight to square
function addSquareHighlight(board, squareId, color) {
    if (!squareId || squareId.length !== 2) return;
    
    let square = board.querySelector(`[data-square="${squareId}"]`);
    
    if (!square) {
        const file = squareId.charCodeAt(0) - 97;
        const rank = parseInt(squareId[1]) - 1;
        square = board.querySelector(`[data-file="${file}"][data-rank="${rank}"]`) ||
                board.querySelector(`[data-square="${file}${rank}"]`);
    }
    
    if (!square) return;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'chess-highlight-overlay';
    overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: ${color};
        opacity: 0.35;
        pointer-events: none;
        z-index: 50;
        border-radius: 4px;
    `;
    
    square.style.position = 'relative';
    square.appendChild(overlay);
    boardHighlights.push(overlay);
}

// Add evaluation label to square
function addEvaluationLabel(board, squareId, evalStr) {
    if (!squareId || squareId.length !== 2) return;
    
    let square = board.querySelector(`[data-square="${squareId}"]`);
    
    if (!square) {
        const file = squareId.charCodeAt(0) - 97;
        const rank = parseInt(squareId[1]) - 1;
        square = board.querySelector(`[data-file="${file}"][data-rank="${rank}"]`) ||
                board.querySelector(`[data-square="${file}${rank}"]`);
    }
    
    if (!square) return;
    
    const label = document.createElement('div');
    label.className = 'chess-eval-label';
    label.textContent = '+' + evalStr;
    label.style.cssText = `
        position: absolute;
        bottom: 2px;
        right: 2px;
        background: rgba(0, 0, 0, 0.85);
        color: #4caf50;
        padding: 2px 4px;
        font-size: 11px;
        font-weight: bold;
        border-radius: 2px;
        pointer-events: none;
        z-index: 100;
        font-family: monospace;
    `;
    
    square.style.position = 'relative';
    square.appendChild(label);
    boardHighlights.push(label);
}

// Highlight best move
function highlightBestMove(moveStr) {
    if (!moveStr || moveStr.length < 4) return;
    
    const board = document.querySelector('[data-testid="chessboard"]') || 
                  document.querySelector('cg-board');
    if (!board) return;
    
    const from = moveStr.substring(0, 2);
    const to = moveStr.substring(2, 4);
    
    addSquareHighlight(board, from, '#4caf50');
    addSquareHighlight(board, to, '#4caf50');
}

// Clear all highlights
function clearAllHighlights() {
    boardHighlights.forEach(element => {
        try {
            element.remove();
        } catch (e) {}
    });
    boardHighlights = [];
}

// Show floating panel
function showPanel() {
    let panel = document.getElementById('chess-engine-analysis-panel');
    
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'chess-engine-analysis-panel';
        panel.style.cssText = `
            position: fixed;
            right: 20px;
            top: 20px;
            width: 320px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.25);
            z-index: 10000;
            font-family: Arial, sans-serif;
            overflow: hidden;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
        `;
        
        panel.innerHTML = `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
                <h3 style="margin: 0; font-size: 16px; font-weight: bold;">♟️ Analiza Szachów</h3>
                <button id="closeAnalysisPanel" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0;">✕</button>
            </div>
            <div id="movesList" style="padding: 12px; overflow-y: auto; flex: 1;"></div>
        `;
        
        document.body.appendChild(panel);
        
        document.getElementById('closeAnalysisPanel').addEventListener('click', () => {
            panel.style.display = 'none';
        });
    }
    
    panel.style.display = 'flex';
}

// Update panel with moves
function updatePanel() {
    const movesList = document.getElementById('movesList');
    if (!movesList) return;
    
    if (topMoves.length === 0) {
        movesList.innerHTML = '<div style="color: #999; text-align: center; padding: 20px; font-size: 13px;">Analizuję pozycję...</div>';
        return;
    }
    
    movesList.innerHTML = topMoves.slice(0, 10).map((m, i) => {
        const isBest = i === 0;
        const bgColor = isBest ? '#e8f5e9' : '#f5f5f5';
        const borderColor = isBest ? '#4caf50' : '#667eea';
        const evalColor = m.eval > 0 ? '#4caf50' : m.eval < 0 ? '#d32f2f' : '#333';
        
        return `
            <div style="padding: 10px; background: ${bgColor}; margin-bottom: 6px; border-radius: 6px; border-left: 4px solid ${borderColor}; font-size: 13px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: bold; color: ${borderColor};">#${i + 1} ${m.san}</span>
                    <span style="color: ${evalColor}; font-weight: bold; font-family: monospace;">
                        ${m.eval > 0 ? '+' : ''}${m.eval.toFixed(2)}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// Hide panel
function hidePanel() {
    const panel = document.getElementById('chess-engine-analysis-panel');
    if (panel) panel.style.display = 'none';
}

console.log('✅ Chess Engine ready!');
