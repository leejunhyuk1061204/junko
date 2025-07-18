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
            <div className="entryRegist-modal-box">
                <button className="entryRegist-modal-close" onClick={onClose}>×</button>
                <h2 className="entryRegist-modal-title">입금 / 지급 상세</h2>

                <table className="entryRegist-table">
                    <tbody>
                    <tr>
                        <th>일자</th>
                        <td>{detail.date}</td>
                    </tr>
                    <tr>
                        <th>유형</th>
                        <td style={{ color: detail.type === '수금' ? 'blue' : 'red' }}>{detail.type}</td>
                    </tr>
                    <tr>
                        <th>금액</th>
                        <td>{detail.amount.toLocaleString()}원</td>
                    </tr>
                    <tr>
                        <th>거래처</th>
                        <td>{detail.customName}</td>
                    </tr>
                    <tr>
                        <th>계좌</th>
                        <td>{detail.accountBank} / {detail.accountNumber}</td>
                    </tr>
                    <tr>
                        <th>전표</th>
                        <td>{detail.entryTitle || '-'}</td>
                    </tr>
                    <tr>
                        <th>메모</th>
                        <td>{detail.memo || '-'}</td>
                    </tr>
                    </tbody>
                </table>

                <h4 style={{ marginTop: '20px' }}>변경 이력</h4>
                <ul style={{ marginBottom: '20px' }}>
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
                        style={{ border: '1px solid #ccc', marginBottom: '16px' }}
                    ></iframe>
                ) : (
                    <p>PDF 생성 실패 또는 파일 없음</p>
                )}

                <button className="entryList-fabBtn gray" onClick={onClose}>닫기</button>
            </div>
        </div>
    );
};

export default CapDetailModal;
