
import { Player } from "./Player.js";
import { ErrorEmulator } from "./ErrorEmulator.js";
import { VIRTUAL_HEIGHT_PX, BOT_ERROR_SIZE, VIRTUAL_WIDTH_PX } from "./constants.js";


export class Bot extends Player{

    constructor(dynData, color = "green", x = 0, y = 0, width, height, maxSpeed){
        super(true, dynData, color,x, y, width, height, maxSpeed)
        this.botErrorEmulator = new ErrorEmulator(BOT_ERROR_SIZE);
        
    }

    updateState(){
        this.#adjustVerticalVelocity();
        this.#move();
    }

    #move(){
        const collisionCheck = () => {
            if (this.position.y <= 0 || this.position.y + this.height >= VIRTUAL_HEIGHT_PX) return true;
            return false;
        }

        //console.log(`before: ${this.vertVelocity}`);
        //this.vertVelocity = this.ballWithinRange ? (this.vertVelocity + this.acceleration) % (2 * this.maxSpeed) : (this.vertVelocity + this.acceleration) % this.maxSpeed;
        //console.log(`after: ${this.vertVelocity}`);

        let delta_t = this.dynData['delta_t'];

        if (!collisionCheck()) {
            //console.log("collider");
            this.position.y += this.botErrorEmulator.emulateError(this.vertVelocity) * this.botErrorEmulator.emulateError(delta_t);
        } else {
            if ((this.vertVelocity > 0 && this.position.y <= 0) || (this.vertVelocity < 0 && this.position.y + this.height >= VIRTUAL_HEIGHT_PX)) {
                this.position.y += this.vertVelocity * delta_t;
            }
        }

    }

    #adjustVerticalVelocity(){
        let ball = this.dependencies.BALL;


        let bot_b = this.position.y + this.height;
        let bot_t = this.position.y;
        let ball_y = ball.position.y;
        let bot_center = bot_t + this.height / 2;
        let hor_dist = this.position.x - (ball.position.x + ball.radius);
        let ver_dist = this.position.y - bot_center;
        let ball_angle = Math.abs(ball.velocity.velocityAngle);
        let hor_ver_ratio = ver_dist / hor_dist;
        console.log(ball_angle)
        let inverse_speed_factor = VIRTUAL_WIDTH_PX / (1 + Math.abs(hor_dist));

        let velocity = Math.sqrt(3*ver_dist**2 + inverse_speed_factor ** 2)/256;

        let rangeOfPeace = this.height / 4;
        const RANGE_FACTOR = 1;


        if (ball_y > bot_b) {
            this.ballWithinRange = false;
            this.vertVelocity = velocity;
        } else if (ball_y < bot_t) {
            this.ballWithinRange = false;
            this.vertVelocity = -velocity;
        } else {
            if (hor_dist >= 0 && hor_dist <= RANGE_FACTOR * this.height) this.ballWithinRange = true;
            else this.ballWithinRange = false;
            
            if ((ball_y < bot_center + rangeOfPeace && ball_y > bot_center - rangeOfPeace)) {
                if (this.ballWithinRange) this.vertVelocity = 0;
                else this.vertVelocity = velocity / 4;
            }
        }

        // add error to velocity

    }
}