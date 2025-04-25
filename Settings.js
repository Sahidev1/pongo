
import * as constants from "./constants.js";

/**
 * Settings class
 */
export class Settings {

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
        return new Settings(constants.DEFAULT_SETTING_WIDTH,
             constants.DEFAULT_SETTING_HEIGHT, 
             constants.DEFAULT_SETTING_X_START, 
             constants.DEFAULT_SETTING_Y_START, 
             constants.DEFAULT_SETTING_CANVAS_CONTAINER_ID, 
             constants.DEFAULT_SETTING_CANVAS_ID, 
             constants.DEFAULT_SETTING_BACKGROUND_COLOR);
    }
}