'use client';
import React, { useState, useEffect } from 'react';
import {
    capRegist,
    getCustomList,
    getLinkedItems,
    uploadCapFile,
    generatePdf
} from '../collectionAndPayment/CapService';
import '../../globals.css'

const CapRegistModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({
        type: '수금',
        amount: '',
        date: '',
        custom_idx: '',
        entry_idx: '',
        memo: ''
    });
    const [file, setFile] = useState(null);
    const [customList, setCustomList] = useState([]);
    const [linkedList, setLinkedList] = useState([]);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchDropdowns();
    }, []);

    const fetchDropdowns = async () => {
        const cRes = await getCustomList();
        const lRes = await getLinkedItems();
        setCustomList(cRes.data.data);
        setLinkedList(lRes.data.data);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await capRegist(form, token);
            const cap_idx = res.data.cap_idx;

            if (file) {
                await uploadCapFile(cap_idx, file);
            }

            //  등록 후 PDF 자동 생성 + 다운로드
            try {
                const pdfRes = await generatePdf(cap_idx, 15);
                const link = document.createElement('a');
                link.href = pdfRes.data.file_path;
                link.download = pdfRes.data.filename;
                link.click();
            } catch (e) {
                console.error('PDF 생성 실패:', e);
                alert('PDF 생성 실패');
            }

            alert('등록 완료!');
            onSuccess();
            onClose();
        } catch (err) {
            console.error('등록 실패:', err);
            alert('등록 중 오류 발생');
        }
    };

    return (
        <div className="modal-cap">
            <h3>입금 / 지급 등록</h3>
            <form onSubmit={handleSubmit}>
                <label>
                    유형
                    <select name="type" value={form.type} onChange={handleChange}>
                        <option value="수금">수금</option>
                        <option value="지급">지급</option>
                    </select>
                </label>

                <label>
                    거래처
                    <select name="custom_idx" value={form.custom_idx} onChange={handleChange} required>
                        <option value="">선택</option>
                        {customList.map(c => (
                            <option key={`custom-${c.custom_idx}`} value={c.custom_idx}>
                                {c.custom_name}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    금액
                    <input type="number" name="amount" value={form.amount} onChange={handleChange} required />
                </label>

                <label>
                    일자
                    <input type="date" name="date" value={form.date} onChange={handleChange} required />
                </label>

                <label>
                    전표 연동 (선택)
                    <select name="entry_idx" value={form.entry_idx} onChange={handleChange}>
                        <option value="">없음</option>
                        {linkedList.map(i => (
                            <option key={`${i.type}-${i.idx}`} value={i.idx}>
                                [{i.type}] {i.title}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    메모
                    <input type="text" name="memo" value={form.memo} onChange={handleChange} />
                </label>

                <label>
                    증빙파일
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                </label>

                <button type="submit">등록</button>
                <button type="button" onClick={onClose}>닫기</button>
            </form>
        </div>
    );
};

export default CapRegistModal;