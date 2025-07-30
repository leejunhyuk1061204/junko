'use client'

import { useEffect, useState } from "react"
import axios from "axios"
import TaxInvoicePdfPreviewModal from '@/app/component/modal/TaxInvoicePdfPreviewModal'
import '@/app/globals.css'

export default function TaxInvoiceList() {
    const [invoiceList, setInvoiceList] = useState([])
    const [page, setPage] = useState(1)
    const [pages, setPages] = useState(1)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')
    const [selectedIdx, setSelectedIdx] = useState(null)
    const [pdfUrl, setPdfUrl] = useState(null)
    const [pdfOpen, setPdfOpen] = useState(false)

    useEffect(() => {
        fetchInvoices()
    }, [page, search, status])

    const fetchInvoices = async () => {
        try {
            const res = await axios.get('http://192.168.0.122:8080/taxInvoiceSearch', {
                params: { page, search, status },
            })
            if (res.data.success) {
                setInvoiceList(res.data.list)
                setPages(res.data.pages)
            }
        } catch (err) {
            console.error('세금계산서 조회 실패:', err)
        }
    }

    const handleSearch = () => {
        setPage(1)
        fetchInvoices()
    }

    const handleDelete = async (invoice_idx) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return
        try {
            const res = await axios.delete(`http://192.168.0.122:8080/taxInvoiceDel/${invoice_idx}`, {
                headers: { Authorization: localStorage.getItem('token') },
            })
            if (res.data.success) {
                alert('삭제 완료')
                fetchInvoices()
                if (selectedIdx === invoice_idx) setSelectedIdx(null)
            } else {
                alert('삭제 실패: ' + res.data.message)
            }
        } catch (err) {
            console.error('삭제 오류', err)
        }
    }

    const handlePreviewPdf = async (invoice_idx) => {
        try {
            const res = await axios.post('http://192.168.0.122:8080/taxInvoicePdf', null, {
                params: {
                    invoice_idx,
                    template_idx: 1,
                },
            })
            if (res.data.success) {
                setPdfUrl(res.data.file_path)
                setPdfOpen(true)
            } else {
                alert('PDF 생성 실패')
            }
        } catch (err) {
            console.error('PDF 미리보기 오류', err)
        }
    }

    return (
        <>
            <main className="tax-invoice-list entryList-container">
                <div className="entryList-title">세금계산서 / 증빙 관리</div>

                <div className="entryList-searchBar">
                    <input
                        type="text"
                        placeholder="거래처명"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">전체</option>
                        <option value="작성중">작성중</option>
                        <option value="발행완료">발행완료</option>
                        <option value="취소">취소</option>
                    </select>
                    <button className="entryList-fabBtn blue" onClick={handleSearch}>검색</button>
                </div>

                <table className="entryList-table">
                    <thead>
                    <tr>
                        <th>NO</th>
                        <th>계산서 번호</th>
                        <th>구분</th>
                        <th>거래처명</th>
                        <th>금액</th>
                        <th>발행일</th>
                        <th>상태</th>
                        <th>PDF</th>
                        <th>담당자</th>
                        <th>삭제</th>
                    </tr>
                    </thead>
                    <tbody>
                    {invoiceList.map((item, index) => (
                        <tr key={item.invoice_idx} className={selectedIdx === item.invoice_idx ? 'selected' : ''}>
                            <td>{(page - 1) * 10 + index + 1}</td>
                            <td
                                className="entryList-entryNo link"
                                onClick={() => setSelectedIdx(item.invoice_idx)}
                            >
                                TX{item.invoice_idx.toString().padStart(10, '0')}
                            </td>
                            <td>{item.entry_idx ? '발행' : '수취'}</td>
                            <td>{item.custom_name}</td>
                            <td>{item.total_amount.toLocaleString()}</td>
                            <td>{item.reg_date?.split('T')[0]}</td>
                            <td className={`status ${item.status}`}>{item.status}</td>
                            <td>
                                <button className="entryList-fabBtn small blue" onClick={() => handlePreviewPdf(item.invoice_idx)}>
                                    미리보기
                                </button>
                            </td>
                            <td>{item.issued_by}</td>
                            <td>
                                <button className="entryList-fabBtn small red-del" onClick={() => handleDelete(item.invoice_idx)}>
                                    삭제
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className="entryList-pagination mt-4">
                    {[...Array(pages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`entryList-pageBtn ${page === i + 1 ? 'active' : ''}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            </main>

            <TaxInvoicePdfPreviewModal
                open={pdfOpen}
                pdfUrl={pdfUrl}
                onClose={() => setPdfOpen(false)}
            />
        </>
    )
}