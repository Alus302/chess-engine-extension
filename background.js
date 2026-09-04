// Chess Engine Extension - Background Service Worker
// Manages extension lifecycle and cross-tab communication

const EXTENSION_VERSION = '1.0.0';

// Initialize on install
chrome.runtime.onInstalled.addListener((details) => {
    // Set default storage values
    chrome.storage.local.set({
        enabled: false,
        settings: {
            highlightBestMove: true,
            highlightPoor: true,
            autoAnalysis: true,
            engineDepth: 15,
            showArrows: true
        }
    });
    
    if (details.reason === 'install') {
        console.log('Chess Engine Extension installed');
        // Open welcome page
        chrome.tabs.create({
            url: chrome.runtime.getURL('README_WELCOME.html')
        });
    } else if (details.reason === 'update') {
        console.log('Chess Engine Extension updated to', EXTENSION_VERSION);
    }
});

// Inject content script on chess sites
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        if (tab.url.includes('chess.com') || tab.url.includes('lichess.org')) {
            // Content script should auto-inject, but we can verify
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            }).catch(err => {
                // Already injected or not needed
                console.log('Injection status:', err.message);
            });
        }
    }
});

// Update badge when analysis is enabled
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.enabled) {
        const enabled = changes.enabled.newValue;
        
        if (enabled) {
            chrome.action.setBadgeText({ text: '✓' });
            chrome.action.setBadgeBackgroundColor({ color: '#4caf50' });
        } else {
            chrome.action.setBadgeText({ text: '' });
        }
    }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'updateAnalysis') {
        // Forward to popup
        chrome.runtime.sendMessage(message).catch(() => {
            // Popup not open
        });
    } else if (message.type === 'statusUpdate') {
        // Forward to popup
        chrome.runtime.sendMessage(message).catch(() => {
            // Popup not open
        });
    }
});

// Monitor for errors
chrome.runtime.onError = (error) => {
    console.error('Extension error:', error);
};

// Context menu for quick analysis toggle
chrome.contextMenus.create({
    id: 'toggle-analysis',
    title: 'Toggle Chess Analysis',
    contexts: ['page'],
    documentUrlPatterns: ['https://www.chess.com/*', 'https://lichess.org/*']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'toggle-analysis') {
        chrome.storage.local.get(['enabled'], (result) => {
            const newState = !result.enabled;
            chrome.storage.local.set({ enabled: newState });
            
            chrome.tabs.sendMessage(tab.id, {
                type: 'toggleAnalysis',
                enabled: newState
            }).catch(err => {
                console.log('Could not send message to tab');
            });
        });
    }
});

// Periodic cleanup (every hour)
chrome.alarms.create('cleanup', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'cleanup') {
        console.log('Running periodic cleanup');
        // Clean up storage if needed
    }
});

console.log('Chess Engine background worker initialized');
