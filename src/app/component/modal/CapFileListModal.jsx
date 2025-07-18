'use client';
import React, { useEffect, useState } from 'react';
import {
    getCapFileList,
    deleteCapFile,
    downloadCapFile
} from '../collectionAndPayment/CapService';
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
        <div className="entryRegist-modal">
            <div className="entryRegist-modal-box">
                <button className="entryRegist-modal-close" onClick={onClose}>×</button>
                <h3 className="entryRegist-modal-title">첨부파일 목록</h3>
                <table className="entryRegist-table">
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
                                    <button className="entryList-fabBtn blue"
                                            onClick={() => handleDownload(file.file_idx, file.ori_filename)}>
                                        ⬇ 다운로드
                                    </button>
                                    <button className="entryList-fabBtn red-del"
                                            onClick={() => handleDelete(file.file_idx)}>
                                        🗑 삭제
                                    </button>
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
