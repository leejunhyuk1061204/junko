'use client'

import Header from "@/app/header";
import React, {useEffect, useState} from "react";
import {TbSearch} from "react-icons/tb";
import {useRouter} from "next/navigation";
import axios from "axios";
import {useAlertModalStore} from "@/app/zustand/store";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import Pagination from "react-js-pagination";

export default function selectTemplate() {
    const router = useRouter();
    const {openModal, closeModal} = useAlertModalStore();

    const [list, setList] = useState([]);

    const sortOptions = [
        { id: "template_name ASC", name: "문서명 오름차순" },
        { id: "template_name DESC", name: "문서명 내림차순" },
    ];
    const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
    const [sort, setSort] = useState(sortOptions[0].id);

    const [categoryOptions, setCategoryOptions] = useState([
        { id: "", name: "전체" },
    ]);
    const [selectedCategory, setSelectedCategory] = useState(categoryOptions[0]);
    const [category, setCategory] = useState("");

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchCategoryList();
        fetchList();
    }, []);

    useEffect(() => {
        fetchList();
    }, [sort, category, search]);

    const fetchCategoryList = async () => {
        try {
            const res = await axios.get("http://192.168.0.122/template/category/list");
            const fetched = res.data.list || [];
            const formatted = [
                { id: "", name: "전체" },
                ...fetched.map((c) => ({ id: c, name: c })),
            ];
            setCategoryOptions(formatted);
            setSelectedCategory(formatted[0]);
            setCategory("");
        } catch (err) {
            console.error("카테고리 목록 불러오기 실패:", err);
        }
    };

    const fetchList = async (page = currentPage) => {
        const user_id = sessionStorage.getItem("user_id");
        if (!user_id) {
            openModal({
                svg: '❗',
                msg1: '해당 페이지 접근 불가',
                msg2: '로그인 후 이용해주세요.',
                showCancel: false,
                onConfirm: () => router.push('/component/login'),
            });
        }

        try {
            const res = await axios.get("http://192.168.0.122/template/list", {
                params: {
                    category,
                    search,
                    sort,
                    page,
                    size: pageSize,
                },
            });
            setList(res.data.list || []);
            setTotalCount(res.data.total || 0);
            setCurrentPage(page);
        } catch (err) {
            console.error("!!!!!!!템플릿 불러오기 실패!!!!!!!!", err);
            openModal({
                svg: '❗',
                msg1: '접근 오류',
                msg2: '리스트를 불러올 수 없습니다.',
                showCancel: false,
            });
        }
    };

    const handleSortChange = (option) => {
        setSelectedSort(option);
        setSort(option.id);
    };

    const handleCategoryChange = (option) => {
        setSelectedCategory(option);
        setCategory(option.id);
    };

    const handleSearch = () => {
        fetchList(1);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleReset = () => {
        setSort(sortOptions[0].id);
        setSelectedSort(sortOptions[0]);
        setSelectedCategory(categoryOptions[0]);
        setCategory("");
        setSearch("");
        fetchList(currentPage);
    };

    const handlePreview = async (template_idx) => {
        const token = sessionStorage.getItem("token");

        try {
            const res = await axios.get(`http://192.168.0.122/template/preview/${template_idx}`, {
                headers: { Authorization: token }
            });

            const html = res.data.preview;

            if (!html) {
                openModal({
                    svg: '❗',
                    msg1: '페이지 오류',
                    msg2: '미리오기를 불러올 수 없습니다.',
                    showCancel: false,
                });
                return;
            }

            const width = 800;
            const height = 600;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;

            const win = window.open(
                "",
                "_blank",
                `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
            );

            win.document.open();
            win.document.write(html);
            win.document.close();
        } catch (err) {
            console.error("미리보기 오류:", err);
            openModal({
                svg: '❗',
                msg1: '접근 오류',
                msg2: '해당 작업을 실패했습니다.',
                showCancel: false,
            });
        }
    };

    return (
        <div className="productPage wrap page-background">
            <Header />
            <div className="template-list-back">
                <h1 className="text-align-left margin-bottom-10 font-bold margin-left-20" style={{ fontSize: "24px" }}>
                    기안서 양식
                </h1>

                <div className="margin-bottom-10 flex gap_10 align-center justify-content-center">
                    <div className="select-container">
                        <Listbox value={selectedSort} onChange={handleSortChange}>
                            <ListboxButton className="select-btn">{selectedSort.name}</ListboxButton>
                            <ListboxOptions className="select-option">
                                {sortOptions.map((option) => (
                                    <ListboxOption
                                        key={option.id}
                                        value={option}
                                        className="select-option-item"
                                    >
                                        {option.name}
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </Listbox>
                    </div>

                    <div className="select-container">
                        <Listbox value={selectedCategory} onChange={handleCategoryChange}>
                            <ListboxButton className="select-btn">
                                {selectedCategory?.name || "카테고리 선택"}
                            </ListboxButton>
                            <ListboxOptions className="select-option">
                                {categoryOptions.map((option) => (
                                    <ListboxOption
                                        key={option.id}
                                        value={option}
                                        className="select-option-item"
                                    >
                                        {option.name}
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </Listbox>
                    </div>

                    <input
                        style={{ width: "250px" }}
                        type="text"
                        placeholder="문서 양식 이름 또는 설명 검색"
                        onKeyDown={handleKeyPress}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="product-input-search"
                    />
                    <button className="product-search-btn" onClick={handleSearch}><TbSearch className="product-search-icon"/></button>
                    <button type="button" className="temp-reset-btn" onClick={handleReset}>초기화</button>
                </div>
                <table className="template-table margin-bottom-20">
                    <thead>
                    <tr>
                        <th style={{ width: "23%" }}>문서 이름</th>
                        <th style={{ width: "35%" }}>설명</th>
                        <th style={{ width: "15%" }}>미리보기/사용</th>
                    </tr>
                    </thead>
                    <tbody>
                    {list.length > 0 ? (
                        list.map((item) => (
                            <tr key={item.template_idx}>
                                <td>{item.template_name}</td>
                                <td>{item.template_desc}</td>
                                <td>
                                    <button className="template-btn-small"  onClick={() => handlePreview(item.template_idx)}>
                                        미리보기
                                    </button>
                                    <button
                                        className="template-btn-small"
                                        onClick={() => router.push(`./${item.template_idx}`)}
                                    >
                                        사용
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={3} style={{ textAlign: "center" }}>
                                템플릿이 없습니다.
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
            </div>
        </div>
    );
}