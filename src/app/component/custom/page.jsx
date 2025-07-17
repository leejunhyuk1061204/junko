'use client'

import { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/app/header";
import CustomModal from "@/app/component/modal/CustomModal";
import Pagination from "react-js-pagination";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { TbSearch } from "react-icons/tb";

// 정렬 옵션
const sortOptions = [
    { id: 1, name: "최신순", value: "desc" },
    { id: 2, name: "오래된순", value: "asc" },
];

export default function CustomPage() {
    const [list, setList] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const size = 10;
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [search, setSearch] = useState("");
    const [sortKey] = useState("custom_idx"); // 정렬 기준은 custom_idx 고정
    const [sortOrder, setSortOrder] = useState("desc");
    const [selectedSort, setSelectedSort] = useState(sortOptions[0]);

    const fetchList = async () => {
        const token = sessionStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/custom/list", {
            headers: { Authorization: token },
            params: {
                start: (page - 1) * size,
                size,
                search: search.trim(),
                sortKey,
                sortOrder
            }
        });

        const data = res.data;
        setList(Array.isArray(data.list) ? data.list : []);
        setTotal(data.total || 0);
    };

    useEffect(() => {
        fetchList();
    }, [page, sortOrder]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchList();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const handleSortChange = (option) => {
        setSelectedSort(option);
        setSortOrder(option.value);
        setPage(1);
    };

    const handleDelete = async (custom_idx) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        const token = sessionStorage.getItem("token");
        try {
            const res = await axios.put("http://localhost:8080/custom/del", null, {
                headers: { Authorization: token },
                params: { custom_idx }
            });

            if (res.data?.success) {
                alert("삭제되었습니다.");
                fetchList();
            } else {
                alert("삭제에 실패했습니다.");
            }
        } catch (err) {
            console.error(err);
            alert("오류가 발생했습니다.");
        }
    };

    return (
        <div className="productPage wrap page-background" style={{ overflowX: 'hidden' }}>
            <Header />
            <div className="product-list-back">
                <h2 className="text-align-left margin-bottom-10 font-bold" style={{ fontSize: "24px" }}>거래처 관리</h2>

                <div className="custom-toolbar-box">
                    <div className="custom-select-wrapper">
                        <Listbox value={selectedSort} onChange={handleSortChange}>
                            <ListboxButton className="custom-select-btn">{selectedSort.name}</ListboxButton>
                            <ListboxOptions className="custom-select-options">
                                {sortOptions.map(option => (
                                    <ListboxOption key={option.id} value={option} className="custom-select-option-item">
                                        {option.name}
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </Listbox>
                    </div>

                    <input
                        className="custom-search-input"
                        type="text"
                        placeholder="거래처명, 대표자, 연락처 검색"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <button className="custom-search-btn" onClick={() => {
                        setPage(1);
                        fetchList();
                    }}>
                        <TbSearch className="custom-search-icon" />
                    </button>

                    <button className="custom-register-btn" onClick={() => {
                        setEditItem(null);
                        setShowModal(true);
                    }}>등록</button>
                </div>

                <table className="custom-table" style={{ marginTop: "20px" }}>
                    <thead>
                    <tr>
                        <th>거래처명</th>
                        <th>대표자</th>
                        <th>연락처</th>
                        <th>이메일</th>
                        <th>관리</th>
                    </tr>
                    </thead>
                    <tbody>
                    {list.map(item => (
                        <tr key={item.custom_idx}>
                            <td>{item.custom_name}</td>
                            <td>{item.custom_owner}</td>
                            <td>{item.custom_phone}</td>
                            <td>{item.email}</td>
                            <td>
                                <button className="product-btn" onClick={() => {
                                    setEditItem(item);
                                    setShowModal(true);
                                }}>수정</button>

                                <button className="product-btn-del" onClick={() => handleDelete(item.custom_idx)}>삭제</button>
                            </td>
                        </tr>
                    ))}
                    {list.length < size &&
                        Array.from({ length: size - list.length }).map((_, i) => (
                            <tr key={`empty-${i}`}>
                                <td colSpan={5} style={{ height: '45px' }}>&nbsp;</td>
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
                        onChange={(page) => setPage(page)}
                        itemClass="page-item"
                        linkClass="page-link"
                    />
                </div>
            </div>

            {showModal && (
                <CustomModal
                    editItem={editItem}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        setEditItem(null);
                        fetchList();
                    }}
                />
            )}
        </div>
    );
}
