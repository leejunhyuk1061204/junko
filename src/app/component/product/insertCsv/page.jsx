'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Header from '@/app/header'

export default function InsertProductCsv() {
    const router = useRouter()
    const [csvFile, setCsvFile] = useState(null)

    const handleCsvUpload = async () => {
        if (!csvFile) {
            alert('CSV 파일을 선택하세요')
            return
        }

        const fd = new FormData()
        fd.append('file', csvFile)

        try {
            const res = await axios.post('http://192.168.0.122:8080/product/csv', fd, {
                headers: {
                    Authorization: sessionStorage.getItem("token"),
                    'Content-Type': 'multipart/form-data',
                },
            })

            if (res.data.success) {
                alert('CSV 상품 등록 완료!')
                router.push('./')
            } else {
                alert('등록 실패: 로그인 또는 형식 확인')
            }
        } catch (err) {
            console.error(err)
            alert('CSV 업로드 실패')
        }
    }

    return (
        <div className='productPage wrap page-background'>
            <Header />
            <h3 className="order-head-text margin-bottom-20 text-align-left margin-left-20">CSV 상품 등록</h3>
            <div className="csv-upload-section padding-30 back-ground-white border-radius">
                <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                    className="margin-bottom-20"
                />
                <button className="btn" onClick={handleCsvUpload}>
                    CSV 업로드
                </button>
            </div>
            <div>
            <button
                type="button"
                className="btn margin-top-20"
                onClick={() => router.push('../product')}
            >
                목록
            </button>
            </div>
        </div>
    )
}