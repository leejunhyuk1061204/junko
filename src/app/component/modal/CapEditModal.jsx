'use client';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import {
    updateCap,
    getCapDetail,
    getCustomList,
    getLinkedItems,
} from '../collectionAndPayment/CapService';
import '../../globals.css';

const CapEditModal = ({ capIdx, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        type: '수금',
        amount: '',
        date: '',
        custom_idx: '',
        entry_idx: '',
        memo: ''
    });

    const [customList, setCustomList] = useState([]);
    const [linkedList, setLinkedList] = useState([]);
    const token = sessionStorage.getItem('token');

    useEffect(() => {
        fetchDetail();
        fetchDropdowns();
    }, []);

    const fetchDetail = async () => {
        const res = await getCapDetail(capIdx);
        const data = res.data.data;
        setForm({
            type: data.type,
            amount: data.amount,
            date: data.date,
            custom_idx: data.custom_idx,
            entry_idx: data.entry_idx,
            memo: data.memo
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
            console.log(form);
            const res = await updateCap(capIdx, form, token);
            if (res.data.success) {
                alert('수정 완료!');
                onSuccess();
                onClose();
            } else {
                alert(res.data.message || '수정 실패');
            }
        } catch (err) {
            console.error('수정 실패:', err);
            alert('수정 중 오류 발생');
        }
    };

    return (
        <div className="entryRegist-modal">
            <div className="entryRegist-modal-box">
                <button className="entryRegist-modal-close" onClick={onClose}>×</button>
                <h3 className="entryRegist-modal-title">입금 / 지급 수정</h3>
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
                        </tbody>
                    </table>

                    <button type="submit" className="entryList-fabBtn blue">수정</button>
                    <button type="button" className="entryList-fabBtn gray" onClick={onClose}>닫기</button>
                </form>
            </div>
        </div>
    );
};

export default CapEditModal;
