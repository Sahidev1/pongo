export const DEFAULT_SETTING_WIDTH = 768;
export const DEFAULT_SETTING_HEIGHT = 576;
export const DEFAULT_SETTING_X_START = 32;
export const DEFAULT_SETTING_Y_START = 32;
export const DEFAULT_SETTING_CANVAS_CONTAINER_ID = "canvas-container";
export const DEFAULT_SETTING_CANVAS_ID = "canvas";
export const DEFAULT_SETTING_BACKGROUND_COLOR = "black";

export const MAX_HUMAN_ROTATION = Math.PI / 8;

export const MAX_ROT_SPEED = (Math.PI / 180) / 10;

export const VIRTUAL_WIDTH_PX = 1024;
export const VIRTUAL_HEIGHT_PX = 768;
export const VIRTUAL_RADIUS_PX = 12;
export const VIRTUAL_X_START_PX = 32;

export const PLAYER_WIDTH_PX = 20;
export const PLAYER_HEIGTH_PX = 100;
export const HUMAN_MAXSPEED = 20;
export const BOT_MAXSPEED = 0.3;

export const HUMAN_VERTICAL_VELOCITY = 0.4;
export const INIT_PLAYER_VERTITCAL_VELOCITY = 0;
export const INIT_PLAYER_ACCELERATION = 0;
export const INIT_PLAYER_VELOCITY_INCREMENT_FACTOR = 8;
export const BALL_DEFAULT_RADIUS_PX = 64;
export const BALL_INIT_SPEED = 0.37;
export const BALL_SPEED_FACTOR = 1.03;
export const WINSCORE = 4;
export const BOT_ERROR_SIZE = 0.9;
export const BOT_MIN_ERROR_SIZE = 0;


export const BallCollisionState = {
    NONE: 0,
    VERTICAL_TOP: 1,
    VERTICAL_BOTTOM: 2,
    HORIZONTAL_LEFT: 3,
    HORIZONTAL_RIGHT: 4,
    PLAYER_RIGHT: 5,
    PLAYER_LEFT: 6
}

export const HumanCollisionState = {
    "NONE": 0,
    "TOP": 1,
    "BOTTOM": 2
}

export const PendingMove = {
    'NONE': 0,
    'UP': 1,
    'DOWN': 2
}

export const PendingRotate = {
    'NONE': 0,
    'CLOCKWISE': 1,
    'COUNTER': 2
}

export const GameStates = {
    MENU: 'MENU',
    PLAY: 'PLAY'
}
