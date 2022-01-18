
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
    xtermIns.onKey(({key, domEvent}) => {
      console.log(key,domEvent);
      xtermIns.write(key)
    })

    setXtermIns(() => {
      xtermIns.write(`$ `)
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