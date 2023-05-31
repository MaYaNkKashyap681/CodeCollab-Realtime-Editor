import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { v4 as uuidV4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import mainImg from '../assets/3dimage.jpg';


const Homepage = () => {
    const navigate = useNavigate()
    const [roomId, setRoomId] = useState('');
    const [user, setUser] = useState('')


    const handleGenerate = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success('Created a new room');
    }

    const handleJoin = () => {
        if (!roomId || !user) {
            toast.error("Fields cannot be Empty")
            return;
        }

        navigate(`/code/${roomId}`, {
            state: {
                user: user
            }
        })
    }

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
           handleJoin();
        }
    };

    return (
        <div className='h-[100vh] w-full flex justify-center items-center'>
            <div className={`w-[40rem] bg-[url('./assets/bgImage.jpg')] h-full flex p-4 bg-cover bg-center  container mx-auto justify-center`}>
                <div className='w-full'>
                    <h3 className='text-5xl text-white font-extralight'><span className='font-allura text-yellow-400'>Code</span>Collab</h3>
                    <div className='w-full mt-[4rem]'>
                        <form className='w-full flex flex-col gap-4'>
                            <div className='flex flex-col '>
                                <span className='text-xs text-white bg-green-700 p-2'>Room Id* :</span>
                                <input type="text" placeholder='Example: 2323242' className='focus:outline-none text-sm px-1 py-2 rounded-sm bg-gray-900 text-white'
                                    value={roomId} name="roomid" onChange={(e) => setRoomId(e.target.value)}
                                    onKeyUp={handleInputEnter}
                                />
                            </div>
                            <div className='flex flex-col'>
                                <span className='text-xs text-white bg-green-700 p-2'>Username* :</span>
                                <input type="text" placeholder='Example: Mayank Kashyap' className='focus:outline-none text-sm px-1 py-2 rounded-sm bg-gray-900 text-white'
                                    value={user} onChange={(e) => setUser(e.target.value)}
                                    onKeyUp={handleInputEnter}
                                />
                            </div>
                        </form>
                        <div className='mt-[1rem] flex justify-end'>
                            <button className='text-white shadow-lg bg-green-600 text-sm px-5 py-1 rounded-sm ' onClick={handleJoin}>Join</button>
                        </div>

                        <p className='text-white text-[12px]'>Want to Create a new room ?<span className='text-[10px] text-green-900 ml-[0.4rem] cursor-pointer bg-yellow-200 p-[0.2rem]' onClick={handleGenerate}>Generate</span></p>
                    </div>
                </div>
            </div>
            <div className='w-full h-full p-4 bg-gray-800'>
                <div className='flex justify-center items-center flex-col h-full'>
                    <h1 className='font-extrabold text-transparent text-6xl bg-clip-text bg-gradient-to-r from-green-400 to-yellow-600 text-center'>
                        Unleash Your Coding<br /> Potential: Collaborate, <br /> Code, and Create in Real Time!
                    </h1>
                    <div className='overflow-hidden rounded-xl'>
                        <img src={mainImg} alt="image" className='w-full h-[16rem] object-contain mt-[2rem] overflow-clip' />
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Homepage