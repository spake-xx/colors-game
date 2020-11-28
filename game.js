let game;
let gameOptions;

window.onload = function () {
    let gameConfig = {
        // Phaser automatically will set render method: Canvas or WebGL
        type: Phaser.AUTO,
        scale: {
            // set center mode
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            // name of the box where game will appear
            parent: "game",
            // size
            width: 750,
            height: 1334
        },
        physics: {
            // set physics configuration to the "arcade" mode
            default: "arcade"
        },
        // load all the scenes
        scene: [startScreen, playGame, gameOverScreen]
    }
    // start new game instance
    game = new Phaser.Game(gameConfig);
}

class playGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }
    // load data received from menu (game configuration)
    init(gameOptionsFromMenu){
        gameOptions = gameOptionsFromMenu;
    }

    preload() {
        // load music; CreativeCommons music from bensound.com
        if(gameOptions.music) this.load.audio("music", "assets/soundtrack.mp3");

        // tiles joining sounds from freesound.org
        this.load.audio("single", "assets/single_boom.wav");

        // load images with tiles from sprite-box
        this.load.spritesheet("tiles", "assets/tiles.png", {
            frameWidth: 100,
            frameHeight: 100
        });
        // load explosion textures
        if(gameOptions.effects) this.load.atlas('flares', 'assets/flares.png', 'assets/flares.json'); // zrodlo https://labs.phaser.io/view.html?src=src\game%20objects\particle%20emitter\create%20emitter%20from%20config.js
    }

    create() {
        // add tiles joining sound
        this.singleBoom = this.sound.add('single');

        // add particles, which will be used with explosion
        if(gameOptions.effects) {
            this.p = this.add.particles('flares');
            this.p.setDepth(5);
        }

        // if music is turned on, play and loop music
        if(gameOptions.music) {
            this.music = this.sound.add('music');
            this.music.play({
                loop: true,
                volume: 0.2
            });
        }

        // add objects to dynamic physics group
        this.tileGroup = this.physics.add.group();
        // variables with points and current tiles speed (it rises in time)
        this.score = 0;
        this.tileSpeed = gameOptions.tileSpeed;

        // adjust single tile size to the screen width and column count
        this.tileSize = game.config.width / gameOptions.columns;

        // add tiles to the game
        for (let i = 0; i < gameOptions.rows; i++) {
            // array with (column count in the game) numbers
            let values = Phaser.Utils.Array.NumberArray(0, gameOptions.columns - 1);

            // random array elements
            Phaser.Utils.Array.Shuffle(values);

            // save middle tile color (player color should be different)
            if (i === 0) {
                var middleColor = values[Math.floor(gameOptions.columns / 2)];
            }

            // tiles arrangement
            for (let j = 0; j < gameOptions.columns; j++) {
                // add tile to physics group (kolor ze sprite'a wg. wartości z tablicy values)
                let tile = this.tileGroup.create(j * this.tileSize, i * this.tileSize + game.config.height / 4 * 3, "tiles", values[j]);
                // adjust size and "anchor" tile
                this.adjustTile(tile);
            }
        }

        let values = Phaser.Utils.Array.NumberArray(0, gameOptions.columns - 1);

        // remove "middleColor" from array, in order it won't be assigned to the player
        values.splice(middleColor, 1);

        // add player
        this.player = this.tileGroup.create(this.tileSize * Math.floor(gameOptions.columns / 2), game.config.height / 4 * 3 - this.tileSize, "tiles", Phaser.Utils.Array.GetRandom(values));
        // set "depth" where player is, in order to particles will appear on the tile, not under tile
        this.player.setDepth(1);
        // adjust player tile
        this.adjustTile(this.player);

        // move all tiles upside
        this.tileGroup.setVelocityY(-this.tileSpeed);

        this.canMove = true;
        this.matched = false;

        //  set listener for mouse click
        this.input.on("pointerdown", this.moveTile, this);

        // add points counter to the screen
        this.txtScore = this.add.text(game.scale.width / 2, 50, "Points: " + this.score, {
            font: "65px Arial",
            fill: "#ffffff",
            align: "center"
        });
        this.txtScore.setOrigin(0.5);
    }

    adjustTile(sprite) {
        sprite.setOrigin(0);
        sprite.displayWidth = this.tileSize;
        sprite.displayHeight = this.tileSize;
    }

    moveTile(pointer) {
        if (this.canMove) {
            // count column which has been clicked
            let column = Math.floor(pointer.x / this.tileSize);

            // count distance from current player position
            let distance = Math.floor(Math.abs(column * this.tileSize - this.player.x) / this.tileSize);

            // has it been moved?
            if (distance > 0) {
                this.canMove = false;
                // transition animation
                this.tweens.add({
                    targets: [this.player],
                    x: column * this.tileSize,
                    duration: distance * 30,
                    callbackScope: this,
                    onComplete: function () {
                        // check if color match
                        this.checkMatch(0);
                    }
                });
            }
        }
    }

    checkMatch(combo) {
        // retrieve tile under player
        let tileBelow = this.physics.overlapRect(this.player.x + this.tileSize / 2, this.player.y + this.tileSize * 1.5, 1, 1);

        // if tile under player is same as player?
        if (tileBelow[0].gameObject.frame.name === this.player.frame.name) {
            // play tile joining sound
            this.singleBoom.play();

            // add score and associated event
            this.addScore();
            // if bunch in a row, shakes the camera
            if (combo && gameOptions.effects) this.cameras.main.shake(500);

            this.matched = true;
            // retrieve all row
            let rowBelow = this.physics.overlapRect(0, this.player.y + this.tileSize * 1.5, game.config.width, 1);

            // animation - player tile downwards
            this.tweens.add({
                targets: [this.player],
                y: tileBelow[0].gameObject.y,
                duration: 140,
                callbackScope: this,
                onUpdate: function (tween, target) {
                    // in every frame we should correct player position (tiles are going upwards)
                    this.player.y = Math.min(this.player.y, tileBelow[0].gameObject.y)
                },
                // after animation we move all tiles row downwards
                onComplete: function () {
                    let values = Phaser.Utils.Array.NumberArray(0, gameOptions.columns - 1);
                    Phaser.Utils.Array.Shuffle(values);

                    for (let i = 0; i < gameOptions.columns; i++) {
                        // change tiles colors
                        rowBelow[i].gameObject.setFrame(values[i]);
                        // change position
                        rowBelow[i].gameObject.y += this.tileSize * gameOptions.rows;
                    }

                    // again check match, possibility for combo occured
                    this.checkMatch(1);
                }
            });
        } else {
            this.canMove = true;

            if (this.matched) {
                this.matched = false;

                // tile below player
                let tileBelow = this.physics.overlapRect(this.player.x + this.tileSize / 2, this.player.y + this.tileSize * 1.5, 1, 1);

                let values = Phaser.Utils.Array.NumberArray(0, gameOptions.columns - 1);
                // remove middle element color from the array
                values.splice(tileBelow[0].gameObject.frame.name, 1);
                // change player color
                this.player.setFrame(Phaser.Utils.Array.GetRandom(values));
            }
        }
    }

    update() {
        // check if player lost
        if (this.player.y < 0) {
            // show start screen
            if(this.music!=null) this.music.stop();
            this.scene.start("GameOver", {score: this.score});
        }
    }

    addScore() {
        // add a point and update counter
        this.score++;
        this.txtScore.setText("Points: " + this.score);
        let e;

        // create explosion
        if(gameOptions.effects) {
            e = this.p.createEmitter({
                frame: ['red', 'blue', 'green', 'yellow'],
                speed: 200,
                lifespan: 3000,
                blendMode: 'ADD'
            });
        }
        // every 10 points accelerate tiles speed
        if (this.score % 10 === 0) {
            // every 10 points explosion is bigger
            if(gameOptions.effects) e.explode(50, this.player.x + (this.player.width / 2), this.player.y + (this.player.height / 2) + 100);
            this.tileSpeed += 20;
            // and music is increasingly faster
            if(gameOptions.music) this.music.setRate(this.music.rate*1.05);
            this.tileGroup.setVelocityY(-this.tileSpeed);
        } else {
            if(gameOptions.effects)
            e.explode(15, this.player.x + (this.player.width / 2), this.player.y + (this.player.height / 2) + 150);
        }
    }
}