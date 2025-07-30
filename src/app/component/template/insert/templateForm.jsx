'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import {useRouter} from "next/navigation";

export default function TemplateForm({ onSubmit, initialData = {} }) {
    const router = useRouter();

    const [templateData, setTemplateData] = useState({
        template_name: '',
        template_desc: '',
        category: '',
        html: '',
        user_idx: null,
        ...initialData,
    });

    const [categories, setCategories] = useState([])

    useEffect(() => {
        fetchCategories()
    }, []);

    useEffect(() => {
        if (initialData && initialData.template_html) {
            setTemplateData((prev) => ({
                ...prev,
                ...initialData,
                html: initialData.template_html,
            }));
        }
    }, [initialData]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://192.168.0.122/template/category/list')
            setCategories(res.data.list || [])
        } catch (err) {
            console.error('카테고리 로딩 실패:', err)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setTemplateData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => {
            console.log('[업로드된 HTML]', reader.result); // 디버깅용
            setTemplateData((prev) => ({
                ...prev,
                html: reader.result,
            }));
        };
        reader.readAsText(file, 'UTF-8')
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!templateData.html || templateData.html.trim() === '') {
            alert('HTML 파일을 업로드해주세요.');
            return;
        }

        const payload = {
            ...templateData,
            template_html: templateData.html,
        };

        delete payload.html;

        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="template-form-container">
            {/* 왼쪽 입력 폼 */}
            <div className="template-form-left">
                <div className="template-form-group">
                    <label className="template-label">문서 이름</label>
                    <input
                        className="template-input"
                        name="template_name"
                        value={templateData.template_name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="template-form-group">
                    <label className="template-label">설명</label>
                    <input
                        className="template-input"
                        name="template_desc"
                        value={templateData.template_desc}
                        onChange={handleChange}
                    />
                </div>

                <div className="template-form-group">
                    <label className="template-label">카테고리</label>
                    <input
                        list="category-options"
                        name="category"
                        value={templateData.category}
                        onChange={handleChange}
                        className="template-input"
                        required
                    />
                    <datalist id="category-options">
                        {categories.map((cat, i) => (
                            <option key={i} value={cat} />
                        ))}
                    </datalist>
                </div>

                <div className="template-form-group">
                    <label className="template-label">HTML 업로드</label>
                    <input
                        className="template-input"
                        type="file"
                        accept=".html"
                        onChange={handleFileUpload}
                    />
                </div>

                <div className="template-form-group gap_10">
                    <button type="submit" className="template-btn-submit">
                        등록
                    </button>
                    <button type="button" className="template-btn-back" onClick={()=>{router.push(`/component/template`)}}>
                        취소
                    </button>
                </div>
            </div>

            {/* 오른쪽 미리보기 */}
            <div className="template-form-right">
                <h3 className="template-preview-title">미리보기</h3>
                <iframe
                    srcDoc={templateData.html}
                    className="template-preview-frame"
                    title="Template Preview"
                />
            </div>
        </form>
    )
}