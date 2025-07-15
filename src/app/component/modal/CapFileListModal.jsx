'use client';
import React, { useEffect, useState } from 'react';
import { getCapFileList, deleteCapFile, downloadCapFile } from '../collectionAndPayment/CapService';
import '../../globals.css';

const CapFileListModal = ({ capIdx, onClose }) => {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const res = await getCapFileList(capIdx);
            setFiles(res.data);
        } catch (e) {
            console.error('파일 조회 실패:', e);
        }
    };

    const handleDownload = async (file_idx, filename) => {
        try {
            const res = await downloadCapFile(file_idx);
            const blob = new Blob([res.data]);
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
        } catch (e) {
            console.error('다운로드 실패:', e);
        }
    };

    const handleDelete = async (file_idx) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            await deleteCapFile(file_idx);
            alert('삭제 완료');
            fetchFiles();
        } catch (e) {
            console.error('삭제 실패:', e);
        }
    };

    return (
        <div className="modal-cap">
            <h3>첨부파일 목록</h3>
            {files.length > 0 ? (
                <ul>
                    {files.map(file => (
                        <li key={file.file_idx}>
                            📎 {file.ori_filename} ({new Date(file.reg_date).toLocaleString()})
                            <button onClick={() => handleDownload(file.file_idx, file.ori_filename)}>⬇</button>
                            <button onClick={() => handleDelete(file.file_idx)}>🗑</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>첨부된 파일이 없습니다.</p>
            )}
            <button onClick={onClose}>닫기</button>
        </div>
    );
};

export default CapFileListModal;
