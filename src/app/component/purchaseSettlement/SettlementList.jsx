'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from 'react-js-pagination';
import SettlementFilter from './SettlementFilter';
import SettlementDetailModal from '@/app/component/modal/SettlementDetailModal';
import SettlementRegistModal from '@/app/component/modal/SettlementRegistModal';
import PdfPreviewModal from '@/app/component/modal/PdfPreviewModal';
import '../../globals.css';

export default function SettlementList() {
    const [list, setList] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [filter, setFilter] = useState({ status: '', customName: '', startDate: '', endDate: '' });
    const [selectedData, setSelectedData] = useState(null);
    const [showRegistModal, setShowRegistModal] = useState(false);
    const [showPdf, setShowPdf] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);




    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };




    const toggleSelectAll = () => {
        if (selectedIds.length === list.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(list.map(item => item.settlement_idx));
        }
    };


    const fetchList = async (pageNum = 1) => {
        try {
            const res = await axios.get('http://192.168.0.122/settlementList', {
                params: {
                    status: filter.status,
                    customName: filter.customName,
                    start: filter.startDate,
                    end: filter.endDate
                }
            });
            const fullList = res.data.data || [];
            setList(fullList.slice((pageNum - 1) * limit, pageNum * limit));
            setTotalCount(fullList.length);
        } catch (err) {
            console.error('리스트 조회 실패:', err);
            setList([]);
        }
    };

    useEffect(() => { fetchList(page); }, [page]);

    const handleInputChange = (e) => {
        setFilter({ ...filter, [e.target.name]: e.target.value });
    };

    const handleDelete = async () => {
        if (!selectedData) return alert("삭제할 항목 선택 필요");
        const token = sessionStorage.getItem("token");
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        try {
            const res = await axios.delete(`http://192.168.0.122/settlementDel/${selectedData.settlement_idx}`, {
                headers: { Authorization: token },
            });
            if (res.data.result === 'success') {
                alert("삭제 완료");
                setSelectedData(null);
                fetchList(page);
            } else alert("삭제 실패: " + res.data.message);
        } catch (err) {
            console.error("삭제 오류:", err);
        }
    };

    return (
        <main className="entryList-container">
            <div className="entryList-title">정산 현황</div>
            <div className="entryList-layout">
                <section className="entryList-left">
                    <div className="entryList-searchBar">
                        <SettlementFilter filter={filter} onChange={handleInputChange} onSearch={() => fetchList(1)} />
                    </div>

                    <table className="entryList-table">
                        <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.length === list.length && list.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th>NO.</th>
                            <th>정산번호</th>
                            <th>상태</th>
                            <th>거래처</th>
                            <th>정산일</th>
                        </tr>
                        </thead>
                        <tbody>
                        {list.map((item, idx) => (
                            <tr
                                key={item.settlement_idx}
                                className={selectedIds.includes(item.settlement_idx) ? 'selected' : ''}
                            >
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(item.settlement_idx)}
                                        onChange={() => toggleSelect(item.settlement_idx)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </td>
                                <td>{(page - 1) * limit + idx + 1}</td>
                                <td className="entryList-entryNo link" onClick={() => setSelectedData(item)}>정산 #{item.settlement_idx}</td>
                                <td className={`status ${item.status}`}>{item.status}</td>
                                <td>{item.custom_name}</td>
                                <td>{item.settlement_day}</td>
                            </tr>
                        ))}
                        </tbody>

                    </table>

                    <div className="product-pagination">
                        <Pagination
                            activePage={page}
                            itemsCountPerPage={limit}
                            totalItemsCount={totalCount}
                            pageRangeDisplayed={5}
                            onChange={(page) => setPage(page)}
                        />
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button className="entryList-fabBtn blue" onClick={() => setShowRegistModal(true)}>정산 등록</button>
                        <button className="entryList-fabBtn red-del" onClick={handleDelete}>삭제</button>
                    </div>
                </section>

                {selectedData && (
                    <SettlementDetailModal
                        data={selectedData}
                        onClose={() => setSelectedData(null)}
                        showPdf={showPdf}
                        setShowPdf={setShowPdf}
                    />
                )}

                {showPdf && selectedData && (
                    <PdfPreviewModal
                        settlementIdx={selectedData.settlement_idx}
                        templateIdx={1}
                        onClose={() => setShowPdf(false)}
                    />
                )}

                {showRegistModal && (
                    <SettlementRegistModal
                        onClose={() => setShowRegistModal(false)}
                        onSuccess={() => fetchList(page)}
                    />
                )}
            </div>
        </main>
    );
}
