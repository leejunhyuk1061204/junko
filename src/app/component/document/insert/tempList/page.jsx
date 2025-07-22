'use client'

import Header from "@/app/header";
import React, {useEffect, useState} from "react";
import {TbSearch} from "react-icons/tb";
import {useRouter} from "next/navigation";
import axios from "axios";
import {useAlertModalStore} from "@/app/zustand/store";

export default function selectTemplate() {
    const router = useRouter();
    const {openModal, closeModal} = useAlertModalStore();

    const [list, setList] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchList();
    }, []);

    const fetchList = async (page = currentPage) => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            openModal({
                svg: '❗',
                msg1: '해당 페이지 접근 불가',
                msg2: '로그인 후 이용해주세요.',
                showCancel: false,
            });
        }

        try {
            const res = await axios.get("http://localhost:8080/template/list", {
                headers: { Authorization: token },
                params: {
                    search,
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
                msg2: '미리오기를 불러올 수 없습니다.',
                showCancel: false,
            });
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

    return (
        <div className="productPage wrap page-background">
            <Header />
            <div className="template-list-back">
                <h1 className="text-align-left margin-bottom-10 font-bold margin-left-20" style={{ fontSize: "24px" }}>
                    기안서 양식 리스트
                </h1>
                <div className="margin-bottom-10 flex gap_10 align-center justify-content-center">
                    <input
                        style={{ width: "800px" }}
                        type="text"
                        placeholder="문서 양식 이름 또는 설명 검색"
                        onKeyDown={handleKeyPress}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="product-input-search"
                    />
                    <button className="product-search-btn" onClick={handleSearch}>
                        <TbSearch className="product-search-icon"/>
                    </button>
                </div>


            </div>
        </div>
    )
}