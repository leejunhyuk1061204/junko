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
            const res = await axios.put(`http://localhost:8080/settlementUpdate/${data.settlement_idx}`, form, {
                headers: {
                    Authorization: localStorage.getItem("accessToken"), // 경회가 쓰는 JWT 헤더 방식
                },
            });
            if (res.data.result === 'success') {
                alert("정산 수정 완료!");
                onSuccess(); // 리스트 새로고침
                onClose();
            } else {
                alert("수정 실패: " + res.data.message);
            }
        } catch (err) {
            console.error("수정 실패", err);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>정산 수정</h3>

                <label>정산일</label>
                <input type="date" name="settlement_day" value={form.settlement_day} onChange={handleChange} />

                <label>총 금액</label>
                <input type="number" name="total_amount" value={form.total_amount} onChange={handleChange} />

                <label>잔액</label>
                <input type="number" name="amount" value={form.amount} onChange={handleChange} />

                <label>상태</label>
                <select name="status" value={form.status} onChange={handleChange}>
                    <option value="미정산">미정산</option>
                    <option value="부분정산">부분정산</option>
                    <option value="정산">정산</option>
                </select>

                <div className="modal-actions">
                    <button className="btn-blue" onClick={handleUpdate}>저장</button>
                    <button className="btn-gray" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
}
