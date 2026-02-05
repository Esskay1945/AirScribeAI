# ✋ Air Writer

A real-time hand gesture detection application that lets you draw in the air using your webcam. Built with MediaPipe Hands and vanilla JavaScript.

🚀 **[Try Live Demo](https://airwriter.netlify.app/)** 🚀

## 📖 About

Air Writer transforms your hand into a virtual paintbrush, enabling you to create digital art through intuitive gestures captured by your webcam. Using Google's MediaPipe hand tracking technology, the application recognizes finger positions in real-time and translates them into natural drawing movements on a digital canvas. Simply point your index finger to draw, make a fist to save your artwork, or show an open palm to start fresh. No special hardware required—just a webcam and your creativity.

## 🎨 Features

- **Real-time Hand Tracking**: Powered by Google's MediaPipe Hands library
- **Gesture Recognition**: 
  - ☝️ Index finger pointing to draw
  - ✊ Fist gesture to download your artwork
  - ✋ Open palm to clear canvas
- **Customizable Brush**: Choose from 4 colors and adjustable brush sizes (2-20px)
- **Auto-save Strokes**: Automatically captures and displays your drawing strokes
- **Live FPS Counter**: Monitor performance in real-time
- **Glass-morphism UI**: Modern, sleek interface with blur effects
- **Smooth Drawing**: EMA (Exponential Moving Average) smoothing for fluid strokes

## 🚀 Quick Start

### 🌐 Try It Online

**Visit the live demo**: [https://airwriter.netlify.app/](https://airwriter.netlify.app/)

No installation required! Just allow camera access and start drawing in the air.

---

### 💻 Run Locally

#### Prerequisites

- Modern web browser with webcam access (Chrome, Edge, or Firefox recommended)
- Local web server (due to MediaPipe CORS requirements)

### Installation

1. **Clone or download** this repository

2. **Start a local server** in the project directory:

   Using Python:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   Using Node.js:
   ```bash
   npx serve
   ```

   Using VS Code:
   - Install "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

3. **Open in browser**: Navigate to `http://localhost:8000`

4. **Allow camera access** when prompted

## 🎯 How to Use

### Drawing
1. **Position yourself** in front of the camera
2. **Extend your index finger** (point gesture) to start drawing
3. **Move your hand** to create strokes in the air
4. **Release the pointing gesture** to save the stroke

### Controls
- **Change Color**: Click the color buttons in the control panel
- **Adjust Brush Size**: Use the slider to change brush thickness
- **Clear Canvas**: Click "Clear Canvas" or show an open palm gesture
- **Download Art**: Click "Download Art" or make a fist gesture
- **View Saved Strokes**: Check the "Saved Strokes" gallery on the left panel

### Gesture Reference

| Gesture | Action |
|---------|--------|
| ☝️ **Pointing** (Index finger extended, others folded) | Draw on canvas |
| ✊ **Fist** (All fingers closed) | Take screenshot |
| ✋ **Open Palm** (All fingers extended) | Clear canvas |

## 🏗️ Project Structure

```
air-writer/
├── index.html          # Main HTML structure
├── style.css           # Styling and animations
├── script.js           # Core logic and gesture recognition
└── README.md          # Documentation
```

## 🛠️ Technical Details

### Technologies Used

- **MediaPipe Hands**: Hand tracking and landmark detection
- **HTML5 Canvas**: Drawing surface and video rendering
- **Vanilla JavaScript**: No frameworks, pure JS
- **CSS3**: Glass-morphism effects and animations
- **Google Fonts**: Outfit & JetBrains Mono

### Key Parameters

```javascript
// Hand Detection Settings
maxNumHands: 1
modelComplexity: 1
minDetectionConfidence: 0.7
minTrackingConfidence: 0.7

// Drawing Smoothing
smoothingAlpha: 0.45  // EMA smoothing factor (0-1)
DRAW_BUFFER_MAX: 5    // Frame buffer for drawing persistence
```

### Gesture Recognition Logic

The app uses landmark positions to detect gestures:

- **Pointing**: Index finger tip (landmark 8) above PIP joint (landmark 6), other fingers folded
- **Fist**: All fingertips below their respective MCP joints
- **Open Palm**: All four fingers extended above their joints

## 🎨 Customization

### Adding More Colors

Edit the color picker in `index.html`:

```html
<div class="color-btn" data-color="#YOUR_COLOR" style="background: #YOUR_COLOR;"></div>
```

### Adjusting Smoothing

Modify the smoothing factor in `script.js`:

```javascript
const smoothingAlpha = 0.45; // Higher = smoother but more lag (0-1)
```

### Changing Brush Size Range

Update the slider in `index.html`:

```html
<input type="range" id="brush-size" min="2" max="20" value="8">
```

## 🐛 Troubleshooting

### Camera Not Working
- Ensure you've granted camera permissions
- Check if another app is using the camera
- Try refreshing the page
- Use HTTPS or localhost (required for getUserMedia)

### Poor Tracking Performance
- Improve lighting conditions
- Ensure your hand is clearly visible
- Try reducing background clutter
- Check the FPS counter (aim for 30+ FPS)

### Gestures Not Detected
- Keep your hand within the camera frame
- Maintain clear finger positions
- Ensure adequate distance from camera (arm's length)
- Wait for "Tracking Active" status

## 📱 Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Edge | ✅ Full |
| Firefox | ✅ Full |
| Safari | ⚠️ Limited (WebRTC issues) |
| Mobile | ⚠️ Experimental |

## 🔒 Privacy

- All processing happens **locally** in your browser
- **No data** is sent to external servers
- Camera feed is **not recorded or stored**
- Drawings are only saved when you explicitly download them

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Ideas for Enhancement

- [ ] Multi-hand support
- [ ] More gesture commands (undo, redo)
- [ ] Shape recognition
- [ ] Recording mode for time-lapse videos
- [ ] Mobile optimization
- [ ] Gesture training mode

## 📄 License

This project is licensed under the MIT License - feel free to use it for personal or commercial projects.

## 🙏 Acknowledgments

- [MediaPipe](https://mediapipe.dev/) by Google for hand tracking
- [Google Fonts](https://fonts.google.com/) for typography
- Inspired by air gesture interfaces and virtual drawing tools

## 📧 Contact

For questions or feedback, please open an issue in the repository.

---

**Made with ❤️ and hand gestures** ✋
