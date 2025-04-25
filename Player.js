import { Vector } from "./Vector.js";
import { drawRotatedRect, drawLinkingVect } from "./utils.js";

import { INIT_PLAYER_ACCELERATION, INIT_PLAYER_VELOCITY_INCREMENT_FACTOR, INIT_PLAYER_VERTITCAL_VELOCITY, PendingRotate } from "./constants.js";

export class Player {

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


}
