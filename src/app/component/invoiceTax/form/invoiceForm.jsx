'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Select from 'react-select'

export default function InvoiceFormPage({ isEdit = false, invoice_idx, onSubmitSuccess }) {
    const router = useRouter()
    const [userList, setUserList] = useState([])

    const [form, setForm] = useState({
        custom_idx: '',
        entry_idx: '',
        total_amount: 0,
        status: '작성중',
        user_idx: 0,
        issued_by: '',
        reg_date: '',
        document_idx: null,
        details: [{ item_name: '', quantity: 1, price: 0, total_amount: 0 }],
        approver_ids: [],
    })

    const [customers, setCustomers] = useState([])
    const [entries, setEntries] = useState([])

    const userOptions = userList.map(user => ({
        value: user.user_idx,
        label: user.user_name,
    }))

    useEffect(() => {
        axios.post('http://localhost:8080/users/list', {})
            .then(res => setUserList(res.data?.list || []))
            .catch(err => console.error('유저 리스트 불러오기 실패:', err))
    }, [])

    useEffect(() => {
        const user_name = sessionStorage.getItem('user_name') || ''
        const user_idx = sessionStorage.getItem('user_idx') || 0
        setForm(prev => ({ ...prev, issued_by: user_name, user_idx: Number(user_idx) }))

        axios.get('http://localhost:8080/custom/list')
            .then(res => res.data?.list && setCustomers(res.data.list))

        axios.get('http://localhost:8080/voucher/list', { params: { page: 1, size: 1000 } })
            .then(res => res.data?.list && setEntries(res.data.list))
    }, [])

    useEffect(() => {
        if (isEdit && invoice_idx) {
            axios.get(`http://localhost:8080/invoice/detail/${invoice_idx}`)
                .then(res => {
                    if (res.data.success && res.data.data) {
                        const user_name = sessionStorage.getItem('user_name') || ''
                        const user_idx = sessionStorage.getItem('user_idx') || 0
                        setForm({
                            ...res.data.data,
                            issued_by: res.data.data.issued_by || user_name,
                            user_idx: res.data.data.user_idx || Number(user_idx)
                        })
                    }
                })
        }
    }, [isEdit, invoice_idx])

    const updateItem = (index, field, value) => {
        const details = [...form.details]
        details[index][field] = field === 'quantity' || field === 'price' ? Number(value) : value
        details[index].total_amount = details[index].quantity * details[index].price
        const total = details.reduce((sum, item) => sum + item.total_amount, 0)
        setForm({ ...form, details, total_amount: total })
    }

    const addItem = () => {
        setForm(prev => ({
            ...prev,
            details: [...prev.details, { item_name: '', quantity: 1, price: 0, total_amount: 0 }],
        }))
    }

    const removeItem = (index) => {
        const details = form.details.filter((_, i) => i !== index)
        const total = details.reduce((sum, item) => sum + item.total_amount, 0)
        setForm({ ...form, details, total_amount: total })
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
    }

    const createDocument = async (invoice_idx) => {
        if (form.status === '확정' && form.approver_ids?.length > 0) {
            payload.approver_ids = form.approver_ids
        }

        try {
            const user_name = sessionStorage.getItem('user_name') || ''
            const user_idx = sessionStorage.getItem('user_idx') || 0
            const total = form.total_amount
            const vat = Math.floor(total * 0.1)
            const totalWithVat = total + vat

            const itemsHtml = form.details.map(item => `
                <tr>
                    <td>${item.item_name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price}</td>
                    <td>${item.total_amount}</td>
                </tr>
            `).join('')

            const payload = {
                type: 'invoice',
                idx: invoice_idx,
                template_idx: 13,
                user_idx: Number(user_idx),
                approver_ids: form.approver_ids || [],
                variables: {
                    invoice_idx: invoice_idx.toString(),
                    user_name,
                    issued_by: form.issued_by,
                    custom_name: customers.find(c => c.custom_idx === Number(form.custom_idx))?.custom_name || '',
                    reg_date: form.reg_date || new Date().toISOString().slice(0, 10),
                    status: form.status || '작성중',
                    total_amount: total.toString(),
                    vat_amount: vat.toString(),
                    total_with_vat: totalWithVat.toString(),
                    items: itemsHtml
                },
                document_idx: form.document_idx || null
            }

            const docRes = await axios.post('http://localhost:8080/document/insert', payload)
            if (docRes.data.success && docRes.data.document_idx) {
                const document_idx = docRes.data.document_idx
                const pdfRes = await axios.post('http://localhost:8080/document/pdf', { document_idx })
                if (!pdfRes.data.success) console.warn('PDF 생성 실패:', pdfRes.data.message || '')
            } else {
                console.warn('문서 생성 실패:', docRes.data.message || '')
            }
        } catch (err) {
            console.error('문서 생성 실패:', err)
        }
    }

    const handleSubmit = async () => {
        if (!form.custom_idx) return alert('거래처를 선택하세요.')
        if (!form.issued_by) return alert('작성자가 없습니다.')
        if (form.details.length === 0 || form.details.some(i => !i.item_name || i.quantity <= 0 || i.price <= 0)) {
            return alert('품목 정보를 정확히 입력하세요.')
        }

        try {
            console.log('제출 form:', form)
            if (isEdit) {
                await axios.put('http://localhost:8080/invoice/update', form)
                await createDocument(form.invoice_idx)
                alert('수정 완료')
            } else {
                const res = await axios.post('http://localhost:8080/invoice/insert', form)
                const new_idx = res.data?.invoice_idx
                if (new_idx) await createDocument(new_idx)
                alert('등록 완료')
            }
            if (onSubmitSuccess) onSubmitSuccess()
        } catch (err) {
            console.error(err)
            alert('처리 실패')
        }
    }

    return (
            <div className="product-list-back">
                <div className="invoice-form-container">
                    <div className="invoice-form-left">

                        <div className="invoice-form-group-horizontal">
                            <label className="invoice-label">결재자 지정</label>
                            <div style={{ width: '100%' }}>

                                {/* 태그 출력 영역 (인풋 바깥) */}
                                <div className="selected-approvers">
                                    {form.approver_ids.map(id => {
                                        const user = userList.find(u => u.user_idx === id)
                                        return (
                                            <span key={id} className="approver-tag">
                                                {user?.user_name}
                                                <button onClick={() => {
                                                    setForm(prev => ({
                                                        ...prev,
                                                        approver_ids: prev.approver_ids.filter(x => x !== id)
                                                    }))
                                                }}>×</button>
                                            </span>
                                        )
                                    })}
                                </div>

                                {/* 검색용 select */}
                                <Select
                                    options={userOptions.filter(o => !form.approver_ids.includes(o.value))}
                                    onChange={(selected) => {
                                        if (selected) {
                                            setForm(prev => ({
                                                ...prev,
                                                approver_ids: [...prev.approver_ids, selected.value]
                                            }))
                                        }
                                    }}
                                    placeholder="결재자 검색 및 선택"
                                />
                            </div>
                        </div>


                        <div className="invoice-form-group-horizontal">
                            <label className="invoice-label">거래처</label>
                            <select name="custom_idx" value={form.custom_idx} onChange={handleChange}
                                    style={{ height: '40px'}} className="invoice-input" required>
                                <option value="">거래처 선택</option>
                                {customers.map(c => (
                                    <option key={c.custom_idx} value={c.custom_idx}>
                                        {c.custom_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="invoice-form-group-horizontal">
                            <label className="invoice-label">전표 선택</label>
                            <select name="entry_idx" value={form.entry_idx} onChange={handleChange}
                                    style={{ height: '40px'}} className="invoice-input">
                                <option value="">전표 선택</option>
                                {entries.map(e => (
                                    <option key={e.entry_idx} value={e.entry_idx}>
                                        {e.entry_idx} - {e.custom_name} / {Number(e.amount).toLocaleString()}원
                                    </option>
                                ))}
                            </select>
                        </div>

                        <h4 className="invoice-label">품목 목록</h4>
                        {form.details.map((item, index) => (
                            <div key={index} className="invoice-item-row">
                                <input
                                    type="text"
                                    placeholder="품목명"
                                    className="invoice-item-input"
                                    value={item.item_name}
                                    onChange={e => updateItem(index, 'item_name', e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="수량 ex) 5"
                                    className="invoice-item-input"
                                    value={item.quantity || ''}
                                    onChange={e => updateItem(index, 'quantity', e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="가격 ex) 1000"
                                    className="invoice-item-input"
                                    value={item.price || ''}
                                    onChange={e => updateItem(index, 'price', e.target.value)}
                                />
                                <div style={{ width: '500px'}} className="invoice-item-amount">
                                    {item.total_amount.toLocaleString()}
                                </div>
                                <span className="invoice-won">원</span>
                                <button style={{ width: '115px'}} className="product-btn-del" type="button" onClick={() => removeItem(index)}>삭제</button>
                            </div>
                        ))}

                        <div className="invoice-item-add-btn-wrapper">
                            <button type="button" onClick={addItem} className="product-btn">+ 품목 추가</button>
                        </div>
                    </div>

                    <div className="invoice-form-right">
                        <div className="invoice-info-box">
                            <div className="invoice-info-row">
                                <div className="invoice-info-label">계산서 번호</div>
                                <div className="invoice-info-value">TX0000000123</div>
                            </div>
                            <div className="invoice-info-row">
                                <div className="invoice-info-label">상태</div>
                                <div className={`invoice-info-value ${form.status === '확정' ? 'confirmed' : 'draft'}`}>{form.status}</div>
                            </div>
                            <div className="invoice-info-row">
                                <div className="invoice-info-label">거래처</div>
                                <div className="invoice-info-value">{customers.find(c => c.custom_idx === Number(form.custom_idx))?.custom_name || '선택 안됨'}</div>
                            </div>
                            <div className="invoice-info-row">
                                <div className="invoice-info-label">총 품목 수</div>
                                <div className="invoice-info-value">{form.details.length}건</div>
                            </div>
                            <div className="invoice-info-row">
                                <div className="invoice-info-label">공급가액</div>
                                <div className="invoice-info-value">{form.total_amount.toLocaleString()}원</div>
                            </div>
                            <div className="invoice-info-row">
                                <div className="invoice-info-label">부가세</div>
                                <div className="invoice-info-value">{Math.floor(form.total_amount * 0.1).toLocaleString()}원</div>
                            </div>
                            <div className="invoice-info-row">
                                <div className="invoice-info-label">총금액</div>
                                <div className="invoice-info-value">{(form.total_amount * 1.1).toLocaleString()}원</div>
                            </div>
                            <div className="invoice-info-row">
                                <div className="invoice-info-label">전표</div>
                                <div className="invoice-info-value">{form.entry_idx ? `#${form.entry_idx}` : '없음'}</div>
                            </div>
                            <div className="invoice-info-row">
                                <div className="invoice-info-label">작성자</div>
                                <div className="invoice-info-value">{form.issued_by}</div>
                            </div>
                            <div className="invoice-info-row">
                                <div className="invoice-info-label">작성일</div>
                                <div className="invoice-info-value">{form.reg_date || '(저장 시 생성됨)'}</div>
                            </div>
                        </div>

                        <button onClick={handleSubmit} className="template-btn-submit" style={{marginRight:'10px', borderRadius: '3px' ,marginTop: '20px'}}>
                                {isEdit ? '수정' : '등록'}
                            </button>
                            <button type="button" onClick={() => router.push('/component/invoiceTax')} className="template-btn-back">
                                목록
                            </button>
                    </div>
                </div>
            </div>
    )
}