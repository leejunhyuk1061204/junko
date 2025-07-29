
'use client'

import axios from "axios";
import {useEffect, useState} from "react";

const DocumentDetailModal = ({html, onClose, onApprove, onReject, doc, user_idx}) => {
    const [currentApproverId, setCurrentApproverId] = useState(null);
    const [rejectReason, setRejectReason] = useState("");

    useEffect(() => {
        if (!doc) return;

        const fetchApprover = async () => {
            try {
                const {data} = await axios.get(`http://localhost:8080/document/currentApprover/${doc.document_idx}`);
                setCurrentApproverId(data.approver);
            } catch (err) {
                console.error("결재자 불러오기 실패", err);
            }
        };
        fetchApprover();

    }, [doc]);

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
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
                className="doc-modal-content"
                onClick={(e) => e.stopPropagation()} // 내부 클릭은 닫히는 이벤트 전파 막음
                style={{
                    background: '#fff',
                    borderRadius: '10px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    padding: '40px 30px',
                    minHeight: '50vh',
                    overflowY: 'auto',
                    position: 'relative',
                    width: '860px',
                }}
            >
                <button
                    style={{
                        position: 'absolute',
                        right: 20,
                        top: 20,
                        background: 'none',
                        border: 'none',
                        fontSize: '2.5rem',
                        cursor: 'pointer'
                    }}
                    onClick={onClose}
                >
                    &times;
                </button>

                {/*문서 내용 출력*/}
                <div
                    className="document-preview"
                    dangerouslySetInnerHTML={{ __html: html }}
                />

                {/*결재자만 버튼 노출*/}
                {user_idx === currentApproverId && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                            <button onClick={onClose} className="doc-detail-btn btn-danger">취소</button>
                            <button onClick={() => onApprove(doc.document_idx)} className="doc-detail-btn btn-primary">승인</button>
                            <button onClick={() => onReject(doc.document_idx, rejectReason)} className="doc-detail-btn btn-danger">반려</button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="반려 사유 입력"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

};

export default DocumentDetailModal;