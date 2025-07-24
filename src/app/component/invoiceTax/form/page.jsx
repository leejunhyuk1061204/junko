'use client'

import {useEffect, useState} from 'react'
import {useParams, useRouter} from 'next/navigation'
import Header from '@/app/header'
import axios from 'axios'

export default function InvoiceFormPage() {
    const router = useRouter()
    const params = useParams()
    const isEdit = !!params?.invoice_idx

    const [form, setForm] = useState({
        custom_idx: '',
        entry_idx: '',
        total_amount: 0,
        status: '작성중',
        user_idx: 0,
        issued_by: '',
        reg_date: '',
        details: [{item_name: '', quantity: 1, price: 0, total_amount: 0}],
    })

    const [customers, setCustomers] = useState([])
    const [entries, setEntries] = useState([])

    useEffect(() => {
        const name = sessionStorage.getItem('user_name') || ''
        const uid = sessionStorage.getItem('user_idx') || 0
        setForm(prev => ({...prev, issued_by: name, user_idx: Number(uid)}))
        setForm(prev => ({...prev, issued_by: name}))

        axios.get('http://localhost:8080/custom/list')
            .then(res => {
                if (res.data?.list) setCustomers(res.data.list)
            })

        axios.get('http://localhost:8080/voucher/list', {params: {page: 1, size: 1000}})
            .then(res => {
                if (res.data.success) setEntries(res.data.list)
            })
    }, [])

    useEffect(() => {
        if (!isEdit) return
        axios.get(`http://localhost:8080/invoice/detail/${params.invoice_idx}`)
            .then(res => {
                if (res.data.success) setForm({...res.data.data})
            })
    }, [isEdit, params])

    const updateItem = (index, field, value) => {
        const details = [...form.details]
        details[index][field] = field === 'quantity' || field === 'price' ? Number(value) : value
        details[index].total_amount = details[index].quantity * details[index].price
        const total = details.reduce((sum, item) => sum + item.total_amount, 0)
        setForm({...form, details, total_amount: total})
    }

    const addItem = () => {
        setForm(prev => ({
            ...prev,
            details: [...prev.details, {item_name: '', quantity: 1, price: 0, total_amount: 0}],
        }))
    }

    const createDocument = async (invoice_idx) => {
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
                variables: {
                    user_name,
                    issued_by: form.issued_by,
                    custom_name: customers.find(c => c.custom_idx === Number(form.custom_idx))?.custom_name || '',
                    reg_date: form.reg_date || new Date().toISOString().slice(0, 10),
                    status: form.status || '작성중',
                    total_amount: total.toString(),
                    vat_amount: vat.toString(),
                    total_with_vat: totalWithVat.toString(),
                    items: itemsHtml
                }
            }

            // 문서 생성
            const docRes = await axios.post('http://localhost:8080/document/insert', payload)

            if (docRes.data.success && docRes.data.document_idx) {
                const document_idx = docRes.data.document_idx

                // PDF 생성
                const pdfRes = await axios.post('http://localhost:8080/document/pdf', {
                    document_idx
                })

                if (!pdfRes.data.success) {
                    console.warn('PDF 생성 실패:', pdfRes.data.message || '')
                } else {
                    console.log('문서 생성 및 PDF 완료')
                }
            } else {
                console.warn('문서 생성 실패:', docRes.data.message || '')
            }
        } catch (err) {
            console.error('문서 생성 실패:', err)
        }
    }

    const removeItem = (index) => {
        const details = form.details.filter((_, i) => i !== index)
        const total = details.reduce((sum, item) => sum + item.total_amount, 0)
        setForm({...form, details, total_amount: total})
    }

    const handleChange = (e) => {
        const {name, value} = e.target
        setForm({...form, [name]: value})
    }

    const handleSubmit = async () => {
        if (!form.custom_idx) return alert('거래처를 선택하세요.')
        if (!form.issued_by) return alert('작성자가 없습니다.')
        if (form.details.length === 0 || form.details.some(i => !i.item_name || i.quantity <= 0 || i.price <= 0)) {
            return alert('품목 정보를 정확히 입력하세요.')
        }

        try {
            if (isEdit) {
                await axios.put('http://localhost:8080/invoice/update', form)
                await createDocument(form.invoice_idx)
                alert('수정 완료')
            } else {
                const res = await axios.post('http://localhost:8080/invoice/insert', form)
                const invoice_idx = res.data?.invoice_idx
                if (invoice_idx) await createDocument(invoice_idx)
                alert('등록 완료')
            }
            router.push('./')
        } catch (err) {
            console.error(err)
            alert('처리 실패')
        }
    }

    return (
        <div className="wrap page-background">
            <Header/>
            <div className="product-list-back">
                <h1 className="margin-left-20 text-align-left margin-bottom-20 font-bold" style={{ fontSize: '24px' }}>
                    세금 계산서
                </h1>

                <div className="invoice-form-container">
                    <div className="invoice-form-left">
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
        </div>
    )
}