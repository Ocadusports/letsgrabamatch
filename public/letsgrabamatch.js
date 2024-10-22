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

function preload() {
    titleImg = loadImage('LGAM 1.png');
    characters = [
        loadImage('Hippo.png'),
        loadImage('Weasel.png'),
        loadImage('Porcupine.png'),
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
    div.style('box-shadow', '0px 8px 10px rgba(0, 0, 0, 0.4)');
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

// Draw Character Selection Screen
function drawCharacterSelectScreen() {
    background(240);
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(0);
    text('CHOOSE A CHARACTER', width / 2, 50);

    if (characterDivs.length === 0) createCharacterDivs(); // Create only once

    let yOffset = height / 2.5;
    for (let i = 0; i < characterDivs.length; i++) {
        centerDiv(characterDivs[i], yOffset);
        yOffset += 150; // Spacing between characters
    }

    // Add Next button to proceed to Main App Screen
    if (!nextButtonDiv) {
        nextButtonDiv = createDiv('Next');
        styleDiv(nextButtonDiv, 150, 50);
        nextButtonDiv.mousePressed(() => {
            if (selectedCharacter) {
                screen = 3;
                hideCharacterDivs();
                nextButtonDiv.hide();
            } else {
                alert('Please select a character!');
            }
        });
        centerDiv(nextButtonDiv, height - 100);
    }
}

function createCharacterDivs() {
    for (let i = 0; i < characters.length; i++) {
        let charDiv = createDiv('').style('cursor', 'pointer');
        charDiv.child(createImg(`char${i + 1}.png`).size(150, 150));
        charDiv.mousePressed(() => {
            selectedCharacter = `char${i + 1}`;
            console.log(`Selected: ${selectedCharacter}`);
        });
        characterDivs.push(charDiv);
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
