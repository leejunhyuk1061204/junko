'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import Header from "@/app/header";

export default function EntryStatusDetailPage() {
    const { settlement_id } = useParams()
    const [data, setData] = useState(null)
    const [previewHtml, setPreviewHtml] = useState('')
    const [docExists, setDocExists] = useState(false)

    useEffect(() => {
        if (!settlement_id) return

        axios.get(`http://localhost:8080/settlement/detail/${settlement_id}`)
            .then(res => {
                if (res.data.success) {
                    const merged = {
                        ...res.data.data,
                        file: res.data.file || null,
                    }
                    setData(merged)
                } else {
                    alert('정산 정보를 불러올 수 없습니다.')
                }
            })
            .catch(err => {
                console.error(err)
                alert('서버 오류 발생')
            })
    }, [settlement_id])

    useEffect(() => {
        if (!data) return;
        previewDocument();
    }, [data])

    const previewDocument = async () => {
        try {
            const res = await axios.post('http://localhost:8080/settlement/preview', {
                template_idx: 12,
                variables: {
                    settlement_id: data.settlement_id,
                    settlement_day: data.settlement_day,
                    amount: data.amount,
                    total_amount: data.total_amount,
                    status: data.status,
                    user_name: data.user_name || '',
                    user_idx: data.user_idx,
                    custom_idx: data.custom_idx,
                    custom_name: data.custom_name || '',
                }
            })

            if (res.data.success) {
                setPreviewHtml(res.data.preview)
            }
        } catch (e) {
            console.error(e)
            alert('미리보기 오류')
        }
    }

    const handleDocumentCreate = async () => {
        if (!confirm('문서를 생성하시겠습니까?')) return

        try {
            const variableRes = await axios.post('http://localhost:8080/settlement/preview', {
                template_idx: 12,
                variables: {
                    settlement_id: data.settlement_id,
                    settlement_day: data.settlement_day,
                    amount: data.amount,
                    total_amount: data.total_amount,
                    user_idx: data.user_idx,
                    status: data.status,
                    user_name: data.user_name || '',
                    custom_idx: data.custom_idx,
                    custom_name: data.custom_name || '',
                }
            })

            if (!variableRes.data.success) {
                alert('문서 변수 생성 실패')
                return
            }

            const res = await axios.post('http://localhost:8080/document/insert', {
                idx: data.settlement_id,
                type: 'settlement',
                user_idx: data.user_idx,
                user_name: data.user_name,
                template_idx: 12,
                custom_name: data.custom_name || '',
                variables: variableRes.data.variables,
            })


            if (res.data.success && res.data.document_idx) {
                await axios.post('http://localhost:8080/document/pdf', {
                    document_idx: res.data.document_idx,
                })

                setTimeout(async () => {
                    const detailRes = await axios.get(`http://localhost:8080/settlement/detail/${data.settlement_id}`)
                    if (detailRes.data.success) {
                        const merged = {
                            ...detailRes.data.data,
                            file: detailRes.data.file || null,
                        }
                        setData(merged)
                        setDocExists(!!detailRes.data.file)
                    }
                }, 1000) // 1초 후 재조회

                alert('문서 생성 완료!')
                setDocExists(true)
            } else {
                alert('문서 생성 실패')
            }
        } catch (err) {
            console.error(err)
            alert('문서 생성 중 오류 발생')
        }
    }

    if (!data) return <div>로딩 중...</div>

    return (
        <div className="productPage wrap page-background">
            <Header />
            <div className="template-form-container">
                {/* 왼쪽: 정산 정보 */}
                <div className="template-form-left">
                    <h3 className="text-align-left margin-bottom-10">
                        <span className="product-header">정산 상세</span>
                    </h3>

                    <table className="product-list margin-bottom-10">
                        <tbody>
                        <tr><td>ID</td><td>{data.settlement_id}</td></tr>
                        <tr><td>전표번호</td><td>{data.entry_idx}</td></tr>
                        <tr><td>전표유형</td><td>{data.entry_type}</td></tr>
                        <tr><td>전표일자</td><td>{data.entry_date}</td></tr>
                        <tr><td>전표총액</td><td>{Number(data.total_amount).toLocaleString()}원</td></tr>
                        <tr><td>정산일</td><td>{data.settlement_day}</td></tr>
                        <tr><td>정산금액</td><td>{Number(data.amount).toLocaleString()}원</td></tr>
                        <tr><td>미정산금액</td><td>{Number(data.total_amount - data.amount).toLocaleString()}원</td></tr>
                        <tr><td>거래처</td><td>{data.custom_name}</td></tr>
                        <tr><td>작성자</td><td>{data.user_name}</td></tr>
                        <tr><td>상태</td><td>{data.status}</td></tr>
                        </tbody>
                    </table>

                    <div className="text-align-left" style={{ marginTop: '40px' }}>
                        <Link href="/component/entryStatus" className="template-btn-back">목록</Link>
                    </div>
                </div>

                {/* 오른쪽: 문서 미리보기 */}
                <div className="template-form-right">
                    <h3 className="text-align-left margin-bottom-10">
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
                                {docExists && data.file ? (
                                    <a
                                        href={`http://localhost:8080/download/pdf/${data.document_idx}`}
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
