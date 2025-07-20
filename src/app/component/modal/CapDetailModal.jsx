'use client';
import React, { useEffect, useState } from 'react';
import { getCapDetail, getCapLog, generatePdf } from '../collectionAndPayment/CapService';
import '../../globals.css';

const CapDetailModal = ({ capIdx, onClose }) => {
    const [detail, setDetail] = useState(null);
    const [logs, setLogs] = useState([]);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDetail();
        fetchLog();
        generatePdfPreview();
    }, [capIdx]);

    const fetchDetail = async () => {
        const res = await getCapDetail(capIdx);
        setDetail(res.data.data);
    };

    const fetchLog = async () => {
        const res = await getCapLog(capIdx);
        setLogs(res.data.data);
    };

    const generatePdfPreview = async () => {
        try {
            const res = await generatePdf(capIdx, 15);
            const filename = res.data.new_filename || res.data.filename;
            const webPath = `/files/${filename}`;
            setPdfUrl(webPath);
        } catch (e) {
            console.error('PDF 미리보기 실패:', e);
            setPdfUrl(null);
        } finally {
            setLoading(false);
        }
    };

    if (!detail) return null;

    return (
        <div className="entryRegist-modal">
            <div className="capDetail-modal-box">
                {/* 좌측 */}
                <div className="capDetail-left">
                    <button className="entryRegist-modal-close" onClick={onClose}>×</button>
                    <h3 className="entryRegist-modal-title">입금 / 지급 상세</h3>

                    <table className="entryRegist-table">
                        <tbody>
                        <tr><th>일자</th><td>{detail.date}</td></tr>
                        <tr><th>유형</th><td style={{ color: detail.type === '수금' ? 'blue' : 'red' }}>{detail.type}</td></tr>
                        <tr><th>금액</th><td>{detail.amount.toLocaleString()}원</td></tr>
                        <tr><th>거래처</th><td>{detail.customName}</td></tr>
                        <tr><th>계좌</th><td>{detail.accountBank} / {detail.accountNumber}</td></tr>
                        <tr><th>전표</th><td>{detail.entryTitle || '-'}</td></tr>
                        <tr><th>메모</th><td>{detail.memo || '-'}</td></tr>
                        </tbody>
                    </table>

                    <h4 style={{ marginTop: '20px' }}>🔁 변경 이력</h4>
                    {logs.length > 0 ? (
                        <ul>
                            {logs.map((log) => (
                                <li key={log.log_Idx}>
                                    <strong>{log.actionType}</strong> ({log.regDate})
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>이력이 없습니다.</p>
                    )}

                    <button className="entryList-fabBtn gray" onClick={onClose}>닫기</button>
                </div>

                {/* 우측 */}
                <div className="capDetail-right">
                    <h3 className="capDetail-title">📄 PDF 미리보기</h3>
                    {loading ? (
                        <p>PDF 생성 중...</p>
                    ) : pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            className="capDetail-pdf"
                            title="PDF 미리보기"
                        />
                    ) : (
                        <p>PDF 없음 또는 생성 실패</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CapDetailModal;
