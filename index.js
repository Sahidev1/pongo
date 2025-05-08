import { GameState } from "./GameState.js";
import { Renderer } from "./Renderer.js";
import { GameStates } from "./constants.js";
import { WINSCORE } from "./constants.js";

const gamestate = new GameState(WINSCORE, false);
const renderer = new Renderer(gamestate);

const FRAME_TIME_MS = 16;

renderer.initRender();
renderer.render();

let last_t = Date.now();
let curr_t = 0;
let delta_t = 0;

let pause = false;


const main0 = setInterval(() => {
    if (pause) return;
    curr_t = Date.now();
    gamestate.setDelta(curr_t - last_t);
    //console.log($1)
    if (gamestate.state !== GameStates.MENU) {
        gamestate.updateStates();
        gamestate.moveObjects();
    }
    renderer.render();
    last_t = curr_t;
    //console.log(gamestate.state)
}, FRAME_TIME_MS);

console.log(main0)



