'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import SettlementEditModal from './SettlementEditModal';
import PdfPreviewModal from './PdfPreviewModal';
import '../../globals.css';

export default function SettlementDetailModal({ data, onClose, showPdf, setShowPdf }) {
    const [showEdit, setShowEdit] = useState(false);
    const [files, setFiles] = useState([]);
    const [logs, setLogs] = useState([]);

    if (!data) return null;

    useEffect(() => {
        fetchFiles();
        fetchLogs();
    }, []);

    const fetchFiles = async () => {
        try {
            const res = await axios.get(`http://192.168.0.122:8080/settlementFileList/${data.settlement_idx}`);
            setFiles(res.data.files || []);
        } catch (err) {
            console.error('파일 목록 조회 실패:', err);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await axios.get(`http://192.168.0.122:8080/settlementLogs/${data.settlement_idx}`);
            setLogs(res.data.logs || []);
        } catch (err) {
            console.error('로그 이력 조회 실패:', err);
        }
    };

    const handleFileDownload = (fileIdx) => {
        window.open(`http://192.168.0.122:8080/settlementFileDown/${fileIdx}`);
    };

    const handleFileDelete = async (fileIdx) => {
        const token = sessionStorage.getItem('token');
        try {
            await axios.delete(`http://192.168.0.122:8080/settlementFileDel/${fileIdx}`, {
                headers: { Authorization: token }
            });
            fetchFiles();
        } catch (err) {
            alert('파일 삭제 실패!');
            console.error(err);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            const res = await axios.post(`http://192.168.0.122:8080/settlementPdf`, null, {
                params: {
                    settlement_idx: data.settlement_idx,
                    template_idx: 1
                }
            });
            const link = document.createElement('a');
            link.href = `http://192.168.0.122:8080/static/pdf/${res.data.filename}`;
            link.download = res.data.filename;
            link.click();
        } catch (err) {
            alert('PDF 다운로드 실패');
            console.error(err);
        }
    };

    const handleConfirmSettlement = async () => {
        const token = sessionStorage.getItem('token');
        try {
            const res = await axios.post(`http://192.168.0.122:8080/settlementFinal/${data.settlement_idx}`, null, {
                headers: { Authorization: token }
            });
            alert(res.data.message);
            onClose();
        } catch (err) {
            alert('정산 확정 실패!');
            console.error(err);
        }
    };

    const handleRequestReopen = async () => {
        const token = sessionStorage.getItem('token');
        try {
            const res = await axios.post(`http://192.168.0.122:8080/settlementReq/${data.settlement_idx}`, null, {
                headers: { Authorization: token }
            });
            alert(res.data.message);
            onClose();
        } catch (err) {
            alert('재정산 요청 실패!');
            console.error(err);
        }
    };

    return (
        <div className="entryRegist-modal">
            <div className="entryRegist-modal-box">
                <button className="entryRegist-modal-close" onClick={onClose}>&times;</button>
                <h2 className="entryRegist-modal-title">정산 상세</h2>

                <table className="entryDetail-table">
                    <tbody>
                    <tr><th>정산 번호</th><td>{data.settlement_idx}</td></tr>
                    <tr><th>상태</th><td>{data.status}</td></tr>
                    <tr><th>거래처</th><td>{data.custom_name}</td></tr>
                    <tr><th>정산일</th><td>{data.settlement_day}</td></tr>
                    <tr><th>정산 금액</th><td>{data.total_amount}</td></tr>
                    <tr><th>잔액</th><td>{data.amount}</td></tr>
                    </tbody>
                </table>

                <div className="flex gap-2 justify-end mb-4">
                    <button className="entryList-fabBtn blue" onClick={() => setShowPdf(true)}>PDF 미리보기</button>
                    <button className="entryList-fabBtn gray" onClick={handleDownloadPdf}>PDF 다운로드</button>
                    <button className="entryList-fabBtn gray" onClick={() => setShowEdit(true)}>수정</button>
                    {data.status === '미정산' || data.status === '부분정산' ? (
                        <button className="entryList-fabBtn blue" onClick={handleConfirmSettlement}>정산 확정</button>
                    ) : null}
                    {data.status === '정산' ? (
                        <button className="entryList-fabBtn yellow" onClick={handleRequestReopen}>재정산 요청</button>
                    ) : null}
                </div>

                {/* 첨부파일 리스트 */}
                <h4>첨부파일</h4>
                <table className="entryDetail-table">
                    <thead>
                    <tr><th>파일명</th><th>등록일</th><th>다운로드</th><th>삭제</th></tr>
                    </thead>
                    <tbody>
                    {files.map((file) => (
                        <tr key={file.file_idx}>
                            <td>{file.ori_filename}</td>
                            <td>{file.reg_date}</td>
                            <td>
                                <button className="entryList-fabBtn gray small" onClick={() => handleFileDownload(file.file_idx)}>다운로드</button>
                            </td>
                            <td>
                                <button className="entryList-fabBtn red-del small" onClick={() => handleFileDelete(file.file_idx)}>삭제</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {/* 로그 이력 */}
                <h4 className="mt-4">정산 로그</h4>
                <table className="entryDetail-table">
                    <thead>
                    <tr><th>일시</th><th>변경자</th><th>상태</th><th>메모</th></tr>
                    </thead>
                    <tbody>
                    {logs.map((log, i) => (
                        <tr key={i}>
                            <td>{log.reg_date}</td>
                            <td>{log.user_name}</td>
                            <td>{log.status}</td>
                            <td>{log.memo}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>

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
                            setShowEdit(false);
                            onClose();
                        }}
                    />
                )}
            </div>
        </div>
    );
}
