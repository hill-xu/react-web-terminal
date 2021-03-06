export type keyCodeMap = {
    moveUp: number;
    moveDown: number;
    shiftLeft: number;
    shiftRight: number;
    backspace: number;
    c: number;
    x: number;
    v: number;
    space: number;
    enter: number
}

export type xtermHandleMap = {
    xtermMoveUp: string;
    xtermMoveDown: string;
    xtermShiftLeft: string;
    xtermShiftRight: string;
    xtermBackspace: string;
    xtermSpace: string;
}

export type xtermHandleType = 'Insert' | 'Delete' | 'ShiftLeft' | 'ShiftRight' | 'Enter' | 'Paste'

export type returnCmdAndCurIndex = {
    cmd: string[];
    curIndex: number
}