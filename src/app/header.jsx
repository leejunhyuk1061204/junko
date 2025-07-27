'use client'

import React, {useEffect, useRef, useState} from 'react';
import './globals.css';
import {IoMailOutline, IoMailUnreadOutline, IoSettingsOutline} from "react-icons/io5";
import {BsPersonCircle} from "react-icons/bs";
import Link from "next/link";
import axios from "axios";
import MsgModal from "@/app/component/modal/MsgModal";
import {CSSTransition} from "react-transition-group";
import WorkInOutModal from "@/app/component/modal/WorkInOutModal";

const mainMenus = [
    {
        title: '인사 관리',
        submenu: [
            { label: '직원 정보 관리', href: '/component/deptManager/list' },
            { label: '부서 / 조직 관리', href: '/component/deptManager' },
            { label: '근태 / 출퇴근 관리', href: '/component/timecard' },
            { label: '급여 / 상여 / 수당 관리', href: '/' },
            { label: '인사평가 / 성과 관리', href: '/' },
            { label: '휴가 / 연차 관리', href: '/' },
            { label: '입사 / 퇴사 / 변동 관리', href: '/' },
            { label: '전자결재(인사)', href: '/' },
        ],
        href: '/',
    },
    {
        title: '상품 / 공급관리',
        submenu: [
            { label: '상품 목록 / 등록 / 수정', href: '/component/product' },
            { label: '상품 옵션 / 카테고리 관리', href: '/component/category' },
            { label: '거래처 관리', href: '/component/custom' },
            { label: '상품 관리', href: '/' },
            { label: '품절 / 재입고 관리', href: '/' },
            { label: '상품 신청 / 승인', href: '/' },
        ],
        href: '/',
    },
    {
        title: '재고관리',
        submenu: [
            { label: '재고 현황', href: '/component/stock' },
            { label: '입고 관리', href: '/component/receive' },
            { label: '발주 관리', href: '/component/order' },
        ],
        href: '/',
    },
    {
        title: '판매 / 주문관리',
        submenu: [
            { label: '주문 목록 / 상세보기', href: '/component/sales' },
            { label: '출고 관리', href: '/component/shipment' },
            { label: 'CS / 클레임 처리', href: '/component/claim' },
            { label: '반품', href: '/component/return' },
        ],
        href: '/',
    },
    {
        title: '정산 / 회계관리',
        submenu: [
            { label: '정산 현황', href: '/component/entryStatus' },
            { label: '거래처 / 공급사별 정산', href: '/' },
            { label: '세금 계산서 / 증빙 관리', href: '/component/invoiceTax' },
            { label: '입금 / 지급 관리', href: '/component/receiptPayment' },
            { label: '회계 전표 관리', href: '/component/voucher' },
        ],
        href: '/',
    },
    {
        title: '대시보드',
        submenu: [
            { label: '통계 분석', href: '/component/chart' },
        ],
        href: '/',
    },
    {
        title: '문서 / 업무 관리',
        submenu: [
            { label: '전자결재', href: '/' },
            { label: '사내 캘린더', href: '/component/schedule' },
            { label: '문서 관리', href: '/component/document' },
            { label: '업무 진행 현황', href: '/' },
            { label: '사내 공지 / 회의록', href: '/' },
            { label: '첨부파일 / 자료실', href: '/component/template' },
        ],
        href: '/',
    },
];


const Header = () => {

    const [token, setToken] = useState(null);
    const [date_time, setDate_Time] = useState('');
    const [showMsg, setShowMsg] = useState(false);
    const [page, setPage] = useState(1);
    const [msgList, setMsgList] = useState([]);
    const [msgModalOpen, setMsgModalOpen] = useState({bool:false});
    const [msgCnt, setMsgCnt] = useState(0);
    const [showNotification, setShowNotification] = useState(false);
    const [workInOutModalOpen, setWorkInOutModalOpen] = useState(false);

    useEffect(() => {
        // 클라이언트에서만 sessionStorage 접근 가능
        if (typeof window !== 'undefined') {
            setToken(sessionStorage.getItem('token'));
        }
        curDate();
    }, []);

    useEffect(() => {
        if(token === null || typeof token === 'undefined') return;
        getMsgReceiveList();
    }, [token]);

    // 안읽은 msg 리스트 가져오기
    const getMsgReceiveList = async () => {
        const {data} = await axios.post('http://localhost:8080/msg/list',{
            type:'receive',
            user_idx:sessionStorage.getItem('user_idx') || 0,
            page:page,
            read_yn:false,
        });
        // console.log(data);
        setMsgList(data.list);
        setMsgCnt(data.list.length);
    }

    // 1분마다 메세지 검색
    useEffect(() => {
        const interval = setInterval(() => {
            getMsgReceiveList();
        },1000*60);

        return () => clearInterval(interval);
    },[])

    useEffect(() => {
        if(msgCnt > 0){
            setShowNotification(true);
            setTimeout(()=>{
                setShowNotification(false);
            },1000*3)
        }
    },[msgCnt])

    const curDate =() =>{
        const today = new Date();
        const formatDate = `${today.getFullYear()}-${today.getMonth()<10 ? `0${today.getMonth()}`:`${today.getMonth()}`}-${today.getDate()}`;
        const formatTime = `${today.getHours()}:${today.getMinutes()<10 ? `0${today.getMinutes()}`:`${today.getMinutes()}`}`;
        let formatDay = '';
        switch (today.getDay()){
            case 1: formatDay='월';
                break;
                
            case 2: formatDay='화';
                break;
            case 3: formatDay='수';
                break;
            case 4: formatDay='목';
                break;
            case 5: formatDay='금';
                break;
            case 6: formatDay='토';
                break;
            case 7: formatDay='일';
                break;
        }
        setDate_Time(`${formatDate} (${formatDay}) ${formatTime}`);
    }

    // 시간 갱신 타이머
    const startTimer = () => {
        setInterval(curDate, 1000*60);
    }

    startTimer();


    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user_id');
        setToken(null);
        window.location.href = '/';
    };

    return (
        <div className="header wrap main-back">
            <div className="flex justify-content-between " >
                <div className='width-fit cursor-pointer'>
                    <img src='/logo.png' alt ='Logo' width={160} className="header-logo box-sizing" onClick={()=>{window.location.href='/'}}/>
                </div>
                {token ? (
                    <div className="header-text flex align-center justify-right width-fit white-space-nowrap gap_15 margin-right-4 position-relative">
                        <div className="header-date-text">{date_time}</div>
                        <div className='cursor-pointer'><img src='/run.png' alt='run' width={24} onClick={()=>setWorkInOutModalOpen(true)}/></div>
                        <div className='cursor-pointer'>{msgCnt>0 ? <IoMailUnreadOutline onClick={()=>setShowMsg(!showMsg)}/> : <IoMailOutline onClick={()=>setShowMsg(!showMsg)}/>}</div>
                        {showMsg ? (<>
                            {msgList?.length > 0 && (
                                <ul className="listBox-option" style={{width:'50%',top:'90%',left:'70px'}}>
                                    {msgList?.map((msg,i) => (
                                        <li
                                            key={i}
                                            className="listBox-option-item margin-0 flex justify-content-between"
                                            style={{top:'90%',left:'70px', fontWeight:'normal'}}
                                            onClick={()=>{setMsgModalOpen({bool:true,type:'detail',msg:msg});setShowMsg(!showMsg)}}
                                        >
                                            <span className='margin-left-5'>{msg.msg_title}</span>
                                            <span className='margin-right-5'>{msg.sender_name}</span>
                                        </li>
                                    ))}
                                    <li className="listBox-option-item margin-0" style={{top:'90%',left:'70px'}} onClick={()=>{setMsgModalOpen({bool:true,type:'list'});setShowMsg(!showMsg)}}>열기</li>
                                </ul>
                            )}
                            {msgList?.length === 0 && (
                                <ul className="listBox-option" style={{width:'50%',top:'90%',left:'70px'}}>
                                    <li className="listBox-option-item margin-0" style={{top:'90%',left:'70px', fontWeight:'normal'}}>미확인 쪽지가 없습니다</li>
                                    <li className="listBox-option-item margin-0" style={{top:'90%',left:'70px'}}>열기</li>
                                </ul>
                            )}

                        </>):('')}
                        <div className='cursor-pointer'><BsPersonCircle/></div>
                        <div className='cursor-pointer'><IoSettingsOutline/></div>
                        <div className='header-login-text'>환영합니다  {sessionStorage.getItem('user_name')} 님</div>
                        <button className='cursor-pointer header-login-text' onClick={handleLogout}>로그아웃</button>
                    </div>
                ):(
                    <div className="header-text flex align-center justify-right width-fit white-space-nowrap gap_15 margin-right-4">
                        <div className="header-date-text">{date_time}</div>
                        <div className='cursor-pointer'><img src='/run.png' alt='run' width={22}/></div>
                        <div className='cursor-pointer'><IoMailOutline/></div>
                        <div className='cursor-pointer'><BsPersonCircle/></div>
                        <div className='cursor-pointer'><IoSettingsOutline/></div>
                        <button className='cursor-pointer header-login-text' onClick={()=>{window.location.href='/component/login'}}>로그인</button>
                    </div>
                )}
            </div>
            <nav className='navigation_bar flex'>
                {mainMenus.map((menu, idx) => (
                    <div className='menu-item margin-y-10 flex' key={idx}>
                        {/*<Link href={menu.href}>*/}
                            <p className='menu-title'>
                                {menu.title}
                            </p>
                        {/*</Link>*/}
                        {menu.submenu && menu.submenu.length > 0 && (
                            <div className='submenu'>
                                {menu.submenu.map((sub, subIdx) => (
                                    <Link href={sub.href} key={subIdx}>
                                        <p className="submenu-item">{sub.label}</p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
            <Notification show={showNotification} msgCnt={msgCnt}/>
            <MsgModal open={msgModalOpen.bool} onClose={()=>setMsgModalOpen({bool:false})} type={msgModalOpen.type} msg={msgModalOpen.msg} getUnreadMsg={getMsgReceiveList}/>
            <WorkInOutModal open={workInOutModalOpen} onClose={()=>setWorkInOutModalOpen(false)} />
        </div>
    );
};

const Notification = ({ show, msgCnt }) => {
    const notificationRef = useRef(null);

    return (
        <CSSTransition
            in={show}
            timeout={500}
            classNames="notification"
            unmountOnExit
            nodeRef={notificationRef}
        >
            <div className="notification" ref={notificationRef} style={{fontSize:'17px'}}>
                <p style={{marginTop:'10px'}}>{msgCnt} 개의 읽지 않은 메시지가 있습니다.</p>
            </div>
        </CSSTransition>
    );
};

export default Header;