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
            const res = await axios.post('http://localhost:8080/psRegister', form, {
                headers: { Authorization: token }
            });
            const { settlement_idx } = res.data.data;

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
            onSuccess();
            onClose();
        } catch (err) {
            console.error('등록 실패:', err);
            alert('정산 등록 실패!');
        }
    };

    return (
        <div className="entryRegist-modal">
            <div className="entryRegist-modal-box">
                <button className="entryRegist-modal-close" onClick={onClose}>&times;</button>
                <h2 className="entryRegist-modal-title">정산 등록</h2>

                <table className="entryRegist-table">
                    <tbody>
                    <tr>
                        <th>거래처 ID</th>
                        <td>
                            <input type="text" name="custom_idx" value={form.custom_idx} onChange={handleChange} />
                        </td>
                    </tr>
                    <tr>
                        <th>정산일</th>
                        <td>
                            <input type="date" name="settlement_day" value={form.settlement_day} onChange={handleChange} />
                        </td>
                    </tr>
                    <tr>
                        <th>정산 금액</th>
                        <td>
                            <input
                                type="number"
                                name="total_amount"
                                value={form.total_amount}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setForm({ ...form, total_amount: val, amount: val });
                                }}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>잔액</th>
                        <td>
                            <input type="number" name="amount" value={form.amount} onChange={handleChange} />
                        </td>
                    </tr>
                    <tr>
                        <th>첨부파일</th>
                        <td>
                            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                        </td>
                    </tr>
                    </tbody>
                </table>

                <div className="flex justify-end gap-2">
                    <button className="entryList-fabBtn blue" onClick={handleSubmit}>등록</button>
                    <button className="entryList-fabBtn gray" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
}
