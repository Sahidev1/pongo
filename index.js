
const DEFAULT_SETTING_WIDTH = 768;
const DEFAULT_SETTING_HEIGHT = 576;
const DEFAULT_SETTING_X_START = 32;
const DEFAULT_SETTING_Y_START = 32;
const DEFAULT_SETTING_CANVAS_CONTAINER_ID = "canvas-container";
const DEFAULT_SETTING_CANVAS_ID = "canvas";
const DEFAULT_SETTING_BACKGROUND_COLOR = "black";

const MAX_HUMAN_ROTATION = Math.PI / 8;

const MAX_ROT_SPEED = (Math.PI / 180) / 10;

const VIRTUAL_WIDTH_PX = 1024;
const VIRTUAL_HEIGHT_PX = 768;
const VIRTUAL_RADIUS_PX = 12;
const VIRTUAL_X_START_PX = 32;

const PLAYER_WIDTH_PX = 20;
const PLAYER_HEIGTH_PX = 100;
const HUMAN_MAXSPEED = 20;
const BOT_MAXSPEED = 1;

const HUMAN_VERTICAL_VELOCITY = 0.5;

const INIT_PLAYER_VERTITCAL_VELOCITY = 0;
const INIT_PLAYER_ACCELERATION = 0;
const INIT_PLAYER_VELOCITY_INCREMENT_FACTOR = 8;

const BALL_DEFAULT_RADIUS_PX = 64;

const BALL_INIT_SPEED = 0.4;
const BALL_SPEED_FACTOR = 1.03;

const WINSCORE = 4;

const BOT_ERROR_SIZE = 0.6;


const BallCollisionState = {
    NONE: 0,
    VERTICAL_TOP: 1,
    VERTICAL_BOTTOM: 2,
    HORIZONTAL_LEFT: 3,
    HORIZONTAL_RIGHT: 4,
    PLAYER_RIGHT: 5,
    PLAYER_LEFT: 6
}

const HumanCollisionState = {
    "NONE": 0,
    "TOP": 1,
    "BOTTOM": 2
}

const PendingMove = {
    'NONE': 0,
    'UP': 1,
    'DOWN': 2
}

const PendingRotate = {
    'NONE': 0,
    'CLOCKWISE': 1,
    'COUNTER': 2
}

const GameStates = {
    MENU: 'MENU',
    PLAY: 'PLAY'
}



/**
 * Function to draw a rectangle at [x,y] that is rotated about its origin angle degrees
 * @param {CanvasRenderingContext2D} context 
 * @param {number} x 
 * @param {number} y 
 * @param {number} width 
 * @param {number} heigth 
 * @param {number} angle Radians
 * @param {string} fillStyle 
 */
function drawRotatedRect(context, x, y, width, heigth, angle, fillStyle) {
    context.save();

    context.translate(x + width / 2, y + heigth / 2);

    context.rotate(angle % Math.PI);

    context.fillStyle = fillStyle;
    context.fillRect(-width / 2, -heigth / 2, width, heigth);

    context.restore();
}

/**
* Draws a line with an arrowhead at the end.
* @param {CanvasRenderingContext2D} context
* @param {*} x0
* @param {*} y0
* @param {*} x1
* @param {*} y1
*/
function drawLinkingVect(context, x0, y0, x1, y1, col = "red") {
    context.save();

    context.beginPath();
    context.strokeStyle = col;
    context.lineWidth = 4;
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();

    // Draw arrowhead
    const arrowSize = 10; // Size of the arrowhead
    const angle = Math.atan2(y1 - y0, x1 - x0); // Angle of the line
    const arrowAngle = Math.PI / 6; // Angle of the arrowhead from the line

    // Calculate the two points of the arrowhead
    const xArrow1 = x1 - arrowSize * Math.cos(angle - arrowAngle);
    const yArrow1 = y1 - arrowSize * Math.sin(angle - arrowAngle);

    const xArrow2 = x1 - arrowSize * Math.cos(angle + arrowAngle);
    const yArrow2 = y1 - arrowSize * Math.sin(angle + arrowAngle);

    // Draw the arrowhead
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(xArrow1, yArrow1);
    context.moveTo(x1, y1);
    context.lineTo(xArrow2, yArrow2);
    context.stroke();

    context.restore();
}

/**
 * 
 * @param {CanvasRenderingContext2D} context 
 */
function drawVect(context, x, y, w, h, color = "red") {
    context.save();
    context.strokeStyle = color;
    context.strokeRect(x, y, w, h);
    context.restore();
}

class ErrorEmulator {
    /**
     * 
     * @param {number} errSize upper bound for size of error, must be between 0 and 1
     * @param {boolean} negativeErr can errors be negative?
     */
    constructor(errSize, negativeErr = true) {
        this.errSize = errSize % 1;
        this.negativeErr = negativeErr;
    }

    createErr() {
        let rawErr = ((Math.random() - 0.5) * 2) * this.errSize;
        if (!this.negativeErr) rawErr = Math.abs(rawErr);
        //console.log(rawErr);
        return rawErr;
    }

    /**
     * 
     * @param {number} data 
     */
    emulateError(data) {
        let v = data + (data * this.createErr());
        //console.log(`data: ${data}, v: ${v}`);
        return v;
    }

    /**
     * 
     * @param {number[]} data array of numbers
     */
    emulateErrors(data) {
        return data.map(d => {
            return d + (d * createErr());
        });
    }



}


/**
 * Settings class
 */
class Settings {

    constructor(win_width, win_height, x_start, y_start, canvas_cointainer_id, canvas_id, background_color) {
        this.win_width = win_width;
        this.win_height = win_height;
        this.x_start = x_start;
        this.y_start = y_start;
        this.canvas_container_id = canvas_cointainer_id;
        this.canvas_id = canvas_id;
        this.background_color = background_color;
    }

    static getDefault() {
        return new Settings(DEFAULT_SETTING_WIDTH, DEFAULT_SETTING_HEIGHT, DEFAULT_SETTING_X_START, DEFAULT_SETTING_Y_START, DEFAULT_SETTING_CANVAS_CONTAINER_ID, DEFAULT_SETTING_CANVAS_ID, DEFAULT_SETTING_BACKGROUND_COLOR);
    }
}

class Vector {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    transform([a, b, c, d]) {
        let [x, y] = [this.x, this.y];
        this.x = a * x + c * y;
        this.y = b * x + d * y;
    }

    rotate(angle) {
        let transformer = [Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle)];
        this.transform(transformer);
    }

    absolute() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    scale(scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }

    /**
     * calculates: V - W. where V is this vector and W is other vector
     * @param {Vector} other 
     * @returns {Vector} new diff vector
     */
    vectorDiff(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    vectorAdd(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    /**
     * 
     * @param {Vector} other 
     */
    dotProduct(other) {
        return (this.x * other.x) + (this.y * other.y);
    }

    /**
     * Project another vector "other" on to this vector
     * returns new projected vector
     * @param {Vector} other 
     */
    projectVector(other) {
        let dotp = this.dotProduct(other);
        let absol_sqr = this.x ** 2 + this.y ** 2;
        let scalar = dotp / absol_sqr;

        let projection = new Vector(this.x, this.y);
        projection.x *= scalar;
        projection.y *= scalar;

        return projection;
    }

    invert() {
        this.x = -this.x;
        this.y = -this.y;
    }

}

class VelocityVector extends Vector {

    constructor(x, y) {
        super(x, y);
        this.velocityAngle = Math.atan(this.y / this.x);
        this.speed = Math.sqrt(this.x ** 2 + this.y ** 2);

        //console.log([x, y]);
        //console.log(this.velocityAngle);
        //console.log(this.speed);
    }

    increaseSpeed(factor) {
        this.speed *= factor;
        let x_vect = this.x * factor;
        let y_vect = this.y * factor;
        this.x = x_vect;
        this.y = y_vect;

        //console.log([this.x, this.y]);
        //console.log(this.velocityAngle);
        //console.log(this.speed);
    }
}

/**
 * 
 * @param {VelocityVector} velVector 
 * @param {number} surfAngle 
 * @param {boolean} toLeft
 */
function bounceAngle(velVector, surfAngle, toLeft = true) {
    let xMirrorTransform = [-1, 0, 0, 1];
    if (surfAngle === 0) {
        velVector.transform(xMirrorTransform);
        return;
    }
    const X = new Vector(1, 0);
    const Y = new Vector(0, 1);
    X.rotate(-surfAngle);
    Y.rotate(-surfAngle);
    let transformer = [X.x, X.y, Y.x, Y.y]

    velVector.transform(transformer);
    velVector.transform(xMirrorTransform);
}


/**
 * This function checks for collision between paddle rotated about its center and other objects.
 * @param {Vector} rectVect vector to virtual non-rotated rectangle 
 * @param {Vector} vect vector to thing collision check with
 * @param {number} w 
 * @param {number} h 
 * @param {number} angle 
 */
function collCheckRect(rectVect, vect, w, h, angle, collMargin, leftcheck = true) {
    const X = new Vector(w / 2, 0);
    const Y = new Vector(0, h / 2);

    X.rotate(angle); // basis vector x
    Y.rotate(angle); // basic vector y

    const rectOrigin = new Vector(rectVect.x + w / 2, rectVect.y + h / 2);

    let u = X.vectorAdd(Y);
    let collCheckVect = rectOrigin.vectorDiff(u);

    X.scale(2);
    Y.scale(2);

    let relVect = vect.vectorDiff(collCheckVect);

    let delta_x = X.projectVector(relVect);
    let delta_y = Y.projectVector(relVect);

    let delta_x_size = delta_x.absolute();
    let delta_y_size = delta_y.absolute();

    let delta_x_dot = delta_x.dotProduct(X);
    let delta_y_dot = delta_y.dotProduct(Y);

    let angle_condition = delta_x_dot >= 0 && delta_y_dot >= 0;
    let delta_x_cond = delta_x_size >= w - collMargin && delta_x_size <= w + collMargin;
    let delta_y_cond = delta_y_size >= 0 && delta_y_size <= h;

    if (leftcheck) return angle_condition && delta_x_cond && delta_y_cond;

    angle_condition = delta_x_dot <= 0 && delta_y_dot >= 0;
    delta_x_cond = delta_x_size >= 0 && delta_x_size <= collMargin;
    delta_y_cond = delta_y_size >= 0 && delta_y_size <= h;
    return angle_condition && delta_x_cond && delta_y_cond;
}



class Player {

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {boolean} isBot
     */
    constructor(isBot, dynData, color = "green", x = 0, y = 0, width, height, maxSpeed) {
        this.initPosX = x;
        this.initPosY = y;
        this.position = new Vector(x, y);
        this.score = 0;
        this.isBot = isBot;
        this.color = color;
        this.width = width;
        this.height = height;
        this.callbacks = [];
        this.vertVelocity = INIT_PLAYER_VERTITCAL_VELOCITY;
        this.acceleration = INIT_PLAYER_ACCELERATION;
        this.velocityIncrements = 0;
        this.velocityIncrementFactor = INIT_PLAYER_VELOCITY_INCREMENT_FACTOR;
        this.maxSpeed = maxSpeed;
        this.ballWithinRange = false;
        this.dynData = dynData;
        this.moveRequested = 0;
        this.rotation = 0;
        this.rotRequested = PendingRotate.NONE;
    }

    reset(){
        this.position.x = this.initPosX;
        this.position.y = this.initPosY;
        this.rotation = 0;
    }


    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     */
    draw(context, vectorShow = false) {
        //console.log(this.color);

        drawRotatedRect(context, this.position.x, this.position.y, this.width, this.height, this.rotation, this.color);

        if (vectorShow) {
            drawLinkingVect(context, 0, 0, this.position.x, this.position.y, "red");
        }


    }


    /**
     * @param {function eventCB(this) {}}
     * 
     */
    addCallback(eventCB) {
        this.callbacks = [eventCB, ...this.callbacks];
    }

    callCBs() {
        this.callbacks.forEach(ev => ev(this));
    }
}

class Ball {
    constructor(x, y, xv, yv, color, dynData, radius = BALL_DEFAULT_RADIUS_PX) {
        this.position = new Vector(x, y);
        this.velocity = new VelocityVector(xv, yv);
        this.radius = radius;
        this.color = color;
        this.callbacks = [];
        this.dynData = dynData;
        this.canMove = true;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     */
    draw(context, vectorShow = false) {
        //console.log("drawing ball");
        context.beginPath();
        context.arc(Math.round(this.position.x), Math.round(this.position.y), this.radius, 0, 2 * Math.PI);
        context.closePath();
        context.fillStyle = this.color;
        context.fill();

        if (vectorShow) {
            drawLinkingVect(context, 0, 0, this.position.x, this.position.y, "yellow");
            let tmpV = new Vector(this.velocity.x, this.velocity.y);
            tmpV.scale(100);
            let velV = this.position.vectorAdd(tmpV);

            drawLinkingVect(context, this.position.x, this.position.y, velV.x, velV.y, "purple");

        }
    }

    /**
    * @param {function eventCB(this) {}}
    * 
    */
    addCallback(eventCB) {
        this.callbacks = [eventCB, ...this.callbacks];
    }

    callCBs() {
        this.callbacks.forEach(ev => ev(this));
    }

    pauseMovement(pauseMS) {
        this.canMove = false;
        const cb = () => {
            //console.log("ping")
            this.canMove = true;
        }

        setTimeout(cb, pauseMS);
    }


    /**
     * 
     */
    move() {
        //console.log(this.canMove);
        if (!this.canMove) {
            return;
        }
        let delta_t = this.dynData['delta_t'];
        this.position.x += this.velocity.x * delta_t;
        this.position.y += this.velocity.y * delta_t;
    }
}

class GameState {
    /**
     * 
     * @param {Settings} settings 
     */
    constructor(winscore, vectorShow = false) {
        this.vectorShow = vectorShow;

        let pheight = PLAYER_HEIGTH_PX;
        let pwidth = PLAYER_WIDTH_PX;
        this.pheight = pheight;
        this.width = pwidth;

        this.botErrorEmulator = new ErrorEmulator(BOT_ERROR_SIZE);

        this.v_width = VIRTUAL_WIDTH_PX;
        this.v_height = VIRTUAL_HEIGHT_PX;
        this.v_xstart = VIRTUAL_X_START_PX;
        this.v_ystart = this.v_height / 2 - pheight / 2;
        this.v_radius = VIRTUAL_RADIUS_PX;

        this.ballVel_angle = (0.5 - Math.random()) * (Math.PI / 4); //angle is: -45 to 45 degrees
        this.ballVel_mag = BALL_INIT_SPEED;

        this.y_vect = this.ballVel_mag * Math.sin(this.ballVel_angle);
        this.x_vect = this.ballVel_mag * Math.cos(this.ballVel_angle);

        this.dynData = {
            'delta_t': 0
        }

        this.score = 0;

        this.scoreboard = {
            HUMAN: 0,
            BOT: 0
        }

        this.eventSubscribers = [];

        this.ballSpeedFactor = BALL_SPEED_FACTOR;


        this.human = new Player(false, this.dynData, "white", this.v_xstart, this.v_ystart, pwidth, pheight, HUMAN_MAXSPEED);
        this.human.vertVelocity = HUMAN_VERTICAL_VELOCITY;


        this.bot = new Player(true, this.dynData, "white", this.v_width - this.v_xstart - pwidth, this.v_ystart, pwidth, pheight, BOT_MAXSPEED);

        this.winscore = winscore;
        this.ball = new Ball(Math.floor(this.v_width / 2), Math.floor(this.v_height / 2), this.x_vect, this.y_vect, "white", this.dynData, this.v_radius);


        this.bot.addCallback(
            /**
             * This function adjusts the bot players verical velocity
             * @param {Player} arg 
             */
            (arg) => {
                let bot_b = arg.position.y + arg.height;
                let bot_t = arg.position.y;
                let ball_y = this.ball.position.y;
                let bot_center = bot_t + arg.height / 2;
                let hor_dist = arg.position.x - (this.ball.position.x + this.ball.radius);
                let ver_dist = arg.position.y - bot_center;

                let hor_ver_ratio = ver_dist / hor_dist;

                let inverse_speed_factor = this.v_width / (1 + Math.abs(hor_dist));

                let velocity = Math.sqrt(ver_dist * ver_dist + inverse_speed_factor ** 2) / 256;

                let rangeOfPeace = 10;
                const RANGE_FACTOR = 1;


                if (ball_y > bot_b) {
                    arg.ballWithinRange = false;
                    arg.vertVelocity = velocity;
                } else if (ball_y < bot_t) {
                    arg.ballWithinRange = false;
                    arg.vertVelocity = -velocity;
                } else {
                    if (hor_dist >= 0 && hor_dist <= RANGE_FACTOR * arg.height) arg.ballWithinRange = true;
                    else arg.ballWithinRange = false;
                    if ((ball_y < bot_center + rangeOfPeace && ball_y > bot_center - rangeOfPeace)) {
                        if (arg.ballWithinRange) arg.vertVelocity = 0;
                        else arg.vertVelocity = velocity / 4;
                    }
                }

                // add error to velocity



            });

        this.bot.addCallback(
            /**
             * This function moves the bot player
             * @param {Player} arg 
             */
            (arg) => {
                const collisionCheck = () => {
                    if (arg.position.y <= 0 || arg.position.y + arg.height >= this.v_height) return true;
                    return false;
                }

                //console.log(`before: ${arg.vertVelocity}`);
                arg.vertVelocity = arg.ballWithinRange ? (arg.vertVelocity + arg.acceleration) % (2 * arg.maxSpeed) : (arg.vertVelocity + arg.acceleration) % arg.maxSpeed;
                //console.log(`after: ${arg.vertVelocity}`);

                let delta_t = arg.dynData['delta_t'];

                if (!collisionCheck()) {
                    //console.log("collider");
                    arg.position.y += this.botErrorEmulator.emulateError(arg.vertVelocity) * this.botErrorEmulator.emulateError(delta_t);
                } else {
                    if ((arg.vertVelocity > 0 && arg.position.y <= 0) || (arg.vertVelocity < 0 && arg.position.y + arg.height >= this.v_height)) {
                        arg.position.y += arg.vertVelocity * delta_t;
                    }
                }


            }
        );

        this.ball.addCallback(
            /**
             * @param {Ball} arg
             */
            (arg) => {
                //console.log("ball collision check;");
                const bot = this.bot;
                const human = this.human;
                const collisionCheck = () => {
                    if (arg.position.x <= arg.radius) return BallCollisionState.HORIZONTAL_LEFT;
                    if (arg.position.x >= this.v_width - arg.radius) return BallCollisionState.HORIZONTAL_RIGHT;
                    if (arg.position.y <= arg.radius) return BallCollisionState.VERTICAL_TOP;
                    if (arg.position.y >= this.v_height - arg.radius) return BallCollisionState.VERTICAL_BOTTOM;
                    //if((arg.position.x + arg.radius >= bot.position.x && arg.position.x <= bot.position.x) && (arg.position.y + arg.radius >= bot.position.y && arg.position.y - arg.radius  <= bot.position.y + bot.height) && arg.velocity.x >= 0) return BallCollisionState.PLAYER_RIGHT;
                    //if((arg.position.x - arg.radius <= human.position.x + human.width && arg.position.x >= human.position.x + human.width ) && (arg.position.y + arg.radius >= human.position.y && arg.position.y - arg.radius  <= human.position.y + human.height) && arg.velocity.x <= 0) return BallCollisionState.PLAYER_LEFT;

                    if (arg.velocity.x >= 0 && collCheckRect(bot.position, arg.position, bot.width, bot.height, bot.rotation, arg.radius, false)) {
                        console.log("player right collision")
                        return BallCollisionState.PLAYER_RIGHT;
                    }
                    if (arg.velocity.x < 0 && collCheckRect(human.position, arg.position, human.width, human.height, human.rotation, arg.radius, true)) return BallCollisionState.PLAYER_LEFT;


                    return BallCollisionState.NONE;
                }

                const collCheck = collisionCheck();
                switch (collCheck) {
                    case BallCollisionState.HORIZONTAL_LEFT:
                        this.updateScoreboard(this.scoreboard.HUMAN, this.scoreboard.BOT + 1);
                        this.initBall();
                        //arg.velocity.x = -arg.velocity.x;
                        //arg.position.x = arg.radius + 1;
                        break;
                    case BallCollisionState.HORIZONTAL_RIGHT:
                        this.updateScoreboard(this.scoreboard.HUMAN + 1, this.scoreboard.BOT);
                        this.initBall();
                        //arg.velocity.x = -arg.velocity.x;
                        //arg.position.x = this.v_width - (arg.radius + 1);
                        break;
                    case BallCollisionState.VERTICAL_BOTTOM:
                        arg.velocity.y = -arg.velocity.y;
                        arg.position.y = this.v_height - (arg.radius + 1);
                        break;
                    case BallCollisionState.VERTICAL_TOP:
                        arg.velocity.y = -arg.velocity.y;
                        arg.position.y = arg.radius + 1;
                        break;
                    case BallCollisionState.PLAYER_RIGHT:
                        bounceAngle(arg.velocity, bot.rotation, false);
                        arg.position.x = bot.position.x - (arg.radius + 1);
                        arg.velocity.increaseSpeed(this.ballSpeedFactor);
                        break;
                    case BallCollisionState.PLAYER_LEFT:
                        bounceAngle(arg.velocity, human.rotation, true);
                        arg.position.x = human.position.x + human.width + (arg.radius + 1);
                        arg.velocity.increaseSpeed(this.ballSpeedFactor);
                        break;
                    default:
                        break;
                }
            }
        )

        this.human.addCallback(
            /**
             * 
             * @param {Player} arg 
             */
            (arg) => {
                let delta_t = arg.dynData['delta_t'];

                if (arg.rotRequested === PendingRotate.COUNTER && arg.rotation < MAX_HUMAN_ROTATION){
                    arg.rotation += MAX_ROT_SPEED * delta_t; 
                }
                if (arg.rotRequested === PendingRotate.CLOCKWISE && arg.rotation > -MAX_HUMAN_ROTATION){
                    arg.rotation -= MAX_ROT_SPEED * delta_t; 
                }
                

                const collisionCheck = () => {
                    if (arg.position.y <= 0) return HumanCollisionState.TOP;
                    if (arg.position.y + arg.height >= this.v_height) return HumanCollisionState.BOTTOM;
                    return HumanCollisionState.NONE;
                }

                let coll = collisionCheck()
                if (coll !== HumanCollisionState.NONE) {
                    if (coll === HumanCollisionState.TOP) arg.position.y = 0;
                    if (coll === HumanCollisionState.BOTTOM) arg.position.y = this.v_height - arg.height;
                    if ((coll === HumanCollisionState.TOP && arg.moveRequested === PendingMove.UP) || (coll === HumanCollisionState.BOTTOM && arg.moveRequested === PendingMove.DOWN)) {
                        arg.moveRequested = PendingMove.NONE;
                        return;
                    }
                }

                if (arg.moveRequested === PendingMove.NONE) return;


                //console.log(delta_t)
                if (arg.moveRequested === PendingMove.UP) arg.position.y -= arg.vertVelocity * delta_t;
                else if (arg.moveRequested === PendingMove.DOWN) arg.position.y += arg.vertVelocity * delta_t;

            }
        );


        this.drawable = [this.ball, this.human, this.bot];
        this.movable = [this.ball];

        this.eventSubscribers.push({
            type: "keydown", "fun": (event) => {
                if (this.state === GameStates.MENU) return;
                //console.log(event);
                if (event.code === 'ArrowUp') {
                    if (this.human.moveRequested != PendingMove.UP) this.human.moveRequested = PendingMove.UP;
                }
                else if (event.code === 'ArrowDown') {
                    if (this.human.moveRequested != PendingMove.DOWN) this.human.moveRequested = PendingMove.DOWN;
                }
                else if (event.code === 'ArrowLeft') {
                    this.human.rotRequested = PendingRotate.CLOCKWISE;
                    //if(this.human.rotation < MAX_HUMAN_ROTATION) this.human.rotation += 8*Math.PI/180;
                }
                else if (event.code === 'ArrowRight') {
                    this.human.rotRequested = PendingRotate.COUNTER;
                    //if(this.human.rotation > -MAX_HUMAN_ROTATION) this.human.rotation -= 8*Math.PI/180;
                }
            }
        });

        this.eventSubscribers.push({
            type: "keyup", "fun": (event) => {
                let code = event.code;
                if (code === 'ArrowUp' || code === 'ArrowDown') this.human.moveRequested = PendingMove.NONE;
                if (code === 'ArrowLeft' || code === 'ArrowRight') this.human.rotRequested = PendingRotate.NONE;
            }
        })


        this.state = GameStates.MENU;

    }

    updateScoreboard(humanscore, botscore) {
        let score = Math.max(humanscore, botscore)
        if (score >= this.winscore) {
            this.resetGame();
            return;
        }
        this.scoreboard.BOT = botscore;
        this.scoreboard.HUMAN = humanscore;
    }

    setGameState(newState) {
        if (this.state === GameStates.MENU && newState === GameStates.PLAY) {
            this.ball.pauseMovement(1000);
        }
        this.state = newState;
    }

    resetGame() {
        this.initBall();
        this.human.reset();
        this.bot.reset();
        this.score = 0;
        this.scoreboard.BOT = 0; this.scoreboard.HUMAN = 0;
        this.state = GameStates.MENU;
    }

    initBall() {
        this.ballVel_angle = (0.5 - Math.random()) * (Math.PI / 4);
        this.ballVel_mag = BALL_INIT_SPEED;

        this.y_vect = this.ballVel_mag * Math.sin(this.ballVel_angle);
        this.x_vect = this.ballVel_mag * Math.cos(this.ballVel_angle);

        this.ball.position.x = Math.floor(this.v_width / 2);
        this.ball.position.y = Math.floor(this.v_height / 2);
        this.ball.velocity.x = -this.x_vect;
        this.ball.velocity.y = this.y_vect;

        this.ball.pauseMovement(700);
    }

    moveObjects() {
        this.movable.forEach(m => m.move());
    }

    callCBs() {
        this.drawable.filter(e => e.callCBs !== undefined)
            .forEach(e => e.callCBs());
    }

    setDelta(delta) {
        this.dynData.delta_t = delta;
    }

}


class Renderer {

    /**
     * 
     * @param {Settings} settings
     * @param {GameState} gamestate 
     */
    constructor(gamestate, settings = null) {
        if (settings == null) settings = Settings.getDefault();
        this.settings = settings;

        this.gamestate = gamestate;
        this.x_scale = settings.win_width / this.gamestate.v_width;
        this.y_scale = settings.win_height / this.gamestate.v_height;


        this.menuEvent = null;
    }

    initRender() {
        const settings = this.settings;

        this.container = document.getElementById(settings.canvas_container_id);

        this.container.innerHTML = `<canvas id="${settings.canvas_id}" height="${settings.win_height}" width="${settings.win_width}"> </canvas>`;
        this.canvas = document.getElementById(settings.canvas_id);
        /**
         * @type {CanvasRenderingContext2D}
         * @public
         */
        this.context = canvas.getContext("2d");
        this.context.scale(this.x_scale, this.y_scale);

        this.canvas.tabIndex = 1; // kind of a hack to be able to attach eventlisteners to canvas element

        this.gamestate.eventSubscribers.forEach(sub => {
            this.canvas.addEventListener(sub.type, (event) => sub.fun(event));
        });

        this.context.initTransform = this.context.getTransform();
    }


    /**
     * 
     * @returns {CanvasRenderingContext2D}
     */
    getContext() {
        return this.context;
    }

    /**
     * 
     * @param {string} color rgb-color
     */
    fillCanvas(color) {
        this.context.fillStyle = color;
        this.context.fillRect(0, 0, this.gamestate.v_width, this.gamestate.v_height);
    }

    renderMenu() {
        this.fillCanvas(this.settings.background_color);
        this.context.fillStyle = "white";
        this.context.font = "bold 52px serif";
        this.context.textAlign = "center";
        this.context.fillText("Press Any key to start the game!", this.gamestate.v_width / 2, this.gamestate.v_height / 2);
    }

    renderScore() {
        this.context.fillStyle = "white";
        this.context.font = "bold 52px serif";
        this.context.textAlign = "center";
        this.context.textBaseline = 'top';
        let scoreboard = this.gamestate.scoreboard;
        this.context.fillText(`${scoreboard.HUMAN} : ${scoreboard.BOT}`, this.gamestate.v_width / 2, 20);
        this.context.textBaseline = 'alphabetic';
    }

    render() {

        if (this.gamestate.state === GameStates.MENU) {
            if (this.menuEvent === null) {
                const callback = () => this.gamestate.setGameState(GameStates.PLAY);
                function eventHandler() {
                    callback();
                }
                this.canvas.addEventListener('keydown', eventHandler);
                this.menuEvent = () => this.canvas.removeEventListener('keydown', eventHandler);
            }
            this.renderMenu();
            return;
        }

        if (this.menuEvent !== null) {
            this.menuEvent();
            this.menuEvent = null;
        }

        this.fillCanvas(this.settings.background_color);
        //console.log(this.gamestate.drawable);
        this.renderScore();
        this.gamestate.drawable.forEach(e => e.draw(this.context, this.gamestate.vectorShow));
    }
}


const gamestate = new GameState(WINSCORE, true);
const renderer = new Renderer(gamestate);

const FRAME_TIME_MS = 16;

renderer.initRender();
renderer.render();

let last_t = Date.now();
let curr_t = 0;
let delta_t = 0;

let pause = false;


const main0 = setInterval(() => {
    if (pause) return;
    curr_t = Date.now();
    gamestate.setDelta(curr_t - last_t);
    //console.log($1)
    if (gamestate.state !== GameStates.MENU) {
        gamestate.callCBs();
        gamestate.moveObjects();
    }
    renderer.render();
    last_t = curr_t;
    //console.log(gamestate.state)
}, FRAME_TIME_MS);

console.log(main0)



