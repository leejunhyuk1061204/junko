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
            { label: '소개', href: '/' },
        ],
        href: '/',
    },
    {
        title: '상품 / 공급관리',
        submenu: [
            { label: '운동기관 검색', href: '/' },
        ],
        href: '/',
    },
    {
        title: '재고관리',
        submenu: [
            { label: '캘린더', href: '/' },
        ],
        href: '/',
    },
    {
        title: '판매 / 주문관리',
        submenu: [
            { label: '공지사항 게시판', href: '/' },
        ],
        href: '/',
    },
    {
        title: '정산 / 회계관리',
        submenu: [
            { label: '공지사항 게시판', href: '/' },
        ],
        href: '/',
    },
    {
        title: '통계',
        submenu: [
            { label: '공지사항 게시판', href: '/' },
        ],
        href: '/',
    },
    {
        title: '문서 / 업무 관리',
        submenu: [
            { label: '공지사항 게시판', href: '/' },
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
        <div className="header wrap">
            <div className="flex justify-content-between main-back" >
                    <img src='/logo.png' alt ='Logo' width={200} className="logo box-sizing" />
                {token ? (
                    <div className="header-text flex align-center justify-right width-fit white-space-nowrap gap_10">
                        <div className="header-date-text">{date_time}</div>
                        <div></div>
                        <div><IoMailOutline/></div>
                        <div><BsPersonCircle/></div>
                        <div><IoSettingsOutline/></div>
                        <button onClick={handleLogout}>로그아웃</button>
                    </div>
                ):(
                    <div className="header-text flex align-center justify-right width-fit white-space-nowrap gap_10 margin-right-4
                    ">
                        <div className="header-date-text">{date_time}</div>
                        <div><img src='/run.png' alt='run' width={22}/></div>
                        <div><IoMailOutline/></div>
                        <div><BsPersonCircle/></div>
                        <div><IoSettingsOutline/></div>
                        <button>로그인</button>
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