import React, { useEffect, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript'
import { cpp } from '@codemirror/lang-cpp'
import { okaidia, aura, dracula, eclipse, solarizedDark, sublime, tokyoNight, vscodeDark, gruvboxDark } from '@uiw/codemirror-themes-all'


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


  const [lang, setLang] = useState("javascript")
  const [code, setCode] = useState(`console.log('hello world!');`)
  const [_theme, setTheme] = useState(okaidia)
  const [themeName, setThemeName] = useState('okaidia')
  const [fontS, setFontS] = useState(14)


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
      }
    }
    changer();
    return () => {
      socketRef.current.off("updatingcode");
    };
  }, [socketRef.current])

  //To make Editor Run

  return (

    <>
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
        height="70vh"
        theme={_theme}
        extensions={lang === 'cpp' ? [cpp()] : [javascript({ jsx: true })]}
        onChange={handleCodeChange}
      />
    </>
  )
}

export default Editor