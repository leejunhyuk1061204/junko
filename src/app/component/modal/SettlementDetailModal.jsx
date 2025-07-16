'use client';
import '../../globals.css';
import {useState} from "react";
import SettlementEditModal from "@/app/component/modal/SettlementEditModal";
import PdfPreviewModal from "@/app/component/modal/PdfPreviewModal";

export default function SettlementDetailModal({ data, onClose }) {

    if (!data) return null;
    const [showPdf, setShowPdf] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    return (
        <div className="modal">
            <h2>정산 상세</h2>
            <p>정산 번호: {data.settlement_idx}</p>
            <p>상태: {data.status}</p>
            <p>거래처: {data.custom_name}</p>
            <p>정산일: {data.settlement_day}</p>

            <div className="settlement-bottom">
                <button onClick={() => setShowPdf(true)} className="btn-blue">PDF 미리보기</button>
                <button onClick={() => setShowEdit(true)} className="btn-blue">수정</button>
                <button onClick={onClose} className="btn-gray">닫기</button>
            </div>

            {showPdf && (
                <PdfPreviewModal
                    settlementIdx={data.settlement_idx}
                    templateIdx={1}
                    onClose={() => setShowPdf(false)}
                />
            )}
            {showEdit && (
                <SettlementEditModal
                    data={data}
                    onClose={() => setShowEdit(false)}
                    onSuccess={() => {
                        onClose();
                        setShowEdit(false);
                        fetchList();
                    }}
                />
            )}
        </div>
    );
}

