import { DispatchWithoutAction, FC, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  // useThemeParams,
  WebAppProvider,
} from '@vkruglikov/react-telegram-web-app';
// import { ConfigProvider, theme } from 'antd';
import 'antd/dist/reset.css';

import './index.css';
// import logo from './logo.svg';

// import MainButtonDemo from './MainButtonDemo';
// import BackButtonDemo from './BackButtonDemo';
// import ShowPopupDemo from './ShowPopupDemo';
// import HapticFeedbackDemo from './HapticFeedbackDemo';
// import ScanQrPopupDemo from './ScanQrPopupDemo';
// import ExpandDemo from './ExpandDemo';
// import useBetaVersion from './useBetaVersion';

const DemoApp: FC<{
  onChangeTransition: DispatchWithoutAction;
}> = ({ onChangeTransition }) => {

  const [coins, setCoins] = useState<number>(1000);
  const [showMarketPlace, setShowMarketPlace] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvas = canvasRef.current!;
  const ctx = canvas.getContext('2d')!;

  const [shipState, setShipState] = useState({
    x: canvas.width / 2,
    y: canvas.height - 50,
    size: 20,
    speed: 0,
    acceleration: 0.1,
    deceleration: 0.99,
    maxSpeed: 5,
    rotation: 0,
    rotationSpeed: 4.5,
    lasers: [] as any[],
    velocityX: 0,
    velocityY: 0,
    laserLevel: 1,
    accelerationLevel: 1,
    rotationSpeedLevel: 1
  });

  // let superWeapons = {
  //   missile: 0,
  //   laser: 0,
  //   bomb: 0
  // };

  // let drone = {
  //   x: canvas.width / 2,
  //   y: canvas.height / 2,
  //   size: 10,
  //   speed: 0.0001,
  //   direction: Math.random() * Math.PI * 2,
  //   lasers: [],
  //   laserSpeed: 3,
  //   laserInterval: 120, // Fire lasers every 120 frames (2 second)
  //   laserTimer: 0
  // };

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    setShipState(s => ({
      ...s,
      x: canvas.width / 2 / window.devicePixelRatio,
      y: canvas.height - 50 / window.devicePixelRatio
    }))
  };
  resizeCanvas();


  // KEY CONFIG VARs
  let score = 0;
  let asteroids = [] as any[];
  let gameLoop: any = undefined;
  let explosions = [] as any[];
  let lives = 3;
  let gameOver = false;
  let invincible = false;
  let invincibilityTimer = 0;
  const invincibilityDuration = 120; // 2 seconds (60 FPS)
  let wave = 1;
  let waveMessageTimer = 0;
  const waveMessageDuration = 180; // 3 seconds (60 FPS)
  let asteroidsKilled = 0;
  let drones = [] as any[];
  const droneCost = 1000;

  let droneUpgrades = {
    speed: 1,
    laserSpeed: 1,
    laserInterval: 1
  };


  // Event listeners for keyboard input
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);



  canvas.addEventListener('touchmove', (e) => {
    // if (isTouching) {
    //   let touchX = e.touches[0].clientX;
    //   let touchY = e.touches[0].clientY;
    //   let deltaX = touchX - touchStartX;
    //   let deltaY = touchY - touchStartY;

    //   ship.rotation = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    //   ship.speed = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 5, ship.maxSpeed); // Changed divisor from 10 to 5 for easier control

    //   touchStartX = touchX;
    //   touchStartY = touchY;
    // }
  });

  canvas.addEventListener('touchstart', (e) => {

    // lower left corner to acces sstore
    if (e.touches[0].clientX < canvas.width / 5 && e.touches[0].clientY > canvas.height * 4 / 5) {
      pauseGameForMarketplace();
    }

    if (e.target === canvas && e.touches.length === 2) {
      setShipState(s => ({
        ...s,
        lasers: [...s.lasers, { x: s.x, y: s.y, rotation: s.rotation, size: 2 }]
      })) // Require two fingers to fire
    }
  });

  // Game loop
  function startGame() {
    createAsteroids();
    invincible = true;
    invincibilityTimer = invincibilityDuration;
    gameLoop = setInterval(update, 1000 / 60); // 60 FPS
  }

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let angle = shipState.rotation * Math.PI / 180;
    const x = shipState.x + shipState.velocityX + shipState.speed * Math.sin(angle);
    const y = shipState.y + shipState.velocityY - shipState.speed * Math.cos(angle);

    setShipState(s => ({
      ...s,
      x: x < 0 ? canvas.width : x > canvas.width ? 0 : x,
      y: y < 0 ? canvas.width : y > canvas.height ? 0 : y,
      velocityX: (s.velocityX + s.speed * Math.sin(angle)) * s.deceleration,
      velocityY: (s.velocityY - s.speed * Math.cos(angle)) * s.deceleration,
    }))

    // ship.velocityX += ship.speed * Math.sin(angle);
    // ship.velocityY -= ship.speed * Math.cos(angle);

    // ship.x += ship.velocityX;
    // ship.y += ship.velocityY;

    // ship.velocityX *= ship.deceleration;
    // ship.velocityY *= ship.deceleration;

    // if (ship.x < 0) ship.x = canvas.width;
    // else if (ship.x > canvas.width) ship.x = 0;
    // if (ship.y < 0) ship.y = canvas.height;
    // else if (ship.y > canvas.height) ship.y = 0;

    drawShip();
    updateLasers();
    drawLasers();
    updateDrones();
    drawDrones();
    updateAsteroids();
    drawAsteroids();

    if (!invincible) {
      for (let i = 0; i < asteroids.length; i++) {
        if (isColliding(shipState, asteroids[i])) {
          createExplosion(shipState.x, shipState.y);
          resetShip();
          lives--;
          // updateCoinsDisplay();
          invincible = true;
          invincibilityTimer = invincibilityDuration;
          if (lives === 0) gameOver = true;
          else pauseGameForMarketplace();
          break;
        }
      }
    }

    checkLaserCollisions(shipState.lasers, true);

    if (invincible) {
      invincibilityTimer--;
      if (invincibilityTimer <= 0) invincible = false;
    }

    drawLives();
    drawScore();
    drawCoins();
    updateExplosions();
    drawExplosions();

    if (asteroids.length === 0 && !gameOver) {
      wave++;
      createAsteroids();
      invincible = true;
      invincibilityTimer = invincibilityDuration;
      waveMessageTimer = waveMessageDuration;
    }

    if (waveMessageTimer > 0) {
      drawWaveMessage();
      waveMessageTimer--;
    }

    if (gameOver) endGame();
  }

  function checkLaserCollisions(lasers: any[], isShip: boolean) {
    for (let i = lasers.length - 1; i >= 0; i--) {
      let laser = lasers[i];
      for (let j = asteroids.length - 1; j >= 0; j--) {
        let asteroid: any = asteroids[j];
        if (isColliding(laser, asteroid)) {
          createExplosion(asteroid.x, asteroid.y);
          asteroids.splice(j, 1);
          lasers.splice(i, 1);
          score += 50;
          asteroidsKilled++;
          if (isShip) {
            setCoins(s => s + 10) // Add coins when score increases
            // updateCoinsDisplay();
          }
          break;
        }
      }
    }
  }


  // Function to buy drones
  function buyDrone() {
    if (coins >= droneCost) {
      setCoins(s => s - droneCost)
      let drone = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 10,
        speed: 0.5 * droneUpgrades.speed,
        direction: Math.random() * Math.PI * 2,
        lasers: [],
        laserSpeed: 2 * droneUpgrades.laserSpeed,
        laserInterval: 240 / droneUpgrades.laserInterval, // Fire lasers more frequently as the interval increases
        laserTimer: 0
      };
      drones.push(drone);
      // updateCoinsDisplay();
    }
  }

  function upgradeDrone(attribute: 'speed' | 'laserSpeed' | 'laserInterval') {
    const cost = 200;
    if (coins >= cost) {
      setCoins(s => s - cost);
      droneUpgrades[attribute]++;
      // Update existing drones with new upgrade levels
      drones.forEach(drone => {
        switch (attribute) {
          case 'speed':
            drone.speed = 2 * droneUpgrades.speed;
            break;
          case 'laserSpeed':
            drone.laserSpeed = 5 * droneUpgrades.laserSpeed;
            break;
          case 'laserInterval':
            drone.laserInterval = 60 / droneUpgrades.laserInterval;
            break;
        }
      });
      // updateCoinsDisplay();
    }
  }

  // Update all drones
  function updateDrones() {
    drones.forEach(drone => {
      drone.x += Math.cos(drone.direction) * drone.speed;
      drone.y += Math.sin(drone.direction) * drone.speed;

      if (drone.x < 0) drone.x = canvas.width;
      else if (drone.x > canvas.width) drone.x = 0;
      if (drone.y < 0) drone.y = canvas.height;
      else if (drone.y > canvas.height) drone.y = 0;

      for (let i = drone.lasers.length - 1; i >= 0; i--) {
        let laser = drone.lasers[i];
        laser.x += Math.cos(laser.direction) * drone.laserSpeed;
        laser.y += Math.sin(laser.direction) * drone.laserSpeed;

        if (laser.x < 0 || laser.x > canvas.width || laser.y < 0 || laser.y > canvas.height) {
          drone.lasers.splice(i, 1);
        }
      }

      drone.laserTimer++;
      if (drone.laserTimer >= drone.laserInterval) {
        drone.laserTimer = 0;
        let laser = {
          x: drone.x,
          y: drone.y,
          direction: Math.random() * Math.PI * 2,
          size: 2
        };
        drone.lasers.push(laser);
      }

      checkLaserCollisions(drone.lasers, false);
    });
  }

  function drawDrones() {
    drones.forEach(drone => {
      ctx.save();
      ctx.translate(drone.x, drone.y);
      ctx.rotate(drone.direction);
      ctx.beginPath();
      ctx.moveTo(0, -drone.size);
      ctx.lineTo(-drone.size, drone.size);
      ctx.lineTo(drone.size, drone.size);
      ctx.closePath();
      ctx.fillStyle = 'cyan';
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = 'cyan';
      for (let i = 0; i < drone.lasers.length; i++) {
        let laser = drone.lasers[i];
        ctx.fillRect(laser.x - 1, laser.y - 1, 2, 2);
      }
    });
  }

  function drawLives() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Lives: ' + lives, canvas.width - 20, 30);
  }

  function drawCoins() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Coins: ' + coins + "    's' for store", 20, canvas.height - 30);
  }

  // function drawDrone() {
  //   ctx.save();
  //   ctx.translate(drone.x, drone.y);
  //   ctx.rotate(drone.direction);
  //   ctx.beginPath();
  //   ctx.moveTo(0, -drone.size);
  //   ctx.lineTo(-drone.size, drone.size);
  //   ctx.lineTo(drone.size, drone.size);
  //   ctx.closePath();
  //   ctx.fillStyle = 'cyan';
  //   ctx.fill();
  //   ctx.restore();

  //   // Draw drone lasers
  //   ctx.fillStyle = 'cyan';
  //   for (let i = 0; i < drone.lasers.length; i++) {
  //     let laser = drone.lasers[i];
  //     ctx.fillRect(laser.x - 1, laser.y - 1, 2, 2);
  //   }
  // }

  function endGame() {
    clearInterval(gameLoop);
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText(`Asteroids Destroyed: ${asteroidsKilled}`, canvas.width / 2, canvas.height / 2 + 70);
  }

  function pauseGameForMarketplace() {
    clearInterval(gameLoop);
    setShowMarketPlace(true);
  }

  function exitMarketplace() {
    setShowMarketPlace(false);
    invincible = true;
    invincibilityTimer = invincibilityDuration;
    // updateMarketplaceDisplay(); // Update display to reflect current levels
    gameLoop = setInterval(update, 1000 / 60); // Resume game loop
  }

  function upgrade(attribute: 'lasers' | 'acceleration' | 'rotationSpeed') {
    const cost = 100;
    if (coins >= cost) {
      setCoins(s => s - cost);
      switch (attribute) {
        case 'lasers':
          setShipState(s => ({ ...s, laserLevel: s.laserLevel + 1 }));
          break;
        case 'acceleration':
          setShipState(s => ({
            ...s,
            accelerationLevel: s.accelerationLevel + 1,
            acceleration: 0.1 * (s.accelerationLevel + 1)
          }))
          // ship.accelerationLevel++;
          // ship.acceleration = 0.1 * ship.accelerationLevel;
          break;
        case 'rotationSpeed':
          setShipState(s => ({
            ...s,
            rotationSpeedLevel: s.rotationSpeedLevel + 1,
            rotationSpeed: 2 * (s.rotationSpeedLevel + 1)
          }))
          // ship.rotationSpeedLevel++;
          // ship.rotationSpeed = 2 * ship.rotationSpeedLevel;
          break;
      }
    }
  }

  // Draw the ship
  function drawShip() {
    if (!invincible || (invincibilityTimer % 20 < 10)) {
      ctx.save();
      ctx.translate(shipState.x, shipState.y);
      ctx.rotate(shipState.rotation * Math.PI / 180);
      ctx.beginPath();
      ctx.moveTo(0, -shipState.size);
      ctx.lineTo(-shipState.size, shipState.size);
      ctx.lineTo(shipState.size, shipState.size);
      ctx.closePath();
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.restore();
    }
  }

  // Draw lasers
  function drawLasers() {
    ctx.fillStyle = 'red';
    for (let i = 0; i < shipState.lasers.length; i++) {
      ctx.fillRect(shipState.lasers[i].x - 1, shipState.lasers[i].y - 1, 2, 2); // Drawing lasers as small squares for better collision detection
    }
  }

  // Update lasers
  function updateLasers() {
    for (let i = 0; i < shipState.lasers.length; i++) {
      let laser = shipState.lasers[i];
      laser.x += 10 * Math.sin(laser.rotation * Math.PI / 180);
      laser.y -= 10 * Math.cos(laser.rotation * Math.PI / 180);

      // Remove lasers that are off-screen
      const lasers = [...shipState.lasers];
      if (laser.x < 0 || laser.x > canvas.width || laser.y < 0 || laser.y > canvas.height) {
        lasers.splice(i, 1)
        i--;
      }
      setShipState(s => ({
        ...s,
        laser: laser
      }));
    }
  }

  function isColliding(obj1: any, obj2: any) {
    let dx = obj1.x - obj2.x;
    let dy = obj1.y - obj2.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.size || 1) + obj2.size;
  }


  let chanceForSmallAsteroid = 1; // Start with a 1% chance
  let chanceForVerySmallAsteroid = 0.1; // Start with a 0.1% chance

  function createAsteroids() {
    let numberOfAsteroids = 10 + (wave - 1) * 2;
    for (let i = 0; i < numberOfAsteroids; i++) {
      let isSmallAsteroid = Math.random() * 100 < chanceForSmallAsteroid;
      let isVerySmallAsteroid = Math.random() * 100 < chanceForVerySmallAsteroid;
      let asteroidSize = isSmallAsteroid ? 10 : 20; // Smaller asteroids have a size of 10
      let asteroidSpeedMultiplier = isSmallAsteroid ? 1.5 : 1; // Smaller asteroids move 1.5 times faster
      if (isVerySmallAsteroid) {
        asteroidSize = 5;
      }

      let asteroid = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: asteroidSize,
        speed: asteroidSpeedMultiplier * (1 * Math.pow(1.05, wave - 1)),
        dx: (Math.random() * 2 - 1) * asteroidSpeedMultiplier * Math.pow(1.05, wave - 1),
        dy: (Math.random() * 2 - 1) * asteroidSpeedMultiplier * Math.pow(1.05, wave - 1)
      };
      asteroids.push(asteroid);
    }
    chanceForSmallAsteroid += 0.5; // Increase the chance by 0.5% each round
    chanceForVerySmallAsteroid += 0.1; // Increase the chance by 0.5% each round
  }

  function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 20, 30);
  }

  // Draw wave message
  function drawWaveMessage() {
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Wave ' + wave, canvas.width / 2, canvas.height / 2);
  }

  // Update asteroids
  function updateAsteroids() {
    for (let i = 0; i < asteroids.length; i++) {
      asteroids[i].x += asteroids[i].dx * asteroids[i].speed;
      asteroids[i].y += asteroids[i].dy * asteroids[i].speed;

      // Wrap asteroids around the screen
      if (asteroids[i].x < 0) {
        asteroids[i].x = canvas.width;
      } else if (asteroids[i].x > canvas.width) {
        asteroids[i].x = 0;
      }
      if (asteroids[i].y < 0) {
        asteroids[i].y = canvas.height;
      } else if (asteroids[i].y > canvas.height) {
        asteroids[i].y = 0;
      }
    }
  }

  // Draw asteroids
  function drawAsteroids() {
    ctx.fillStyle = 'gray';
    for (let i = 0; i < asteroids.length; i++) {
      ctx.beginPath();
      ctx.arc(asteroids[i].x, asteroids[i].y, asteroids[i].size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }
  }

  function createExplosion(x: any, y: any) {
    let explosion = {
      x: x,
      y: y,
      size: 30,
      alpha: 1
    };
    explosions.push(explosion);
  }

  // Update explosions
  function updateExplosions() {
    for (let i = 0; i < explosions.length; i++) {
      explosions[i].size += 1;
      explosions[i].alpha -= 0.01;
      if (explosions[i].alpha <= 0) {
        explosions.splice(i, 1);
        i--;
      }
    }
  }

  // Draw explosions
  function drawExplosions() {
    for (let i = 0; i < explosions.length; i++) {
      ctx.save();
      ctx.globalAlpha = explosions[i].alpha;
      ctx.beginPath();
      ctx.arc(explosions[i].x, explosions[i].y, explosions[i].size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = 'orange';
      ctx.fill();
      ctx.restore();
    }
  }

  // Reset ship position
  function resetShip() {
    setShipState(s => ({
      ...s,
      x: canvas.width / 2,
      y: canvas.height - 50,
      velocityX: 0,
      velocityY: 0
    }));
    // ship.x = canvas.width / 2;
    // ship.y = canvas.height - 50;
    // ship.velocityX = 0;
    // ship.velocityY = 0;
  }

  // function buySuperWeapon(weapon: any) {
  //   switch (weapon) {
  //     case 'missile':
  //       if (coins >= 200) {
  //         setCoins(s => s - 200);
  //         superWeapons.missile++;
  //         // updateMarketplaceDisplay();
  //       }
  //       break;
  //     case 'laser':
  //       if (coins >= 300) {
  //         setCoins(s => s - 300)
  //         superWeapons.laser++;
  //         // updateMarketplaceDisplay();
  //       }
  //       break;
  //     case 'bomb':
  //       if (coins >= 400) {
  //         setCoins(s => s - 400)
  //         superWeapons.bomb++;
  //         // updateMarketplaceDisplay();
  //       }
  //       break;
  //   }
  // }

  // Function to update marketplace display
  // function updateMarketplaceDisplay() {
  //   laserLevelDisplay.textContent = ship.laserLevel;
  //   accelerationLevelDisplay.textContent = ship.accelerationLevel;
  //   rotationSpeedLevelDisplay.textContent = ship.rotationSpeedLevel;
  //   droneSpeedLevelDisplay.textContent = droneUpgrades.speed;
  //   droneLaserSpeedLevelDisplay.textContent = droneUpgrades.laserSpeed;
  //   droneLaserIntervalLevelDisplay.textContent = droneUpgrades.laserInterval;
  // }

  // function activateMissile() {
  //   // Find the nearest asteroid to the ship
  //   let nearestAsteroid = null;
  //   let nearestDistance = Infinity;
  //   for (let i = 0; i < asteroids.length; i++) {
  //     let dx = ship.x - asteroids[i].x;
  //     let dy = ship.y - asteroids[i].y;
  //     let distance = Math.sqrt(dx * dx + dy * dy);
  //     if (distance < nearestDistance) {
  //       nearestAsteroid = asteroids[i];
  //       nearestDistance = distance;
  //     }
  //   }

  //   if (nearestAsteroid) {
  //     // Create an explosion at the nearest asteroid's position
  //     createExplosion(nearestAsteroid.x, nearestAsteroid.y);
  //     // Remove the nearest asteroid
  //     let index = asteroids.indexOf(nearestAsteroid);
  //     asteroids.splice(index, 1);
  //     score += 50;
  //   }
  // }

  // function activateLaserBeam() {
  //   // Destroy all asteroids in a straight line in front of the ship
  //   let angle = ship.rotation * Math.PI / 180;
  //   let startX = ship.x;
  //   let startY = ship.y;
  //   let endX = ship.x + canvas.width * Math.sin(angle);
  //   let endY = ship.y - canvas.width * Math.cos(angle);

  //   for (let i = asteroids.length - 1; i >= 0; i--) {
  //     if (isPointOnLine(asteroids[i].x, asteroids[i].y, startX, startY, endX, endY)) {
  //       createExplosion(asteroids[i].x, asteroids[i].y);
  //       asteroids.splice(i, 1);
  //       score += 50;
  //     }
  //   }
  // }

  // function isPointOnLine(px: any, py: any, startX: any, startY: any, endX: any, endY: any) {
  //   let threshold = 10; // Adjust this value to control the thickness of the laser beam
  //   let distance = Math.abs((endY - startY) * px - (endX - startX) * py + endX * startY - endY * startX) / Math.sqrt(Math.pow(endY - startY, 2) + Math.pow(endX - startX, 2));
  //   return distance <= threshold;
  // }

  // function activateBomb() {
  //   // Destroy all asteroids within a certain radius of the ship
  //   let bombRadius = 100; // Adjust this value to control the size of the bomb explosion
  //   for (let i = asteroids.length - 1; i >= 0; i--) {
  //     let dx = ship.x - asteroids[i].x;
  //     let dy = ship.y - asteroids[i].y;
  //     let distance = Math.sqrt(dx * dx + dy * dy);
  //     if (distance <= bombRadius) {
  //       createExplosion(asteroids[i].x, asteroids[i].y);
  //       asteroids.splice(i, 1);
  //       score += 50;
  //     }
  //   }
  // }

  // Handle keyboard input
  function handleKeyDown(event: any) {
    if (event.key === 'ArrowUp') {
      if (shipState.speed < shipState.maxSpeed) {
        setShipState(s => ({
          ...s,
          speed: s.speed + s.acceleration
        }));
        // ship.speed += ship.acceleration;
      }
    } else if (event.key === 'ArrowDown') {
      if (shipState.speed > 0) {
        setShipState(s => ({
          ...s,
          speed: s.speed - s.acceleration
        }));
        // ship.speed -= ship.acceleration;
      }
    } else if (event.key === 'ArrowLeft') {
      setShipState(s => ({
        ...s,
        rotation: s.rotation - s.rotationSpeed
      }));
      // ship.rotation -= ship.rotationSpeed;
    } else if (event.key === 'ArrowRight') {
      setShipState(s => ({
        ...s,
        rotation: s.rotation + s.rotationSpeed
      }));
      // ship.rotation += ship.rotationSpeed;
    } else if (event.key === ' ') {
      setShipState(s => ({
        ...s,
        lasers: [...s.lasers, { x: s.x, y: s.y, rotation: s.rotation, size: 2 }]
      }));
      // ship.lasers.push({ x: ship.x, y: ship.y, rotation: ship.rotation, size: 2 });
    } else if (event.key === 's') {
      pauseGameForMarketplace();
    }
  }

  function handleKeyUp(event: any) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      setShipState(s => ({
        ...s,
        speed: 0
      }))
      // ship.speed = 0;
    }
  }

  // Start the game

  useEffect(() => {
    startGame();
  });

  return (
    <>
      <canvas id="gameCanvas" ref={canvasRef} width="800" height="600"></canvas>
      <div id="marketplace" style={{ display: showMarketPlace ? 'block' : 'none' }}>
        <h2>Marketplace</h2>
        <p>Coins: <span id="coins">{coins}</span></p>
        <button onClick={() => upgrade('lasers')}>Upgrade Lasers (Cost: 100)</button> Level: <span id="laserLevel">{shipState.laserLevel}</span><br />
        <button onClick={() => upgrade('acceleration')}>Upgrade Acceleration (Cost: 100)</button> Level: <span id="accelerationLevel">{shipState.accelerationLevel}</span><br />
        <button onClick={() => upgrade('rotationSpeed')}>Upgrade Rotation Speed (Cost: 100)</button> Level: <span id="rotationSpeedLevel">{shipState.rotationSpeedLevel}</span><br />
        <button onClick={() => buyDrone()}>Buy Drone (Cost: 1000)</button><br />
        <button onClick={() => upgradeDrone('speed')}>Upgrade Drone Speed (Cost: 200)</button> Level: <span id="droneSpeedLevel">{droneUpgrades.speed}</span><br />
        <button onClick={() => upgradeDrone('laserSpeed')}>Upgrade Drone Laser Speed (Cost: 200)</button> Level: <span id="droneLaserSpeedLevel">{droneUpgrades.laserSpeed}</span><br />
        <button onClick={() => upgradeDrone('laserInterval')}>Upgrade Drone Laser Interval (Cost: 200)</button> Level: <span id="droneLaserIntervalLevel">{droneUpgrades.laserInterval}</span><br />
        <button onClick={() => exitMarketplace()}>Exit Marketplace</button>
      </div>
    </>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

const App = () => {
  const [smoothButtonsTransition, setSmoothButtonsTransition] = useState(false);

  return (
    <WebAppProvider options={{ smoothButtonsTransition }}>
      <DemoApp
        onChangeTransition={() => setSmoothButtonsTransition(state => !state)}
      />
    </WebAppProvider>
  );
};

root.render(<App />);
