'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/app/header';

export default function ReceiptPaymentFormPage() {
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || '수금';
    const mode = searchParams.get('mode') || 'insert';
    const rp_idx = searchParams.get('rp_idx');

    const [form, setForm] = useState({
        entry_idx: '',
        custom_idx: '',
        amount: '',
        method: '',
        transaction_date: '',
        note: '',
        status: '작성중',
        user_idx: 1,
    });

    const [customerOptions, setCustomerOptions] = useState([]);
    const [voucherOptions, setVoucherOptions] = useState([]);
    const [previewHtml, setPreviewHtml] = useState('');

    useEffect(() => {
        axios.get('http://localhost:8080/custom/list')
            .then(res => {
                if (res.data.list) setCustomerOptions(res.data.list);
            });

        const savedUserIdx = sessionStorage.getItem('user_idx');
        if (savedUserIdx) {
            setForm(prev => ({ ...prev, user_idx: Number(savedUserIdx) }));
        }
    }, []);

    useEffect(() => {
        if (!form.custom_idx) {
            setVoucherOptions([]);
            return;
        }

        axios.get(`http://localhost:8080/custom/select?custom_idx=${form.custom_idx}`)
            .then(res => {
                if (res.data.success) {
                    const name = res.data.data.custom_name;
                    return axios.get(`http://localhost:8080/voucher/list?page=1&size=100&custom_name=${name}`);
                }
            })
            .then(res => {
                if (res?.data?.list) setVoucherOptions(res.data.list);
            })
            .catch(err => console.error('전표 목록 불러오기 실패:', err));
    }, [form.custom_idx]);

    useEffect(() => {
        if (mode === 'update' && rp_idx) {
            axios.get(`http://localhost:8080/${type === '수금' ? 'receipt' : 'payment'}/detail/${rp_idx}`)
                .then(res => {
                    if (res.data.success) setForm(res.data.data);
                });
        }
    }, [mode, rp_idx, type]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'entry_idx') {
                const selectedVoucher = voucherOptions.find(v => String(v.entry_idx) === value);
                if (selectedVoucher) {
                    updated.amount = selectedVoucher.total_amount;
                }
            }
            return updated;
        });
    };

    const formToVariables = (form) => {
        const custom = customerOptions.find(c => c.custom_idx == form.custom_idx) || {};
        return {
            cap_idx: form.rp_idx || '',
            type: type,
            date: form.transaction_date || '',
            amount: Number(form.amount || 0).toLocaleString(),
            customName: custom.custom_name || '',
            accountBank: custom.bank || '',
            accountNumber: custom.account_number || '',
            entry_idx: form.entry_idx || '',
            memo: form.note || '',
        };
    };

    const handlePreview = async () => {
        try {
            const res = await axios.post('http://localhost:8080/document/preview', {
                template_idx: type === '수금' ? 15 : 15,
                variables: formToVariables(form),
            });
            if (res.data.success) {
                setPreviewHtml(res.data.preview);
            } else {
                alert('미리보기 실패');
            }
        } catch (err) {
            console.error(err);
            alert('오류 발생');
        }
    };

    const handleSubmit = async () => {
        try {
            const res = mode === 'insert'
                ? await axios.post(`http://localhost:8080/${type === '수금' ? 'receipt' : 'payment'}/insert`, form)
                : await axios.put(`http://localhost:8080/${type === '수금' ? 'receipt' : 'payment'}/update`, form);

            if (res.data.success) {
                const { variables, data } = res.data;
                const idx = data?.rp_idx || form.rp_idx;

                const docRes = await axios.post('http://localhost:8080/document/insert', {
                    template_idx: type === '수금' ? 15 : 15,
                    type: 'receipt_payment',
                    idx,
                    variables,
                    user_idx: Number(sessionStorage.getItem('user_idx')),
                });

                if (docRes.data.success && docRes.data.document_idx) {
                    await axios.post('http://localhost:8080/document/pdf', {
                        document_idx: docRes.data.document_idx,
                    });
                }

                alert(`${type} ${mode === 'insert' ? '등록' : '수정'} 완료`);
                window.location.href = './';
            } else {
                alert('처리 실패');
            }
        } catch (err) {
            console.error(err);
            alert('오류 발생');
        }
    };

    return (
        <div className="wrap page-background">
            <Header />
            <h1 className="margin-left-20 text-align-left margin-bottom-20 font-bold" style={{ fontSize: '24px' }}>
                {type} {mode === 'insert' ? '등록' : '수정'}
            </h1>

            <div className="template-form-container">
                <div className="template-form-left" style={{ height: '600px'}}>
                    <div className="template-form-group" style={{ marginTop: '40px' }}>
                        <label className="template-label" style={{ fontSize: '18px'}}>거래처</label>
                        <select name="custom_idx" value={form.custom_idx || ''} onChange={handleChange} className="template-input">
                            <option value="">-- 선택 --</option>
                            {customerOptions.map(c => (
                                <option key={c.custom_idx} value={c.custom_idx}>{c.custom_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="template-form-group">
                        <label className="template-label" style={{ fontSize: '18px'}}>전표</label>
                        <select name="entry_idx" value={form.entry_idx || ''} onChange={handleChange} className="template-input">
                            <option value="">-- 선택 --</option>
                            {voucherOptions.map(v => (
                                <option key={v.entry_idx} value={v.entry_idx}>
                                    [{v.entry_type}] {v.entry_date} - {v.customer_name} ({(v.amount ?? 0).toLocaleString()}원)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="template-form-group">
                        <label className="template-label" style={{ fontSize: '18px'}}>금액</label>
                        <input name="amount" value={form.amount || ''} onChange={handleChange} className="template-input" />
                    </div>

                    <div className="template-form-group">
                        <label className="template-label" style={{ fontSize: '18px'}}>수단</label>
                        <select name="method" value={form.method || ''} onChange={handleChange} className="template-input">
                            <option value="">-- 선택 --</option>
                            <option value="이체">이체</option>
                            <option value="현금">현금</option>
                            <option value="기타">기타</option>
                        </select>
                    </div>

                    <div className="template-form-group">
                        <label className="template-label" style={{ fontSize: '18px'}}>일자</label>
                        <input type="date" name="transaction_date" value={form.transaction_date || ''} onChange={handleChange} className="template-input" />
                    </div>

                    <div className="template-form-group">
                        <label className="template-label" style={{ fontSize: '18px'}}>비고</label>
                        <input name="note" value={form.note || ''} onChange={handleChange} className="template-input" />
                    </div>

                    <div style={{ textAlign: 'right', marginTop: '10px' }}>
                        <button onClick={handlePreview} className="template-btn-back">미리보기</button>
                        <button onClick={handleSubmit} className="template-btn-submit" style={{ marginLeft: '10px' }}>
                            {mode === 'insert' ? '등록하기' : '수정하기'}
                        </button>
                    </div>

                    <div style={{ textAlign: 'left', marginTop: '100px' }}>
                        <button onClick={() => window.location.href = './'} className="template-btn-back">
                            목록
                        </button>
                    </div>
                </div>

                <div className="template-form-right">
                    <h3 className="template-preview-title" style={{ fontSize: '18px'}}>문서 미리보기</h3>
                    {previewHtml && (
                        <iframe
                            srcDoc={previewHtml}
                            style={{ width: '100%', height: '500px', border: '1px solid #ccc' }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
