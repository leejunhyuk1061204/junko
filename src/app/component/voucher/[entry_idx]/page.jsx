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

    useEffect(() => {
        if (!entry_idx) return
        axios.get(`http://localhost:8080/voucher/detail/${entry_idx}`)
            .then(res => {
                if (res.data.success) setVoucher(res.data.data)
                else alert('전표를 불러오지 못했습니다.')
            })
            .catch(err => {
                console.error(err)
                alert('서버 오류 발생')
            })
    }, [entry_idx])

    useEffect(() => {
        if (voucher?.document_idx) {
            axios.post('http://localhost:8080/voucher/preview', {
                template_idx: 10,
                variables: {
                    entry_idx: voucher.entry_idx,
                    entry_type: voucher.entry_type,
                    entry_date: voucher.entry_date ? String(voucher.entry_date).slice(0, 10) : '',
                    amount: voucher.amount,
                    user_idx: voucher.user_idx,
                    custom_idx: voucher.custom_idx,
                }
            }).then((res) => {
                if (res.data.success) {
                    setPreviewHtml(res.data.preview)
                } else {
                    console.warn("미리보기 실패")
                }
            }).catch(console.error)
        }
    }, [voucher])


    const handleDocumentCreate = async () => {
        const confirmCreate = window.confirm('문서를 생성하시겠습니까?')
        if (!confirmCreate) return

        try {
            // 1. 백엔드에 변수 요청 (voucherToVariables 이용)
            const variableRes = await axios.post('http://localhost:8080/voucher/preview', {
                template_idx: 1,
                variables: {
                    entry_idx: voucher.entry_idx,
                    entry_type: voucher.entry_type,
                    entry_date: voucher.entry_date ? String(voucher.entry_date).slice(0, 10) : '',
                    amount: voucher.amount,
                    user_idx: voucher.user_idx,
                    custom_idx: voucher.custom_idx,
                },
            })

            if (!variableRes.data.success) {
                alert('문서 변수 생성 실패')
                return
            }

            const variables = variableRes.data.variables

            // 2. 문서 생성
            const res = await axios.post('http://localhost:8080/document/insert', {
                idx: voucher.entry_idx,
                type: 'voucher',
                user_idx: voucher.user_idx,
                template_idx: 1,
                variables,
            })

            if (res.data.success && res.data.document_idx) {
                // 3. PDF 생성
                const pdfRes = await axios.post('http://localhost:8080/document/pdf', {
                    document_idx: res.data.document_idx
                })

                if (pdfRes.data.success) {
                    // 4. 전표 정보 다시 불러오기 (새로고침 없이 반영)
                    const detailRes = await axios.get(`http://localhost:8080/voucher/detail/${voucher.entry_idx}`)
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

                    <div className="text-align-left" style={{ marginTop: '40px' }}>
                    <Link href="./" className="template-btn-back">목록</Link>
                    </div>
                </div>

                {/* 오른쪽: 문서 미리보기 */}
                <div className="template-form-right">
                    <h3 className="text-align-left margin-bottom-10" style={{ marginBottom: '40px' , marginTop: '10px' }}>
                        <span className="product-header">문서 미리보기</span>
                    </h3>

                    {voucher.document_idx ? (
                        <>
                            <iframe
                                srcDoc={previewHtml}
                                className="template-preview-frame"
                                title="문서 미리보기"
                            />
                            <div style={{ marginTop: '30px'}}>
                            <a
                                href={`http://localhost:8080/download/pdf/${voucher.document_idx}`}
                                className="template-btn-submit margin-top-10"
                                target="_blank"
                            >
                                PDF 다운로드
                            </a>
                            </div>
                        </>
                    ) : (
                        <button onClick={handleDocumentCreate} className="template-btn-submit">
                            문서 생성
                        </button>
                    )}
                </div>
            </div>
        </div>
            )
        }
