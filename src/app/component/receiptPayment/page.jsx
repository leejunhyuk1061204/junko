'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from "@/app/header";
import Pagination from "react-js-pagination";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";

export default function ReceiptPaymentListPage() {
    const [receiptList, setReceiptList] = useState([]);
    const [paymentList, setPaymentList] = useState([]);
    const [selectedReceipts, setSelectedReceipts] = useState([]);
    const [selectedPayments, setSelectedPayments] = useState([]);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [filterMethod, setFilterMethod] = useState({ id: '', name: '수단 전체' });
    const [filterStatus, setFilterStatus] = useState({ id: '', name: '상태 전체' });

    const [page, setPage] = useState(1);
    const [receiptPage, setReceiptPage] = useState(1);
    const [paymentPage, setPaymentPage] = useState(1);
    const [pageSize] = useState(5);

    const methodOptions = [
        { id: '', name: '수단 전체' },
        { id: '이체', name: '이체' },
        { id: '현금', name: '현금' },
        { id: '기타', name: '기타' }
    ];

    const statusOptions = [
        { id: '', name: '상태 전체' },
        { id: '작성중', name: '작성중' },
        { id: '확정', name: '확정' }
    ];

    const fetchData = async () => {
        await axios.get('http://localhost:8080/receipt/list').then(res => {
            if (res.data.success) setReceiptList(res.data.list);
        });
        await axios.get('http://localhost:8080/payment/list').then(res => {
            if (res.data.success) setPaymentList(res.data.list);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filterList = (list) => {
        return list.filter(item => {
            const matchName = item.customer_name?.includes(searchKeyword);
            const matchMethod = filterMethod.id ? item.method === filterMethod.id : true;
            const matchStatus = filterStatus.id ? item.status === filterStatus.id : true;
            return matchName && matchMethod && matchStatus;
        });
    };

    const pagedList = (list, page) => {
        const start = (page - 1) * pageSize;
        return list.slice(start, start + pageSize);
    };

    const toggleReceiptSelect = (rp_idx) => {
        setSelectedReceipts(prev =>
            prev.includes(rp_idx) ? prev.filter(id => id !== rp_idx) : [...prev, rp_idx]
        );
    };

    const togglePaymentSelect = (rp_idx) => {
        setSelectedPayments(prev =>
            prev.includes(rp_idx) ? prev.filter(id => id !== rp_idx) : [...prev, rp_idx]
        );
    };

    const handleDelete = async () => {
        const selectedItems = [...selectedReceipts, ...selectedPayments];
        if (!selectedItems.length) return alert('삭제할 항목을 선택하세요.');
        if (!confirm('정말 삭제하시겠습니까?')) return;

        for (const id of selectedItems) {
            await axios.put(`http://localhost:8080/receipt/del/${id}`);
        }
        alert('삭제 완료');
        setSelectedReceipts([]);
        setSelectedPayments([]);
        fetchData();
    };

    const renderTable = (list, type, page, setPage, selectedItems, setSelectedItems, toggleSelect) => (
        <>
            <table className="basic-table margin-bottom-20">
                <thead>
                <tr>
                    <th>
                    <input
                        type="checkbox"
                        checked={pagedList(filterList(list), page).every(i => selectedItems.includes(i.rp_idx))}
                        onChange={(e) => {
                            const pageItems = pagedList(filterList(list), page);
                            const pageIds = pageItems.map(i => i.rp_idx);
                            if (e.target.checked) {
                                setSelectedItems(prev => [...new Set([...prev, ...pageIds])]);
                            } else {
                                setSelectedItems(prev => prev.filter(id => !pageIds.includes(id)));
                            }
                        }}
                    />
                    </th>
                    <th>번호</th>
                    <th>거래처</th>
                    <th>금액</th>
                    <th>수단</th>
                    <th>일자</th>
                    <th>상태</th>
                    <th>비고</th>
                    <th>수정</th>
                </tr>
                </thead>
                <tbody>
                {pagedList(filterList(list), page).map((item, idx) => (
                    <tr key={item.rp_idx}>
                        <td>
                        <input
                            type="checkbox"
                            checked={selectedItems.includes(item.rp_idx)}
                            onChange={() => toggleSelect(item.rp_idx)}
                        />
                        </td>
                        <td>{(page - 1) * pageSize + idx + 1}</td>
                        <td>
                            <span
                                className="text-link"
                                style={{ cursor: 'pointer', color: '#0070f3' }}
                                onClick={() => window.location.href = `./receiptPayment/detail/${item.rp_idx}`}
                            >
                                {item.customer_name}
                            </span>
                        </td>
                        <td>{item.amount.toLocaleString()}</td>
                        <td>{item.method}</td>
                        <td>{item.transaction_date}</td>
                        <td>{item.status}</td>
                        <td>{item.note}</td>
                        <td>
                            <button className="template-btn-small" onClick={() => window.location.href = `./receiptPayment/form?type=${type}&mode=update&rp_idx=${item.rp_idx}`}>
                                수정
                            </button>
                        </td>
                    </tr>
                ))}
                {pagedList(filterList(list), page).length < pageSize &&
                    Array.from({ length: pageSize - pagedList(filterList(list), page).length }).map((_, i) => (
                        <tr key={`empty-${i}`}><td colSpan={9} style={{ height: '45.5px' }}>&nbsp;</td></tr>
                    ))}
                </tbody>
            </table>
            <Pagination
                activePage={page}
                itemsCountPerPage={pageSize}
                totalItemsCount={filterList(list).length}
                pageRangeDisplayed={5}
                onChange={(p) => setPage(p)}
                innerClass="product-pagination flex justify-content-center gap_5 margin-bottom-20"
            />
        </>
    );

    return (
        <div className="productPage wrap page-background">
            <Header />
            <h3 className="text-align-left margin-bottom-10 margin-left-20">
                <span className="product-header">수금 / 지급 목록</span>
            </h3>
            <div className="product-list-back">

                <div className="margin-bottom-20 flex gap_10 align-center">
                    <div className="select-container">
                        <Listbox value={filterMethod} onChange={(val) => {
                            setFilterMethod(val);
                            setReceiptPage(1);
                            setPaymentPage(1);
                        }}>
                            <ListboxButton className="select-btn">{filterMethod.name}</ListboxButton>
                            <ListboxOptions className="select-option">
                                {methodOptions.map(option => (
                                    <ListboxOption key={option.id} value={option} className="select-option-item">
                                        {option.name}
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </Listbox>
                    </div>

                    <input
                        type="text"
                        className="product-input-search"
                        placeholder="거래처명 검색"
                        value={searchKeyword}
                        onChange={(e) => {
                            setSearchKeyword(e.target.value);
                            setReceiptPage(1);
                            setPaymentPage(1);
                        }}
                    />

                    <div className="select-container">
                        <Listbox value={filterStatus} onChange={(val) => {
                            setFilterStatus(val);
                            setReceiptPage(1);
                            setPaymentPage(1);
                        }}>
                            <ListboxButton className="select-btn">{filterStatus.name}</ListboxButton>
                            <ListboxOptions className="select-option">
                                {statusOptions.map(option => (
                                    <ListboxOption key={option.id} value={option} className="select-option-item">
                                        {option.name}
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </Listbox>
                    </div>
                </div>

                {/* 수금 */}
                <h3 className="text-align-left margin-bottom-10"><span className="product-header" style={{ fontSize: '20px'}}>[ 수금 리스트 ]</span></h3>
                {renderTable(receiptList, '수금', receiptPage, setReceiptPage, selectedReceipts, setSelectedReceipts, toggleReceiptSelect)}
                <div className="flex justify-right margin-bottom-20">
                    <button className="product-btn" onClick={() => window.location.href = `./receiptPayment/form?type=수금&mode=insert`}>
                        수금 등록
                    </button>
                </div>

                {/* 지급 */}
                <h3 className="text-align-left margin-bottom-10"><span className="product-header" style={{ fontSize: '20px'}}>[ 지급 리스트 ]</span></h3>
                {renderTable(paymentList, '지급', paymentPage, setPaymentPage, selectedPayments, setSelectedPayments, togglePaymentSelect)}
                <div className="flex justify-content-between margin-bottom-20">
                    <button className="product-btn-del" onClick={handleDelete}>선택 삭제</button>
                    <button className="product-btn" onClick={() => window.location.href = `./receiptPayment/form?type=지급&mode=insert`}>
                        지급 등록
                    </button>
                </div>
            </div>
        </div>
    );
}
