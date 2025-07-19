'use client';
import React, { useEffect, useState } from 'react';
import CapSearchBar from './CapSearchBar';
import CapRegistModal from '@/app/component/modal/CapRegistModal';
import CapEditModal from '@/app/component/modal/CapEditModal';
import CapFileUploadModal from '@/app/component/modal/CapFileUploadModal';
import CapFileListModal from '@/app/component/modal/CapFileListModal';
import CapDetailModal from '@/app/component/modal/CapDetailModal';
import { searchCap, deleteCap } from './CapService';
import '../../globals.css';
import Pagination from 'react-js-pagination';

const CapList = () => {
    const [capList, setCapList] = useState([]);
    const [searchDto, setSearchDto] = useState({
        type: '',
        keyword: '',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: '',
        sortBy: 'date',
        sortOrder: 'desc'
    });

    const [showModal, setShowModal] = useState(false);
    const [editCapIdx, setEditCapIdx] = useState(null);
    const [fileCapIdx, setFileCapIdx] = useState(null);
    const [viewFileCapIdx, setViewFileCapIdx] = useState(null);
    const [selectedCapIdx, setSelectedCapIdx] = useState(null);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const fetchData = async () => {
        try {
            const res = await searchCap(searchDto);
            if (res.data && Array.isArray(res.data.data)) {
                setCapList(res.data.data);
                setTotalCount(res.data.data.length); // 또는 백엔드에서 전체 개수 제공 시 res.data.totalCount
            } else {
                setCapList([]);
                setTotalCount(0);
            }
        } catch (e) {
            console.error('조회 실패:', e);
        }
    };

    useEffect(() => {
        fetchData();
    }, [searchDto]);

    const handleSearch = (dto) => {
        setSearchDto(dto);
        setPage(1);
    };

    const handleDelete = async (cap_idx) => {
        const token = localStorage.getItem('token');
        if (!window.confirm('정말 삭제하시겠습니까?')) return;

        try {
            const res = await deleteCap(cap_idx, token);
            if (res.data.success) {
                alert('삭제 완료!');
                fetchData();
            } else {
                alert(res.data.message || '삭제 실패');
            }
        } catch (e) {
            console.error('삭제 오류:', e);
            alert('삭제 중 오류 발생');
        }
    };

    const offset = (page - 1) * limit;
    const currentList = capList.slice(offset, offset + limit);

    return (
        <div className="cap-wrapper">
            <h2 className="cap-header">입금 / 지급 관리</h2>

            <CapSearchBar onSearch={handleSearch} />

            <table className="cap-table">
                <thead>
                <tr>
                    <th>No</th>
                    <th>일자</th>
                    <th>유형</th>
                    <th>거래처</th>
                    <th>금액</th>
                    <th>전표</th>
                    <th>비고</th>
                    <th>관리</th>
                </tr>
                </thead>
                <tbody>
                {currentList.length > 0 ? (
                    currentList.map((item, index) => (
                        <tr
                            key={item.cap_idx}
                            onClick={() => setSelectedCapIdx(item.cap_idx)}
                            style={{ cursor: 'pointer' }}
                        >
                            <td>{offset + index + 1}</td>
                            <td>{item.date}</td>
                            <td style={{ color: item.type === '수금' ? 'blue' : 'red' }}>{item.type}</td>
                            <td>{item.customName}</td>
                            <td>{item.amount.toLocaleString()}원</td>
                            <td>{item.entryTitle || '-'}</td>
                            <td>{item.memo || '-'}</td>
                            <td onClick={(e) => e.stopPropagation()}>
                                <button className="cap-btn gray" onClick={() => setEditCapIdx(item.cap_idx)}>✏</button>
                                <button className="cap-btn blue" onClick={() => setFileCapIdx(item.cap_idx)}>📎</button>
                                <button className="cap-btn" onClick={() => setViewFileCapIdx(item.cap_idx)}>📂</button>
                                <button className="cap-btn red" onClick={() => handleDelete(item.cap_idx)}>🗑</button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="8">데이터가 없습니다.</td>
                    </tr>
                )}
                </tbody>
            </table>

            {showModal && <CapRegistModal onClose={() => setShowModal(false)} onSuccess={fetchData} />}
            {editCapIdx && <CapEditModal capIdx={editCapIdx} onClose={() => setEditCapIdx(null)} onSuccess={fetchData} />}
            {fileCapIdx && <CapFileUploadModal capIdx={fileCapIdx} onClose={() => setFileCapIdx(null)} onSuccess={fetchData} />}
            {viewFileCapIdx && <CapFileListModal capIdx={viewFileCapIdx} onClose={() => setViewFileCapIdx(null)} />}
            {selectedCapIdx && <CapDetailModal capIdx={selectedCapIdx} onClose={() => setSelectedCapIdx(null)} />}

            <div className="product-pagination">
                <Pagination
                    activePage={page}
                    itemsCountPerPage={limit}
                    totalItemsCount={totalCount}
                    pageRangeDisplayed={5}
                    onChange={(page) => setPage(page)}
                />
            </div>

            <button
                className="cap-fab"
                onClick={() => setShowModal(true)}
                title="등록"
            >
                등록
            </button>
        </div>
    );
};

export default CapList;
