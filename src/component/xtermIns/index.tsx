
import React, { useEffect, useState } from 'react';
import './style.css';
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import 'xterm/lib/xterm'
function XtemIns() {
  const [xtermIns, setXtermIns] = useState<Terminal>(null)
  const initXtrem = () => {
    const xtermIns: Terminal = new Terminal({
      rendererType: 'canvas', // 渲染类型
      convertEol: true, // 启用是，光标设置为下一行的开头
      disableStdin: true, // 禁用输入
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
    let lastInputValue = ''; // 最后一个输入的值
    // xtermIns.onData((value) => {
    //   console.log(value);
    // })
    xtermIns.onKey(({key, domEvent}) => {
      let visibleTextArr = cmd.filter(item => !(item === '\x1B[C') && !(item === '\x1B[D') && !(item === '\x7F'))
      const { keyCode } = domEvent
      const disabledKey = [40, 38]
      // 正常情况下禁用上移下移
      if (disabledKey.includes(keyCode)) {
        return
      }
      // 左移/右移边界处理
      if (key === '\x1B[C' && curIndex === visibleTextArr.length) {
        return
      }
      if (key === '\x1B[D' && curIndex === 0) {
        return
      }
      if (key === '\x1B[C') { // 右移
        curIndex ++;
      } else if (key === '\x1B[D'){ // 左移
        curIndex --;
      }
      if (key !== '\x7F') { // 删除的可以
        cmd.push(key)
      }
      switch(keyCode) {
        case 8:
          // 删除处理
          // 禁止删除前缀
          if (cmd.length === 0 || curIndex === 0) {
            return
          }
          // 中间删除
          if (curIndex < visibleTextArr.length) {
            const afterVisibleTextArr = visibleTextArr.slice(curIndex)
            visibleTextArr.splice(curIndex - 1, 1);
            cmd = [...visibleTextArr];
            ([...afterVisibleTextArr]).forEach(() => {
              xtermIns.write('\x1B[C') // 右移光标
            });
            ([...afterVisibleTextArr, '']).forEach(() => {
              xtermIns.write('\b \b') // 删除文字
            })
            xtermIns.write(afterVisibleTextArr.join('')); // 添加文字
            ([...afterVisibleTextArr]).forEach(() => {
              xtermIns.write('\x1B[D') // 左移动光标
            });
            curIndex --;
            return 
          }
          // 删除最新的值
          curIndex --;
          const index = cmd.lastIndexOf(lastInputValue)
          cmd.splice(index, 1)
          lastInputValue = cmd[index - 1]
          xtermIns.write('\b \b')
          break;
        default:
          if (!(key === '\x1B[C') && !(key === '\x1B[D')) {
            // 中间插入
            if (curIndex < visibleTextArr.length) {
              visibleTextArr.splice(curIndex, 0, key)
              const afterVisibleTextArr = visibleTextArr.slice(curIndex + 1)
              cmd = [...visibleTextArr]
              xtermIns.write(key + afterVisibleTextArr.join(''));
              afterVisibleTextArr.forEach(() => {
                xtermIns.write('\x1B[D') // 修改光标位置
              })
              curIndex ++;
              return 
            }
            curIndex ++;
            lastInputValue = key
          }
          xtermIns.write(key);
      }
    })

    setXtermIns(() => {
      xtermIns.writeln('\x1b[1;1;32mwellcom to web terminal!\x1b[0m')
      xtermIns.write(`\r\n$ `)
      return xtermIns
    })
    
  }
  const prompt = () => {
    xtermIns.write(`\r\n$ `)
  }
  useEffect(() => {
    initXtrem()
  }, [])
  return <div className="xtermIns-content" id="xtermIns">

  </div>
}

export default XtemIns