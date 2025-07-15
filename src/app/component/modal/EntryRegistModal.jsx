'use client'

import { useEffect, useState } from "react"
import axios from "axios"

export default function EntryRegistModal({ open, onClose, onSuccess }) {
    const [form, setForm] = useState({
        entry_type: '',
        amount: '',
        entry_date: '',
        custom_name: '',
        customer_name: '',
    })

    const [customIdx, setCustomIdx] = useState(null)
    const [customerIdx, setCustomerIdx] = useState(null)
    const [file, setFile] = useState(null)

    const handleChange = (e) => {
        const {name, value} = e.target
        setForm({...form, [name]: value})
    }

    const fetchCustomIdx = async () => {
        if (!form.custom_name) return
        try {
            const res = await axios.get(`http://localhost:8080/custom/findByName`, {
                params: {name: form.custom_name}
            })
            setCustomIdx(res.data.custom_idx || null)
        } catch (e) {
            console.error("거래처 조회 실패", e)
        }
    }

    const fetchCustomerIdx = async () => {
        if (!form.customer_name) return
        try {
            const res = await axios.get(`http://localhost:8080/sales/findByName`, {
                params: {name: form.customer_name}
            })
            setCustomerIdx(res.data.sales_idx || null)
        } catch (e) {
            console.error("고객 조회 실패", e)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (form.custom_name) fetchCustomIdx()
        }, 300)
        return () => clearTimeout(timer)
    }, [form.custom_name])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (form.customer_name) fetchCustomerIdx()
        }, 300)
        return () => clearTimeout(timer)
    }, [form.customer_name])

    const handleSubmit = async () => {
        const token = sessionStorage.getItem("token");
        const user_idx = sessionStorage.getItem("user_idx");

        if (!form.entry_type || !form.amount || !form.entry_date) {
            alert("필수 항목을 입력하세요");
            return;
        }

        const data = new FormData();
        data.append("entry_type", form.entry_type);
        data.append("amount", form.amount);
        data.append("entry_date", form.entry_date);

        try {
            if (form.custom_name) {
                const res = await axios.get("http://localhost:8080/custom/findByName", {
                    params: { name: form.custom_name.trim() }
                });
                if (res.data.custom_idx !== undefined) {
                    data.append("custom_idx", res.data.custom_idx);
                } else {
                    alert("유효하지 않은 거래처명입니다!");
                    return;
                }
            }

            if (form.customer_name) {
                const res = await axios.get("http://localhost:8080/sales/findByName", {
                    params: { name: form.customer_name.trim() }
                });
                if (res.data.sales_idx !== undefined) {
                    data.append("sales_idx", res.data.sales_idx);
                } else {
                    alert("유효하지 않은 고객명입니다!");
                    return;
                }
            }

            if (file) data.append("file", file);

            const res = await axios.post("http://localhost:8080/accountRegist", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    user_idx: user_idx
                }
            });

            if (res.data.success) {
                alert("전표 등록 완료!");
                onSuccess();
                onClose();
            } else {
                alert("등록 실패 또는 로그인 필요");
            }
        } catch (e) {
            alert("등록 중 오류 발생");
            console.error(e);
        }
    }

        if (!open) return null

        return (
            <div className="entryRegist-modal" onClick={onClose}>
                <div className="entryRegist-modal-box" onClick={(e) => e.stopPropagation()}>
                    <button className="entryRegist-modal-close" onClick={onClose}>×</button>
                    <h3 className="entryRegist-modal-title">회계 전표 등록</h3>

                    <div className="entryRegist-form-item">
                        <label>전표 유형</label>
                        <select name="entry_type" value={form.entry_type} onChange={handleChange}>
                            <option value="">선택</option>
                            <option value="매입">매입</option>
                            <option value="매출">매출</option>
                            <option value="환불">환불</option>
                            <option value="수금">수금</option>
                            <option value="지급">지급</option>
                        </select>
                    </div>

                    <div className="entryRegist-form-item">
                        <label>금액</label>
                        <input type="number" name="amount" value={form.amount} onChange={handleChange}/>
                    </div>

                    <div className="entryRegist-form-item">
                        <label>전표 일자</label>
                        <input type="date" name="entry_date" value={form.entry_date} onChange={handleChange}/>
                    </div>

                    <div className="entryRegist-form-item">
                        <label>거래처명 (매입용)</label>
                        <input
                            type="text"
                            name="custom_name"
                            value={form.custom_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="entryRegist-form-item">
                        <label>고객명 (매출/환불용)</label>
                        <input
                            type="text"
                            name="customer_name"
                            value={form.customer_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="entryRegist-form-item">
                        <label>첨부파일</label>
                        <input type="file" onChange={(e) => setFile(e.target.files[0])}/>
                    </div>

                    <button className="entryList-fabBtn blue" onClick={handleSubmit}>등록</button>
                </div>
            </div>
        )

}
