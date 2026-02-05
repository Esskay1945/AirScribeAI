const videoElement = document.getElementById('input-video');
const canvasElement = document.getElementById('output-canvas');
const writingCanvas = document.getElementById('writing-canvas');
const canvasCtx = canvasElement.getContext('2d');
const writingCtx = writingCanvas.getContext('2d');

const statusText = document.getElementById('detection-status');
const gestureText = document.getElementById('gesture-detected');
const fpsVal = document.getElementById('fps-val');
const clearBtn = document.getElementById('clear-btn');
const downloadBtn = document.getElementById('download-btn');
const colorBtns = document.querySelectorAll('.color-btn');
const brushSizeInput = document.getElementById('brush-size');
const gallery = document.getElementById('snapshot-gallery');
const flashOverlay = document.getElementById('flash-effect');

// State variables
let lastX = 0;
let lastY = 0;
let smoothedX = 0;
let smoothedY = 0;
let isDrawing = false;
let drawStartTime = 0;

let drawBuffer = 0; // Confidence buffer for drawing
const DRAW_BUFFER_MAX = 5; // Frames to persist drawing state

let lastFistState = false;
let currentBrushColor = '#ff3e3e';
let currentBrushSize = 8;
let lastTime = 0;

// EMA Smoothing factor (0 to 1, higher = smoother but more lag)
const smoothingAlpha = 0.45; // Responsive smoothing

// Initialize canvases
function resizeCanvases() {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
    writingCanvas.width = window.innerWidth;
    writingCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvases);
resizeCanvases();

// Controls
colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentBrushColor = btn.getAttribute('data-color');
    });
});

brushSizeInput.addEventListener('input', (e) => {
    currentBrushSize = parseInt(e.target.value);
});

clearBtn.addEventListener('click', () => {
    writingCtx.clearRect(0, 0, writingCanvas.width, writingCanvas.height);
    gallery.innerHTML = '<p class="empty-msg">Release finger to save</p>';
});

function triggerScreenshot() {
    // Visual flash
    flashOverlay.classList.remove('trigger');
    void flashOverlay.offsetWidth; // Trigger reflow
    flashOverlay.classList.add('trigger');

    // Download
    const link = document.createElement('a');
    link.download = `air-art-${Date.now()}.png`;
    link.href = writingCanvas.toDataURL();
    link.click();
}

downloadBtn.addEventListener('click', triggerScreenshot);

// Gesture Recognition Logic
function recognizeGesture(landmarks) {
    if (!landmarks) return "None";

    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const dist = Math.sqrt(
        Math.pow(thumbTip.x - indexTip.x, 2) +
        Math.pow(thumbTip.y - indexTip.y, 2)
    );

    const wrist = landmarks[0];
    const indexMcp = landmarks[5];
    const handScale = Math.sqrt(
        Math.pow(wrist.x - indexMcp.x, 2) +
        Math.pow(wrist.y - indexMcp.y, 2)
    );

    // Gestures check
    const fingerTips = [8, 12, 16, 20];
    const fingerJoints = [6, 10, 14, 18];
    let extendedCount = 0;
    let fistCandidate = true;

    for (let i = 0; i < fingerTips.length; i++) {
        // Extended Check
        if (landmarks[fingerTips[i]].y < landmarks[fingerJoints[i]].y) {
            extendedCount++;
        }
        // Fist Check (Tips below MCP joints)
        const mcpJoint = i === 0 ? 5 : (i === 1 ? 9 : (i === 2 ? 13 : 17));
        if (landmarks[fingerTips[i]].y < landmarks[mcpJoint].y) {
            fistCandidate = false;
        }
    }

    // Index Finger Pointing Check
    // Index tip (8) above its PIP joint (6) AND other fingers folded
    const isIndexExtended = landmarks[8].y < landmarks[6].y;
    const isMiddleFolded = landmarks[12].y > landmarks[10].y;
    const isRingFolded = landmarks[16].y > landmarks[14].y;
    const isPinkyFolded = landmarks[20].y > landmarks[18].y;

    if (isIndexExtended && isMiddleFolded && isRingFolded && isPinkyFolded) {
        return "Pointing";
    }

    if (fistCandidate && extendedCount === 0) {
        return "Fist";
    }

    if (extendedCount === 4) {
        return "Open Palm";
    }

    return "Unknown";
}

function saveSnapshot() {
    const emptyMsg = gallery.querySelector('.empty-msg');
    if (emptyMsg) emptyMsg.remove();

    const dataURL = writingCanvas.toDataURL();
    const item = document.createElement('div');
    item.className = 'snapshot-item';
    item.innerHTML = `<img src="${dataURL}" alt="Strokes">`;

    if (gallery.firstChild) {
        gallery.insertBefore(item, gallery.firstChild);
    } else {
        gallery.appendChild(item);
    }

    if (gallery.children.length > 10) {
        gallery.removeChild(gallery.lastChild);
    }
}

function onResults(results) {
    const currTime = performance.now();
    const fps = Math.round(1000 / (currTime - lastTime));
    lastTime = currTime;
    fpsVal.innerText = fps;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        statusText.innerText = "Tracking Active";
        statusText.className = "value status-active";

        const landmarks = results.multiHandLandmarks[0];
        const gesture = recognizeGesture(landmarks);
        gestureText.innerText = gesture;

        // Visual feedback (Skeleton)
        const mirroredLandmarks = landmarks.map(l => ({ ...l, x: 1 - l.x }));
        drawConnectors(canvasCtx, mirroredLandmarks, HAND_CONNECTIONS, { color: '#6c5ce7', lineWidth: 1 });
        drawLandmarks(canvasCtx, mirroredLandmarks, { color: '#ffffff', lineWidth: 0.5, radius: 1.5 });

        const indexTip = landmarks[8];
        const cx = (1 - indexTip.x) * writingCanvas.width;
        const cy = indexTip.y * writingCanvas.height;

        // EMA Smoothing
        smoothedX = (cx * smoothingAlpha) + (smoothedX * (1 - smoothingAlpha));
        smoothedY = (cy * smoothingAlpha) + (smoothedY * (1 - smoothingAlpha));

        // Drawing Handling with Buffering
        if (gesture === "Pointing") {
            drawBuffer = DRAW_BUFFER_MAX;
            if (isDrawing) {
                writingCtx.beginPath();
                writingCtx.strokeStyle = currentBrushColor;
                writingCtx.lineWidth = currentBrushSize;
                writingCtx.lineCap = 'round';
                writingCtx.lineJoin = 'round';
                writingCtx.moveTo(lastX, lastY);
                writingCtx.lineTo(smoothedX, smoothedY);
                writingCtx.stroke();
            } else {
                drawStartTime = performance.now();
                smoothedX = cx;
                smoothedY = cy;
                isDrawing = true;
            }
            lastX = smoothedX;
            lastY = smoothedY;
        } else {
            if (isDrawing && drawBuffer > 0) {
                drawBuffer--;
                writingCtx.beginPath();
                writingCtx.strokeStyle = currentBrushColor;
                writingCtx.lineWidth = currentBrushSize;
                writingCtx.lineCap = 'round';
                writingCtx.lineJoin = 'round';
                writingCtx.moveTo(lastX, lastY);
                writingCtx.lineTo(smoothedX, smoothedY);
                writingCtx.stroke();
                lastX = smoothedX;
                lastY = smoothedY;
            } else if (isDrawing) {
                if (performance.now() - drawStartTime > 200) {
                    saveSnapshot();
                }
                isDrawing = false;
            } else {
                smoothedX = cx;
                smoothedY = cy;
            }
        }

        // Fist Action (Screenshot)
        if (gesture === "Fist") {
            if (!lastFistState) {
                triggerScreenshot();
            }
            lastFistState = true;
        } else {
            lastFistState = false;
        }
    } else {
        if (isDrawing) {
            saveSnapshot();
        }
        statusText.innerText = "Searching for hand...";
        statusText.className = "value status-inactive";
        gestureText.innerText = "None";
        isDrawing = false;
    }

    canvasCtx.restore();
}

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 1280,
    height: 720
});

// Initialize Camera and App
async function initApp() {
    statusText.innerText = "Initializing hands...";

    try {
        // Wait for hands to be ready implicitly or explicitly
        statusText.innerText = "Starting camera...";
        await camera.start();
        statusText.innerText = "Camera Active";
        statusText.className = "value status-active";
    } catch (e) {
        console.error("Camera startup error:", e);
        statusText.innerText = "Permission Required";
        statusText.className = "value status-inactive";

        // Fallback for browsers requiring a gesture
        const fallbackBtn = document.createElement('button');
        fallbackBtn.innerText = "Enable Camera";
        fallbackBtn.className = "primary-btn";
        fallbackBtn.style.marginTop = "10px";
        fallbackBtn.onclick = async () => {
            try {
                await camera.start();
                fallbackBtn.remove();
                statusText.innerText = "Camera Active";
                statusText.className = "value status-active";
            } catch (err) {
                alert("Please allow camera access in your browser settings.");
            }
        };
        statusText.parentElement.appendChild(fallbackBtn);
    }
}

// Start the application
initApp();
