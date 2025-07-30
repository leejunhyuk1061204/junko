'use client'

import {useEffect, useState} from 'react'
import Link from 'next/link'
import Header from '@/app/header'
import Pagination from 'react-js-pagination'
import {TbSearch} from 'react-icons/tb'
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from '@headlessui/react'
import axios from "axios";

export default function InvoiceListPage() {
    const [list, setList] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [size] = useState(10)
    const [sort, setSort] = useState('reg_date')
    const [order, setOrder] = useState('desc')
    const [filters, setFilters] = useState({
        status: '',
        keyword: '',
        startDate: '',
        endDate: '',
    })

    const statusOptions = [
        {id: '', name: '전체 상태'},
        {id: '작성중', name: '작성중'},
        {id: '발행완료', name: '발행완료'},
        {id: '취소', name: '취소'},
    ]

    const fetchData = async () => {
        const params = {
            page,
            size,
            status: filters.status,
            keyword: filters.keyword,
            startDate: filters.startDate,
            endDate: filters.endDate,
            sort: 'i.invoice_idx',
            order: 'DESC'
        }

        const res = await fetch(`http://localhost:8080/invoice/list?${new URLSearchParams(params)}`)
        const data = await res.json()

        if (data.success) {
            setList(data.list || [])
            setTotal(data.total || 0)
        }
    }

    useEffect(() => {
        fetchData()
    }, [page, filters])

    const handleSearch = (e) => {
        e.preventDefault()
        setPage(1)
        fetchData()
    }

    const handleReset = () => {
        setFilters({ status: '', keyword: '', startDate: '', endDate: '' })
        setPage(1)
    }

    const handleSort = (col) => {
        if (sort === col) {
            setOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
        } else {
            setSort(col)
            setOrder('desc')
        }
        setPage(1)
    }

    const handleStatusChange = async (invoice_idx, newStatus) => {
        try {
            const res = await axios.put(`http://localhost:8080/invoice/status/${invoice_idx}`, {
                status: newStatus
            })

            if (res.data.success) {
                setList(prev =>
                    prev.map(item =>
                        item.invoice_idx === invoice_idx ? { ...item, status: newStatus } : item
                    )
                )
            } else {
                alert('상태 변경 실패')
            }
        } catch (err) {
            console.error(err)
            alert('에러 발생')
        }
    }

    return (
        <div className="wrap page-background">
            <Header/>
            <div className="product-list-back">
                <h3 className="text-align-left margin-bottom-10">
                    <span className="product-header">세금계산서 관리</span>
                </h3>

                <form className="entryList-searchBar" onSubmit={handleSearch}>
                    <Listbox value={filters.status} onChange={(val) => setFilters(prev => ({...prev, status: val}))}>
                        {({open}) => (
                            <div className="custom-select-wrapper">
                                <ListboxButton className="custom-select-btn">
                                    {statusOptions.find((opt) => opt.id === filters.status)?.name || '전체 상태'}
                                </ListboxButton>
                                {open && (
                                    <ListboxOptions className="custom-select-options">
                                        {statusOptions.map((item) => (
                                            <ListboxOption key={item.id} value={item.id} className="custom-select-option-item">
                                                {item.name}
                                            </ListboxOption>
                                        ))}
                                    </ListboxOptions>
                                )}
                            </div>
                        )}
                    </Listbox>

                    <input
                        name="keyword"
                        type="text"
                        placeholder="작성자 검색"
                        value={filters.keyword}
                        onChange={(e) => setFilters(prev => ({...prev, keyword: e.target.value}))}
                    />
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters(prev => ({...prev, startDate: e.target.value}))}
                    />
                    <span>~</span>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters(prev => ({...prev, endDate: e.target.value}))}
                    />
                    <button type="submit" className="entryList-fabBtn blue" title="검색">
                        <TbSearch size={16}/>
                    </button>
                    <button type="button" className="entryList-fabBtn gray" onClick={handleReset}>초기화</button>
                </form>

                <table className="product-list margin-bottom-10">
                    <thead>
                    <tr>
                        <th>번호</th>
                        <th>전표번호</th>
                        <th>거래처</th>
                        <th>합계</th>
                        <th>상태</th>
                        <th>작성자</th>
                        <th onClick={() => handleSort('reg_date')}>등록일</th>
                        <th>관리</th>
                    </tr>
                    </thead>
                    <tbody>
                    {list.map((item) => (
                        <tr key={item.invoice_idx}>
                            <td>{item.invoice_idx}</td>
                            <td>{item.entry_idx}</td>
                            <td>
                                <a href={`./invoiceTax/detail/${item.invoice_idx}`} className="product-clickable">
                                    {item.custom_name}
                                </a>
                            </td>
                            <td>{Number(item.total_amount).toLocaleString()}원</td>
                            <td>
                                <select
                                    value={item.status}
                                    onChange={e => handleStatusChange(item.invoice_idx, e.target.value)}
                                    className="invoice-status-select"
                                >
                                    <option value="작성중">작성중</option>
                                    <option value="발행완료">발행완료</option>
                                    <option value="취소">취소</option>
                                </select>
                            </td>
                            <td>{item.issued_by}</td>
                            <td>{item.reg_date}</td>
                            <td>
                                <Link href={`./invoiceTax/update/${item.invoice_idx}`}>
                                    <button className="template-btn">수정</button>
                                </Link>
                            </td>
                        </tr>
                    ))}
                    {list.length < size &&
                        Array.from({ length: size - list.length }).map((_, i) => (
                            <tr key={`empty-${i}`}>
                                <td colSpan={11} style={{ height: '45px' }}>&nbsp;</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="product-pagination flex justify-content-center gap_5 margin-bottom-20">
                    <Pagination
                        activePage={page}
                        itemsCountPerPage={size}
                        totalItemsCount={total}
                        pageRangeDisplayed={5}
                        onChange={(page) => setPage(page)}
                    />
                </div>

                <div className="flex">
                    <Link href="./invoiceTax/form">
                        <button className="product-btn">세금계산서 등록</button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
