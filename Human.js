
import { Player } from "./Player.js";
import { PendingMove, PendingRotate, MAX_ROT_SPEED, MAX_HUMAN_ROTATION, HumanCollisionState, VIRTUAL_HEIGHT_PX } from "./constants.js";

export class Human extends Player{

    constructor(dynData, color = "green", x = 0, y = 0, width, height, maxSpeed){
        super(false, dynData, color, x, y, width, height, maxSpeed);
    }

    updateState(){
        let delta_t = this.dynData['delta_t'];

        if (this.rotRequested === PendingRotate.COUNTER && this.rotation < MAX_HUMAN_ROTATION){
            this.rotation += MAX_ROT_SPEED * delta_t; 
        }
        if (this.rotRequested === PendingRotate.CLOCKWISE && this.rotation > -MAX_HUMAN_ROTATION){
            this.rotation -= MAX_ROT_SPEED * delta_t; 
        }
        

        const collisionCheck = () => {
            if (this.position.y <= 0) return HumanCollisionState.TOP;
            if (this.position.y + this.height >= VIRTUAL_HEIGHT_PX) return HumanCollisionState.BOTTOM;
            return HumanCollisionState.NONE;
        }

        let coll = collisionCheck()
        if (coll !== HumanCollisionState.NONE) {
            if (coll === HumanCollisionState.TOP) this.position.y = 0;
            if (coll === HumanCollisionState.BOTTOM) this.position.y = VIRTUAL_HEIGHT_PX - this.height;
            if ((coll === HumanCollisionState.TOP && this.moveRequested === PendingMove.UP) || (coll === HumanCollisionState.BOTTOM && this.moveRequested === PendingMove.DOWN)) {
                this.moveRequested = PendingMove.NONE;
                return;
            }
        }

        if (this.moveRequested === PendingMove.NONE) return;


        //console.log(delta_t)
        if (this.moveRequested === PendingMove.UP) this.position.y -= this.vertVelocity * delta_t;
        else if (this.moveRequested === PendingMove.DOWN) this.position.y += this.vertVelocity * delta_t;

    }
}