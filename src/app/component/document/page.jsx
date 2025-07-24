'use client'

import {router} from "next/client";
import React, {useEffect, useState} from "react";
import Header from "@/app/header";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import {TbPlus, TbSearch} from "react-icons/tb";
import Pagination from "react-js-pagination";
import {useRouter} from "next/navigation";
import axios from "axios";
import {FaPlus, FaRegCalendarCheck} from "react-icons/fa6";
import {useAlertModalStore, useDatePickerStore} from "@/app/zustand/store";
import format from "date-fns/format";
import DocumentDetailModal from "@/app/component/document/detail/page";

export default function DocumentManagePage() {
    const router = useRouter();
    const {openModal, closeModal} = useAlertModalStore();
    const {openDatePicker,closeDatePicker} = useDatePickerStore();
    const [selectedTab, setSelectedTab] = useState("상신함");

    const sortOptions = [
        { id: "create_date DESC", name: "최신순" },
        { id: "create_date ASC", name: "오래된순" },
        { id: "template_name ASC", name: "문서명 오름차순" },
        { id: "template_name DESC", name: "문서명 내림차순" },
    ];
    const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
    const [sort, setSort] = useState(sortOptions[0].id);

    const statusLabel = (status) => {
        switch(status) {
            case "미확인": return "status-label status-unread";
            case "결재중": return "status-label status-approving";
            case "승인": return "status-label status-approved";
            case "반려": return "status-label status-rejected";
            default: return "status-label";
        }
    };

    const [statusFilter, setStatusFilter] = useState('전체');
    const [documents, setDocuments] = useState([]);
    const [userIdx, setUserIdx] = useState(null);
    const [loading, setLoading] = useState(true);
    const statusOptions = ['전체', '미확인', '결재중', '승인', '반려'];
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalCnt, setTotalCnt] = useState(0);
    const [search, setSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState({start_date: null, end_date: null});
    const [detailHtml, setDetailHtml] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [comment, setComment] = useState("");

    const user_idx = typeof window !== "undefined" ? parseInt(sessionStorage.getItem("user_idx"), 10) : "";

    useEffect(() => {
        if (!user_idx) {
            openModal({
                svg: '❗',
                msg1: '해당 페이지 접근 불가',
                msg2: '로그인 후 이용해주세요.',
                showCancel: false,
                onConfirm: () => router.push('./login'),
            });
            return;
        }
        setUserIdx(parseInt(sessionStorage.getItem("user_idx"), 10));
    }, []);

    useEffect(() => {
        if (user_idx !== null) fetchDocuments(1);
    }, [statusFilter, userIdx, search, selectedTab]);

    const fetchDocuments = async (page = currentPage, customDate = selectedDate) => {
        setLoading(true);
        try {
            const {data} = await axios.get('http://localhost:8080/document/list', {
                params: {
                    user_idx: user_idx,
                    status: statusFilter === '전체' ? '' : statusFilter,
                    keyword: search,
                    start_date: customDate.start_date || '',
                    end_date: customDate.end_date || '',
                    order: 'created_date',
                    sort: 'desc',
                    page,
                    limit: limit,
                    tab: selectedTab,
                }
            });
            setDocuments(data.list || []);
            setTotalCnt(data.totalCnt || 0);
            setCurrentPage(data.currentPage || 1);
            setLoading(false);
        }catch(err) {
            console.error("문서 리스트 실패: ", err);
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchDocuments(page);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSearch = () => {
        fetchDocuments(1);
    };

    // 결재 상태 옵션
    const handleStatusChange = (status) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    // 정렬순 옵션
    const handleSortChange = (option) => {
        setSelectedSort(option);
        setSort(option.id);
    };

    // 필터 초기화
    const handleReset = () => {
        setSort(sortOptions[0].id);
        setSelectedSort(sortOptions[0]);
        setStatusFilter('전체');
        setSelectedDate({ start_date: null, end_date: null });
        setCurrentPage(1);
        setSearch("");
        fetchDocuments(1);
    }

    const handleDatePicker = () => {
        openDatePicker({
            mode:'range',
            modeSelect:true,
            initialDates:[null,null],
            onConfirm:((_,value) => {
                if (Array.isArray(value)) {
                    const [start, end] = value;

                    const newDates = {
                        start_date: start ? format(start, 'yyyy-MM-dd') : '',
                        end_date: end ? format(end, 'yyyy-MM-dd') : '',
                    };
                    setSelectedDate(newDates);
                    setCurrentPage(1);
                    fetchDocuments(1, newDates);
                }
                closeDatePicker();
            })
        });
    };

    // 상세보기
    const handleView = async (doc) => {
        try {
            const {data} = await axios.post('http://localhost:8080/document/preview', {
                template_idx: doc.template_idx,
                variables: doc.variables || {}
            });

            if (!data.preview) {
                openModal({
                    svg: '❗',
                    msg1: '문서 호출 실패',
                    msg2: '문서 내용을 불러올 수 없습니다.',
                    showCancel: false,
                });
                return;
            }
            setDetailHtml(data.preview);
            setSelectedDoc(doc);
            setShowDetailModal(true);

        } catch (err) {
            console.error("상세보기 오류", err);
        }
    };

    // 승인
    const handleApprove = async (docIdx) => {

        try {
            await axios.post('http://localhost:8080/document/approve', {
                document_idx: docIdx,
                user_idx: user_idx,
                status: '승인완료'
            });
            openModal({
                svg: '✔',
                msg1: '처리 완료',
                msg2: '승인되었습니다.',
                showCancel: false,
            });
            setShowDetailModal(false);
            fetchDocuments(); // 리스트 새로고침
        } catch (err) {
            console.error("승인 실패..", err);
        }
    };

    // 반려
    const handleReject = async (docIdx, comment) => {
        if (!comment || !comment.trim()) {
            openModal({
                svg: '❗',
                msg1: '처리 실패',
                msg2: '반려 사유를 입력하세요.',
                showCancel: false,
            });
            return;
        }
        try {
            await axios.post('http://localhost:8080/document/reject', {
                document_idx: docIdx,
                user_idx: user_idx,
                comment: comment,
                status: '반려'
            });
            openModal({
                svg: '✔',
                msg1: '처리 완료',
                msg2: '반려 처리되었습니다.',
                showCancel: false,
            });
            setShowDetailModal(false);
            fetchDocuments();
        } catch (err) {
            console.error("반려 돌아가..", err);
        }
    };

    return (
        <div className="productPage wrap page-background">
            <Header />
            <div className="template-list-back justify-content-between items-center">
                <div className="flex">
                    <h1 className="text-align-left margin-bottom-10 font-bold margin-left-20 doc-manage" style={{ fontSize: "24px" }}>
                        문서 관리
                    </h1>
                    <div className="tab-buttons" style={{display: "flex", gap: "4px", marginBottom: "4px"}}>
                        <button
                            className={selectedTab === "상신함" ? "tab-btn-active" : "tab-btn"}
                            onClick={() => setSelectedTab("상신함")}
                        >상신함</button>
                        <button
                            className={selectedTab === "수신함" ? "tab-btn-active" : "tab-btn"}
                            onClick={() => setSelectedTab("수신함")}
                        >수신함</button>
                    </div>
                </div>

                {/* 필터 영역 */}
                <div className="margin-bottom-10 flex gap_10 align-center justify-content-center">
                    <div className="doc-select-container">
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

                    <div className="doc-select-container">
                        <Listbox value={statusFilter} onChange={handleStatusChange}>
                            <ListboxButton className="select-btn">
                                {statusFilter || "결재 상태"}
                            </ListboxButton>
                            <ListboxOptions className="select-option">
                                {statusOptions.map((status) => (
                                    <ListboxOption
                                        key={status}
                                        value={status}
                                        className="select-option-item"
                                    >
                                        {status}
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </Listbox>
                    </div>

                    <div className="doc-select-container">
                        <button className="product-search-btn" onClick={handleDatePicker}>
                            <FaRegCalendarCheck className="date-icon"/></button>
                    </div>

                    <input
                        style={{ width: "800px" }}
                        type="text"
                        placeholder="내용 검색"
                        onKeyDown={handleKeyPress}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="product-input-search"
                    />
                    <button className="product-search-btn" onClick={handleSearch}><TbSearch className="product-search-icon"/></button>
                    <button type="button" className="temp-reset-btn" onClick={handleReset}>초기화</button>
                    <button className="doc-insert-btn" onClick={() => router.push("/component/document/insert/tempList")}><FaPlus className="doc-insert-icon"/>새 문서 작성</button>
                </div>

                <div>
                    <table className="doc-table margin-bottom-20">
                        <thead>
                            <tr>
                                <th style={{ width: "6%" }}>문서 번호</th>
                                <th style={{ width: "13%" }}>구분</th>
                                <th style={{ width: "8%" }}>상태</th>
                                <th style={{ width: "8%" }}>작성일</th>
                                <th style={{ width: "17%" }}>결재자</th>
                                <th style={{ width: "8%" }}>상세</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-align-center">검색 결과가 없습니다.</td>
                                </tr>
                            ) : (
                                documents.map((doc) => (
                                    <tr key={doc.document_idx}>
                                        <td>{doc.document_idx}</td>
                                        <td>{doc.template_name || '-'}</td>
                                        <td>
                                            <span className={statusLabel(doc.status)}>{doc.status}</span>
                                        </td>
                                        <td>{doc.created_date}</td>
                                        <td>{doc.approver_name || '-'}</td>
                                        <td>
                                            <button className="template-btn-small" onClick={() => handleView(doc)}>
                                                문서 보기
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {/*{documents.length < 10 &&
                                Array.from({ length: 10 - documents.length }).map((_, i) => (
                                    <tr key={`empty-${i}`}>
                                        <td colSpan={6} style={{ height: '43px' }}>&nbsp;</td>
                                    </tr>
                                ))
                            }*/}
                        </tbody>
                    </table>
                    <div className="product-pagination flex justify-content-center gap_5 margin-bottom-10">
                        <Pagination
                            activePage={currentPage}
                            itemsCountPerPage={limit}
                            totalItemsCount={totalCnt}
                            pageRangeDisplayed={5}
                            onChange={handlePageChange}
                        />
                    </div>
                </div>
                {showDetailModal && (
                    <DocumentDetailModal
                        html={detailHtml}
                        doc={selectedDoc}
                        user_idx={userIdx}
                        value={comment}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onClose={() => setShowDetailModal(false)}
                    />
                )}
            </div>
        </div>
    );
}