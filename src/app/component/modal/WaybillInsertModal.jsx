'use client'
import React, {useEffect, useState} from 'react';
import axios from "axios";
import {useAlertModalStore} from "@/app/zustand/store";

const WaybillInsertModal = ({open,onClose, idxList, getSalesList}) => {

    const {openModal,closeModal} = useAlertModalStore();
    const [waybillForm,setWaybillForm] = useState({});

    const [custom, setCustom] = useState([]);
    const [customSearch, setCustomSearch] = useState('');
    const [customName, setCustomName] = useState('');
    const [customFocused, setCustomFocused] = useState(false);

    const [warehouse, setWarehouse] = useState([]);
    const [warehouseSearch, setWarehouseSearch] = useState('');
    const [warehouseName, setWarehouseName] = useState('');
    const [warehouseFocused, setWarehouseFocused] = useState(false);

    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        setWaybillForm({});

        setCustom([]);
        setCustomSearch('');
        setCustomName('');
        setCustomFocused(false);

        setWarehouse([]);
        setWarehouseSearch('');
        setWarehouseName('');
        setWarehouseFocused(false);

        onClose();
    };

    // 거래처 리스트
    const getCustom = async (searchText='') => {
        const {data} = await axios.post(`http://localhost:8080/custom/list2`,{custom_type:'택배사',search:searchText});
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

    const insertWaybill = async () => {
         const {custom_idx,warehouse_idx} = waybillForm;
         const body = idxList.map(sales_idx => ({
            sales_idx,
             custom_idx,
            warehouse_idx,
         }));
         console.log(body);



        openModal({
            svg: '❓',
            msg1: '생성 확인',
            msg2: '송장을 생성하시겠습니까?',
            showCancel: true,
            onConfirm: async () => {
                try {
                    let result = [];
                    for (const b of body) {
                        const {data} = await axios.post('http://localhost:8080/waybill/insert', b);
                        console.log(data);
                        result.push(data.success);
                    }
                    closeModal();
                    setTimeout(() => {

                        if (result.length > 0 && result.every(v=>v === true)) {
                            openModal({
                                svg: '✔',
                                msg1: '생성 완료',
                                msg2: '송장이 생성되었습니다.',
                                showCancel: false,
                                onConfirm: () => {
                                    getSalesList();
                                }
                            });
                        } else if(result.length > 0 && result.some(v=>v === false)){
                            openModal({
                                svg: '❗',
                                msg1: '변경 실패',
                                msg2: '주문 변경에 실패했습니다.',
                                showCancel: false,
                            });
                        }
                    }, 100);
                    } catch (err) {
                        openModal({
                            svg: '❗',
                            msg1: '오류',
                            msg2: err.response?.data?.message || err.message,
                            showCancel: false,
                        });
                    }

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
                    padding: '40px 100px',
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
                <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>송장 정보</h3>
                <>

                    {/* 탭 내용 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px'}}>
                        <>
                            <div className='flex align-center gap_15'>
                                <div className='max-width-80 white-space-nowrap'>택배사</div>
                                <div>
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
                                                                setWaybillForm(prev=>({...prev,custom_idx: c.custom_idx}));
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
                            </div>
                            <div className='flex align-center gap_15'>
                                <div className='max-width-80 white-space-nowrap'>출고 창고</div>
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
                                                                setWaybillForm(prev=>({...prev,warehouse_idx:w.warehouse_idx}));
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
                            <div className='flex justify-content-center align-center'><button className='width-fit btn cursor-pointer' onClick={insertWaybill}>송장 생성</button></div>
                        </>
                    </div>
                </>
            </div>
        </div>
    );
};

export default WaybillInsertModal;