'use client'

import React, {useEffect, useState} from "react";
import axios from "axios";
import Header from "@/app/header";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions,} from "@headlessui/react";
import {TbSearch} from "react-icons/tb";
import Pagination from "react-js-pagination";
import {router} from "next/client";
import {useRouter} from "next/navigation";

export default function TemplatePage() {
    const [list, setList] = useState([]);
    const [search, setSearch] = useState("");

    const sortOptions = [
        { id: "create_date DESC", name: "최신순" },
        { id: "create_date ASC", name: "오래된순" },
        { id: "template_name ASC", name: "문서명 오름차순" },
        { id: "template_name DESC", name: "문서명 내림차순" },
    ];
    const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
    const [sort, setSort] = useState(sortOptions[0].id);

    const [categoryOptions, setCategoryOptions] = useState([
        { id: "", name: "전체 카테고리" },
    ]);
    const [selectedCategory, setSelectedCategory] = useState(categoryOptions[0]);
    const [category, setCategory] = useState("");

    const [isAllChecked, setIsAllChecked] = useState(false);
    const [checkedItems, setCheckedItems] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const router = useRouter();

    useEffect(() => {
        fetchCategoryList();
        fetchList();
    }, []);

    useEffect(() => {
        const isReady = category !== undefined && sort !== undefined;
        if (isReady) {
            fetchList(currentPage);
        }
    }, [sort, category, search, currentPage]);

    const fetchCategoryList = async () => {
        try {
            const res = await axios.get("http://192.168.0.122/template/category/list");
            const fetched = res.data.list || [];
            const formatted = [
                { id: "", name: "전체 카테고리" },
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
        const token = sessionStorage.getItem("token");
        try {
            const res = await axios.get("http://192.168.0.122/template/list", {
                headers: { Authorization: token },
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
            console.error("결재 양식 불러오기 실패:", err);
            alert("결재 양식 목록을 불러오지 못했습니다.");
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

    const handleAllCheck = (e) => {
        const checked = e.target.checked;
        setIsAllChecked(checked);
        setCheckedItems(checked ? list.map((item) => item.template_idx) : []);
    };

    const handleCheckItem = (e, template_idx) => {
        const checked = e.target.checked;
        setCheckedItems((prev) =>
            checked ? [...prev, template_idx] : prev.filter((id) => id !== template_idx)
        );
    };

    const handleDelSelected = async () => {
        if (checkedItems.length === 0) {
            alert("삭제할 템플릿을 선택해주세요.");
            return;
        }
        if (!window.confirm("선택한 템플릿을 삭제하시겠습니까?")) return;
        try {
            const token = sessionStorage.getItem("token");
            const deleteResults = await Promise.all(
                checkedItems.map((template_idx) =>
                    axios.put("http://192.168.0.122/template/del", null, {
                        params: { template_idx },
                        headers: { Authorization: token },
                    })
                )
            );
            const successCount = deleteResults.filter((res) => res.data?.success).length;
            alert(`${successCount}개 템플릿 삭제 완료`);

            setCheckedItems([]);
            setIsAllChecked(false);

            fetchList();
        } catch (err) {
            console.error("템플릿 삭제 실패:", err);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    const handleSearch = () => {
        fetchList(1);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handlePreview = async (template_idx) => {
        const token = sessionStorage.getItem("token");

        try {
            const res = await axios.get(`http://192.168.0.122/template/preview/${template_idx}`, {
                headers: { Authorization: token }
            });

            const html = res.data.preview;

            if (!html) {
                alert("미리보기를 불러올 수 없습니다.");
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
            alert("미리보기에 실패했습니다.");
        }
    };

    const handleAddTemplate = () => {
        router.push("./template/insert");
    };

    const handleReset = () => {
        setSort(sortOptions[0].id);
        setSelectedSort(sortOptions[0]);
        setSelectedCategory(categoryOptions[0]);
        setCategory("");
        setSearch("");
        setCurrentPage(1);
        fetchList(currentPage);
    };

    return (
        <div className="productPage wrap page-background">
            <Header />
            <div className="template-list-back">
            <h1 className="text-align-left margin-bottom-10 font-bold margin-left-20" style={{ fontSize: "24px" }}>
                결재 양식 리스트
            </h1>

            {/* 필터 영역 */}
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
                    style={{ width: "800px" }}
                    type="text"
                    placeholder="문서 이름 또는 설명 검색"
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
                        <th style={{ overflow: "visible", width: "35px", }}>
                            <input
                                type="checkbox"
                                checked={isAllChecked}
                                onChange={handleAllCheck}
                            />
                        </th>
                        <th style={{ width: "15%" }}>카테고리</th>
                        <th style={{ width: "25%" }}>문서 이름</th>
                        <th style={{ width: "35%" }}>설명</th>
                        <th style={{ width: "10%" }}>작성자</th>
                        <th style={{ width: "15%" }}>작성일</th>
                        <th style={{ width: "15%" }}>수정/미리보기</th>
                    </tr>
                    </thead>
                    <tbody>
                    {list.length > 0 ? (
                        list.map((item) => (
                            <tr key={item.template_idx}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={checkedItems.includes(item.template_idx)}
                                        onChange={(e) => handleCheckItem(e, item.template_idx)}
                                    />
                                </td>
                                <td>{item.category}</td>
                                <td>{item.template_name}</td>
                                <td>{item.template_desc}</td>
                                <td>{item.user_name}</td>
                                <td>{item.created_date}</td>
                                <td>
                                    <button
                                        className="template-btn-small"
                                        onClick={() => router.push(`./template/update/${item.template_idx}`)}
                                    >
                                        수정
                                    </button>
                                    <button className="template-btn-small"  onClick={() => handlePreview(item.template_idx)}>
                                        미리보기
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} style={{ textAlign: "center" }}>
                                템플릿이 없습니다.
                            </td>
                        </tr>
                    )}

                    {list.length < pageSize &&
                        Array.from({ length: pageSize - list.length }).map((_, i) => (
                            <tr key={`empty-${i}`}>
                                <td colSpan={7} style={{ height: '43px' }}>&nbsp;</td>
                            </tr>
                        ))
                    }
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

                <div className="flex justify-right gap_10">
                    <button className="template-btn-del" onClick={handleDelSelected}>
                        삭제
                    </button>
                    <button className="template-btn" onClick={handleAddTemplate}>
                        추가
                    </button>
                </div>
            </div>
        </div>
    );
}
