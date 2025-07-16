'use client';
import '../../globals.css';
import {useState} from "react";
import SettlementEditModal from "@/app/component/modal/SettlementEditModal";

export default function SettlementDetailModal({ data, onClose }) {
    if (!data) return null;
    const [showEdit, setShowEdit] = useState(false);

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>정산 상세</h3>
                <p>정산번호: {data.settlement_idx}</p>
                <p>거래처: {data.custom_name}</p>
                <p>정산일자: {data.settlement_day}</p>
                <p>총 금액: {data.total_amount}</p>
                <p>잔액: {data.amount}</p>
                <p>상태: {data.status}</p>

                <div className="modal-actions">
                    <button className="btn-blue" onClick={() => setShowEdit(true)}>수정</button>
                    <button onClick={onClose} className="btn-gray">닫기</button>
                </div>
                {showEdit && (
                    <SettlementEditModal
                        data={data}
                        onClose={() => setShowEdit(false)}
                        onSuccess={onSuccess}
                    />
                )}

            </div>
        </div>
    );
}

