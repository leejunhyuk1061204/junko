'use client';

import { useState, useEffect } from 'react';
import '../../globals.css';
import SettlementRow from './SettlementRow';
import SettlementFilter from './SettlementFilter';
import axios from 'axios';
import SettlementRegistModal from "@/app/component/modal/SettlementRegistModal";
import SettlementDetailModal from "@/app/component/modal/SettlementDetailModal";
import SettlementChart from './SettlementChart';

export default function SettlementList() {
    const [list, setList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null);

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

            {selectedData && (
                <SettlementDetailModal
                    data={selectedData}
                    onClose={() => setSelectedData(null)}
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
                        onClick={fetchDetail}
                    />
                ))}
                </tbody>
            </table>

            <div className="settlement-bottom">
                <button className="btn-blue" onClick={() => setShowModal(true)}>작성하기</button>
                <button className="btn-red">삭제</button>
            </div>

        </div>
    );
}

