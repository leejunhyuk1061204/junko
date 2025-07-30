'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import Header from '@/app/header'
import VoucherForm from '@/app/component/voucher/insert/VoucherForm'

export default function VoucherUpdatePage() {
    const { entry_idx } = useParams()
    const router = useRouter()
    const [approvers, setApprovers] = useState([])

    const [formData, setFormData] = useState({
        entry_type: '',
        entry_date: '',
        amount: '',
        custom_idx: '',
        custom_name: '',
        custom_owner: '',
        user_name: '',
        user_idx: '',
        status: '작성중',
    })

    const [templateIdx, setTemplateIdx] = useState(null)
    const [templateList, setTemplateList] = useState([])
    const [previewHtml, setPreviewHtml] = useState('')
    const [documentIdx, setDocumentIdx] = useState(null)

    useEffect(() => {
        if (!entry_idx) return

        axios.get(`http://192.168.0.122/voucher/detail/${entry_idx}`).then((res) => {
            if (res.data.success) {
                const dto = res.data.data
                const approvalLines = res.data.approval_lines ?? []
                setApprovers(approvalLines.map(a => ({
                    user_idx: a.user_idx,
                    user_name: a.user_name
                })))

                setFormData({
                    entry_type: dto.entry_type,
                    entry_date: dto.entry_date,
                    amount: dto.amount,
                    custom_idx: dto.custom_idx,
                    custom_name: dto.custom_name,
                    custom_owner: dto.custom_owner,
                    user_name: dto.user_name,
                    user_idx: dto.user_idx,
                    status: dto.status,
                })
                setTemplateIdx(dto.template_idx || null)
                setDocumentIdx(dto.document_idx || null)
                setApprovers(approvalLines)

                console.log('approval_lines:', approvalLines)
                console.log('approvers 상태:', approvers)
            }
        })

        axios.get('http://192.168.0.122/template/list').then((res) => {
            if (res.data?.list) setTemplateList(res.data.list)
        })
    }, [entry_idx])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const previewDocument = async () => {
        if (!templateIdx) return alert('템플릿을 선택하세요')

        const res = await axios.post('http://192.168.0.122/voucher/preview', {
            template_idx: templateIdx,
            variables: formData,
        })

        if (res.data.success) setPreviewHtml(res.data.preview)
        else alert('미리보기 생성 실패')
    }

    const updateVoucher = async () => {
        if (!entry_idx) return
        if (!templateIdx) return alert('템플릿을 선택하세요')

        try {
            // 1. 전표 수정
            const res = await axios.put(`http://192.168.0.122/voucher/update/${entry_idx}`,
                {
                    ...formData,
                    entry_date: formData.entry_date,
                    status: formData.status,
                    template_idx: templateIdx,
                    document_idx: documentIdx,
                    approver_ids: approvers.map(u => Number(u.user_idx)),
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )

            if (!res.data.success) {
                alert('전표 수정 실패')
                return
            }

            const detailRes = await axios.get(`http://192.168.0.122/voucher/detail/${entry_idx}`)
            if (!detailRes.data.success) {
                alert('전표 재조회 실패')
                return
            }

            // 2. 문서 update
            const updateDocRes = await axios.put('http://192.168.0.122/document/update', {
                document_idx: documentIdx,
                idx: Number(entry_idx),
                type: 'voucher',
                template_idx: templateIdx,
                user_idx: formData.user_idx,
                variables: res.data.variables,
                approver_ids: approvers.map(a => a.user_idx),
            })

            if (!updateDocRes.data.success) {
                alert('문서 수정 실패')
                return
            }

            // 3. PDF 재생성
            const pdfRes = await axios.post('http://192.168.0.122/document/pdf', {
                document_idx: updateDocRes.data.document_idx
            })

            if (!pdfRes.data.success) {
                console.warn('PDF 재생성 실패:', pdfRes.data.message)
            }

            alert('수정 완료')
            router.push('/component/voucher')

        } catch (err) {
            console.error(err)
            alert('수정 중 오류 발생')
        }
    }

    return (
        <div className="wrap page-background">
            <Header />
            <h1 className="margin-left-20 text-align-left margin-bottom-20 font-bold" style={{ fontSize: '24px' }}>
                전표 수정
            </h1>

            <div className="template-form-container">
                <div className="template-form-left">
                    <VoucherForm
                        formData={formData}
                        onChange={handleChange}
                        approvers={approvers}
                        setApprovers={setApprovers}
                        status={formData.status}
                        setStatus={(newStatus) => setFormData(prev => ({ ...prev, status: newStatus }))}
                    />
                    <div className="template-form-group">
                        <label className="template-label">템플릿 선택</label>
                        <select
                            value={templateIdx || ''}
                            onChange={(e) => setTemplateIdx(Number(e.target.value))}
                            className="template-input"
                        >
                            <option value="">-- 선택 --</option>
                            {templateList.map((tpl) => (
                                <option key={tpl.template_idx} value={tpl.template_idx}>
                                    {tpl.template_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ textAlign: 'right', marginTop: '10px' }}>
                        <button onClick={previewDocument} className="template-btn-back" style={{ marginRight: '4px' }}>
                            미리보기
                        </button>
                        <button onClick={updateVoucher} className="template-btn-submit">
                            저장
                        </button>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <button onClick={() => router.push('/component/voucher')} className="template-btn-back">
                            목록
                        </button>
                    </div>
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