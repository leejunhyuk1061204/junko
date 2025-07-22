'use client'
import React, {useEffect, useState} from 'react';
import axios from "axios";
import {useAlertModalStore} from "@/app/zustand/store";

const receiveInputModal = ({open,onClose,idx,status,getReceiveList}) => {

    const {openModal,closeModal} = useAlertModalStore();
    const [receiveProducts, setReceiveProducts] = useState([]);
    const [info, setInfo] = useState([]);
    const [row, setRow] = useState(3);

    const [productList, setProductList] = useState([]);
    const [productFocused, setProductFocused] = useState({});
    const [optionFocused, setOptionFocused] = useState({});
    const [optionList, setOptionList] = useState({});

    const [zoneList, setZoneList] = useState([]);
    const [zoneFocused, setZoneFocused] = useState({});

    const [user, setUser] = useState([]);
    const [selectedUser, setSelectedUser] = useState({});
    const [userSearch, setUserSearch] = useState('');
    const [userName, setUserName] = useState('');
    const [userFocused, setUserFocused] = useState(false);

    useEffect(()=>{
        if(idx === 0) return;
        getReceiveProduct();
        getUser();
    },[idx])

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

    const updateInfo = async () => {
        openModal({
            svg: '❓',
            msg1: '변경 확인',
            msg2: '상태를 변경하시겠습니까?',
            showCancel: true,
            onConfirm: async() => {
                try {
                    console.log(info);
                    const {data} = await axios.post('http://localhost:8080/receive/update', {receive_idx: idx, status: status, stockInfo:info, user_idx:selectedUser})
                    console.log(data);
                    if (!data.success) {
                        openModal({
                            svg: '❗',
                            msg1: '변경 실패',
                            msg2: '진행 상태 변경에 실패했습니다',
                            showCancel: false,
                            onConfirm: () => {
                                closeModal();
                                handleClose();
                            }
                        })
                    } else {
                        openModal({
                            svg: '✔',
                            msg1: '변경 성공',
                            msg2: '진행 상태 변경에 성공했습니다',
                            showCancel: false,
                            onConfirm: () => {
                                closeModal();
                                getReceiveList();
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
                        onConfirm: () => {
                            closeModal();
                            handleClose();
                        }
                    })
                }
            }
        })
    }

    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        setReceiveProducts([]);
        setInfo([]);
        setRow(3);

        setProductList([]);
        setProductFocused({});
        setOptionFocused({});
        setOptionList({});

        setZoneList([]);
        setZoneFocused({});

        setUser([]);
        setSelectedUser({});
        setUserSearch('');
        setUserName('');
        setUserFocused(false);
        
        onClose();
    };

    // info 입력
    const changeInfo = (i,filed,value) => {
        // const {name,value} =e.target;
        setInfo((prev)=>{
            const updated = [...prev];
            const item = updated[i] || {};
            updated[i] = {
                ...item,
                [filed]:value
            }
            return updated;
        });
    }

    // idx로 receive_product 가져오기
    const getReceiveProduct = async () => {
        const {data} = await axios.post('http://localhost:8080/receiveProduct/list',{receive_idx:idx});
        console.log(idx);
        console.log('입고상품',data);
        setReceiveProducts(data.list);
        let filteredReceiveProduct = data.list.filter((item,index,self)=>self.findIndex(v=>v.product_idx === item.product_idx) === index);
        setProductList(filteredReceiveProduct);
        if(data.list.length > 0){
            const zone = await axios.post('http://localhost:8080/zone/list',{warehouse_idx:data.list[0].warehouse_idx});
            console.log(zone.data);
            setZoneList(zone.data.list);
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
                <h3 style={{fontSize: '15px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>입고 정보</h3>
                <>

                    {/* 탭 내용 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <>
                            <div>
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
                                <table>
                                    <thead>
                                        <tr>
                                            <th>상품 코드</th>
                                            <th>상품명</th>
                                            <th>옵션명</th>
                                            <th>수량</th>
                                            <th>보관 위치</th>
                                            <th>제조일자</th>
                                            <th>유통기한</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {Array.from({ length: row }, (_, i) => (
                                        <tr key={i}>
                                            <td>{info[i]?.product_idx || ''}</td>
                                            <td>
                                                <div className="listBox-container">
                                                    <input
                                                        type="text"
                                                        className="width-100 border rounded"
                                                        placeholder="입고 상품"
                                                        value={info[i]?.product_name || ''}
                                                        onFocus={() => {
                                                            setProductFocused(prev=>({...prev,[i]:true}));
                                                        }}
                                                        onBlur={() => setTimeout(() => setProductFocused(prev=>({...prev,[i]:false})), 120)}
                                                        readOnly={true}
                                                    />
                                                    {productFocused[i] ? (<>
                                                        {productList?.length > 0 && (
                                                            <ul className="listBox-option">
                                                                {productList?.map((pl) => (
                                                                    <li
                                                                        key={pl.receive_product_idx}
                                                                        onClick={() => {
                                                                            changeInfo(i,'product_name', pl.product_name);
                                                                            changeInfo(i,'product_idx', Number(pl.product_idx));
                                                                            if(typeof pl.product_option_idx === 'undefined'){
                                                                                changeInfo(i,'product_option_idx',null);
                                                                            } else {
                                                                                setOptionList(prev=>({...prev,[i]:receiveProducts.filter(f=>f.product_idx===pl.product_idx)}));
                                                                                if(receiveProducts.filter(f=>f.product_idx === pl.product_idx).length ===1){
                                                                                    changeInfo(i,'product_option_idx',Number(receiveProducts.filter(f=>f.product_idx === pl.product_idx)[0].product_option_idx));
                                                                                    changeInfo(i,'combined_name',receiveProducts.filter(f=>f.product_idx === pl.product_idx)[0].combined_name);
                                                                                }
                                                                            }
                                                                        }}
                                                                        className="listBox-option-item margin-0"
                                                                    >
                                                                        {pl.product_name}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                        {receiveProducts?.length === 0 && (
                                                            <div className="position-absolute z-10 width-100 back-ground-white border px-2 py-1 h-over-sky">검색 결과 없음</div>
                                                        )}
                                                    </>):('')}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="listBox-container">
                                                    <input
                                                        type="text"
                                                        className="width-100 border rounded"
                                                        placeholder="상품 옵션"
                                                        value={info[i]?.product_option_idx ? // 옵션 있어 ?
                                                            info[i]?.combined_name :
                                                            !info[i]?.product_idx ? // 상품은 선택 됐어 ?
                                                                '' :
                                                                info[i]?.product_option_idx === null ? // 선택된 상품에 옵션이 있어 ?
                                                                    '없음' :
                                                                    optionList[i]?.length === 1 ? // 선택된 상품의 옵션리스트가 하나야 ?
                                                                        optionList[i][0].combined_name : '옵션 선택'}
                                                        onFocus={() => {
                                                            setOptionFocused(prev=>({...prev,[i]:true}));
                                                            console.log(optionList);
                                                        }}
                                                        onBlur={() => setTimeout(() => setOptionFocused(prev=>({...prev,[i]:false})), 120)}
                                                        readOnly={true}
                                                    />
                                                    {optionFocused[i] && optionList[i]?.length > 1 ? (<>
                                                        {optionList[i]?.length > 0 && (
                                                            <ul className="listBox-option">
                                                                {optionList[i]?.map((option) => (
                                                                    <li
                                                                        key={option.product_option_idx}
                                                                        onClick={() => {
                                                                            changeInfo(i,'product_option_idx', Number(option.product_option_idx));
                                                                            changeInfo(i,'combined_name',option.combined_name);
                                                                        }}
                                                                        className="listBox-option-item margin-0"
                                                                    >
                                                                        {option.combined_name}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                        {optionList[i]?.length === 0 && (
                                                            <div className="position-absolute z-10 width-100 back-ground-white border px-2 py-1 h-over-sky">옵션 없음</div>
                                                        )}
                                                    </>):('')}
                                                </div>
                                            </td>
                                            <td>
                                                <input type='text' placeholder='수량 입력' value={info[i]?.stock_cnt || ''} onChange={e=>changeInfo(i,'stock_cnt',Number(e.target.value))} />
                                            </td>
                                            <td>
                                                <div className="listBox-container">
                                                    <input
                                                        type="text"
                                                        className="width-100 border rounded"
                                                        placeholder="보관 장소"
                                                        value={info[i]?.zone_name ? receiveProducts[0]?.warehouse_name +' '+info[i]?.zone_name : ''}
                                                        onFocus={() => {
                                                            setZoneFocused(prev=>({...prev,[i]:true}));
                                                        }}
                                                        onBlur={() => setTimeout(() => setZoneFocused(prev=>({...prev,[i]:false})), 120)}
                                                        readOnly={true}
                                                    />
                                                    {zoneFocused[i] ? (<>
                                                        {zoneList?.length > 0 && (
                                                            <ul className="listBox-option">
                                                                {zoneList?.map((z) => (
                                                                    <li
                                                                        key={z.zone_idx}
                                                                        onClick={() => {
                                                                            changeInfo(i,'zone_name', z.zone_name);
                                                                            changeInfo(i,'zone_idx', Number(z.zone_idx));
                                                                        }}
                                                                        className="listBox-option-item margin-0"
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
                                            </td>
                                            <td>
                                                <input type='date' placeholder='제조일자' value={info[i]?.manufacture || ''} onChange={e=>changeInfo(i,'manufacture',e.target.value)} />
                                            </td>
                                            <td>
                                                <input type='date' placeholder='유통기한' value={info[i]?.expiration || ''} onChange={e=>changeInfo(i,'expiration',e.target.value)} />
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                <div className='flex justify-right margin-y-20'><button className='btn' onClick={()=>setRow(row+1)}>상품 추가</button></div>
                                <div><button className='btn' onClick={updateInfo}>완료</button></div>
                            </div>
                        </>
                    </div>
                </>
            </div>
        </div>
    );
};

export default receiveInputModal;