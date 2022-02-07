
import React, { useEffect } from 'react';
import './style.css';
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import 'xterm/lib/xterm'
import { KEY_CODE_MAP, XTERM_KEY_MAP } from './constants'
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
    let copyText: string = ''; // 复制的值

    xtermIns.onData(function(data: string) {
      if (/^[\u4e00-\u9fa5]+$/.test(data)) {
        xtermIns.write(data);
        curIndex += (data.length * 2);
        console.log(curIndex);
        
        cmd = [...cmd, ...data.split('')]
      }
    })

    // 
    xtermIns.onData((data: string) => {
      // console.log(data);
      
    })

    // 组合键处理
    xtermIns.attachCustomKeyEventHandler((e) => {
      const { 
        type, 
        metaKey, // mac command
        ctrlKey, // window ctrl
        keyCode
      } = e
      const { c, v, x, space } = KEY_CODE_MAP
      const { xtermSpace } = XTERM_KEY_MAP
      if (type === 'keydown') {
        // 复制粘贴逻辑
        if (metaKey || ctrlKey) {
          if (keyCode === c || keyCode === x) { // ctrl + c; ctrl + x 复制
            copyText = xtermIns.getSelection();
            return false
          }
          if (keyCode === v) {  
            // 粘贴
            xtermIns.clearSelection();
            let textArr: string[] = copyText.split('');
            // 中间复制
            if (curIndex < cmd.length) {
              const afterArr = getTextArrAfterCurIndex(cmd, curIndex);
              xtermInsCursorMove(xtermIns, 'toRight', afterArr.length);
              xtermInsDelText(xtermIns, afterArr.length);
              xtermInsAddText(xtermIns, textArr.join('') + afterArr.join(''));
              xtermInsCursorMove(xtermIns, 'toLeft', afterArr.length);
              cmd.splice(curIndex, 0, ...textArr);
              curIndex = getCurIndex(curIndex, textArr.length);
              return
            }
            // 最后复制
            xtermInsAddText(xtermIns, textArr.join(''));
            curIndex = getCurIndex(curIndex, textArr.length);
            cmd = [...cmd, ...textArr]
          }
        }
        // 空格逻辑
        if (keyCode === space) {
          xtermInsAddText(xtermIns, xtermSpace);
          curIndex = getCurIndex(curIndex, 1);
          cmd.push(xtermSpace)
        }
        return true
      }
      return false
    })

    xtermIns.onKey(({key, domEvent}) => {
      const { keyCode } = domEvent;
      const { moveDown, moveUp, shiftLeft, shiftRight, backspace, enter } = KEY_CODE_MAP;
      // 正常情况下禁用上移下移
      const disabledKey = [moveDown, moveUp]; 
      if (disabledKey.includes(keyCode)) {
        return
      }

      // 右移边界处理
      if (keyCode === shiftRight && curIndex === cmd.length) {
        return
      }

      // 左移边界处理
      if (keyCode === shiftLeft && curIndex === 0) {
        return 
      }

      // 针对不同的keyCode做相应的操作
      switch(keyCode) {
        // 回车操作
        case enter :
          xtermIns.write(`\r\n$ `)
          cmd = []
          curIndex = 0
          break;
        // 删除操作
        case backspace : 
          // 在可编辑最左侧禁止删除
          if (cmd.length === 0 || curIndex === 0) {
            return
          }
          // 中间删除
          if (curIndex < cmd.length) {
            const afterArr = getTextArrAfterCurIndex(cmd, curIndex);
            xtermInsCursorMove(xtermIns, 'toRight', afterArr.length);
            xtermInsDelText(xtermIns, afterArr.length + 1);
            xtermInsAddText(xtermIns, afterArr.join(''));
            xtermInsCursorMove(xtermIns, 'toLeft', afterArr.length);
            cmd.splice(curIndex, 1);
            curIndex = getCurIndex(curIndex, -1);
            return
          }
          // 最后删除
          xtermInsDelText(xtermIns, 1)
          curIndex = getCurIndex(curIndex, -1)
          cmd.pop()
          break;
        // 左移
        case shiftLeft : 
          curIndex = getCurIndex(curIndex, -1);
          xtermInsAddText(xtermIns, key);
          break;
        // 右移动
        case shiftRight : 
          curIndex = getCurIndex(curIndex, 1);
          xtermInsAddText(xtermIns, key);
          break;
        default :
          // 中间内容插入
          if (curIndex < cmd.length) {
            const afterArr = getTextArrAfterCurIndex(cmd, curIndex);
            xtermInsCursorMove(xtermIns, 'toRight', afterArr.length);
            xtermInsDelText(xtermIns, afterArr.length);
            xtermInsAddText(xtermIns, key + afterArr.join(''));
            xtermInsCursorMove(xtermIns, 'toLeft', afterArr.length);
            cmd.splice(curIndex, 0, key);
            curIndex = getCurIndex(curIndex, 1);
            return 
          }
          // 最后插入
          xtermInsAddText(xtermIns, key);
          curIndex = getCurIndex(curIndex, 1);
          cmd.push(key)
          break;
      }
    })
    xtermIns.writeln('\x1b[1;1;32mwellcom to web terminal!\x1b[0m')
    xtermIns.write(`\r\n$ `)
  }

  // 删除文字
  const xtermInsDelText = (xtermIns: Terminal, offset: number) => {
    const { xtermBackspace } = XTERM_KEY_MAP
    xtermIns.write(new Array(offset).fill('').map(item => xtermBackspace).join(''))
  }

  // 移动光标位置
  const xtermInsCursorMove = (xtermIns: Terminal, type: 'toLeft' | 'toRight', offset: number) => {
    const { xtermShiftLeft, xtermShiftRight } = XTERM_KEY_MAP
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

  useEffect(() => {
    initXtrem()
  }, [])
  return <div className="xtermIns-content" id="xtermIns">

  </div>
}

export default XtemIns