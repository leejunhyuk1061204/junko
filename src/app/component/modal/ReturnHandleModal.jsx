'use client'
import React, {useEffect, useState} from 'react';
import axios from "axios";
import {useAlertModalStore} from "@/app/zustand/store";

const ReturnHandleModal = ({open,onClose,return_receive,getReturnList}) => {

    const {openModal, closeModal} = useAlertModalStore();

    const [user, setUser] = useState([]);
    const [selectedUser, setSelectedUser] = useState(0);
    const [userSearch, setUserSearch] = useState('');
    const [userName, setUserName] = useState('');
    const [userFocused, setUserFocused] = useState(false);

    const [zoneList, setZoneList] = useState([]);
    const [zoneFocused, setZoneFocused] = useState({});
    const [zoneSearch1,setZoneSearch1] = useState([]);
    const [zoneSearch2,setZoneSearch2] = useState('');

    const [returnProductList,setReturnProductList] = useState([]);
    const [handleForm,setHandleForm] = useState([]);
    const [selectedRow, setSelectedRow] = useState(0);

    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        setUser([]);
        setSelectedUser(0);
        setUserSearch('');
        setUserName('');
        setUserFocused(false);

        setZoneList([]);
        setZoneFocused({});
        setZoneSearch1([]);
        setZoneSearch2('');

        setReturnProductList([]);
        setHandleForm([]);
        setSelectedRow(0);

        onClose();
    };

    useEffect(() => {
        if(return_receive === null) return;
        getReturnProductList();
        getUser();
        getZoneList();
    }, [return_receive]);

    // 초기화
    useEffect(() => {
        if (!returnProductList || returnProductList.length === 0) return;
        const initialForm = returnProductList.map(p => ({
            product_idx: p.product_idx,
            product_option_idx:typeof p.product_option_idx === 'undefined'? 0 : p.product_option_idx,
            resell_cnt: 0,
            disposal_cnt: 0,
            disposal_reason: '',
            zone_idx: null,
        }));
        setHandleForm(initialForm);
        setZoneList(()=>
            returnProductList.map(p=>({
                warehouse_idx:0,
                zone_idx:0,
                zone_name:'',
            }))
        )
        setZoneSearch1(Array(returnProductList.length).fill(''));
    }, [returnProductList]);

    useEffect(() => {
        console.log('zoneList',zoneList);
    }, [zoneList]);

    // zone 리스트 가져오기
    const getZoneList = async (searchText='') => {
        const zone = await axios.post('http://localhost:8080/zone/list',{search:searchText});
        console.log('zone',zone.data);
        setZoneList(zone.data.list);
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setZoneSearch2(zoneSearch1[selectedRow]);
            // // console.log('유저 검색');
        }, 300);

        return () => clearTimeout(timer);
    }, [zoneSearch1[selectedRow]]);

    useEffect(() => {
        getZoneList(zoneSearch2);
    }, [zoneSearch2]);

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

    // 반품상품 목록
    const getReturnProductList = async() => {
        const {data} = await axios.get(`http://localhost:8080/returnReceiveProduct/list/${return_receive.claim_idx}`);
        console.log(data);
        setReturnProductList(data.list);
    }

    // returnHandleForm 입력
    const changeHandleForm = (i,key,value) => {
        setHandleForm(prev=>{
            const copy = [...prev];
            copy[i] = {
                ...copy[i],
                [key]:value
            };
            return copy;
        });
    }

    // returnHandle 등록
    const returnHandleInsert = () => {
        console.log(handleForm);
        if (!selectedUser) {
            return openModal({svg: '❗', msg1: '담당자 선택', msg2: '담당자를 선택해주세요.', showCancel: false});
        }

        if(handleForm?.[0].disposal_cnt === 0 && handleForm?.[0].resell_cnt === 0) {
            return openModal({svg: '❗', msg1: '수량 입력', msg2: '폐기 또는 재입고 수량을 입력해주세요.', showCancel: false});
        }

        if(handleForm?.[0].resell_cnt > 0 && handleForm?.[0].zone_idx == null){
            return openModal({svg: '❗', msg1: '구역 입력', msg2: '보관 구역을 입력해주세요.', showCancel: false});
        }

        openModal({
            svg: '❓',
            msg1: '변경 확인',
            msg2: '상태를 변경하시겠습니까?',
            showCancel: true,
            onConfirm: () => {
                closeModal();
                setTimeout(async()=>{
                    try {
                        const {data} = await axios.post('http://localhost:8080/returnReceive/update',{
                            return_receive_idx:return_receive.return_receive_idx,
                            status:"반품완료",
                            user_idx:selectedUser,
                            handle:handleForm
                        },{
                            headers: {
                                Authorization : (typeof window !== "undefined" ? sessionStorage.getItem("token") : "")
                            }
                        })
                        console.log(data);
                        if (!data.success) {
                            openModal({
                                svg: '❗',
                                msg1: '변경 실패',
                                msg2: '진행 상태 변경에 실패했습니다',
                                showCancel: false,
                            })
                        } else {
                            openModal({
                                svg: '✔',
                                msg1: '변경 성공',
                                msg2: '진행 상태 변경에 성공했습니다',
                                showCancel: false,
                                onConfirm: () => {
                                    closeModal();
                                    getReturnList();
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
                },100);
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
                    width: '1000px'
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
                <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>반품처리</h3>
                <>

                    {/* 탭 내용 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <>
                            {/* user_idx,product_idx,product_option_idx, disposal_cnt, resell_cnt, disposal_reason ,manufacture,expiration */}
                            <div className='flex flex-direction-col gap_20'>
                                <div className='flex align-center gap_15'>
                                    <div className='max-width-80 white-space-nowrap width'>담당자</div>
                                    <div className='flex-25'>
                                        <div className="listBox-container">
                                            <input
                                                type="text"
                                                className="width-100 border rounded"
                                                placeholder="담당자 검색"
                                                value={userSearch}
                                                onChange={(e) => setUserSearch(e.target.value)}
                                                onFocus={() => {
                                                    setUserFocused(true);
                                                    getUser(userSearch);
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
                                                                    setSelectedUser(u.user_idx)
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
                                </div>
                                <div>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>상품코드</th>
                                                <th>상품명</th>
                                                <th>옵션명</th>
                                                <th>폐기수량</th>
                                                <th>폐기사유</th>
                                                <th>재입고수량</th>
                                                <th>보관장소</th>
                                                <th>제조일자</th>
                                                <th>유통기한</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {returnProductList.map((product,i) => (
                                                <tr key={i}>
                                                    <td>{product.product_idx}</td>
                                                    <td>{product.product_name}</td>
                                                    <td>{typeof product.product_option_idx === 'undefined' ? '없음':product.combined_name}</td>
                                                    <td><input type='number' className='width-100' value={handleForm[i]?.disposal_cnt||''} onChange={(e)=>changeHandleForm(i,'disposal_cnt',e.target.value)}/></td>
                                                    <td><input type='text' className='border-none-important' value={handleForm[i]?.disposal_reason||''} onChange={(e)=>changeHandleForm(i,'disposal_reason',e.target.value)}/></td>
                                                    <td><input type='number' className='width-100' value={handleForm[i]?.resell_cnt||''} onChange={(e)=>changeHandleForm(i,'resell_cnt',e.target.value)}/></td>
                                                    <td>
                                                        {handleForm[i]?.resell_cnt === 0 ? '없음':
                                                        <div className="listBox-container">
                                                            <input
                                                                type="text"
                                                                className="width-100 border rounded"
                                                                placeholder="보관 장소"
                                                                value={zoneSearch1[i]||''}
                                                                onFocus={() => {
                                                                        setSelectedRow(i);
                                                                        setZoneFocused(prev => ({...prev, [i]: true}));
                                                                        setZoneSearch1(prev=>{
                                                                            const copy = [...prev];
                                                                            copy[i] = '';
                                                                            return copy;
                                                                        });
                                                                }}
                                                                onBlur={() => setTimeout(() => setZoneFocused(prev=>({...prev,[i]:false})), 120)}
                                                                disabled={handleForm[i]?.resell_cnt === 0}
                                                            />
                                                            {zoneFocused[i] ? (<>
                                                                {zoneList?.length > 0 && handleForm[i]?.resell_cnt > 0 && (
                                                                    <ul className="listBox-option">
                                                                        {zoneList?.map((z) => (
                                                                            <li
                                                                                key={z.zone_idx}
                                                                                className="listBox-option-item margin-0"
                                                                                onClick={() => {
                                                                                        setZoneSearch1(prev=>{
                                                                                            const copy = [...prev];
                                                                                            copy[i] = z.zone_name;
                                                                                            return copy;
                                                                                        });
                                                                                        changeHandleForm(i,'zone_idx',z.zone_idx);
                                                                                }}
                                                                            >
                                                                                {z.zone_name}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                                {zoneList?.length === 0 && (
                                                                    <div className="position-absolute z-10 width-100 back-ground-white border px-2 py-1 h-over-sky">검색 결과 없음</div>
                                                                )}
                                                            </>):('')}
                                                        </div>
                                                        }
                                                    </td>
                                                    <td>{handleForm[i]?.resell_cnt === 0 ? '없음':<input className='width-100' type='date' value={handleForm[i]?.manufacture||''} onChange={(e)=>changeHandleForm(i,'manufacture',e.target.value)} disabled={handleForm[i]?.resell_cnt === 0}/>}</td>
                                                    <td>{handleForm[i]?.resell_cnt === 0 ? '없음':<input className='width-100' type='date' value={handleForm[i]?.expiration||''} onChange={(e)=>changeHandleForm(i,'expiration',e.target.value)} disabled={handleForm[i]?.resell_cnt === 0}/>}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className='flex justify-content-center'><button className='btn width-fit' onClick={returnHandleInsert}>등록</button></div>
                            </div>
                        </>
                    </div>
                </>
            </div>
        </div>
    );
};

export default ReturnHandleModal;