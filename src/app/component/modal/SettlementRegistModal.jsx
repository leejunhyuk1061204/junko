'use client';

import { useState } from 'react';
import axios from 'axios';
import '../../globals.css';

export default function SettlementRegistModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({
        custom_idx: '',
        settlement_day: '',
        total_amount: '',
        amount: ''
    });

    const [file, setFile] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');

            // 1. 정산 등록
            const res = await axios.post('http://localhost:8080/psRegister', form, {
                headers: { Authorization: token }
            });

            const { settlement_idx } = res.data.data;

            // 2. 파일 업로드
            if (file) {
                const formData = new FormData();
                formData.append('files', file);
                formData.append('type', 'settlement');

                await axios.post(
                    `http://localhost:8080/settlementFileUpload/${settlement_idx}/attachments`,
                    formData,
                    {
                        headers: {
                            Authorization: token,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            }

            alert('정산이 등록되었습니다!');
            onSuccess(); // 부모 컴포넌트에서 리스트 새로고침
            onClose();   // 모달 닫기

        } catch (err) {
            console.error('등록 실패:', err);
            alert('정산 등록 실패!');
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>정산 등록</h3>

                <input
                    type="text"
                    name="custom_idx"
                    placeholder="거래처 ID"
                    value={form.custom_idx}
                    onChange={handleChange}
                />

                <input
                    type="date"
                    name="settlement_day"
                    value={form.settlement_day}
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="total_amount"
                    placeholder="정산금액"
                    value={form.total_amount}
                    onChange={(e) => {
                        const val = e.target.value;
                        setForm({
                            ...form,
                            total_amount: val,
                            amount: val // 잔액도 자동 입력
                        });
                    }}
                />

                <input
                    type="number"
                    name="amount"
                    placeholder="잔액"
                    value={form.amount}
                    onChange={handleChange}
                />

                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                />

                <div className="modal-actions">
                    <button className="btn-blue" onClick={handleSubmit}>등록</button>
                    <button className="btn-gray" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
}
