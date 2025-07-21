'use client';
import React, { useState } from 'react';
import { uploadCapFile } from '../collectionAndPayment/CapService';
import '../../globals.css';
import axios from "axios";

const CapFileUploadModal = ({ capIdx, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('파일을 선택해주세요.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            await axios.post(`http://localhost:8080/file/upload/collection/${capIdx}`, formData);
            alert('파일 업로드 완료!');
            onSuccess();
            onClose();
        } catch (e) {
            console.error('업로드 실패:', e);
            alert('업로드 중 오류 발생');
        }
    };

    return (
        <div className="entryRegist-modal">
            <div className="entryRegist-modal-box">
                <button className="entryRegist-modal-close" onClick={onClose}>×</button>
                <h3 className="entryRegist-modal-title">증빙 파일 업로드</h3>
                <form onSubmit={handleSubmit}>
                    <table className="entryRegist-table">
                        <tbody>
                        <tr>
                            <th>파일 선택</th>
                            <td>
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    required
                                />
                            </td>
                        </tr>
                        </tbody>
                    </table>

                    <button type="submit" className="entryList-fabBtn blue">업로드</button>
                    <button type="button" className="entryList-fabBtn gray" onClick={onClose}>닫기</button>
                </form>
            </div>
        </div>
    );
};

export default CapFileUploadModal;
