'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import Header from "@/app/header";

export default function VoucherDetailPage() {
    const { entry_idx } = useParams()
    const [voucher, setVoucher] = useState(null)

    useEffect(() => {
        if (!entry_idx) return
        axios.get(`http://localhost:8080/voucher/detail/${entry_idx}`)
            .then(res => {
                if (res.data.success) setVoucher(res.data.data)
                else alert('전표를 불러오지 못했습니다.')
            })
            .catch(err => {
                console.error(err)
                alert('서버 오류 발생')
            })
    }, [entry_idx])

    if (!voucher) return <div>로딩 중...</div>

    return (
        <div className="productPage wrap page-background">
            <Header />
            <div className="product-list-back">
            <h3 className="text-align-left margin-bottom-10">
                <span className="product-header">전표 상세</span>
            </h3>

            <table className="product-list margin-bottom-10">
                <tbody>
                <tr><td>전표 번호</td><td>{voucher.entry_idx}</td></tr>
                <tr><td>전표 유형</td><td>{voucher.entry_type}</td></tr>
                <tr><td>거래처</td><td>{voucher.custom_name}</td></tr>
                <tr><td>고객명</td><td>{voucher.custom_owner}</td></tr>
                <tr><td>금액</td><td>{Number(voucher.amount).toLocaleString()}원</td></tr>
                <tr><td>일자</td><td>{voucher.entry_date}</td></tr>
                <tr><td>작성자</td><td>{voucher.user_name}</td></tr>
                <tr><td>상태</td><td>{voucher.status}</td></tr>
                </tbody>
            </table>

            <h3 className="text-align-left margin-bottom-10">
                <span className="product-header">차변/대변 내역</span>
            </h3>
            <table className="product-list margin-bottom-10">
                <thead>
                <tr>
                    <th>계정코드</th>
                    <th>금액</th>
                    <th>타입</th>
                </tr>
                </thead>
                <tbody>
                {voucher.entry_details?.map((d, idx) => (
                    <tr key={idx}>
                        <td>{d.as_idx}</td>
                        <td>{Number(d.amount).toLocaleString()}원</td>
                        <td>{d.type}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <Link href="./" className="template-btn-back">목록</Link>
        </div>
        </div>
    )
}
