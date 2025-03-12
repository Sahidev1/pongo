
const DEFAULT_SETTING_WIDTH = 768;
const DEFAULT_SETTING_HEIGHT = 768;
const DEFAULT_SETTING_X_START = 32;
const DEFAULT_SETTING_Y_START = 32;
const DEFAULT_SETTING_CANVAS_CONTAINER_ID = "canvas-container";
const DEFAULT_SETTING_CANVAS_ID = "canvas";
const DEFAULT_SETTING_BACKGROUND_COLOR = "black";

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

const BALL_INIT_SPEED = 0.5;
const BALL_SPEED_FACTOR = 1.03;

const WINSCORE = 10;

const BOT_ERROR_SIZE = 0.6;


const BallCollisionState = {
    NONE:0,
    VERTICAL_TOP:1,
    VERTICAL_BOTTOM:2,
    HORIZONTAL_LEFT:3,
    HORIZONTAL_RIGHT:4,
    PLAYER_RIGHT:5,
    PLAYER_LEFT:6
}

const HumanCollisionState = {
    "NONE":0,
    "TOP":1,
    "BOTTOM":2
}

const PendingMove={
    'NONE':0,
    'UP':1,
    'DOWN':2
}

const GameStates={
    MENU:'MENU',
    PLAY:'PLAY'
}


class ErrorEmulator {
    /**
     * 
     * @param {number} errSize upper bound for size of error, must be between 0 and 1
     * @param {boolean} negativeErr can errors be negative?
     */
    constructor(errSize, negativeErr=true){
        this.errSize = errSize % 1;
        this.negativeErr = negativeErr;
    }

    createErr(){
        let rawErr = ((Math.random() - 0.5)*2) * this.errSize;
        if (!this.negativeErr) rawErr = Math.abs(rawErr);
        //console.log(rawErr);
        return rawErr;
    }

    /**
     * 
     * @param {number} data 
     */
    emulateError(data){
        let v = data + (data*this.createErr());
        //console.log(`data: ${data}, v: ${v}`);
        return v;
    }

    /**
     * 
     * @param {number[]} data array of numbers
     */
    emulateErrors(data){
        return data.map(d => {
            return d + (d*createErr());
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
}

class VelocityVector extends Vector {

    constructor(x, y) {
        super(x, y);
        this.velocityAngle = Math.atan(this.y / this.x);
        this.speed = Math.sqrt(this.x**2 + this.y**2);

        //console.log([x, y]);
        //console.log(this.velocityAngle);
        //console.log(this.speed);
    }

    increaseSpeed(factor){
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



class Player {

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {boolean} isBot
     */
    constructor(isBot, dynData, color = "green", x = 0, y = 0, width, height, maxSpeed) {
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
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     */
    draw(context) {
        context.fillStyle = this.color;
        //console.log(this.color);
        context.fillRect(this.position.x, this.position.y, PLAYER_WIDTH_PX, PLAYER_HEIGTH_PX);
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
    draw(context) {
        //console.log("drawing ball");
        context.beginPath();
        context.arc(Math.round(this.position.x), Math.round(this.position.y), this.radius, 0, 2 * Math.PI);
        context.closePath();
        context.fillStyle = this.color;
        context.fill();
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
        const cb = ()=>{
            console.log("ping")
            this.canMove = true;
        }

        setTimeout(cb,  pauseMS);
    }


    /**
     * 
     */
    move() {
        console.log(this.canMove);
        if (!this.canMove){
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
    constructor(winscore) {
        let pheight = PLAYER_HEIGTH_PX;
        let pwidth = PLAYER_WIDTH_PX;
        this.pheight = pheight;
        this.width = pwidth;

        this.botErrorEmulator = new ErrorEmulator(BOT_ERROR_SIZE);

        this.v_width = VIRTUAL_WIDTH_PX;
        this.v_height = VIRTUAL_HEIGHT_PX;
        this.v_xstart = VIRTUAL_X_START_PX;
        this.v_ystart = this.v_height / 2 - pheight/2;
        this.v_radius = VIRTUAL_RADIUS_PX;

        this.ballVel_angle = (0.5 - Math.random()) * (Math.PI / 4); //angle is: -45 to 45 degrees
        this.ballVel_mag = BALL_INIT_SPEED;

        this.y_vect = this.ballVel_mag * Math.sin(this.ballVel_angle);
        this.x_vect = this.ballVel_mag * Math.cos(this.ballVel_angle);

        this.dynData = {
            'delta_t':0
        } 

        this.score = 0;

        this.scoreboard = {
            HUMAN:0,
            BOT:0
        }

        this.eventSubscribers = [];

        this.ballSpeedFactor = BALL_SPEED_FACTOR;


        this.human = new Player(false, this.dynData,"white", this.v_xstart, this.v_ystart, pwidth, pheight, HUMAN_MAXSPEED);
        this.human.vertVelocity = HUMAN_VERTICAL_VELOCITY;


        this.bot = new Player(true, this.dynData,"white", this.v_width - this.v_xstart - pwidth, this.v_ystart, pwidth, pheight, BOT_MAXSPEED);

        this.winscore = winscore;
        this.ball = new Ball(Math.floor(this.v_width / 2), Math.floor(this.v_height / 2), this.x_vect, this.y_vect, "white", this.dynData ,this.v_radius);


        this.bot.addCallback(
            /**
             * This function adjusts the bot players verical velocity
             * @param {Player} arg 
             */
            (arg) => {
                let bot_b = arg.position.y + arg.height;
                let bot_t = arg.position.y;
                let ball_y = this.ball.position.y;
                let bot_center = bot_t + arg.height/2;
                let hor_dist = arg.position.x - (this.ball.position.x + this.ball.radius);
                let ver_dist = arg.position.y - bot_center;

                let hor_ver_ratio = ver_dist / hor_dist;

                let inverse_speed_factor = this.v_width / (1 + Math.abs(hor_dist));

                let velocity = Math.sqrt(ver_dist*ver_dist + inverse_speed_factor**2)/256;

                let rangeOfPeace = 10;
                const RANGE_FACTOR = 1;


                if (ball_y > bot_b){
                    arg.ballWithinRange = false;
                    arg.vertVelocity = velocity;
                } else if (ball_y < bot_t){
                    arg.ballWithinRange = false;
                    arg.vertVelocity = -velocity;
                } else {
                    if (hor_dist >= 0 && hor_dist <= RANGE_FACTOR*arg.height)arg.ballWithinRange = true;
                    else arg.ballWithinRange = false;
                    if ((ball_y < bot_center + rangeOfPeace && ball_y > bot_center - rangeOfPeace)){
                        if (arg.ballWithinRange) arg.vertVelocity = 0;
                        else arg.vertVelocity = velocity /4;
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
                arg.vertVelocity = arg.ballWithinRange?(arg.vertVelocity + arg.acceleration) % (2*arg.maxSpeed):(arg.vertVelocity + arg.acceleration) % arg.maxSpeed;
                //console.log(`after: ${arg.vertVelocity}`);

                let delta_t = arg.dynData['delta_t'];

                if(!collisionCheck()){
                    //console.log("collider");
                    arg.position.y += this.botErrorEmulator.emulateError(arg.vertVelocity)*this.botErrorEmulator.emulateError(delta_t);
                } else {
                    if((arg.vertVelocity > 0 && arg.position.y <= 0) || (arg.vertVelocity < 0 && arg.position.y + arg.height >= this.v_height)){
                        arg.position.y += arg.vertVelocity * delta_t;
                    }
                }
            }
        );

        this.ball.addCallback(
            /**
             * @param {Ball} arg
             */
            (arg) =>{
                //console.log("ball collision check;");
                const bot = this.bot;
                const human = this.human;
                const collisionCheck = ()=>{
                    if(arg.position.x <= arg.radius) return BallCollisionState.HORIZONTAL_LEFT;
                    if(arg.position.x >= this.v_width - arg.radius) return BallCollisionState.HORIZONTAL_RIGHT;
                    if(arg.position.y <= arg.radius) return BallCollisionState.VERTICAL_TOP;
                    if(arg.position.y >= this.v_height - arg.radius) return BallCollisionState.VERTICAL_BOTTOM;
                    if((arg.position.x + arg.radius >= bot.position.x && arg.position.x <= bot.position.x) && (arg.position.y + arg.radius >= bot.position.y && arg.position.y - arg.radius  <= bot.position.y + bot.height) && arg.velocity.x >= 0) return BallCollisionState.PLAYER_RIGHT;
                    if((arg.position.x - arg.radius <= human.position.x + human.width && arg.position.x >= human.position.x + human.width ) && (arg.position.y + arg.radius >= human.position.y && arg.position.y - arg.radius  <= human.position.y + human.height) && arg.velocity.x <= 0) return BallCollisionState.PLAYER_LEFT;


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
                            arg.velocity.x = -arg.velocity.x;
                            arg.position.x = bot.position.x - (arg.radius + 1);
                            arg.velocity.increaseSpeed(this.ballSpeedFactor);   
                        break;
                    case BallCollisionState.PLAYER_LEFT:
                            arg.velocity.x = -arg.velocity.x;
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
            (arg)=>{
                const collisionCheck = ()=>{
                    if(arg.position.y <= 0) return HumanCollisionState.TOP;
                    if(arg.position.y + arg.height >= this.v_height) return HumanCollisionState.BOTTOM;
                    return HumanCollisionState.NONE;
                }

                let coll=collisionCheck()
                if (coll !== HumanCollisionState.NONE){
                    if (coll === HumanCollisionState.TOP) arg.position.y = 0;
                    if (coll === HumanCollisionState.BOTTOM) arg.position.y = this.v_height - arg.height;
                    if((coll === HumanCollisionState.TOP && arg.moveRequested === PendingMove.UP) || (coll === HumanCollisionState.BOTTOM && arg.moveRequested === PendingMove.DOWN)){
                        arg.moveRequested = PendingMove.NONE;
                        return;
                    }
                }

                if (arg.moveRequested === PendingMove.NONE ) return;

                let delta_t = arg.dynData['delta_t'];
                //console.log(delta_t)
                if (arg.moveRequested === PendingMove.UP) arg.position.y -= arg.vertVelocity*delta_t;
                else if (arg.moveRequested === PendingMove.DOWN) arg.position.y += arg.vertVelocity*delta_t;
                
            }
        );
        

        this.drawable = [this.ball, this.human, this.bot];
        this.movable = [this.ball];

        this.eventSubscribers.push({
            type:"keydown", "fun": (event)=>{
                if (this.state === GameStates.MENU) return;
                //console.log(event);
                if (event.code === 'ArrowUp'){
                    this.human.moveRequested = PendingMove.UP;
                }
                else if (event.code === 'ArrowDown'){
                    this.human.moveRequested = PendingMove.DOWN;
                }
            }
        },
        {
            type:"keyup", "fun": (event)=> {
                if (this.state === GameStates.MENU) return;
                this.human.moveRequested = PendingMove.NONE;
            }
        });


        this.state = GameStates.MENU;

    }

    updateScoreboard(humanscore, botscore){
        let score = Math.max(humanscore, botscore)
        if (score >= this.winscore){ 
            this.resetGame();
            return;
        }
        this.scoreboard.BOT = botscore;
        this.scoreboard.HUMAN = humanscore;
    }

    setGameState(newState){
        if(this.state === GameStates.MENU && newState === GameStates.PLAY){
            this.ball.pauseMovement(1000);
        }
        this.state = newState;
    }

    resetGame(){
        this.initBall();
        this.score = 0;
        this.scoreboard.BOT = 0; this.scoreboard.HUMAN = 0;
        this.state = GameStates.MENU;
    }

    initBall(){
        this.ballVel_angle = (0.5 - Math.random()) * (Math.PI / 4);
        this.ballVel_mag = BALL_INIT_SPEED;

        this.y_vect = this.ballVel_mag * Math.sin(this.ballVel_angle);
        this.x_vect = this.ballVel_mag * Math.cos(this.ballVel_angle);

        this.ball.position.x = Math.floor(this.v_width / 2);
        this.ball.position.y = Math.floor(this.v_height / 2);
        this.ball.velocity.x = this.x_vect;
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

    setDelta(delta){
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
        this.y_scale = settings.win_height / this.gamestate.v_width;


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

        this.gamestate.eventSubscribers.forEach(sub =>{
            this.canvas.addEventListener(sub.type, (event) => sub.fun(event));
        });
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

    renderMenu(){
        this.fillCanvas(this.settings.background_color);
        this.context.fillStyle = "white";
        this.context.font = "bold 52px serif";
        this.context.textAlign = "center";
        this.context.fillText("Press Any key to start the game!",this.gamestate.v_width / 2, this.gamestate.v_height / 2 );
    }

    renderScore(){
        this.context.fillStyle = "white";
        this.context.font = "bold 52px serif";
        this.context.textAlign = "center";
        this.context.textBaseline = 'top';
        let scoreboard = this.gamestate.scoreboard;
        this.context.fillText(`${scoreboard.HUMAN} : ${scoreboard.BOT}`, this.gamestate.v_width / 2, 20);
        this.context.textBaseline = 'alphabetic';
    }

    render() {
        
        if(this.gamestate.state === GameStates.MENU){
            if (this.menuEvent === null){
                const callback = () => this.gamestate.setGameState(GameStates.PLAY);
                function eventHandler(){
                    callback();
                }
                this.canvas.addEventListener('keydown', eventHandler);
                this.menuEvent = ()=>this.canvas.removeEventListener('keydown', eventHandler);
            }
            this.renderMenu();
            return;
        }
        
        if(this.menuEvent !== null) {
            this.menuEvent();
            this.menuEvent = null;
        }

        this.fillCanvas(this.settings.background_color);
        //console.log(this.gamestate.drawable);
        this.renderScore();
        this.gamestate.drawable.forEach(e => e.draw(this.context));
    }
}


const gamestate = new GameState(WINSCORE);
const renderer = new Renderer(gamestate);

const FRAME_TIME_MS = 0;

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
    if (gamestate.state !== GameStates.MENU){
        gamestate.callCBs();
        gamestate.moveObjects();
    }
    renderer.render();
    last_t = curr_t;
    //console.log(gamestate.state)
}, FRAME_TIME_MS);



