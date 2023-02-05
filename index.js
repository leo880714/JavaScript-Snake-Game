const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let raf;
let direction = "";
let prev = "";
let start = false;
let score = 0;
let level = 1;
let cntdown = 5;
let timeinterval = 50;
let startTime = new Date().getTime();
let endTime = 0;
let avgTime = 0;
let cursorPos = {
    x: 0,
    y: 0
}

// ------------ Objects --------------
const headLight = {
    x: 100,
    y: 100,
    vx: 5,
    vy: 2,
    radius: 25,
    color: "rgba(255,255,255, 0.3)",
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    }
};

let apple = {
    x: 770,
    y: 250,
    color: "red",
    radius: 5,
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    },

    regenerate() {
        this.x = Math.floor(Math.random() * 1400);
        this.y = Math.floor(Math.random() * 500);
    },

    print() {
        console.log(this.x + " " + this.y)
    }
};

let snake = {
    length: 5,
    body: [[100, 100], [100, 110], [100, 120], [100, 130], [100, 140]],
    radius: 5,
    color: "white",
    draw() {
        for (let [x, y] of this.body) {
            ctx.beginPath();
            ctx.arc(x, y, this.radius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    },

    add(appleX, appleY) {
        this.length += 1
        this.body.unshift([appleX, appleY])
    },

    move(direction) {
        let newX = this.body[0][0];
        let newY = this.body[0][1];
        if(direction == "right") {
            newX += 2 * this.radius;
        }
        else if(direction == "up") {
            newY -= 2 * this.radius;
        }
        else if(direction == "left") {
            newX -= 2 * this.radius;
        }
        else if(direction == "down") {
            newY += 2 * this.radius;
        }

        this.body.unshift([newX, newY]);
        this.body.pop();
    },

    hitself() {
        let snakeX = this.body[0][0]
        let snakeY = this.body[0][1]
        for (let i = 2; i < this.body.length; i++) 
            if(Math.abs(snakeX - this.body[i][0]) <= 0 && Math.abs(snakeY - this.body[i][1]) <= 0 )
                return true

        return false
    },

    headToRed() {
        let snakeX = this.body[0][0]
        let snakeY = this.body[0][1]
        ctx.beginPath();
        ctx.arc(snakeX, snakeY, this.radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = "red";
        ctx.fill();
    },

    print() {
        for (let [x, y] of this.body) {
            console.log("<" + x +"," + y + ">")
        }

        console.log()
    },
}


// --------------- Helper Functions --------------
document.addEventListener('mousemove', getMousePos);
function getMousePos(e) {
    var rect = canvas.getBoundingClientRect();
    cursorPos.x = e.clientX - rect.left;
    cursorPos.y = e.clientY - rect.top;
}

canvas.addEventListener('mousemove', (e) => {
    if(!start) {
        start = true;
        raf = window.requestAnimationFrame(draw);
    }
});

function findDirection(snakeX, snakeY) {
    let xDiff = cursorPos.x - snakeX;
    let yDiff = cursorPos.y - snakeY;
    if(Math.abs(xDiff) > Math.abs(yDiff)) {
        if(xDiff > 0 && prev != "left")
            direction = "right"
        else if(xDiff <= 0 && prev != "right") 
            direction = "left"
    }
    else {
        if(yDiff > 0 && prev != "up")   
            direction = "down"
        else if(yDiff <= 0 && prev != "down") 
            direction = "up"
    }
}

function showStatistics(hitOrWall) {
    document.getElementById("gameover").classList.remove("hidden");
    document.getElementById("statistics").classList.remove("hidden");
    if(hitOrWall)
        document.getElementById("gameover").innerText = "Your head hit yourself! Game is Over. Refresh to play again.";
    else
        document.getElementById("gameover").innerText = "Your head hit the wall! Game is Over. Refresh to play again.";
    document.getElementById("currScore").innerText = "Score: " + score;
    document.getElementById("currLevel").innerText = "Level: " + level;
    endTime = new Date().getTime();
    let totalTime = (endTime - startTime) / 1000;
    avgTime =  (totalTime / score).toFixed(2)
    document.getElementById("avgTime").innerText = "Avg time to eat the apple: " + avgTime;
}

function showRankings() {
    let bestScore = localStorage.getItem("bestScore") == null ? "N / A" : localStorage.getItem("bestScore");
    let bestLevel = localStorage.getItem("bestLevel") == null ? "N / A" : localStorage.getItem("bestLevel");
    let bestTime = localStorage.getItem("bestTime") == null ? "N / A" : localStorage.getItem("bestTime");

    document.getElementById("bestScore").innerText = bestScore;
    document.getElementById("bestLevel").innerText = bestLevel;
    document.getElementById("bestTime").innerText = bestTime;
}

function updateRanking() {
    if(localStorage.getItem("bestScore") == null || score > parseInt(localStorage.getItem("bestScore")))
        localStorage.setItem("bestScore", score);
    if(localStorage.getItem("bestLevel") == null || level > parseInt(localStorage.getItem("bestLevel")))
        localStorage.setItem("bestLevel", level);
    if(localStorage.getItem("bestTime") == null || avgTime < parseInt(localStorage.getItem("bestTime")))
        localStorage.setItem("bestTime", avgTime);
}

let intervalID = setInterval(() => {
    raf = window.requestAnimationFrame(draw);
}, timeinterval)

function draw() {
    if(start) {
        ctx.clearRect(0,0, canvas.width, canvas.height);
        let hittail = false

        // move the snake on the canvas
        let snakeX = snake.body[0][0];
        let snakeY = snake.body[0][1];
        findDirection(snakeX, snakeY)
        snake.move(direction)
        prev = direction;
        let snakeNewX = snake.body[0][0];
        let snakeNewY = snake.body[0][1];

        // eat the apple on the canvas
        if(Math.abs(snakeNewX - apple.x) < 7 && Math.abs(snakeNewY - apple.y) < 7){
            apple.regenerate();
            snake.add(snakeNewX, snakeNewY);

            score += 1;
            level = Math.floor(score / 5) + 1;
            if(score % 5 == 0) {
                clearInterval(intervalID)
                timeinterval -= 5;
                intervalID = setInterval(() => {
                    raf = window.requestAnimationFrame(draw);
                }, timeinterval)
            }
        }
        else 
            hittail = snake.hitself()

        // update the snake on the canvas
        apple.draw();
        snake.draw();

        if(hittail) {
            // Check whether hit itself
            snake.headToRed();
            showStatistics(true);
            updateRanking();
            showRankings();
            clearInterval(intervalID);
            
        }
        else if(snake.body[0][0] > canvas.width || snake.body[0][0] < 0 || snake.body[0][1] > canvas.height || snake.body[0][1] < 0 ) {
            // Check whether hit the wall
            snake.headToRed();
            showStatistics(false);
            updateRanking();
            showRankings();
            clearInterval(intervalID);
        }

        // Updaate the score
        document.getElementById("score").innerText = score;
        document.getElementById("level").innerText = level;
    }
}

headLight.draw();
snake.draw();
apple.draw();
showRankings();

// -------------- Hidden Feature --------------
/*
// Use keyboard to play
document.addEventListener("keydown", handleKeyDownEvent);
function handleKeyDownEvent(e) {
    if(e.key == "w") 
        direction = "up"
    else if(e.key == "s")
        direction = "down"
    else if(e.key == "a")
        direction = "left"
    else if(e.key == "d")
        direction = "right"
    else
        direction = ""

    if(!start) {
        start = true;
        raf = window.requestAnimationFrame(draw);
    }
}
*/