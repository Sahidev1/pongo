import { Settings } from "./Settings.js";
import { ErrorEmulator } from "./ErrorEmulator.js";
import { Player } from "./Player.js";
import { Ball } from "./Ball.js";
import { PLAYER_HEIGTH_PX,
    PLAYER_WIDTH_PX,
    VIRTUAL_HEIGHT_PX,
    VIRTUAL_WIDTH_PX,
    VIRTUAL_RADIUS_PX,
    VIRTUAL_X_START_PX,
    BALL_INIT_SPEED, 
    BALL_SPEED_FACTOR,
    HUMAN_MAXSPEED,
    HUMAN_VERTICAL_VELOCITY,
    BOT_MAXSPEED,
    BOT_ERROR_SIZE,
    GameStates,
    PendingMove,
    PendingRotate
 } from "./constants.js";
import { Bot } from "./Bot.js";
import { Human } from "./Human.js";

export class GameState {
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


        this.human =  new Human(this.dynData, "white", this.v_xstart, this.v_ystart, pwidth, pheight, HUMAN_MAXSPEED);
        this.human.vertVelocity = HUMAN_VERTICAL_VELOCITY;


        this.bot = new Bot(this.dynData, "white", this.v_width - this.v_xstart - pwidth, this.v_ystart, pwidth, pheight, BOT_MAXSPEED);

        this.winscore = winscore;
        this.ball = new Ball(Math.floor(this.v_width / 2), Math.floor(this.v_height / 2), this.x_vect, this.y_vect, "white", this.dynData, this.v_radius);

        const dependency_jumble = {
            "BOT": this.bot,
            "HUMAN": this.human,
            "BALL":this.ball
        }

        console.log(this.bot)
        //making it so all 3 interdependent classes have access to each other

        const DEPSIG = "dependencies";
        this.bot[DEPSIG] = dependency_jumble;
        this.human[DEPSIG] = dependency_jumble;
        this.ball[DEPSIG] = dependency_jumble;

     

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

    updateScoreboard(humanScored, BotScored) {
        let humanscore = humanScored? this.scoreboard.HUMAN + 1: this.scoreboard.HUMAN;
        let botscore = BotScored? this.scoreboard.BOT + 1: this.scoreboard.BOT;

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
        this.ball.initBall();
        this.human.reset();
        this.bot.reset();
        this.score = 0;
        this.scoreboard.BOT = 0; this.scoreboard.HUMAN = 0;
        this.state = GameStates.MENU;
    }

    moveObjects() {
        this.movable.forEach(m => m.move());
    }

    updateStates() {
        this.bot.updateState();
        this.human.updateState();
        this.ball.updateState((humanScored, BotScored) => this.updateScoreboard(humanScored, BotScored));
    }

    setDelta(delta) {
        this.dynData.delta_t = delta;
    }

}