'use client'

import Header from "@/app/header";
import React, {useEffect, useState} from "react";
import {TbSearch} from "react-icons/tb";
import {useParams, useRouter} from "next/navigation";
import axios from "axios";
import {useAlertModalStore} from "@/app/zustand/store";

export default function DocumentInsertPage() {
    const {openModal, closeModal} = useAlertModalStore();
    const router = useRouter();
    const params = useParams();
    const template_idx = params.template_idx;

    const [approvalStep, setApprovalStep] = useState("1단계");
    const [approverIds, setApproverIds] = useState([]);
    const [templateHtml, setTemplateHtml] = useState("");
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(""); // yyyy-MM-dd
    const [step, setStep] = useState("1단계");
    const [type, setType] = useState(""); // 고정 or 선택
    const [idx, setIdx] = useState(0);
    const [variables, setVariables] = useState({
        user_name: "",
        resign_date: "",
    });
    const [searchName, setSearchName] = useState("");
    const [searchMsg, setSearchMsg] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [attachment, setAttachment] = useState(null); // 파일 객체
    const [highlightIndex, setHighlightIndex] = useState(-1);

    useEffect(() => {
        const user_idx = sessionStorage.getItem("user_idx");
        const user_name = sessionStorage.getItem("user_name");
        if (!user_idx) {
            openModal({
                svg: '❗',
                msg1: '해당 페이지 접근 불가',
                msg2: '로그인 후 이용해주세요.',
                showCancel: false,
                onConfirm: () => router.push('/component/login'),
            });
        }
    }, []);


    // 템플릿 변수 추출
    const extractVariableKeys = (html) => {
        const regex = /{{(.*?)}}/g;
        const keys = new Set();
        let match;
        while ((match = regex.exec(html)) !== null) {
            keys.add(match[1].trim());
        }
        return Array.from(keys);
    };

    // 마운트 시 template_html 받아오고 변수 추출
    useEffect(() => {
        let isMounted = true;

        const fetchTemplate = async () => {
            try {
                const {data} = await axios.get('http://localhost:8080/template/detail',
                    {params: {template_idx}});
                const html = data.detail.template_html;

                if (!isMounted) return;

                setTemplateHtml(html);

                const keys =extractVariableKeys(html);
                const defaultVars = {};
                keys.forEach(k => defaultVars[k] = "");
                setVariables(defaultVars);
            }catch (err) {
                console.error("템플릿 불러오기 실패!!!!!!!!!!!!!!!!", err);
            }
        };
        fetchTemplate();

        return () => {
            isMounted = false; // 언마운트 시 플래그 꺼줌
        };
    }, [template_idx]); // 안전빵

    const handleFileChange = (e) => {
        setAttachment(e.target.files[0]);
    }

    const handleSearch = async () => {
        if (!searchName.trim()) return;

        try {
            const {data} = await axios.get('http://localhost:8080/user/search',
                {params: {user_name: searchName.trim()}});

            if (data.length > 0) {
                const selectedUser = data[0]; // 첫번째 결재자
                const already = approverIds.some(person => person.user_idx === selectedUser.user_idx);
                const maxStep = parseInt(approvalStep[0], 10); // "2단계" → 2

                if (already) {
                    setSearchMsg("이미 추가된 결재자입니다.");
                } else if (approverIds.length >= maxStep) {
                    setSearchMsg(`${maxStep}명까지만 결재자를 추가할 수 있습니다.`);
                } else {
                    setApproverIds([...approverIds, selectedUser]);
                    setSearchResults([]);
                    setSearchMsg("");
                    setHighlightIndex(0);
                }
                setSearchName(""); // 검색어 초기화
            } else {
                setSearchMsg("검색 결과가 없습니다.");
            }
        } catch (err) {
            console.error("검색 오류!!!!", err);
            openModal({
                svg: '❗',
                msg1: '검색 실패',
                msg2: '서버 오류가 발생했습니다.',
                showCancel: false,
            });
        }
    };

    // 실시간 검색
    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (searchName.trim() === "") {
                setSearchResults([]);
                return;
            }

            try {
                const {data} = await axios.get('http://localhost:8080/user/search',
                    {params: {user_name: searchName.trim()}});

                if (data.length === 0) {
                    setSearchMsg("검색 결과가 없습니다.");
                    setSearchResults([]);
                } else {
                    setSearchResults(data);
                    setSearchMsg(""); // 결과 있을 때는 메시지 지우기
                }

            } catch (err) {
                console.error("자동완성 실패", err);
            }
        }, 300); // 0.3초

        return () => clearTimeout(delayDebounce);
    }, [searchName]);

    const handleRemoveApprover = (user_idx) => {
        setApproverIds(approverIds.filter(p => p.user_idx !== user_idx));
    }

    const handleKeyPress = (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex((prev) =>
                Math.min(prev + 1, searchResults.length - 1)
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter") {
            if (highlightIndex >= 0 && highlightIndex < searchResults.length) {
                const selected = searchResults[highlightIndex];
                const already = approverIds.find(p => p.user_idx === selected.user_idx);
                const maxStep = parseInt(approvalStep); // 문자열이면 parseInt 꼭 필요
                handleSearch();

                if (already) {
                    setSearchMsg("이미 추가된 결재자입니다.");
                } else if (approverIds.length >= maxStep) {
                    setSearchMsg(`${maxStep}명까지만 선택 가능합니다.`);
                } else {
                    setApproverIds([...approverIds, selected]);
                    setSearchName("");
                    setSearchResults([]);
                    setHighlightIndex(-1);
                    setSearchMsg("");
                }
            }
        }
    };

    // 기안서 작성
    const handleInsert = async () => {
        const user_idx = parseInt(sessionStorage.getItem("user_idx"), 10);
        if (!user_idx) {
            openModal({
                svg: '❗',
                msg1: '해당 페이지 접근 불가',
                msg2: '로그인 후 이용해주세요.',
                showCancel: false,
                onConfirm: () => router.push('./login'),
            });
        }

        const formData = {
            template_idx: parseInt(template_idx, 10),
            user_idx,
            type,
            idx,
            variables,
            approver_ids: approverIds.map(p => p.user_idx), // 상태값으로 저장된 배열
        };

        try {
            const {data} = await axios.post('http://localhost:8080/document/insert', formData);

            if (data.success) {
                openModal({
                    svg: '✔',
                    msg1: '작성 완료',
                    msg2: '기안서가 성공적으로 작성되었습니다.',
                    showCancel: false,
                    onConfirm: () => router.push('/component/document'),
                })
            } else {
                openModal({
                    svg: '❗',
                    msg1: '작성 실패',
                    msg2: '기안서 작성에 실패했습니다.',
                    showCancel: false,
                })
            }
        } catch (err) {
            console.error("기안서 실패등록실패오류오류서버오류실패실패", err);
        }
    }

    return (
        <div className="productPage wrap page-background">
            <Header />
            <div className="template-list-back">
                <h1 className="text-align-left margin-bottom-10 font-bold margin-left-20" style={{ fontSize: "24px" }}>
                    기안서 작성
                </h1>
                <div className="approval-box-wrapper">
                    <div className="approval-box-inner">
                        <div className="approval-left">
                            <div className="form-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>일자</label>
                                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)}/>
                                </div>

                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>결재 단계</label>
                                    <select value={step} onChange={(e) => setStep(e.target.value)}>
                                        <option value="1단계">1단계</option>
                                        <option value="2단계">2단계</option>
                                        <option value="3단계">3단계</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group approver-group">
                                <label className="form-label">결재선 지정</label>

                                <div className="approver-field-wrapper">
                                    <div className="approver-search-row">
                                        <input
                                            type="text"
                                            placeholder="이름 검색"
                                            value={searchName}
                                            onChange={
                                                (e) => setSearchName(e.target.value)
                                            }
                                            onKeyDown={handleKeyPress}
                                            onFocus={() => setSearchMsg("")}
                                        />
                                        <button className="approver-search-btn" onClick={handleSearch}>
                                            <TbSearch className="product-search-icon"/></button>
                                    </div>

                                    {searchResults.length > 0 && (
                                        <ul className="search-dropdown">
                                            {searchResults.map((person, index) => (
                                                <li
                                                    key={person.user_idx}
                                                    className={highlightIndex === index ? "highlight" : ""}
                                                    onClick={() => {
                                                        const already = approverIds.find(p => p.user_idx === person.user_idx);
                                                        const maxStep = parseInt(approvalStep);

                                                        if (!already && approverIds.length < maxStep) {
                                                            setApproverIds([...approverIds, person]);
                                                            setSearchName("");
                                                            setSearchResults([]);
                                                            setHighlightIndex(-1);
                                                        } else if (already) {
                                                            setSearchMsg("이미 추가된 결재자입니다.");
                                                        } else {
                                                            setSearchMsg(`${maxStep}명까지만 선택 가능합니다.`)
                                                        }
                                                }}>
                                                    {person.user_name} ({person.job_name})
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {/*안내 메시지*/}
                                    {searchMsg && (
                                        <div style={{color: "#666", marginTop: "2px", fontSize: "13px"}}>
                                            {searchMsg}
                                        </div>
                                    )}

                                    <div className="readonly-approver">
                                        {approverIds.map(person => (
                                            <div className="approver-tag" key={person.user_idx}>
                                                {person.user_name}
                                                <button onClick={() => handleRemoveApprover(person.user_idx)}>✕</button>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </div>
                        </div>

                        <div className="vertical-divider"></div>

                        <div className="approval-right">
                            <div className="approval-right">
                                <div className="form-group">
                                    <label>구분</label>
                                    <div className="type-field">
                                        <input type="text" value="발주서" readOnly />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>결재문서</label>
                                    <a className="doc-link" href="#">[견적서] 20250626158</a>
                                </div>
                                <div className="form-group">
                                    <label>첨부</label>
                                    <button className="attach-btn">＋</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="approval-box-wrapper">
                    <div className="approval-box-inner">
                        <div className="input-area">
                            {Object.entries(variables).map(([key, value]) => (
                                <div key={key} className="variable-row">
                                    <label>{key}</label>
                                    <input
                                        type="text"
                                        placeholder={`${key} 입력`}
                                        value={value}
                                        onChange={(e) => setVariables({...variables, [key]: e.target.value})}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-right gap_10">
                    <button className="template-btn-back" onClick={()=>{router.push('/component/document')}}>
                        취소
                    </button>
                    <button className="template-btn-submit" onClick={handleInsert}>
                        등록
                    </button>
                </div>
            </div>
        </div>
    );
};