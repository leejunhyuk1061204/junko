'use client'
import React, {useEffect, useRef, useState} from 'react';
import Draggable from "react-draggable";
import axios from "axios";
import Pagination from "react-js-pagination";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import {useAlertModalStore} from "@/app/zustand/store";
import {FaExclamation} from "react-icons/fa6";
import {format} from "date-fns";
import dayjs from '@/app/component/utills/dayjs/dayjs-config'


const msgOptionList = [
    {idx:1, name:'받은 메세지'},
    {idx:2, name:'보낸 메세지'},
]

const importantFilterList = [
    {idx:1, name:'전체'},
    {idx:2, name:'일반'},
    {idx:3, name:'중요'},
]

const readFilterList = [
    {idx:1, name:'전체'},
    {idx:2, name:'읽음'},
    {idx:3, name:'미확인'},
]

const selectedImportantList = [
    {idx:1, name:'일반'},
    {idx:2, name:'중요'},
]

const MsgModal = ({open,onClose,type,msg,getUnreadMsg}) => {

    const {openModal} = useAlertModalStore();
    const [tray, setTray] = useState(false);
    const [page, setPage] = useState(1);
    const [receiveTotal, setReceiveTotal] = useState(0);
    const [sendTotal, setSendTotal] = useState(0);
    const [receiveMsgList, setReceiveMsgList] = useState([]);
    const [sendMsgList, setSendMsgList] = useState([]);
    const [importantYN, setImportantYN] = useState({idx:1, name:'전체'},);
    const [readYN, setReadYN] = useState({idx:1, name:'전체'},);
    const [msgOption, setMsgOption] = useState({idx:1, name:'받은 메세지'},);
    const [position, setPosition] = useState({x:0,y:0});
    const [msgType, setMsgType] = useState(type);
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [msgForm, setMsgForm] = useState({});

    const [selectedImportant, setSelectedImportant] = useState({idx:1, name:'일반'});

    const [user, setUser] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [userName, setUserName] = useState('');
    const [userFocused, setUserFocused] = useState(false);
    const [selectedUser, setSelectedUser] = useState(0);

    const dragRef = useRef(null);
    const trayRef = useRef(null);

    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        setTray(false);
        setPage(1);
        setReceiveTotal(0);
        setSendTotal(0);
        setReceiveMsgList([]);
        setSendMsgList([]);
        setImportantYN({idx:1, name:'전체'},);
        setReadYN({idx:1, name:'전체'},)
        setMsgOption({idx:1, name:'받은 메세지'},)
        setPosition({x:0,y:0});
        setSelectedMsg(null);
        setMsgForm({});
        setSelectedImportant({idx:1, name:'일반'});
        setUser([]);
        setUserSearch('');
        setUserName('');
        setUserFocused(false);
        setSelectedUser(0);

        getUnreadMsg();
        onClose();
    };

    // 쪽지 보낼 때 필터 변경
    const handleImportantChange = (important) => {
        setSelectedImportant(important);
    }

    // 필터 변경
    const handleReadYNChange = (readYN) => {
        setReadYN(readYN);
        setPage(1);
    }

    const handleImportantYNChange = (importantYN) => {
        setImportantYN(importantYN);
        setPage(1);
    }

    const handleMsgOptionChange = (msgOption) => {
        setMsgOption(msgOption);
        setPage(1);
    }

    // user 리스트
    const getUser = async (searchText='') => {
        const {data} = await axios.post('http://localhost:8080/users/list',{page:1,user_name:searchText});
        setUser(data.list);
        // console.log('user',data);
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setUserName(userSearch);
            // // console.log('유저 검색');
        }, 300);

        return () => clearTimeout(timer);
    }, [userSearch]);

    useEffect(() => {
        getUser(userName);
    }, [userName]);

    useEffect(() => {
        if(typeof type === "undefined")return;
        getReceiveMsgList();
        getSendMsgList();
    },[type,page,readYN,importantYN])

    useEffect(() => {
        setMsgType(type);
    }, [type]);

    useEffect(() => {
        setSelectedMsg(msg);
    }, [msg]);

    useEffect(() => {
        if(selectedMsg === null || typeof selectedMsg === "undefined") return;
        if(msgOption.idx===1 && !selectedMsg.read_yn){
            readMsg();
        }
    },[selectedMsg])

    // 메세지 읽음
    const readMsg = async () => {
        const {data} = await axios.put(`http://localhost:8080/msg/read/${selectedMsg.msg_idx}`);
        console.log(data);
    }

    // 받는 메세지 리스트
    const getReceiveMsgList = async() =>{
        const {data} = await axios.post('http://localhost:8080/msg/list',{
            type:'receive',
            page:page,
            user_idx: (typeof window !== "undefined" ? sessionStorage.getItem("user_idx") : 0),
            important_yn: importantYN.name === '중요'? 1 : importantYN.name === '일반' ? 0 : null,
            read_yn:readYN.name === '읽음' ? 1 : readYN.name === '미확인' ? 0 : null,
        });
        console.log('receive',data);
        setReceiveTotal(data.total*5);
        setReceiveMsgList(data.list);
    }

    // 보낸 메세지 리스트
    const getSendMsgList = async() =>{
        const {data} = await axios.post('http://localhost:8080/msg/list',{
            type:'send',
            page:page,
            user_idx: (typeof window !== "undefined" ? sessionStorage.getItem("user_idx") : 0),
            important_yn: importantYN.name === '중요'? 1 : importantYN.name === '일반' ? 0 : null,
        });
        console.log('send',data);
        setSendTotal(data.total*5);
        setSendMsgList(data.list);
    }

    // drag
    const handleOnDrag = (data) => {
        setPosition({x:data.x,y:data.y});
    }

    const sendMsg = async () => {
        try {
            const {data} = await axios.post('http://localhost:8080/msg/insert',{
                sender_idx: (typeof window !== "undefined" ? sessionStorage.getItem("user_idx") : 0),
                receiver_idx:selectedUser,
                msg_title:msgForm.msg_title,
                msg_content:msgForm.msg_content,
                important_yn:selectedImportant.name==='중요'?1:0,
            },{
                headers:{
                    authorization: (typeof window !== "undefined" ? sessionStorage.getItem("token") : ""),
                }
            });
            console.log(data);
            if (!data.success) {
                openModal({
                    svg: '❗',
                    msg1: '쪽지 전송 실패',
                    msg2: '쪽지 전송에 실패했습니다',
                    showCancel: false,
                })
            } else {
                openModal({
                    svg: '✔',
                    msg1: '쪽지 전송 성공',
                    msg2: '쪽지 전송에 성공했습니다',
                    showCancel: false,
                    onConfirm: () => {
                        setMsgType('list');
                        setMsgForm({});
                        setSelectedUser(0);
                        setPage(1);
                        getReceiveMsgList();
                        getSendMsgList();
                    }
                })
            }
        } catch (error) {
            console.log(error);
            openModal({
                svg: '❗',
                msg1: '오류 발생',
                msg2: '서버 요청 중 문제가 발생했습니다',
                showCancel: false,
            })
        }
    }

    if (!open) return null;

    return (
        <div
            className="modal_overlay"
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
            }}
        >
            <Draggable
                position={{x:position.x,y:position.y}}
                onDrag={(_,data)=> handleOnDrag(data)}
                handle={tray?".tray-button":".modal-header"}
                nodeRef={tray?trayRef:dragRef}
            >
            <div
                className={`modal_content ${tray ? 'tray-on-width':'tray-off-width'}`}
                ref={dragRef}
                style={{
                    background: '#fefefe',
                    borderRadius: '10px',
                    position: 'relative',
                    pointerEvents: 'auto',
                }}
            >
                <button
                    className={`tray-button ${tray ? 'tray-on':'tray-off'} flex align-center`}
                    onClick={()=>setTray(!tray)}
                    ref={trayRef}
                >
                    -
                </button>
                {!tray &&
                <div>
                <div
                    className='modal-header'
                    style={{
                        width:'100%',
                        height:'25px',
                        background:'#fefefe',
                        borderRadius: '10px 10px 0 0',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                </div>
                <button
                    style={{
                        position: 'absolute',
                        right: 10,
                        top: 7,
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer'
                    }}
                    onClick={handleClose}
                >
                    ×
                </button>
                <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>쪽지</h3>

                <>

                    {/* 탭 내용 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {msgType==='list'&&
                        <>
                            <div className='flex justify-content-between' style={{padding:'0 30px'}}>
                                <div className="select-container width-fit" style={{marginRight:0}}>
                                    <Listbox value={msgOption} onChange={handleMsgOptionChange}>
                                        <ListboxButton className="select-btn white-space-nowrap" style={{marginRight:0,minWidth:'40px'}}>{msgOption.name}</ListboxButton>
                                        <ListboxOptions className="select-option">
                                            {msgOptionList.map(option => (
                                                <ListboxOption key={option.idx} value={option} className="select-option-item">
                                                    {option.name}
                                                </ListboxOption>
                                            ))}
                                        </ListboxOptions>
                                    </Listbox>
                                </div>
                                <div className='flex width-fit gap_10'>
                                    {msgOption.idx === 1 &&
                                        <div className="select-container" style={{marginRight:0}}>
                                            <Listbox value={readYN} onChange={handleReadYNChange}>
                                                <ListboxButton className="select-btn" style={{marginRight:0,minWidth:'40px'}}>{readYN.name}</ListboxButton>
                                                <ListboxOptions className="select-option">
                                                    {readFilterList.map(option => (
                                                        <ListboxOption key={option.idx} value={option} className="select-option-item">
                                                            {option.name}
                                                        </ListboxOption>
                                                    ))}
                                                </ListboxOptions>
                                            </Listbox>
                                        </div>
                                    }
                                    <div className="select-container" style={{marginRight:0}}>
                                        <Listbox value={importantYN} onChange={handleImportantYNChange}>
                                            <ListboxButton className="select-btn" style={{marginRight:0,minWidth:'40px'}}>{importantYN.name}</ListboxButton>
                                            <ListboxOptions className="select-option">
                                                {importantFilterList.map(option => (
                                                    <ListboxOption key={option.idx} value={option} className="select-option-item">
                                                        {option.name}
                                                    </ListboxOption>
                                                ))}
                                            </ListboxOptions>
                                        </Listbox>
                                    </div>
                                </div>
                            </div>
                            <div className='flex flex-direction-col' style={{padding:'0 30px'}}>
                                {msgOption.idx === 1 &&
                                    <table className='checkbox-table overflow-hidden text-overflow-ellipsis'>
                                        <thead>
                                            <tr style={{fontWeight:'bold',fontSize:'18px'}}>
                                                <td>중요</td>
                                                <td>제목</td>
                                                <td>보낸 사람</td>
                                                <td>보낸 시간</td>
                                                <td>수신 확인</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {receiveMsgList.map((msg, i) => (
                                                <tr
                                                    key={i}
                                                    className='cursor-pointer'
                                                    style={{padding:'5px 10px'}}
                                                    onClick={()=>{setMsgType('detail');setSelectedMsg(msg);}}
                                                >
                                                    <td style={{color:'lightcoral'}}>{msg.important_yn?<FaExclamation />:''}</td>
                                                    <td className='overflow-hidden text-overflow-ellipsis'>{msg.msg_title}</td>
                                                    <td>{msg.sender_name}</td>
                                                    <td>{format(msg.sent_at,'yyyy-MM-dd') === format(new Date(),'yyyy-MM-dd')? dayjs(msg.sent_at).tz('Asia/Seoul').format('HH:mm') : format(msg.sent_at,'yyyy-MM-dd')}</td>
                                                    <td>{msg.read_yn?'읽음':'미확인'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                }
                                {msgOption.idx === 2 &&
                                    <table className='checkbox-table'>
                                        <thead>
                                        <tr style={{fontWeight:'bold',fontSize:'18px'}}>
                                            <td>중요</td>
                                            <td>제목</td>
                                            <td>받는 사람</td>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {sendMsgList.map((msg, i) => (
                                            <tr
                                                key={i}
                                                className='cursor-pointer'
                                                style={{padding:'5px 10px'}}
                                                onClick={()=>{setMsgType('detail');setSelectedMsg(msg);}}
                                            >
                                                <td style={{color:'lightcoral'}}>{msg.important_yn?<FaExclamation />:''}</td>
                                                <td className='overflow-hidden text-overflow-ellipsis'>{msg.msg_title}</td>
                                                <td>{msg.receiver_name}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                }
                            </div>
                            {/* 페이지네이션 */}
                            <div className="product-pagination flex justify-content-between gap_5 margin-bottom-10">
                                <div className='flex justify-content-center'>
                                    <Pagination
                                        activePage={page}
                                        itemsCountPerPage={5}
                                        totalItemsCount={msgOption.idx===1?receiveTotal:sendTotal}
                                        pageRangeDisplayed={5}
                                        onChange={(page) => setPage(page)}  // set만!
                                    />
                                </div>
                            </div>
                            <div><button className='btn width-fit no_wrap margin-bottom-20' onClick={()=>{setMsgType('insert');setSelectedImportant({idx:1, name:'일반'})}}>보내기</button></div>
                        </>}
                        {msgType==='insert' &&
                            <div>
                                <div className='flex width-auto justify-right' style={{padding:'0 30px'}}>
                                    {/* 상태필터 */}
                                    <div className="select-container" style={{marginRight:0}}>
                                        <Listbox value={selectedImportant} onChange={handleImportantChange}>
                                            <ListboxButton className="select-btn" style={{marginRight:0,minWidth:'40px'}}>{selectedImportant.name}</ListboxButton>
                                            <ListboxOptions className="select-option">
                                                {selectedImportantList.map(option => (
                                                    <ListboxOption key={option.idx} value={option} className="select-option-item">
                                                        {option.name}
                                                    </ListboxOption>
                                                ))}
                                            </ListboxOptions>
                                        </Listbox>
                                    </div>
                                </div>
                                <div className='flex width-auto' style={{padding:'0 30px'}}>
                                    <div className='flex flex-25 align-center justify-content-center'>받는 사람</div>
                                    <div className="listBox-container">
                                        <input
                                            type="text"
                                            className="width-100 border rounded cursor-pointer"
                                            placeholder="받는 사람 검색"
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            onFocus={() => {
                                                setUserSearch('');
                                                setUserFocused(true);
                                                getUser('');
                                            }}
                                            onBlur={() => setTimeout(() => setUserFocused(false), 120)}
                                        />
                                        {userFocused ? (<>
                                            {user?.length > 0 && (
                                                <ul className="listBox-option">
                                                    {user?.filter(f=>f.user_idx !== (typeof window !== "undefined" ? sessionStorage.getItem("user_idx") : 0)).map((u) => (
                                                        <li
                                                            key={u.user_idx}
                                                            onClick={() => {
                                                                setSelectedUser(u.user_idx);
                                                                setUserSearch(u.user_name);
                                                            }}
                                                            className="listBox-option-item margin-0"
                                                        >
                                                            {u.user_name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {user?.length === 0 && userSearch && (
                                                <div className="position-absolute z-10 width-100 back-ground-white border px-2 py-1 h-over-sky">검색 결과 없음</div>
                                            )}
                                        </>):('')}
                                    </div>
                                </div>
                                <div className='flex width-auto margin-bottom-10' style={{padding:'0 30px'}}>
                                    <div className='flex flex-25 align-center justify-content-center'>제목</div>
                                    <div className="listBox-container" style={{cursor:'auto'}}>
                                        <input
                                            type="text"
                                            placeholder="제목"
                                            value={msgForm.msg_title}
                                            onChange={(e) => setMsgForm(prev=>({...prev,msg_title:e.target.value}))}
                                        />
                                    </div>
                                </div>
                                <div className='flex width-auto margin-bottom-10' style={{padding:'0 30px'}}>
                                    <div className='flex flex-25 align-center justify-content-center'>내용</div>
                                    <div className="listBox-container" style={{cursor:'auto'}}>
                                        <textarea
                                            className='width-100 border border-radius'
                                            style={{ width: '100%', background:'#fff' }}
                                            value={msgForm.msg_content}
                                            onChange={(e) => setMsgForm(prev=>({...prev,msg_content:e.target.value}))}/>
                                    </div>
                                </div>
                                <div className='flex width-100 margin-bottom-20' style={{padding:'0 30px'}}>
                                    <div className='flex flex-25 align-center justify-content-center'>
                                        <button className='btn width-fit' onClick={()=>setMsgType('list')}>뒤로가기</button>
                                    </div>
                                    <div className='flex justify-right'>
                                        <button className='btn width-fit' onClick={sendMsg}>보내기</button>
                                    </div>
                                </div>
                            </div>
                        }
                        {msgType==='detail' && selectedMsg !== null &&
                            <div className='flex flex-direction-col gap_20'>
                                {msgOption.idx === 1 &&
                                    <div className='flex width-auto flex-1' style={{padding:'0 30px'}}>
                                        <div className='flex flex-25 align-center justify-content-center'>보낸 사람</div>
                                        <div>{selectedMsg?.sender_name || ''}</div>
                                    </div>
                                }
                                {msgOption.idx === 2 &&
                                    <div className='flex width-auto flex-1' style={{padding:'0 30px'}}>
                                        <div className='flex flex-25 align-center justify-content-center'>받는 사람</div>
                                        <div>{selectedMsg?.receiver_name || ''}</div>
                                    </div>
                                }
                                {format(selectedMsg?.sent_at,'yyyy-MM-dd') === format(new Date(),'yyyy-MM-dd')?
                                    <div className='flex width-auto flex-1 ' style={{padding:'0 30px'}}>
                                        <div className='flex flex-25 align-center justify-content-center'>보낸 시간</div>
                                        <div>{dayjs(selectedMsg?.sent_at).tz('Asia/Seoul').format('HH:mm') || ''}</div>
                                    </div>
                                    :
                                    <div className='flex width-auto flex-1 ' style={{padding:'0 30px'}}>
                                        <div className='flex flex-25 align-center justify-content-center'>보낸 날짜</div>
                                        <div>{format(selectedMsg?.sent_at,'yyyy-MM-dd') || ''}</div>
                                    </div>
                                }

                                <div className='flex width-auto' style={{padding:'0 30px'}}>
                                    <div className='flex flex-25 align-center justify-content-center'>제목</div>
                                    <div>{selectedMsg?.msg_title || ''}</div>
                                </div>
                                <div className='flex width-auto' style={{padding:'0 30px'}}>
                                    <div className='flex flex-25 align-center justify-content-center'>내용</div>
                                    <div><textarea className='width-100 flex align-center' value={selectedMsg?.msg_content||''} readOnly={true}/></div>
                                </div>
                                <div className='flex width-100 margin-bottom-20' style={{padding:'0 30px'}}>
                                    <div className='flex justify-content-between'>
                                        <button className='btn width-fit' onClick={()=>setMsgType('list')}>뒤로가기</button>
                                        {msgOption.idx === 1 && <button className='btn width-fit' onClick={()=>{setMsgType('insert');setSelectedUser(selectedMsg.sender_idx);setUserSearch(selectedMsg.sender_name);console.log(selectedMsg);setSelectedImportant({idx:1, name:'일반'})}}>답장</button>}
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </>
                </div>
                }
            </div>
            </Draggable>
        </div>
    );
};

export default MsgModal;