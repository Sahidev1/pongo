import { Vector } from "./Vector.js";

export class VelocityVector extends Vector {

    constructor(x, y) {
        super(x, y);
        this.velocityAngle = Math.atan(this.y / this.x);
        this.speed = Math.sqrt(this.x ** 2 + this.y ** 2);

        //console.log([x, y]);
        //console.log(this.velocityAngle);
        //console.log(this.speed);
    }
    
    updateVelocityVector(){
        let r = Math.sqrt(this.x**2 + this.y**2);
        this.x = Math.cos(this.velocityAngle)*r;
        this.y = Math.sin(this.velocityAngle)*r;
        //this.scale(this.speed);
 
    }

    updateAngle(){
        this.velocityAngle = Math.atan(this.y / this.x);
    }

    transform(matrix){
        super.transform(matrix);
        this.updateAngle();
    }

    increaseSpeed(factor) {
        this.speed *= factor;
        this.scale(factor);

        //console.log([this.x, this.y]);
        //console.log(this.velocityAngle);
        //console.log(this.speed);
    }


}