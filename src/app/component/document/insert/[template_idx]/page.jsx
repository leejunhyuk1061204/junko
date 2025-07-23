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

    const [appoverIds, setAppoverIds] = useState([]);
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
    const [approverIds, setApproverIds] = useState([]);
    const [approverNames, setApproverNames] = useState(""); // UI 표시용
    const [searchName, setSearchName] = useState("");
    const [attachment, setAttachment] = useState(null); // 파일 객체


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
        const fetchTemplate = async () => {
            try {
                const {data} = await axios.get('http://localhost:8080/template/detail',
                    {params: {template_idx}});
                const html = data.detail.template_html;
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
    })

    const handleFileChange = (e) => {
        setAttachment(e.target.files[0]);
    }

    const handleSearch = () => {
        // 결재라인 검색
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
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
            approver_ids: appoverIds, // 상태값으로 저장된 배열
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

                            <div className="form-group">
                                <label>결재선 지정</label>
                                <div className="approver-box">
                                    <input type="text" value="" readOnly />
                                    <input
                                        type="text"
                                        placeholder="이름 검색"
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                    />
                                    <button className="product-search-btn" onClick={handleSearch}>
                                        <TbSearch className="product-search-icon"/></button>
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
                                <div key={key} style={{marginBottom: 12}}>
                                    <label>{key}</label>
                                    <input
                                        type="text"
                                        placeholder={`${key} 입력`}
                                        value={value}
                                        onChange={(e) => setVariables({...variables, [key]: e.target.value})}
                                        className="variable-input"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};