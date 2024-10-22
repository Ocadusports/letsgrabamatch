// Global variables to manage screens and selections
let screen = 1; // Current screen (1: Welcome, 2: Character Selection, 3: Main App)
let selectedCharacter = null;
let characters = [];
let animations = {};
let titleImg;
let nextButtonDiv, energyBarDiv;
let characterButtons = []; // Store character image buttons

// Health management variables
let health = 20;
let motionValue = { x: 0, y: 0, z: 0 };
let lastStationaryTime = 0;
let isStationary = false;
let updateInterval = 500;

// Preload character images and animations
function preload() {
    titleImg = loadImage('LGAM 1.png');
    characters = [
        { img: 'Hippo.png', name: 'char1' },
        { img: 'Weasel.png', name: 'char2' },
        { img: 'Porcupine.png', name: 'char3' },
    ];
    animations = {
        char1: { sleep: loadImage('char1_sleep.png'), normal: loadImage('Hippo.png'), powerup: loadImage('char1_powerup.png'), onFire: loadImage('char1_fire.png') },
        char2: { sleep: loadImage('char1_sleep.png'), normal: loadImage('Weasel.png'), powerup: loadImage('char1_powerup.png'), onFire: loadImage('char1_fire.png') },
        char3: { sleep: loadImage('char1_sleep.png'), normal: loadImage('Porcupine.png'), powerup: loadImage('char1_powerup.png'), onFire: loadImage('char1_fire.png') },
    };
}

// Setup the canvas and initialize screens
function setup() {
    createCanvas(windowWidth, windowHeight);
    setupWelcomeScreen();
    setupEnableMotionButton();
}

// Setup the Welcome Screen 
function setupWelcomeScreen() {
    nextButtonDiv = createDiv('NEXT');
    styleDiv(nextButtonDiv, 150, 50);
    nextButtonDiv.mousePressed(() => screen = 2); // Move to character selection
    centerDiv(nextButtonDiv, windowHeight / 2 + 100);
}

// Setup Enable Motion Button
function setupEnableMotionButton() {
    let motionButton = createDiv('Enable Motion');
    styleDiv(motionButton, 150, 50);
    motionButton.mousePressed(requestMotionPermission);
    centerDiv(motionButton, windowHeight / 1.5);
    motionButton.hide();
    window.motionButton = motionButton;
}

// Style Div Helper Function
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
    div.style('box-shadow', '0px 7px rgba(0, 0, 0, 1)');
}

// Center Div Helper Function
function centerDiv(div, yOffset) {
    div.position((windowWidth - div.width) / 2, yOffset);
}

// Main Draw Loop to Manage Screens
function draw() {
    background(255);
    if (screen === 1) drawWelcomeScreen();
    else if (screen === 2) drawCharacterSelectScreen();
    else if (screen === 3) drawMainAppScreen();
}

// Draw Welcome Screen
function drawWelcomeScreen() {
    background('#87CEFA');
    imageMode(CENTER);
    image(titleImg, width / 2, height / 3, 329, 132);
}

// Draw Character Selection Screen
function drawCharacterSelectScreen() {
    if (nextButtonDiv) nextButtonDiv.hide(); // Hide the welcome screen button

    textAlign(CENTER, CENTER);
    textSize(32);
    text('CHOOSE A CHARACTER', width / 2, 50);

    // Create buttons for each character if not already created
    if (characterButtons.length === 0) {
        for (let i = 0; i < characters.length; i++) {
            let x = width / 2 - 80; // Adjust for centering
            let y = 150 + i * 150; // Space between each character

            // Create the image button
            let button = createImg(characters[i].img, characters[i].name);
            button.size(160, 182); // Set the size of the image button
            button.position(x, y); // Position the image button on the screen

            // Add click functionality to select the character
            button.mousePressed(() => {
                selectedCharacter = characters[i].name; // Store selected character
                screen = 3; // Move to the main app screen
            });

            // Store the button in the characterButtons array
            characterButtons.push(button);
        }
    }
}

// Draw Main App Screen
function drawMainAppScreen() {
    window.motionButton.show();
    let animation = getAnimationForHealth();
    image(animation, width / 2 - 75, height / 3, 150, 150);
    drawEnergyBar();
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
    energyBarDiv.size(healthWidth, 30);
}

// Request Motion Permission (iOS)
function requestMotionPermission() {
    if (typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    window.addEventListener('devicemotion', handleMotion);
                } else alert('Motion permission denied.');
            })
            .catch(err => alert('Error requesting motion permission: ' + err));
    } else window.addEventListener('devicemotion', handleMotion);
}

// Handle Motion Events
function handleMotion(event) {
    const { x, y, z } = event.acceleration;
    motionValue = { x, y, z };
    if (abs(x) > 1 || abs(y) > 1 || abs(z) > 1) {
        isStationary = false;
        lastStationaryTime = millis();
    } else if (!isStationary) {
        isStationary = true;
        lastStationaryTime = millis();
    }
}

// Adjust Health Based on Motion
function adjustHealth() {
    if (isStationary && millis() - lastStationaryTime >= 20000) {
        health = min(100, health + 1);
    } else health = max(0, health - 0.1);
}

// Get Appropriate Animation for Health
function getAnimationForHealth() {
    if (health <= 0) return animations[selectedCharacter].sleep;
    if (health <= 10) return animations[selectedCharacter].normal;
    if (health <= 80) return animations[selectedCharacter].powerup;
    return animations[selectedCharacter].onFire;
}
