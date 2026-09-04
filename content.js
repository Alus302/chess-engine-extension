// Chess Engine Extension - Content Script with Real-time Analysis
// Automatically detects board changes and shows move evaluations

console.log('Chess Engine content script loaded');

let analysisEnabled = false;
let stockfishEngine = null;
let engineReady = false;
let currentFEN = '';
let lastAnalyzedFEN = '';
let topMoves = [];
let boardHighlights = [];

// Initialize
chrome.storage.local.get(['enabled'], (result) => {
    analysisEnabled = result.enabled || false;
    console.log('Analysis enabled:', analysisEnabled);
    if (analysisEnabled) {
        initStockfish();
        startMonitoring();
    }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received:', message);
    
    if (message.type === 'toggleAnalysis') {
        analysisEnabled = message.enabled;
        if (analysisEnabled) {
            console.log('Starting analysis');
            initStockfish();
            startMonitoring();
        } else {
            console.log('Stopping analysis');
            clearAllHighlights();
            hidePanel();
        }
        sendResponse({ success: true });
    }
});

// Initialize Stockfish engine from CDN
function initStockfish() {
    if (engineReady) return;
    
    console.log('Initializing Stockfish...');
    
    try {
        // Load Stockfish from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/stockfish@15.1';
        script.onload = () => {
            console.log('Stockfish script loaded');
            
            // Wait for Stockfish to be available
            const checkStockfish = setInterval(() => {
                if (window.Stockfish) {
                    clearInterval(checkStockfish);
                    console.log('Stockfish available, creating instance');
                    
                    try {
                        stockfishEngine = window.Stockfish();
                        setupEngineHandlers();
                        engineReady = true;
                        
                        // Initialize engine
                        sendToEngine('uci');
                        console.log('Engine ready!');
                    } catch (error) {
                        console.error('Failed to create Stockfish instance:', error);
                    }
                }
            }, 100);
            
            // Timeout
            setTimeout(() => {
                if (!engineReady) {
                    console.error('Stockfish initialization timeout');
                }
            }, 5000);
        };
        
        script.onerror = () => {
            console.error('Failed to load Stockfish from CDN');
        };
        
        document.head.appendChild(script);
    } catch (error) {
        console.error('Error initializing Stockfish:', error);
    }
}

// Setup engine message handlers
function setupEngineHandlers() {
    if (!stockfishEngine) return;
    
    stockfishEngine.onmessage = (line) => {
        if (line && line.includes('bestmove')) {
            console.log('Best move line:', line);
            parseAnalysisLine(line);
        } else if (line && line.includes('info')) {
            parseInfoLine(line);
        }
    };
}

// Send command to engine
function sendToEngine(command) {
    if (!stockfishEngine || !engineReady) {
        console.log('Engine not ready');
        return;
    }
    
    try {
        console.log('Sending to engine:', command);
        stockfishEngine.postMessage(command);
    } catch (error) {
        console.error('Error sending to engine:', error);
    }
}

// Parse analysis info line
function parseInfoLine(line) {
    try {
        const parts = line.split(' ');
        let depth = 0;
        let score = 0;
        let pv = [];
        
        for (let i = 0; i < parts.length; i++) {
            if (parts[i] === 'depth') depth = parseInt(parts[i + 1]);
            if (parts[i] === 'score') {
                const type = parts[i + 1];
                const value = parseInt(parts[i + 2]);
                score = type === 'cp' ? value / 100 : value;
            }
            if (parts[i] === 'pv') {
                pv = parts.slice(i + 1, Math.min(i + 11, parts.length));
            }
        }
        
        // Update top moves from PV
        if (pv.length > 0 && depth >= 10) {
            updateTopMovesFromPV(pv, score);
            highlightBestMoves();
        }
    } catch (error) {
        console.error('Error parsing info line:', error);
    }
}

// Parse best move line
function parseAnalysisLine(line) {
    try {
        const parts = line.split(' ');
        const bestMove = parts[1];
        console.log('Best move found:', bestMove);
        
        if (bestMove && bestMove.length >= 4) {
            highlightBestMove(bestMove);
        }
    } catch (error) {
        console.error('Error parsing analysis line:', error);
    }
}

// Update top moves from principal variation
function updateTopMovesFromPV(pv, evaluation) {
    topMoves = [];
    
    pv.forEach((move, index) => {
        if (index < 10) {
            topMoves.push({
                move: move,
                eval: evaluation - (index * 0.1), // Rough approximation
                rank: index + 1,
                from: move.substring(0, 2),
                to: move.substring(2, 4)
            });
        }
    });
    
    console.log('Top moves updated:', topMoves);
    updatePanelMoves();
}

// Start monitoring board
function startMonitoring() {
    console.log('Starting board monitoring');
    
    setInterval(() => {
        if (!analysisEnabled || !engineReady) return;
        
        try {
            const fen = extractFEN();
            
            if (fen && fen !== lastAnalyzedFEN) {
                console.log('New position detected:', fen);
                lastAnalyzedFEN = fen;
                currentFEN = fen;
                
                showPanel();
                
                // Send to Stockfish
                sendToEngine('ucinewgame');
                sendToEngine('position fen ' + fen);
                sendToEngine('go depth 20');
            }
        } catch (error) {
            console.error('Error monitoring board:', error);
        }
    }, 500);
}

// Extract FEN from board
function extractFEN() {
    // Chess.com
    const chessComBoard = document.querySelector('[data-testid="chessboard"]');
    if (chessComBoard) {
        return extractChessComFEN();
    }
    
    // Lichess
    const lichessBoard = document.querySelector('cg-board');
    if (lichessBoard) {
        return extractLichessFEN();
    }
    
    return null;
}

// Extract Chess.com FEN
function extractChessComFEN() {
    try {
        const board = document.querySelector('[data-testid="chessboard"]');
        if (!board) return null;
        
        const pieces = [];
        
        // Extract pieces from board
        for (let rank = 7; rank >= 0; rank--) {
            let fenRank = '';
            let empty = 0;
            
            for (let file = 0; file < 8; file++) {
                const sq = String.fromCharCode(97 + file) + (rank + 1);
                const square = board.querySelector(`[data-square="${sq}"]`);
                
                if (square) {
                    const piece = getPiece(square);
                    if (piece) {
                        if (empty) fenRank += empty;
                        fenRank += piece;
                        empty = 0;
                    } else {
                        empty++;
                    }
                } else {
                    empty++;
                }
            }
            if (empty) fenRank += empty;
            pieces.push(fenRank || '8');
        }
        
        return pieces.join('/') + ' w KQkq - 0 1';
    } catch (error) {
        console.error('Error extracting chess.com FEN:', error);
        return null;
    }
}

// Extract Lichess FEN
function extractLichessFEN() {
    try {
        const board = document.querySelector('cg-board');
        if (!board) return null;
        
        const pieces = [];
        
        for (let rank = 7; rank >= 0; rank--) {
            let fenRank = '';
            let empty = 0;
            
            for (let file = 0; file < 8; file++) {
                const square = board.querySelector(`[data-square="${file}${rank}"]`);
                
                if (square) {
                    const piece = getPiece(square);
                    if (piece) {
                        if (empty) fenRank += empty;
                        fenRank += piece;
                        empty = 0;
                    } else {
                        empty++;
                    }
                } else {
                    empty++;
                }
            }
            if (empty) fenRank += empty;
            pieces.push(fenRank || '8');
        }
        
        return pieces.join('/') + ' w KQkq - 0 1';
    } catch (error) {
        console.error('Error extracting lichess FEN:', error);
        return null;
    }
}

// Get piece from square
function getPiece(square) {
    if (!square) return null;
    
    const classList = square.className;
    const html = square.innerHTML;
    
    // Map class names to pieces
    const classMap = {
        'wP': 'P', 'bP': 'p', 'wN': 'N', 'bN': 'n',
        'wB': 'B', 'bB': 'b', 'wR': 'R', 'bR': 'r',
        'wQ': 'Q', 'bQ': 'q', 'wK': 'K', 'bK': 'k'
    };
    
    for (const [key, value] of Object.entries(classMap)) {
        if (classList.includes(key)) return value;
    }
    
    // Check unicode
    const unicodeMap = {
        '♔': 'K', '♕': 'Q', '♖': 'R', '♗': 'B', '♘': 'N', '♙': 'P',
        '♚': 'k', '♛': 'q', '♜': 'r', '♝': 'b', '♞': 'n', '♟': 'p'
    };
    
    for (const [unicode, piece] of Object.entries(unicodeMap)) {
        if (html.includes(unicode)) return piece;
    }
    
    return null;
}

// Highlight best moves on board
function highlightBestMoves() {
    clearAllHighlights();
    
    if (!analysisEnabled || topMoves.length === 0) return;
    
    const board = document.querySelector('[data-testid="chessboard"]') || 
                  document.querySelector('cg-board');
    if (!board) return;
    
    // Highlight top 3 moves
    topMoves.slice(0, 3).forEach((move, index) => {
        const color = index === 0 ? '#4caf50' : index === 1 ? '#8bc34a' : '#cddc39';
        
        highlightSquare(board, move.from, color);
        highlightSquare(board, move.to, color);
        addMoveLabel(board, move.to, move.eval.toFixed(2), color);
    });
}

// Highlight single square
function highlightSquare(board, square, color) {
    if (!square || square.length !== 2) return;
    
    // Chess.com selector
    let sq = board.querySelector(`[data-square="${square}"]`);
    
    // Lichess selector
    if (!sq) {
        const file = square.charCodeAt(0) - 97;
        const rank = parseInt(square[1]) - 1;
        sq = board.querySelector(`[data-square="${file}${rank}"]`);
    }
    
    if (sq) {
        const highlight = document.createElement('div');
        highlight.className = 'chess-engine-highlight';
        highlight.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${color};
            opacity: 0.3;
            pointer-events: none;
            z-index: 100;
        `;
        
        sq.style.position = 'relative';
        sq.appendChild(highlight);
        boardHighlights.push(highlight);
    }
}

// Add move evaluation label
function addMoveLabel(board, square, evaluation, color) {
    let sq = board.querySelector(`[data-square="${square}"]`);
    
    if (!sq) {
        const file = square.charCodeAt(0) - 97;
        const rank = parseInt(square[1]) - 1;
        sq = board.querySelector(`[data-square="${file}${rank}"]`);
    }
    
    if (sq) {
        const label = document.createElement('div');
        label.className = 'chess-engine-label';
        label.textContent = '+' + evaluation;
        label.style.cssText = `
            position: absolute;
            bottom: 2px;
            right: 2px;
            background: rgba(0, 0, 0, 0.8);
            color: ${color};
            padding: 2px 4px;
            font-size: 10px;
            font-weight: bold;
            border-radius: 2px;
            pointer-events: none;
            z-index: 200;
        `;
        
        sq.style.position = 'relative';
        sq.appendChild(label);
        boardHighlights.push(label);
    }
}

// Highlight best move in green
function highlightBestMove(move) {
    if (!move || move.length < 4) return;
    
    const from = move.substring(0, 2);
    const to = move.substring(2, 4);
    
    const board = document.querySelector('[data-testid="chessboard"]') || 
                  document.querySelector('cg-board');
    if (!board) return;
    
    highlightSquare(board, from, '#4caf50');
    highlightSquare(board, to, '#4caf50');
}

// Clear all highlights
function clearAllHighlights() {
    boardHighlights.forEach(h => {
        try {
            h.remove();
        } catch (e) {}
    });
    boardHighlights = [];
}

// Show floating panel
function showPanel() {
    let panel = document.getElementById('chess-engine-panel');
    
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'chess-engine-panel';
        panel.style.cssText = `
            position: fixed;
            right: 20px;
            top: 20px;
            width: 300px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: Arial, sans-serif;
            padding: 0;
            overflow: hidden;
        `;
        
        panel.innerHTML = `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 16px;">♟️ Chess Engine</h3>
                <button id="closePanel" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">✕</button>
            </div>
            <div style="padding: 15px;">
                <div id="engineMovesList" style="max-height: 400px; overflow-y: auto;"></div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        document.getElementById('closePanel').addEventListener('click', () => {
            panel.style.display = 'none';
        });
    }
    
    panel.style.display = 'block';
    updatePanelMoves();
}

// Update panel with moves
function updatePanelMoves() {
    const movesList = document.getElementById('engineMovesList');
    if (!movesList) return;
    
    if (topMoves.length === 0) {
        movesList.innerHTML = '<div style="color: #999; text-align: center; padding: 20px;">Analyzing...</div>';
        return;
    }
    
    movesList.innerHTML = topMoves.slice(0, 10).map((m, i) => `
        <div style="padding: 10px; background: ${i === 0 ? '#e8f5e9' : '#f5f5f5'}; margin-bottom: 6px; border-radius: 4px; border-left: 4px solid ${i === 0 ? '#4caf50' : '#667eea'};">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold;">#${i + 1} ${m.move}</span>
                <span style="color: ${m.eval > 0 ? '#4caf50' : '#d32f2f'}; font-weight: bold;">
                    ${m.eval > 0 ? '+' : ''}${m.eval.toFixed(2)}
                </span>
            </div>
        </div>
    `).join('');
}

// Hide panel
function hidePanel() {
    const panel = document.getElementById('chess-engine-panel');
    if (panel) panel.style.display = 'none';
}

console.log('Chess Engine content script ready');
