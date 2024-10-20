let health = 20; // Start health at 20%
let motionValue = { x: 0, y: 0, z: 0 };
let lastStationaryTime = 0; // Track the last time phone was stationary
let isStationary = false; // Track if the phone is stationary
let updateInterval = 500; // Update health every 500ms



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

function setup() {
    createCanvas(400, 400);
    noStroke();
    textSize(16);
    fill(0);

    // Create a button to request permission
    let button = createButton('Enable Motion');
    button.position(10, 10);
    button.mousePressed(requestMotionPermission);

    // Link Save Health Button to saveHealthToFirebase function
    let saveHealthBtn = select('#saveHealthBtn');
    saveHealthBtn.mousePressed(() => {
        console.log(`Saving Health: ${health}`);
        window.saveHealthToFirebase(health);
    });
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

function draw() {
    background(220);

    // Display health bar
    fill(255, 0, 0);
    rect(10, 10, health * 3, 20); // Width reflects health percentage

    // Display health percentage
    fill(0);
    text(health.toFixed(0) + "%", 320, 25);

    // Display acceleration values for debugging
    text(`Motion X: ${motionValue.x}`, 10, 80);
    text(`Motion Y: ${motionValue.y}`, 10, 110);
    text(`Motion Z: ${motionValue.z}`, 10, 140);

    // Draw a circle
    fill(0, 100, 255);
    ellipse(width / 2, height / 2, 50, 50);

    // Adjust health every 500ms
    if (millis() % updateInterval < 20) {
        adjustHealth();
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

