let screen = 1;
let selectedCharacter = null;
let characters = [];
let animations = {};


let health = 20; // Start health at 20%
let motionValue = { x: 0, y: 0, z: 0 };
let lastStationaryTime = 0; // Track the last time phone was stationary
let isStationary = false; // Track if the phone is stationary
let updateInterval = 500; // Update health every 500ms

function preload() {
    characters = [
        loadImage('char1.png'),
        loadImage('char2.png'),
        loadImage('char3.png'),
    ];

    animations = {
        char1: {
            sleep: loadImage('char1_sleep.png'),
            normal: loadImage('char1_normal.png'),
            powerup: loadImage('char1_powerup.png'),
            onFire: loadImage('char1_fire.png'),
        },
        char2: {
            sleep: loadImage('char1_sleep.png'),
            normal: loadImage('char1_normal.png'),
            powerup: loadImage('char1_powerup.png'),
            onFire: loadImage('char1_fire.png'),
        },
        char3: {
            sleep: loadImage('char1_sleep.png'),
            normal: loadImage('char1_normal.png'),
            powerup: loadImage('char1_powerup.png'),
            onFire: loadImage('char1_fire.png'),
        },
    };
}


// Request permission for motion sensors
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

// Handle motion events and track acceleration values
function handleMotion(event) {
    const { x, y, z } = event.acceleration;
    motionValue = { x, y, z };

    // If motion is detected, reset the stationary timer
    if (abs(x) > 1 || abs(y) > 1 || abs(z) > 1) {
        isStationary = false;
        lastStationaryTime = millis(); // Reset the stationary timer
    } else if (!isStationary) {
        // If no motion is detected, mark as stationary and start tracking time
        isStationary = true;
        lastStationaryTime = millis();
    }
}

function adjustHealth() {
    // If stationary for more than 20 seconds, increase health
    if (isStationary && millis() - lastStationaryTime >= 20000) {
        health = min(100, health + 1); // Increase health
    } else {
        health = max(0, health - 0.1); // Decrease health if not stationary
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    noStroke();
    textSize(16);
    fill(0);

    // Create a button to request permission
    let button = createButton('Enable Motion');
    button.position(windowWidth / 2, windowHeight / 1.5
    );
    button.mousePressed(requestMotionPermission);
    button.hide(); // Hide initially, only show in screen 3

    // Store button reference to show it later
    window.motionButton = button;
}

function draw() {
    background(220);

    if (screen === 1) {
        drawWelcomeScreen();
    } else if (screen === 2) {
        drawCharacterSelectScreen();
    } else if (screen === 3) {
        drawMainAppScreen();
    }
}


// Display acceleration values for debugging
text(`Motion X: ${motionValue.x}`, 10, 80);
text(`Motion Y: ${motionValue.y}`, 10, 110);
text(`Motion Z: ${motionValue.z}`, 10, 140);




function drawWelcomeScreen() {
    textAlign(CENTER, CENTER);
    textSize(33);
    text('Welcome!', width / 2, height / 3);

    let nextButton = createButton('Next');
    nextButton.position(width / 2 - 40, height / 2);
    nextButton.mousePressed(() => {
        screen = 2; // Move to character select screen
        nextButton.remove(); // Remove the button after clicking
    });
}

function drawCharacterSelectScreen() {
    textAlign(CENTER, CENTER);
    textSize(24);
    text('Choose your character:', width / 2, 50);

    // Display character images as selectable options
    for (let i = 0; i < characters.length; i++) {
        let img = characters[i];
        image(img, width / 4 * (i + 1) - 50, height / 3, 100, 100);

        // Check if character is clicked
        if (mouseIsPressed && mouseX > width / 4 * (i + 1) - 50 && mouseX < width / 4 * (i + 1) + 50 &&
            mouseY > height / 3 && mouseY < height / 3 + 100) {
            selectedCharacter = `char${i + 1}`;
            screen = 3; // Move to main app screen
        }
    }
}

function drawMainAppScreen() {
    window.motionButton.show(); // Show motion permission button

    // Display character animation based on health level
    let animation = getAnimationForHealth();
    image(animation, width / 2 - 50, height / 3, 100, 100);

    // Display health bar
    fill(0, 255, 0);
    rect(10, 10, health * 3, 20);
    fill(0);
    text(health.toFixed(0) + "%", 320, 25);

    // Adjust health every 500ms
    if (millis() % updateInterval < 20) {
        adjustHealth();
    }
}

function getAnimationForHealth() {
    if (health <= 0) {
        return animations[selectedCharacter].sleep;
    } else if (health <= 30) {
        return animations[selectedCharacter].normal;
    } else if (health <= 80) {
        return animations[selectedCharacter].powerup;
    } else {
        return animations[selectedCharacter].onFire;
    }
}

