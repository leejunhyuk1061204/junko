'use client'

import React, {useEffect, useState} from 'react';
import './globals.css';
import {IoMailOutline, IoSettingsOutline} from "react-icons/io5";
import {BsPersonCircle} from "react-icons/bs";
import Link from "next/link";

const mainMenus = [
    {
        title: '인사 관리',
        submenu: [
            { label: '직원 정보 관리', href: '/' },
            { label: '부서 / 조직 관리', href: '/' },
            { label: '근태 / 출퇴근 관리', href: '/' },
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
            { label: '상품 옵션 / 카테고리 관리', href: '/' },
            { label: '거래처 관리', href: '/' },
            { label: '상품 관리', href: '/' },
            { label: '품절 / 재입고 관리', href: '/' },
            { label: '상품 신청 / 승인', href: '/' },
        ],
        href: '/',
    },
    {
        title: '재고관리',
        submenu: [
            { label: '재고 현황', href: '/' },
            { label: '입고 관리', href: '/' },
            { label: '출고 관리', href: '/' },
            { label: '재고 조정', href: '/' },
            { label: '재고 부족 / 품절 알림', href: '/' },
            { label: '안전 재고 설정', href: '/' },
            { label: '재고 회전율 통계', href: '/' },
        ],
        href: '/',
    },
    {
        title: '판매 / 주문관리',
        submenu: [
            { label: '주문 목록 / 상세보기', href: '/' },
            { label: '신규 / 예약 주문 ', href: '/' },
            { label: '출고 / 배송 관리', href: '/' },
            { label: '주문 상태 변경', href: '/' },
            { label: '대량 주문 처리', href: '/' },
            { label: 'CS / 클레임 처리', href: '/' },

        ],
        href: '/',
    },
    {
        title: '정산 / 회계관리',
        submenu: [
            { label: '정산 현황', href: '/' },
            { label: '거래처 / 공급사별 정산', href: '/' },
            { label: '세금 계산서 / 증빙 관리', href: '/' },
            { label: '입금 / 지급 관리', href: '/' },
            { label: '회계 전표 관리', href: '/component/accounting/entry' },
        ],
        href: '/',
    },
    {
        title: '통계',
        submenu: [
            { label: '매출 / 매입', href: '/' },
            { label: '판매 순위', href: '/' },
            { label: '고객 / 주문 / 공급사', href: '/' },
            { label: '재고', href: '/' },
            { label: 'KPI 달성', href: '/' },
            { label: '맞춤형 리포트', href: '/' },
        ],
        href: '/',
    },
    {
        title: '문서 / 업무 관리',
        submenu: [
            { label: '전자결재', href: '/' },
            { label: '업무별 TO-DO', href: '/' },
            { label: '문서 관리', href: '/' },
            { label: '업무 진행 현황', href: '/' },
            { label: '사내 공지 / 회의록', href: '/' },
            { label: '첨부파일 / 자료실', href: '/' },
        ],
        href: '/',
    },
];


const Header = () => {

    const [token, setToken] = useState(null);
    const [date_time, setDate_Time] = useState('');

    useEffect(() => {
        // 클라이언트에서만 sessionStorage 접근 가능
        if (typeof window !== 'undefined') {
            setToken(sessionStorage.getItem('token'));
        }
        curDate();
    }, []);


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
                    <div className="header-text flex align-center justify-right width-fit white-space-nowrap gap_15 margin-right-4">
                        <div className="header-date-text">{date_time}</div>
                        <div className='cursor-pointer'><img src='/run.png' alt='run' width={24}/></div>
                        <div className='cursor-pointer'><IoMailOutline/></div>
                        <div className='cursor-pointer'><BsPersonCircle/></div>
                        <div className='cursor-pointer'><IoSettingsOutline/></div>
                        <div className='header-login-text'>환영합니다 {sessionStorage.getItem('loginId')} 님</div>
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
                        <Link href={menu.href}>
                            <p className='menu-title'>
                                {menu.title}
                            </p>
                        </Link>
                        <div className='submenu'>
                            {menu.submenu.map((sub, subIdx) => (
                                <Link href={sub.href} key={subIdx}>
                                    <p className="submenu-item">{sub.label}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>
        </div>
    );
};

export default Header;