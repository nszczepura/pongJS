var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) { window.setTimeout(callback, 1000/60) };

var canvas = document.createElement('canvas');
var canvas_width = 800;
var canvas_height = 600;
canvas.width = canvas_width;
canvas.height = canvas_height;
var context = canvas.getContext('2d');
var player = new Player();
var computer = new Computer();
var ball = new Ball(400, 300);
var bisector = new Bisector(5, 80);
var player_score = 0;
var computer_score = 0;
var player_scoreboard = new Score(player_score, 313, 100);
var computer_scoreboard = new Score(computer_score, 450, 100);
var keysDown = {};

window.onload = function() {
    document.body.appendChild(canvas);
    animate(step);
};

window.addEventListener("keydown", function(event) {
    keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event) {
    delete keysDown[event.keyCode];
});

var step = function() {
    update();
    render();
    animate(step);
};

var update = function() {
    player.update();
    computer.update(ball);
    ball.update(player.paddle, computer.paddle);
};

var render = function() {
    context.fillStyle = "#00020f";
    context.fillRect(0, 0, canvas_width, canvas_height);
    player.render();
    computer.render();
    ball.render();
    bisector.render();
    player_scoreboard.render();
    computer_scoreboard.render();
};


function Paddle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.x_speed = 0;
    this.y_speed = 0;
}

Paddle.prototype.render = function() {
    context.fillStyle = "#f5f5dc";
    context.fillRect(this.x, this.y, this.width, this.height);
};

Paddle.prototype.move = function(x, y) {
    this.x += x;
    this.y += y;
    this.x_speed = x;
    this.y_speed = y;
    if(this.y < 0) {
        this.y = 0;
        this.y_speed = 0;
    } else if (this.y + this.height > canvas_height) {
        this.y = canvas_height - this.height;
        this.y_speed = 0;
    }
}

Paddle.prototype.reset = function() {
    this.y = 262.5;
}

function Player() {
    this.paddle = new Paddle(50, 262.5, 10, 75);
}

function Computer() {
    this.paddle = new Paddle(740, 262.5, 10, 75);
}

function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.x_speed = 10;
    this.y_speed = 0;
    this.radius = 5;
}

function Bisector(width, height) {
    this.x = (canvas_width / 2) - width;
    this.y = 0;
    this.width = width;
    this.height = height;
}

Bisector.prototype.render = function() {
    context.fillStyle = "#c5c6ca";
    for (i = -40; i < 660; i += 120) {
        context.fillRect(this.x, i, this.width, this.height);
    }
}

function Score(score, x, y) {
    this.score = score;
    this.x = x;
    this.y = y;
}

Score.prototype.render = function() {
    context.font = "30px Impact";
    if(this.score < 10) { 
        context.fillText("0" + this.score.toString(), this.x, this.y)
    } else if(this.score > 99) { 
        context.fillText("99", this.x, this.y);
    } else {
        context.fillText(this.score.toString(), this.x, this.y);
    }
}

Ball.prototype.render = function() {
    context.beginPath();
    context.fillStyle = "#f5f5dc";
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
};

Ball.prototype.update = function(paddle1, paddle2) {
    this.x += this.x_speed;
    this.y += this.y_speed;
    var top_x = this.x - 5;
    var top_y = this.y - 5;
    var bottom_x = this.x + 5;
    var bottom_y = this.y + 5;

    if(top_y < 0) {
        this.y = 5;
        this.y_speed = -this.y_speed;
    } else if(bottom_y > 600) {
        this.y = 595;
        this.y_speed = -this.y_speed;
    }

    if(bottom_x < 0 || top_x > 800) {
        if(this.x < 0) { computer_scoreboard.score++; }
        else { player_scoreboard.score++; }
        this.x_speed = 10;
        this.y_speed = 0;
        this.x = 400;
        this.y = 300;
        paddle1.reset();
        paddle2.reset();
    }

    if(bottom_x >= paddle2.x &&
        bottom_y > paddle2.y &&
        top_y < paddle2.y + paddle2.height) {
        if(this.y > paddle2.y + 50) {
            this.y_speed = 4;
        } else if(this.y < paddle2.y + 25) {
            this.y_speed = -4;
        }
        else { this.y_speed = 0; }
        this.x_speed = -this.x_speed;
    }

    if(top_x <= paddle1.x + paddle1.width &&
        bottom_y > paddle1.y &&
        top_y < paddle1.y + paddle1.height) {
        if(this.y > paddle1.y + 50) {
            this.y_speed = 4;
        } else if(this.y < paddle1.y + 25) {
            this.y_speed = -4;
        }
        else { this.y_speed = 0; }
        this.x_speed = -this.x_speed;
    }
}

Player.prototype.render = function() {
    this.paddle.render();
};

Player.prototype.update = function() {
    for(var key in keysDown) {
        var value = Number(key);
        if(value == 38) { //up arrow
            this.paddle.move(0, -5);
        } else if(value == 40) { //down arrow
            this.paddle.move(0, 5);
        } else {
            this.paddle.move(0, 0);
        }
    }
};

Computer.prototype.render = function() {
    this.paddle.render();
};

Computer.prototype.update = function(ball) {
    var distance = (this.paddle.y + 37.5) - ball.y;
    if(distance > 37.5) { this.paddle.move(0, -4.75); }
    else if(distance < -37.5) { this.paddle.move(0, 4.75) }
    else { this.paddle.move(0, 0) }
}