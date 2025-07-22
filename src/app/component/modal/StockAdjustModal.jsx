'use client'
import React, {useEffect, useState} from 'react';
import axios from "axios";
import {useAlertModalStore} from "@/app/zustand/store";

const StockAdjustModal = ({open,onClose,stock,getStockSumList}) => {

    const {openModal,closeModal} = useAlertModalStore();
    const [user, setUser] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [userName, setUserName] = useState('');
    const [userFocused, setUserFocused] = useState(false);
    const [selectedUser, setSelectedUser] = useState(0);
    const [stockCnt, setStockCnt] = useState(0);

    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        setUser([]);
        setUserSearch('');
        setUserName('');
        setUserFocused(false);
        setSelectedUser(0);
        setStockCnt(0);

        onClose();
    };

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

    const insertStock = () => {
        openModal({
            svg: '❓',
            msg1: '재고조정 확인',
            msg2: '재고조정을 하시겠습니까?',
            showCancel: true,
            onConfirm: () => {
                closeModal();
                setTimeout(async () => {
                    try {
                        const {data} = await axios.post('http://localhost:8080/stock/insert',{
                            product_idx:stock.product_idx,
                            product_option_idx:typeof stock.product_option_idx === 'undefined' ? '':stock.product_option_idx,
                            warehouse_idx:stock.warehouse_idx,
                            zone_idx:stock.zone_idx,
                            manufacture:typeof stock.manufacture==='undefined'?null:stock.manufacture,
                            expiration:typeof stock.expiration==='undefined'?null:stock.expiration,
                            stock_cnt:Number(stockCnt),
                            type:"조정",
                            user_idx:selectedUser,
                        })
                        console.log(data);
                        if (!data.success) {
                            openModal({
                                svg: '❗',
                                msg1: '재고조정 실패',
                                msg2: '재고조정에 실패했습니다',
                                showCancel: false,
                            })
                        } else {
                            openModal({
                                svg: '✔',
                                msg1: '재고조정 성공',
                                msg2: '재고조정에 성공했습니다',
                                showCancel: false,
                                onConfirm: () => {
                                    getStockSumList();
                                    handleClose();
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
                }, 100);
            }
        })
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
                    width: '700px'
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
                <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>재고 조정</h3>
                <>

                    {/* 탭 내용 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <>
                            <div className='flex width-100'>
                                <div className='flex flex-25 align-center justify-content-center'>담당자</div>
                                <div className="listBox-container">
                                    <input
                                        type="text"
                                        className="width-100 border rounded"
                                        placeholder="담당자 검색"
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
                                                {user?.map((u) => (
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
                            <div className='flex margin-bottom-10'>
                                <div className='flex flex-25 align-center justify-content-center'>조정 수량</div>
                                <input type='text' className='border border-gray border-radius width-100' value={stockCnt||''} onChange={(e)=>setStockCnt(e.target.value)}/>
                            </div>
                            <div className='flex justify-content-center'><button className='btn width-fit' onClick={insertStock}>재고 조정</button></div>
                        </>
                    </div>
                </>
            </div>
        </div>
    );
};

export default StockAdjustModal;