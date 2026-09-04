# Stockfish Setup Guide

This guide explains how to properly configure Stockfish.js for the Chess Engine Extension.

## Option 1: CDN (Recommended for Quick Start)

The extension uses Stockfish from a CDN by default:

```javascript
https://cdn.jsdelivr.net/npm/stockfish@15.1
```

This is already configured in `content.js` and will work out of the box.

## Option 2: Local Stockfish (For Development/Offline)

If you want to use a local Stockfish binary:

### Step 1: Download Stockfish

```bash
# Download Stockfish 15.1
wget https://github.com/official-stockfish/Stockfish/releases/download/sf_15.1/stockfish-windows-x86_64-bmi2.zip

# Or for other platforms:
# Linux: stockfish-ubuntu-x86_64-bmi2.zip
# macOS: stockfish-macos-12-x86_64.zip
```

### Step 2: Extract Files

```bash
unzip stockfish-windows-x86_64-bmi2.zip
# You should have: stockfish-windows-x86_64-bmi2.exe
```

### Step 3: Update Extension Files

Create `stockfish-local.js`:

```javascript
// Load local Stockfish binary
const STOCKFISH_PATH = chrome.runtime.getURL('stockfish/stockfish');

class LocalStockfish {
    constructor() {
        this.process = null;
        this.callbacks = [];
    }

    async init() {
        // For browser extensions, we can't directly run executables
        // Use Stockfish.js WebAssembly instead (see Option 3)
    }
}
```

### Step 4: Update manifest.json

```json
{
    "web_accessible_resources": [
        {
            "resources": ["stockfish/stockfish"],
            "matches": ["https://www.chess.com/*", "https://lichess.org/*"]
        }
    ]
}
```

## Option 3: WebAssembly WASM (Best for Extensions)

Stockfish.js uses WebAssembly for maximum compatibility:

### Automatic Setup

The extension handles this automatically via the CDN. WASM files are downloaded automatically.

### Manual Setup

If you want to bundle WASM locally:

```bash
# Install Stockfish.js NPM package
npm install stockfish

# Copy WASM files
cp node_modules/stockfish/dist/stockfish.wasm ./
cp node_modules/stockfish/dist/stockfish.js ./
```

Update `manifest.json`:

```json
{
    "web_accessible_resources": [
        {
            "resources": ["stockfish.js", "stockfish.wasm"],
            "matches": ["https://www.chess.com/*", "https://lichess.org/*"]
        }
    ]
}
```

Update `content.js`:

```javascript
// Use local Stockfish instead of CDN
const script = document.createElement('script');
script.src = chrome.runtime.getURL('stockfish.js');
```

## Stockfish Command Reference

The engine supports standard UCI commands:

```
uci                 - Identify engine
isready             - Check if ready
position fen <fen>  - Set position
go depth <d>        - Analyze to depth d
go movetime <ms>    - Analyze for ms milliseconds
go nodes <n>        - Analyze for n nodes
stop                - Stop analysis
quit                - Quit engine
```

## Example: Basic Analysis

```javascript
// Initialize
const stockfish = new Stockfish();

// Set position
stockfish.postMessage('position startpos');

// Analyze
stockfish.postMessage('go depth 20');

// Handle output
stockfish.onmessage = (line) => {
    if (line.includes('bestmove')) {
        console.log('Best move:', line);
    }
};
```

## Performance Tips

1. **Depth Adjustment**
   - Lower depth = faster but less accurate
   - Higher depth = slower but more accurate
   - Recommended: 15-20 for real-time analysis

2. **Time Management**
   - Use `go movetime 3000` for 3-second analysis
   - Better for real-time scenarios

3. **Node Limits**
   - Use `go nodes 1000000` for fixed analysis amount
   - More predictable performance

## Troubleshooting

### "Stockfish is undefined"
- Check that script loaded successfully
- Verify CDN is accessible
- Check browser console for errors

### Slow Analysis
- Reduce engine depth in settings
- Use movetime instead of depth
- Close other browser tabs

### WebAssembly Error
- Verify WASM support in browser
- Check Content-Security-Policy headers
- Ensure WASM files are accessible

### Extension not analyzing
- Enable extension in settings
- Refresh chess.com/lichess page
- Check if board is detected (console logs)

## Stockfish Versions

Current: **15.1** (Latest stable)

To upgrade:
1. Update CDN URL to new version
2. Or download new WASM binary
3. Update version in manifest.json

## Resources

- **Stockfish Official**: https://stockfishchess.org/
- **Stockfish.js GitHub**: https://github.com/lichess-org/stockfish.js
- **UCI Protocol**: http://www.wbec-ridderkerk.nl/html/UCIProtocol.html

## Security Considerations

- ✅ All analysis runs locally (no server communication)
- ✅ No data collection
- ✅ WebAssembly sandboxed by browser
- ✅ Safe to analyze any position

---

For support, check the main README.md or open an issue!
