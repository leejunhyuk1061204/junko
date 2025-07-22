'use client'

import Header from "@/app/header";
import React, {useEffect, useState} from "react";
import {TbSearch} from "react-icons/tb";
import {useRouter} from "next/navigation";
import axios from "axios";
import {useAlertModalStore} from "@/app/zustand/store";

export default function DocumentInsertPage() {
    const {openModal, closeModal} = useAlertModalStore();
    const router = useRouter();

    const [approvalStep, setApprovalStep] = useState("4단계");
    const [title, setTitle] = useState("");
    const [approvers, setApprovers] = useState([]);
    const [category, setCategory] = useState("");
    const [docNumber, setDocNumber] = useState("20250626158");
    const [attachment, setAttachment] = useState(null);
    const [content, setContent] = useState("");

    const handleFileChange = (e) => {
        setAttachment(e.target.files[0]);
    }

    const handleSearch = () => {
        // 결재라인 추후 구현
    }

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
                    기안서 작성
                </h1>
                <div className="draft-form margin-bottom-20">
                    <div className="form-row">
                        <label>일자</label>
                        <input type="date" defaultValue="2025-06-26" />

                        <label>결재 단계</label>
                        <select value={approvalStep} onChange={(e) => setApprovalStep(e.target.value)}>
                            <option>1단계</option>
                            <option>2단계</option>
                            <option>3단계</option>
                            <option>4단계</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <label>제목</label>
                        <input type="text" placeholder="제목을 입력하세요." value={title} onChange={(e) => setTitle(e.target.value)} />

                        <label>결재라인</label>
                        <input type="text" placeholder="이름 입력" onKeyDown={handleKeyPress} />
                        <button className="search-btn"><TbSearch /></button>
                    </div>

                    <div className="form-row">
                        <label>구분</label>
                        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="구분" />

                        <label>결재문서</label>
                        <span>[결재서] {docNumber}</span>

                        <label>첨부</label>
                        <input type="file" onChange={handleFileChange} />
                    </div>
                </div>

                <textarea
                    placeholder="기안내용을 입력하세요."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{ width: "100%", height: "300px", resize: "vertical" }}
                />

                <div className="form-footer margin-top-20 flex justify-content-between">
                    <div>
                        <button className="blue-btn">저장/전송</button>
                        <button>미리보기</button>
                        <button>양식불러오기</button>
                    </div>
                    <div>
                        <button>닫기</button>
                        <button>MY조희/서명</button>
                        <button className="red-btn">삭제</button>
                    </div>
                </div>

            </div>
        </div>
    )
}