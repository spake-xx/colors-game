class startScreen extends Phaser.Scene {
    constructor() {
        super("Boot");
    }

    create() {
        // load default game options
        this.gameOptions = {
            tileSpeed: 120,
            columns: 5,
            rows: 20,
            music: true,
            effects: true
        }
        this.showMainMenu();
    }

    // show main menu
    showMainMenu() {
        this.playBtn = this.add.text(game.scale.width / 2, game.scale.height / 3, "START GAME", {
            fontSize: "72px Arial"
        });
        this.playBtn.setOrigin(0.5);
        this.playBtn.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.playBtn.width, this.playBtn.height), Phaser.Geom.Rectangle.Contains);

        this.renderDifficultyLevels();
        this.renderMusic();
        this.renderEffects();

        this.playBtn.on('pointerdown', function () {
            this.scene.start("PlayGame", this.gameOptions);
        }, this);
    }

    // difficulty levels handler
    renderDifficultyLevels() {
        this.easyBtn = this.add.text(game.scale.width / 2, this.playBtn.y + 72, "EASY", {
            fontSize: "48px Arial"
        });
        this.easyBtn.setOrigin(0.5);
        this.easyBtn.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.easyBtn.width, this.easyBtn.height), Phaser.Geom.Rectangle.Contains);

        // difficulty levels button handler
        this.easyBtn.on('pointerdown', function(){
            switch(this.gameOptions.tileSpeed){
                // if set easy(120), switch to a medium (150)
                case 120:
                    this.gameOptions.tileSpeed = 150;
                    this.easyBtn.setText("MEDIUM");
                    break;
                // if set 150(medium), switch to hard(200)
                case 150:
                    this.gameOptions.tileSpeed = 200;
                    this.easyBtn.setText("HARD");
                    break;
                // if set other option (only hard remain), switch to easy easy(120)
                default:
                    this.gameOptions.tileSpeed = 120;
                    this.easyBtn.setText("EASY");
                    break;
            }

        }, this)
    }

    // music settings handler
    renderMusic() {
        this.musicBtn = this.add.text(game.scale.width / 2, this.easyBtn.y + 48, "MUSIC ON", {
            fontSize: "48px Arial"
        });
        this.musicBtn.setOrigin(0.5);
        this.musicBtn.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.musicBtn.width, this.musicBtn.height), Phaser.Geom.Rectangle.Contains);

        // music settings button handler
        this.musicBtn.on('pointerdown', function(){
            switch(this.gameOptions.music){
                // if turned off, then turn on
                case false:
                    this.gameOptions.music = true;
                    this.musicBtn.setText("MUSIC ON");
                    break;
                // if turned on, then turn off
                case true:
                    this.gameOptions.music = false;
                    this.musicBtn.setText("MUSIC OFF");
                    break;
            }

        }, this)
    }

    // visual effects handler
    renderEffects() {
        this.effectsBtn = this.add.text(game.scale.width / 2, this.musicBtn.y + 48, "EFFECTS ON", {
            fontSize: "48px Arial"
        });
        this.effectsBtn.setOrigin(0.5);
        this.effectsBtn.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.effectsBtn.width, this.effectsBtn.height), Phaser.Geom.Rectangle.Contains);

        // visual effects button handler
        this.effectsBtn.on('pointerdown', function(){
            switch(this.gameOptions.effects){
                // if turned off, then turn on
                case false:
                    this.gameOptions.effects = true;
                    this.effectsBtn.setText("EFFECTS ON");
                    break;
                // if turned on, then turn off
                case true:
                    this.gameOptions.effects = false;
                    this.effectsBtn.setText("EFFECTS OFF");
                    break;
            }

        }, this)
    }
}

// game over screen
class gameOverScreen extends Phaser.Scene {
    constructor() {
        super("GameOver");
    }

    // initialize data from previous session (points count)
    init(data) {
        this.score = data.score;
    }

    // create game over screen with points count
    create() {
        // add button "play again"
        this.playBtn = this.add.text(game.scale.width / 2, game.scale.height / 2, "PLAY AGAIN", {
            fontSize: "72px Arial"
        });
        this.playBtn.setOrigin(0.5);
        // create interactive box on the text to have possibility to click on it
        this.playBtn.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.playBtn.width, this.playBtn.height), Phaser.Geom.Rectangle.Contains);

        this.mainMenuBtn = this.add.text(this.playBtn.x, this.playBtn.y + 72, "MAIN MENU", {
            fontSize: "72px Arial"
        });
        this.mainMenuBtn.setOrigin(0.5);
        this.mainMenuBtn.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.playBtn.width, this.playBtn.height), Phaser.Geom.Rectangle.Contains);

        this.gameOver = this.add.text(game.scale.width / 2, this.playBtn.y / 2, "GAME OVER", {
            fontSize: "96px Arial"
        });
        this.gameOver.setOrigin(0.5);

        this.pointsTxt = this.add.text(game.scale.width / 2, this.gameOver.y + ((this.playBtn.y - this.gameOver.y) / 2), "You got " + this.score + " points", {
            fontSize: "48px Arial"
        });
        this.pointsTxt.setOrigin(0.5);

        // initialize action to buttons "play again" and "main menu"
        this.playBtn.on('pointerdown', function () {
            this.scene.start("PlayGame");
        }, this);
        this.mainMenuBtn.on('pointerdown', function () {
            this.scene.start("Boot", gameOptions);
        }, this);
    }
}