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
    
    updateAngle(){
        this.velocityAngle = Math.atan(this.y / this.x);
    }

    transform(matrix){
        super.transform(matrix);
        this.updateAngle();
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