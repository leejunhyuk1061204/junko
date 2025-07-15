'use client'

import { useEffect, useState } from "react"
import axios from "axios"

export default function EntryEditModal({ open, onClose, entry, onSuccess }) {
    const [form, setForm] = useState({
        entry_type: '',
        amount: '',
        entry_date: '',
        custom_name: '',
        customer_name: '',
    })

    useEffect(() => {
        if (entry) {
            setForm({
                entry_type: entry.entry_type || '',
                amount: entry.amount || '',
                entry_date: entry.entry_date || '',
                custom_name: entry.custom_name || '',
                customer_name: entry.customer_name || ''
            })
        }
    }, [entry])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
    }

    const handleSubmit = async () => {
        if (!form.entry_type || !form.amount || !form.entry_date) {
            alert("필수 항목을 입력하세요")
            return
        }

        try {
            const { data: customRes } = await axios.get(`http://localhost:8080/customIdxByName`, {
                params: { name: form.custom_name.trim() }
            })

            const { data: salesRes } = await axios.get(`http://localhost:8080/salesIdxByName`, {
                params: { name: form.customer_name.trim() }
            })

            const custom_idx = customRes?.idx || null
            const sales_idx = salesRes?.idx || null

            const res = await axios.put(`http://localhost:8080/accountUpdate/${entry.entry_idx}`, {
                entry_type: form.entry_type,
                amount: form.amount,
                entry_date: form.entry_date,
                custom_idx,
                sales_idx
            })

            if (res.data.success) {
                alert('수정 완료!')
                onSuccess()
                onClose()
            } else {
                alert(res.data.message || '수정 실패')
            }
        } catch (err) {
            console.error('수정 중 오류:', err)
            alert('수정 중 오류 발생')
        }
    }

    if (!open) return null

    return (
        <div className="entryRegist-modal" onClick={onClose}>
            <div className="entryRegist-modal-box" onClick={(e) => e.stopPropagation()}>
                <button className="entryRegist-modal-close" onClick={onClose}>×</button>
                <h3 className="entryRegist-modal-title">전표 수정</h3>

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
                    <input type="number" name="amount" value={form.amount} onChange={handleChange} />
                </div>

                <div className="entryRegist-form-item">
                    <label>전표 일자</label>
                    <input type="date" name="entry_date" value={form.entry_date} onChange={handleChange} />
                </div>

                <div className="entryRegist-form-item">
                    <label>거래처명 (매입용)</label>
                    <input type="text" name="custom_name" value={form.custom_name} onChange={handleChange} />
                </div>

                <div className="entryRegist-form-item">
                    <label>고객명 (매출/환불용)</label>
                    <input type="text" name="customer_name" value={form.customer_name} onChange={handleChange} />
                </div>

                <button className="entryList-fabBtn blue" onClick={handleSubmit}>수정</button>
            </div>
        </div>
    )
}
