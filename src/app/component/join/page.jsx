'use client'
import React, {useState} from 'react';
import Header from "@/app/header";

const sampleDepart = [
    {dept_idx:1 , dept_name:'인사부'},
    {dept_idx:2 , dept_name:'총무부'},
    {dept_idx:3 , dept_name:'기획부'},
    {dept_idx:4 , dept_name:'회계부'},
    {dept_idx:5 , dept_name:'생상관리부'},
];

const JoinPage = () => {

    const [joinForm, setJoinForm] = useState({
        id:'',
        pw:'',
        rePw:'',
        name:'',
        phone:'',
        dept:'',
        email:'',
    })

    const joinChange = (e) => {
        const { name, value } = e.target;
        setJoinForm({
            ...joinForm,
            [name]: value
        })
    }

    const join = () => {
        window.location.href = '/component/login';
    }

    return (
        <div className='page-background'>
            <Header/>
            <div className='wrap main-back padding-120 flex justify-content-center'>
                <div className='max-width-400'>
                    <div>
                        <img src="/logo.png" alt="logo" />
                    </div>
                    <div className='flex flex-direction-col'>
                        <div className='margin-bottom-10'><p className='text-align-left '>아이디</p></div>
                        <div className='margin-bottom-10 flex justify-content-between gap_20'>
                            <input style={{margin:'0'}} type='text' placeholder='아이디를 입력하세요' value={joinForm.id} name='id' onChange={e=>joinChange(e)}/>
                            <button className='white-space-nowrap cursor-pointer join-overRay-btn'>중복 확인</button>
                        </div>
                        <div><p className='text-align-left '>비밀번호</p></div>
                        <input type='password' placeholder='비밀번호를 입력하세요' value={joinForm.pw} name='pw' onChange={e=>joinChange(e)}/>
                        <div><p className='text-align-left '>비밀번호 확인</p></div>
                        <input type='password' placeholder='비밀번호를 다시 입력하세요' value={joinForm.rePw} name='rePw' onChange={e=>joinChange(e)}/>
                        <div><p className='text-align-left '>이름</p></div>
                        <input type='text' placeholder='이름을 입력하세요' value={joinForm.name} name='name' onChange={e=>joinChange(e)}/>
                        <div><p className='text-align-left '>연락처</p></div>
                        <input type='text' placeholder='연락처를 입력하세요' value={joinForm.phone} name='phone' onChange={e=>joinChange(e)}/>
                        <div><p className='text-align-left '>이메일</p></div>
                        <input type='text' placeholder='이메일을 입력하세요' value={joinForm.email} name='email' onChange={e=>joinChange(e)}/>
                        <div><p className='text-align-left '>부서</p></div>
                        <div className='margin-y-10'>
                            <select className='width-100 login-select' name='dept' onChange={e=>joinChange(e)}>
                                {sampleDepart && sampleDepart.map(dept => (
                                    <option key={dept.dept_idx} value={dept.dept_idx}>{dept.dept_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className='flex justify-content-center margin-y-10'>
                            <button className='login-btn' onClick={()=>join()}>회원가입</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinPage;