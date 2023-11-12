import React, { useEffect, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript'
import { cpp } from '@codemirror/lang-cpp'
import { okaidia, aura, dracula, eclipse, solarizedDark, sublime, tokyoNight, vscodeDark, gruvboxDark } from '@uiw/codemirror-themes-all'
import toast from 'react-hot-toast';
import Avatar from 'react-avatar';

const themeList = [
  {
    name: "okaidia",
    value: okaidia
  },
  {
    name: "aura",
    value: aura
  },
  {
    name: "dracula",
    value: dracula
  },
  {
    name: "eclipse",
    value: eclipse
  },
  {
    name: "solarizedDark",
    value: solarizedDark
  },
  {
    name: "sublime",
    value: sublime
  },
  {
    name: "tokyo-night",
    value: tokyoNight
  },
  {
    name: "vscodedark",
    value: vscodeDark
  },
  {
    name: "gruvboxDark",
    value: gruvboxDark
  }
]

const fontSizeList = [
  14,
  16,
  18,
  20,
  22,
  24,
  26,
  28,
  30
]

const Editor = ({ socketRef, roomId, _userName }) => {

  const [lang, setLang] = useState('javascript');
  const [code, setCode] = useState(`console.log('hello world!');`);
  const [_theme, setTheme] = useState(okaidia);
  const [fontS, setFontS] = useState(14);
  const [isTyping, setIsTyping] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatArray, setChatArray] = useState([]);

  const handleLangChange = (e) => {
    setLang(e.target.value)

    if (e.target.value === 'cpp') {
      setCode('int main() {\n int x; \n}')
    }
    else {
      setCode(`console.log('hello world!');`)
    }

    console.log(e.target.value)
    socketRef.current.emit("langchange", {
      roomId,
      language: e.target.value,
      code: e.target.value === 'cpp' ? `int main() {\n int x; \n}` : `console.log('hello world!');`
    })
  }

  const handleThemeChange = (e) => {
    const temp = themeList[e.target.value]
    setTheme(temp.value)
    setThemeName(temp.name)
    // console.log(temp.name);
  }

  const handleFontSizeChange = (e) => {
    setFontS(e.target.value)
  }

  const handleCodeChange = (e) => {
    // console.log(e)
    const newCode = e;
    setCode(newCode)
    if (socketRef.current) {
      socketRef.current.emit("codechange", {
        roomId,
        code: newCode
      })
    }
  }


  const handleTyping = () => {
    setIsTyping(_userName);
    socketRef.current.emit('typing', {
      roomId,
      isTyping: true,
    });

    // Clear typing indicator after 2 seconds
    setTimeout(() => {
      setIsTyping(null);
      socketRef.current.emit('typing', {
        roomId,
        isTyping: false,
      });
    }, 2000);
  };

  const handleChatChange = (e) => {
    setChatMessage(e.target.value);
  };

  const handleSendChat = () => {
    if (chatMessage.trim() !== '') {
      socketRef.current.emit('newchat', {
        roomId,
        message: chatMessage,
        userName: _userName,
      });
      setChatMessage('');
    }
  };

  useEffect(() => {
    function changer() {
      if (socketRef.current) {
        socketRef.current.on("updatingcode", ({ code, userName }) => {
          if (userName !== _userName) {
            setCode(code);
          }
        })

        socketRef.current.on("changedlanguage", ({ userName, language, code }) => {
          console.log("dkdkf", code)
          if (userName !== _userName) {
            setLang(language);
            setCode(code)
          }
        })

        socketRef.current.on('typingstatus', ({ isTyping, userName }) => {
          if (isTyping) {
            setIsTyping(userName);
          } else {
            setIsTyping(null);
          }
        });

        socketRef.current.on('chats', ({ chatArray }) => {

          const newArr = chatArray.reverse();
          setChatArray(newArr);
        });
      }
    }
    changer();
    return () => {
      socketRef.current.off("updatingcode");
    };
  }, [socketRef.current])

  useEffect(() => {
    if (chatArray.length) {
      setTimeout(() => {
        const newCh = chatArray;
        newCh.unshift();
        
        setChatArray(newCh);
      }, 1000)
    }
  }, [])

  //To make Editor Run

  return (

    <>
      <div className='absolute bottom-4 right-4 bg-white bg-opacity-80 p-2 rounded shadow'>
        {isTyping && <span>{isTyping} is typing...</span>}
      </div>
      <div className='flex justify-end gap-[1rem] my-[1rem]'>
        <div>
          <select id="language" onChange={handleLangChange} value={lang} className={`p-2 bg-black bg-opacity-75 text-white cursor-pointer`}>
            <option value="javascript">Javascript</option>
            <option value="cpp">C++</option>
          </select>
        </div>
        <div>
          <select id="theme" onChange={handleThemeChange} className={`p-2 bg-black bg-opacity-75 text-white cursor-pointer`} >
            {
              themeList.map((elem, index) => (
                <option key={index} value={index}>{elem.name}</option>
              ))
            }
          </select>
        </div>
        <div>
          <select id="theme" onChange={handleFontSizeChange} className={`p-2 bg-black bg-opacity-75 text-white cursor-pointer`} >
            {
              fontSizeList.map((elem, index) => (
                <option key={index} value={elem}>{elem}</option>
              ))
            }
          </select>
        </div>
      </div>
      <CodeMirror
        className={`shadow-2xl`}
        style={{
          fontSize: `${fontS}px`
        }}
        value={code}
        height="66vh"
        theme={_theme}
        extensions={lang === 'cpp' ? [cpp()] : [javascript({ jsx: true })]}
        onChange={handleCodeChange}
        onKeyUp={handleTyping}
      />

      <div className='flex flex-col items-end gap-2'>
        <div className='flex gap-2'>
          <input
            type='text'
            value={chatMessage}
            onChange={handleChatChange}
            placeholder='Type your message...'
            className='p-1 border border-gray-300 rounded'
          />
          <button onClick={handleSendChat} className='bg-blue-500 text-white p-1 rounded'>
            Send
          </button>
        </div>
        <div className='flex flex-col gap-2 h-[4rem] overflow-scroll'>
          {chatArray.map((chat, index) => (
            <div key={index} className='flex gap-2'>
              <Avatar name={chat.userName} size='20' round />
              <span>{`${chat.userName}: ${chat.message}`}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Editor