'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

export default function VoucherForm({ formData, onChange, approvers, setApprovers }) {
    const [customList, setCustomList] = useState([])
    const [userList, setUserList] = useState([])

    useEffect(() => {
        axios.get('http://192.168.0.122:8080/custom/list')
            .then(res => {
                if (res.data?.list) setCustomList(res.data.list)
            })

        axios.post('http://192.168.0.122:8080/users/list',{})
            .then(res => setUserList(res.data?.list || []))
            .catch(err => console.log('유저 리스트 불러오기 실패',err))
    }, [])

    const addApprover = (e) => {
        const selectedId = Number(e.target.value)
        if (selectedId && !approvers.some(u => u.user_idx === selectedId)) {
            const selectedUser = userList.find(u => u.user_idx === selectedId)
            if (selectedUser) setApprovers([...approvers, selectedUser])
        }
        e.target.value = ''
    }

    const removeApprover = (id) => {
        setApprovers(prev => prev.filter(u => u.user_idx !== id))
    }

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

                <div className="template-form-group">
                    <label className="template-label">상태</label>
                    <select
                        className="template-input"
                        name="status"
                        value={formData.status}
                        onChange={onChange}
                    >
                        <option value="작성중">작성중</option>
                        <option value="확정">확정</option>
                    </select>
                </div>

                <div className="template-form-group" style={{ width: '1000px', marginBottom: '7px'}}>
                    <label className="template-label" style={{minWidth: '20px'}}>결재자 지정</label>
                    <select
                        className="voucher-select-input"
                        disabled={formData.status !== '확정'}
                        onChange={addApprover}
                    >
                        <option value="">결재자 선택</option>
                        {userList.filter(u => !approvers.some(a => a.user_idx === u.user_idx)).map(user => (
                            <option key={user.user_idx} value={user.user_idx}>{user.user_name}</option>
                        ))}
                    </select>
                </div>
                <div className="selected-approvers" style={{ justifyContent: 'center', marginLeft: '50px', marginBottom: '10px' }}>
                    {approvers.map(user => (
                        <span key={user.user_idx} className="approver-tag" style={{}}>
                            {user.user_name}
                            {formData.status === '확정' && (
                                <button onClick={() => removeApprover(user.user_idx)}>×</button>
                            )}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}
