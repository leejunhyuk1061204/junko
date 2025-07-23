'use client';

import { useEffect, useState } from 'react';
import {useParams, useRouter, useSearchParams} from 'next/navigation';
import axios from 'axios';
import Header from '@/app/header';

export default function ReceiptPaymentDetailPage() {
    const { rp_idx } = useParams();
    const router = useRouter();

    const [data, setData] = useState(null);
    const [variables, setVariables] = useState(null);
    const [previewHtml, setPreviewHtml] = useState('');
    const [loading, setLoading] = useState(true);

    const searchParams = useSearchParams();
    const type = searchParams.get('type') || '수금';

    useEffect(() => {
        if (!rp_idx) return;

        const tryFetch = async () => {
            try {
                let res = await axios.get(`http://localhost:8080/receipt/detail/${rp_idx}`);
                if (!res.data.success) {
                    res = await axios.get(`http://localhost:8080/payment/detail/${rp_idx}`);
                }

                if (res.data.success) {
                    setData(res.data.data);
                    setVariables(res.data.variables);
                } else {
                    alert('데이터를 불러올 수 없습니다.');
                    router.push('/receiptPayment');
                }
            } catch (err) {
                alert('에러 발생');
                router.push('/receiptPayment');
            } finally {
                setLoading(false);
            }
        };

        tryFetch();
    }, [rp_idx]);

    const handleDelete = async () => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            const url = `http://localhost:8080/${data.type === '수금' ? 'receipt' : 'payment'}/del/${rp_idx}`;
            const res = await axios.put(url);
            if (res.data.success) {
                alert('삭제 완료');
                router.push('/receiptPayment');
            } else {
                alert('삭제 실패');
            }
        } catch (err) {
            console.error(err);
            alert('오류 발생');
        }
    };

    const handlePreview = async () => {
        try {
            const res = await axios.post('http://localhost:8080/document/preview', {
                template_idx: data.type === '수금' ? 15 : 15,
                variables: variables,
            });
            if (res.data.success) {
                setPreviewHtml(res.data.preview);
            } else {
                alert('미리보기 실패');
            }
        } catch (err) {
            console.error(err);
            alert('미리보기 오류');
        }
    };

    const handleDownload = () => {
        if (!data.document_idx) return alert('첨부된 문서가 없습니다');
        window.open(`http://localhost:8080/download/pdf/${data.document_idx}`, '_blank');
    };

    if (loading) return <div className="wrap">로딩 중...</div>;
    if (!data) return null;

    return (
        <div className="wrap page-background">
            <Header />
            <h1 className="margin-left-20 text-align-left margin-bottom-20 font-bold" style={{ fontSize: '24px' }}>
                수금/지급 상세조회
            </h1>

            <div className="template-form-container">
                <div className="template-form-left" style={{ height: '550px'}}>
                    <div className="template-form-group" style={{ marginTop: '40px' }}>
                        <label className="template-label" style={{ fontSize: '18px'}}>구분</label>
                        <div className="template-readonly">{data.type}</div>
                    </div>

                    <div className="template-form-group">
                        <label className="template-label" style={{ fontSize: '18px'}}>거래처</label>
                        <div className="template-readonly">{data.customer_name}</div>
                    </div>

                    <div className="template-form-group">
                        <label className="template-label" style={{ fontSize: '18px'}}>금액</label>
                        <div className="template-readonly">{data.amount?.toLocaleString()} 원</div>
                    </div>

                    <div className="template-form-group">
                        <label className="template-label" style={{ fontSize: '18px'}}>수단</label>
                        <div className="template-readonly">{data.method}</div>
                    </div>

                    <div className="template-form-group">
                        <label className="template-label" style={{ fontSize: '18px'}}>거래일자</label>
                        <div className="template-readonly">{data.transaction_date}</div>
                    </div>

                    <div className="template-form-group">
                        <label className="template-label" style={{ fontSize: '18px'}}>상태</label>
                        <div className="template-readonly">{data.status}</div>
                    </div>

                    <div className="template-form-group">
                        <label className="template-label" style={{ fontSize: '18px'}}>비고</label>
                        <div className="template-readonly">{data.note}</div>
                    </div>

                    <div className="margin-top-20 flex justify-right gap_10" style={{ textAlign: 'right', marginTop: '10px' }}>
                        <button className="template-btn-back" onClick={handlePreview}>문서 미리보기</button>
                        <button className="template-btn-submit" onClick={handleDownload}>PDF 다운로드</button>
                    </div>

                    <div className="margin-top-20 flex justify-left gap_10" style={{ textAlign: 'left', marginTop: '60px' }}>
                        <button className="template-btn-back" onClick={() => router.back()}>목록</button>
                        <button style={{ marginRight: 0}} className="product-btn" onClick={() => router.push(`../form?type=${data.type}&mode=update&rp_idx=${rp_idx}`)}>
                            수정
                        </button>
                        <button className="product-btn-del" onClick={handleDelete}>삭제</button>
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
