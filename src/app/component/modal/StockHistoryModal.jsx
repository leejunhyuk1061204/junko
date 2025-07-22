'use client'
import React, {useEffect, useState} from 'react';
import axios from "axios";
import Pagination from "react-js-pagination";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";

const typeFilterList = [
    {idx:1, name:'전체'},
    {idx:2, name:'입고'},
    {idx:3, name:'출고'},
    {idx:4, name:'반품'},
    {idx:5, name:'조정'},
]

const StockHistoryModal = ({open,onClose,stock}) => {

    const [stockHistory, setStockHistory] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedType, setSelectedType] = useState({idx:1, name:'전체'});

    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        onClose();
    };
    useEffect(() => {
        if(typeof stock ==='undefined') return;
        getStockHistory();
        console.log(stock);
    },[stock,selectedType])

    const getStockHistory = async () => {
        const {data} = await axios.post('http://localhost:8080/stock/list',{
            page:page,
            product_idx:stock?.product_idx || 0,
            product_option_idx:typeof stock.product_option_idx === 'undefined' ? '':stock.product_option_idx,
            warehouse_idx:stock.warehouse_idx||0,
            zone_idx:stock.zone_idx||0,
            manufacture:typeof stock.manufacture==='undefined'?null:stock.manufacture,
            expiration:typeof stock.expiration==='undefined'?null:stock.expiration,
            type:selectedType.name ==='전체' ? '' : selectedType.name,
        })
        console.log(data);
        setStockHistory(data.list);
        setTotal(data.total*10);
    }

    // 스테이터스 필터
    const handleTypeChange = (type) => {
        setSelectedType(type);
        setPage(1);
        getStockHistory();
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
                    width: '1200px'
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
                <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>재고 내역</h3>
                <>

                    {/* 탭 내용 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <>
                            {/* 상태필터 */}
                            <div className='flex justify-right'>
                                <div className="select-container" style={{marginRight:0}}>
                                    <Listbox value={selectedType} onChange={handleTypeChange}>
                                        <ListboxButton className="select-btn" style={{marginRight:0}}>{selectedType.name}</ListboxButton>
                                        <ListboxOptions className="select-option">
                                            {typeFilterList.map(option => (
                                                <ListboxOption key={option.idx} value={option} className="select-option-item">
                                                    {option.name}
                                                </ListboxOption>
                                            ))}
                                        </ListboxOptions>
                                    </Listbox>
                                </div>
                            </div>
                            <div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>번호</th>
                                            <th>상품코드</th>
                                            <th>상품명</th>
                                            <th>옵션명</th>
                                            <th>담당자</th>
                                            {typeof history.manufacture === 'undefined' ? '':<th>제조일자</th>}
                                            {typeof history.expiration === 'undefined' ? '':<th>유통기한</th>}
                                            <th>보관창고</th>
                                            <th>보관구역</th>
                                            <th>수량</th>
                                            <th>타입</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {stockHistory.map((history,i)=>(
                                        <tr key={i}>
                                            <td>{i+1}</td>
                                            <td>{history.product_idx}</td>
                                            <td>{history.product_name}</td>
                                            <td>{typeof history.product_option_idx === 'undefined' ? '없음':history.combined_name}</td>
                                            <td>{history.user_name}</td>
                                            {typeof history.manufacture === 'undefined' ? '':<td>history.manufacture</td>}
                                            {typeof history.expiration === 'undefined' ? '':<td>history.expiration</td>}
                                            <td>{history.warehouse_name}</td>
                                            <td>{history.zone_name}</td>
                                            <td>{history.stock_cnt}</td>
                                            <td>{history.type}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* 페이지네이션 */}
                            <div className="product-pagination flex justify-content-between gap_5 margin-bottom-10">
                                <div className='flex justify-content-center'>
                                    <Pagination
                                        activePage={page}
                                        itemsCountPerPage={10}
                                        totalItemsCount={total}
                                        pageRangeDisplayed={5}
                                        onChange={(page) => setPage(page)}  // set만!
                                    />
                                </div>
                            </div>
                        </>
                    </div>
                </>
            </div>
        </div>
    );
};

export default StockHistoryModal;