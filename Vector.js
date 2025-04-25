
export class Vector {
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