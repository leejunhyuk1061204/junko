'use client';

import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAlertModalStore } from '@/app/zustand/store';
import Header from '@/app/header';
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import {TbSearch} from "react-icons/tb";
import Pagination from "react-js-pagination";
import EmployeeDetailModal from "@/app/component/deptManager/detail/[user_idx]/page";

export default function DeptManagerList() {
    const router = useRouter();
    const { openModal } = useAlertModalStore();

    const [list, setList] = useState([]);
    const sortOptions = [
        { id: 1, name: '입사일순', value: 'hire_date ASC' },
        { id: 2, name: '이름순', value: 'user_name ASC' },
    ];
    const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
    const [sort, setSort] = useState(sortOptions[0].value);

    const [categoryOptions, setCategoryOptions] = useState([{ id: "", name: "전체 부서" }]);
    const [selectedCategory, setSelectedCategory] = useState(categoryOptions[0]);
    const [category, setCategory] = useState("");
    const [search, setSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const [showUserDetailModal, setShowUserDetailModal] = useState(false);
    const [selectedUserIdx, setSelectedUserIdx] = useState(null);

    const searchRef = useRef();

    useEffect(() => {
        fetchDeptList();
        fetchList();
    }, []);

    useEffect(() => {
        fetchList(1);
    }, [sort, category, search]);

    const handleSearch = () => {
        const keyword = searchRef.current.value;
        setSearch(keyword);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchList(page);
    }

    const handleSortChange = (option) => {
        setSelectedSort(option);
        setSort(option.value);
    };

    const handleCategoryChange = (option) => {
        setSelectedCategory(option);
        setCategory(option.id);
        fetchList();
    };

    const handleReset = () => {
        setSort(sortOptions[0].value);
        setSelectedSort(sortOptions[0]);
        setSelectedCategory(categoryOptions[0]);
        setCategory("");
        setSearch("");
        fetchList(1);
    };

    const fetchList = async (page = currentPage, keyword = search) => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            openModal({
                svg: '❗',
                msg1: '해당 페이지 접근 불가',
                msg2: '로그인 후 이용해주세요.',
                showCancel: false,
                onConfirm: () => router.push('./login'),
            });
        }
        try {
            const res = await axios.post("http://localhost:8080/user/list", {
                dept_name: category,
                search: keyword,
                sort,
                page,
                size: pageSize,
            });
            const fetchedList = res.data.list || [];
            setList(fetchedList);
            setTotalCount(res.data.total || 0);
            setCurrentPage(page);

        } catch (err) {
            console.error("직원 리스트 불러오기 실패:", err);
        }
    };

    const fetchDeptList = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await axios.get("http://localhost:8080/dept/list", {
                headers: { Authorization: token }
            });
            const fetched = res.data.list || [];
            const options = [
                { id: "", name: "전체 부서" },
                ...fetched.map((d) => ({
                    id: d.dept_name,
                    name: d.dept_name
                }))
            ];
            setCategoryOptions(options);
            setSelectedCategory(options[0]);
        } catch (err) {
            console.error("부서 목록 불러오기 실패:", err);
        }
    };

    return (
        <div className="productPage wrap page-background">
            <Header />
            <div className="template-list-back">
                <h1 className="text-align-left margin-bottom-10 font-bold margin-left-20" style={{ fontSize: "24px" }}>
                    직원 관리
                </h1>

                {/* 필터 영역 */}
                <div className="margin-bottom-10 flex gap_10 align-center justify-content-center">
                    <div className="select-container">
                        <Listbox value={selectedSort} onChange={handleSortChange}>
                            <ListboxButton className="select-btn">{selectedSort.name}</ListboxButton>
                            <ListboxOptions className="select-option">
                                {sortOptions.map((option) => (
                                    <ListboxOption key={option.id} value={option} className="select-option-item">
                                        {option.name}
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </Listbox>
                    </div>

                    <div className="select-container">
                        <Listbox value={selectedCategory} onChange={handleCategoryChange}>
                            <ListboxButton className="select-btn">{selectedCategory.name}</ListboxButton>
                            <ListboxOptions className="select-option">
                                {categoryOptions.map((option) => (
                                    <ListboxOption key={option.id} value={option} className="select-option-item">
                                        {option.name}
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </Listbox>
                    </div>

                    <input
                        style={{ width: "800px" }}
                        type="text"
                        placeholder="이름 또는 아이디 검색"
                        ref={searchRef}
                        onKeyDown={handleKeyPress}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="product-input-search"
                    />
                    <button className="product-search-btn" onClick={handleSearch}><TbSearch className="product-search-icon"/></button>
                    <button type="button" className="temp-reset-btn" onClick={handleReset}>초기화</button>
                </div>

                {/* 리스트 영역 */}
                <table className="template-table margin-bottom-20">
                    <thead>
                    <tr>
                        <th style={{ width: "23%" }}>부서</th>
                        <th style={{ width: "20%" }}>직급</th>
                        <th style={{ width: "20%" }}>이름</th>
                        <th style={{ width: "17%" }}>ID</th>
                        <th style={{ width: "22%" }}>입사일</th>
                        <th style={{ width: "15%" }}>상세보기</th>
                    </tr>
                    </thead>
                    <tbody>
                    {list.length > 0 ? (
                        list.map((item) => (
                            <tr key={item.user_idx}>
                                <td>{item.dept_name}</td>
                                <td>{item.job_name}</td>
                                <td>{item.user_name}</td>
                                <td>{item.user_id}</td>
                                <td>{item.hire_date}</td>
                                <td>
                                    <button className="template-btn-small"
                                            onClick={() => {
                                                setSelectedUserIdx(item.user_idx);
                                                setShowUserDetailModal(true);
                                            }}
                                    >
                                        직원 정보
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} style={{ textAlign: "center" }}>
                                데이터가 없습니다.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>

                <div className="product-pagination flex justify-content-center gap_5 margin-bottom-10">
                    <Pagination
                        activePage={currentPage}
                        itemsCountPerPage={pageSize}
                        totalItemsCount={totalCount}
                        pageRangeDisplayed={5}
                        onChange={(page) => fetchList(page)}
                    />
                </div>
                {showUserDetailModal && (
                    <EmployeeDetailModal
                        user_idx={selectedUserIdx}
                        onClose={() => setShowUserDetailModal(false)}
                    />
                )}
            </div>
        </div>
    );
}