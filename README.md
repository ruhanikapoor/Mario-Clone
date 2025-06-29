# Mario: Endless Runner

A cute endless runner game inspired by classic Mario and Chrome Dino, built with [Phaser 3](https://phaser.io/phaser3) and JavaScript.

## Play

- Press **↑** (up arrow) on desktop or **tap** on mobile to jump.
- Avoid obstacles (blocks); hitting one ends the game.
- Score increases the longer you survive.

## Features

- Auto-scrolling endless runner world
- Randomized obstacles spawning offscreen
- Smooth Mario walking animation
- Jump sound effects and looping theme music
- Responsive design and full screen scaling
- Device rotation warning for mobile in portrait mode
- Restart the game with **R** key (desktop) or tap (mobile)


## Controls

| Platform | Controls        |
|----------|-----------------|
| Desktop  | ↑ key to jump, R to restart |
| Mobile   | Tap to jump or restart |

## Assets 

- Mario sprite sheet (custom cropped)
- Ground, cloud, and block images
- Original Super Mario Bros music cropped for seamless loop
- Jump sound effect

## Code Overview

- Uses Phaser 3 with arcade physics for simple gravity and collisions
- Camera follows Mario horizontally
- Ground and obstacles loop infinitely by repositioning offscreen tiles
- Obstacles spawn randomly behind the scenes, positioned on the ground
- Handles device orientation for mobile with a rotate-to-landscape message
- Touch input replaces keyboard controls on mobile

## Try It Here

[Mario Endless Runner](https://mario-endless-runner.netlify.app/)

## Credits

Mario sprites and music are owned by Nintendo.
