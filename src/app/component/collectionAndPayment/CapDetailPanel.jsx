'use client';
import React, { useEffect, useState } from 'react';
import { getCapDetail, getCapLog, generatePdf } from '../collectionAndPayment/CapService';
import '../../globals.css';

const CapDetailPanel = ({ capIdx, onClose }) => {
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
            const res = await generatePdf(capIdx, 15); // 원하는 템플릿 idx
            const filename = res.data.new_filename || res.data.filename;
            const webPath = `/files/${filename}`; // 서버에서 static 서빙 경로 필요
            setPdfUrl(webPath);
        } catch (e) {
            console.error('PDF 미리보기 실패:', e);
            setPdfUrl(null);
        } finally {
            setLoading(false);
        }
    };

    if (!detail) return <div className="cap-panel">불러오는 중...</div>;

    return (
        <div className="cap-panel">
            <h3>상세 내역</h3>
            <ul>
                <li><strong>일자:</strong> {detail.date}</li>
                <li><strong>유형:</strong> {detail.type}</li>
                <li><strong>금액:</strong> {detail.amount.toLocaleString()}원</li>
                <li><strong>거래처:</strong> {detail.customName}</li>
                <li><strong>계좌:</strong> {detail.accountBank} / {detail.accountNumber}</li>
                <li><strong>전표:</strong> {detail.entryTitle}</li>
                <li><strong>메모:</strong> {detail.memo}</li>
            </ul>

            <h4>변경 이력</h4>
            <ul>
                {logs.length > 0 ? (
                    logs.map((log) => (
                        <li key={log.log_Idx}>
                            <strong>{log.actionType}</strong> ({log.regDate})
                        </li>
                    ))
                ) : (
                    <li>이력이 없습니다.</li>
                )}
            </ul>

            <h4>📄 PDF 미리보기</h4>
            {loading ? (
                <p>PDF 생성 중...</p>
            ) : pdfUrl ? (
                <iframe
                    src={pdfUrl}
                    width="100%"
                    height="500px"
                    title="PDF 미리보기"
                    style={{ border: '1px solid #ccc' }}
                ></iframe>
            ) : (
                <p>PDF 생성 실패 또는 파일 없음</p>
            )}

            <button onClick={onClose}>닫기</button>
        </div>
    );
};

export default CapDetailPanel;
