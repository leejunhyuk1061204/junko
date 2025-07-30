'use client'
import React, {useEffect, useState} from 'react';
import axios from "axios";
import {format} from "date-fns";
import {useAlertModalStore} from "@/app/zustand/store";

const WorkInOutModal = ({open,onClose}) => {

    const {openModal} = useAlertModalStore();
    const [timecardList, setTimecardList] = useState([]);


    const today = new Date();

    useEffect(()=>{
        if(open===false) return;
        getTimeCardList();
    },[open])

    const getTimeCardList = async() => {
        const {data} = await axios.post('http://localhost:8080/timecard/list',{
            user_idx:Number((typeof window !== "undefined" ? sessionStorage.getItem("user_idx") : 0)),
            work_date: format(today,"yyyy-MM-dd"),
        });
        console.log('timecardList',data);
        setTimecardList(data.list ?? []);
    }

    const timecardInsert = async (bool) => {
        if(!bool && (timecardList?.some(f=>f.status === '퇴근'))){
            openModal({
                svg: '❗',
                msg1: '실패',
                msg2: '이미 퇴근하셨습니다.',
                showCancel: false,
            });
            return;
        }


        const {data} = await axios.post('http://localhost:8080/timecard/insert',{
            user_idx:(typeof window !== "undefined" ? sessionStorage.getItem("user_idx") : 0),
            status:bool?"출근":"퇴근"
        },{
            headers:{
                authorization: (typeof window !== "undefined" ? sessionStorage.getItem("token") : ""),
            }
        });
        console.log(data);
        getTimeCardList();
    }

    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        onClose();
    };

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
                background: 'rgba(0,0,0,0.3)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div
                className="modal_content"
                style={{
                    background: '#fff',
                    borderRadius: '10px',
                    padding: '40px 30px',
                    minWidth: '320px',
                    position: 'relative',
                    width: '500px'
                }}
            >
                <button
                    style={{
                        position: 'absolute',
                        right: 20,
                        top: 20,
                        background: 'none',
                        border: 'none',
                        fontSize: '3rem',
                        cursor: 'pointer'
                    }}
                    onClick={handleClose}
                >
                    ×
                </button>
                <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>근태관리</h3>
                <>

                    {/* 탭 내용 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' ,padding: '30px', paddingBottom: '15px' }}>
                        <div className='flex width-auto' style={{margin:'0 30px'}}>
                            <div className='flex flex-direction-col gap_10'>
                                <div className='text-align-left' style={{fontSize:'20px', fontWeight:'bold'}}>
                                    {(timecardList?.length===0 || timecardList?.every(v=>v.status !== '출근'&&v.status !=='지각'))? '오늘 근무': timecardList?.some(v=>v.status === '출근'||v.status === '지각') && timecardList?.every(v=>v.status !== '퇴근') ? '근무 중' : timecardList?.some(v=>v.status === '퇴근') ? '퇴근' : '오늘 근무' }
                                </div>
                                <div className='text-align-left margin-bottom-10'>{`${today.getMonth()<10 ? `0${today.getMonth()}월`:`${today.getMonth()}월`} ${today.getDate()}일`}</div>
                            </div>
                            <div className='flex flex-direction-col gap_5'>
                                {timecardList?.length === 0 && <div>출근 정보가 없습니다</div>}
                                {timecardList?.length > 0 &&
                                    timecardList?.map((t,i)=>(
                                        <div className='flex justify-content-between' key={i}>
                                            <div>{t.status||''}</div>
                                            <div>{t.work_time||''}</div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                        <div className='flex justify-content-center'>
                            {(timecardList?.length === 0 || timecardList?.every(v=>v.status !== '출근' && v.status !== '지각')) ?
                                <button className='btn width-fit' onClick={()=>timecardInsert(true)}>출근하기</button>
                                :
                                <button className='btn width-fit' onClick={()=>timecardInsert(false)}>퇴근하기</button>
                            }
                        </div>
                    </div>
                </>
            </div>
        </div>
    );
};

export default WorkInOutModal;