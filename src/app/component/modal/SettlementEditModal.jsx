'use client';

import { useState } from 'react';
import axios from 'axios';
import '../../globals.css';

export default function SettlementEditModal({ data, onClose, onSuccess }) {
    const [form, setForm] = useState({
        settlement_day: data.settlement_day || '',
        total_amount: data.total_amount || '',
        amount: data.amount || '',
        status: data.status || '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        try {
            const res = await axios.put(`http://192.168.0.122:8080/settlementUpdate/${data.settlement_idx}`, form, {
                headers: {
                    Authorization: sessionStorage.getItem("token"),
                },
            });
            if (res.data.result === 'success') {
                alert("정산 수정 완료!");
                onSuccess();
                onClose();
            } else {
                alert("수정 실패: " + res.data.message);
            }
        } catch (err) {
            console.error("수정 실패", err);
        }
    };

    return (
        <div className="entryRegist-modal">
            <div className="entryRegist-modal-box">
                <button className="entryRegist-modal-close" onClick={onClose}>&times;</button>
                <h2 className="entryRegist-modal-title">정산 수정</h2>

                <table className="entryRegist-table">
                    <tbody>
                    <tr>
                        <th>정산일</th>
                        <td>
                            <input type="date" name="settlement_day" value={form.settlement_day} onChange={handleChange} />
                        </td>
                    </tr>
                    <tr>
                        <th>정산 금액</th>
                        <td>
                            <input type="number" name="total_amount" value={form.total_amount} onChange={handleChange} />
                        </td>
                    </tr>
                    <tr>
                        <th>잔액</th>
                        <td>
                            <input type="number" name="amount" value={form.amount} onChange={handleChange} />
                        </td>
                    </tr>
                    <tr>
                        <th>상태</th>
                        <td>
                            <select name="status" value={form.status} onChange={handleChange}>
                                <option value="미정산">미정산</option>
                                <option value="부분정산">부분정산</option>
                                <option value="정산">정산</option>
                            </select>
                        </td>
                    </tr>
                    </tbody>
                </table>

                <div className="flex justify-end gap-2">
                    <button className="entryList-fabBtn blue" onClick={handleUpdate}>저장</button>
                    <button className="entryList-fabBtn gray" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
}
