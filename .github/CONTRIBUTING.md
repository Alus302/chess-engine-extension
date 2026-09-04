# Contributing to Chess Engine Extension

## Ways to Contribute

### 1. Report Bugs 🐛
- Open an issue on GitHub
- Include:
  - Browser version
  - Reproduction steps
  - Expected vs actual behavior
  - Console errors (F12)

### 2. Request Features 💡
- Describe the feature
- Explain the use case
- Show examples if possible

### 3. Improve Documentation 📚
- Fix typos
- Add examples
- Clarify instructions
- Add troubleshooting tips

### 4. Code Contributions 🔧

#### Setup Development Environment
```bash
git clone https://github.com/Alus302/chess-engine-extension.git
cd chess-engine-extension
```

#### Making Changes
1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes
3. Test thoroughly
4. Commit: `git commit -am 'Add my feature'`
5. Push: `git push origin feature/my-feature`
6. Create Pull Request

#### Code Style
- Use ES6+ JavaScript
- Camel case for variables
- Snake case for file names
- Comment complex logic
- Max line length: 100 chars

#### Testing
1. Load unpacked extension
2. Test on chess.com and lichess.org
3. Test in both rapid and blitz
4. Check DevTools console for errors
5. Verify settings persistence

## Development Tips

### Debugging
```javascript
// In content.js
console.log('Debug info:', variable);

// In popup.js
console.log('Popup debug:', variable);

// View logs: F12 → Console
```

### Hot Reload
1. Make changes to file
2. Go to chrome://extensions/
3. Click refresh icon on extension
4. Refresh chess site tab

### Common Tasks

**Adding new setting:**
1. Add to `getDefaultSettings()` in content.js
2. Add UI element in popup.html
3. Handle in popup.js
4. Pass to content.js via message

**Adding new feature:**
1. Start with content.js
2. Add UI in popup.html
3. Update popup.js to handle it
4. Update README.md

## Pull Request Process

1. Update README.md with changes
2. Follow existing code style
3. Test thoroughly
4. Create descriptive PR title
5. Reference any related issues
6. Wait for review

## Community Guidelines

- Be respectful and inclusive
- No spam or self-promotion
- Constructive criticism only
- Help other contributors
- Report inappropriate behavior

## License

By contributing, you agree your code will be MIT licensed.

---

**Questions? Open a discussion on GitHub!**
