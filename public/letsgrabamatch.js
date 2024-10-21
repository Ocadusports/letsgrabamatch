// Global variables to manage screens and selections
let screen = 1; // Track the current screen (1: Welcome, 2: Character Selection, 3: Main App)
let selectedCharacter = null; // Store the selected character
let characters = []; // Array to hold character images
let animations = {}; // Store animations for each character
let nextButton = null; // Store the reference to the Next button

// Health management variables
let health = 20; // Start health at 20%
let motionValue = { x: 0, y: 0, z: 0 }; // Track motion values
let lastStationaryTime = 0; // Track the last time the phone was stationary
let isStationary = false; // Track if the phone is currently stationary
let updateInterval = 500; // Health updates every 500ms

// Preload character images and animations
function preload() {
    characters = [
        loadImage('char1.png'),
        loadImage('char2.png'),
        loadImage('char3.png'),
    ];

    // Load animations for each character (different health levels)
    animations = {
        char1: {
            sleep: loadImage('char1_sleep.png'),
            normal: loadImage('char1.png'),
            powerup: loadImage('char1_powerup.png'),
            onFire: loadImage('char1_fire.png'),
        },
        char2: {
            sleep: loadImage('char1_sleep.png'),
            normal: loadImage('char2.png'),
            powerup: loadImage('char1_powerup.png'),
            onFire: loadImage('char1_fire.png'),
        },
        char3: {
            sleep: loadImage('char1_sleep.png'),
            normal: loadImage('char3.png'),
            powerup: loadImage('char1_powerup.png'),
            onFire: loadImage('char1_fire.png'),
        },
    };
}

// Setup the canvas and initialize elements
function setup() {
    createCanvas(windowWidth, windowHeight);
    noStroke();
    textSize(16);
    fill(0);

    // Create the "Enable Motion" button (only used on the Main App screen)
    let button = createButton('Enable Motion');
    button.position(windowWidth / 2, windowHeight / 1.5);
    button.mousePressed(requestMotionPermission); // Handle motion permission request
    button.hide(); // Initially hide the button until needed
    window.motionButton = button; // Store the button reference globally
}

// Main draw loop to handle different screens
function draw() {
    background(220); // Clear the screen

    if (screen === 1) {
        drawWelcomeScreen(); // Show Welcome Screen
    } else if (screen === 2) {
        drawCharacterSelectScreen(); // Show Character Selection Screen
    } else if (screen === 3) {
        drawMainAppScreen(); // Show Main App Screen
    }
}

// --- Welcome Screen ---
function drawWelcomeScreen() {
    textAlign(CENTER, CENTER);
    textSize(33);
    text('Welcome!', width / 2, height / 3);

    // Create the Next button if it doesn't exist
    if (!nextButton) {
        nextButton = createButton('Next');
        nextButton.position(width / 2 - 40, height / 2);

        // Handle button click to switch to Character Selection Screen
        nextButton.mousePressed(() => {
            screen = 2; // Move to Character Selection
            nextButton.remove(); // Remove the button after clicking
            nextButton = null; // Clear the reference
        });

        // Optional: Add touch support for mobile devices (iOS)
        nextButton.touchStarted(() => {
            screen = 2; // Move to Character Selection
            nextButton.remove(); // Remove the button after clicking
            nextButton = null; // Clear the reference
        });
    }
}

// --- Character Selection Screen ---
function drawCharacterSelectScreen() {
    textAlign(CENTER, CENTER);
    textSize(24);
    text('Choose your character:', width / 2, 50);

    // Display each character image and check for selection
    for (let i = 0; i < characters.length; i++) {
        let img = characters[i];
        let x = width / 4 * (i + 1) - 50; // X position for the image
        let y = height / 3; // Y position for the image

        image(img, x, y, 100, 100); // Display the character image

        // Check if the user touches/clicks inside the image area
        if (touchInImageBounds(x, y, 100, 100)) {
            selectedCharacter = `char${i + 1}`; // Store the selected character
            screen = 3; // Move to Main App Screen
        }
    }
}

// --- Main App Screen ---
function drawMainAppScreen() {
    window.motionButton.show(); // Show the "Enable Motion" button

    // Display the appropriate character animation based on health
    let animation = getAnimationForHealth();
    image(animation, width / 2 - 50, height / 3, 100, 100);

    // Display the health bar
    fill(0, 255, 255); // Set color of the health bar
    rect(10, 10, health * 3, 20); // Health bar width based on health value
    fill(0);
    text(health.toFixed(0) + "%", 320, 25); // Display health percentage

    // Adjust health every 500ms
    if (millis() % updateInterval < 20) {
        adjustHealth();
    }
}

// Helper function to detect if touch/click is within the image boundaries
function touchInImageBounds(x, y, imgWidth, imgHeight) {
    if (touches.length > 0) { // Check if there is at least one active touch
        let touch = touches[0]; // Use the first touch point
        return (
            touch.x > x && touch.x < x + imgWidth &&
            touch.y > y && touch.y < y + imgHeight
        );
    } else if (mouseIsPressed) { // Fallback to mouse input
        return (
            mouseX > x && mouseX < x + imgWidth &&
            mouseY > y && mouseY < y + imgHeight
        );
    }
    return false; // No touch or click detected
}


// Get the appropriate animation based on current health
function getAnimationForHealth() {
    if (health <= 0) return animations[selectedCharacter].sleep;
    if (health <= 10) return animations[selectedCharacter].normal;
    if (health <= 80) return animations[selectedCharacter].powerup;
    return animations[selectedCharacter].onFire;
}

// Request motion permission (for iOS devices)
function requestMotionPermission() {
    if (
        typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function'
    ) {
        DeviceMotionEvent.requestPermission()
            .then((response) => {
                if (response === 'granted') {
                    window.addEventListener('devicemotion', handleMotion);
                } else {
                    alert('Motion permission denied.');
                }
            })
            .catch((err) => {
                console.error(err);
                alert('Error requesting motion permission: ' + err);
            });
    } else {
        window.addEventListener('devicemotion', handleMotion);
    }
}

// Handle motion events and adjust state
function handleMotion(event) {
    const { x, y, z } = event.acceleration;
    motionValue = { x, y, z };

    if (abs(x) > 1 || abs(y) > 1 || abs(z) > 1) {
        isStationary = false;
        lastStationaryTime = millis(); // Reset timer
    } else if (!isStationary) {
        isStationary = true;
        lastStationaryTime = millis(); // Start stationary timer
    }
}

// Adjust health based on motion state
function adjustHealth() {
    if (isStationary && millis() - lastStationaryTime >= 20000) {
        health = min(100, health + 1); // Increase health
    } else {
        health = max(0, health - 0.1); // Decrease health
    }
}
