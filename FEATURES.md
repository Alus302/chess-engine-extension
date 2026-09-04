# Chess Engine Extension - Features

## Core Features ✨

### 1. Real-Time Move Analysis
- 📊 Analyzes position after each move
- ⚡ Instant evaluation updates
- 🎯 Shows Top 10 best moves ranked
- 📈 Displays evaluation in centipawns

### 2. Visual Board Feedback
- 🟢 **Green highlights** for best moves
- 🟡 **Yellow highlights** for poor moves (< -0.3 evaluation)
- 🔴 Shows from/to squares for recommended moves
- Real-time updates during gameplay

### 3. Floating Analysis Panel
- 📱 Non-intrusive right-side panel
- Displays:
  - Top 10 moves with SAN notation
  - Evaluation for each move
  - Current position evaluation
  - Engine depth of analysis
  - Nodes per second (search speed)
- Collapsible and draggable (coming)

### 4. Position Information
- 📝 FEN notation display
- 🔗 Copy FEN to clipboard
- 🔄 Easy position export
- Current turn indicator

### 5. Customizable Engine
- 🎚️ Adjustable search depth (1-20)
- ⏱️ Time-based analysis (coming)
- 📊 Node limit analysis (coming)
- Multi-threaded computation

### 6. Settings & Preferences
- ⚙️ Toggle highlights on/off
- 🎨 Customize colors (coming)
- 🔔 Sound notifications (coming)
- 💾 Save preferences

## Site Support 🌐

### chess.com
- ✅ Rapid games
- ✅ Blitz games  
- ✅ Bullet games
- ✅ Classical games
- ✅ Daily games
- ✅ Game analysis mode
- ✅ Computer opponent

### lichess.org
- ✅ Rapid games
- ✅ Blitz games
- ✅ Bullet games
- ✅ Classical games
- ✅ Correspondence
- ✅ Analysis board
- ✅ Computer opponent

## Engine Capabilities 🤖

### Stockfish 15.1
- **Strength:** ~3200 Elo
- **Search:** Up to 20 plies deep
- **Evaluation:** ±1000 (mate detection)
- **Speed:** 1-10M nodes/second
- **Type:** WebAssembly (browser-native)

### Analysis Types
- Principal Variation (PV) - best move sequence
- Evaluation changes - move quality assessment
- Tactical opportunities - discovers best moves
- Defensive resources - suggests best defense

## Performance Metrics 📊

### Memory Usage
- **Idle:** ~10MB
- **Analyzing:** ~50-100MB
- **Peak:** ~150MB (deep analysis)

### CPU Usage
- **Low depth (5-10):** ~30-50% on modern CPU
- **Medium depth (12-15):** ~60-80%
- **High depth (18-20):** ~90-100%

### Search Speed
- **Stockfish 15.1:** 1-10M nodes/sec
- Varies by CPU, browser, and system load

## Limitations & Known Issues ⚠️

### Current Limitations
- [ ] No opening book (coming soon)
- [ ] No endgame tablebase access
- [ ] No move variations display
- [ ] Can't analyze from middle of game (FEN extraction only)
- [ ] No 960 support yet

### Known Issues
- FEN extraction may fail on some board layouts
- Stockfish CDN required for first load
- High CPU usage during deep analysis
- Mobile browser support not yet available

## Security & Privacy 🔒

### What We DON'T Do
- ❌ Send position data to server
- ❌ Track user activity
- ❌ Store game records
- ❌ Access personal data
- ❌ Install additional software

### What IS Local
- ✅ All engine analysis
- ✅ All calculations
- ✅ All position storage
- ✅ No cloud processing

## Upcoming Features 🚀

### Phase 2 (v1.1)
- [ ] Keyboard shortcuts
- [ ] Opening book integration
- [ ] Move arrows on board
- [ ] Analysis variations
- [ ] Strength levels

### Phase 3 (v1.2)
- [ ] Offline Stockfish binary
- [ ] Custom engine support
- [ ] Endgame tablebase
- [ ] Mobile extension support
- [ ] Firefox support

### Phase 4 (v1.3+)
- [ ] Cloud analysis results
- [ ] Game review mode
- [ ] Educational annotations
- [ ] Strength handicap levels
- [ ] Multiplayer analysis

## Advanced Features (Developer) 👨‍💻

### UCI Commands Supported
- `uci` - Identify engine
- `isready` - Check readiness
- `position fen <fen>` - Set position
- `go depth <d>` - Analyze to depth
- `go movetime <ms>` - Analyze for time
- `stop` - Stop analysis

### Integration Points
- Content script on chess.com/lichess
- Popup UI with real-time updates
- Background service worker
- Chrome storage API
- WebWorker for Stockfish

### Extension APIs Used
- `chrome.storage` - Settings persistence
- `chrome.tabs` - Tab communication
- `chrome.runtime` - Message passing
- `chrome.scripting` - Content injection
- `chrome.action` - Icon/badge control

## Comparison with Other Tools

| Feature | Our Extension | Chess.com Premium | Lichess | Arena |
|---------|----------------|-------------------|---------|-------|
| Free | ✅ | ❌ | ✅ | ✅ |
| Real-time | ✅ | ✅ | ✅ | ❌ |
| Online | ✅ | ✅ | ✅ | ❌ |
| Stockfish | ✅ | ✅ | ✅ | ✅ |
| Local Analysis | ✅ | ❌ | ✅ | ✅ |
| Browser Native | ✅ | ✅ | ✅ | ❌ |
| Adjustable Depth | ✅ | Partial | ✅ | ✅ |
| Offline Support | ⏳ | ❌ | ⏳ | ✅ |

---

**Want a feature? Request it on GitHub! 🎉**
