'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import axios from 'axios'
import ProductForm from '../productForm'
import Header from '@/app/header'

// 단일 상품 등록 전용 페이지
export default function InsertProduct() {
    const router = useRouter()

    const handleSubmit = async (formData) => {
        try {
            // 1. 상품 정보 먼저 등록
            const res = await axios.post('http://192.168.0.122:8080/product/insert', formData, {
                headers: {
                    Authorization: sessionStorage.getItem("token"),
                    'Content-Type': 'multipart/form-data',
                },
            })

            if (res.data?.success) {
                const product_idx = res.data.idx

                // 2. 이미지 따로 전송
                const imgFormData = new FormData()
                const files = formData.getAll('images')
                files.forEach(file => imgFormData.append('images', file))

                await axios.put(`http://192.168.0.122:8080/product/${product_idx}/imgUpdate`, imgFormData, {
                    headers: {
                        Authorization: sessionStorage.getItem("token"),
                        'Content-Type': 'multipart/form-data',
                    },
                })

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