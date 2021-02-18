// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}


// The player class used in this program
function Player(username) {
    this.rolenode = svgdoc.getElementById("playerrole");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.facing = facingDir.RIGHT;
    this.verticalSpeed = 0;
    this.namenode = svgdoc.getElementById("uid")
    this.namenode.firstChild.data = username;
    this.name = username;
}

function Monster(x,y) {
    this.node =  svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    this.position = new Point(x,y);
    this.vspeed =  Math.floor(Math.random()*5)-2;
    this.hspeed =  Math.floor(Math.random()*5)-2;
	this.facing = (this.hspeed > 0)?facingDir.RIGHT:facingDir.LEFT;
	this.node.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
	this.changeinterval = Math.floor(Math.random()*4) + 1 ;
}

function Bullet(facing){
	this.node = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
	if (facing == facingDir.RIGHT) this.node.setAttribute("x", player.position.x + PLAYER_SIZE.w  - BULLET_SIZE.w / 2);
	else this.node.setAttribute("x", player.position.x - BULLET_SIZE.w / 2);
	this.node.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
    this.node.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
	this.facing = facing;
}

function MonsterBullet(facing){
	this.node = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
	this.node.setAttribute("x", monsterarray[0].position.x + MONSTER_SIZE.w / 2 - MONSTER_BULLET_SIZE.w / 2);
	this.node.setAttribute("y", monsterarray[0].position.y + MONSTER_SIZE.h / 2 - MONSTER_BULLET_SIZE.h / 2);
    this.node.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monsterbullet");
	this.facing = facing;
}
Player.prototype.isOnPlatform = function() {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) return true;
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

function platformdecay(node){
	var platformOpacity = node.getAttribute("opacity");
	platformOpacity-=0.1;
	node.setAttribute("opacity", platformOpacity, null);
	if (platformOpacity < 0){ node.parentNode.removeChild(node); return;}
	setTimeout(function(){platformdecay(node);},400);
}
Player.prototype.collidePlatform = function(position) {

    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }

           if (node.getAttribute("type") == "disappearing" && this.position.y < y ) {
				if(parseFloat(node.getAttribute("opacity"))== 1.0) {
					platformdecay(node);
				}
			}
        }
    }
}

Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}

Monster.prototype.collideScreen = function(position) {
    if (position.x < 0){
		position.x = -position.x ;
		this.hspeed = -this.hspeed;
	}
    else if (position.x + MONSTER_SIZE.w > SCREEN_SIZE.w) {
		position.x = SCREEN_SIZE.w - MONSTER_SIZE.w  ;
    	this.hspeed = -this.hspeed;
	}
    if (position.y < 0) {
        position.y = -position.y ;
        this.vspeed = -this.vspeed;
    }
    else if (position.y + MONSTER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - MONSTER_SIZE.h ;
        this.vspeed = -this.vspeed;
    }

	if (this.hspeed > 0)this.facing = facingDir.RIGHT;
	else this.facing = facingDir.LEFT;
}



//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(35, 35);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 420);   // The initial position of the player
var TREASURE_SIZE = new Size(30,30);
var TELEPORT_SIZE = new Size(40,20);
var EXIT_SIZE = new Size(40,40);
var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 12;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game
var BULLET_SIZE = new Size(10, 10);         // The speed of a bullet
var MONSTER_BULLET_SIZE = new Size(20, 20);
var BULLET_SPEED = 10.0;                    // The speed of a bullet
                                            //  = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0;         		// The period when shooting is disabled
var TIME_DECREMENT = 1.0;
var TOTAL_TIME = 60.0;
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet
var cheating = false;
var exitshown = false;
var MONSTER_SIZE = new Size(35, 35);        // The speed of a bullet
var MONSTER_COUNT = 9;
var MONSTER_SHOOT_INTERVAL = 3000;
//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum
var facingDir = {LEFT:0, RIGHT:1};
var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var bulletarray = new Array();
var monsterarray = new Array();
var monsterbulletarray = new Array();
var zoom = 1.0;                             // The zoom level of the screen
var score = 0;                              // The score of the game
var endgame = false;
var alive = true;
var disappearingcount = 0;
var time_left = TOTAL_TIME; //100sec left
var TIME_BLOCK_WIDTH = 140;
var KILL_BONUS = 25.0;
var BOSS_KILLED = false;
var TREASURE_BONUS = 15.0;
var TREASURE_COUNT = 10 ;
var BULLET_COUNT = 8;
var OLD_BCOUNT = BULLET_COUNT;
var OBJECT_DISTANCE = new Size(60,60);
var monsterSpeedChangeIntervalArray = new Array();
var miltimepassed = 0;
var transmitted = false;
//
// The load function for the SVG document
//
function load(evt,zoomMode) {
	var defaultname = getCookie("name");
	uid = prompt("What is your name?",defaultname);
	if(!uid) uid = "(Anonymous)";
    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;
	svgdoc.getElementById("startingscreen").setAttribute("visibility", "hidden");
    // Attach keyboard events
    svgdoc.documentElement.addEventListener("keydown", keydown, false);
    svgdoc.documentElement.addEventListener("keyup", keyup, false);
	if (zoomMode) zoom = 2.0;
    // Remove text nodes in the 'platforms' group
    cleanUpGroup("platforms", true);
	//var uid = svgdoc.getElementById("nameinput").firstChild.data;
    // Create the player
    player = new Player(uid);

    var table = getHighScoreTable();
	for(i = 0 ; i < table.length ; i++){
		if(player.name == table[i].name)
			player.namenode.style.setProperty("fill","red");
	}

    // Create the monsters
	monsterCreater(MONSTER_COUNT);
	treasureCreater(TREASURE_COUNT);

    // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
    scoreInterval = setInterval("time_left -= TIME_DECREMENT;", 1000);
    monsterShotting = setTimeout("monsterShoots()", MONSTER_SHOOT_INTERVAL);
    monsterSpeeding = setInterval("changeMonsterSpeed()",2000);

    myAudio = new Audio('bgm.mp3');
	myAudio.addEventListener('ended', function() {
	    this.currentTime = 0;
	    this.play();
	}, false);
	myAudio.play();

}
function reload(){
	location.reload();
}

//
// This function removes all/certain nodes under a group
//


function cleanUpGroup(id, textOnly) {
    var node, next;
    var group = svgdoc.getElementById(id);
    node = group.firstChild;
    while (node != null) {
        next = node.nextSibling;
        if (!textOnly || node.nodeType == 3) // A text node
            group.removeChild(node);
        node = next;
    }
}

//
// This function creates the monsters in the game
//
function legalmpos(x,y){
	if (x >= 0 && x <= 120 && y>=320) return false;
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
		pos1 = new Point(x,y);
		pos2 = new Point(monsters.childNodes[i].getAttribute("x"), monsters.childNodes[i].getAttribute("y"));
		if(intersect( pos1,OBJECT_DISTANCE,pos2,OBJECT_DISTANCE) )return false;
	}
	return true;
}

function legaltpos(x,y){
	if (x >= 0 && x <= 100 && y>=300) return false;
    var treasures = svgdoc.getElementById("treasures");
    for (var i = 0; i < treasures.childNodes.length; i++) {
		var pos1 = new Point(x,y);
		var pos2 = new Point(treasures.childNodes[i].getAttribute("x"), treasures.childNodes[i].getAttribute("y"));
		if(intersect( pos1,OBJECT_DISTANCE,pos2,OBJECT_DISTANCE) )return false;
	}
	var platforms = svgdoc.getElementById("platforms");
	for(var i = 0 ; i <platforms.childNodes.length; i++){
		var platform = platforms.childNodes[i];
		if(platform.tagName != "rect") continue;
		var pos1 = new Point(x,y);
		var pos2 = new Point(platform.getAttribute("x"), platform.getAttribute("y"));
		var RECT_SIZE = new Size(platform.getAttribute("width"),platform.getAttribute("height"));
		if(intersect(pos1,TREASURE_SIZE,pos2,RECT_SIZE))return false;
	}
	return true;
}

function treasureCreater(count){
	for(i = 0 ; i < count ; i++){
		var x = Math.floor(Math.random()* (600-TREASURE_SIZE.w));
		var y = Math.floor(Math.random()* (560-TREASURE_SIZE.h));
		if(!legaltpos(x,y)) i--;
		else{
			node =  svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
			node.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#treasure");
			node.setAttribute("x",x);
			node.setAttribute("y",y);
			svgdoc.getElementById("treasures").appendChild(node);
		}
	}
}

function monsterCreater(count){
	for(i = 0 ; i < count ; i++){
		var x = Math.floor(Math.random()* (600-MONSTER_SIZE.w));
		var y = Math.floor(Math.random()* (560-MONSTER_SIZE.h));
		if(!legalmpos(x,y)) i--;
	    else{
			monsterarray[i] = new Monster(x,y);
			svgdoc.getElementById("monsters").appendChild(monsterarray[i].node);
			}
		}
}

//
// This function shoots a bullet from the player
//
function shootBullet() {
    // Disable shooting for a short period of time
    if (BULLET_COUNT > 0){
    	canShoot = false;
    	var audio = new Audio('player_shoot.mp3');
		audio.play();
    	setTimeout("canShoot = true", SHOOT_INTERVAL);
    	var bullet = new Bullet(player.facing);
		bulletarray[bulletarray.length] = bullet;
    	// Create the bullet using the use node
    	svgdoc.getElementById("bullets").appendChild(bullet.node);
    	BULLET_COUNT --;
	}
}

function monsterShoots(){
	var monsterbullet = new MonsterBullet(monsterarray[0].facing);
	monsterbulletarray[monsterbulletarray.length] = monsterbullet;
	svgdoc.getElementById("monsterbullets").appendChild(monsterbullet.node);
	monsterShootInterval = setTimeout("monsterShoots()", MONSTER_SHOOT_INTERVAL);
}


function monsterMove(){
	for (var i = 0; i < monsterarray.length; i++) {
        var dis = new Point();
		dis.x = monsterarray[i].hspeed;
		dis.y = monsterarray[i].vspeed;
		var position = new Point();
		position.x = monsterarray[i].position.x + dis.x;
		position.y = monsterarray[i].position.y + dis.y;
	    monsterarray[i].collideScreen(position);
		monsterarray[i].position = position;
	}
}


function newSpeed(i){
	monsterarray[i].vspeed = Math.floor(Math.random()*5)-2;
	monsterarray[i].hspeed = Math.floor(Math.random()*5)-2;
}


function changeMonsterSpeed(){
	for(i = 0 ; i < monsterarray.length ; i++){
		var monster = monsterarray[i];
		monsterarray[i].vspeed = Math.floor(Math.random()*5)-2;
	    monsterarray[i].hspeed = Math.floor(Math.random()*5)-2;
	    if (monsterarray[i].hspeed > 0)monsterarray[i].facing = facingDir.RIGHT;
	    else monsterarray[i].facing = facingDir.LEFT;
		//alert(monster.changeinterval);
		//monsterSpeedChangeIntervalArray[i] = setInterval("newSpeed(i)",monster.changeinterval*1000);
	}
}
//
// This is the keydown handling function for the SVG document
//


function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            player.motion = motionType.LEFT;
            player.facing = facingDir.LEFT;
            break;

        case "D".charCodeAt(0):
            player.motion = motionType.RIGHT;
			player.facing = facingDir.RIGHT;
            break;

        case "W".charCodeAt(0):
            if (player.isOnPlatform()||cheating) {
                player.verticalSpeed = JUMP_SPEED;
            }
            break;

		case "C".charCodeAt(0):
			if (!cheating){
				player.rolenode.style.setProperty("opacity", 0.5, null);
				cheating = true;
				OLD_BCOUNT = BULLET_COUNT;
				BULLET_COUNT = Number.POSITIVE_INFINITY;
			}
			break;

		case "V".charCodeAt(0):
		if (cheating){
				player.rolenode.style.setProperty("opacity", 1, null);
				cheating = false;
				BULLET_COUNT = OLD_BCOUNT;
		}
			break;

		case "Q".charCodeAt(0):
			alert( player.position.x+ ", "+ (player.position.y - 5) );
			break;


		case 32:
            if (canShoot) shootBullet();
            break;
    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "D".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}

function gameover(){
	if(alive && (time_left > 0)){
		var audio = new Audio('win.mp3');
		audio.play();
	}
	else{
		var audio = new Audio('player_die.mp3');
		audio.play();
	}
	score = score + time_left*5*(2*zoom);
	clearInterval(gameInterval);
    clearInterval(scoreInterval);
    var record = new ScoreRecord(player.name, score);// Create the new score record
    // Get the high score table from cookies
    var table = getHighScoreTable();
    var i = 0;
    var size = table.length;
    while( i < size && record.score < table[i].score){
		i++;
	}
	table.splice(i,0,record);// Insert the new score record
	setHighScoreTable(table,player.name);// Store the new high score table
	showHighScoreTable(table);// Show the high score table

    return;
}
//
// This function checks collision
//
function collisionDetection() {

	var pose = new Point(svgdoc.getElementById("exit").getAttribute("x"),
						 svgdoc.getElementById("exit").getAttribute("x"));
	if(intersect(pose,EXIT_SIZE,player.position, PLAYER_SIZE) && exitshown ){
		endgame = true;
	}


	var tax = svgdoc.getElementById("teleportA").getAttribute("x");
	var tay = svgdoc.getElementById("teleportA").getAttribute("y");
	var tbx = svgdoc.getElementById("teleportB").getAttribute("x");
	var tby = svgdoc.getElementById("teleportB").getAttribute("y");
	var posta = new Point(tax,tay);
	var postb = new Point(tbx,tby);

	if(intersect(posta,TELEPORT_SIZE, player.position, PLAYER_SIZE)){
		if(!transmitted){
			player.position = postb;
			transmitted = true;
		}

	}
	else if(intersect(postb,TELEPORT_SIZE, player.position, PLAYER_SIZE) ){
		if(!transmitted){
		player.position = posta;
		transmitted = true;
		}
	}
	else {transmitted = false;}
    // Check whether the player collides with a monster
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {

        if (intersect(monsterarray[i].position, MONSTER_SIZE, player.position, PLAYER_SIZE)&& !cheating) {
            // Clear the game interval
            time_left = 0;
            alive = false;
        }
    }
    var monsterbullets = svgdoc.getElementById("monsterbullets");
	    for (var i = 0; i < monsterbullets.childNodes.length; i++) {
	        var monsterbullet = monsterbullets.childNodes.item(i);
	        var x = parseInt(monsterbullet.getAttribute("x"));
	        var y = parseInt(monsterbullet.getAttribute("y"));

	        if (intersect(new Point(x, y), MONSTER_BULLET_SIZE, player.position, PLAYER_SIZE)&& !cheating) {
	            // Clear the game interval
	            time_left = 0;
	            alive = false;
	        }
    }

    var treasures = svgdoc.getElementById("treasures");
	for (var i = 0; i < treasures.childNodes.length; i++) {

	    var treasure = treasures.childNodes.item(i);
	    if(treasure.tagName != "use")continue;
	    var x = parseInt(treasure.getAttribute("x"));
	    var y = parseInt(treasure.getAttribute("y"));

	    if (intersect(new Point(x, y), TREASURE_SIZE, player.position, PLAYER_SIZE)) {
			treasures.removeChild(treasure);
			i-- ;
			score += TREASURE_BONUS*zoom;
			TREASURE_COUNT --;
	    }
    }
    // Check whether a bullet hits a monster
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));

        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);

            if (intersect(new Point(x, y), BULLET_SIZE, monsterarray[j].position, MONSTER_SIZE)) {
                monsters.removeChild(monster);
                monsterarray.splice(j,1);
                if(j == 0) BOSS_KILLED = true;
                j--;
                bullets.removeChild(bullet);
                bulletarray.splice(i,1);
                i--;
				score += KILL_BONUS*(2*zoom-1);
				var audio = new Audio('monster_die.mp3');
				audio.play();
                //write some code to update the score
            }
        }
    }


}


//
// This function updates the position of the bullets
//
function moveBullets() {
    // Go through all bullets
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);

        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));

        if( bulletarray[i].facing == facingDir.RIGHT)node.setAttribute("x", x + BULLET_SPEED);
		else node.setAttribute("x", x - BULLET_SPEED);
        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w) {
            bullets.removeChild(node);
            bulletarray.splice(i,1);
            i--;
        }
        else if (x <0){
			bullets.removeChild(node);
			bulletarray.splice(i,1);
            i--;
		}
    }


    var mbullets = svgdoc.getElementById("monsterbullets");
	    for (var i = 0; i < mbullets.childNodes.length; i++) {
	        var node = mbullets.childNodes.item(i);

	        // Update the position of the bullet
	        var x = parseInt(node.getAttribute("x"));

	        if( monsterbulletarray[i].facing == facingDir.RIGHT)node.setAttribute("x", x + BULLET_SPEED);
			else node.setAttribute("x", x - BULLET_SPEED);
	        // If the bullet is not inside the screen delete it from the group
	        if (x > SCREEN_SIZE.w) {
	            mbullets.removeChild(node);
	            monsterbulletarray.splice(i,1);
	            i--;
	        }
	        else if (x <0){
				mbullets.removeChild(node);
				monsterbulletarray.splice(i,1);
	            i--;
			}
    }
}


//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
    // Check collisions
    collisionDetection();

    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();

    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT)
        displacement.x = -MOVE_DISPLACEMENT;
    if (player.motion == motionType.RIGHT)
        displacement.x = MOVE_DISPLACEMENT;

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;

    // Move the bullets
    moveBullets();
	monsterMove();
    updateScreen();
}


//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {

	if( TREASURE_COUNT == 0 ){
		exitshown = true;
		svgdoc.getElementById("exit_msg").setAttribute("visibility","visible");
		svgdoc.getElementById("exit").setAttribute("visibility","visible");
	}

	MONSTER_SHOOT_INTERVAL = Math.floor(Math.random()*4)*1000 + 1000;
	if(BOSS_KILLED){  clearTimeout(monsterShootInterval);}
	if(time_left <= 0 || !alive ||  endgame) gameover();
    svgdoc.getElementById("timeblock").setAttribute("width", TIME_BLOCK_WIDTH*(time_left/TOTAL_TIME));
    // Transform the player
    if(player.facing == facingDir.LEFT){
    	player.namenode.setAttribute("transform",
     		"translate("+ player.position.x+","+player.position.y +")");
    	player.rolenode.setAttribute("transform",
  		"translate("+ player.position.x+","+player.position.y +") translate(" + PLAYER_SIZE.w + ", 0) scale(-1, 1) translate(0,0)");
	}
    else{
    	player.namenode.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
    	player.rolenode.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
	}


	var monsters = svgdoc.getElementById("monsters");
	for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
		//alert(monsterarray[i].position.x+","+ monsterarray[i].position.y);
		//monster.setAttribute("x",monsterarray[i].position.x);
		//monster.setAttribute("y",monsterarray[i].position.y);

		if (monsterarray[i].facing == facingDir.LEFT){
			monster.setAttribute("transform",
					"translate("+ monsterarray[i].position.x+","+ monsterarray[i].position.y +") translate(" + MONSTER_SIZE.w + ", 0) scale(-1, 1) translate(0,0)");
		}
		else monster.setAttribute("transform","translate("+ monsterarray[i].position.x+","+monsterarray[i].position.y +")");
	}
    // Calculate the scaling and translation factors
    var scale = new Point(zoom, zoom);
    var translate = new Point();

    translate.x = SCREEN_SIZE.w / 2.0 - (player.position.x + PLAYER_SIZE.w / 2) * scale.x;
    if (translate.x > 0)
        translate.x = 0;
    else if (translate.x < SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x)
        translate.x = SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x;

    translate.y = SCREEN_SIZE.h / 2.0 - (player.position.y + PLAYER_SIZE.h / 2) * scale.y;
    if (translate.y > 0)
        translate.y = 0;
    else if (translate.y < SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y)
        translate.y = SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y;

    svgdoc.getElementById("time").firstChild.data = time_left + "s";
    svgdoc.getElementById("score").firstChild.data = score;
    svgdoc.getElementById("mremaining").firstChild.data = monsterarray.length ;
    svgdoc.getElementById("bremaining").firstChild.data = BULLET_COUNT;
    svgdoc.getElementById("tremaining").firstChild.data = TREASURE_COUNT;
    // Transform the game area
    svgdoc.getElementById("gamearea").setAttribute("transform", "translate(" + translate.x + "," + translate.y + ") scale(" + scale.x + "," + scale.y + ")");
}


//
// This function sets the zoom level to 2
//
function setZoom() {
    zoom = 2.0;
}
