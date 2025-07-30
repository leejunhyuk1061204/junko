'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import Header from "@/app/header"

export default function EntryStatusUpdatePage() {
    const { settlement_id } = useParams()
    const router = useRouter()
    const [form, setForm] = useState(null)
    const [previewHtml, setPreviewHtml] = useState('')
    const [approverList, setApproverList] = useState([])
    const [approvers, setApprovers] = useState([])
    const [availableAmount, setAvailableAmount] = useState(0)
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        if (!settlement_id) return
        axios.get(`http://localhost:8080/settlement/detail/${settlement_id}`)
            .then(res => {
                if (res.data.success) {
                    setForm(res.data.data)
                    setApprovers(res.data.data.approvers || [])
                } else alert('데이터 조회 실패')
            })
            .catch(err => {
                console.error(err)
                alert('오류 발생')
            })

        axios.post('http://localhost:8080/users/list', {}).then(res => {
            if (res.data?.list) setApproverList(res.data.list)
        })

    }, [settlement_id])

    useEffect(() => {
        if (form) previewDocument()
    }, [form])

    useEffect(() => {
        if (form && form.entry_idx) {
            const entryIdx = parseInt(form.entry_idx)
            axios.get(`http://localhost:8080/entry/settlement/previewAmount?entry_idx=${entryIdx}`)
                .then(res => {
                    const total = res.data?.voucher_amount || 0
                    const settled = res.data?.settled_amount || 0
                    setAvailableAmount(total - settled)
                })
                .catch(err => {
                    console.error('잔액 조회 실패', err)
                    setAvailableAmount(0)
                })
        }
    }, [form])

    useEffect(() => {
        if (!form?.amount || !availableAmount) {
            setErrorMsg('')
            return
        }

        const v = parseInt(form.amount || 0)
        if (v > availableAmount) {
            setErrorMsg('정산 가능 금액을 초과했습니다.')
        } else {
            setErrorMsg('')
        }
    }, [form?.amount, availableAmount])


    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))

        if (name === 'amount' && availableAmount > 0) {
            const v = parseInt(value || 0)
            if (v > availableAmount) {
                setErrorMsg('정산 가능 금액을 초과했습니다.')
            } else {
                setErrorMsg('')
            }
        }
    }

    const addApprover = (e) => {
        const selectedIdx = Number(e.target.value)
        const selectedUser = approverList.find(user => user.user_idx === selectedIdx)
        if (selectedUser && !approvers.some(a => a.user_idx === selectedIdx)) {
            setApprovers(prev => [...prev, selectedUser])
        }
        e.target.value = ''
    }

    const removeApprover = (idx) => {
        setApprovers(prev => prev.filter(u => u.user_idx !== idx))
    }

    const previewDocument = async () => {
        if (!form) return
        try {
            const res = await axios.post('http://localhost:8080/settlement/preview', {
                template_idx: 12,
                variables: {
                    settlement_id: form.settlement_id,
                    settlement_day: form.settlement_day,
                    amount: form.amount,
                    total_amount: form.total_amount,
                    status: form.status,
                    user_idx: form.user_idx,
                    user_name: form.user_name || '',
                    custom_idx: form.custom_idx,
                }
            })
            if (res.data.success) setPreviewHtml(res.data.preview)
        } catch (e) {
            console.error(e)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const payload = {
            ...form,
            approver_ids: approvers.map(u => u.user_idx),
        }

        if (parseInt(form.amount || 0) > availableAmount) {
            alert('정산 가능 금액을 초과했습니다.')
            return
        }

        try {
            const res = await axios.put('http://localhost:8080/settlement/update', payload)
            if (res.data.success) {
                if (form.document_idx) {
                    const previewRes = await axios.post('http://localhost:8080/settlement/preview', {
                        template_idx: 12,
                        variables: {
                            settlement_id: form.settlement_id,
                            settlement_day: form.settlement_day,
                            amount: form.amount,
                            total_amount: form.total_amount,
                            status: form.status,
                            user_idx: form.user_idx,
                            user_name: form.user_name || '',
                            custom_idx: form.custom_idx,
                        }
                    })

                    if (previewRes.data.success) {
                        await axios.put('http://localhost:8080/document/update', {
                            document_idx: form.document_idx,
                            template_idx: 12,
                            variables: previewRes.data.variables,
                            type: 'settlement',
                            idx: form.settlement_id,
                            user_idx: form.user_idx,
                            user_name: form.user_name || '',
                            approver_ids: approvers.map(u => u.user_idx),
                        })

                        await axios.post('http://localhost:8080/document/pdf', {
                            document_idx: form.document_idx,
                        })
                    }
                }

                alert('수정 완료')
                router.push('/component/entryStatus')
            } else {
                alert('수정 실패')
            }
        } catch (err) {
            console.error(err)
            alert('오류 발생')
        }
    }

    if (!form) return <p className="wrap">로딩 중...</p>

    return (
        <div className="wrap page-background">
            <Header />
            <h1 className="margin-left-20 text-align-left margin-bottom-20 font-bold" style={{ fontSize: '24px' }}>
                정산 수정
            </h1>

            <div className="template-form-container">
                <div className="template-form-left" style={{ height: '650px' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="template-form-group">
                            <label className="template-label">정산 ID</label>
                            <input type="text" value={form.settlement_id} disabled className="template-input bg-gray-100" />
                        </div>

                        <div className="template-form-group">
                            <label className="template-label">전표 번호</label>
                            <input type="text" value={form.entry_idx} disabled className="template-input bg-gray-100" />
                        </div>

                        <div className="template-form-group">
                            <label className="template-label">작성자</label>
                            <input
                                type="text"
                                name="user_name"
                                value={form.user_name}
                                readOnly
                                className="template-input bg-gray-100"
                            />
                        </div>

                        <div className="template-form-group">
                            <label className="template-label">거래처</label>
                            <input type="text" value={form.custom_name} disabled className="template-input bg-gray-100" />
                        </div>

                        <div className="template-form-group">
                            <label className="template-label">정산일</label>
                            <input type="date" name="settlement_day" value={form.settlement_day} onChange={handleChange} className="template-input" />
                        </div>

                        <div className="template-form-group" style={{ marginTop: '20px' }}>
                            <label className="template-label">정산 금액</label>
                            <input type="number" name="amount" value={form.amount} onChange={handleChange} className="template-input" />
                        </div>

                        {form.entry_idx && (
                            <div style={{ marginLeft: '50px', marginBottom: '4px', fontSize: '13px', color: '#666' }}>
                                잔여 정산 가능 금액: {(availableAmount - (parseInt(form.amount || 0) || 0)).toLocaleString()}원
                            </div>
                        )}

                        {errorMsg && (
                            <div style={{ color: 'red', fontSize: '13px', marginLeft: '50px', marginTop: '4px', marginBottom: '4px'}}>
                                {errorMsg}
                            </div>
                        )}

                        <div className="template-form-group" style={{ marginTop: '13px' }}>
                            <label className="template-label">상태</label>
                            <select name="status" value={form.status} onChange={handleChange} className="template-input">
                                <option value="미정산">미정산</option>
                                <option value="부분정산">부분정산</option>
                                <option value="정산">정산</option>
                            </select>
                        </div>

                        {form.status === '정산' && (
                            <div className="template-form-group" style={{ marginBottom: '7px', marginTop: '20px' }}>
                                <label className="template-label">결재자 지정</label>
                                <select className="template-input" onChange={addApprover}>
                                    <option value="">결재자 선택</option>
                                    {approverList
                                        .filter(u => !approvers.some(a => a.user_idx === u.user_idx))
                                        .map(user => (
                                            <option key={user.user_idx} value={user.user_idx}>
                                                {user.user_name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        )}
                        <div>
                            <div className="selected-approvers"  style={{ justifyContent: 'center', marginLeft: '50px', marginBottom: '7px' }}>
                                {approvers.map(user => (
                                    <span key={user.user_idx} className="approver-tag">
                                                 {user.user_name}
                                        <button type="button" onClick={() => removeApprover(user.user_idx)}>×</button>
                                        </span>
                                ))}
                            </div>
                        </div>


                        <div style={{ textAlign: 'right', marginTop: '20px' }}>
                            <button type="submit" className="template-btn-submit">수정</button>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <button type="button" onClick={() => router.push('/component/entryStatus')} className="template-btn-back">목록</button>
                        </div>
                    </form>
                </div>

                <div className="template-form-right">
                    <h3 className="template-preview-title">미리보기</h3>
                    <iframe
                        srcDoc={previewHtml}
                        className="template-preview-frame"
                        title="문서 미리보기"
                    />
                </div>
            </div>
        </div>
    )
}
