# Version History

## [1.0.0] - 2026-09-04

### ✨ Initial Release

#### Features
- Real-time chess position analysis
- Top 10 best moves display
- Stockfish 15.1 engine integration
- Green highlights for best moves
- Yellow highlights for poor moves
- Floating analysis panel
- FEN position display and copy
- Customizable engine depth (1-20)
- Settings persistence
- chess.com support
- lichess.org support

#### Components
- manifest.json - Extension configuration
- popup.html/js/css - Popup interface
- content.js - Board monitoring and analysis
- background.js - Service worker
- styles.css - Content script styling
- SETUP_GUIDE.md - Installation guide
- STOCKFISH_SETUP.md - Engine configuration
- README.md - Main documentation

#### Known Limitations
- FEN extraction may not work on all board variations
- Requires internet for Stockfish CDN
- High CPU usage during deep analysis
- No offline mode yet
- No opening book integration
- No tablebase support

#### Browser Support
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Opera 76+
- ✅ Brave 1.0+

---

## Planned for v1.1

- [ ] Keyboard shortcuts (Ctrl+Shift+A to toggle)
- [ ] Opening book integration
- [ ] Move arrows overlay
- [ ] Analysis variations
- [ ] Strength level adjustment
- [ ] Firefox support
- [ ] Performance optimizations

## Planned for v1.2

- [ ] Offline Stockfish binary
- [ ] Custom engine selection
- [ ] Endgame tablebase
- [ ] Mobile Chrome support
- [ ] Dark mode
- [ ] Multi-language support

## Planned for v1.3+

- [ ] Cloud analysis caching
- [ ] Game review mode
- [ ] Educational annotations
- [ ] Position sharing
- [ ] Analysis export to PGN
- [ ] AI training mode

---

## Changelog Format

### Features
- New capabilities

### Fixed
- Bug fixes

### Changed
- Modified behavior

### Improved
- Performance improvements

### Removed
- Deprecated features

---

**Last Updated:** 2026-09-04
