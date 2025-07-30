import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../globals.css';

const TaxInvoiceList = () => {
    const [invoiceList, setInvoiceList] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        fetchInvoices();
    }, [page, search, status]);

    const fetchInvoices = async () => {
        try {
            const res = await axios.get('http://192.168.0.122:8080/taxInvoiceSearch', {
                params: {
                    page,
                    search,
                    status,
                },
            });
            if (res.data.success) {
                setInvoiceList(res.data.list);
                setPages(res.data.pages);
            }
        } catch (err) {
            console.error('세금계산서 조회 실패:', err);
        }
    };

    const handleSearch = () => {
        setPage(1);
        fetchInvoices();
    };

    const handleDelete = async (invoice_idx) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            const res = await axios.delete(`http://192.168.0.122:8080/taxInvoiceDel/${invoice_idx}`, {
                headers: { Authorization: localStorage.getItem('token') },
            });
            if (res.data.success) {
                alert('삭제 완료');
                fetchInvoices();
            } else {
                alert('삭제 실패: ' + res.data.message);
            }
        } catch (err) {
            console.error('삭제 오류', err);
        }
    };

    return (
        <div className="tax-invoice-list p-4">
            <h2 className="text-xl font-bold mb-4">세금계산서 / 증빙 관리</h2>

            {/* 검색 영역 */}
            <div className="mb-4 flex gap-2 items-center">
                <input
                    type="text"
                    placeholder="거래처명"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-box"
                />
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="input-box"
                >
                    <option value="">전체</option>
                    <option value="작성중">작성중</option>
                    <option value="발행완료">발행완료</option>
                    <option value="취소">취소</option>
                </select>
                <button onClick={handleSearch} className="btn-blue">검색</button>
            </div>

            {/* 리스트 테이블 */}
            <table className="table-fixed w-full border">
                <thead>
                <tr className="bg-gray-100">
                    <th className="p-2">NO</th>
                    <th className="p-2">계산서 번호</th>
                    <th className="p-2">구분</th>
                    <th className="p-2">거래처명</th>
                    <th className="p-2">금액</th>
                    <th className="p-2">발행일</th>
                    <th className="p-2">상태</th>
                    <th className="p-2">증빙파일</th>
                    <th className="p-2">담당자</th>
                    <th className="p-2">삭제</th>
                </tr>
                </thead>
                <tbody>
                {invoiceList.map((item, index) => (
                    <tr key={item.invoice_idx} className="text-center border-t">
                        <td className="p-2">{(page - 1) * 10 + index + 1}</td>
                        <td className="p-2 text-blue-600 underline cursor-pointer">TX{item.invoice_idx.toString().padStart(10, '0')}</td>
                        <td className="p-2">{item.entry_idx ? '발행' : '수취'}</td>
                        <td className="p-2">{item.custom_name}</td>
                        <td className="p-2">{item.total_amount.toLocaleString()}</td>
                        <td className="p-2">{item.reg_date?.split('T')[0]}</td>
                        <td className="p-2">
                            <span className={`badge badge-${item.status === '발행완료' ? 'done' : item.status === '취소' ? 'cancel' : 'draft'}`}>{item.status}</span>
                        </td>
                        <td className="p-2 text-blue-500 cursor-pointer underline">다운로드</td>
                        <td className="p-2">{item.issued_by}</td>
                        <td className="p-2">
                            <button onClick={() => handleDelete(item.invoice_idx)} className="text-red-500 underline">삭제</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* 페이징 */}
            <div className="mt-4 flex justify-center gap-2">
                {[...Array(pages)].map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`px-3 py-1 border rounded ${page === i + 1 ? 'bg-blue-500 text-white' : 'bg-white'}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TaxInvoiceList;
