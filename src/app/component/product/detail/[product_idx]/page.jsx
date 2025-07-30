'use client';

import {useEffect, useRef, useState} from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Header from '@/app/header';
import OptionManager from './option';

export default function ProductDetail() {
    const { product_idx } = useParams();
    const [product, setProduct] = useState(null);
    const [mainImg, setMainImg] = useState(null);
    const thumbRef = useRef(null);

    const scrollThumbnails = (dir) => {
        const scrollBox = thumbRef.current;
        if (!scrollBox) return;

        const scrollAmount = 120; // 한 번에 스크롤할 양
        if (dir === 'left') {
            scrollBox.scrollLeft -= scrollAmount;
        } else {
            scrollBox.scrollLeft += scrollAmount;
        }
    };
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://192.168.0.122/product/detail/${product_idx}`, {
                    headers: { Authorization: sessionStorage.getItem('token') },
                });
                const data = res.data?.data || {};
                setProduct(data);
                if (data.imageUrls?.length > 0) {
                    setMainImg(`http://192.168.0.122/images/${data.imageUrls[0]}`);
                }
            } catch (err) {
                console.error('상품 상세 조회 실패:', err);
            }
        };
        fetchProduct();
    }, [product_idx]);

    if (!product) return <div>Loading...</div>;

    return (
        <div className="wrap page-background">
            <Header />
            <div className="product-wrap">
                <h3 className="order-head-text margin-bottom-20">상품 상세 정보</h3>

                {/* 테이블 + 이미지 박스 */}
                <div className="back-ground-white padding-30 border-radius margin-bottom-20">
                    <div className="flex gap_20 align-center">
                        <div style={{ flex: 1 }}>
                            <table className="product-entry-table">
                                <tbody>
                                <tr><th>품목코드</th><td>{product.product_idx}</td></tr>
                                <tr><th>품목명</th><td>{product.product_name}</td></tr>
                                <tr><th>규격</th><td>{product.product_standard}</td></tr>
                                <tr><th>입고단가</th><td>{product.purchase_price.toLocaleString()}원</td></tr>
                                <tr><th>판매단가</th><td>{product.selling_price.toLocaleString()}원</td></tr>
                                <tr><th>할인율</th><td>{product.discount_rate}%</td></tr>
                                <tr><th>카테고리</th><td>{product.category_name || '기타'}</td></tr>
                                <tr><th>최소수량</th><td>{product.min_cnt}개</td></tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 이미지 박스 */}
                        {(product.imageUrls.length > 1) ? (
                            // 썸네일 2개 이상일 때 → 메인 + 썸네일 나란히
                            <div className="product-detail-img-preview-box">
                                {mainImg ? (
                                    <img
                                        src={mainImg}
                                        alt="상품 이미지"
                                        className="product-detail-img-preview"
                                    />
                                ) : (
                                    <div className="product-detail-img-preview-empty">이미지 없음</div>
                                )}
                                <div className="product-thumbnail-vertical">
                                    {product.imageUrls.map((img, i) => (
                                        <img
                                            key={i}
                                            src={`http://192.168.0.122/images/${img}`}
                                            onClick={() => setMainImg(`http://192.168.0.122/images/${img}`)}
                                            className={`product-thumbnail-img ${mainImg?.includes(img) ? 'active' : ''}`}
                                            alt={`썸네일 ${i}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // 썸네일이 1개 이하일 때 → 대표 이미지만 중앙정렬
                            <div
                                className="product-detail-img-preview-box"
                                style={{ justifyContent: 'center' }}
                            >
                                {mainImg ? (
                                    <img
                                        src={mainImg}
                                        alt="상품 이미지"
                                        className="product-detail-img-preview"
                                    />
                                ) : (
                                    <div className="product-detail-img-preview-empty">이미지 없음</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 옵션 관리자 */}
                <div className="back-ground-white padding-30 border-radius margin-bottom-20">
                    <h4 className="margin-bottom-10 option-header">옵션 관리</h4>
                    <OptionManager productIdx={product_idx} />
                </div>

                {/* 버튼 영역 */}
                <div className="flex justify-left gap_10">
                    <button
                        className="btn"
                        onClick={() => window.location.href = '../'}
                    >
                        목록
                    </button>
                    <button
                        className="product-btn"
                        onClick={() => window.location.href = `../update/${product_idx}`}
                    >
                        수정
                    </button>
                </div>
            </div>
        </div>
    );
}
