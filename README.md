# Cyberpunk Space Invaders

A simple, local Space Invaders clone with a Cyberpunk aesthetic, built without any external dependencies.

## Project Structure

The project consists of three main files that work together directly:

- `index.html`: Contains the basic structure of the page. It defines the `<canvas>` element (where the actual game is drawn) and three UI overlay containers (`hud`, `start-screen`, `game-over-screen`) that sit on top of the canvas.
- `style.css`: Gives the game its Cyberpunk look. This includes neon colors, glow effects (text-shadow / box-shadow), the CRT scanline effect, and the glitch animations for the title screens. The UI is designed to be modern and atmospheric.
- `script.js`: Contains all the game logic. It is roughly divided into rendering, logic, UI interfacing, and data storage.

## How to Play Locally

1. Open the folder containing these files (e.g., `CyberSpaceInvaders`).
2. **Double-click the `index.html` file** or drag and drop it into your web browser (Chrome, Firefox, Safari, Edge).
3. The game runs locally via the `file://` protocol. A local web server is **not** required, as we aren't fetching any external modules or APIs that would be blocked by CORS policies.

## Code Explanation (`script.js`)

The most important file for the game's behavior is `script.js`. It is structured to be easily expandable:

1. **Gameplay & Logic**: The object classes `Player`, `Enemy`, `Bullet`, and `Particle` control the behavior of individual elements on the screen. Each class has an `update()` method for its logic (movement, collision). The main functions `checkCollisions()` and `updateEnemySwarm()` manage the overall game loop and enemy waves.
2. **Rendering / Drawing**: Instead of loading external images, all graphics are rendered locally directly onto the HTML5 Canvas. The `.draw()` method on each object handles this. The neon glow effect is created using built-in canvas features (`ctx.shadowBlur` and `ctx.shadowColor`).
3. **UI (User Interface)**: Instead of drawing texts via the canvas, the start menus and high scores hover over the game as a clean HTML grid. Functions like `updateHUD()` and `gameOver()` hide or show the correct HTML menus and texts directly using `classList.add('hidden')` and `.remove('hidden')`.
4. **LocalStorage (Saving)**: The high score is stored permanently. At the very beginning of `script.js`, it attempts to read the high score from `localStorage.getItem('cyberInvadersHiScore')`. When the player dies, `gameOver()` checks if the score is higher than the high score. If it is, `localStorage.setItem(...)` securely anchors the newest value in the browser.
