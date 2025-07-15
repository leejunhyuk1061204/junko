'use client';
import React, { useState } from 'react';
import { uploadCapFile } from '../collectionAndPayment/CapService';
import '../../globals.css';

const CapFileUploadModal = ({ capIdx, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('파일을 선택해주세요.');
            return;
        }

        try {
            await uploadCapFile(capIdx, file);
            alert('파일 업로드 완료!');
            onSuccess();
            onClose();
        } catch (e) {
            console.error('업로드 실패:', e);
            alert('업로드 중 오류 발생');
        }
    };

    return (
        <div className="modal-cap">
            <h3>증빙 파일 업로드</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                />
                <button type="submit">업로드</button>
                <button type="button" onClick={onClose}>닫기</button>
            </form>
        </div>
    );
};

export default CapFileUploadModal;
