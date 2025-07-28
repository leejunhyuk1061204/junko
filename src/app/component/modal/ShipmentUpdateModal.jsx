'use client'
import React, {useEffect, useState} from 'react';
import axios from "axios";
import {useAlertModalStore} from "@/app/zustand/store";

const ShipmentUpdateModal = ({open,onClose,shipment,getShipmentList}) => {

    const {openModal,closeModal} = useAlertModalStore();
    const [user, setUser] = useState([]);
    const [selectedUser, setSelectedUser] = useState(0);
    const [userSearch, setUserSearch] = useState('');
    const [userName, setUserName] = useState('');
    const [userFocused, setUserFocused] = useState(false);

    const [warehouse, setWarehouse] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(0);
    const [warehouseSearch, setWarehouseSearch] = useState('');
    const [warehouseName, setWarehouseName] = useState('');
    const [warehouseFocused, setWarehouseFocused] = useState(false);

    const [stockInfo, setStockInfo] = useState([]);
    const [shipmentProductList, setShipmentProductList] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState({bool:false,product:null});
    const [shipmentProductStockList, setShipmentProductStockList] = useState([]);

    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        setUser([]);
        setSelectedUser(0);
        setUserSearch('');
        setUserName('');
        setUserFocused(false);

        setWarehouse([]);
        setSelectedWarehouse(0);
        setWarehouseSearch('');
        setWarehouseName('');
        setWarehouseFocused(false);

        setStockInfo([]);
        setShipmentProductList([]);
        setSelectedProduct({bool:false,product:null});
        setShipmentProductStockList([]);
        onClose();
    };

    useEffect(()=>{
        if(shipment == null) return;
        getUser();
        getShipmentProductList();
    },[shipment])

    // user 리스트
    const getUser = async (searchText='') => {
        const {data} = await axios.post('http://localhost:8080/users/list',{user_name:searchText});
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

    // 창고 리스트
    const getWarehouse = async (searchText='') => {
        const {data} = await axios.post('http://localhost:8080/warehouse/list',{page:1,warehouse_name:searchText, custom_type:'택배사'});
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

    // stockInfo 입력
    const changeStockInfo = (product, e) => {
        const cnt = Number(e.target.value);
        if(cnt > product.stock_cnt){
            openModal({
                svg: '❗',
                msg1: '실패',
                msg2: '재고 수량보다 많습니다.',
                showCancel: false,
                onConfirm:()=>{changeStockInfo(product,e)}
            });
        }
        setStockInfo(prev => {
            const updated = [...prev];

            const matchIndex = updated.findIndex(item =>
                item.product_idx === product.product_idx &&
                item.zone_idx === product.zone_idx &&
                (item.product_option_idx || null) === (product.product_option_idx || null) &&
                (item.manufacture || '') === (product.manufacture || '') &&
                (item.expiration || '') === (product.expiration || '')
            );

            const newItem = {
                product_idx: product.product_idx,
                zone_idx: product.zone_idx,
                stock_cnt: cnt
            };

            if (product.product_option_idx) newItem.product_option_idx = product.product_option_idx;
            if (product.manufacture) newItem.manufacture = product.manufacture;
            if (product.expiration) newItem.expiration = product.expiration;

            if (matchIndex >= 0) {
                if (cnt <= 0) {
                    // 수량 0이면 제거
                    updated.splice(matchIndex, 1);
                } else {
                    updated[matchIndex].stock_cnt = cnt;
                }
            } else {
                if (cnt > 0) {
                    updated.push(newItem);
                }
            }

            console.log(updated);

            return updated;
        });
    };

    // 출고 상품 리스트 가져오기
    const getShipmentProductList = async() => {
        const {data} = await axios.get(`http://localhost:8080/shipmentProduct/list/${shipment.shipment_idx}`);
        console.log('shipmentProductList',data);
        setShipmentProductList(data.list);
    }

    // 상품 선택 됐을 때 가져오기
    useEffect(() => {
        getShipmentProductStockList();
    }, [selectedProduct]);

    // 선택된 상품의 재고 정보 가져오기
    const getShipmentProductStockList = async() => {
        const {data} = await axios.post('http://localhost:8080/shipmentProductStockList',{
            product_idx:selectedProduct?.product?.product_idx,
            product_option_idx: typeof selectedProduct?.product?.product_option_idx ==='undefined'? '' : selectedProduct?.product?.product_option_idx,
            warehouse_idx : selectedWarehouse
        });
        console.log('shipmentProductStockList',data);
        setShipmentProductStockList(data.list);
    }

    // 출고완료 후 재고 등록
    const insertStock = async() => {

        if (!shipment?.shipment_idx) {
            return openModal({svg: '❗', msg1: '오류', msg2: '출고 정보가 없습니다.', showCancel: false});
        }

        if (!selectedUser) {
            return openModal({svg: '❗', msg1: '담당자 선택', msg2: '담당자를 선택해주세요.', showCancel: false});
        }

        if (!selectedWarehouse) {
            return openModal({svg: '❗', msg1: '창고 선택', msg2: '출고 창고를 선택해주세요.', showCancel: false});
        }

        if (!stockInfo.length) {
            return openModal({svg: '❗', msg1: '출고 수량 입력', msg2: '출고할 수량을 입력해주세요.', showCancel: false});
        }

        if (shipmentProductList.some(product => (
            product.product_cnt !== stockInfo.filter(f => f.product_idx === product.product_idx && (typeof product.product_option_idx === 'undefined' ? true : f.product_option_idx === product.product_option_idx)).reduce((sum, curr) => sum + Number(curr.stock_cnt), 0)
        ))) {
            return openModal({svg: '❗', msg1: '출고 수량 불일치', msg2: '출고할 수량을 확인해주세요.', showCancel: false});
        }

        openModal({
            svg: '❓',
            msg1: '출고 완료 확인',
            msg2: '출고 상태를 변경 하시겠습니까?',
            showCancel: true,
            onConfirm: async() => {
                closeModal();
                setTimeout(async ()=>{
                    try {
                        const {data} = await axios.post('http://localhost:8080/shipment/update', {
                            shipment_idx: shipment.shipment_idx,
                            status: '출고완료',
                            user_idx: selectedUser,
                            warehouse_idx: selectedWarehouse,
                            stockInfo: stockInfo,
                        },{
                            headers: {
                                Authorization : sessionStorage.getItem("token")
                            }
                        });
                        console.log(data);
                        if (data.success) {
                            openModal({
                                svg: '✔',
                                msg1: '출고 완료',
                                msg2: '출고가 완료되었습니다.',
                                showCancel: false,
                                onConfirm: () => {
                                    getShipmentList();
                                    handleClose();
                                }
                            });
                        } else {
                            openModal({
                                svg: '❗',
                                msg1: '출고 실패',
                                msg2: '출고 상태 변경에 실패했습니다.',
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
                <h3 style={{fontSize: '15px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>출고 정보</h3>
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
                                <div className='flex align-center gap_15 margin-bottom-10'>
                                    <div className='max-width-80 white-space-nowrap'>출고 창고</div>
                                    <div className='flex-25'>
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
                                                                    setSelectedWarehouse(w.warehouse_idx);
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
                                <div className='margin-bottom-20'>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>상품코드</th>
                                                <th>상품이름</th>
                                                <th>옵션명</th>
                                                <th>출고수량</th>
                                                <th>합계</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {shipmentProductList.map((product,i)=>(
                                                <tr key={i} className='cursor-pointer'
                                                    onClick={() => {
                                                        const isSameProduct =
                                                            selectedProduct?.product?.product_idx === product.product_idx &&
                                                            (selectedProduct?.product?.product_option_idx ?? null) === (product.product_option_idx ?? null);

                                                        setSelectedProduct({
                                                            bool: !isSameProduct,
                                                            product: isSameProduct ? null : product,
                                                    });
                                                }}>
                                                    <td>{product.product_idx}</td>
                                                    <td>{product.product_name}</td>
                                                    <td>{typeof product.combined_name ==='undefined' ? '없음':product.combined_name}</td>
                                                    <td>{product.product_cnt}</td>
                                                    <td>{stockInfo.filter(f=>f.product_idx === product.product_idx && (typeof product.product_option_idx ==='undefined' ?true : f.product_option_idx === product.product_option_idx)).reduce((sum,curr)=>sum + Number(curr.stock_cnt),0)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {selectedProduct.bool && (
                                    <div className='margin-bottom-20'>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>상품코드</th>
                                                    <th>상품명</th>
                                                    <th>옵션명</th>
                                                    <th>제조일자</th>
                                                    <th>유통기한</th>
                                                    <th>재고수량</th>
                                                    <th>보관장소</th>
                                                    <th>출고수량</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {shipmentProductStockList && shipmentProductStockList.length > 0 && shipmentProductStockList?.map((product,i)=>(
                                                <tr key={i}>
                                                    <td>{product.product_idx}</td>
                                                    <td>{product.product_name}</td>
                                                    <td>{typeof product.combined_name === 'undefined' ? '없음':product.combined_name}</td>
                                                    <td>{typeof product.manufacture === 'undefined' ? '' : product.manufacture}</td>
                                                    <td>{typeof product.expiration === 'undefined' ? '' : product.expiration}</td>
                                                    <td>{product.stock_cnt}</td>
                                                    <td>{product.zone_name}</td>
                                                    <td><input type='number' className='width-100 hover-outline-none' max={product.stock_cnt}
                                                               value={ stockInfo.find(item =>
                                                        item.product_idx === product.product_idx &&
                                                        item.zone_idx === product.zone_idx &&
                                                        (item.product_option_idx || null) === (product.product_option_idx || null) &&
                                                        (item.manufacture || '') === (product.manufacture || '') &&
                                                        (item.expiration || '') === (product.expiration || '')
                                                        )?.stock_cnt || ''}
                                                               onChange={(e)=>changeStockInfo(product,e)}/></td>
                                                </tr>
                                            ))}
                                            {shipmentProductStockList && shipmentProductStockList.length <= 0 && (
                                                <tr>
                                                    <td colSpan={8}>재고 정보 없음</td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <div><button className='btn' onClick={insertStock}>완료</button></div>
                            </div>
                        </>
                    </div>
                </>
            </div>
        </div>
    );
};

export default ShipmentUpdateModal;