'use client'

import axios from "axios";
import {useEffect, useState} from "react";

const DocumentDetailModal = ({html, onClose, onApprove, onReject, doc, user_idx}) => {
    const [currentApproverId, setCurrentApproverId] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [detail, setDetail] = useState({});
    const [approvalLine, setApprovalLine] = useState([]);

    const dateVal = detail.variables?.find(v => v.key.endsWith("date"))?.value || "-";

    useEffect(() => {
        if (!doc) return;

        const fetchDetailAndApprover = async () => {
            try {
                const [detailRes, approverRes] = await Promise.all([
                    axios.get(`http://192.168.0.122:8080/document/detail/${doc.document_idx}`),
                    axios.get(`http://192.168.0.122:8080/document/currentApprover/${doc.document_idx}`)
                ]);

                setDetail(detailRes.data.detail);
                setApprovalLine(detailRes.data.approvalLine);
                setCurrentApproverId(approverRes.data.approver);
            } catch (err) {
                console.error('문서 상세 조회 또는 결재자 불러오기 실패:', err);
            }
        };
        fetchDetailAndApprover();

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
                    maxHeight: '90vh',
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

                <div className="doc-template">
                    <div className="doc-title">전자결재</div>
                    <div className="flex margin-bottom-20">
                        <table className="document-top-table" style={{width:'35%', marginRight: 'auto'}}>
                            <tbody>
                            <tr>
                                <th>문서번호</th>
                                <td>{detail.document_idx}</td>
                            </tr>
                            <tr>
                                <th>부서</th>
                                <td>{detail.dept_name}</td>
                            </tr>
                            <tr>
                                <th>기안일</th>
                                <td>{detail.created_date?.split(' ')[0]}</td>
                            </tr>
                            <tr>
                                <th>기안자</th>
                                <td>{detail.user_name}</td>
                            </tr>
                            <tr>
                                <th>시행일자</th>
                                <td>
                                    {
                                        detail.variables?.find(v => v.key.endsWith("date"))?.value || "-"
                                    }
                                </td>
                            </tr>
                            <tr>
                                <th>결재내용</th>
                                <td>{detail.type}</td>
                            </tr>
                            </tbody>
                        </table>

                        <table className="approval-line-table" style={{width:'40%'}}>
                            <thead>
                            <tr>
                                <th>결재자</th>
                                <th>결재자</th>
                                <th>결재자</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                {[1, 2, 3].map((step) => {
                                    const approver = approvalLine.find((a) => a.step === step);
                                    return (
                                        <td key={step} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                            {approver ? (
                                                <>
                                                    <div>{approver.user_name}</div>
                                                    {approver.status === '승인' && (
                                                        <img src="/Approval.png" alt="승인도장" style={{ width: 85, marginTop: 2 }} />
                                                    )}
                                                </>
                                            ) : (
                                                <div style={{ color: '#aaa' }}>-</div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                            </tbody>
                        </table>

                    </div>

                    <table className="document-table">
                        <tbody>
                            <tr className="title-row">
                                <th className="title-header">제목</th>
                                <td className="title-cell">{detail.template_name}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="document-section-title">상 세 내 용</div>
                    <div className="document-content">
                        {/*문서 내용 출력*/}
                        <div
                            className="document-preview"
                            dangerouslySetInnerHTML={{__html: html}}
                        />
                    </div>
                </div>

                {/*결재자만 버튼 노출*/}
                {user_idx === currentApproverId && (
                    <div>
                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px'}}>
                            <button onClick={onClose} className="doc-detail-btn btn-danger">취소</button>
                            <button onClick={() => onApprove(doc.document_idx)}
                                    className="doc-detail-btn btn-primary">승인
                            </button>
                            <button onClick={() => onReject(doc.document_idx, rejectReason)}
                                    className="doc-detail-btn btn-danger">반려
                            </button>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', fontSize: '13px'}}>
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