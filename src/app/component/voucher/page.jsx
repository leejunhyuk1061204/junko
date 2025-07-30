'use client'

import {useEffect, useState} from 'react'
import axios from 'axios'
import Link from 'next/link'
import Header from "@/app/header";
import Pagination from "react-js-pagination";
import {TbSearch} from "react-icons/tb";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import {useRouter} from "next/navigation";

export default function VoucherListPage() {
    const [list, setList] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [size] = useState(10)
    const [sort, setSort] = useState('entry_date')
    const [order, setOrder] = useState('desc')
    const [checkedItems, setCheckedItems] = useState([])
    const [checkedList, setCheckedList] = useState([])
    const isAllChecked = list.length > 0 && checkedList.length === list.length
    const [previewUUID, setPreviewUUID] = useState(null)
    const router = useRouter()
    const [filters, setFilters] = useState({
        status: '',
        custom_name: '',
        custom_owner: '',
        from: '',
        to: '',
        keyword: '',
    })

    const statusOptions = [
        {id: '', name: '전체 상태'},
        {id: '작성중', name: '작성중'},
        {id: '확정', name: '확정'},
        {id: '미정산', name: '미정산'},
        {id: '정산', name: '정산'},
        {id: '부분정산', name: '부분정산'},
    ]

    const fetchData = async () => {
        const params = {
            page,
            size,
            sort,
            order,
            ...filters,
        }
        const res = await axios.get('http://192.168.0.122:8080/voucher/list', {params})
        if (res.data.success) {
            setList(res.data.list)
            setTotal(res.data.total)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        handleSearch(filters)
    }

    useEffect(() => {
        fetchData()
    }, [page, filters, sort, order])

    const handleSearch = () => {
        setPage(1)
        fetchData()
    }

    const handleReset = () => {
        const reset = {
            status: '',
            custom_name: '',
            custom_owner: '',
            from: '',
            to: '',
        }
        setFilters(reset)
        setPage(1)
    }

    const handleAllCheck = (e) => {
        if (e.target.checked) {
            const allIds = list.map((item) => item.entry_idx)
            setCheckedList(allIds)
        } else {
            setCheckedList([])
        }
    }

    const handleFilterChange = (e) => {
        const {name, value} = e.target
        const updated = {...filters, [name]: value}
        setFilters(updated)
        setPage(1)
    }

    const handleSortChange = (field) => {
        const newOrder = sort === field && order === 'asc' ? 'desc' : 'asc'
        setSort(field)
        setOrder(newOrder)
        setPage(1)
        setTimeout(() => fetchData(), 0)
    }

    const handleCheck = (entry_idx, checked) => {
        if (checked) {
            setCheckedList((prev) => [...prev, entry_idx])
        } else {
            setCheckedList((prev) => prev.filter((id) => id !== entry_idx))
        }
    }

    const deleteVouchers = async () => {
        if (checkedList.length === 0) return alert('삭제할 전표를 선택하세요.')
        if (!confirm('선택한 전표를 삭제하시겠습니까?')) return

        try {
            // 비동기 삭제 요청 병렬 처리
            const deletePromises = checkedList.map((id) =>
                axios.put(`http://192.168.0.122:8080/voucher/del/${id}`)
            )

            const results = await Promise.all(deletePromises)
            const successCount = results.filter(res => res.data.success).length

            alert(`${successCount}건 삭제 완료`)
            fetchData()
        } catch (err) {
            console.error(err)
            alert('삭제 중 오류 발생')
        }
    }

    const handleStatusChange = async (entry_idx, newStatus) => {
        try {
            const res = await axios.put(`http://192.168.0.122:8080/voucher/status/update/${entry_idx}`, {
                status: newStatus,
            });

            if (res.data.success) {
                alert(`상태가 '${newStatus}'(으)로 변경되었습니다.`);
                window.location.href = window.location.href
            } else {
                alert('상태 변경 실패');
            }
        } catch (err) {
            console.error(err);
            alert('상태 변경 중 오류 발생');
        }
    };

    return (
        <>
            <div className="productPage wrap page-background">
                <Header/>
                <div className="product-list-back">
                    <h3 className="text-align-left margin-bottom-10">
                        <span className="product-header">회계전표 관리</span>
                    </h3>


                    {/* 필터 바 */}
                    <form className="entryList-searchBar" onSubmit={handleSubmit}>
                        <Listbox
                            value={filters.status}
                            onChange={(value) => {
                                const updated = {...filters, status: value}
                                setFilters(updated)
                                setPage(1)
                            }}
                        >
                            {({open}) => (
                                <div className="custom-select-wrapper">
                                    <ListboxButton className="custom-select-btn">
                                        {statusOptions.find((opt) => opt.id === filters.status)?.name || '전체 상태'}
                                    </ListboxButton>
                                    {open && (
                                        <ListboxOptions className="custom-select-options">
                                            {statusOptions.map((item) => (
                                                <ListboxOption key={item.id} value={item.id}
                                                               className="custom-select-option-item">
                                                    {item.name}
                                                </ListboxOption>
                                            ))}
                                        </ListboxOptions>
                                    )}
                                </div>
                            )}
                        </Listbox>

                        <input
                            name="custom_name"
                            type="text"
                            placeholder="거래처명"
                            value={filters.custom_name || ''}
                            onChange={handleFilterChange}
                        />
                        <input
                            name="custom_owner"
                            type="text"
                            placeholder="고객명"
                            value={filters.custom_owner || ''}
                            onChange={handleFilterChange}
                        />
                        <input
                            name="from"
                            type="date"
                            value={filters.from || ''}
                            onChange={handleFilterChange}
                        />
                        <span>~</span>
                        <input
                            name="to"
                            type="date"
                            value={filters.to || ''}
                            onChange={handleFilterChange}
                        />
                        <button type="submit" className="entryList-fabBtn blue" title="검색">
                            <TbSearch size={16}/>
                        </button>
                        <button type="button" className="entryList-fabBtn gray" onClick={handleReset}>
                            초기화
                        </button>
                    </form>

                    {/* 테이블 */}
                    <table className="product-list margin-bottom-10">
                        <thead>
                        <tr>
                            <th>
                                <input type="checkbox" checked={isAllChecked} onChange={handleAllCheck}/>
                            </th>
                            <th>전표 번호</th>
                            <th>전표 유형</th>
                            <th>거래처명</th>
                            <th>고객명</th>
                            <th onClick={() => handleSortChange('amount')}>
                                금액 {sort === 'amount' && (order === 'asc' ? '▲' : '▼')}
                            </th>
                            <th>일자</th>
                            <th>작성자</th>
                            <th>상태</th>
                            <th>승인</th>
                            <th>수정</th>
                        </tr>
                        </thead>
                        <tbody>
                        {list.map((item) => (
                            <tr key={item.entry_idx}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={checkedList.includes(item.entry_idx)}
                                        onChange={(e) => handleCheck(item.entry_idx, e.target.checked)}
                                    />
                                </td>
                                <td className="product-clickable"><Link href={`./voucher/${item.entry_idx}`}>{item.entry_idx}</Link></td>
                                <td>{item.entry_type}</td>
                                <td>{item.custom_name}</td>
                                <td>{item.custom_owner}</td>
                                <td>{Number(item.amount).toLocaleString()}원</td>
                                <td>{item.entry_date}</td>
                                <td>{item.user_name}</td>
                                <td>
                                    <div style={{ padding: '4px 12px' }}>
                                        {statusOptions.find(status => status.id === item.status)?.name || item.status}
                                    </div>
                                </td>
                                <td>{Number(item.approved) === 1 ? '○' : 'X'}</td>
                                <td>
                                    {item.status === '작성중' ? (
                                        <Link href={`./voucher/update/${item.entry_idx}`}>
                                            <button className="template-btn">수정</button>
                                        </Link>
                                    ) : (
                                        <div style={{ color: '#aaa' }}>-</div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {/* 빈 줄 채우기 */}
                        {list.length < size &&
                            Array.from({ length: size - list.length }).map((_, i) => (
                                <tr key={`empty-${i}`}>
                                    <td colSpan={11} style={{ height: '46.5px' }}>&nbsp;</td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>

                    {/* 페이지네이션 */}
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
                        <Link href="./voucher/insert" className="product-btn">전표 등록</Link>
                        <button onClick={deleteVouchers} className="product-btn-del">삭제</button>
                    </div>
                </div>
            </div>
        </>
    )
}