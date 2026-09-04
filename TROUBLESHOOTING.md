# Troubleshooting Guide

## Common Issues and Solutions

### 1. Extension Not Loading

**Problem:** Extension doesn't appear in chrome://extensions/

**Solutions:**
- [ ] Verify you're on `chrome://extensions/` (not `chrome://apps/`)
- [ ] Check "Developer mode" is toggled ON (top right)
- [ ] Try "Load unpacked" again
- [ ] Restart Chrome
- [ ] Check folder path contains `manifest.json`

---

### 2. "Manifest Error"

**Problem:** Error loading manifest.json

**Solutions:**
- [ ] Verify manifest.json exists in root folder
- [ ] Check manifest.json for syntax errors (JSON validator)
- [ ] Ensure manifest_version is 3
- [ ] Reload extension (circular arrow icon)

---

### 3. Analysis Panel Not Appearing

**Problem:** Click "Start Analysis" but nothing happens

**Solutions:**
- [ ] Check you're on chess.com or lichess.org
- [ ] Refresh the page (Ctrl+R)
- [ ] Wait 2-3 seconds for engine to initialize
- [ ] Check browser console for errors (F12)
- [ ] Try disabling/enabling extension

**If still not working:**
```
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red errors
4. Screenshot and post on GitHub issues
```

---

### 4. Stockfish Not Loading

**Problem:** "Stockfish engine failed to initialize"

**Solutions:**
- [ ] Check internet connection (needed for CDN)
- [ ] Verify you can access https://cdn.jsdelivr.net
- [ ] Try different browser (Firefox, Edge)
- [ ] Clear browser cache: Settings → Privacy → Clear browsing data
- [ ] Try incognito mode (Ctrl+Shift+N)

**Check CDN Status:**
```javascript
// Paste in console (F12)
fetch('https://cdn.jsdelivr.net/npm/stockfish@15.1')
  .then(r => console.log('CDN Status:', r.status))
```

---

### 5. Analysis Running Slowly

**Problem:** Positions take too long to analyze

**Solutions:**
- [ ] **Reduce Engine Depth**
  - Click ⚙️ Settings
  - Reduce "Engine Depth" from 15 to 10 or 12
  - Lower = faster but less accurate

- [ ] **Close Other Tabs**
  - Stockfish uses CPU
  - Close unnecessary tabs/programs

- [ ] **Check CPU Usage**
  - Open Task Manager (Ctrl+Shift+Esc)
  - Look for Chrome processes
  - Restart if using >90% CPU

---

### 6. Highlights Not Showing

**Problem:** Green/Yellow squares not appearing on board

**Solutions:**
- [ ] Check settings:
  - Click ⚙️ Settings
  - Enable "Highlight Best Move"
  - Enable "Highlight Poor Moves"
- [ ] Refresh page (Ctrl+R)
- [ ] Try different game type (classic, rapid, etc)
- [ ] Try other chess site (chess.com vs lichess)

---

### 7. "Content Script Not Available" Error

**Problem:** Error message in popup

**Solutions:**
- [ ] Refresh the chess.com/lichess page
- [ ] Close and reopen popup
- [ ] Disable/enable extension
- [ ] Chrome bug: try different browser

---

### 8. Extension Crashes When Analyzing

**Problem:** Chrome freezes or crashes during analysis

**Solutions:**
- [ ] **Reduce Depth** (see #5)
- [ ] **Disable Auto-Analysis**
  - Settings → Uncheck "Auto-analyze"
  - Manually trigger analysis
- [ ] **Check RAM**
  - Close other programs
  - Check available memory
- [ ] **Update Chrome**
  - Chrome Menu → Help → About Chrome
  - Install any available updates

---

### 9. FEN Position Incorrect

**Problem:** Copied FEN doesn't match actual position

**Solutions:**
- [ ] Make sure board loaded completely
- [ ] Try refreshing game page
- [ ] Test with "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" (starting position)
- [ ] Report board detection bug on GitHub

---

### 10. Extension Drains Battery

**Problem:** Laptop battery drains quickly

**Solutions:**
- [ ] Disable analysis when not needed
- [ ] Use lower engine depth
- [ ] Limit analysis time in settings
- [ ] Enable "Pause on unfocused tab" (coming soon)

---

## Debug Mode

### Enable Debug Logging

```javascript
// Paste in console (F12)
localStorage.debug = 'chess-engine:*'
location.reload()
```

Now check Console for detailed logs.

### Collect Diagnostic Info

```javascript
// Run in console
console.log('Browser:', navigator.userAgent)
console.log('Stockfish:', window.Stockfish)
console.log('Extension:', chrome.runtime.id)
```

### Export Logs for GitHub Issue

1. Open DevTools (F12)
2. Right-click Console → Save as
3. Upload to GitHub issue

---

## Performance Tips

### For Faster Analysis
- Engine Depth: 10-12 (instead of 20)
- Close other programs
- Use wired internet (faster CDN)
- Disable extensions that modify DOM

### For Better Accuracy
- Engine Depth: 15-20
- Use movetime instead of depth (coming)
- Analyze starting positions first
- Wait for depth 15+ before reading

---

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Official support |
| Edge | ✅ Full | Chromium-based |
| Opera | ✅ Full | Chromium-based |
| Brave | ✅ Full | Chromium-based |
| Firefox | ❌ None | Extension API not compatible |
| Safari | ❌ None | Safari extension format different |

---

## Getting Help

1. **GitHub Issues:** https://github.com/Alus302/chess-engine-extension/issues
2. **Documentation:** See README.md and guides
3. **Console Logs:** Share output from F12 console
4. **Screenshots:** Show what you see

---

**Still stuck?** Report with:
- Browser version (chrome://version)
- Error message (from console)
- Steps to reproduce
- Expected vs actual behavior

---

**Happy analyzing! ♟️**
