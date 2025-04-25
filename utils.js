import { Vector } from "./Vector.js";
import { VelocityVector } from "./VelocityVector.js";


/**
 * Function to draw a rectangle at [x,y] that is rotated about its origin angle degrees
 * @param {CanvasRenderingContext2D} context 
 * @param {number} x 
 * @param {number} y 
 * @param {number} width 
 * @param {number} heigth 
 * @param {number} angle Radians
 * @param {string} fillStyle 
 */
export function drawRotatedRect(context, x, y, width, heigth, angle, fillStyle) {
    context.save();

    context.translate(x + width / 2, y + heigth / 2);

    context.rotate(angle % Math.PI);

    context.fillStyle = fillStyle;
    context.fillRect(-width / 2, -heigth / 2, width, heigth);

    context.restore();
}


/**
* Draws a line with an arrowhead at the end.
* @param {CanvasRenderingContext2D} context
* @param {*} x0
* @param {*} y0
* @param {*} x1
* @param {*} y1
*/
export function drawLinkingVect(context, x0, y0, x1, y1, col = "red") {
    context.save();

    context.beginPath();
    context.strokeStyle = col;
    context.lineWidth = 4;
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();

    // Draw arrowhead
    const arrowSize = 10; // Size of the arrowhead
    const angle = Math.atan2(y1 - y0, x1 - x0); // Angle of the line
    const arrowAngle = Math.PI / 6; // Angle of the arrowhead from the line

    // Calculate the two points of the arrowhead
    const xArrow1 = x1 - arrowSize * Math.cos(angle - arrowAngle);
    const yArrow1 = y1 - arrowSize * Math.sin(angle - arrowAngle);

    const xArrow2 = x1 - arrowSize * Math.cos(angle + arrowAngle);
    const yArrow2 = y1 - arrowSize * Math.sin(angle + arrowAngle);

    // Draw the arrowhead
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(xArrow1, yArrow1);
    context.moveTo(x1, y1);
    context.lineTo(xArrow2, yArrow2);
    context.stroke();

    context.restore();
}

/**
 * 
 * @param {CanvasRenderingContext2D} context 
 */
export function drawVect(context, x, y, w, h, color = "red") {
    context.save();
    context.strokeStyle = color;
    context.strokeRect(x, y, w, h);
    context.restore();
}




/**
 * 
 * @param {VelocityVector} velVector 
 * @param {number} surfAngle 
 * @param {boolean} toLeft
 */
export function bounceAngle(velVector, surfAngle, toLeft = true) {
    let xMirrorTransform = [-1, 0, 0, 1];
    if (surfAngle === 0) {
        velVector.transform(xMirrorTransform);
        return;
    }
    const X = new Vector(1, 0);
    const Y = new Vector(0, 1);
    X.rotate(-surfAngle);
    Y.rotate(-surfAngle);
    let transformer = [X.x, X.y, Y.x, Y.y]

    velVector.transform(transformer);
    velVector.transform(xMirrorTransform);
}


/**
 * This function checks for collision between paddle rotated about its center and other objects.
 * @param {Vector} rectVect vector to virtual non-rotated rectangle 
 * @param {Vector} vect vector to thing collision check with
 * @param {number} w 
 * @param {number} h 
 * @param {number} angle 
 */
export function collCheckRect(rectVect, vect, w, h, angle, collMargin, leftcheck = true) {
    const X = new Vector(w / 2, 0);
    const Y = new Vector(0, h / 2);

    X.rotate(angle); // basis vector x
    Y.rotate(angle); // basic vector y

    const rectOrigin = new Vector(rectVect.x + w / 2, rectVect.y + h / 2);

    let u = X.vectorAdd(Y);
    let collCheckVect = rectOrigin.vectorDiff(u);

    X.scale(2);
    Y.scale(2);

    let relVect = vect.vectorDiff(collCheckVect);

    let delta_x = X.projectVector(relVect);
    let delta_y = Y.projectVector(relVect);

    let delta_x_size = delta_x.absolute();
    let delta_y_size = delta_y.absolute();

    let delta_x_dot = delta_x.dotProduct(X);
    let delta_y_dot = delta_y.dotProduct(Y);

    let angle_condition = delta_x_dot >= 0 && delta_y_dot >= 0;
    let delta_x_cond = delta_x_size >= w - collMargin && delta_x_size <= w + collMargin;
    let delta_y_cond = delta_y_size >= -collMargin && delta_y_size <= h + collMargin;

    if (leftcheck) return angle_condition && delta_x_cond && delta_y_cond;

    angle_condition = delta_x_dot <= 0 && delta_y_dot >= 0;
    delta_x_cond = delta_x_size >= 0 && delta_x_size <= collMargin;
    return angle_condition && delta_x_cond && delta_y_cond;
}
