import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Avatar from '../Avatar'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import { addMessage } from '../../redux/actions/messageAction'
import RingRing from '../../audio/ringring.mp3'

const CallModal = () => {
    const { call, auth, peer, socket, theme } = useSelector(state => state)
    const dispatch = useDispatch()

    const [hours, setHours] = useState(0)
    const [mins, setMins] = useState(0)
    const [second, setSecond] = useState(0)
    const [total, setTotal] = useState(0)

    const [answer, setAnswer] = useState(false)
    const youVideo = useRef()
    const otherVideo = useRef()
    const ringAudio = useRef(null)
    const [tracks, setTracks] = useState(null)
    const [newCall, setNewCall] = useState(null)

    // Set Time
    useEffect(() => {
        const timer = setInterval(() => {
            setTotal(t => t + 1)
        }, 1000)

        return () => {
            clearInterval(timer)
            setTotal(0)
        }
    },[])

    useEffect(() => {
        setSecond(total%60)
        setMins(parseInt(total/60))
        setHours(parseInt(total/3600))
    },[total])


    // End Call
    const addCallMessage = useCallback((call, times, disconnect) => {
        if(call.conversationId || call.recipient !== auth.user._id || disconnect){
            const msg = {
                sender: call.sender,
                recipient: call.recipient,
                conversationId: call.conversationId,
                recipients: call.recipients,
                text: '', 
                media: [],
                call: {video: call.video, times},
                createdAt: new Date().toISOString()
            }
            dispatch(addMessage({msg, auth, socket}))
        }
    },[auth, dispatch, socket])

    const handleEndCall = () => {
        tracks && tracks.forEach(track => track.stop())
        if(newCall) newCall.close()
        let times = answer ? total : 0
        socket.emit('endCall', {...call, times})
        
        addCallMessage(call, times)
        dispatch({type: GLOBALTYPES.CALL, payload: null })
    }

    useEffect(() => {
        if(answer){
            setTotal(0)
        }else{
            const timer = setTimeout(() => {
                socket.emit('endCall', {...call, times: 0})
                addCallMessage(call, 0)
                dispatch({type: GLOBALTYPES.CALL, payload: null })
            }, 15000)
    
            return () => clearTimeout(timer)
        }
        
    },[dispatch, answer, call, socket, addCallMessage])

    useEffect(() => {
        socket.on('endCallToClient', data => {
            tracks && tracks.forEach(track => track.stop())
            if(newCall) newCall.close()
            addCallMessage(data, data.times)
            dispatch({ type: GLOBALTYPES.CALL, payload: null })
        })

        return () => socket.off('endCallToClient')
    },[socket, dispatch, tracks, addCallMessage, newCall])


    // Stream Media
    const openStream = (video) => {
        const config = { audio: true, video }
        return navigator.mediaDevices.getUserMedia(config)
    }

    const playStream = (tag, stream) => {
        if(!tag) return
        let video = tag;
        video.srcObject = stream;
        const playPromise = video.play()
        if(playPromise && playPromise.catch) {
            playPromise.catch(() => {})
        }
    }

    // Answer Call
    const handleAnswer = () => {
        if(!peer || !peer.open || !call.peerId) {
            return dispatch({
                type: GLOBALTYPES.ALERT,
                payload: {error: 'Call service is not ready. Please try again.'}
            })
        }

        openStream(call.video).then(stream => {
            playStream(youVideo.current, stream)
            const track = stream.getTracks()
            setTracks(track)
            
            const newCall = peer.call(call.peerId, stream);
            newCall.on('stream', function(remoteStream) {
                playStream(otherVideo.current, remoteStream)
            });
            setAnswer(true)
            setNewCall(newCall)
        }).catch(() => {
            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: {error: 'Cannot access microphone or camera.'}
            })
        })
    }

    useEffect(() => {
        if(!peer || !peer.on) return;

        const handlePeerCall = newCall => {
            if(!call) return;

            openStream(call.video).then(stream => {
                if(youVideo.current){
                    playStream(youVideo.current, stream)
                }
                const track = stream.getTracks()
                setTracks(track)
                
                newCall.answer(stream)
                newCall.on('stream', function(remoteStream) {
                    if(otherVideo.current){
                        playStream(otherVideo.current, remoteStream)
                    }
                });
                setAnswer(true) 
                setNewCall(newCall)
            }).catch(() => {
                dispatch({
                    type: GLOBALTYPES.ALERT,
                    payload: {error: 'Cannot access microphone or camera.'}
                })
            })
        }

        peer.on('call', handlePeerCall)
        return () => peer.off ? peer.off('call', handlePeerCall) : peer.removeListener('call', handlePeerCall)
    },[peer, call, dispatch])

    // Disconnect
    useEffect(() => {
        socket.on('callerDisconnect', () => {
            tracks && tracks.forEach(track => track.stop())
            if(newCall) newCall.close()
            let times = answer ? total : 0
            addCallMessage(call, times, true)

            dispatch({type: GLOBALTYPES.CALL, payload: null })

            dispatch({
                type: GLOBALTYPES.ALERT, 
                payload: {error: `The ${call.username} disconnect`} 
            })
        })

        return () => socket.off('callerDisconnect')
    },[socket, tracks, dispatch, call, addCallMessage, answer, total, newCall])

    useEffect(() => {
        if(!ringAudio.current) {
            ringAudio.current = new Audio(RingRing)
            ringAudio.current.loop = true
        }

        const audio = ringAudio.current

        if(answer) {
            audio.pause()
            audio.currentTime = 0
            return
        }

        const playPromise = audio.play()
        if(playPromise && playPromise.catch) {
            playPromise.catch(() => {})
        }

        return () => {
            audio.pause()
            audio.currentTime = 0
        }
    },[answer])


    return (
        <div className="call_modal">
            <div className="call_box" style={{
                display: (answer && call.video) ? 'none' : 'flex'
            }} >

                <div className="text-center" style={{padding: '40px 0'}} >
                    <Avatar src={call.avatar} size="supper-avatar" />
                    <h4>{call.username}</h4>
                    <h6>{call.fullname}</h6>

                    {
                        answer 
                        ? <div>
                            <span>{ hours.toString().length < 2 ? '0' + hours : hours }</span>
                            <span>:</span>
                            <span>{ mins.toString().length < 2 ? '0' + mins : mins }</span>
                            <span>:</span>
                            <span>{ second.toString().length < 2 ? '0' + second : second }</span>
                        </div>
                        : <div>
                            {
                                call.video
                                ? <span>calling video...</span>
                                : <span>calling audio...</span>
                            }
                        </div>
                    }
                    
                </div>
                
                {
                    !answer && 
                    <div className="timer">
                        <small>{ mins.toString().length < 2 ? '0' + mins : mins }</small>
                        <small>:</small>
                        <small>{ second.toString().length < 2 ? '0' + second : second }</small>
                    </div>
                }
                

                <div className="call_menu">
                    <button className="material-icons text-danger"
                    onClick={handleEndCall}>
                        call_end
                    </button>
                    
                    {
                        (call.recipient === auth.user._id && !answer) &&
                        <>
                            {
                                call.video
                                ? <button className="material-icons text-success"
                                onClick={handleAnswer}>
                                    videocam
                                </button>
                                : <button className="material-icons text-success"
                                onClick={handleAnswer}>
                                    call
                                </button>
                            }
                        </>
                    }
                    
                </div>
                
            </div>

            <div className="show_video" style={{
                opacity: (answer && call.video) ? '1' : '0',
                filter: theme ? 'invert(1)' : 'invert(0)'
            }} >

                <video ref={youVideo} className="you_video" playsInline muted />
                <video ref={otherVideo} className="other_video" playsInline />

                <div className="time_video">
                    <span>{ hours.toString().length < 2 ? '0' + hours : hours }</span>
                    <span>:</span>
                    <span>{ mins.toString().length < 2 ? '0' + mins : mins }</span>
                    <span>:</span>
                    <span>{ second.toString().length < 2 ? '0' + second : second }</span>
                </div>

                <button className="material-icons text-danger end_call"
                onClick={handleEndCall}>
                    call_end
                </button>

            </div>

        </div>
    )
}

export default CallModal
