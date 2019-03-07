//Game
var bulletArray = [
    "IT",
    "MT",
    "MB",
    "ET",
    "CH"
];
var colorArray = [
    "#5F338B",
    "#008831",
    "#008DC2",
    "#B50A11",
    "#F59A05"
];
var bulletLinkArray = [
    "window.location='https://www.htl-wels.at/index.php?id=285'",
    "window.location='https://www.htl-wels.at/index.php?id=294'",
    "window.location='https://www.htl-wels.at/index.php?id=290'",
    "window.location='https://www.htl-wels.at/index.php?id=313'",
    "window.location='https://www.htl-wels.at/index.php?id=297'"
];

var actBullet = 0;
var rotation = 36;
var gameSpeed = 2;
var points = 0;
var pointsTotal = 0;
var pointsAverage = 0;
var playedGamesTotal = 0;
var gameRunning = false;    //true if on game screen and lifesaver progress is not running

//Lifesaver
var lifesaver = 0;
var nextLifesaverIn = 200;
var lifesaverActive = false;
var lifesaverTimeout1s;
var lifesaverTimeout2s;
var lifesaverTimeout3s;

//Lifesaver Progressbar
var canvas = document.getElementById("lifesaverProgress");
var context = canvas.getContext("2d"); //to return drawing context on canvas
var progress = 0; //percentage amount already loaded
var start = 4.72; //from where to start position of progress;
var cWidth = context.canvas.width/2; //x cordinate/2 (centered);
var cHeight = context.canvas.height/2; //y coordinate (centered);
var progressRad; //progress in radians
var progressRunning = false;
var barInterval;

//Ranking
var rankings = [];

//Settings
var lang = "at";
var playername = "";
var activeScreenID = 2;
var actualDesignID = 0;
var design = ["#4b4b4b", "#5F338B", "#008831", "#008DC2", "#B50A11", "#F59A05"];
var audioMuted = false;
var musicMuted = false;

//Variables for language
var resetScoreAck = "Sind Sie sicher, dass Sie Ihren Spielstand zurücksetzen wollen?";

//LocalStorage
var scoreSaved = false;  //if score saved for the first time -> variable always true
var scoreResetted = false;  //the score will always be saved when closing or reloading the tab, this variable avoids this when resetting the score

//Easter Eggs
var rotationsPerSec = 0;
var inceptionActive = false;

//Snake
var snakeActive = false;    //active, as long as snake is visible
var snakeGameOver = false;  //true after border collision until new snake

var snakeMoveInterval;
var snakeMoveDirection;
var snakeTerminateTimeout;

var snakeTop;
var snakeBody1Top;
var snakeBody2Top;
var snakeBody3Top;
var snakeBody4Top;
var snakeLeft;
var snakeBody1Left;
var snakeBody2Left;
var snakeBody3Left;
var snakeBody4Left;
var snakeWidth;
var snakeHeight;

//Sounds
var audioPoint = [new Audio("sounds/blubb1.ogg"), new Audio("sounds/blubb2.ogg"), new Audio("sounds/blubb3.ogg")];
var audioDisc = [new Audio("sounds/woosh1.ogg"), new Audio("sounds/woosh2.ogg"), new Audio("sounds/woosh3.ogg")];
var actualDiscSound = 0;
var audioGameover = new Audio("sounds/gameover.ogg");
var audioNewHighscore = new Audio("sounds/highscore.ogg");
var audioInception = new Audio("sounds/inception.ogg");
var musicBackgroundSpeedUp = new Audio("sounds/backgroundMusicSpeedUp.ogg");
var musicBackground150 = new Audio("sounds/backgroundMusic150.ogg");
var musicSnakeBackground = new Audio("sounds/snake_backgroundMusic.ogg");
var audioSnakeGameOver = new Audio("sounds/snake_gameOver.ogg");

initalize();
function initalize() {
    intro();
    detectBrowser();
    resize();
    loadJSON();
    loadStorage();
}

function intro() {
    document.getElementById("introContainer").addEventListener("webkitAnimationEnd", introEnd);
}
function introEnd() {
    document.getElementById("introContainer").removeEventListener("webkitAnimationEnd", introEnd);
    document.getElementById("introContainer").style.display = "none";
    document.getElementById("disc").style.webkitAnimationName = "none";
    document.getElementById("startButton").style.webkitAnimationName = "none";
}

//-----------------------------------------------------

function loadJSON() {
    getJSON(function(response) {
        var json = JSON.parse(response);
        document.getElementById("credits").innerHTML = json['is-credits'];
        document.getElementById("hsHeader-points").innerHTML = json['hs-points'];
        document.getElementById("hsHeader-name").innerHTML = json['hs-name'];
        document.getElementById("hsHeader-date").innerHTML = json['hs-date'];
        document.getElementById("startButton").innerHTML = json['gs-start'];
        document.getElementById("playButton").innerHTML = json['gs-start'];

        document.getElementById("muteAudioButton").title = json['is-mute-sound'];
        document.getElementById("muteMusicButton").title = json['is-mute-music'];
        document.getElementById("resetButton").title = json ['is-resetscore'];
        resetScoreAck = json['is-resetscore-ack'];

        document.getElementById("playernameLabel").innerHTML = json['is-playername'];
        document.getElementById("playername").placeholder = json['is-playername-ph'];

        document.getElementById("statsTitle").innerHTML = json['stats-title'];
        document.getElementById("playedGamesTotalTitle").innerHTML = json['played-games-total'];
        document.getElementById("pointsTotalTitle").innerHTML = json['points-total'];
        document.getElementById("pointsAverageTitle").innerHTML = json['points-average'];
        document.getElementById("nextLifesaverInTitle").innerHTML = json['next-lifesaver-in'];

        document.getElementById("designTitle").innerHTML = json['design-title'];
    });
}
function changeLang(langID) {
    lang = langID;
    loadJSON();
}
function getJSON(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'lang/' + lang + '.json', true);
    xobj.onreadystatechange = function () {
        if(xobj.readyState == 4 && xobj.status == "200") {
            //Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}
function changeScreen(id) {
    if(!inceptionActive) {
        //if changing screen while progress bar running -> stop it
        if(progressRunning) {
            document.getElementById("lifesaverProgress").style.display = "none";

            //if user pressed lifesaver but then changes screen -> stop lifesaver and give used lifesaver back, because he wasn't able to use it
            if(progressRunning === true && lifesaverActive === true) {
                document.getElementById("lifesaverCountdown").innerHTML = "";
                clearTimeout(lifesaverTimeout1s);
                clearTimeout(lifesaverTimeout2s);
                clearTimeout(lifesaverTimeout3s);
                lifesaver++;
            }

            gameRunning = true;
            progressRunning = false;
            clearTimeout(barInterval);
            gameover();
        }
        switch(id) {
            case 1:
                activeScreenID = 1;
                document.getElementById("hsScreen").style.display = "block";
                document.getElementById("gsScreen").style.display = "none";
                document.getElementById("isScreen").style.display = "none";

                document.getElementById("points").style.display = "none";
                document.getElementById("playButtonContainer").style.display = "flex";
                document.getElementById("barElement-m").setAttribute("onclick","changeScreen(2)");

                document.getElementById("bullet").style.display = "none";
                stopGame();
                resizeRankings();
                break;
            case 2:
                activeScreenID = 2;
                document.getElementById("hsScreen").style.display = "none";
                document.getElementById("gsScreen").style.display = "block";
                document.getElementById("isScreen").style.display = "none";

                document.getElementById("points").style.display = "flex";
                document.getElementById("playButtonContainer").style.display = "none";
                document.getElementById("barElement-m").removeAttribute("onclick");

                document.getElementById("bullet").style.display = "flex";
                break;
            case 3:
                activeScreenID = 3;
                document.getElementById("hsScreen").style.display = "none";
                document.getElementById("gsScreen").style.display = "none";
                document.getElementById("isScreen").style.display = "block";

                document.getElementById("points").style.display = "none";
                document.getElementById("playButtonContainer").style.display = "flex";
                document.getElementById("barElement-m").setAttribute("onclick","changeScreen(2)");

                document.getElementById("bullet").style.display = "none";
                stopGame();
                resizeConfigs();
                break;
        }
    }
}

/*----- Gamescreen ----*/
function startGame() {
    if(!inceptionActive) {
        if(playername === "5n4k3") {
            createSnake();
        }
        else {
            document.getElementById("startButton").style.display = "none";
            document.getElementById("points").innerHTML = "0";
            resetGame();
            newBullet();
            gameRunning = true;

            //background music
            if(!musicMuted) {
                var promise = musicBackgroundSpeedUp.play();
                musicBackgroundSpeedUp.loop = false;
                handlePlayPromiseMusic(promise);

                musicBackgroundSpeedUp.addEventListener("ended", loopMusicBackground150);
            }
        }
    }
}
function loopMusicBackground150() {
    musicBackgroundSpeedUp.currentTime = 0;
    var promise = musicBackground150.play();
    musicBackground150.loop = true;
    handlePlayPromiseMusic(promise);
}
function stopGame() {
    //only called when switching screen

    var bullet = document.getElementById("bullet");
    document.getElementById("startButton").style.display = "flex";

    //reset game
    bullet.style.removeProperty("-webkit-animation-name");
    bullet.style.removeProperty("-webkit-animation-duration");
    bullet.removeEventListener("webkitAnimationEnd", detectCollision);
    resetGame();

    //stop background music
    if(!musicMuted && gameRunning === true) {
        musicBackgroundSpeedUp.pause();
        musicBackgroundSpeedUp.currentTime = 0;
        musicBackground150.pause();
        musicBackground150.currentTime = 0;
    }

    gameRunning = false;
}
function resetGame() {
    points = 0;
    actBullet = 0;
    gameSpeed = 2;
}
function gameover() {
    document.getElementById("startButton").style.display = "flex";
    gameRunning = false;

    lifesaverActive = false;

    //stats
    playedGamesTotal++;
    pointsTotal += points;
    pointsAverage = pointsTotal/playedGamesTotal;
    document.getElementById("playedGamesTotal").innerHTML = playedGamesTotal.toString();
    document.getElementById("pointsTotal").innerHTML = pointsTotal.toString();
    document.getElementById("pointsAverage").innerHTML = pointsAverage.toFixed(1);
    document.getElementById("nextLifesaverIn").innerHTML = nextLifesaverIn.toString();

    //game sound
    var promise = audioGameover.play();

    //pause background music
    if(!musicMuted) {
        musicBackgroundSpeedUp.pause();
        musicBackgroundSpeedUp.currentTime = 0;
        musicBackground150.pause();
        musicBackground150.currentTime = 0;
    }

    if(points > 0) {
        newScore(points);
    }
}

function useLifesaver() {
    if(!inceptionActive) {
        document.getElementById("lifesaverProgress").style.display = "none";

        clearInterval(barInterval);
        lifesaver--;
        lifesaverActive = true;

        document.getElementById("lifesaverCountdown").innerHTML = "3";
        lifesaverTimeout1s = window.setTimeout(function () {
            document.getElementById("lifesaverCountdown").innerHTML = "2";
        }, 1000);
        lifesaverTimeout2s = window.setTimeout(function () {
            document.getElementById("lifesaverCountdown").innerHTML = "1";
        }, 2000);
        lifesaverTimeout3s = window.setTimeout(function () {
            document.getElementById("lifesaverCountdown").innerHTML = "";
            progressRunning = false;
            gameRunning = true;
            newBullet();

            //resume backgroundSpeedUp music
            if(!musicMuted) {
                var promise = musicBackgroundSpeedUp.play();
            }
        }, 3000);
    }
}
function addProgress() {
    updateProgressBar();

    //if progress bar finished
    if(progress >= 100){
        document.getElementById("lifesaverProgress").style.display = "none";

        gameRunning = true;
        progressRunning = false;
        clearTimeout(barInterval);
        gameover();
    }
    progress++;
}
function updateProgressBar() {
    progressRad = (progress/100)*Math.PI*2; //formula to calculate percentage into radians
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); //clear canvas

    //background circle
    context.beginPath();
    context.arc(cWidth, cHeight, cWidth-15, 0, 2*Math.PI, false); //radius have to be a little bit smaller than canvas
    context.fillStyle = "rgba(0,0,0,0)";
    context.fill();
    context.strokeStyle = design[actualDesignID] + "44";   //progress bar background color
    context.stroke();

    canvas.style.backgroundSize = (cWidth*1.2-15) + "px";

    //overlay circle (only border)
    context.beginPath();
    context.arc(cWidth, cHeight, cWidth-15, start, progressRad+start, false);
    context.fillStyle = "#FFF"; //font color
    context.strokeStyle = design[actualDesignID]; //progress bar color
    context.stroke();
    context.lineWidth = 15; //thickness of stroke
    context.textBaseline = "middle";
    context.textAlign = "center";
    context.font = (cWidth/3) + "px Arial Black";
    context.fillText(lifesaver.toString(), cWidth, cHeight+1); //cHeight+1 because of optical illusion with heart
}

function newScore(points) {
    clearTable();

    //if new Highscore -> switch to HS-Screen
    if(rankings.length === 0 || points >= rankings[rankings.length-1][0]) {
        changeScreen(1);

        document.getElementById("firework").src = "assets/Firework.gif";
        window.setTimeout(function () {
            document.getElementById("firework").src = "";
        }, 5000);

        //game sound
        var promise = audioNewHighscore.play();
    }

    //update and sort array
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth()+1;
    if(month < 10) {
        month = "0" + month;
    }
    if(day < 10) {
        day = "0" + day;
    }

    if(playername === "") {
        rankings.push([points, "---", day + "." + month + "." + date.getFullYear()]);
    }
    else {
        rankings.push([points, playername, day + "." + month + "." + date.getFullYear()]);
    }
    rankings.sort(sortRankings);

    updateRankings();
}
function clearTable() {
    var table = document.getElementById("hsTable");

    //clear current rows of table
    for(var i = 0; i < rankings.length; i++) {
        table.deleteRow(-1);    //-1 --> delete last row
    }
}
function updateRankings() {
    var table = document.getElementById("hsTable");

    //create rows from the array
    for(var i = 0; i < rankings.length; i++) {
        if(rankings.length-i <= 3) {
            var position = rankings.length-i;
            document.getElementById("rank" + (position) + "Name").innerHTML = rankings[i][1];
        }

        //create row and insert it below the header
        var newRow = document.createElement("tr");
        table.insertBefore(newRow, table.childNodes[0]);

        //center text
        newRow.setAttribute("align","center");

        //create columns
        var colPoints = document.createElement("td");
        var colName = document.createElement("td");
        var colDate = document.createElement("td");

        //create the values
        var colPointsText = document.createTextNode(rankings[i][0]);
        var colNameText = document.createTextNode(rankings[i][1]);
        var colDateText = document.createTextNode(rankings[i][2]);

        //set width of columns
        colPoints.style.minWidth = "64px";
        colName.style.width = "100%";
        colDate.style.minWidth = "83px";

        //add the values
        colPoints.appendChild(colPointsText);
        colName.appendChild(colNameText);
        colDate.appendChild(colDateText);

        //fill the row with the columns
        newRow.appendChild(colPoints);
        newRow.appendChild(colName);
        newRow.appendChild(colDate);
    }
}
function sortRankings(a, b) {
    if(a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}

function resize() {
    resizeBullet();
    resizeDisc();
    resizeRankings();
    resizeConfigs();
    resizeSnake();
    recalculateBulletAnimation();
}
function resizeBullet(){
    var bullet = document.getElementById("bullet");
    var h = document.body.offsetHeight;
    var newSize = h/15;

    bullet.style.width = newSize + "px";
    bullet.style.height = newSize + "px";
}
function resizeDisc(){
    //resize and center the disc
    var disc = document.getElementById("disc");
    var mainFieldH = document.getElementById("mainField").offsetHeight;
    var w = document.body.offsetWidth;
    var mainfieldW = document.getElementById("mainField").offsetWidth;

    //if disc will get bigger than width of mainField -> disc is not going to get bigger than width of mainField
    var newDiscSize = mainFieldH/3;
    if(newDiscSize > mainfieldW) {
        newDiscSize = mainfieldW;
    }

    disc.style.width = newDiscSize + "px";
    disc.style.height = newDiscSize + "px";
    document.getElementById("discHitBox").style.width = mainfieldW + "px";

    //resize progress bar too
    canvas.height = newDiscSize/2;
    canvas.width = newDiscSize/2;
    cWidth = context.canvas.width/2;
    cHeight = context.canvas.height/2;
    updateProgressBar();

    //if FireFox -> width of mainField must be used to center disc
    if(typeof InstallTrigger !== 'undefined') {
        w = mainfieldW;
    }

    //center disc
    disc.style.left = (w/2)-(newDiscSize/2) + "px";

    //center HTL-Logo on disc
    var discLogo = document.getElementById("disclogo");
    var newDiscLogoSize = newDiscSize/3;

    discLogo.style.width = newDiscLogoSize + "px";
    discLogo.style.height = newDiscLogoSize + "px";
    discLogo.style.left = (w/2)-(newDiscLogoSize/2) + "px";
    discLogo.style.top = ((mainFieldH-mainFieldH/100*2)-(newDiscSize/2+newDiscLogoSize/2)) + "px";
}
function resizeRankings() {
    var actionBarHeight = document.getElementById("actionBar").offsetHeight;
    var podiumContainerHeight = document.getElementById("podium").offsetHeight;
    var hsTableHeaderContainerHeight = document.getElementById("hsTableHeaderContainer").offsetHeight;
    var maxHeight = window.innerHeight - actionBarHeight - podiumContainerHeight - hsTableHeaderContainerHeight;
    document.getElementById("hsTableContainer").style.maxHeight = maxHeight + "px";
}
function resizeConfigs() {
    var winowHeight = window.innerHeight;
    var actionBarHeight = document.getElementById("actionBar").offsetHeight;
    var footerHeight = document.getElementById("footer").offsetHeight;
    var maxHeightLangBar = winowHeight - actionBarHeight - footerHeight - winowHeight/100*4; //4% of height, because footer floats 2% over bottom
    document.getElementById("configContainer").style.maxHeight = maxHeightLangBar + "px";
}
function resizeSnake() {
    if(snakeActive) {
        snakeWidth = 100/window.innerWidth*document.getElementById("snakeHead").offsetWidth;
        snakeHeight = 100/window.innerHeight*document.getElementById("snakeHead").offsetHeight;
    }
}
function recalculateBulletAnimation() {
    //calculate new ending-position off bullet-animation
    if(gameRunning) {
        //create new animation
        var discTop = document.getElementById("disc").offsetTop;    //y-position of disc
        var actionBarHeight = document.getElementById("actionBar").offsetHeight;
        var bulletHeight = document.getElementById("bullet").offsetHeight;

        //change animation                                  //bullet will sink into disc (as long as it is visible)
        document.documentElement.style.setProperty('--bulletAni-end', (discTop-actionBarHeight+bulletHeight) + "px");
    }
}

/*----- Game-Mechanic -----*/
function newBullet() {
    var bullet = document.getElementById("bullet");

    //new random bullet
    actBullet = Math.floor(Math.random()*5);
    document.getElementById("bullet").style.backgroundColor = colorArray[actBullet];
    document.getElementById("bullet").innerHTML = bulletArray[actBullet];

    //remove old animation
    bullet.style.removeProperty("-webkit-animation-name");
    bullet.style.removeProperty("-webkit-animation-duration");
    bullet.removeEventListener("webkitAnimationEnd", detectCollision);

    //create new animation
    var discTop = document.getElementById("disc").offsetTop;    //y-position of disc
    var actionBarHeight = document.getElementById("actionBar").offsetHeight;

    //change animation                                  //bullet will sink into disc (as long as it is visible)
    document.documentElement.style.setProperty('--bulletAni-end', (discTop-actionBarHeight) + "px");

    //append animation to bullet
    bullet.style.webkitAnimationName = "bullet_ani";
    bullet.style.webkitAnimationDuration = gameSpeed + "s";
    bullet.addEventListener("webkitAnimationEnd", detectCollision);

    //set link on bullet (easter egg)
    bullet.setAttribute("onclick", bulletLinkArray[actBullet]);
}
function detectCollision() {
    //(rotation-36)/72%5 -> calculates the actual rotational position of the disc
    if((rotation-36)/72%5 === actBullet) {
        newBullet();
        points++;
        document.getElementById("points").innerHTML = points.toString();
        gameSpeed /= 1.02;

        nextLifesaverIn--;
        if(nextLifesaverIn === 0) {
            nextLifesaverIn = 200;
            lifesaver++;
        }

        //game sound
        var promise = audioPoint[Math.floor(Math.random()*3)].play();
    }
    //A lifesaver can be used, if you have one or more and it isn't in use already.
    else if(lifesaver > 0 && lifesaverActive === false) {
        document.getElementById("lifesaverProgress").style.display = "initial";

        gameRunning = false; //needs to be set false because of the recalculateBulletAnimation function
        progress = 0;
        updateProgressBar();
        progressRunning = true;
        barInterval = setInterval(addProgress, 50);

        //pause backgroundSpeedUp music
        if(!musicMuted && !inceptionActive) {
            musicBackgroundSpeedUp.pause();
        }
    }
    else {
        gameover();
    }
}
function rotateDisc() {
    if(inceptionActive === false && snakeActive === false) {
        var disc = document.getElementById("disc");

        rotation += 72;
        disc.style.transform = "rotate(" + rotation + "deg)";

        //stop last sound
        audioDisc[actualDiscSound].pause();
        audioDisc[actualDiscSound].currentTime = 0;

        //play new sound
        actualDiscSound = Math.floor(Math.random()*3);
        var promise = audioDisc[actualDiscSound].play();

        //Inception Easter Egg
        inception()
    }
}

window.setInterval(resetRotationsPerSec, 1000);
function resetRotationsPerSec() {
    rotationsPerSec = 0;
}
function inception() {
    var disc = document.getElementById("disc");

    rotationsPerSec++;
    if(rotationsPerSec > 10) {
        inceptionActive = true;
        disc.style.webkitAnimationName = "inception";
        disc.style.webkitAnimationDuration = "11s";
        disc.addEventListener("webkitAnimationEnd", inceptionEnd);

        //mute background music
        musicBackground150.muted = true;
        musicSnakeBackground.muted = true;

        var promise = audioInception.play();
    }
}
function inceptionEnd() {
    var disc = document.getElementById("disc");
    disc.style.webkitAnimationName = "none";
    disc.style.webkitAnimationDuration = "";
    disc.removeEventListener("webkitAnimationEnd", inceptionEnd);

    rotationsPerSec = 0;
    inceptionActive = false;
    musicBackground150.muted = false;
    musicSnakeBackground.muted = false;
}

/*----- Infoscreen ----*/
function updatePlayername() {
    playername = document.getElementById("playername").value;
}
function changeDesign(designID) {
    actualDesignID = designID;

    //CSS-Variable
    document.documentElement.style.setProperty('--design-color', design[designID]);
}
function muteSounds() {
    if(!audioMuted) {
        audioMuted = true;
        document.getElementById("muteAudioButton").style.backgroundImage = "url('assets/audio-off.svg')";

        audioGameover.muted = true;
        audioNewHighscore.muted = true;
        audioDisc[0].muted = true;
        audioDisc[1].muted = true;
        audioDisc[2].muted = true;
        audioPoint[0].muted = true;
        audioPoint[1].muted = true;
        audioPoint[2].muted = true;
        audioInception.muted = true;
        audioSnakeGameOver = true;
    }
    else {
        audioMuted = false;
        document.getElementById("muteAudioButton").style.backgroundImage = "url('assets/audio-on.svg')";

        audioGameover.muted = false;
        audioNewHighscore.muted = false;
        audioDisc[0].muted = false;
        audioDisc[1].muted = false;
        audioDisc[2].muted = false;
        audioPoint[0].muted = false;
        audioPoint[1].muted = false;
        audioPoint[2].muted = false;
        audioInception.muted = false;
        audioSnakeGameOver = false;
    }
}
function muteMusic() {
    if(!musicMuted) {
        musicMuted = true;
        document.getElementById("muteMusicButton").style.backgroundImage = "url('assets/music-off.svg')";

        musicBackgroundSpeedUp.muted = true;
        musicBackground150.muted = true;
        musicSnakeBackground.muted = true;

        musicBackgroundSpeedUp.pause();
        musicBackgroundSpeedUp.currentTime = 0;
        musicBackground150.pause();
        musicBackground150.currentTime = 0;
        musicSnakeBackground.pause();
        musicSnakeBackground.currentTime = 0;
    }
    else {
        musicMuted = false;
        document.getElementById("muteMusicButton").style.backgroundImage = "url('assets/music-on.svg')";

        musicBackgroundSpeedUp.muted = false;
        musicBackground150.muted = false;
        musicSnakeBackground.muted = false;

        var promise;
        if(snakeActive) {
            promise = musicSnakeBackground.play();
            musicSnakeBackground.loop = true;
            handlePlayPromiseMusic(promise);
        }
    }
}

/*----- Controls -----*/
document.addEventListener("keydown", function(e) {
    if(activeScreenID === 2) {
        if(e.keyCode === 32) {  //space bar
            e.preventDefault();
            rotateDisc();
        }
    }
});
document.getElementById("discHitBox").addEventListener("mousedown", function () {
    rotateDisc();
});
document.getElementById("discHitBox").addEventListener("touchstart", function (e) {
    e.preventDefault();
    rotateDisc();
});

/*----- Storage -----*/
function loadStorage() {
    //load storage if available
    if(localStorage.getItem("scoreSaved") === "true") {
        if(localStorage.getItem("playername") != null) {
            playername = localStorage.getItem("playername");
            document.getElementById("playername").value = playername;
        }

        if(localStorage.getItem("audioMuted") != null) {
            audioMuted = localStorage.getItem("audioMuted") === "true";
            if(audioMuted) {
                document.getElementById("muteAudioButton").style.backgroundImage = "url('assets/audio-off.svg')";
                audioGameover.muted = true;
                audioNewHighscore.muted = true;
                audioDisc[0].muted = true;
                audioDisc[1].muted = true;
                audioDisc[2].muted = true;
                audioPoint[0].muted = true;
                audioPoint[1].muted = true;
                audioPoint[2].muted = true;
                audioInception.muted = true;
                audioSnakeGameOver = true;
            }
        }

        if(localStorage.getItem("musicMuted") != null) {
            musicMuted = localStorage.getItem("musicMuted") === "true";
            if(musicMuted) {
                document.getElementById("muteMusicButton").style.backgroundImage = "url('assets/music-off.svg')";
                musicBackgroundSpeedUp.muted = true;
                musicBackground150.muted = true;
                musicSnakeBackground.muted = true;
            }
        }

        if(localStorage.getItem("lang") != null) {
            lang = localStorage.getItem("lang");
            changeLang(lang);
        }

        if(localStorage.getItem("rankings") != null) {
            rankings = JSON.parse(localStorage.getItem("rankings"));
            if(rankings.length !== 0) {
                updateRankings();
            }
        }

        if(localStorage.getItem("lifesaver") != null) {
            lifesaver = parseInt(localStorage.getItem("lifesaver"));
        }

        if(localStorage.getItem("nextLifesaverIn") != null) {
            nextLifesaverIn = parseInt(localStorage.getItem("nextLifesaverIn"));
            document.getElementById("nextLifesaverIn").innerHTML = nextLifesaverIn.toString();
        }

        if(localStorage.getItem("playedGamesTotal") != null) {
            playedGamesTotal = parseInt(localStorage.getItem("playedGamesTotal"));
            document.getElementById("playedGamesTotal").innerHTML = playedGamesTotal.toString();
        }

        if(localStorage.getItem("pointsTotal") != null) {
            pointsTotal = parseInt(localStorage.getItem("pointsTotal"));
            document.getElementById("pointsTotal").innerHTML = pointsTotal.toString();
        }

        if(localStorage.getItem("pointsAverage") != null) {
            pointsAverage = parseFloat(localStorage.getItem("pointsAverage"));
            document.getElementById("pointsAverage").innerHTML = pointsAverage.toString();
        }

        if(localStorage.getItem("actualDesignID") != null) {
            actualDesignID = parseInt(localStorage.getItem("actualDesignID"));
            changeDesign(actualDesignID);
        }
    }
}
function setStorage() {
    scoreSaved = true;

    localStorage.setItem("scoreSaved", scoreSaved.toString());
    localStorage.setItem("playername", playername);
    localStorage.setItem("audioMuted", audioMuted.toString());
    localStorage.setItem("musicMuted", musicMuted.toString());
    localStorage.setItem("lang", lang);
    localStorage.setItem("rankings", JSON.stringify(rankings));
    localStorage.setItem("lifesaver", lifesaver.toString());
    localStorage.setItem("nextLifesaverIn", nextLifesaverIn.toString());
    localStorage.setItem("playedGamesTotal", playedGamesTotal.toString());
    localStorage.setItem("pointsTotal", pointsTotal.toString());
    localStorage.setItem("pointsAverage", pointsAverage.toFixed(1));
    localStorage.setItem("actualDesignID", actualDesignID.toString());
}
function delStorage() {
    if(confirm(resetScoreAck) === true) {
        scoreResetted = true;
        // window.location.reload(true);
        localStorage.clear();
        resetAll();
    }
}
function resetAll() {
    //Snake
    if(snakeActive) {
        window.clearInterval(snakeMoveInterval);
        window.clearTimeout(snakeTerminateTimeout);
        for(var i = 0; i < document.getElementsByClassName("snake").length; i++) {
            document.getElementsByClassName("snake")[i].style.display = "none";
        }
    }
    snakeActive = false;
    snakeGameOver = false;

    //Game
    actBullet = 0;
    rotation = 36;
    document.getElementById("disc").style.transform = "rotate(36deg)";
    gameSpeed = 2;
    points = 0;
    document.getElementById("points").innerHTML = "0";
    pointsTotal = 0;
    pointsAverage = 0;
    playedGamesTotal = 0;
    gameRunning = false;

    //Lifesaver
    lifesaver = 0;
    nextLifesaverIn = 200;
    lifesaverActive = false;

    //clear stats table
    document.getElementById("playedGamesTotal").innerHTML = playedGamesTotal.toString();
    document.getElementById("pointsTotal").innerHTML = pointsTotal.toString();
    document.getElementById("pointsAverage").innerHTML = pointsAverage.toFixed(1);
    document.getElementById("nextLifesaverIn").innerHTML = nextLifesaverIn.toString();

    //Lifesaver Progressbar
    canvas = document.getElementById("lifesaverProgress");
    context = canvas.getContext("2d");
    progress = 0;
    start = 4.72;
    cWidth = context.canvas.width/2;
    cHeight = context.canvas.height/2;
    progressRunning = false;

    //clear highscore table
    document.getElementById("rank1Name").innerHTML = "";
    document.getElementById("rank2Name").innerHTML = "";
    document.getElementById("rank3Name").innerHTML = "";
    clearTable();

    //Ranking
    rankings = [];

    //Settings
    lang = "at";
    changeLang(lang);
    playername = "";
    document.getElementById("playername").value = "";
    actualDesignID = 0;
    changeDesign(0);
    if(audioMuted) {
        muteSounds();
    }
    if(musicMuted) {
        muteMusic();
    }

    //Variables for language
    resetScoreAck = "Sind Sie sicher, dass Sie Ihren Spielstand zurücksetzen wollen?";

    //LocalStorage
    scoreSaved = false;

    //Easter Eggs
    rotationsPerSec = 0;
    inceptionActive = false;

    changeScreen(2);
}

//save with Strg+s
var isCtrl = false;
document.onkeyup = function(e) {
    if(e.keyCode === 17) isCtrl=false;
};
document.onkeydown = function(e) {
    if(e.keyCode === 17) isCtrl=true;
    if(e.keyCode === 83 && isCtrl === true) {
        setStorage();
        return false;
    }
};

//save, when closing tab
window.onbeforeunload = window.onunload = function() {
    if(!scoreResetted) {
        setStorage();
    }
};

/*- Snake-Logic -*/
function createSnake() {
    if(snakeActive === false && activeScreenID === 2 && gameRunning === false && progressRunning === false) {
        //show snake body parts
        for(var i = 0; i < document.getElementsByClassName("snake").length; i++) {
            document.getElementsByClassName("snake")[i].style.display = "flex";
        }

        snakeTerminateTimeout = window.setTimeout(terminateSnake, 30000);
        snakeMoveInterval = window.setInterval(moveSnake, 150);
        snakeActive = true;
        snakeGameOver = false;
        snakeMoveDirection = 1;

        var discTop = document.getElementById("disc").offsetTop;
        var discHeight = document.getElementById("disc").offsetHeight;
        var discLeft;
        if(typeof InstallTrigger !== 'undefined') {
            discLeft = document.getElementById("disc").offsetLeft+document.getElementById("mainField").offsetLeft;
        }
        else {
            discLeft = document.getElementById("disc").offsetLeft;
        }
        var discWidth = document.getElementById("disc").offsetWidth;

        //width and height in percentage
        snakeWidth = 100/window.innerWidth*document.getElementById("snakeHead").offsetWidth;
        snakeHeight = 100/window.innerHeight*document.getElementById("snakeHead").offsetHeight;

        //spawn snake in the middle of the disc (percentage)
        snakeTop = 100/window.innerHeight*(discTop+discHeight/2);
        snakeLeft = 100/window.innerWidth*(discLeft+discWidth/2);

        //every snake part in the middle of the disc at first
        snakeBody1Top = snakeTop;
        snakeBody1Left = snakeLeft;
        snakeBody2Top = snakeTop;
        snakeBody2Left = snakeLeft;
        snakeBody3Top = snakeTop;
        snakeBody3Left = snakeLeft;
        snakeBody4Top = snakeTop;
        snakeBody4Left = snakeLeft;

        updateSnakePosition();

        //stop main background music
        musicBackground150.pause();
        musicBackground150.currentTime = 0;

        //start snake background music
        if(!musicMuted) {
            var promise = musicSnakeBackground.play();
            musicSnakeBackground.loop = true;
            handlePlayPromiseMusic(promise);
        }
    }
}
function terminateSnake() {
    window.clearInterval(snakeMoveInterval);
    window.clearTimeout(snakeTerminateTimeout);
    snakeGameOver = true;

    //snake blinks then hide body parts
    window.setTimeout(function () {
        for(var i = 0; i < document.getElementsByClassName("snake").length; i++) {
            document.getElementsByClassName("snake")[i].style.display = "none";
        }
    }, 200);
    window.setTimeout(function () {
        for(var i = 0; i < document.getElementsByClassName("snake").length; i++) {
            document.getElementsByClassName("snake")[i].style.display = "flex";
        }
    }, 400);
    window.setTimeout(function () {
        for(var i = 0; i < document.getElementsByClassName("snake").length; i++) {
            document.getElementsByClassName("snake")[i].style.display = "none";
        }
    }, 600);
    window.setTimeout(function () {
        for(var i = 0; i < document.getElementsByClassName("snake").length; i++) {
            document.getElementsByClassName("snake")[i].style.display = "flex";
        }
    }, 800);
    window.setTimeout(function () {
        for(var i = 0; i < document.getElementsByClassName("snake").length; i++) {
            document.getElementsByClassName("snake")[i].style.display = "none";
        }

        snakeActive = false;
    }, 1000);

    //stop snake background music
    musicSnakeBackground.pause();
    musicSnakeBackground.currentTime = 0;

    //play game-over sound
    var promise = audioSnakeGameOver.play();
}
function moveSnake() {
    //moves the body parts (makes the snake movement effect)
    snakeBody4Top = snakeBody3Top;
    snakeBody4Left = snakeBody3Left;
    snakeBody3Top = snakeBody2Top;
    snakeBody3Left = snakeBody2Left;
    snakeBody2Top = snakeBody1Top;
    snakeBody2Left = snakeBody1Left;
    snakeBody1Top = snakeTop;
    snakeBody1Left = snakeLeft;

    //move head
    switch(snakeMoveDirection) {
        case 1: //up
            snakeTop -= snakeHeight;
            break;
        case 2: //right
            snakeLeft += snakeWidth;
            break;
        case 3: //down
            snakeTop += snakeHeight;
            break;
        case 4: //left
            snakeLeft -= snakeWidth;
            break;
    }

    updateSnakePosition();

    if(snakeLeft < 0 || snakeLeft > 100 || snakeTop < 0 || snakeTop > 100) {
        terminateSnake();
    }
}
function updateSnakePosition() {
    var snake = document.getElementById("snakeHead");
    var snakeBody1 = document.getElementById("snakeBody1");
    var snakeBody2 = document.getElementById("snakeBody2");
    var snakeBody3 = document.getElementById("snakeBody3");
    var snakeBody4 = document.getElementById("snakeBody4");

    snake.style.top = snakeTop + "%";
    snake.style.left = snakeLeft + "%";
    snakeBody1.style.top = snakeBody1Top + "%";
    snakeBody1.style.left = snakeBody1Left + "%";
    snakeBody2.style.top = snakeBody2Top + "%";
    snakeBody2.style.left = snakeBody2Left + "%";
    snakeBody3.style.top = snakeBody3Top + "%";
    snakeBody3.style.left = snakeBody3Left + "%";
    snakeBody4.style.top = snakeBody4Top + "%";
    snakeBody4.style.left = snakeBody4Left + "%";
}

/*- Snake-Controls -*/
document.addEventListener("keydown", function(e) {
    if(snakeActive === true && snakeGameOver === false) {
        if(snakeMoveDirection !== 2 && snakeMoveDirection !== 4) {
            if(e.keyCode === 39 || e.keyCode === 68) { //right
                snakeMoveDirection = 2;

                clearInterval(snakeMoveInterval);
                moveSnake();
                snakeMoveInterval = window.setInterval(moveSnake, 150);
            }
        }
        if(snakeMoveDirection !== 1 && snakeMoveDirection !== 3) {
            if(e.keyCode === 40 || e.keyCode === 83) { //down
                snakeMoveDirection = 3;

                clearInterval(snakeMoveInterval);
                moveSnake();
                snakeMoveInterval = window.setInterval(moveSnake, 150);
            }
        }
        if(snakeMoveDirection !== 2 && snakeMoveDirection !== 4) {
            if(e.keyCode === 37 || e.keyCode === 65) { //left
                snakeMoveDirection = 4;

                clearInterval(snakeMoveInterval);
                moveSnake();
                snakeMoveInterval = window.setInterval(moveSnake, 150);
            }
        }
        if(snakeMoveDirection !== 1 && snakeMoveDirection !== 3) {
            if(e.keyCode === 38 || e.keyCode === 87) { //up
                snakeMoveDirection = 1;

                clearInterval(snakeMoveInterval);
                moveSnake();
                snakeMoveInterval = window.setInterval(moveSnake, 150);
            }
        }
    }
});
document.addEventListener("touchstart", function(e) {
    if(snakeActive === true && snakeGameOver === false) {
        //if snake moves vertical
        if(snakeMoveDirection === 1 || snakeMoveDirection === 3) {
            //if tapped left of the snake
            if(e.targetTouches[0].clientX < document.getElementById("snakeHead").offsetLeft) {
                snakeMoveDirection = 4; //left

                clearInterval(snakeMoveInterval);
                moveSnake();
                snakeMoveInterval = window.setInterval(moveSnake, 150);
            }
            else {
                snakeMoveDirection = 2; //right

                clearInterval(snakeMoveInterval);
                moveSnake();
                snakeMoveInterval = window.setInterval(moveSnake, 150);
            }
        }
        //if snake moves horizontal
        else {
            //if tapped above the snake
            if(e.targetTouches[0].clientY < document.getElementById("snakeHead").offsetTop) {
                snakeMoveDirection = 1; //up

                clearInterval(snakeMoveInterval);
                moveSnake();
                snakeMoveInterval = window.setInterval(moveSnake, 150);
            }
            else {
                snakeMoveDirection = 3; //down

                clearInterval(snakeMoveInterval);
                moveSnake();
                snakeMoveInterval = window.setInterval(moveSnake, 150);
            }
        }
    }
});

/*----- Rest -----*/
function detectBrowser() {
    //Internet Explorer (<= v11)
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    var trident = ua.indexOf('Trident/');
    var edge = ua.indexOf('Edge/');

    if(msie > 0 || trident > 0 || edge > 0) {
        document.body.innerHTML = "";
        alert("Internet Explorer and Edge are not supported!\n(Use a modern browser like Firefox or Chrome)");
    }
}
function handlePlayPromiseAudio(playPromise) {
    //Catch Chrome's Autoplay Policy
    if(playPromise !== undefined) {
        playPromise.then(function() {
            //automatic playback started
        }).catch(function() {
            document.getElementById("muteAudioButton").style.backgroundImage = "url('assets/audio-off.svg')";
            audioMuted = true;
        });
    }
}
function handlePlayPromiseMusic(playPromise) {
    //Catch Chrome's Autoplay Policy
    if(playPromise !== undefined) {
        playPromise.then(function() {
            //automatic playback started
        }).catch(function() {
            document.getElementById("muteMusicButton").style.backgroundImage = "url('assets/music-off.svg')";
            musicMuted = true;
        });
    }
}
