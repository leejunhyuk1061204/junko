'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

export default function VoucherModal({ entryIdx, onClose }) {
    const [entry, setEntry] = useState(null)
    const [pdfUrl, setPdfUrl] = useState(null)

    const fetchDetail = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/voucher/detail/${entryIdx}`)
            if (res.data.success) {
                setEntry(res.data.data)
            }
        } catch (err) {
            console.error('분개 상세 오류', err)
        }
    }

    const fetchPdf = async () => {
        try {
            setPdfUrl(`http://localhost:8080/document/download/pdf?type=entry_detail&idx=${entryIdx}`)
        } catch (err) {
            console.error('PDF 로드 실패', err)
        }
    }

    useEffect(() => {
        if (entryIdx) {
            fetchDetail()
            fetchPdf()
        }
    }, [entryIdx])

    if (!entry) return null

    return (
        <div className="modal-cap">
            <div className="capDetail-modal-box">
                {/* 좌측 - 분개 정보 */}
                <div className="capDetail-left">
                    <h2 className="entryList-title">분개 상세</h2>
                    <table className="entryDetail-table">
                        <tbody>
                        <tr>
                            <th>전표번호</th>
                            <td>{entry.entry_idx}</td>
                        </tr>
                        <tr>
                            <th>유형</th>
                            <td>{entry.entry_type}</td>
                        </tr>
                        <tr>
                            <th>작성일</th>
                            <td>{entry.entry_date}</td>
                        </tr>
                        <tr>
                            <th>상태</th>
                            <td>{entry.status}</td>
                        </tr>
                        </tbody>
                    </table>
                    {/* 닫기 버튼 */}
                    <button className="entryList-fabBtn gray" onClick={onClose}>
                        닫기
                    </button>
                </div>

                {/* 우측 - PDF 미리보기 */}
                <div className="capDetail-right">
                    <div className="capDetail-title">분개표 미리보기 (PDF)</div>
                    {pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            className="capDetail-pdf"
                            title="분개 PDF"
                        ></iframe>
                    ) : (
                        <div className="capDetail-pdf-placeholder">PDF 불러오는 중...</div>
                    )}
                </div>
            </div>
        </div>
    )
}
