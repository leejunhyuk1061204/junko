'use client'
import React, {useEffect, useRef, useState} from 'react';
import axios from "axios";
import {useAlertModalStore} from "@/app/zustand/store";

const handleStatusList = [
    {idx:1,name:'처리중'},
    {idx:2,name:'처리완료'}
]

const returnStatusList = [
    {idx:1,name:'반품 처리'},
    {idx:2,name:'반품 없음'}
]

const HandleClaimModal = ({open,onClose,claim,getClaimList}) => {

    const {openModal,closeModal} = useAlertModalStore();
    const [user, setUser] = useState([]);
    const [selectedUser, setSelectedUser] = useState(0);
    const [userSearch, setUserSearch] = useState('');
    const [userName, setUserName] = useState('');
    const [userFocused, setUserFocused] = useState(false);

    const [custom, setCustom] = useState([]);
    const [customSearch, setCustomSearch] = useState('');
    const [customName, setCustomName] = useState('');
    const [customFocused, setCustomFocused] = useState(false);

    const [warehouse, setWarehouse] = useState([]);
    const [warehouseSearch, setWarehouseSearch] = useState('');
    const [warehouseName, setWarehouseName] = useState('');
    const [warehouseFocused, setWarehouseFocused] = useState(false);

    const [statusClicked, setStatusClicked] = useState(false);
    const statusRef = useRef(null);

    const [returnProductList, setReturnProductList] = useState([]);
    const [showClaimDetail, setShowClaimDetail] = useState(true);
    const [showClaimList, setShowClaimList] = useState(false);
    const [handleClaimList, setHandleClaimList] = useState([]);
    const [handleInsertForm, setHandleInsertForm] = useState({});
    const [mode, setMode] = useState(true);

    const [returnStatusFocused, setReturnStatusFocused] = useState(false);

    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        setUser([]);
        setSelectedUser(0);
        setUserSearch('');
        setUserName('');
        setUserFocused(false);

        setCustom([]);
        setCustomSearch('');
        setCustomName('');
        setCustomFocused(false);

        setWarehouse([]);
        setWarehouseSearch('');
        setWarehouseName('');
        setWarehouseFocused(false);

        setStatusClicked(false);
        setReturnProductList([]);
        setShowClaimDetail(true);
        setShowClaimList(false);
        setHandleClaimList([]);
        setHandleInsertForm({});
        setMode(true);

        onClose();
    };


    useEffect(() => {
        if(claim === null) return;
        console.log(claim);
        getReturnProductList();
        getHandleClaimList();
        getUser();
    }, [claim]);

    // 외부 클릭 감지
    const handleClickOutside = (e) => {
        if (statusRef.current && !statusRef.current.contains(e.target)) {
            setStatusClicked(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 창고 리스트
    const getWarehouse = async (searchText='') => {
        const {data} = await axios.post('http://192.168.0.122/warehouse/list',{page:1,warehouse_name:searchText, custom_type:'택배사'});
        setWarehouse(data.list);
        // console.log('창고 불러오기');
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setWarehouseName(warehouseSearch);
            // console.log('창고 검색');
        }, 300);

        return () => clearTimeout(timer);
    }, [warehouseSearch]);

    useEffect(() => {
        getWarehouse(warehouseName);
    }, [warehouseName]);

    // 거래처 리스트
    const getCustom = async (searchText='') => {
        const {data} = await axios.post(`http://192.168.0.122/custom/list2`,{custom_type:'택배사',search:searchText});
        // 택배사 메서드 하나 만들던가 ;;
        setCustom(data.list);
        console.log(data);
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setCustomName(customSearch);
            // console.log('거래처 검색');
        }, 300);

        return () => clearTimeout(timer);
    }, [customSearch]);

    useEffect(() => {
        getCustom(customName);
    }, [customName]);

    // user 리스트
    const getUser = async (searchText='') => {
        const {data} = await axios.post('http://192.168.0.122/users/list',{user_name:searchText});
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

    // 반품 상품 정보
    const getReturnProductList = async() => {
        const {data} = await axios.post('http://192.168.0.122/returnProduct/list',{claim_idx : claim.claim_idx||''});
        setReturnProductList(data.list);
        console.log(data.list);
    }

    // 처리 리스트
    const getHandleClaimList = async() => {
        const {data} = await axios.post('http://192.168.0.122/claimHandle/list',{claim_idx : claim.claim_idx||''});
        setHandleClaimList(data.list);
        console.log(data.list);
    }

    // 처리 등록 or 수정
    const handleInsert = () => {
        if(mode) {
            console.log(handleClaimList);
            if(handleClaimList?.length>0 && handleClaimList.some(v=>v.status === '처리완료')){
                return openModal({svg: '❗', msg1: '처리 등록', msg2: '처리 완료된 클레임은 처리 등록이 불가능합니다', showCancel: false});
            }
            if(handleInsertForm.returnStatus && (!handleInsertForm.custom_idx || !handleInsertForm.warehouse_idx)){
                return openModal({svg: '❗', msg1: '등록 실패', msg2: '택배사 또는 입고 창고를 확인해주세요', showCancel: false});
            }
            openModal({
                svg: '❓',
                msg1: '등록 확인',
                msg2: '등록 하시겠습니까?',
                showCancel: true,
                onConfirm: async() => {
                    closeModal();
                    setTimeout(async ()=>{
                        try {
                            const {data} = await axios.post('http://192.168.0.122/claimHandle/insert',{
                                claim_idx : claim.claim_idx,
                                user_idx : selectedUser,
                                handle_detail : handleInsertForm.handle_detail,
                                status : handleInsertForm.status,
                                returnStatus : handleInsertForm.returnStatus,
                                custom_idx : handleInsertForm.custom_idx||'',
                                warehouse_idx : handleInsertForm.warehouse_idx||''
                            },{
                                headers: {
                                    Authorization : sessionStorage.getItem("token")
                                }
                            });
                            console.log(data);
                            if (data.success) {
                                openModal({
                                    svg: '✔',
                                    msg1: '클레임 처리 등록',
                                    msg2: '처리 등록 완료되었습니다.',
                                    showCancel: false,
                                    onConfirm: () => {
                                        if(handleInsertForm.status==='처리완료'){
                                            getClaimList();
                                            handleClose();
                                        } else {
                                            getHandleClaimList();
                                        }
                                    }
                                });
                            } else {
                                openModal({
                                    svg: '❗',
                                    msg1: '등록 실패',
                                    msg2: '처리 등록에 실패했습니다.',
                                    showCancel: false,
                                });
                            }
                        } catch (err) {
                            openModal({
                                svg: '❗',
                                msg1: '오류',
                                msg2: err.response?.data?.message || err.message,
                                showCancel: false,
                            });
                        }
                    },100);
                }
            })
        } else if(!mode){
            openModal({
                svg: '❓',
                msg1: '변경 확인',
                msg2: '처리내용을 변경 하시겠습니까?',
                showCancel: true,
                onConfirm: async() => {
                    closeModal();
                    setTimeout(async ()=>{
                        try {
                            console.log(handleInsertForm);
                            const {data} = await axios.post('http://192.168.0.122/claimHandle/update',{
                                claim_handle_idx : handleInsertForm.idx,
                                user_idx : selectedUser,
                                handle_detail : handleInsertForm.handle_detail,
                                status : handleInsertForm.status,
                            },{
                                headers: {
                                    Authorization : sessionStorage.getItem("token")
                                }
                            });
                            console.log(data);
                            if (data.success) {
                                openModal({
                                    svg: '✔',
                                    msg1: '클레임 처리 변경',
                                    msg2: '처리 변경 완료되었습니다.',
                                    showCancel: false,
                                    onConfirm: () => {
                                        getHandleClaimList();
                                    }
                                });
                            } else {
                                openModal({
                                    svg: '❗',
                                    msg1: '변경 실패',
                                    msg2: '처리 변경에 실패했습니다.',
                                    showCancel: false,
                                });
                            }
                        } catch (err) {
                            openModal({
                                svg: '❗',
                                msg1: '오류',
                                msg2: err.response?.data?.message || err.message,
                                showCancel: false,
                            });
                        }
                    },100);
                }
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
                <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>클레임 처리</h3>
                <>

                    {/* 탭 내용 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <>
                            <div className='cursor-pointer' onClick={()=>setShowClaimDetail(!showClaimDetail)}><h3 className='text-align-left margin-left-5 font-bold' style={{fontSize:'18px'}}>클레임 정보</h3></div>
                            {showClaimDetail && (<>
                            <div className='flex flex-direction-col gap_20' style={{fontSize:'18px'}}>
                                <div className='flex justify-left'>
                                    <div className='max-width-80'><h3>주문번호 </h3></div>
                                    <div className='width-fit'> : {claim.sales_idx}</div>
                                </div>
                                <div className='flex justify-left'>
                                    <div className='max-width-80'><h3>타입</h3></div>
                                    <div className='width-fit'> : {claim.type}</div>
                                </div>
                                <div className='flex justify-left'>
                                    <div className='max-width-80'><h3>반품사유</h3></div>
                                    <div><textarea className='width-100' defaultValue={`: ${claim.claim_reason}`} style={{textAlign:'left'}}></textarea></div>
                                </div>
                            </div>
                            <div>
                                <div><h3 className='text-align-left margin-left-5 font-bold margin-bottom-20' style={{fontSize:'18px'}}>반품상품</h3></div>
                                <div>
                                    <table>
                                    <thead>
                                    <tr>
                                        <th>상품코드</th>
                                        <th>상품옵션</th>
                                        <th>상품수량</th>
                                        <th>교환옵션</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {returnProductList.map((product,i)=>(
                                        <tr key={i}>
                                            <td>{product.product_idx}</td>
                                            <td>{typeof product.product_option_idx ==='undefined' ? '없음':product.combined_name}</td>
                                            <td>{product.return_cnt}</td>
                                            <td>{typeof product.exchange_option === 'undefined'?'없음':product.exchange_name}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                </div>
                            </div>
                            </>)}
                            {showClaimList && (<>
                                <div><h3 className='text-align-left margin-left-5 font-bold' style={{fontSize:'18px'}}>클레임 처리내역</h3></div>
                                <div>
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>담당자</th>
                                            <th>처리내용</th>
                                            <th>처리일자</th>
                                            <th>처리상태</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {handleClaimList?.length > 0 ? '' : (
                                            <tr>
                                                <td colSpan={4}>처리내역이 없습니다</td>
                                            </tr>
                                        )}
                                        {handleClaimList?.map((handle,i)=>(
                                            <tr key={i} className='cursor-pointer'
                                                onClick={()=>{
                                                    console.log(handle,mode);
                                                    setMode(!mode);
                                                    if(mode){
                                                        setHandleInsertForm({handle_detail:handle.handle_detail,status:handle.status,idx:handle.claim_handle_idx,returnStatus:handle.return_status})
                                                        setSelectedUser(handle.user_idx);
                                                        setUserSearch(handle.user_name);
                                                        console.log(handle);
                                                    } else {
                                                        setHandleInsertForm({handle_detail:'',status:''})
                                                        setSelectedUser(0);
                                                        setUserSearch('');
                                                    }

                                                }}>
                                                <td>{handle.user_name}</td>
                                                <td>{handle.handle_detail}</td>
                                                <td>{handle.handle_date}</td>
                                                <td>{handle.status}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>)}
                            <div className='flex flex-direction-col gap_20' style={{fontSize:'18px'}}>
                                <div className='flex justify-content-between'>
                                    <div className='flex width-fit'>
                                        <div className='flex max-width-80 align-center'><h3>담당자</h3></div>
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
                                    <div className='flex width-fit gap_15'>
                                        <div className='flex width-fit align-center'><h3 className='white-space-nowrap'>상태</h3></div>
                                        <div className="listBox-container" ref={statusRef}>
                                            <input
                                                type="text"
                                                className="width-100 border rounded"
                                                placeholder="상태 선택"
                                                value={handleInsertForm.status||''}
                                                onClick={()=>setStatusClicked(true)}
                                                readOnly={true}
                                            />
                                            {statusClicked
                                                ? (
                                                    <ul className="listBox-option">
                                                        {handleStatusList.map((sl) => (
                                                            <li
                                                                key={sl.idx}
                                                                className="listBox-option-item margin-0"
                                                                onClick={(e)=>{
                                                                    e.stopPropagation();
                                                                    console.log("선택된 상태:", sl.name);
                                                                    setStatusClicked(false);
                                                                    setHandleInsertForm(prev=>({...prev,status:sl.name}))
                                                                }}
                                                            >
                                                                {sl.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ):('')}
                                        </div>
                                    </div>
                                    <div className='flex width-fit gap_15'>
                                        <div className='flex width-fit align-center'><h3 className='white-space-nowrap'>반품 여부</h3></div>
                                        <div>
                                            <div className="listBox-container">
                                                <input
                                                    type="text"
                                                    className="width-100 border rounded"
                                                    placeholder="반품 여부"
                                                    value={handleInsertForm?.returnStatus?'반품 처리':'반품 없음'||''}
                                                    onChange={(e) => setWarehouseSearch(e.target.value)}
                                                    onFocus={() => {
                                                        setReturnStatusFocused(true);
                                                    }}
                                                    onBlur={() => setTimeout(() => setReturnStatusFocused(false), 120)}
                                                />
                                                {returnStatusFocused ? (<>
                                                    {returnStatusList?.length > 0 && (
                                                        <ul className="listBox-option">
                                                            {returnStatusList?.map((rsl) => (
                                                                <li
                                                                    key={rsl.idx}
                                                                    onClick={() => {
                                                                        setHandleInsertForm(prev=>({...prev,returnStatus:rsl.name==='반품 처리'}));
                                                                        if(rsl.name ==='반품 없음'){

                                                                        }
                                                                        setReturnStatusFocused(false);
                                                                    }}
                                                                    className="listBox-option-item margin-0"
                                                                >
                                                                    {rsl.name}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    {warehouse?.length === 0 && warehouseSearch && (
                                                        <div className="position-absolute z-10 width-100 back-ground-white border px-2 py-1 h-over-sky">검색 결과 없음</div>
                                                    )}
                                                </>):('')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {handleInsertForm?.status ==='처리완료' && mode && handleInsertForm.returnStatus && (
                                    <div className='flex justify-content-between gap_20'>

                                        <div className='flex width-fit'>
                                            <div className='flex max-width-80 align-center'><h3>택배사</h3></div>
                                            <div className="listBox-container">
                                                <input
                                                    type="text"
                                                    className="width-100 border rounded"
                                                    placeholder="택배사 검색"
                                                    value={customSearch}
                                                    onChange={(e) => setCustomSearch(e.target.value)}
                                                    onFocus={() => {
                                                        setCustomFocused(true);
                                                        getCustom(customSearch);
                                                    }}
                                                    onBlur={() => setTimeout(() => setCustomFocused(false), 120)}
                                                />
                                                {customFocused ? (<>
                                                    {custom?.length > 0 && (
                                                        <ul className="listBox-option">
                                                            {custom?.map((c) => (
                                                                <li
                                                                    key={c.custom_idx}
                                                                    onClick={() => {
                                                                        setCustomSearch(c.custom_name);
                                                                        setHandleInsertForm(prev=>({...prev,custom_idx:c.custom_idx}));
                                                                    }}
                                                                    className="listBox-option-item margin-0"
                                                                >
                                                                    {c.custom_name}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    {custom?.length === 0 && customSearch && (
                                                        <div className="position-absolute z-10 width-100 back-ground-white border px-2 py-1 h-over-sky">검색 결과 없음</div>
                                                    )}
                                                </>):('')}
                                            </div>
                                        </div>
                                        <div className='flex width-fit gap_15'>
                                            <div className='flex width-fit align-center'><h3 className='white-space-nowrap'>입고 창고</h3></div>
                                            <div>
                                                <div className="listBox-container">
                                                    <input
                                                        type="text"
                                                        className="width-100 border rounded"
                                                        placeholder="창고 검색"
                                                        value={warehouseSearch}
                                                        onChange={(e) => setWarehouseSearch(e.target.value)}
                                                        onFocus={() => {
                                                            setWarehouseFocused(true);
                                                            getWarehouse(warehouseSearch);
                                                        }}
                                                        onBlur={() => setTimeout(() => setWarehouseFocused(false), 120)}
                                                    />
                                                    {warehouseFocused ? (<>
                                                        {warehouse?.length > 0 && (
                                                            <ul className="listBox-option">
                                                                {warehouse?.map((w) => (
                                                                    <li
                                                                        key={w.warehouse_idx}
                                                                        onClick={() => {
                                                                            setWarehouseSearch(w.warehouse_name);
                                                                            setHandleInsertForm(prev=>({...prev,warehouse_idx:w.warehouse_idx}));
                                                                        }}
                                                                        className="listBox-option-item margin-0"
                                                                    >
                                                                        {w.warehouse_name}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                            )}
                                                            {warehouse?.length === 0 && warehouseSearch && (
                                                            <div className="position-absolute z-10 width-100 back-ground-white border px-2 py-1 h-over-sky">검색 결과 없음</div>
                                                            )}
                                                    </>):('')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className='flex justify-left'>
                                    <div className='max-width-80 flex align-center'><h3>처리내용</h3></div>
                                    <div><textarea className='width-100 border-radius' defaultValue={handleInsertForm?.handle_detail||''} name='handle_detail' style={{textAlign:'left',border:'1px solid lightgray',minHeight:'100px'}} onChange={(e)=>setHandleInsertForm(prev=>({...prev,[e.target.name]:e.target.value}))}></textarea></div>
                                </div>
                                <div className='flex justify-content-center gap_15' style={{fontSize:'15px'}}>
                                    <button className='btn width-fit' onClick={()=>setShowClaimList(!showClaimList)}>처리내역</button>
                                    <button className='btn width-fit' onClick={handleInsert}>{mode ? '등록' : '수정'}</button>
                                </div>
                            </div>
                        </>
                    </div>
                </>
            </div>
        </div>
    );
};

export default HandleClaimModal;