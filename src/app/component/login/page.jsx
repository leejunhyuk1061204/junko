'use client'
import React, {useState} from 'react';
import Header from "@/app/header";
import Link from "next/link";
import '../../globals.css';
import FindModal from "@/app/component/modal/FindModal";
import axios from "axios";
import {useAlertModalStore} from "@/app/zustand/store";

const sampleDepart = [
    {dept_idx:1 , dept_name:'인사부'},
    {dept_idx:2 , dept_name:'총무부'},
    {dept_idx:3 , dept_name:'기획부'},
    {dept_idx:4 , dept_name:'회계부'},
    {dept_idx:5 , dept_name:'생상관리부'},
];

const LoginPage = () => {

    const [find,setFind]=useState(false);
    const [tab, setTab]=useState('id');
    const [result,setResult]=useState(false);
    const [login, setLogin] = useState({
            id: '',
            pw: '',
        });
    const [findForm, setFindForm] = useState({
        id:'',
        email:'',
    })
    const {openModal} = useAlertModalStore();


    // 로그인
    const toggleLogin = async () =>{
        try {
            const {data} = await axios.post('http://localhost:8080/login',{user_id:login.id,pw:login.pw});
            console.log(data);
            if(data.success) {
                sessionStorage.setItem('loginId', login.id);
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('user_idx', data.user_idx);
                sessionStorage.setItem('user_name', data.user_name);
                location.href = '/';
            }else {
                openModal({
                    svg: '❗',
                    msg1: '로그인 실패',
                    msg2: '아이디 또는 비밀번호를 확인해주세요.',
                    showCancel: false,
                });
            }
        }catch(err){
            console.error("로그인 실패: ", err);
        }
    };

    // 로그인 form 입력
    const loginChange = (e) => {
        const {name, value} = e.target;
        setLogin({
            ...login,
            [name]: value
        });
        console.log(login);
    }

    // 찾기 form 입력
    const findChange = (e) => {
        const {name, value} = e.target;
        setFindForm({
            ...findForm,
            [name]: value
        });
    }

    // 찾기 모드 초기화
    const findReset = () =>{
        setFindForm({
            id : '',
            email : '',
        })
        setFind(false);
        setResult(false);
    }

    // 엔터
    const loginEnter = (e) => {
        console.log(e.keyCode);
        if(e.keyCode===13){
            toggleLogin();
        }
    }

    return (
        <div>
            <Header/>
            <div className='wrap main-back padding-120 flex justify-content-center page-background'>
                <div className='max-width-400'>
                    <div>
                        <img src="/logo.png" alt="logo" />
                    </div>
                    {!find ?(
                        /*로그인 화면*/
                    <div className='flex flex-direction-col'>
                        <div><p className='text-align-left '>아이디</p></div>
                        <div className='margin-bottom-10'><input type='text' placeholder='아이디를 입력하세요' value={login.id} name='id' onChange={e=>loginChange(e)}/></div>
                        <div><p className='text-align-left '>비밀번호</p></div>
                        <div className='margin-bottom-10'><input type='password' placeholder='비밀번호를 입력하세요' value={login.pw} name='pw' onChange={e=>loginChange(e)} onKeyUp={e=>loginEnter(e)}/></div>
                        {/*<div><p className='text-align-left '>부서</p></div>*/}
                        {/*<div className='margin-y-10'>*/}
                        {/*    <select className='width-100 login-select' id='dept' onChange={e=>loginChange(e)}>*/}
                        {/*        {sampleDepart && sampleDepart.map(dept => (*/}
                        {/*            <option key={dept.dept_idx} value={dept.dept_idx}>{dept.dept_name}</option>*/}
                        {/*        ))}*/}
                        {/*    </select>*/}
                        {/*</div>*/}
                        <div className='margin-bottom-10'>
                            <div className='flex flex-direction-row justify-right gap_10'>
                                <Link href='/component/join'><p className='login-link'>회원가입</p></Link>
                                <p className='login-link cursor-pointer' onClick={()=>setFind(true)}>아이디/비밀번호 찾기</p>
                            </div>
                        </div>
                        <div className='flex justify-content-center'>
                            <button className='login-btn white-space-nowrap' onClick={toggleLogin}>로그인</button>
                        </div>
                    </div>
                    ):(
                    <>
                    {!result ? (
                        <>
                            {/* 탭 버튼 */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '12px',
                                marginBottom: '24px'
                            }}>
                                <button
                                    className={`btn label white_color ${tab === 'id' ? 'bg_primary_color_2' : 'bg_primary_color_2'}`}
                                    style={{
                                        padding: '8px 20px',
                                        cursor: 'pointer',
                                        fontWeight: tab === 'id' ? 'bold' : 'normal'
                                    }}
                                    onClick={() => setTab('id')}
                                >
                                    아이디 찾기
                                </button>
                                <button
                                    className={`btn label white_color ${tab === 'pw' ? 'bg_primary_color_1' : 'bg_primary_color_2'}`}
                                    style={{
                                        padding: '8px 20px',
                                        cursor: 'pointer',
                                        fontWeight: tab === 'pw' ? 'bold' : 'normal'
                                    }}
                                    onClick={() => setTab('pw')}
                                >
                                    비밀번호 찾기
                                </button>
                            </div>
                                {/*아이디 / 비밀번호 찾기 화면*/}
                            <div className='flex flex-direction-col'>
                                {/*비밀번호 찾기면 아이디도 입력*/}
                                {tab === 'pw' &&
                                    (<>
                                        <div><p className='text-align-left margin-0'>아이디</p></div>
                                        <div className='margin-bottom-10'><input type='text' placeholder='아이디를 입력하세요' value={findForm.id} name='id' onChange={e=>findChange(e)}/></div>
                                    </>)}
                                <div><p className='text-align-left margin-0'>이메일</p></div>
                                <div className='margin-bottom-10'><input type='text' placeholder='이메일을 입력하세요' value={findForm.email} name='email' onChange={e=>findChange(e)}/></div>
                                <div className='flex justify-content-center gap_20'>
                                    <button className='login-find-btn' onClick={()=>setFind(false)}>뒤로가기</button>
                                    <button className='login-find-btn' onClick={()=>setResult(true)}>본인 인증</button>
                                </div>
                            </div>
                        </>
                            ) : (
                            /*결과 화면*/
                            <>
                                {/*아이디 찾기 일 경우*/}
                                {tab === 'id' &&
                                    <div className='flex flex-direction-col gap_10'>
                                        <div className='flex justify-content-center gap_10 padding-30 white-space-nowrap' style={{fontSize:'20px',textAlign:'center'}}>
                                            <p>회원님의 아이디는</p>
                                            <p style={{fontSize:'25px', textAlign:'center', color:'#006DCC'}}>12345</p>
                                            <p>입니다</p>
                                        </div>
                                        <div className='flex justify-content-center'><button className='login-btn cursor-pointer' style={{background:'#006DCC', color:'#fff'}} onClick={()=>findReset()}>로그인하기</button></div>
                                    </div>
                                }
                                {/*비밀번호 찾기 일 경우*/}
                                {tab === 'pw' &&
                                    <div className='flex flex-direction-col gap_10'>
                                        <div>
                                            <p className='text-align-left'>새 비밀번호</p>
                                            <input type='password'/>
                                        </div>
                                        <div>
                                            <p className='text-align-left'>비밀번호 확인</p>
                                            <input type='password'/>
                                        </div>
                                        <div className='flex justify-content-center'><button className='login-btn cursor-pointer' onClick={()=>findReset()}>비밀번호 변경하기</button></div>
                                    </div>}
                            </>
                            )}
                    </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;