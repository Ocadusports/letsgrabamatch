
// Global variables to manage screens and selections
let screen = 1; // Track the current screen (1: Welcome, 2: Character Selection, 3: Main App)
let selectedCharacter = null; // Store the selected character
let characters = []; // Array to hold character images
let animations = {}; // Store animations for each character
let titleImg;
// let nextButton = null; // Store the reference to the Next button

let nextButtonDiv, energyBarDiv; // Div elements for buttons and UI components

// Health management variables
let health = 20; // Start health at 20%
let motionValue = { x: 0, y: 0, z: 0 }; // Track motion values
let lastStationaryTime = 0; // Track the last time the phone was stationary
let isStationary = false; // Track if the phone is currently stationary
let updateInterval = 500; // Health updates every 500ms

// Preload character images and animations
function preload() {
    titleImg = loadImage('LGAM 1.png');

    characters = [
        loadImage('Hippo.png'),
        loadImage('Weasel.png'),
        loadImage('Porcupine.png'),
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
    setupWelcomeScreen();
    setupEnableMotionButton(); // Setup Enable Motion Button for main app screen


    // // Create the "Next" button as a div
    // nextButtonDiv = createDiv('Next');
    // nextButtonDiv.size(150, 50);
    // nextButtonDiv.style('background-color', '#FFC107');
    // nextButtonDiv.style('color', 'black');
    // nextButtonDiv.style('font-size', '24px');
    // nextButtonDiv.style('font-family', 'Arial, sans-serif');
    // nextButtonDiv.style('text-align', 'center');
    // nextButtonDiv.style('line-height', '50px'); // Center the text vertically
    // nextButtonDiv.style('border-radius', '25px'); // Rounded corners
    // nextButtonDiv.style('cursor', 'pointer');
    // nextButtonDiv.style('box-shadow', '0px 8px 10px rgba(0, 0, 0, 0.4)');

    // nextButtonDiv.mousePressed(() => {
    //     screen = 2; // Move to the character selection screen
    // });

    // Create the "Enable Motion" button (only used on the Main App screen)
    let button = createButton('Enable Motion');

    button.position(windowWidth / 2 - 100, windowHeight / 1.5);
    button.class('custom-button'); // Use custom styling for consistency
    button.mousePressed(requestMotionPermission); // Handle motion permission request
    button.hide(); // Hide initially until needed
    window.motionButton = button; // Store button reference globally
}

// Helper function to center a div with offset
function centerDiv(div, yOffset) {
    div.position((windowWidth - div.width) / 2, yOffset);
}

// Helper function to style div elements
function styleDiv(div, width, height) {
    div.size(width, height);
    div.style('background-color', '#FFC107');
    div.style('color', 'black');
    div.style('font-size', '24px');
    div.style('font-family', 'Arial, sans-serif');
    div.style('text-align', 'center');
    div.style('line-height', `${height}px`);
    div.style('border-radius', '25px');
    div.style('cursor', 'pointer');
    div.style('box-shadow', '0px 8px 10px rgba(0, 0, 0, 0.4)');
}

// Main draw loop to handle different screens
function draw() {
    background(255); // white bg

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
    background('#87CEFA'); // Light blue background

    imageMode(CENTER);
    image(titleImg, windowWidth / 2, windowHeight / 3, 329, 132); // Display title image
}

// --- Character Selection Screen ---
function drawCharacterSelectScreen() {
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(0);
    text('CHOOSE A CHARACTER', width / 2, 50);

    // Display the character images with spacing
    for (let i = 0; i < characters.length; i++) {
        let img = characters[i];
        let x = width / 2 - 50;
        let y = 150 + i * 150;

        image(img, x, y, 100, 100); // Display character image

        // Check for character selection
        if (touchInImageBounds(x, y, 100, 100)) {
            selectedCharacter = `char${i + 1}`; // Store selected character
        }
    }
    // Next button for main app screen
    nextButtonDiv = createDiv('Next');
    styleDiv(nextButtonDiv, 150, 50);
    nextButtonDiv.mousePressed(() => {
        if (selectedCharacter) screen = 3;
        else alert('Please select a character!');
    });
    centerDiv(nextButtonDiv, height - 100);
}


// --- Main App Screen ---
function drawMainAppScreen() {
    window.motionButton.show(); // Show the "Enable Motion" button

    // Display the appropriate character animation based on health
    let animation = getAnimationForHealth();
    image(animation, width / 2 - 75, height / 3, 150, 150);
    drawEnergyBar();

    // // Adjust health every 500ms
    // if (millis() % updateInterval < 20) {
    //     adjustHealth();
    // }
}

// Draw Energy Bar
function drawEnergyBar() {
    if (!energyBarDiv) {
        energyBarDiv = createDiv('');
        energyBarDiv.size(200, 30);
        energyBarDiv.style('background-color', '#FFC107');
        centerDiv(energyBarDiv, height - 120);
    }
    let healthWidth = map(health, 0, 100, 0, 200);
    energyBarDiv.size(healthWidth, 30); // Adjust width based on health
}

// Helper function to detect if touch/click is within the image boundaries
function touchInImageBounds(x, y, imgWidth, imgHeight) {
    // Check if there is an active touch
    if (touches.length > 0) {
        let touch = touches[0]; // Use the first touch point
        let tx = touch.pageX; // Use pageX for accurate coordinates
        let ty = touch.pageY; // Use pageY for accurate coordinates

        return (
            tx > x && tx < x + imgWidth &&
            ty > y && ty < y + imgHeight
        );
    } else if (mouseIsPressed) { // Fallback for mouse input
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

// // Helper function to create a styled button
// function createCustomButton(label, x, y, onClick) {
//     let button = createButton(label); // Create the button
//     button.position(x - button.width / 2, y); // Position it
//     button.class('custom-button'); // Apply the custom CSS class
//     button.mousePressed(onClick); // Attach click event
// }

// Hide the address bar on iOS devices
window.addEventListener('load', () => {
    setTimeout(() => {
        window.scrollTo(0, 1); // Scroll slightly to hide the address bar
    }, 0);
});