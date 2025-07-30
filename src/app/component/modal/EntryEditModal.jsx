'use client'

import { useEffect, useState } from "react"
import axios from "axios"

export default function EntryEditModal({ open, onClose, entry, onSuccess }) {
    const [form, setForm] = useState({
        entry_type: '',
        amount: '',
        entry_date: '',
        custom_name: '',
        customer_name: ''
    });



    useEffect(() => {
        if (entry) {
            setForm({
                entry_type: entry.entry_type || '',
                amount: entry.amount || '',
                entry_date: entry.entry_date?.slice(0, 10) || '',
                custom_name: entry.custom_name || '',
                customer_name: entry.customer_name || ''
            });
        }
    }, [entry]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    }

    const handleSubmit = async () => {
        if (!form.entry_type || !form.amount || !form.entry_date) {
            alert("필수 항목을 입력해주세요");
            return;
        }

        try {
            const token = sessionStorage.getItem("token");
            console.log("✅ 수정 요청 시 session 토큰:", token);

            if (!token) {
                alert("로그인 필요");
                return;
            }
            // 거래처 / 고객 idx 조회
            let custom_idx = null;
            let sales_idx = null;

            if (form.custom_name.trim()) {
                const { data: customRes } = await axios.get("http://192.168.0.122/custom/findByName", {
                    params: { name: form.custom_name.trim() }
                });
                custom_idx = customRes?.custom_idx || null;
            }

            if (form.customer_name.trim()) {
                const { data: salesRes } = await axios.get("http://192.168.0.122/sales/findByName", {
                    params: { name: form.customer_name.trim() }
                });
                sales_idx = salesRes?.sales_idx || null;
            }

            // 수정 요청
            const res = await axios.put(
                `http://192.168.0.122/accountUpdate/${entry.entry_idx}`,
                {
                    entry_type: form.entry_type,
                    amount: form.amount,
                    entry_date: form.entry_date,
                    custom_name: form.custom_name,
                    customer_name: form.customer_name
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // 꼭 Bearer 붙여서
                    }
                }
            );

            if (res.data.success) {
                alert("수정 완료!");
                onSuccess();
                onClose();
            } else {
                alert("수정 실패 또는 권한 오류");
            }

        } catch (err) {
            console.error("수정 중 오류:", err);
            alert("서버 오류로 수정 실패");
        }
    };

    if (!open) return null;

    return (
        <div className="entryRegist-modal" onClick={onClose}>
            <div className="entryRegist-modal-box" onClick={(e) => e.stopPropagation()}>
                <button className="entryRegist-modal-close" onClick={onClose}>×</button>
                <h3 className="entryRegist-modal-title">전표 수정</h3>

                <table className="entryRegist-table">
                    <tbody>
                    <tr>
                        <th>전표 유형</th>
                        <td>
                            <select name="entry_type" value={form.entry_type} onChange={handleChange}>
                                <option value="">선택</option>
                                <option value="매입">매입</option>
                                <option value="매출">매출</option>
                                <option value="환불">환불</option>
                                <option value="수금">수금</option>
                                <option value="지급">지급</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th>금액</th>
                        <td><input type="number" name="amount" value={form.amount} onChange={handleChange} /></td>
                    </tr>
                    <tr>
                        <th>전표 일자</th>
                        <td><input type="date" name="entry_date" value={form.entry_date} onChange={handleChange} /></td>
                    </tr>
                    <tr>
                        <th>거래처명</th>
                        <td><input type="text" name="custom_name" value={form.custom_name} onChange={handleChange} /></td>
                    </tr>
                    <tr>
                        <th>고객명</th>
                        <td><input type="text" name="customer_name" value={form.customer_name} onChange={handleChange} /></td>
                    </tr>
                    </tbody>
                </table>

                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <button className="entryList-fabBtn blue" onClick={handleSubmit}>수정</button>
                </div>
            </div>
        </div>
    )
}
