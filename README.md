# Cyberpunk Space Invaders

Ein einfaches, lokales Space Invaders im Cyberpunk-Stil ohne externe Abhängigkeiten.

## Projektstruktur

Das Projekt besteht aus drei Hauptdateien, die alle direkt zusammenarbeiten:

- `index.html`: Enthält die Grundstruktur der Seite. Sie definiert das `<canvas>`-Element, auf dem das eigentliche Spiel gezeichnet wird, sowie drei UI-Overlay-Container (`hud`, `start-screen`, `game-over-screen`), die über dem Canvas liegen.
- `style.css`: Verleiht dem Spiel den Cyberpunk-Look. Hier sind Neon-Farben, Glow-Effekte (Text-Shadow / Box-Shadow), der CRT-Scanline-Effekt sowie die Glitch-Animationen der Titeltexte definiert. Die UI ist modern und atmosphärisch gestaltet.
- `script.js`: Beinhaltet die gesamte Spiellogik. Es teilt sich prinzipiell in Rendering, Logik, UI-Schnittstelle und Datenspeicherung auf.

## Wie man das Spiel lokal startet

1. Öffne den Ordner, der diese Dateien enthält (z. B. `CyberSpaceInvaders`).
2. Mache einen **Doppelklick auf die Datei `index.html`** oder ziehe sie per Drag & Drop in deinen Browser (Chrome, Firefox, Safari, Edge).
3. Das Spiel funktioniert lokal über das `file://` Protokoll. Ein lokaler Webserver ist **nicht** zwingend erforderlich, da wir keine externen Module oder APIs abfragen, die von CORS-Richtlinien blockiert würden.

## Erklärung des Codes (`script.js`)

Die wichtigste Datei für das Spielverhalten ist `script.js`. Sie ist so strukturiert, dass sie jederzeit leicht erweiterbar ist:

1. **Gameplay & Logik**: Die Objektklassen `Player`, `Enemy`, `Bullet` und `Particle` steuern das Verhalten der einzelnen Elemente auf dem Bildschirm. Jede Klasse hat eine `update()` Methode für die Logik (Bewegung, Kollision). Die Haupt-Funktionen `checkCollisions()` und `updateEnemySwarm()` steuern das übergreifende Spielgeschehen und Wellen-Management.
2. **Rendering / Zeichnen**: Statt externe Bilder zu laden, werden alle Grafiken lokal direkt im HTML5-Canvas gerendert. Dafür sorgt die Methode `.draw()` an jedem Objekt. Der Neon-Effekt der Objekte wird durch `ctx.shadowBlur` und `ctx.shadowColor` (Canvas-Boardmittel) erzeugt.
3. **UI (User Interface)**: Anstatt Texte via Canvas zu zeichnen, liegen die Startmenüs und Highscores als sauberes HTML-Gitter über dem Spiel. Funktionen wie `updateHUD()` und `gameOver()` blenden über `classList.add('hidden')` bzw. `.remove('hidden')` die korrekten HTML-Menüs und Texte direkt aus bzw. ein.
4. **LocalStorage (Speichern)**: Der Highscore wird permanent gespeichert. Gleich am Anfang von `script.js` wird versucht, den Highscore aus `localStorage.getItem('cyberInvadersHiScore')` zu lesen. Wenn der Spieler stirbt, wird im `gameOver()` geprüft, ob der Score höher als der Highscore ist. Falls ja, wird mit `localStorage.setItem(...)` der neueste Wert fest im Browser verankert.
