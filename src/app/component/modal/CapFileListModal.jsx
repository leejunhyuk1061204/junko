'use client';
import React, { useEffect, useState } from 'react';
import {
    getCapFileList,
    deleteCapFile,
    downloadCapFile
} from '../collectionAndPayment/CapService';
import '../../globals.css';
import axios from "axios";

const CapFileListModal = ({ capIdx, onClose }) => {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const res = await axios.get(`http://192.168.0.122:8080/file/list/collection/${capIdx}`);
            setFiles(res.data.list);
        } catch (e) {
            console.error('파일 조회 실패:', e);
        }
    };

    const handleDownload = async (file_idx, filename) => {
        const res = await axios.get(`http://192.168.0.122:8080/download/file/${file_idx}`, {
            params: { file_idx: file_idx, type: 'collection' },
            responseType: 'blob'
        });

        const blob = new Blob([res.data], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    const handleDelete = async (file_idx) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            await axios.put(`http://192.168.0.122:8080/file/del/collection/${file_idx}`);
            alert('삭제 완료');
            fetchFiles();
        } catch (e) {
            console.error('삭제 실패:', e);
        }
    };

    return (
        <div className="entryRegist-modal">
            <div className="entryRegist-modal-box" style={{ width: '780px'}}>
                <button className="entryRegist-modal-close" onClick={onClose}>×</button>
                <h3 className="entryRegist-modal-title">첨부파일 목록</h3>
                <table className="entryRegist-table" style={{ width: '700px'}}>
                    <thead>
                    <tr>
                        <th>파일명</th>
                        <th>등록일</th>
                        <th>관리</th>
                    </tr>
                    </thead>
                    <tbody>
                    {files.length > 0 ? (
                        files.map(file => (
                            <tr key={file.file_idx}>
                            <td>{file.ori_filename}</td>
                                <td>{new Date(file.reg_date).toLocaleString()}</td>
                                <td>
                                    <div>
                                        <button className="cap-file-btn margin-right-4"
                                                onClick={() => handleDownload(file.file_idx, file.ori_filename)}>
                                            ⬇ 다운로드
                                        </button>
                                        <button className="cap-file-del-btn"
                                                onClick={() => handleDelete(file.file_idx)}>
                                            🗑 삭제
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3">첨부된 파일이 없습니다.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
                <button className="entryList-fabBtn gray" onClick={onClose}>닫기</button>
            </div>
        </div>
    );
};

export default CapFileListModal;
