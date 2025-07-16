'use client';

import { useState, useEffect } from 'react';
import '../../globals.css';
import SettlementRow from './SettlementRow';
import SettlementFilter from './SettlementFilter';
import axios from 'axios';
import SettlementRegistModal from "@/app/component/modal/SettlementRegistModal";
import SettlementDetailModal from "@/app/component/modal/SettlementDetailModal";
import SettlementChart from './SettlementChart';
import PdfPreviewModal from "@/app/component/modal/PdfPreviewModal";

export default function SettlementList() {
    const [list, setList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [showPdf, setShowPdf] = useState(false);

    const [filter, setFilter] = useState({
        status: '',
        customName: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchList();
    }, []);

    const fetchList = async () => {
        try {
            const res = await axios.get('http://localhost:8080/settlementList', {
                params: {
                    status: filter.status,
                    customName: filter.customName,
                    start: filter.startDate,
                    end: filter.endDate
                }
            });

            console.log("🔥 raw response:", res);
            console.log("🔥 res.data:", res.data);
            console.log("🔥 res.data.data:", res.data?.data);
            console.log("🔥 res.data.data.length:", res.data?.data?.length);

            setList(res.data.data || []);
        } catch (err) {
            console.error('리스트 조회 실패:', err);
            setList([]);
        }
    };

    const fetchDetail = async (idx) => {
        try {
            const res = await axios.get(`http://localhost:8080/${idx}`);
            setSelectedData(res.data.data);
        } catch (err) {
            console.error("상세 조회 실패:", err);
        }
    };

    const handleInputChange = (e) => {
        setFilter({ ...filter, [e.target.name]: e.target.value });
    };

    const handleDelete = async () => {
        if (!selectedData) return alert("삭제할 항목을 선택해주세요");
        const token = localStorage.getItem("accessToken");
        const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
        if (!confirmDelete) return;

        try {
            const res = await axios.delete(`http://localhost:8080/settlementDel/${selectedData.settlement_idx}`, {
                headers: { Authorization: token },
            });
            if (res.data.result === 'success') {
                alert("삭제 완료");
                setSelectedData(null);
                fetchList();
            } else {
                alert("삭제 실패: " + res.data.message);
            }
        } catch (err) {
            console.error("삭제 오류:", err);
        }
    };

    return (
        <div className="settlement-wrapper">
            <h2>정산 현황</h2>

            {/*  필터 컴포넌트 */}
            <SettlementFilter
                filter={filter}
                onChange={handleInputChange}
                onSearch={fetchList}
            />
            <SettlementChart data={list} />

            {showModal && (
                <SettlementRegistModal
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchList}
                />
            )}

            <SettlementDetailModal
                data={selectedData}
                onClose={() => setSelectedData(null)}
                showPdf={showPdf}
                setShowPdf={setShowPdf}
            />
            {selectedData && (
                <div className="settlement-bottom">
                    <button onClick={() => setShowPdf(true)} className="btn-blue">PDF 미리보기</button>
                </div>
            )}

            {showPdf && selectedData && (
                <PdfPreviewModal
                    settlementIdx={selectedData.settlement_idx}
                    templateIdx={1} // 임시
                    onClose={() => setShowPdf(false)}
                />
            )}
            {/* 리스트 출력 */}
            <table className="settlement-table">
                <thead>
                <tr>
                    <th>NO.</th>
                    <th>제목</th>
                    <th>진행상태</th>
                    <th>작성자</th>
                    <th>등록일</th>
                    <th>거래처</th>
                    <th>정산 마감일</th>
                </tr>
                </thead>
                <tbody>
                {list.map((item, index) => (
                    <SettlementRow
                        key={item.settlement_idx}
                        item={item}
                        index={index + 1}
                        onClick={() => fetchDetail(item.settlement_idx)}
                    />
                ))}
                </tbody>
            </table>

            <div className="settlement-bottom">
                <button className="btn-blue" onClick={() => setShowModal(true)}>작성하기</button>
                <button className="btn-red" onClick={handleDelete}>삭제</button>

            </div>

        </div>
    );
}

