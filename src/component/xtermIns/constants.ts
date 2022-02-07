import { keyCodeMap, xtermHandleMap } from './index.d'
export const KEY_CODE_MAP: keyCodeMap = {
    moveUp: 38,
    moveDown: 40,
    shiftLeft: 37,
    shiftRight: 39,
    backspace: 8,
    c: 67,
    v: 86,
    x: 88,
    space: 32,
    enter: 13
}

export const XTERM_KEY_MAP: xtermHandleMap = {
    xtermMoveUp: '\x1B[A',
    xtermMoveDown: '\x1B[B',
    xtermShiftLeft: '\x1B[D',
    xtermBackspace: '\b \b',
    xtermShiftRight: '\x1B[C',
    xtermSpace: ' '
}
