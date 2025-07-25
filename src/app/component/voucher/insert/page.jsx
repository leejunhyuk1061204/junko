'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Header from '@/app/header'
import VoucherForm from "@/app/component/voucher/insert/VoucherForm"

export default function VoucherInsertPage() {
    const [formData, setFormData] = useState({
        entry_type: '',
        entry_date: '',
        amount: '',
        custom_idx: '',
        custom_name: '',
        custom_owner: '',
        user_name: '',
        status: '작성중',
    })
    const [templateIdx, setTemplateIdx] = useState(null)
    const [templateList, setTemplateList] = useState([])
    const [previewHtml, setPreviewHtml] = useState('')
    const [approvers, setApprovers] = useState([])

    useEffect(() => {
        axios.get('http://localhost:8080/template/list').then((res) => {
            if (res.data?.list) setTemplateList(res.data.list)
        })

        const savedUserIdx = sessionStorage.getItem('user_idx')
        if (savedUserIdx) {
            setFormData((prev) => ({ ...prev, user_idx: Number(savedUserIdx) }))
        }
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const previewDocument = async () => {
        if (!templateIdx) return alert('템플릿을 선택하세요')

        const res = await axios.post('http://localhost:8080/voucher/preview', {
            template_idx: templateIdx,
            variables: formData,
        })

        if (res.data.success) setPreviewHtml(res.data.preview)
        else alert('미리보기 생성 실패')
    }

    const saveVoucher = async () => {
        if (!templateIdx) return alert('템플릿을 선택하세요')

        try {
            // 1. 전표 저장 (문서 생성 포함)
            const res = await axios.post('http://localhost:8080/voucher/insert', {
                ...formData,
                entry_date: formData.entry_date
                    ? new Date(formData.entry_date).toISOString().slice(0, 10)
                    : '',
                template_idx: templateIdx,
                approver_ids: approvers.map(u => u.user_idx),
            })

            if (res.data.success && res.data.entry_idx) {
                const entry_idx = res.data.entry_idx
                const document_idx = res.data.document_idx // ✅ document_idx 받아야 함

                // 2. PDF 생성
                const pdfRes = await axios.post('http://localhost:8080/document/pdf', {
                    document_idx,
                })

                if (!pdfRes.data.success) {
                    console.warn('PDF 생성 실패:', pdfRes.data.message || '')
                    alert('PDF 파일 생성 실패')
                }

                // 3. 분개 문서 생성
                const entryDetailTemplateIdx = 14

                const entryDetailVariableRes = await axios.post('http://localhost:8080/entry-detail/preview', {
                    template_idx: entryDetailTemplateIdx,
                    variables: {
                        entry_idx: entry_idx,
                        entry_type: formData.entry_type,
                        amount: formData.amount,
                        user_idx: formData.user_idx,
                        custom_idx: formData.custom_idx,
                    }
                })

                if (!entryDetailVariableRes.data.success) {
                    alert('분개용 변수 생성 실패')
                    return
                }

                const entryDetailDocRes = await axios.post('http://localhost:8080/document/insert', {
                    idx: entry_idx,
                    type: 'entry_detail',
                    user_idx: formData.user_idx,
                    template_idx: entryDetailTemplateIdx,
                    variables: entryDetailVariableRes.data.variables,
                    approver_ids: approvers.map(u => u.user_idx),
                })

                if (entryDetailDocRes.data.success && entryDetailDocRes.data.document_idx) {
                    const entryDetailDocumentIdx = entryDetailDocRes.data.document_idx

                    const entryDetailPdfRes = await axios.post('http://localhost:8080/document/pdf', {
                        document_idx: entryDetailDocumentIdx,
                    })

                    if (!entryDetailPdfRes.data.success) {
                        console.warn('분개 PDF 생성 실패:', entryDetailPdfRes.data.message || '')
                        alert('분개 PDF 파일 생성 실패')
                    }
                } else {
                    console.warn('분개 문서 생성 실패:', entryDetailDocRes.data.message || '')
                    alert('분개 문서 생성 실패')
                }

                alert('저장 완료')
                window.location.href = './'
            } else {
                alert('전표 저장 실패')
            }
        } catch (err) {
            console.error('저장 중 오류:', err)
            alert('저장 중 오류 발생')
        }
    }

    return (
        <div className="wrap page-background">
            <Header />
            <h1 className="margin-left-20 text-align-left margin-bottom-20 font-bold" style={{ fontSize: '24px' }}>
                전표 등록
            </h1>

            <div className="template-form-container">
                {/* 왼쪽 입력 영역 */}
                <div className="template-form-left">
                    <VoucherForm
                        formData={formData}
                        onChange={handleChange}
                        approvers={approvers}
                        setApprovers={setApprovers}
                        setStatus={(newStatus) => setFormData(prev => ({ ...prev, status: newStatus }))}
                    />
                    <div className="template-form-group">
                        <label className="template-label">템플릿 선택</label>
                        <select value={templateIdx || ''} onChange={(e) => setTemplateIdx(Number(e.target.value))} className="template-input">
                            <option value="">-- 선택 --</option>
                            {templateList.map((tpl) => (
                                <option key={tpl.template_idx} value={tpl.template_idx}>
                                    {tpl.template_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ textAlign: 'right', marginTop: '10px' }}>
                        <button onClick={previewDocument} className="template-btn-back" style={{ marginRight: '4px'}}>
                            미리보기
                        </button>
                        <button onClick={saveVoucher} className="template-btn-submit">
                            저장
                        </button>
                    </div>
                    <div style={{ textAlign: 'left'}}>
                        <button onClick={() => window.location.href = './'} className="template-btn-back" >
                            목록
                        </button>
                    </div>
                </div>

                {/* 오른쪽 미리보기 영역 */}
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
