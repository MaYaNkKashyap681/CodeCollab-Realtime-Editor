import React, { useEffect, useState, useRef } from 'react'
import Editor from '../components/Editor'
import Avatar from 'react-avatar'
import { toast } from 'react-hot-toast'
import { initSocket } from '../socket'
import { useLocation, useParams, useNavigate } from 'react-router-dom'

const Codepage = () => {
    const location = useLocation();
    const { roomId } = useParams();
    // console.log(roomId)
    // console.log(location.state?.user)
    const socketRef = useRef(null);
    const reactNavigator = useNavigate();

    useEffect(() => {
        async function socketCode() {
            socketRef.current = await initSocket();

            socketRef.current.emit('joinroom', {
                roomId,
                userName: location.state?.user,
            })

            socketRef.current.on('newuser', ({ clientsInRoom, userName, socketId }) => {
                setUsers(clientsInRoom);
                // console.log(clientsInRoom)
                if (userName !== location.state?.user) {
                    toast.success(`${userName} joined the room.`);
                    // console.log(`${userName} joined`);
                }
                // socketRef.current.emit(ACTIONS.SYNC_CODE, {
                //     code: codeRef.current,
                //     socketId,
                // });
            })

            socketRef.current.on(
                "leftroom",
                ({ socketId, userName }) => {
                    toast.success(`${userName} left the room.`);
                    setUsers((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );
        }
        socketCode();
        return () => {
            socketRef.current.disconnect();
            socketRef.current.off("newuser");
            socketRef.current.off("leftroom");
        };
    }, [])


    const [users, setUsers] = useState([])

    const handleCopyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId)
            toast.success("Successfully Copied Room Id")
        }
        catch (err) {
            toast.error("Something Went Wrong")
        }
    }


    const leaveRoom = () => {
        reactNavigator('/');
    }



    return (
        <div className='w-[100vw] h-[100vh] flex'>
            <div className='w-[16rem] h-full p-4 border-r-[0.3rem] border-r-blue-300 flex flex-col justify-between'>
                <div>
                    <h3 className='text-5xl text-white font-extralight'><span className='font-allura text-yellow-400'>Code</span>Collab</h3>
                    <h4 className='mt-[2rem] text-white'>Currently Joined*</h4>
                    <div className='w-full flex flex-wrap gap-[2rem] justify-start items-center max-h-[15rem] overflow-x-hidden overflow-y noscroll mt-[2rem] text-white bg-opacity-40 bg-gray-400 rounded-md p-2'>

                        {
                            users.map((user, index) => (
                                <div key={index} className='flex flex-col justify-center items-center cursor-pointer hover:scale-105 hover:shadow-md'>
                                    <Avatar name={user.userName} size={40} round={true} />
                                    <p className='text-xs'>{user.userName}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className='flex flex-col gap-4'>
                    <div>
                        <button className='text-white shadow-lg bg-green-600 text-sm px-5 py-1 rounded-sm w-full hover:bg-green-500' onClick={handleCopyRoomId}>Copy Room Id</button>
                    </div>
                    <div onClick={leaveRoom}>
                        <button className='text-white shadow-lg bg-red-600 text-sm px-5 py-1 rounded-sm w-full hover:bg-red-500'>Leave Room</button>
                    </div>
                </div>
            </div>
            <div className=' w-full flex flex-col p-4 justify-center'>
                <div className='bg-[#FFFFFF] p-2 rounded-lg shadow-xl'>
                    <Editor
                        socketRef={socketRef}
                        roomId={roomId}
                        _userName = {location.state?.user}
                    />
                </div>
            </div>


        </div>
    )
}

export default Codepage