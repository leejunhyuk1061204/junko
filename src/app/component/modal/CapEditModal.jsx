'use client';
import React, { useEffect, useState } from 'react';
import {
    getCapDetail,
    updateCap,
    getCustomList,
    getLinkedItems,
    generatePdf
} from '../collectionAndPayment/CapService';
import '../../globals.css';

const CapEditModal = ({ capIdx, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        type: '',
        amount: '',
        date: '',
        custom_idx: '',
        entry_idx: '',
        memo: ''
    });
    const [customList, setCustomList] = useState([]);
    const [linkedList, setLinkedList] = useState([]);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchDetail();
        fetchDropdowns();
    }, []);

    const fetchDetail = async () => {
        const res = await getCapDetail(capIdx);
        const dto = res.data.data;
        setForm({
            type: dto.type,
            amount: dto.amount,
            date: dto.date,
            custom_idx: dto.custom_idx,
            entry_idx: dto.entry_idx || '',
            memo: dto.memo || ''
        });
    };

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
            const success = await updateCap(capIdx, form, token);
            if (success.data.success) {
                // PDF 재생성
                try {
                    const pdfRes = await generatePdf(capIdx, 1);
                    const link = document.createElement('a');
                    link.href = pdfRes.data.file_path;
                    link.download = pdfRes.data.filename;
                    link.click();
                } catch (e) {
                    console.error('PDF 재생성 실패:', e);
                    alert('PDF 생성 실패');
                }
                alert('수정 완료!');
                onSuccess();
                onClose();
            } else {
                alert(success.data.message || '수정 실패');
            }
        } catch (e) {
            console.error('수정 오류:', e);
            alert('수정 중 오류 발생');
        }
    };

    return (
        <div className="modal-cap">
            <h3>입금 / 지급 수정</h3>
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
                            <option key={`custom-${c.custom_idx}`} value={c.custom_idx}>{c.custom_name}</option>
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
                            <option key={`${i.type}-${i.idx}`} value={i.idx}>[{i.type}] {i.title}</option>
                        ))}
                    </select>
                </label>

                <label>
                    메모
                    <input type="text" name="memo" value={form.memo} onChange={handleChange} />
                </label>

                <button type="submit">수정</button>
                <button type="button" onClick={onClose}>닫기</button>
            </form>
        </div>
    );
};

export default CapEditModal;
