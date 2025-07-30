'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import Header from "@/app/header";

export default function VoucherDetailPage() {
    const { entry_idx } = useParams()
    const [voucher, setVoucher] = useState(null)
    const [previewHtml, setPreviewHtml] = useState('')
    const [previewMode, setPreviewMode] = useState('voucher')
    const [approvalLines, setApprovalLines] = useState([])

// 전표 데이터 불러오기
    useEffect(() => {
        if (!entry_idx) return
        axios.get(`http://192.168.0.122/voucher/detail/${entry_idx}`)
            .then(res => {
                if (res.data.success) {
                    setVoucher(res.data.data)
                    setApprovalLines(res.data.approval_lines || [])
                } else {
                    alert('전표를 불러오지 못했습니다.')
                }
            })
            .catch(err => {
                console.error(err)
                alert('서버 오류 발생')
            })
    }, [entry_idx])

// approver_ids 기반 approvalLines 구성
    useEffect(() => {
        if (!voucher?.approver_ids) return

        const fetchUsers = async () => {
            try {
                const res = await axios.post('http://192.168.0.122/users/list', {})
                if (res.data.success) {
                    const allUsers = res.data.list

                    const lines = voucher.approver_ids.map((id, idx) => {
                        const user = allUsers.find(u => u.user_idx === id)
                        return {
                            user_idx: id,
                            user_name: user?.user_name || '알 수 없음',
                        }
                    })

                    setApprovalLines(lines)
                }
            } catch (err) {
                console.error('유저 목록 불러오기 실패:', err)
            }
        }

        fetchUsers()
    }, [voucher?.approver_ids])

    useEffect(() => {
        if (!voucher) return

        const loadPreview = async () => {
            const baseData = {
                entry_idx: voucher.entry_idx,
                entry_type: voucher.entry_type,
                entry_date: voucher.entry_date?.slice(0, 10) || '',
                amount: voucher.amount,
                user_idx: voucher.user_idx,
                custom_idx: voucher.custom_idx,
            }

            const url = previewMode === 'voucher'
                ? 'http://192.168.0.122/voucher/preview'
                : 'http://192.168.0.122/entry-detail/preview'

            const template_idx = previewMode === 'voucher' ? 10 : 14

            try {
                const res = await axios.post(url, {
                    template_idx,
                    variables: { ...baseData },
                })
                if (res.data.success) setPreviewHtml(res.data.preview)
            } catch (e) {
                console.error(e)
            }
        }

        loadPreview()
    }, [voucher, previewMode])

    const handleDocumentCreate = async () => {
        const confirmCreate = window.confirm('문서를 생성하시겠습니까?')
        if (!confirmCreate) return

        try {
            const isVoucher = previewMode === 'voucher'
            const url = isVoucher
                ? 'http://192.168.0.122/voucher/preview'
                : 'http://192.168.0.122/entry-detail/preview'
            const template_idx = isVoucher ? 10 : 14

            const variableRes = await axios.post(url, {
                template_idx,
                variables: {
                    entry_idx: voucher.entry_idx,
                    entry_type: voucher.entry_type,
                    entry_date: voucher.entry_date ? String(voucher.entry_date).slice(0, 10) : '',
                    amount: voucher.amount,
                    user_idx: voucher.user_idx,
                    custom_idx: voucher.custom_idx,
                    approver_ids: approvers.map(u => u.user_idx),
                },
            })

            if (!variableRes.data.success) {
                alert('문서 변수 생성 실패')
                return
            }

            const variables = variableRes.data.variables

            const res = await axios.post('http://192.168.0.122/document/insert', {
                idx: voucher.entry_idx,
                type: isVoucher ? 'voucher' : 'entry_detail',
                user_idx: voucher.user_idx,
                template_idx,
                variables,
                approver_ids: approvalLines.map(a => a.user_idx)
            })

            if (res.data.success && res.data.document_idx) {
                const pdfRes = await axios.post('http://192.168.0.122/document/pdf', {
                    document_idx: res.data.document_idx,
                })

                if (pdfRes.data.success) {
                    const detailRes = await axios.get(`http://192.168.0.122/voucher/detail/${voucher.entry_idx}`)
                    if (detailRes.data.success) setVoucher(detailRes.data.data)
                    alert('문서 생성 완료!')
                } else {
                    alert('PDF 생성 실패')
                }
            } else {
                alert('문서 생성 실패: ' + (res.data.message || ''))
            }
        } catch (err) {
            console.error('문서 생성 중 오류:', err)
            alert('문서 생성 중 오류 발생')
        }
    }
    if (!voucher) return <div>로딩 중...</div>

    const getDownloadLink = () => {
        if (!voucher) return '#'

        if (previewMode === 'voucher') {
            return voucher.document_idx
                ? `http://192.168.0.122/download/pdf/${voucher.document_idx}`
                : '#'
        } else {
            return voucher.entry_detail_document_idx
                ? `http://192.168.0.122/download/pdf/${voucher.entry_detail_document_idx}`
                : '#'
        }
    }

    return (
        <div className="productPage wrap page-background">
            <Header />
            <div className="template-form-container">
                {/* 왼쪽: 전표 정보 + 분개 리스트 */}
                <div className="template-form-left">
                    <h3 className="text-align-left margin-bottom-10">
                        <span className="product-header">전표 상세</span>
                    </h3>

                    <table className="product-list margin-bottom-10">
                        <tbody>
                        <tr><td>전표 번호</td><td>{voucher.entry_idx}</td></tr>
                        <tr><td>전표 유형</td><td>{voucher.entry_type}</td></tr>
                        <tr><td>거래처</td><td>{voucher.custom_name}</td></tr>
                        <tr><td>고객명</td><td>{voucher.custom_owner}</td></tr>
                        <tr><td>금액</td><td>{Number(voucher.amount).toLocaleString()}원</td></tr>
                        <tr><td>일자</td><td>{voucher.entry_date}</td></tr>
                        <tr><td>작성자</td><td>{voucher.user_name}</td></tr>
                        <tr><td>상태</td><td>{voucher.status}</td></tr>
                        </tbody>
                    </table>

                    <div style={{ marginTop: '50px' }}>
                    <h3 className="text-align-left margin-bottom-10">
                        <span className="product-header">차변/대변 내역</span>
                    </h3>

                    <table className="product-list margin-bottom-10">
                        <thead>
                        <tr>
                            <th>계정코드</th>
                            <th>금액</th>
                            <th>타입</th>
                        </tr>
                        </thead>
                        <tbody>
                        {voucher.entry_details?.map((d, idx) => (
                            <tr key={idx}>
                                <td>{d.as_idx}</td>
                                <td>{Number(d.amount).toLocaleString()}원</td>
                                <td>{d.type}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <button
                            className={`template-btn-submit ${previewMode === 'voucher' ? 'active' : ''}`}
                            onClick={() => setPreviewMode('voucher')}
                        >
                            전표 미리보기
                        </button>
                        <button
                            className={`template-btn-submit ${previewMode === 'entry_detail' ? 'active' : ''}`}
                            onClick={() => setPreviewMode('entry_detail')}
                        >
                            분개 미리보기
                        </button>
                    </div>

                    {approvalLines.length > 0 && (
                        <div style={{ marginTop: '30px' }}>
                            <h3 className="text-align-left margin-bottom-10">
                                <span className="product-header">결재라인</span>
                            </h3>
                            <table className="product-list margin-bottom-10">
                                <thead>
                                <tr>
                                    <th>순번</th>
                                    <th>결재자</th>
                                    <th>상태</th>
                                    <th>결재일</th>
                                </tr>
                                </thead>
                                <tbody>
                                {approvalLines.map((line, idx) => (
                                    <tr key={idx}>
                                        <td>{line.step}차</td>
                                        <td>{line.user_name}</td>
                                        <td>{line.status}</td>
                                        <td>{line.approved_date ? line.approved_date.slice(0, 10) : '-'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="text-align-left" style={{ marginTop: '40px' }}>
                        <Link href="./" className="template-btn-back">목록</Link>
                    </div>

                </div>

                {/* 오른쪽: 문서 미리보기 */}
                <div className="template-form-right">
                    <h3 className="text-align-left margin-bottom-10" style={{ marginBottom: '40px', marginTop: '10px' }}>
                        <span className="product-header">문서 미리보기</span>
                    </h3>

                    {previewHtml ? (
                        <>
                            <iframe
                                srcDoc={previewHtml}
                                className="template-preview-frame"
                                title="문서 미리보기"
                            />
                            <div style={{ marginTop: '30px' }}>
                                {(previewMode === 'voucher' && voucher.document_idx) ||
                                (previewMode === 'entry_detail' && voucher.entry_detail_document_idx) ? (
                                    <a
                                        href={getDownloadLink()}
                                        className="template-btn-submit margin-top-10"
                                        target="_blank"
                                    >
                                        PDF 다운로드
                                    </a>
                                ) : (
                                    <button onClick={handleDocumentCreate} className="template-btn-submit">
                                        문서 생성
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <div>문서 미리보기를 불러오는 중입니다...</div>
                    )}
                </div>
            </div>
        </div>
            )
        }
