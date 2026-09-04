// Chess Engine Extension - Popup Script
// Manages communication with content script and Stockfish engine

let analysisEnabled = false;
let currentFEN = '';
let topMoves = [];
let currentStats = {};

const toggleBtn = document.getElementById('toggleBtn');
const settingsBtn = document.getElementById('settingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const boardSection = document.getElementById('boardSection');
const settingsPanel = document.getElementById('settingsPanel');
const status = document.getElementById('status');
const movesList = document.getElementById('movesList');
const fenInput = document.getElementById('fenInput');
const copyFenBtn = document.getElementById('copyFenBtn');

// Load initial state
chrome.storage.local.get(['enabled', 'settings'], (result) => {
    analysisEnabled = result.enabled || false;
    updateUI();
    
    if (result.settings) {
        document.getElementById('highlightBestMove').checked = result.settings.highlightBestMove;
        document.getElementById('highlightPoor').checked = result.settings.highlightPoor;
        document.getElementById('autoAnalysis').checked = result.settings.autoAnalysis;
        document.getElementById('engineDepth').value = result.settings.engineDepth;
        document.getElementById('showArrows').checked = result.settings.showArrows;
    }
});

// Toggle analysis button
toggleBtn.addEventListener('click', () => {
    analysisEnabled = !analysisEnabled;
    chrome.storage.local.set({ enabled: analysisEnabled });
    
    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'toggleAnalysis',
                enabled: analysisEnabled
            }).catch(err => {
                console.log('Content script not available:', err);
            });
        }
    });
    
    updateUI();
});

// Settings button
settingsBtn.addEventListener('click', () => {
    boardSection.style.display = 'none';
    settingsPanel.style.display = 'block';
});

// Close settings
closeSettingsBtn.addEventListener('click', () => {
    saveSettings();
    settingsPanel.style.display = 'none';
    boardSection.style.display = 'block';
});

// Copy FEN button
copyFenBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(fenInput.value).then(() => {
        const originalText = copyFenBtn.textContent;
        copyFenBtn.textContent = '✓ Copied!';
        setTimeout(() => {
            copyFenBtn.textContent = originalText;
        }, 2000);
    });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'updateAnalysis') {
        currentFEN = message.fen;
        topMoves = message.moves || [];
        currentStats = message.stats || {};
        
        fenInput.value = currentFEN;
        displayMoves();
        updateStats(currentStats);
    } else if (message.type === 'statusUpdate') {
        updateStatus(message.status);
    }
});

/**
 * Update UI based on analysis state
 */
function updateUI() {
    if (analysisEnabled) {
        toggleBtn.textContent = '⏸ Stop Analysis';
        toggleBtn.style.background = '#d32f2f';
        boardSection.style.display = 'block';
        status.textContent = '🟢 Active';
        status.className = 'status active';
    } else {
        toggleBtn.textContent = '▶ Start Analysis';
        toggleBtn.style.background = '#667eea';
        boardSection.style.display = 'none';
        status.textContent = '⚪ Inactive';
        status.className = 'status';
    }
}

/**
 * Display top moves
 */
function displayMoves() {
    movesList.innerHTML = '';
    
    if (topMoves.length === 0) {
        movesList.innerHTML = '<div class="loading">No analysis available yet...</div>';
        return;
    }
    
    topMoves.forEach((move, index) => {
        const moveEl = document.createElement('div');
        moveEl.className = 'move-item';
        
        // Add classes based on move quality
        if (index === 0) {
            moveEl.classList.add('best');
        } else if (move.evaluation < -0.3) {
            moveEl.classList.add('poor');
        }
        
        // Format evaluation
        const evalValue = move.evaluation > 0 ? '+' : '';
        const evalClass = move.evaluation > 0 ? 'positive' : move.evaluation < 0 ? 'negative' : '';
        
        // Create bar width based on evaluation
        const barWidth = Math.min(Math.abs(move.evaluation) * 30, 60);
        
        moveEl.innerHTML = `
            <div class="move-info">
                <span class="move-rank">#${index + 1}</span>
                <span class="move-notation">${move.san || 'N/A'}</span>
            </div>
            <div class="move-evaluation">
                <div class="eval-bar">
                    <div class="eval-bar-fill" style="width: ${barWidth}px;"></div>
                </div>
                <span class="eval-value ${evalClass}">${evalValue}${move.evaluation.toFixed(2)}</span>
            </div>
        `;
        
        movesList.appendChild(moveEl);
    });
}

/**
 * Update statistics display
 */
function updateStats(stats) {
    const evalEl = document.getElementById('evaluation');
    const depthEl = document.getElementById('depth');
    const npsEl = document.getElementById('nodesPerSec');
    
    if (evalEl) {
        const evalStr = stats.evaluation > 0 ? '+' : '';
        evalEl.textContent = evalStr + (stats.evaluation || 0).toFixed(2);
    }
    
    if (depthEl) {
        depthEl.textContent = stats.depth || 0;
    }
    
    if (npsEl) {
        const nps = stats.nodesPerSec || 0;
        if (nps > 1000000) {
            npsEl.textContent = (nps / 1000000).toFixed(2) + 'M';
        } else if (nps > 1000) {
            npsEl.textContent = (nps / 1000).toFixed(2) + 'K';
        } else {
            npsEl.textContent = nps;
        }
    }
}

/**
 * Update status display
 */
function updateStatus(statusText) {
    status.textContent = statusText;
}

/**
 * Save settings
 */
function saveSettings() {
    const settings = {
        highlightBestMove: document.getElementById('highlightBestMove').checked,
        highlightPoor: document.getElementById('highlightPoor').checked,
        autoAnalysis: document.getElementById('autoAnalysis').checked,
        engineDepth: parseInt(document.getElementById('engineDepth').value),
        showArrows: document.getElementById('showArrows').checked
    };
    
    chrome.storage.local.set({ settings });
    
    // Send to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'updateSettings',
                settings: settings
            }).catch(err => {
                console.log('Content script not available:', err);
            });
        }
    });
}

// Update settings live
document.getElementById('engineDepth').addEventListener('change', saveSettings);
document.getElementById('highlightBestMove').addEventListener('change', saveSettings);
document.getElementById('highlightPoor').addEventListener('change', saveSettings);
document.getElementById('autoAnalysis').addEventListener('change', saveSettings);
document.getElementById('showArrows').addEventListener('change', saveSettings);
