/*************************************************************
 Interaction of Iron Filings with Bar Magnets
 
 Created by Adonay Martinez-Coto [march-2025]
 
    This program simulates the interaction of iron filings 
    with two bar magnets. The user can drag the magnets around
    the canvas and rotate them using the left and right arrow 
    keys. The polarity of the left magnet can be flipped using
    the up or down arrow key to see the effect on the filings.
**************************************************************/

var filingLength = 10;
var numFilings = 3000;
var filings;
var friction = 0.6;

var Magnet = function(x, y, reverse) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 100;
    this.angle = 0;
    this.strength = 100;
    this.reverse = reverse;
    
    this.draw = function() {
        var w = this.width/2;
        var h = this.height/2;
        
        translate(this.x, this.y);
        rotate(this.angle);
        
        noStroke();
        fill(0, 0, 0, 100);
        rect(3-w, 3-h, this.width, this.height);
        
        strokeWeight(1);
        stroke(0, 0, 0);
        if (this.reverse) {
            fill(20, 20, 200);
            rect(-w, -h, this.width, h);
            fill(200, 20, 20);
            rect(-w, 0, this.width, h);
        } else {
            fill(200, 20, 20);
            rect(-w, -h, this.width, h);
            fill(20, 20, 200);
            rect(-w, 0, this.width, h);
        }
        
        textSize(22);
        textAlign(CENTER, CENTER);
        fill(255, 255, 255);
        if (this.reverse) {
            text("S", 0, -this.height/4);
            text("N", 0, this.height/4);
        } else {
            text("N", 0, -this.height/4);
            text("S", 0, this.height/4);
        }
        
        
        resetMatrix();
    };
    
    this.updatePolePositions = function() {
        var s = (this.height / 2) * sin(this.angle);
        var c = (this.height / 2) * cos(this.angle);

        this.x1 = this.x + (this.reverse ? -s : s);
        this.x2 = this.x + (this.reverse ? s : -s);
        this.y1 = this.y - c;
        this.y2 = this.y + c;
    };
    
    this.rotate = function(angle) {
        this.angle += angle;
        this.updatePolePositions();
    };
    
    this.updatePolePositions();
};

var Filing = function(x, y, length, theta) {
    this.x = x;
    this.y = y;
    this.length = length/2;
    this.theta = theta;
    
    this.draw = function() {
        var s = this.length * sin(this.theta);
        var c = this.length * cos(this.theta);
        line(this.x + s, this.y - c, this.x - s, this.y + c);
    }; 

    this.magnetInteraction = function(magnet1, magnet2) {    
        var interactWithMagnet = function(magnet) {
            var dx = this.x - magnet.x1;
            var dy = this.y - magnet.y1;
            var theta1 = atan2(dy, dx) + 90;
            var f1 = magnet.strength / sqrt(dx*dx + dy*dy);
            
            dx = this.x - magnet.x2;
            dy = this.y - magnet.y2;
            var theta2 = atan2(dy, dx) - 90;
            var f2 = magnet.strength / sqrt(dx*dx + dy*dy);
            
            return {f1: f1, f2: f2, theta1: theta1, theta2: theta2};
        };
        
        var result1 = interactWithMagnet.call(this, magnet1);
        var result2 = interactWithMagnet.call(this, magnet2);
        
        var mx = result1.f1 * cos(result1.theta1) + result1.f2 * cos(result1.theta2) +
                 result2.f1 * cos(result2.theta1) + result2.f2 * cos(result2.theta2);
        
        var my = result1.f1 * sin(result1.theta1) + result1.f2 * sin(result1.theta2) +
                 result2.f1 * sin(result2.theta1) + result2.f2 * sin(result2.theta2);
        
        var f = (result1.f1 + result1.f2 + result2.f1 + result2.f2) / (result1.f1 + result1.f2 + result2.f1 + result2.f2 + 5);
        var d = (360 + atan2(my, mx) - this.theta) % 180;
        this.theta += d;
    };
};



var addIronFilings = function(n) {
    var filings = [];
    for (var i = 0; i < numFilings; i++) {
        var x = random() * 400;
        var y = random() * 400;
        var theta = random() * 360;
        filings.push(new Filing(x, y, filingLength, theta));
    }
    return filings;
};

var barMagnet1 = new Magnet(150, 230, false);
var barMagnet2 = new Magnet(250, 230, false);

var interact = function(magnets) {
    for (var i = 0; i < numFilings; i++) {
        filings[i].magnetInteraction(barMagnet1, barMagnet2);
    }
};

var filings = addIronFilings();
interact(filings);

var draw = function() {
    background(230, 240, 240);
    
    strokeWeight(1);
    stroke(20, 20, 20);
    for (var i = 0; i < numFilings; i++) {
        filings[i].draw();
    }
    
    barMagnet1.draw();  
    barMagnet2.draw();  
};

// Allow dragging of magnets
var mouseDragged = function() {
    if (dist(mouseX, mouseY, barMagnet1.x, barMagnet1.y) < 50) {
        barMagnet1.x = mouseX;
        barMagnet1.y = mouseY;
        barMagnet1.updatePolePositions();
    }
    if (dist(mouseX, mouseY, barMagnet2.x, barMagnet2.y) < 50) {
        barMagnet2.x = mouseX;
        barMagnet2.y = mouseY;
        barMagnet2.updatePolePositions();
    }
    interact(filings);
};

// For rotating magnets and flipping polarity on left magnet
var keyPressed = function() {
    if (keyCode === LEFT) {
        barMagnet1.rotate(-5);
        barMagnet2.rotate(-5);
    } else if (keyCode === RIGHT) {
        barMagnet1.rotate(5);
        barMagnet2.rotate(5);
    } else if (keyCode === UP) { 
        barMagnet1.reverse = !barMagnet1.reverse;  // Flip polarity
        barMagnet1.updatePolePositions();
    } else if (keyCode === DOWN) { 
        barMagnet1.reverse = !barMagnet1.reverse;  // Flip polarity
        barMagnet1.updatePolePositions();
    }
    interact(filings);  // Update interactions after changes
};