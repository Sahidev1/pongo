
const DEFAULT_SETTING_WIDTH = 512;
const DEFAULT_SETTING_HEIGHT = 512;
const DEFAULT_SETTING_X_START = 32;
const DEFAULT_SETTING_Y_START = 32;
const DEFAULT_SETTING_CANVAS_CONTAINER_ID = "canvas-container";
const DEFAULT_SETTING_CANVAS_ID = "canvas";
const DEFAULT_SETTING_BACKGROUND_COLOR = "black";

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



class Player {

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {boolean} isBot
     */
    constructor(isBot, color = "green", x = 0, y = 0, width, height, maxSpeed) {
        this.position = new Vector(x, y);
        this.score = 0;
        this.isBot = isBot;
        this.color = color;
        this.width = width;
        this.height = height;
        this.callbacks = [];
        this.vertVelocity = 0;
        this.acceleration = 0;
        this.velocityIncrements = 0;
        this.velocityIncrementFactor = 8;
        this.maxSpeed = maxSpeed;
        this.ballWithinRange = false;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     */
    draw(context) {
        context.fillStyle = this.color;
        //console.log(this.color);
        context.fillRect(this.position.x, this.position.y, 20, 80);
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

    constructor(x, y, xv, yv, color, radius = 64) {
        this.position = new Vector(x, y);
        this.velocity = new Vector(xv, yv);
        this.radius = radius;
        this.color = color;
        this.callbacks = [];


    }

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     */
    draw(context) {
        //console.log("drawing ball");
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
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


    /**
     * 
     */
    move() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class GameState {

    /**
     * 
     * @param {Settings} settings 
     */
    constructor(winscore) {
        this.v_width = 1024;
        this.v_height = 1024;
        this.v_xstart = 32;
        this.v_ystart = 32;
        this.v_radius = 16;
        this.y_vect = Math.floor(Math.random() * 4);
        this.x_vect = this.y_vect + 1 + Math.floor(Math.random() * 4);

        this.eventSubscribers = [];

        let pheight = 80;
        let pwidth = 20;
        this.human = new Player(false, "white", this.v_xstart, this.v_ystart, pwidth, pheight, 20);
        this.bot = new Player(true, "white", this.v_width - this.v_xstart - pwidth, this.v_ystart, pwidth, pheight, 40);

        this.winscore = winscore;
        this.ball = new Ball(Math.floor(this.v_width / 2), Math.floor(this.v_height / 2), this.x_vect, this.y_vect, "white", this.v_radius);


        this.bot.addCallback(
            /**
             * 
             * @param {Player} arg 
             */
            (arg) => {
                /*const ball = this.ball;
                let bot_ycenter = this.bot.position.x - this.bot.height >> 1;

                let d_x = arg.position.x - ball.position.x;
                let t_reach = d_x / ball.velocity.x;

                function distTraveled(a, t) {
                    return (a * t * t) >> 1;
                }

                let needTravel = ball.velocity.y * t_reach;

                let projTravel = distTraveled(arg.acceleration, t_reach);

                if (projTravel < needTravel) arg.acceleration++;
                else arg.acceleration--;
                */
1

                let bot_b = arg.position.y + arg.height;
                let bot_t = arg.position.y;
                let ball_y = this.ball.position.y;
                let bot_center = bot_t + arg.height/2;
                let hor_dist = arg.position.x - (this.ball.position.x + this.ball.radius);

                //console.log(bot_t);
                //console.log(bot_b);
                //console.log(ball_y);
            

                if (ball_y > bot_b){
                    arg.ballWithinRange = false;
                    arg.acceleration = 1;
                } else if (ball_y < bot_t){
                    arg.ballWithinRange = false;
                    arg.acceleration = -1;
                } else {
                    if (hor_dist >= 0 && hor_dist <= 3*arg.height)arg.ballWithinRange = true;
                    else arg.ballWithinRange = false;
                    if (ball_y > bot_center) arg.acceleration = 1;
                    if (ball_y < bot_center) arg.acceleration = -1;
                }
                //console.log(arg.acceleration);
                //console.log(arg.vertVelocity)

            });

        this.bot.addCallback(
            /**
             * 
             * @param {Player} arg 
             */
            (arg) => {
                //console.log(arg.acceleration);
                //console.log(arg.position);

                const collisionCheck = () => {
                    if (arg.position.y <= 0 || arg.position.y + arg.height >= this.v_height) return true;
                    return false;
                }

                arg.vertVelocity = arg.ballWithinRange?(arg.vertVelocity + arg.acceleration) % 5:(arg.vertVelocity + arg.acceleration) % arg.maxSpeed;

                if(!collisionCheck()){
                    //console.log("collider");
                    arg.position.y += arg.vertVelocity;
                } else {
                    if((arg.vertVelocity > 0 && arg.position.y <= 0) || (arg.vertVelocity < 0 && arg.position.y + arg.height >= this.v_height)){
                        arg.position.y += arg.vertVelocity;
                    }
                }
            }
        );

        this.ball.addCallback(
            /**
             * @param {Ball} arg
             */
            (arg) =>{
                const collState = {
                    NONE:0,
                    VERTICAL_TOP:1,
                    VERTICAL_BOTTOM:2,
                    HORIZONTAL_LEFT:3,
                    HORIZONTAL_RIGHT:4,
                    PLAYER_RIGHT:5,
                    PLAYER_LEFT:6
                }


                //console.log("ball collision check;");
                const bot = this.bot;
                const human = this.human;
                const collisionCheck = ()=>{
                    if(arg.position.x <= arg.radius) return collState.HORIZONTAL_LEFT;
                    if(arg.position.x >= this.v_width - arg.radius) return collState.HORIZONTAL_RIGHT;
                    if(arg.position.y <= arg.radius) return collState.VERTICAL_TOP;
                    if(arg.position.y >= this.v_height - arg.radius) return collState.VERTICAL_BOTTOM;
                    if((arg.position.x + arg.radius >= bot.position.x && arg.position.x <= bot.position.x) && (arg.position.y + arg.radius >= bot.position.y && arg.position.y - arg.radius  <= bot.position.y + bot.height) && arg.velocity.x >= 0) return collState.PLAYER_RIGHT;
                    if((arg.position.x - arg.radius <= human.position.x + human.width && arg.position.x >= human.position.x + human.width ) && (arg.position.y + arg.radius >= human.position.y && arg.position.y - arg.radius  <= human.position.y + human.height) && arg.velocity.x <= 0) return collState.PLAYER_LEFT;


                    return collState.NONE;                    
                }

                const collCheck = collisionCheck();
                switch (collCheck) {
                    case collState.HORIZONTAL_LEFT:
                            arg.velocity.x = -arg.velocity.x;
                            arg.position.x = arg.radius + 1;
                        break;
                    case collState.HORIZONTAL_RIGHT:
                            arg.velocity.x = -arg.velocity.x;
                            arg.position.x = this.v_width - (arg.radius + 1);
                        break;
                    case collState.VERTICAL_BOTTOM:
                            arg.velocity.y = -arg.velocity.y;
                            arg.position.y = this.v_height - (arg.radius + 1);
                        break;
                    case collState.VERTICAL_TOP:
                            arg.velocity.y = -arg.velocity.y;
                            arg.position.y = arg.radius + 1;
                        break;
                    case collState.PLAYER_RIGHT:
                            arg.velocity.x = -arg.velocity.x;
                            arg.position.x = bot.position.x - (arg.radius + 1);
                            if(bot.vertVelocity > 2) arg.velocity.y--;
                            if(bot.vertVelocity < 2) arg.velocity.y++;
                        break;
                    case collState.PLAYER_LEFT:
                            arg.velocity.x = -arg.velocity.x;
                            arg.position.x = human.position.x + human.width + (arg.radius + 1); 
                        break;
                    default:
                        break;
                }

                //console.log(arg.velocity);
               
            }
        )

   

        this.drawable = [this.ball, this.human, this.bot];
        this.movable = [this.ball];
        this.eventSubscribers.push({
            type:"keydown", "fun": (event)=>{
                console.log(event);
                if (event.code === 'ArrowUp'){
                    this.human.position.y -= 40;
                }
                else if (event.code === 'ArrowDown'){
                    this.human.position.y += 40;
                }
            
                
            }
        });

    }

    moveObjects() {
        this.movable.forEach(m => m.move());
    }

    callCBs() {
        this.drawable.filter(e => e.callCBs !== undefined)
            .forEach(e => e.callCBs());
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

        this.canvas.tabIndex = 1;

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


    render() {
        this.fillCanvas(this.settings.background_color);
        //console.log(this.gamestate.drawable);
        this.gamestate.drawable.forEach(e => e.draw(this.context));
    }
}


const gamestate = new GameState(10);
const renderer = new Renderer(gamestate);


renderer.initRender();
renderer.render();


const main0 = setInterval(() => {
    gamestate.callCBs();
    gamestate.moveObjects();
    renderer.render();
}, 16);



