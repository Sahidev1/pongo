import { GameState } from "./GameState.js";
import { Settings } from "./Settings.js";

import { GameStates } from "./constants.js";

export class Renderer {

    /**
     * 
     * @param {Settings} settings
     * @param {GameState} gamestate 
     */
    constructor(gamestate, settings = null) {
        if (settings == null) settings = Settings.getDefault();
        this.settings = settings;

        this.gamestate = gamestate;
        this.x_scale = settings.win_width / this.gamestate.v_width;
        this.y_scale = settings.win_height / this.gamestate.v_height;


        this.menuEvent = null;
    }

    initRender() {
        const settings = this.settings;

        this.container = document.getElementById(settings.canvas_container_id);

        this.container.innerHTML = `<canvas id="${settings.canvas_id}" height="${settings.win_height}" width="${settings.win_width}"> </canvas>`;
        this.canvas = document.getElementById(settings.canvas_id);
        /**
         * @type {CanvasRenderingContext2D}
         * @public
         */
        this.context = canvas.getContext("2d");
        this.context.scale(this.x_scale, this.y_scale);

        this.canvas.tabIndex = 1; // kind of a hack to be able to attach eventlisteners to canvas element

        this.gamestate.eventSubscribers.forEach(sub => {
            this.canvas.addEventListener(sub.type, (event) => sub.fun(event));
        });

        this.context.initTransform = this.context.getTransform();
    }


    /**
     * 
     * @returns {CanvasRenderingContext2D}
     */
    getContext() {
        return this.context;
    }

    /**
     * 
     * @param {string} color rgb-color
     */
    fillCanvas(color) {
        this.context.fillStyle = color;
        this.context.fillRect(0, 0, this.gamestate.v_width, this.gamestate.v_height);
    }

    renderMenu() {
        this.fillCanvas(this.settings.background_color);
        this.context.fillStyle = "white";
        this.context.font = "bold 52px serif";
        this.context.textAlign = "center";
        this.context.fillText("Press Any key to start the game!", this.gamestate.v_width / 2, this.gamestate.v_height / 2);
    }

    renderScore() {
        this.context.fillStyle = "white";
        this.context.font = "bold 52px serif";
        this.context.textAlign = "center";
        this.context.textBaseline = 'top';
        let scoreboard = this.gamestate.scoreboard;
        this.context.fillText(`${scoreboard.HUMAN} : ${scoreboard.BOT}`, this.gamestate.v_width / 2, 20);
        this.context.textBaseline = 'alphabetic';
    }

    render() {

        if (this.gamestate.state === GameStates.MENU) {
            if (this.menuEvent === null) {
                const callback = () => this.gamestate.setGameState(GameStates.PLAY);
                function eventHandler() {
                    callback();
                }
                this.canvas.addEventListener('keydown', eventHandler);
                this.menuEvent = () => this.canvas.removeEventListener('keydown', eventHandler);
            }
            this.renderMenu();
            return;
        }

        if (this.menuEvent !== null) {
            this.menuEvent();
            this.menuEvent = null;
        }

        this.fillCanvas(this.settings.background_color);
        //console.log(this.gamestate.drawable);
        this.renderScore();
        this.gamestate.drawable.forEach(e => e.draw(this.context, this.gamestate.vectorShow));
    }
}
