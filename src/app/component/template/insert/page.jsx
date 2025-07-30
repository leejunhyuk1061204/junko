'use client'

import { useEffect, useState } from 'react'
import Header from '@/app/header'
import TemplateForm from './templateForm'
import axios from 'axios'
import {router} from "next/client";
import {useRouter} from "next/navigation";

export default function TemplateInsertPage() {
    const router = useRouter();
    const [user_idx, setUserIdx] = useState(0);

    useEffect(() => {
        const user_idx = (typeof window !== "undefined" ? sessionStorage.getItem("user_idx") : 0);
        if (user_idx) {
            setTemplateData(prev => ({
                ...prev,
                user_idx: Number(user_idx),
            }));
            setUserIdx(user_idx);
        }
    }, []);

    const [templateData, setTemplateData] = useState({
        template_name: '',
        template_desc: '',
        category: '',
        html: '',
        user_idx: user_idx ? Number(user_idx) : null,
    });

    const handleInsertSubmit = async (data) => {
        const token = (typeof window !== "undefined" ? sessionStorage.getItem("token") : "");
        try {
            const res = await axios.post('http://localhost:8080/template/insert', data, {
                headers: { Authorization: token }
            });
            alert("템플릿 등록 완료");
            router.push('/component/template');
        } catch (err) {
            console.error("템플릿 등록 실패:", err);
            alert("등록에 실패했습니다.");
        }
    };

    return (
        <div className="wrap page-background">
            <Header />
            <h1 className="margin-left-20 text-align-left margin-bottom-20 font-bold" style={{ fontSize: '24px' }}>
                템플릿 등록
            </h1>

            <TemplateForm
                initialData={templateData}
                onSubmit={handleInsertSubmit}
            />
        </div>
    );
}
