let screen = 1; // Track current screen (1: Welcome, 2: Character Selection, 3: Main App)
let selectedCharacter = null; // Store selected character
let characters = []; // Hold character images
let animations = {}; // Store character animations
let titleImg, nextButtonDiv, energyBarDiv, characterDivs = [];
let health = 20; // Start health at 20%
let motionValue = { x: 0, y: 0, z: 0 }; // Track motion
let lastStationaryTime = 0;
let isStationary = false;
let updateInterval = 500; // Update every 500ms
let selectedCharacterIndex = null; // Store selected character index


function preload() {
    titleImg = loadImage('LGAM 1.png');
    characters = [
        loadImage('char1.png'),
        loadImage('char2.png'),
        loadImage('char3.png'),
    ];
    animations = {
        char1: { sleep: loadImage('char1_sleep.png'), normal: loadImage('char1.png'), powerup: loadImage('char1_powerup.png'), onFire: loadImage('char1_fire.png') },
        char2: { sleep: loadImage('char1_sleep.png'), normal: loadImage('char2.png'), powerup: loadImage('char1_powerup.png'), onFire: loadImage('char1_fire.png') },
        char3: { sleep: loadImage('char1_sleep.png'), normal: loadImage('char3.png'), powerup: loadImage('char1_powerup.png'), onFire: loadImage('char1_fire.png') },
    };
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    setupWelcomeScreen();
    setupEnableMotionButton();
}

// Set up Welcome Screen
function setupWelcomeScreen() {
    nextButtonDiv = createDiv('Next');
    styleDiv(nextButtonDiv, 150, 50);
    nextButtonDiv.mousePressed(() => {
        screen = 2; // Move to character selection
        nextButtonDiv.hide(); // Hide button after use
    });
    centerDiv(nextButtonDiv, windowHeight / 2 + 100);
}

function setupEnableMotionButton() {
    let motionButton = createDiv('Enable Motion');
    styleDiv(motionButton, 150, 50);
    motionButton.mousePressed(requestMotionPermission);
    centerDiv(motionButton, windowHeight / 1.5);
    motionButton.hide();
    window.motionButton = motionButton;
}

// Center and style div elements
function centerDiv(div, yOffset) {
    const x = (windowWidth - div.width) / 2;
    div.position(x, yOffset);
}

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
    div.style('box-shadow', '0px 10px rgba(0, 0, 0, 1)');
}

// Main draw loop
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

// --- Character Selection Screen ---
function drawCharacterSelectScreen() {
    background(240);
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(0);
    text('CHOOSE A CHARACTER', width / 2, 50);

    let imageSize = 150;
    let spacing = width / 4;
    let yOffset = height / 3;

    for (let i = 0; i < characters.length; i++) {
        let x = spacing * (i + 1) - imageSize / 2;

        if (selectedCharacterIndex === i) {
            stroke('#FFC107');
            strokeWeight(5);
            rectMode(CENTER);
            rect(x + imageSize / 2, yOffset + imageSize / 2, imageSize + 10, imageSize + 10, 20);
        }

        noStroke();
        image(characters[i], x, yOffset, imageSize, imageSize);
    }

    if (!nextButtonDiv) {
        nextButtonDiv = createDiv('Next');
        styleDiv(nextButtonDiv, 150, 50);
        nextButtonDiv.mousePressed(() => {
            if (selectedCharacter) {
                screen = 3;
                nextButtonDiv.hide();
            } else {
                alert('Please select a character!');
            }
        });
        centerDiv(nextButtonDiv, height - 100);
    }
}

// Handle character selection logic when mouse is released
function mouseReleased() {
    if (screen === 2) {
        handleCharacterSelection();
    }
}

// Helper function to detect character selection
function handleCharacterSelection() {
    let imageSize = 150;
    let spacing = width / 4;
    let yOffset = height / 3;

    for (let i = 0; i < characters.length; i++) {
        let x = spacing * (i + 1) - imageSize / 2;

        if (
            mouseX > x &&
            mouseX < x + imageSize &&
            mouseY > yOffset &&
            mouseY < yOffset + imageSize
        ) {
            if (selectedCharacterIndex === i) {
                selectedCharacterIndex = null;
                selectedCharacter = null;
            } else {
                selectedCharacterIndex = i;
                selectedCharacter = `char${i + 1}`;
                console.log(`Selected: ${selectedCharacter}`);
            }
        }
    }
}


function createCharacterDivs() {
    for (let i = 0; i < characters.length; i++) {
        let charDiv = createDiv('').style('cursor', 'pointer');

        // Use createImg() with both src and alt text
        let img = createImg(`char${i + 1}.png`, `Character ${i + 1}`);
        img.size(150, 150); // Set size

        charDiv.child(img); // Add image to the div

        // Set up click event to select the character
        charDiv.mousePressed(() => {
            selectedCharacter = `char${i + 1}`;
            console.log(`Selected: ${selectedCharacter}`);
        });

        characterDivs.push(charDiv); // Store the div for future use
    }
}


function hideCharacterDivs() {
    characterDivs.forEach(div => div.hide());
}

// Draw Main App Screen
function drawMainAppScreen() {
    window.motionButton.show();
    let animation = getAnimationForHealth();
    image(animation, width / 2 - 75, height / 3, 150, 150);
    drawEnergyBar();
}

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

// Motion Permission for iOS
function requestMotionPermission() {
    if (typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission().then(response => {
            if (response === 'granted') {
                window.addEventListener('devicemotion', handleMotion);
            } else {
                alert('Motion permission denied.');
            }
        }).catch(err => alert('Error: ' + err));
    } else {
        window.addEventListener('devicemotion', handleMotion);
    }
}

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

function getAnimationForHealth() {
    if (health <= 0) return animations[selectedCharacter].sleep;
    if (health <= 10) return animations[selectedCharacter].normal;
    if (health <= 80) return animations[selectedCharacter].powerup;
    return animations[selectedCharacter].onFire;
}
