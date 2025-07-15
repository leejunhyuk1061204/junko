'use client';
import React, { useEffect, useState } from 'react';
import CapSearchBar from './CapSearchBar';
import CapRegistModal from '@/app/component/modal/CapRegistModal';
import '../../globals.css'
import { searchCap } from './CapService';
import CapEditModal from "@/app/component/modal/CapEditModal";
import CapFileUploadModal from "@/app/component/modal/CapFileUploadModal";
import CapTable from "@/app/component/collectionAndPayment/CapTable";
import CapDetailPanel from "@/app/component/collectionAndPayment/CapDetailPanel";
import CapFileListModal from '@/app/component/modal/CapFileListModal';

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
        sortOrder: 'desc',
    });

    const [showModal, setShowModal] = useState(false); //  모달 열림 여부 상태
    const [editCapIdx, setEditCapIdx] = useState(null);
    const [fileCapIdx, setFileCapIdx] = useState(null);
    const [selectedCapIdx, setSelectedCapIdx] = useState(null);
    const [viewFileCapIdx, setViewFileCapIdx] = useState(null);


    const fetchData = async () => {
        try {
            const res = await searchCap(searchDto);
            const data = res.data;
            setCapList(Array.isArray(data.data) ? data.data : []);
        } catch (e) {
            console.error('조회 실패:', e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = (dto) => {
        setSearchDto(dto);
        fetchData();
    };

    const handleDelete = async (cap_idx) => {
        const token = localStorage.getItem('token');
        const confirm = window.confirm('정말 삭제하시겠습니까?');
        if (!confirm) return;

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

    return (
        <div className="cap-wrapper">
            <h2 className="cap-header">💰 입금 / 지급 관리</h2>

            <button onClick={() => setShowModal(true)}>➕ 등록</button> {/*  등록 버튼 */}

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
                </tr>
                </thead>
                <tbody>
                {Array.isArray(capList) && capList.length > 0 ? (
                    capList.map((item, index) => (
                        <tr key={item.cap_idx}>
                            <td>{index + 1}</td>
                            <td>{item.date}</td>
                            <td style={{ color: item.type === '수금' ? 'blue' : 'red' }}>{item.type}</td>
                            <td>{item.customName}</td>
                            <td>{item.amount.toLocaleString()}원</td>
                            <td>{item.entryTitle || '-'}</td>
                            <td>{item.memo || '-'}</td>
                            <td>
                                <button onClick={() => setEditCapIdx(item.cap_idx)}>✏ 수정</button>
                                <button onClick={() => setFileCapIdx(item.cap_idx)}>📎 파일첨부</button>
                                <button onClick={() => setViewFileCapIdx(item.cap_idx)}>📂 파일 보기</button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="7">데이터가 없습니다.</td>
                    </tr>
                )}
                </tbody>
            </table>
            {fileCapIdx && (
                <CapFileUploadModal
                    capIdx={fileCapIdx}
                    onClose={() => setFileCapIdx(null)}
                    onSuccess={fetchData}
                />
            )}
            {editCapIdx && (
                <CapEditModal
                    capIdx={editCapIdx}
                    onClose={() => setEditCapIdx(null)}
                    onSuccess={fetchData}
                />
            )}
            {/*  등록 모달 */}
            {showModal && (
                <CapRegistModal
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchData}
                />
            )}
            <CapTable
                capList={capList}
                onEdit={(idx) => setEditCapIdx(idx)}
                onFile={(idx) => setFileCapIdx(idx)}
            />

            {selectedCapIdx && (
                <CapDetailPanel
                    capIdx={selectedCapIdx}
                    onClose={() => setSelectedCapIdx(null)}
                />
            )}

            {viewFileCapIdx && (
                <CapFileListModal
                    capIdx={viewFileCapIdx}
                    onClose={() => setViewFileCapIdx(null)}
                />
            )}

        </div>
    );
};

export default CapList;
