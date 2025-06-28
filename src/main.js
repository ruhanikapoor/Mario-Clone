import Phaser from 'phaser';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
    }
  },
  scene: {
    preload,
    create,
    update
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

let player;
let cursors;

const game = new Phaser.Game(config);

function preload() {
  this.load.image('clouds', '/assets/clouds.png');
  this.load.image('ground', '/assets/ground.png');
  this.load.spritesheet('mario', '/assets/mario.png', {
    frameWidth: 58,
    frameHeight: 73
  });
}
let bg;
function create() {
const cloudTexture = this.textures.get('clouds');
const cloudFrame = cloudTexture.getSourceImage();

const cloudStripHeight = cloudFrame.height;
const cloudY = 50;
bg = this.add.tileSprite(
  0,
  cloudY,
  this.scale.width,
  cloudStripHeight,
  'clouds'
).setOrigin(0, 0).setScrollFactor(0);

const platforms = this.physics.add.staticGroup();

const tileWidth = 32;
const tilesAcross = Math.ceil(config.width / tileWidth);
for (let i = 0; i < tilesAcross; i++){
  platforms.create(i * tileWidth, config.height - 32, 'ground').setOrigin(0, 0).refreshBody();
}

  player = this.physics.add.sprite(100, config.height - 100, 'mario');
  player.setCollideWorldBounds(true);
  this.physics.add.collider(player, platforms)


  this.anims.create({
    key: 'walk',
    frames: this.anims.generateFrameNumbers('mario', { start: 0, end: 2 }),
    frameRate: 6,
    repeat: -1
  });

  cursors = this.input.keyboard.createCursorKeys();

  this.cameras.main.setBackgroundColor('#5c94fc');
}

function update() {
  if (bg) {
  bg.tilePositionX += 0.3;
}
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play('walk', true);
    player.flipX = true;
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play('walk', true);
    player.flipX = false;
  } else {
    player.setVelocityX(0);
    player.anims.stop();
    player.setFrame(0);
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-500);
  }
}

window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});
