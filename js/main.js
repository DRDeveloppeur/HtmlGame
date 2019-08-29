var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1200 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var stars;
var bombs;
var platforms;
var cursors;
var level = 1;
var score = 0;
var gameOver = false;
var scoreText;
var middleW = window.innerWidth/2;
var middleH = window.innerHeight/2;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('over', 'assets/over.png');
    this.load.spritesheet('me', 'assets/player.png', { frameWidth: 63, frameHeight: 63 });
}

function create ()
{
    //  A simple background for our game
    this.add.image(middleW-27, middleH, 'sky').setScale(4);
    for (var i = 1; i < 10; i++) {
        this.add.image(middleW+(1200*i), middleH, 'sky').setScale(4);
    }

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)

    for (var i = 0; i < 110; i++) {
        platforms.create(23+(46*i), window.innerHeight-22, 'ground').setScale(0.2).refreshBody();
    }
    for (var i = 15; i < 19; i++) {
        platforms.create(23+(46*i), window.innerHeight-200, 'ground').setScale(0.2).refreshBody();
    }
    for (var i = 2; i < 7; i++) {
        platforms.create(23+(46*i), window.innerHeight-300, 'ground').setScale(0.2).refreshBody();
    }
    for (var i = 10; i < 14; i++) {
        platforms.create(23+(46*i), window.innerHeight-400, 'ground').setScale(0.2).refreshBody();
    }
    for (var i = 17; i < 25; i++) {
        platforms.create(23+(46*i), window.innerHeight-500, 'ground').setScale(0.2).refreshBody();
    }
    for (var i = 27; i < 35; i++) {
        platforms.create(23+(46*i), window.innerHeight-500, 'ground').setScale(0.2).refreshBody();
    }
    for (var i = 40; i < 47; i++) {
        platforms.create(23+(46*i), window.innerHeight-300, 'ground').setScale(0.2).refreshBody();
    }
    for (var i = 48; i < 57; i++) {
        platforms.create(23+(46*i), window.innerHeight-500, 'ground').setScale(0.2).refreshBody();
    }
    for (var i = 75; i < 80; i++) {
        platforms.create(23+(46*i), window.innerHeight-200, 'ground').setScale(0.2).refreshBody();
    }
    for (var i = 89; i < 94; i++) {
        platforms.create(23+(46*i), window.innerHeight-300, 'ground').setScale(0.2).refreshBody();
    }
    for (var i = 95; i < 99; i++) {
        platforms.create(23+(46*i), window.innerHeight-130, 'ground').setScale(0.2).refreshBody();
    }
    for (var i = 101; i < 105; i++) {
        platforms.create(23+(46*i), window.innerHeight-130, 'ground').setScale(0.2).refreshBody();
    }

    // The player and its settings
    player = this.physics.add.sprite(middleW/1.7, middleH*1.5, 'me').setScale(0.9);

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('me', { start: 16, end: 26 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turnRight',
        frames: [ { key: 'me', frame: 11 } ],
        frameRate: 0
    });

    this.anims.create({
        key: 'turnLeft',
        frames: [ { key: 'me', frame: 27 } ],
        frameRate: 0
    });

    this.anims.create({
        key: 'death',
        frames: [ { key: 'me', frame: 10 } ],
        frameRate: 0
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('me', { start: 0, end: 9 }),
        frameRate: 10,
        repeat: -1
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    stars = this.physics.add.group({
        key: 'star',
        repeat: 9,
        setXY: { x: 100, y: 0, stepX: 500 }
    });

    stars.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    bombs = this.physics.add.group();

    //  The score

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#fff008' });
    levelText = this.add.text(16, 16, '1', { fontSize: '42px', fill: '#fff008' });

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, collectStar, null, this);

    this.physics.add.collider(player, bombs, hitBomb, null, this);

    this.physics.world.setBounds(0, 0, 5000, window.innerHeight);
    this.cameras.main.startFollow(player);
    this.cameras.main.setBounds(0, 0, 5000, window.innerHeight);
}

function update ()
{
    if (gameOver)
    {
        return;
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-400+(level*20));
        player.anims.play('left', true);
        this.nowDir = 'L';

    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(400+(level*20));
        player.anims.play('right', true);
        this.nowDir = 'R';
    }
    else if (this.nowDir === 'L') {
        player.setVelocityX(0);
        player.anims.play('turnLeft');
    }
    else
    {
        player.setVelocityX(0);
        player.anims.play('turnRight');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-700);
    }
    
    if (player.x+middleW > 5000){
        scoreText.setPosition(5000-middleW-100, 16)
        levelText.setPosition(5000-middleW-500, 16)
    }
    else if(player.x < middleW){
        scoreText.setPosition(middleW-100, 16)
        levelText.setPosition(middleW-500, 16)
    }
    else {
        scoreText.setPosition(player.x-100, 16)
        levelText.setPosition(player.x-500, 16)
    }
}

function collectStar (player, star)
{
    star.disableBody(true, true);

    //  Add and update the score
    score += 1;
    scoreText.setText('Score: ' + score);
    // setTimeout(function(){
    //     scoreText.setText();
    // }, 500)

    if (stars.countActive(true) === 0)
    {
        level++;
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        levelText.setText(level);

        var bomb = bombs.create(player.x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;

    }
}

function hitBomb (player, bomb)
{
    this.physics.pause();


    if (player.x+middleW > 5000){
        this.add.image(5000-middleW, middleH, 'over');
    }
    else if(player.x < middleW){
        this.add.image(middleW, middleH, 'over');
    }
    else {
        this.add.image(player.x, middleH, 'over');
    }

    player.setTint(0xff0000);

    player.anims.play('death');

    gameOver = true;
}