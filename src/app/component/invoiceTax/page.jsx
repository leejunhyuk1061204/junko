'use client'

import {useEffect, useState} from 'react'
import Link from 'next/link'
import Header from '@/app/header'
import Pagination from 'react-js-pagination'
import {TbSearch} from 'react-icons/tb'
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from '@headlessui/react'

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
        {id: '확정', name: '확정'},
        {id: '정산', name: '정산'},
    ]

    const fetchData = async () => {
        const params = {
            page,
            size,
            status: filters.status,
            keyword: filters.keyword,
            startDate: filters.startDate,
            endDate: filters.endDate,
            sort,
            order
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
                            <td>{item.custom_name}</td>
                            <td>{Number(item.total_amount).toLocaleString()}원</td>
                            <td>{item.status}</td>
                            <td>{item.issued_by}</td>
                            <td>{item.reg_date}</td>
                            <td>
                                <Link href={`./invoiceTax/detail/${item.invoice_idx}`}>
                                    <button className="product-btn-small">보기</button>
                                </Link>
                                <Link href={`./invoiceTax/form/${item.invoice_idx}`}>
                                    <button className="product-btn-small">수정</button>
                                </Link>
                            </td>
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
