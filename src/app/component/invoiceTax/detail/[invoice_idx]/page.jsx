'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import Header from '@/app/header'

export default function InvoiceDetailPage() {
    const router = useRouter()
    const params = useParams()
    const [data, setData] = useState(null)
    const [previewHtml, setPreviewHtml] = useState('')
    const [userList, setUserList] = useState([])

    useEffect(() => {
        document.body.classList.add('invoice-detail-body-reset')
        return () => document.body.classList.remove('invoice-detail-body-reset')
    }, [])

    useEffect(() => {
        axios.post('http://192.168.0.122/users/list', {})
            .then(res => setUserList(res.data?.list || []))
            .catch(err => console.error('유저 리스트 불러오기 실패:', err))
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get(`http://192.168.0.122/invoice/detail/${params.invoice_idx}`)
            console.log('응답 데이터:', res.data)
            if (res.data.success) setData(res.data.data)
        }
        fetchData()
    }, [params])

    useEffect(() => {
        if (!data?.invoice_idx) return
        const fetchPreview = async () => {
            try {
                const res = await axios.post('http://192.168.0.122/invoice/preview', data)
                if (res.data?.preview) setPreviewHtml(res.data.preview)
            } catch (err) {
                console.error('문서 미리보기 오류:', err)
            }
        }
        fetchPreview()
    }, [data])

    const downloadPdf = async () => {
        try {
            const res = await axios.get(`http://192.168.0.122/download/pdf/${data.document_idx}`, {
                responseType: 'blob',
            })

            const url = window.URL.createObjectURL(new Blob([res.data], {type: 'application/pdf'}))
            const link = document.createElement('a')
            link.href = url
            link.download = `세금계산서_${data.invoice_idx}.pdf`
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (err) {
            console.error('PDF 다운로드 실패:', err)
        }
    }

    if (!data) return <div className="wrap page-background"><Header/><p>로딩 중...</p></div>

    return (
        <div className="wrap page-background" >
            <Header/>
            <div className="template-form-container">
                {/* 왼쪽: 계산서 상세 정보 */}
                <div className="template-form-left">
                    <h3 className="text-align-left margin-bottom-10">
                        <span className="product-header">세금 계산서 상세</span>
                    </h3>

                    <table className="product-list margin-bottom-10">
                        <thead>
                        <tr>
                            <th>종류</th>
                            <th>구분</th>
                            <th>건수</th>
                            <th>공급가액</th>
                            <th>부가세</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Array.isArray(data.details) && data.details.length > 0 ? (
                            <>
                                {data.details.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>품의</td>
                                        <td>{item.item_name}</td>
                                        <td>{item.quantity}</td>
                                        <td>{(item.quantity * item.price).toLocaleString()}</td>
                                        <td>{Math.floor(item.quantity * item.price * 0.1).toLocaleString()}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan={2}>합계</td>
                                    <td>{data.details.reduce((a, b) => a + b.quantity, 0)}</td>
                                    <td>{data.total_amount.toLocaleString()}</td>
                                    <td>{Math.floor(data.total_amount * 0.1).toLocaleString()}</td>
                                </tr>
                            </>
                        ) : (
                            <tr><td colSpan={5}>품목 없음</td></tr>
                        )}
                        </tbody>
                    </table>

                    <table className="product-list margin-bottom-10">
                        <tbody>
                        <tr><td>계산서 번호</td><td>TX{String(data.invoice_idx).padStart(10, '0')}</td></tr>
                        <tr><td>상태</td><td>{data.status}</td></tr>
                        <tr><td>거래처</td><td>{data.custom_name || data.custom_idx}</td></tr>
                        <tr><td>총금액</td><td>{(data.total_amount * 1.1).toLocaleString()}원</td></tr>
                        <tr><td>작성일</td><td>{data.reg_date}</td></tr>
                        <tr><td>작성자</td><td>{data.issued_by}</td></tr>
                        <tr>
                            <td>결재자</td>
                            <td>
                                <div className="approver-tag-container">
                                    {Array.isArray(data.approver_ids) && data.approver_ids.length > 0 ? (
                                        data.approver_ids
                                            .map(id => Number(id))
                                            .map(id => {
                                            const user = userList.find(u => u.user_idx === id)
                                            return user ? (
                                                <span key={id} className="approver-tag">
                                                    {user.user_name}
                                                </span>
                                            ) : (
                                                <span key={id} className="approver-tag">알 수 없음</span>
                                            )
                                        })
                                    ) : '없음'}

                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>

                    <button type="button" onClick={() => router.push('/component/invoiceTax')} className="template-btn-back">
                        목록
                    </button>
                </div>

                {/* 문서 미리보기 */}
                <div className="template-form-right">
                    <h3 className="text-align-left margin-bottom-10">
                        <span className="product-header">문서 미리보기</span>
                    </h3>
                    <div
                        className="template-preview-frame"
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                        style={{ backgroundColor: '#fff', padding: '20px', border: '1px solid #ddd', maxHeight: '600px', overflowY: 'auto' }}
                    />
                    <button className="template-btn-submit" style={{ marginTop: '10px' }} onClick={downloadPdf}>
                        PDF 다운로드
                    </button>
                </div>
            </div>
        </div>
    )
}
