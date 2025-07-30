'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../globals.css';
import Select from 'react-select';

export default function SettlementRegistModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({
        custom_idx: '',
        entry_idx: '',
        settlement_day: '',
        total_amount: '',
        amount: ''
    });


    const [file, setFile] = useState(null);
    const [customList, setCustomList] = useState([]);
    const [entryList, setEntryList] = useState([]);




    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // 거래처 리스트
                const customRes = await axios.get("http://localhost:8080/custom/list");
                setCustomList(customRes.data.list || []);

                // 전표 리스트
                const res = await axios.get("http://localhost:8080/entryListForSettlement");
                setEntryList(res.data.data || []);
            } catch (err) {
                console.error("초기 데이터 조회 실패:", err);
            }
        };

        fetchInitialData();
    }, []);


    const handleSubmit = async () => {
        if (!form.entry_idx || form.entry_idx === '') {
            alert("전표를 선택해주세요!");
            return;
        }

        try {
            const token = (typeof window !== "undefined" ? sessionStorage.getItem("token") : "");
            const res = await axios.post('http://localhost:8080/psRegister', form, {
                headers: { Authorization: token }
            });
            const { settlement_idx } = res.data.data;

            if (file) {
                const formData = new FormData();
                formData.append('files', file);
                formData.append('type', 'settlement');

                await axios.post(
                    `http://localhost:8080/settlementFileUpload/${settlement_idx}/attachments`,
                    formData,
                    {
                        headers: {
                            Authorization: token,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            }

            alert('정산이 등록되었습니다!');
            onSuccess();
            onClose();
        } catch (err) {
            console.error('등록 실패:', err);
            alert('정산 등록 실패!');
        }
    };
    console.log('entryList:', entryList);
    console.log('form.entry_idx:', form.entry_idx);
    console.log("정산 등록 form:", form);
    return (
        <div className="entryRegist-modal">
            <div className="entryRegist-modal-box">
                <button className="entryRegist-modal-close" onClick={onClose}>&times;</button>
                <h2 className="entryRegist-modal-title">정산 등록</h2>

                <table className="entryRegist-table">
                    <tbody>
                    <tr>
                        <th>거래처 ID</th>
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
                        <th>전표 연동</th>
                        <td>
                            <Select
                                name="entry_idx"
                                options={entryList.map(i => ({
                                    value: i.entry_idx,
                                    label: `[${i.entry_type}] 전표 #${i.entry_idx}`
                                }))}
                                value={entryList.find(i => i.entry_idx == form.entry_idx) && {
                                    value: form.entry_idx,
                                    label: `[${entryList.find(i => i.entry_idx == form.entry_idx).entry_type}] 전표 #${form.entry_idx}`
                                }}
                                onChange={(selected) => {
                                    console.log("선택한 전표:", selected);
                                    setForm(prev => ({ ...prev, entry_idx: selected?.value || '' }));
                                }}
                                placeholder="전표 선택"
                                isClearable
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>정산일</th>
                        <td>
                            <input type="date" name="settlement_day" value={form.settlement_day} onChange={handleChange} />
                        </td>
                    </tr>
                    <tr>
                        <th>정산 금액</th>
                        <td>
                            <input
                                type="number"
                                name="total_amount"
                                value={form.total_amount}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setForm({ ...form, total_amount: val, amount: val });
                                }}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>잔액</th>
                        <td>
                            <input type="number" name="amount" value={form.amount} onChange={handleChange} />
                        </td>
                    </tr>
                    <tr>
                        <th>첨부파일</th>
                        <td>
                            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                        </td>
                    </tr>
                    </tbody>
                </table>

                <div className="flex justify-end gap-2">
                    <button className="entryList-fabBtn blue" onClick={handleSubmit}>등록</button>
                    <button className="entryList-fabBtn gray" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
}
