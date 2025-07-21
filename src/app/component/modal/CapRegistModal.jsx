'use client';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import {
    capRegist,
    getCustomList,
    getLinkedItems,
    uploadCapFile,
    generatePdf
} from '../collectionAndPayment/CapService';
import '../../globals.css';

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
    const token = sessionStorage.getItem('token');

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
            console.log('등록 응답:', res.data);
            if (!res.data?.success || !res.data?.cap_idx) {
                alert('등록 실패: cap_idx 없음');
                return;
            }

            const cap_idx = res.data.cap_idx;

            if (file) await uploadCapFile(cap_idx, file);

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
            onSuccess(); // 등록 후 리스트 갱신
            onClose();
        } catch (err) {
            console.error('등록 실패:', err);
            alert('등록 중 오류 발생');
        }
    };

    return (
        <div className="entryRegist-modal">
            <div className="entryRegist-modal-box">
                <button className="entryRegist-modal-close" onClick={onClose}>×</button>
                <h3 className="entryRegist-modal-title">입금 / 지급 등록</h3>
                <form onSubmit={handleSubmit}>
                    <table className="entryRegist-table">
                        <tbody>
                        <tr>
                            <th>유형</th>
                            <td>
                                <select name="type" value={form.type} onChange={handleChange}>
                                    <option value="수금">수금</option>
                                    <option value="지급">지급</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>거래처</th>
                            <td>
                                <Select
                                    name="custom_idx"
                                    options={customList.map(c => ({
                                        value: c.custom_idx,
                                        label: c.custom_name
                                    }))}
                                    value={customList.find(c => c.custom_idx == form.custom_idx) && {
                                        value: form.custom_idx,
                                        label: customList.find(c => c.custom_idx == form.custom_idx).custom_name
                                    }}
                                    onChange={(selected) =>
                                        setForm(prev => ({ ...prev, custom_idx: selected?.value || '' }))
                                    }
                                    placeholder="거래처 선택"
                                    isClearable
                                />
                            </td>
                        </tr>
                        <tr>
                            <th>금액</th>
                            <td>
                                <input type="number" name="amount" value={form.amount} onChange={handleChange} required />
                            </td>
                        </tr>
                        <tr>
                            <th>일자</th>
                            <td>
                                <input type="date" name="date" value={form.date} onChange={handleChange} required />
                            </td>
                        </tr>
                        <tr>
                            <th>전표 연동</th>
                            <td>
                                <Select
                                    name="entry_idx"
                                    options={linkedList.map(i => ({
                                        value: i.idx,
                                        label: `[${i.type}] ${i.title}`
                                    }))}
                                    value={linkedList.find(i => i.idx == form.entry_idx) && {
                                        value: form.entry_idx,
                                        label: `[${linkedList.find(i => i.idx == form.entry_idx).type}] ${linkedList.find(i => i.idx == form.entry_idx).title}`
                                    }}
                                    onChange={(selected) =>
                                        setForm(prev => ({ ...prev, entry_idx: selected?.value || '' }))
                                    }
                                    placeholder="전표 선택"
                                    isClearable
                                />
                            </td>
                        </tr>
                        <tr>
                            <th>메모</th>
                            <td>
                                <input type="text" name="memo" value={form.memo} onChange={handleChange} />
                            </td>
                        </tr>
                        <tr>
                            <th>증빙파일</th>
                            <td>
                                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                            </td>
                        </tr>
                        </tbody>
                    </table>

                    <button type="submit" className="entryList-fabBtn blue">등록</button>
                    <button type="button" className="entryList-fabBtn gray" onClick={onClose}>닫기</button>
                </form>
            </div>
        </div>
    );
};

export default CapRegistModal;
