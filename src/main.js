import Phaser from "phaser";

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1000 },
      debug: false,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

let player;
let cursors;
let bg;
let platforms;
let obstacles;
let groundTiles = [];
let groundY;
let gameOver = false;
let gameStarted = false;
let gameOverText;
let startText;
let score = 0;
let scoreText;
let nextObstacleTime = 0;
let themeMusic;
let jumpSound;

const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const game = new Phaser.Game(config);
const tileWidth = 54;

function checkOrientation(forceReload = false) {
  const isPortrait = window.innerHeight > window.innerWidth;
  const warning = document.getElementById("rotate-warning");

  if (isMobile) {
    if (isPortrait) {
      warning.style.display = "flex";
      game.canvas.style.display = "none";
    } else {
      warning.style.display = "none";
      game.canvas.style.display = "block";
      if (forceReload) {
        location.reload();
      }
    }
  } else {
    warning.style.display = "none";
    game.canvas.style.display = "block";
  }
}

window.addEventListener("orientationchange", () => {
  setTimeout(() => checkOrientation(true), 300);
});

window.addEventListener("resize", () => {
  setTimeout(() => checkOrientation(false), 100);
});

window.addEventListener("load", () => checkOrientation(false));

function preload() {
  this.load.audio("theme", "/assets/theme.mp3");
  this.load.audio("jump", "/assets/jump.mp3");
  this.load.image("clouds", "/assets/clouds.png");
  this.load.image("ground", "/assets/ground.png");
  this.load.image("block", "/assets/block.png");
  this.load.spritesheet("mario", "/assets/mario.png", {
    frameWidth: 58,
    frameHeight: 73,
  });
}

function create() {
  const worldHeight = 1000;
  themeMusic = this.sound.add("theme", {
    loop: true,
    volume: 0.5,
  });
  jumpSound = this.sound.add("jump", { volume: 0.4 });

  const cloudTexture = this.textures.get("clouds");
  const cloudStripHeight = cloudTexture.getSourceImage().height;
  const cloudY = 50;
  bg = this.add
    .tileSprite(0, cloudY, this.scale.width, cloudStripHeight, "clouds")
    .setOrigin(0, 0)
    .setScrollFactor(0);

  platforms = this.physics.add.staticGroup();
  groundTiles = [];
  const tileCount = Math.ceil((this.scale.width * 2) / tileWidth);
  groundY = worldHeight - 54;

  for (let i = 0; i < tileCount; i++) {
    const tile = platforms
      .create(i * tileWidth, groundY, "ground")
      .setOrigin(0, 0)
      .refreshBody();
    groundTiles.push(tile);
  }

  player = this.physics.add.sprite(100, groundY - 100, "mario");
  player.setCollideWorldBounds(true);
  player.body.allowGravity = true;
  this.physics.add.collider(player, platforms);

  this.cameras.main.startFollow(player, false, 0, 1);

  this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, worldHeight);
  this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, worldHeight);

  this.cameras.main.setBackgroundColor("#5c94fc");

  obstacles = this.physics.add.group();
  this.physics.add.collider(player, obstacles, hitObstacle, null, this);
  this.physics.add.collider(obstacles, platforms);

  this.anims.create({
    key: "walk",
    frames: this.anims.generateFrameNumbers("mario", { start: 0, end: 2 }),
    frameRate: 9,
    repeat: -1,
  });

  cursors = this.input.keyboard.createCursorKeys();

  gameOverText = this.add
    .text(
      config.width / 2,
      config.height / 2,
      isMobile
        ? "Game Over!!\nTap to Restart"
        : "Game Over!!\nPress R to Restart",
      {
        fontSize: "32px",
        fill: "#fff",
        align: "center",
      }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setVisible(false);

  startText = this.add
    .text(
      config.width / 2,
      config.height / 2 - 100,
      isMobile ? "Tap to jump!" : "Press ↑ to jump!",
      {
        fontSize: "28px",
        fill: "#fff",
        align: "center",
      }
    )
    .setOrigin(0.5)
    .setScrollFactor(0);

  scoreText = this.add
    .text(16, 16, "Score: 0", {
      fontSize: "24px",
      fill: "#fff",
    })
    .setScrollFactor(0);
}

function update() {
  const warningVisible =
    document.getElementById("rotate-warning")?.style.display === "flex";
  const tapped = isMobile && this.input.activePointer.isDown && !warningVisible;

  if (gameOver) {
    const rKey = this.input.keyboard.addKey("R");
    if (Phaser.Input.Keyboard.JustDown(rKey) || tapped) {
      this.scene.restart();
      gameOver = false;
      gameStarted = false;
      score = 0;
      nextObstacleTime = 0;
    }
    return;
  }

  if (!gameStarted) {
    const jumped = (cursors.up.isDown || tapped) && !warningVisible;
    if (jumped && player.body.touching.down) {
      player.setVelocityY(-500);
      if (jumpSound) jumpSound.play();
      gameStarted = true;
      startText.setVisible(false);
      if (themeMusic) themeMusic.play();
      nextObstacleTime = this.time.now + Phaser.Math.Between(1000, 2200);
    }
    return;
  }

  const scrollSpeed = 5;
  this.cameras.main.scrollX += scrollSpeed;

  if (bg) bg.tilePositionX = this.cameras.main.scrollX * 0.5;

  const scrollX = this.cameras.main.scrollX;
  player.x = scrollX + 100;

  groundTiles.forEach((tile) => {
    if (tile.x + tile.width < scrollX) {
      tile.x += tileWidth * groundTiles.length;
      tile.refreshBody();
    }
  });

  obstacles.getChildren().forEach((obstacle) => {
    const buffer = 200;
    if (obstacle.x + obstacle.width < scrollX - buffer) {
      obstacles.remove(obstacle, true, true);
    }
  });

  const jumped = cursors.up.isDown || tapped;
  if (jumped && player.body.touching.down) {
    player.setVelocityY(-500);
    if (jumpSound) jumpSound.play();
  }

  if (player.body.touching.down) {
    player.anims.play("walk", true);
  } else {
    player.anims.stop();
    player.setFrame(0);
  }

  score += 1;
  scoreText.setText(`Score: ${Math.floor(score / 10)}`);

  const currentTime = this.time.now;
  if (currentTime > nextObstacleTime) {
    spawnObstacle.call(this, groundY);
    const delay = Phaser.Math.Between(1000, 5300);
    nextObstacleTime = currentTime + delay;
  }
}

function spawnObstacle(groundY) {
  const spawnX = this.cameras.main.scrollX + config.width - 100;

  const obstacle = obstacles
    .create(spawnX, groundY - 70, "block")
    .setOrigin(0, 0)
    .setImmovable(true);

  obstacle.body.allowGravity = false;
  obstacle.refreshBody();
}

function hitObstacle(player, obstacle) {
  if (themeMusic && themeMusic.isPlaying) {
    themeMusic.stop();
  }
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.stop();
  gameOver = true;
  gameOverText.setVisible(true);
}
