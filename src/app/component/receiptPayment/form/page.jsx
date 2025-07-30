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

    const [approvers, setApprovers] = useState([]);
    const [customerOptions, setCustomerOptions] = useState([]);
    const [voucherOptions, setVoucherOptions] = useState([]);
    const [previewHtml, setPreviewHtml] = useState('');
    const [userOptions, setUserOptions] = useState([]);

    const isFormValid = () => {
        return (
            form.custom_idx &&
            form.entry_idx &&
            form.amount &&
            form.method &&
            form.transaction_date
        );
    };

    useEffect(() => {
        axios.get('http://localhost:8080/custom/list')
            .then(res => {
                if (res.data.list) setCustomerOptions(res.data.list);
            });

        axios.post('http://localhost:8080/users/list',{})
            .then(res => {
                if (res.data.list) setUserOptions(res.data.list);
            });

        const savedUserIdx = sessionStorage.getItem('user_idx');
        if (savedUserIdx) {
            setForm(prev => ({ ...prev, user_idx: Number(savedUserIdx) }));
        }
    }, []);

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                let url = 'http://localhost:8080/voucher/list/receivable';
                if (form.custom_idx) {
                    const resCustom = await axios.get(`http://localhost:8080/custom/select?custom_idx=${form.custom_idx}`);
                    if (resCustom.data.success) {
                        const name = resCustom.data.data.custom_name;
                        url += `?custom_name=${encodeURIComponent(name)}`;
                    }
                }
                const resVoucher = await axios.get(url);
                let vouchers = resVoucher.data.list || [];

                // 수정 모드이고 entry_idx가 있으면, voucherOptions에 포함되어 있는지 확인
                if (mode === 'update' && form.entry_idx) {
                    const exists = vouchers.some(v => String(v.entry_idx) === String(form.entry_idx));
                    if (!exists) {
                        // 전표 상세 API 호출해서 전표 정보 가져오기
                        const resSingleVoucher = await axios.get(`http://localhost:8080/voucher/detail/${form.entry_idx}`);
                        if (resSingleVoucher.data.success) {
                            vouchers = [resSingleVoucher.data.data, ...vouchers];
                        }
                    }
                }

                setVoucherOptions(vouchers);
            } catch (err) {
                console.error('전표 목록 불러오기 실패:', err);
                setVoucherOptions([]);
            }
        };

        fetchVouchers();
    }, [form.custom_idx, mode, form.entry_idx]);


    useEffect(() => {
        if (mode === 'update' && rp_idx) {
            axios.get(`http://localhost:8080/receiptPayment/detail/${rp_idx}`)
                .then(res => {
                    if (res.data.success) {
                        const { data, document } = res.data;
                        setForm(prev => ({
                            ...prev,
                            ...data,
                            document_idx: document?.document_idx || null,
                            template_idx: document?.template_idx || 15,
                        }));
                        setApprovers(document?.approval_lines || []);
                    }
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

    const addApprover = (e) => {
        const selectedId = Number(e.target.value);
        if (selectedId && !approvers.some(u => u.user_idx === selectedId)) {
            const selectedUser = userOptions.find(u => u.user_idx === selectedId);
            if (selectedUser) setApprovers([...approvers, selectedUser]);
        }
        e.target.value = '';
    };

    const removeApprover = (id) => {
        setApprovers(prev => prev.filter(u => u.user_idx !== id));
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
        if (!isFormValid()) {
            alert('필수 항목을 모두 입력해주세요.');
            return;
        }
        try {
            const submitData = {
                ...form,
                approver_ids: approvers.map(a => a.user_idx),
            };

            const res = mode === 'insert'
                ? await axios.post(`http://localhost:8080/${type === '수금' ? 'receipt' : 'payment'}/insert`, submitData)
                : await axios.put('http://localhost:8080/receipt/update', submitData);

            if (res.data.success) {
                const { variables, data } = res.data;
                const idx = data?.rp_idx || form.rp_idx;

                const docRes = await axios.post('http://localhost:8080/document/insert', {
                    template_idx: type === '수금' ? 15 : 15,
                    type: 'receipt_payment',
                    idx,
                    variables,
                    user_idx: Number(sessionStorage.getItem('user_idx')),
                    approver_ids: submitData.approver_ids,
                });

                if (docRes.data.success && docRes.data.document_idx) {
                    await axios.post('http://localhost:8080/document/pdf', {
                        document_idx: docRes.data.document_idx,
                    });
                }

                alert(`${type} ${mode === 'insert' ? '등록' : '수정'} 완료`);
                console.log('res.data:', res.data)
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
                <div className="template-form-left" style={{ height: '700px'}}>
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
                                    [{v.entry_type}] {v.entry_date} - {v.custom_name} ({(v.amount ?? 0).toLocaleString()}원)
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
                        <label className="template-label" style={{ fontSize: '18px' }}>상태</label>
                        <select
                            name="status"
                            value={form.status || ''}
                            onChange={handleChange}
                            className="template-input"
                        >
                            <option value="작성중">작성중</option>
                            <option value="확정">확정</option>
                        </select>
                    </div>

                    {form.status === '확정' && (
                        <>
                            <div className="template-form-group" style={{ width: '885px', marginBottom: '7px' }}>
                                <label className="template-label" style={{ minWidth: '40px', fontSize: '18px' }}>결재자</label>
                                <select className="template-input" onChange={addApprover}>
                                    <option value="">결재자 선택</option>
                                    {userOptions
                                        .filter(u => !approvers.some(a => a.user_idx === u.user_idx))
                                        .map(user => (
                                            <option key={user.user_idx} value={user.user_idx}>
                                                {user.user_name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div className="selected-approvers" style={{ justifyContent: 'center', marginLeft: '50px', marginBottom: '10px' }}>
                                {approvers.map(user => (
                                    <span key={user.user_idx} className="approver-tag">
                                        {user.user_name}
                                        <button onClick={() => removeApprover(user.user_idx)}>×</button>
                                    </span>
                                ))}
                            </div>
                        </>
                    )}

                    <div className="template-form-group">
                        <label className="template-label" style={{ fontSize: '18px'}}>비고</label>
                        <input name="note" value={form.note || ''} onChange={handleChange} className="template-input" />
                    </div>

                    <div style={{ textAlign: 'right', marginTop: '10px' }}>
                        <button onClick={handlePreview} className="template-btn-back">미리보기</button>
                        <button
                            onClick={handleSubmit}
                            className="template-btn-submit"
                            style={{ marginLeft: '10px', opacity: isFormValid() ? 1 : 0.5, cursor: isFormValid() ? 'pointer' : 'not-allowed' }}
                            disabled={!isFormValid()}
                        >
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
