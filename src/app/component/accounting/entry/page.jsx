'use client'

import Header from "@/app/header"
import { useEffect, useState } from "react"
import axios from "axios"
import EntryTable from "./entryTable"
import SearchBar from "./searchBar"
import Pagination from "react-js-pagination"
import EntryDetailModal from "@/app/component/modal/EntryDetailModal";
import EntryRegistModal from "@/app/component/modal/EntryRegistModal";

export default function Page() {
    const [entries, setEntries] = useState([])
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [totalCount, setTotalCount] = useState(0)
    const [selectedList, setSelectedList] = useState([])
    const [selectedEntry, setSelectedEntry] = useState(null)
    const [isSearching, setIsSearching] = useState(false)
    const [showRegistModal, setShowRegistModal] = useState(false)

    const defaultFilter = {
        status: '',
        custom_name: '',
        customer_name: '',
        startDate: '',
        endDate: ''
    }

    const [filter, setFilter] = useState(defaultFilter)

    const handleReset = () => {
        setFilter(defaultFilter)
        setIsSearching(false)
        setPage(1)
        fetchEntries(1)
    }

    const fetchEntries = async (pageNum) => {
        try {
            const res = await axios.get(`http://localhost:8080/accountList/${pageNum}`)
            setEntries(res.data.list || [])
            setTotalCount(res.data.total || 0)
        } catch (error) {
            console.log('전표 리스트 불러오기 실패:', error)
        }
    }

    const handleSearch = async () => {
        try {
            setIsSearching(true)
            const res = await axios.post('http://localhost:8080/accountListSearch', {
                ...filter,
                page: 1,
                limit: limit
            })
            setEntries(res.data.list || [])
            setTotalCount(res.data.total || 0)
            setPage(1)
        } catch (err) {
            console.error('검색 실패:', err)
        }
    }

    useEffect(() => {
        if (isSearching) {
            axios.post('http://localhost:8080/accountListSearch', {
                ...filter,
                page: page,
                limit: limit
            }).then(res => {
                setEntries(res.data.list || [])
                setTotalCount(res.data.total || 0)
            }).catch(err => {
                console.error("검색 페이지 이동 실패:", err)
            })
        } else {
            fetchEntries(page)
        }
    }, [page])

    const handleDelete = async () => {
        if (selectedList.length === 0) {
            alert('삭제할 전표를 선택하세요!')
            return
        }

        if (!window.confirm(`총 ${selectedList.length}건 삭제할까요?`)) return

        try {
            for (const idx of selectedList) {
                await axios.delete(`http://localhost:8080/accountDelete/${idx}`)
            }
            alert('삭제 완료!')
            setSelectedList([])
            fetchEntries(page)
        } catch (e) {
            alert('삭제 중 오류 발생!')
            console.error(e)
        }
    }

    const handleEntryClick = async (entry_idx) => {
        try {
            const res = await axios.get(`http://localhost:8080/accountDetail/${entry_idx}`)
            setSelectedEntry(res.data)
        } catch (e) {
            console.error('전표 상세 조회 실패:', e)
        }
    }

    return (
        <>
            <Header />

            <main className="entryList-container">
                <div className="entryList-title">회계전표 관리</div>
                <div className="entryList-layout">
                    <section className="entryList-left">
                        <SearchBar
                            filter={filter}
                            onFilterChange={setFilter}
                            onSearch={handleSearch}
                            onReset={handleReset}
                        />

                        <EntryTable
                            entries={entries}
                            selectedList={selectedList}
                            setSelectedList={setSelectedList}
                            onClickEntry={handleEntryClick}
                        />

                        <div className="product-pagination">
                            <Pagination
                                activePage={page}
                                itemsCountPerPage={limit}
                                totalItemsCount={totalCount}
                                pageRangeDisplayed={5}
                                onChange={(page) => setPage(page)}
                            />
                        </div>
                        <div className="flex justify-start gap-2 mt-4">
                            <button className="entryList-fabBtn blue" onClick={() => setShowRegistModal(true)}>
                                전표 등록
                            </button>
                            <button className="entryList-fabBtn red-del" onClick={handleDelete}>삭제</button>
                        </div>
                    </section>

                    {selectedEntry && (
                        <EntryDetailModal
                            open={!!selectedEntry}
                            entry={selectedEntry}
                            onClose={() => setSelectedEntry(null)}
                        />
                    )}

                    {showRegistModal && (
                        <EntryRegistModal
                            open={showRegistModal}
                            onClose={() => setShowRegistModal(false)}
                            onSuccess={() => fetchEntries(page)}
                        />
                    )}
                </div>
            </main>
        </>
    )
}
