'use client'

import {useEffect, useState} from 'react'
import axios from 'axios'
import Link from 'next/link'
import Header from "@/app/header";
import Pagination from "react-js-pagination";
import {TbSearch} from "react-icons/tb";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import {useRouter} from "next/navigation";

export default function EntryStatusListPage() {
    const [list, setList] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [size] = useState(10)
    const [checkedList, setCheckedList] = useState([])
    const isAllChecked = list.length > 0 && checkedList.length === list.length
    const router = useRouter()

    const [filters, setFilters] = useState({
        status: '',
        keyword: '',
        from: '',
        to: '',
    })

    const statusOptions = [
        {id: '', name: '전체 상태'},
        {id: '미정산', name: '미정산'},
        {id: '부분정산', name: '부분정산'},
        {id: '정산', name: '정산'},
    ]

    const fetchData = async () => {
        const params = { page, size, ...filters }
        const res = await axios.get('http://192.168.0.122/settlement/list', { params })
        if (res.data.success) {
            setList(res.data.list)
            setTotal(res.data.total)
        }
    }

    useEffect(() => { fetchData() }, [page, filters])

    const handleSearch = (e) => {
        e.preventDefault()
        setPage(1)
        fetchData()
    }

    const handleReset = () => {
        setFilters({ status: '', keyword: '', from: '', to: '' })
        setPage(1)
    }

    const handleAllCheck = (e) => {
        setCheckedList(e.target.checked ? list.map(v => v.settlement_id) : [])
    }

    const handleCheck = (id, checked) => {
        setCheckedList(prev => checked ? [...prev, id] : prev.filter(v => v !== id))
    }

    const handleDelete = async () => {
        if (checkedList.length === 0) return alert('삭제할 항목을 선택하세요')
        if (!confirm('선택 항목을 삭제할까요?')) return

        await Promise.all(checkedList.map(id => axios.put(`http://192.168.0.122/settlement/del/${id}`)))
        alert('삭제 완료')

        fetchData().then(() => {
            setCheckedList([])
        })
    }

    return (
        <div className="productPage wrap page-background">
            <Header/>
            <div className="product-list-back">
                <h1 className="margin-left-20 text-align-left margin-bottom-20 font-bold" style={{ fontSize: '24px' }}>
                    정산 관리
                </h1>

                <form className="entryList-searchBar" onSubmit={handleSearch}>
                    <Listbox value={filters.status} onChange={(val) => setFilters(prev => ({...prev, status: val}))}>
                        {({open}) => (
                            <div className="custom-select-wrapper">
                                <ListboxButton className="custom-select-btn">
                                    {statusOptions.find(opt => opt.id === filters.status)?.name || '전체 상태'}
                                </ListboxButton>
                                {open && (
                                    <ListboxOptions className="custom-select-options">
                                        {statusOptions.map(item => (
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
                        type="text"
                        name="keyword"
                        value={filters.keyword}
                        onChange={(e) => setFilters(prev => ({...prev, keyword: e.target.value}))}
                        placeholder="검색어"
                    />
                    <input
                        name="from"
                        type="date"
                        value={filters.from || ''}
                        onChange={(e) => setFilters(prev => ({...prev, from: e.target.value}))}
                    />
                    <span>~</span>
                    <input
                        name="to"
                        type="date"
                        value={filters.to || ''}
                        onChange={(e) => setFilters(prev => ({...prev, to: e.target.value}))}
                    />
                    <button type="submit" className="entryList-fabBtn blue"><TbSearch size={16}/></button>
                    <button type="button" className="entryList-fabBtn gray" onClick={handleReset}>초기화</button>
                </form>

                <table className="product-list margin-bottom-10">
                    <thead>
                    <tr>
                        <th><input type="checkbox" checked={isAllChecked} onChange={handleAllCheck}/></th>
                        <th>정산ID</th>
                        <th>전표번호</th>
                        <th>거래처</th>
                        <th>정산일</th>
                        <th>정산금액</th>
                        <th>상태</th>
                    </tr>
                    </thead>
                    <tbody>
                    {list.map(item => (
                        <tr key={item.settlement_id}>
                            <td><input type="checkbox" checked={checkedList.includes(item.settlement_id)} onChange={(e) => handleCheck(item.settlement_id, e.target.checked)}/></td>
                            <td>{item.settlement_id}</td>
                            <td className="product-clickable">
                                <Link href={`./entryStatus/detail/${item.settlement_id}`}>{item.entry_idx}</Link>
                            </td>
                            <td>{item.custom_name || '-'}</td>
                            <td>{item.settlement_day}</td>
                            <td>{Number(item.amount).toLocaleString()}원</td>
                            <td>{item.status}</td>
                        </tr>
                    ))}
                    {list.length < size &&
                        Array.from({ length: size - list.length }).map((_, i) => (
                            <tr key={`empty-${i}`}>
                                <td colSpan={8} style={{ height: '45px' }}>&nbsp;</td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>

                <div className="product-pagination flex justify-content-center gap_5 margin-bottom-20">
                    <Pagination
                        activePage={page}
                        itemsCountPerPage={size}
                        totalItemsCount={total}
                        pageRangeDisplayed={5}
                        onChange={(p) => setPage(p)}
                    />
                </div>

                <div className="flex">
                    <Link href="./entryStatus/insert" className="product-btn">정산 등록</Link>
                    <button onClick={handleDelete} className="product-btn-del">삭제</button>
                </div>
            </div>
        </div>
    )
}
