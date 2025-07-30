'use client'
import { useEffect, useState } from 'react'
import {useParams, useRouter} from 'next/navigation'
import axios from 'axios'
import TemplateForm from '../../insert/templateForm'
import Header from "@/app/header";

export default function TemplateUpdatePage() {
    const { template_idx } = useParams()
    const [templateData, setTemplateData] = useState(null)

    const router = useRouter();

    useEffect(() => {
        const token = (typeof window !== "undefined" ? sessionStorage.getItem("token") : "")
        axios.get(`http://192.168.0.122:8080/template/detail`, {
            headers: { Authorization: token },
            params: {template_idx: template_idx}
        }).then(res => {
            setTemplateData(res.data.detail)
        }).catch(err => {
            console.error("템플릿 상세 조회 실패", err);
            alert("템플릿 정보를 불러올 수 없습니다.");
        })
    }, [template_idx])

    const handleUpdateSubmit = async (updatedData) => {
        const token = (typeof window !== "undefined" ? sessionStorage.getItem("token") : "")
        try {
            await axios.put(`http://192.168.0.122:8080/template/update`, {
                ...updatedData,
                template_idx: template_idx, // 이거 추가
            }, {
                headers: { Authorization: token }
            })
            alert("수정 완료")
            router.push('/component/template');
        } catch (err) {
            console.error("수정 실패", err)
            alert("수정 실패")
        }
    }

    if (!templateData) return <div>로딩 중...</div>

    return (
        <div className="wrap page-background">
            <Header />
            <h1 className="margin-left-20 text-align-left margin-bottom-20 font-bold" style={{ fontSize: '24px' }}>
                템플릿 수정
            </h1>
            <TemplateForm
                initialData={templateData}
                onSubmit={handleUpdateSubmit}
            />
        </div>
    )
}
