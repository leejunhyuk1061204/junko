'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Header from '@/app/header'
import { useRouter } from 'next/navigation'
import CustomModal from "@/app/component/modal/CustomModal";

export default function CustomDetailPage({ params }) {
    const { custom_idx } = params
    const [data, setData] = useState(null)
    const router = useRouter()
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        axios.get(`http://192.168.0.122/custom/select`, {
            params: { custom_idx }
        }).then(res => {
            if (res.data.success) {
                setData(res.data.data)
            } else {
                alert(res.data.message || '거래처 정보를 불러올 수 없습니다.')
            }
        })
    }, [custom_idx])

    if (!data) return <div>Loading...</div>

    return (
        <div className="productPage wrap page-background">
            <Header />
            <div className="product-list-back">
                <div className="flex justify-between align-center margin-bottom-10">
                    <h2 className="text-align-left font-bold" style={{ fontSize: "24px" }}>거래처 상세</h2>
                </div>

                <table className="custom-table" style={{ marginTop: "20px" }}>
                    <tbody>
                    <tr>
                        <th>거래처명</th>
                        <td>{data.custom_name}</td>
                        <th>대표자명</th>
                        <td>{data.custom_owner}</td>
                    </tr>
                    <tr>
                        <th>전화번호</th>
                        <td>{data.custom_phone}</td>
                        <th>팩스</th>
                        <td>{data.custom_fax}</td>
                    </tr>
                    <tr>
                        <th>유형</th>
                        <td>{data.custom_type}</td>
                        <th>사업자번호</th>
                        <td>{data.business_number}</td>
                    </tr>
                    <tr>
                        <th>계좌번호</th>
                        <td>{data.account_number}</td>
                        <th>은행</th>
                        <td>{data.bank}</td>
                    </tr>
                    <tr>
                        <th>이메일</th>
                        <td colSpan={3}>{data.email}</td>
                    </tr>
                    </tbody>
                </table>

                <div className="flex justify-right">
                    <button className="product-btn margin-top-10 margin-right-10" style={{ width: '40px'}} onClick={() => setShowModal(true)}>수정</button>
                    <button className="template-btn-back margin-top-10" onClick={() => router.back()}>목록</button>
                </div>

                {showModal && (
                    <CustomModal
                        editItem={data}
                        onClose={() => setShowModal(false)}
                        onSuccess={() => {
                            setShowModal(false)
                            axios.get(`http://192.168.0.122/custom/select`, {
                                params: { custom_idx }
                            }).then(res => {
                                if (res.data.success) {
                                    setData(res.data.data)
                                }
                            })
                        }}
                    />
                )}

            </div>
        </div>
    )
}
