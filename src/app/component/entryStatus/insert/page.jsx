'use client'

import {useState, useEffect} from 'react'
import axios from 'axios'
import {useRouter} from 'next/navigation'
import Header from "@/app/header";

export default function EntryStatusInsertPage() {
    const [form, setForm] = useState({
        entry_idx: '',
        custom_idx: '',
        settlement_day: '',
        amount: '',
        status: '미정산',
        user_idx: '',
        template_idx: '',
    })
    const [entries, setEntries] = useState([])
    const [totalAmount, setTotalAmount] = useState(0)
    const [templateList, setTemplateList] = useState([])
    const [previewHtml, setPreviewHtml] = useState('')
    const router = useRouter()

    useEffect(() => {
        const savedUserIdx = sessionStorage.getItem('user_idx')
        const savedUserName = sessionStorage.getItem('user_name')

        if (savedUserIdx) {
            setForm(prev => ({
                ...prev,
                user_idx: Number(savedUserIdx),
                user_name: savedUserName || '',  // 없으면 빈 문자열
            }))
        }
    }, [])

    useEffect(() => {
        axios.get('http://localhost:8080/voucher/list', { params: { page: 1, size: 1000 } })
            .then(res => {
                if (res.data.success) setEntries(res.data.list)
            })

        axios.get('http://localhost:8080/template/list').then(res => {
            if (res.data?.list) setTemplateList(res.data.list)
        })

        const savedUserIdx = sessionStorage.getItem('user_idx')
        if (savedUserIdx) {
            setForm((prev) => ({ ...prev, user_idx: Number(savedUserIdx) }))
        }
    }, [])

    const handleChange = (e) => {
        const {name, value} = e.target
        setForm(prev => ({...prev, [name]: value}))
    }

    const handleEntryChange = (e) => {
        const selected = entries.find(v => v.entry_idx === parseInt(e.target.value))
        setForm(prev => ({
            ...prev,
            entry_idx: selected.entry_idx,
            custom_idx: selected.custom_idx,
            total_amount: selected.amount,
        }))
        setTotalAmount(selected.amount)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.post('http://localhost:8080/settlement/insert', {
                ...form,
                user_idx: form.user_idx
            })
            if (res.data.success) {
                const entry_idx = form.entry_idx
                const docRes = await axios.post('http://localhost:8080/document/insert', {
                    idx: entry_idx,
                    type: 'settlement',
                    user_idx: form.user_idx,
                    template_idx: form.template_idx,
                    variables: {
                        ...res.data.variables,
                        user_name: form.user_name,
                    }
                })

                if (docRes.data.success && docRes.data.document_idx) {
                    const pdfRes = await axios.post('http://localhost:8080/document/pdf', {
                        document_idx: docRes.data.document_idx,
                    })

                    if (!pdfRes.data.success) {
                        alert('PDF 생성 실패')
                    }
                } else {
                    alert('문서 생성 실패')
                }

                alert('정산 등록 완료')
                router.push('./')
            } else {
                alert('등록 실패')
            }
        } catch (err) {
            console.error(err)
            alert('오류 발생')
        }
    }

    const previewDocument = async () => {
        if (!form.template_idx) return alert('템플릿을 선택하세요')

        try {
            const res = await axios.post('http://localhost:8080/settlement/preview', {
                template_idx: form.template_idx,
                variables: {
                    ...form,
                    user_name: form.user_name,
                }
            })
            if (res.data.success) setPreviewHtml(res.data.preview)
            else alert('미리보기 실패')
        } catch (err) {
            console.error(err)
            alert('미리보기 오류')
        }
    }

    return (
        <div className="wrap page-background">
            <Header />
            <h1 className="margin-left-20 text-align-left margin-bottom-20 font-bold" style={{ fontSize: '24px' }}>
                정산 등록
            </h1>

            <div className="template-form-container">
                <div className="template-form-left">
                    <form onSubmit={handleSubmit}>
                        <div className="template-form-group">
                            <label className="template-label">전표 선택</label>
                            <select name="entry_idx" value={form.entry_idx} onChange={handleEntryChange} className="template-input" required>
                                <option value="">전표 선택</option>
                                {entries.map(v => (
                                    <option key={v.entry_idx} value={v.entry_idx}>
                                        {v.entry_idx} - {v.custom_name} / {Number(v.amount).toLocaleString()}원
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="template-form-group">
                            <label className="template-label">정산일</label>
                            <input type="date" name="settlement_day" value={form.settlement_day} onChange={handleChange} className="template-input" />
                        </div>

                        <div className="template-form-group">
                            <label className="template-label">전표 총 금액</label>
                            <input type="text" value={`${Number(totalAmount).toLocaleString()}원`} readOnly className="template-input bg-gray-100" />
                        </div>

                        <div className="template-form-group">
                            <label className="template-label">정산 금액 (입력)</label>
                            <input type="number" name="amount" value={form.amount} onChange={handleChange} className="template-input" required />
                        </div>

                        <div className="template-form-group">
                            <label className="template-label">상태</label>
                            <select name="status" value={form.status} onChange={handleChange} className="template-input">
                                <option value="미정산">미정산</option>
                                <option value="부분정산">부분정산</option>
                                <option value="정산">정산</option>
                            </select>
                        </div>

                        <div className="template-form-group">
                            <label className="template-label">템플릿 선택</label>
                            <select name="template_idx" value={form.template_idx} onChange={handleChange} className="template-input" required>
                                <option value="">-- 선택 --</option>
                                {templateList.map(tpl => (
                                    <option key={tpl.template_idx} value={tpl.template_idx}>{tpl.template_name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ textAlign: 'right', marginTop: '10px' }}>
                            <button type="button" onClick={previewDocument} className="template-btn-back" style={{ marginRight: '4px'}}>
                                미리보기
                            </button>
                            <button type="submit" className="template-btn-submit">
                                등록
                            </button>
                        </div>
                        <div style={{ textAlign: 'left'}}>
                            <button type="button" onClick={() => router.push('./')} className="template-btn-back" >
                                목록
                            </button>
                        </div>
                    </form>
                </div>

                <div className="template-form-right">
                    <h3 className="template-preview-title">미리보기</h3>
                    <iframe
                        srcDoc={previewHtml}
                        className="template-preview-frame"
                        title="Document Preview"
                    />
                </div>
            </div>
        </div>
    )
}
