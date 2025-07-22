'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

export default function VoucherForm({ formData, onChange }) {
    const [customList, setCustomList] = useState([])

    useEffect(() => {
        axios.get('http://localhost:8080/custom/list')
            .then(res => {
                if (res.data?.list) setCustomList(res.data.list)
            })
    }, [])

    return (
        <div>
            <div className="template-form-left">
                <div className="template-form-group">
                    <label className="template-label">전표 유형</label>
                    <select
                        className="template-input"
                        name="entry_type"
                        value={formData.entry_type}
                        onChange={onChange}
                        required
                    >
                        <option value="">-- 선택 --</option>
                        <option value="매출">매출</option>
                        <option value="매입">매입</option>
                        <option value="환불">환불</option>
                        <option value="수금">수금</option>
                        <option value="지급">지급</option>
                    </select>
                </div>

                <div className="template-form-group">
                    <label className="template-label">일자</label>
                    <input
                        className="template-input"
                        type="date"
                        name="entry_date"
                        value={formData.entry_date}
                        onChange={onChange}
                        required
                    />
                </div>

                <div className="template-form-group">
                    <label className="template-label">금액</label>
                    <input
                        className="template-input"
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={onChange}
                        required
                    />
                </div>

                <div className="template-form-group">
                    <label className="template-label">거래처</label>
                    <select
                        className="template-input"
                        name="custom_idx"
                        value={formData.custom_idx || ''}
                        onChange={onChange}
                    >
                        <option value="">-- 선택 --</option>
                        {customList.map((c) => (
                            <option key={c.custom_idx} value={c.custom_idx}>
                                {c.custom_name} ({c.custom_owner})
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
}
