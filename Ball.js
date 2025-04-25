import { Vector } from "./Vector.js";
import { VelocityVector } from "./VelocityVector.js";
import { drawLinkingVect, bounceAngle, collCheckRect } from "./utils.js";
import { BALL_INIT_SPEED, BallCollisionState, VIRTUAL_WIDTH_PX, VIRTUAL_HEIGHT_PX, BALL_SPEED_FACTOR } from "./constants.js";


export class Ball {
    constructor(x, y, xv, yv, color, dynData, radius = BALL_DEFAULT_RADIUS_PX) {
        this.position = new Vector(x, y);
        this.velocity = new VelocityVector(xv, yv);
        this.radius = radius;
        this.color = color;
        this.callbacks = [];
        this.dynData = dynData;
        this.canMove = true;
    }


    updateState(updateScoreboard){
        const bot = this.dependencies.BOT;
        const human = this.dependencies.HUMAN;
        const collisionCheck = () => {
            if (this.position.x <= this.radius) return BallCollisionState.HORIZONTAL_LEFT;
            if (this.position.x >= VIRTUAL_WIDTH_PX - this.radius) return BallCollisionState.HORIZONTAL_RIGHT;
            if (this.position.y <= this.radius) return BallCollisionState.VERTICAL_TOP;
            if (this.position.y >= VIRTUAL_HEIGHT_PX - this.radius) return BallCollisionState.VERTICAL_BOTTOM;

            if (this.velocity.x >= 0 && collCheckRect(bot.position, this.position, bot.width, bot.height, bot.rotation, this.radius, false)) {
                console.log("player right collision")
                return BallCollisionState.PLAYER_RIGHT;
            }
            if (this.velocity.x < 0 && collCheckRect(human.position, this.position, human.width, human.height, human.rotation, this.radius, true)) return BallCollisionState.PLAYER_LEFT;


            return BallCollisionState.NONE;
        }

        const collCheck = collisionCheck();
        switch (collCheck) {
            case BallCollisionState.HORIZONTAL_LEFT:
                updateScoreboard(false, true);
                this.initBall();
                //this.velocity.x = -this.velocity.x;
                //this.position.x = this.radius + 1;
                break;
            case BallCollisionState.HORIZONTAL_RIGHT:
                updateScoreboard(true, false);
                this.initBall();
                //this.velocity.x = -this.velocity.x;
                //this.position.x = VIRTUAL_WIDTH_PX - (this.radius + 1);
                break;
            case BallCollisionState.VERTICAL_BOTTOM:
                this.velocity.y = -this.velocity.y;
                this.position.y = VIRTUAL_HEIGHT_PX - (this.radius + 1);
                this.velocity.updateAngle();
                break;
            case BallCollisionState.VERTICAL_TOP:
                this.velocity.y = -this.velocity.y;
                this.position.y = this.radius + 1;
                this.velocity.updateAngle();
                break;
            case BallCollisionState.PLAYER_RIGHT:
                bounceAngle(this.velocity, bot.rotation, false);
                this.position.x = bot.position.x - (this.radius + 1);
                this.velocity.increaseSpeed(BALL_SPEED_FACTOR);
                break;
            case BallCollisionState.PLAYER_LEFT:
                bounceAngle(this.velocity, human.rotation, true);
                this.position.x = human.position.x + human.width + (this.radius + 1);
                this.velocity.increaseSpeed(BALL_SPEED_FACTOR);
                break;
            default:
                break;
        }

    }

    initBall() {
        let ballVel_angle = (0.5 - Math.random()) * (Math.PI / 4);
        let ballVel_mag = BALL_INIT_SPEED;

        let y_vect = ballVel_mag * Math.sin(ballVel_angle);
        let x_vect = ballVel_mag * Math.cos(ballVel_angle);

        this.position.x = Math.floor(VIRTUAL_WIDTH_PX / 2);
        this.position.y = Math.floor(VIRTUAL_HEIGHT_PX / 2);
        this.velocity.x = Math.round(Math.random()) === 0?x_vect:-x_vect;
        this.velocity.y = y_vect;

        this.pauseMovement(700);
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