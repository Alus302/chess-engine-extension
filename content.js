// Chess Engine Extension - Content Script
// Runs on chess.com and lichess.org

console.log('Chess Engine content script loaded');

let analysisEnabled = false;
let currentSettings = {};

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content received:', message);
    
    if (message.type === 'toggleAnalysis') {
        analysisEnabled = message.enabled;
        if (analysisEnabled) {
            console.log('Analysis enabled');
            createFloatingPanel();
            startBoardMonitoring();
        } else {
            console.log('Analysis disabled');
            hideFloatingPanel();
        }
        sendResponse({ success: true });
    } else if (message.type === 'updateSettings') {
        currentSettings = message.settings;
        sendResponse({ success: true });
    }
});

// Create floating panel
function createFloatingPanel() {
    if (document.getElementById('chess-engine-panel')) {
        document.getElementById('chess-engine-panel').style.display = 'block';
        return;
    }
    
    const panel = document.createElement('div');
    panel.id = 'chess-engine-panel';
    panel.style.cssText = `
        position: fixed;
        right: 20px;
        top: 20px;
        width: 300px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        z-index: 9999;
        font-family: Arial, sans-serif;
        padding: 0;
        overflow: hidden;
    `;
    
    panel.innerHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 16px;">♟️ Chess Engine</h3>
            <button onclick="document.getElementById('chess-engine-panel').style.display='none'" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">✕</button>
        </div>
        <div style="padding: 15px;">
            <div id="engineStatus" style="text-align: center; color: #666; padding: 20px;">
                Monitoring board...
            </div>
            <div id="engineMoves" style="max-height: 300px; overflow-y: auto;"></div>
        </div>
    `;
    
    document.body.appendChild(panel);
}

// Hide floating panel
function hideFloatingPanel() {
    const panel = document.getElementById('chess-engine-panel');
    if (panel) {
        panel.style.display = 'none';
    }
}

// Monitor board
function startBoardMonitoring() {
    const interval = setInterval(() => {
        if (!analysisEnabled) {
            clearInterval(interval);
            return;
        }
        
        const fen = extractFEN();
        if (fen) {
            const status = document.getElementById('engineStatus');
            if (status) {
                status.textContent = 'Position: ' + fen.substring(0, 30) + '...';
            }
            updateMovesList(fen);
        }
    }, 1000);
}

// Extract FEN from board
function extractFEN() {
    // Try chess.com
    const chessComBoard = document.querySelector('[data-testid="chessboard"]');
    if (chessComBoard) {
        return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    }
    
    // Try lichess
    const lichessBoard = document.querySelector('cg-board');
    if (lichessBoard) {
        return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    }
    
    return null;
}

// Update moves list
function updateMovesList(fen) {
    const movesList = document.getElementById('engineMoves');
    if (!movesList) return;
    
    // Show sample moves
    const moves = [
        { san: 'e4', eval: '+0.25' },
        { san: 'd4', eval: '+0.20' },
        { san: 'c4', eval: '+0.18' },
        { san: 'Nf3', eval: '+0.15' },
        { san: 'Nc3', eval: '+0.12' }
    ];
    
    if (movesList.innerHTML === '') {
        movesList.innerHTML = moves.map((m, i) => `
            <div style="padding: 8px; background: #f5f5f5; border-radius: 4px; margin-bottom: 4px; display: flex; justify-content: space-between;">
                <span style="font-weight: bold;">\#${i+1} ${m.san}</span>
                <span style="color: ${m.eval.includes('+') ? '#4caf50' : '#d32f2f'};">${m.eval}</span>
            </div>
        `).join('');
    }
}

console.log('Chess Engine content script ready');
