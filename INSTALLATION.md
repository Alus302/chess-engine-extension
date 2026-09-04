# Installation Instructions

## Prerequisites
- Google Chrome or Chromium-based browser
- Internet connection (for initial Stockfish download)

## Step 1: Clone or Download

### Option A: Clone from Git
```bash
git clone https://github.com/Alus302/chess-engine-extension.git
cd chess-engine-extension
```

### Option B: Download ZIP
1. Go to https://github.com/Alus302/chess-engine-extension
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file

## Step 2: Load Extension in Chrome

1. **Open Chrome Extension Manager**
   - Type `chrome://extensions/` in address bar
   - Or Menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle "Developer mode" in top right corner (becomes blue)

3. **Load Extension**
   - Click "Load unpacked"
   - Navigate to the extracted `chess-engine-extension` folder
   - Click "Select Folder"

4. **Verify Installation**
   - Extension should appear in your extensions list
   - Icon should show in your toolbar (puzzle piece)
   - Green badge appears when active

## Step 3: Use the Extension

1. **Go to Chess Site**
   - Visit https://chess.com or https://lichess.org
   - Start or join a game

2. **Enable Analysis**
   - Click extension icon in toolbar
   - Click "▶ Start Analysis" button
   - Floating panel appears on right side

3. **View Analysis**
   - Top 10 moves displayed with evaluations
   - Green highlights = best moves
   - Yellow highlights = poor moves
   - Real-time updates as you move pieces

## Troubleshooting

### Extension doesn't appear
- Make sure Developer mode is ON
- Try refreshing the page
- Check if extension is disabled (toggle should be ON)

### Panel doesn't show
- Wait 2-3 seconds for Stockfish to load
- Check browser console (F12) for errors
- Refresh the chess.com/lichess page

### "Stockfish not loaded" error
- Check internet connection (needed for CDN)
- Try clearing browser cache
- Disable and re-enable extension

### Analysis is slow
- Reduce Engine Depth in settings (lower = faster)
- Close other browser tabs
- Try refresh: toggle analysis off/on

### Extension conflicts with other extensions
- Try disabling other extensions one by one
- Report compatibility issues on GitHub

## Uninstall

To remove the extension:
1. Go to `chrome://extensions/`
2. Find "Chess Engine Assistant"
3. Click trash icon

## Next Steps

- Read `SETUP_GUIDE.md` for detailed usage
- Check `STOCKFISH_SETUP.md` for engine configuration
- Report bugs on GitHub issues

---

**Happy analyzing! ♟️**
