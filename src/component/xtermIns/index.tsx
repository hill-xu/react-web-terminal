
import React, { useEffect } from 'react';
import './style.css';
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import 'xterm/lib/xterm'
import { KEY_CODE_MAP, XTERM_KEY_MAP } from './constants'
import { xtermHandleType, returnCmdAndCurIndex } from './index.d'
function XtemIns() {
  const initXtrem = () => {
    const xtermIns: Terminal = new Terminal({
      rendererType: 'canvas', // 渲染类型
      convertEol: true, // 启用是，光标设置为下一行的开头
      disableStdin: false, // 禁用输入
      cursorStyle: 'block', // 光标样式
      cursorBlink: true, // 光标闪烁
      theme: {
        foreground: '#7e9192',
        background: '#002833',
        cursor: 'help'
      }
    });
    xtermIns.open(document.getElementById('xtermIns'));
    const fitAddon = new FitAddon();
    xtermIns.loadAddon(fitAddon);
    fitAddon.fit();

    // 添加onresize
    window.addEventListener('resize', () => {
      if (typeof fitAddon.fit === 'function') {
        fitAddon.fit()
      }
    })

    // 获取xterm键盘输入
    // 换行问题
    // 中间插入问题
    let cmd: string[] = []; // 操作数组
    let curIndex: number = 0; // 光标所在位置
    let handleType: xtermHandleType = 'Insert'; // 操作状态
    let disabledHandle: boolean = false; // 操作状态禁用

    // 
    xtermIns.onData((data: string) => {
      if (disabledHandle) {
        return 
      }
      let result: returnCmdAndCurIndex = null
      switch(handleType) {
        case 'Insert' :
          result = xtermHandleInsert(xtermIns, cmd, curIndex, data)
          break;
        case 'ShiftLeft' :
          result = xtermHandleShiftLeft(xtermIns, cmd, curIndex, data)
          break;
        case 'ShiftRight' :
          result = xtermHandleShiftRight(xtermIns, cmd, curIndex, data)
          break;
        case 'Delete' :
          result = xtermHandleDelete(xtermIns, cmd, curIndex, data)
          break;
        case 'Paste' : 
          result = xtermHandlePaste(xtermIns, cmd, curIndex, data)
          break;
        case 'Enter' :
          xtermIns.write(`\r\n$ `)
          result = {
            cmd: [],
            curIndex: 0
          }
          break
      }
      cmd = result.cmd
      curIndex = result.curIndex
    })

    // 组合键处理
    xtermIns.attachCustomKeyEventHandler((e) => {
      const { 
        type, 
        metaKey, // mac command
        ctrlKey, // window ctrl
        keyCode
      } = e
      const { v } = KEY_CODE_MAP
      if (type === 'keydown') {
        handleType = 'Insert'
        // 复制粘贴逻辑
        if (metaKey || ctrlKey) {
          if (keyCode === v) {  
            // 粘贴
            handleType = 'Paste'
          }
        }
      }
      return true
    })

    xtermIns.onKey(({key, domEvent}) => {
      disabledHandle = false
      const { keyCode } = domEvent;
      const { moveDown, moveUp, shiftLeft, shiftRight, backspace, enter } = KEY_CODE_MAP;
      // 正常情况下禁用上移下移
      const disabledKey = [moveDown, moveUp]; 
      if (disabledKey.includes(keyCode)) {
        disabledHandle = true
        return
      }

      // 右移边界处理
      if (keyCode === shiftRight && curIndex === getTextByteLength(cmd.join(''))) {
        disabledHandle = true
        return
      }

      // 左移边界处理
      if (keyCode === shiftLeft && curIndex === 0) {
        disabledHandle = true
        return 
      }

      // 针对不同的keyCode做相应的操作
      switch(keyCode) {
        // 回车操作
        case enter :
          handleType = 'Enter'
          break;
        // 删除操作
        case backspace : 
          handleType = 'Delete'
          break;
        // 左移
        case shiftLeft : 
          handleType = 'ShiftLeft'
          break;
        // 右移动
        case shiftRight : 
          handleType = 'ShiftRight'
          break;
        default :
          handleType = 'Insert'
          break;
      }
    })
    xtermIns.writeln('\x1b[1;1;32mwellcom to web terminal!\x1b[0m')
    xtermIns.write(`\r\n$ `)
  }

  // 是否包含中文
  const isIncludesChineseCharacters = (text: string): boolean => {
    return /[^\u0000-\u00ff]/g.test(text)
  }

  // 获取字节长度
  const getTextByteLength = (text: string): number => {
    return text.replace(/[^\u0000-\u00ff]/g, "aa").length
  }

  // 删除文字
  const xtermInsDelText = (xtermIns: Terminal, offset: number) => {
    const { xtermBackspace } = XTERM_KEY_MAP
    xtermIns.write(new Array(offset).fill('').map(item => xtermBackspace).join(''))
  }

  // 移动光标位置
  const xtermInsCursorMove = (xtermIns: Terminal, type: 'toLeft' | 'toRight', offset: number) => {
    const { xtermShiftLeft, xtermShiftRight} = XTERM_KEY_MAP
    if (type === 'toLeft') {
      xtermIns.write(new Array(offset).fill('').map(item => xtermShiftLeft).join(''))
    } else {
      xtermIns.write(new Array(offset).fill('').map(item => xtermShiftRight).join(''))
    } 
  }

  // 获取curIndex之后的文本
  const getTextArrAfterCurIndex = (cmd: string[], curIndex: number) => {
    return cmd.slice(curIndex)
  }
  // 维护curIndex 
  const getCurIndex = (oldCurIndex: number, offset: number) => {
    return oldCurIndex + offset
  }

  // 添加文字
  const xtermInsAddText = (xtermIns: Terminal, text: string) => {
    if (xtermIns) {
      xtermIns.write(text)
    }
  }

  // 插入内容
  const xtermHandleInsert = (xtermIns: Terminal, cmd: string[], curIndex: number, text: string): returnCmdAndCurIndex => {
    const cmdIndex = curIndexToCmdIndex(cmd, curIndex);
    const afterArr = getTextArrAfterCurIndex(cmd, cmdIndex);
    const afterTextLen = getTextByteLength(afterArr.join(''))
    xtermInsCursorMove(xtermIns, 'toRight', afterTextLen);
    xtermInsDelText(xtermIns, afterTextLen);
    xtermInsAddText(xtermIns, text + afterArr.join(''));
    xtermInsCursorMove(xtermIns, 'toLeft', afterTextLen);
    cmd.splice(cmdIndex, 0, ...text.split(''));
    curIndex = getCurIndex(curIndex, getTextByteLength(text));
    return {
      cmd,
      curIndex
    }
  }

  // curIndex 映射cmd index
  const curIndexToCmdIndex = (cmd: string[], curIndex: number): number => {
    let cmdIndex: number = cmd.length;
    const byteArr: number[] = [];
    cmd.forEach(item => {
      if (isIncludesChineseCharacters(item)) {
        byteArr.push(2)
      } else {
        byteArr.push(1)
      }
    })
    byteArr.reduce((prev, cur, index) => {
      if (prev === curIndex) {
        cmdIndex = index
      }
      return prev + cur
    }, 0)
    return cmdIndex
  } 
  // 左移
  const xtermHandleShiftLeft = (xtermIns: Terminal, cmd: string[], curIndex: number, text: string): returnCmdAndCurIndex => {
    // 获取光标左边的字符，根据字符字节长度移动光标位置，重新设置curIndex
    const leftText = cmd[curIndexToCmdIndex(cmd, curIndex) - 1]
    curIndex = getCurIndex(curIndex, -getTextByteLength(leftText));
    xtermInsCursorMove(xtermIns, 'toLeft', getTextByteLength(leftText));
    return {
      cmd,
      curIndex
    }
  }

  // 右移
  const xtermHandleShiftRight = (xtermIns: Terminal, cmd: string[], curIndex: number, text: string): returnCmdAndCurIndex => {
    // 获取光标当前所在的字符，根据字符字节长度移动光标位置，重新设置curIndex
    const rightText = cmd[curIndexToCmdIndex(cmd, curIndex)]
    curIndex = getCurIndex(curIndex, getTextByteLength(rightText));
    xtermInsCursorMove(xtermIns, 'toRight', getTextByteLength(rightText));
    return {
      cmd,
      curIndex
    }
  }
  
  // 删除
  const xtermHandleDelete = (xtermIns: Terminal, cmd: string[], curIndex: number, text: string): returnCmdAndCurIndex => {
    if (cmd.length === 0 || curIndex === 0) {
      return {
        cmd,
        curIndex
      }
    }
    const cmdIndex = curIndexToCmdIndex(cmd, curIndex);
    const afterArr = getTextArrAfterCurIndex(cmd, cmdIndex);
    const leftText = cmd[cmdIndex - 1];
    const afterTextLen = getTextByteLength(afterArr.join(''));
    const leftTextLen = getTextByteLength(leftText)
    xtermInsCursorMove(xtermIns, 'toRight', afterTextLen);
    xtermInsDelText(xtermIns, afterTextLen + leftTextLen);
    xtermInsAddText(xtermIns, afterArr.join(''));
    xtermInsCursorMove(xtermIns, 'toLeft', afterTextLen);
    cmd.splice(cmdIndex - 1, 1);
    curIndex = getCurIndex(curIndex, -leftTextLen);
    return {
      cmd,
      curIndex
    }
  }

  // 复制
  const xtermHandlePaste = (xtermIns: Terminal, cmd: string[], curIndex: number, text: string): returnCmdAndCurIndex => {
    return xtermHandleInsert(xtermIns, cmd, curIndex, text);
  }
  useEffect(() => {
    initXtrem()
  }, [])
  return <div className="xtermIns-content"id="xtermIns"></div>
}

export default XtemIns