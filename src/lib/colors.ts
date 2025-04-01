const hexStr = (color: number): string =>
  '#' + (color >>> 0).toString(16).padStart(6, '0');

export const WHITE = 0xffffff;
export const WHITE_HEX_STR = hexStr(WHITE);

export const BLACK = 0x000000;
export const BLACK_HEX_STR = hexStr(BLACK);

export const RED = 0xff0000;
export const RED_HEX_STR = hexStr(RED);

export const ORANGE = 0xff9800;
export const ORANGE_HEX_STR = hexStr(ORANGE);

export const YELLOW = 0xffff00;
export const YELLOW_HEX_STR = hexStr(YELLOW);

export const LIME_GREEN = 0x00ff00;
export const LIME_GREEN_HEX_STR = hexStr(LIME_GREEN);

export const GREEN = 0x4caf50;
export const GREEN_HEX_STR = hexStr(GREEN);

export const SKY_BLUE = 0x87ceeb;
export const SKY_BLUE_HEX_STR = hexStr(SKY_BLUE);

export const LIGHT_STEEL_BLUE = 0xb0c4de;
export const LIGHT_STEEL_BLUE_HEX_STR = hexStr(LIGHT_STEEL_BLUE);

export const BLUE = 0x3498db;
export const BLUE_HEX_STR = hexStr(BLUE);

export const DARK_BLUE = 0x00008b;
export const DARK_BLUE_HEX_STR = hexStr(DARK_BLUE);

export const PURPLE = 0x612ad5;
export const PURPLE_HEX_STR = hexStr(PURPLE);

// Grays ordered light to dark
export const GRAY_1 = 0xc3c3c3;
export const GRAY_1_HEX_STR = hexStr(GRAY_1);

export const GRAY_2 = 0x909090;
export const GRAY_2_HEX_STR = hexStr(GRAY_2);

export const GRAY_3 = 0x808080;
export const GRAY_3_HEX_STR = hexStr(GRAY_3);

export const GRAY_4 = 0x2f3437;
export const GRAY_4_HEX_STR = hexStr(GRAY_4);

// Service Specific Colors
export const SERVICE_NODEJS = 0x68a063;
export const SERVICE_NODEJS_HEX_STR = hexStr(SERVICE_NODEJS);

export const SERVICE_POSTGRES = 0x336791;
export const SERVICE_POSTGRES_HEX_STR = hexStr(SERVICE_POSTGRES);

export const SERVICE_REDIS = 0xd82c20;
export const SERVICE_REDIS_HEX_STR = hexStr(SERVICE_REDIS);

export const SERVICE_POSTIZ = PURPLE;
export const SERVICE_POSTIZ_HEX_STR = hexStr(SERVICE_POSTIZ);
