'use client'

import ProductForm from '../productForm'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Header from "@/app/header";

export default function InsertProduct() {
    const router = useRouter()

    const handleSubmit = async (formData) => {
        try {
            const res = await axios.post('http://localhost:8080/product/insert', formData, {
                headers: {
                    Authorization: sessionStorage.getItem("token"),
                    'Content-Type': 'multipart/form-data',
                },
            })

            if (res.data?.success) {
                alert('상품 등록 완료!')
                router.push('./')
            } else {
                alert('등록 실패: 로그인 여부나 필드 확인 필요')
            }
        } catch (err) {
            console.error(err)
            alert('오류 발생')
        }
    }

    return (
        <div className='productPage wrap page-background'>
            <Header />
            <ProductForm onSubmit={handleSubmit} />
        </div>
    )
}
