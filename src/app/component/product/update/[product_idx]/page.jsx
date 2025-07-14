'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import ProductForm from '../../productForm'
import Header from '@/app/header'

export default function UpdateProduct() {
    const { product_idx } = useParams()
    const router = useRouter()
    const [initialData, setInitialData] = useState(null)

    useEffect(() => {
        axios.get(`http://localhost:8080/product/detail/${product_idx}`).then(res => {
            setInitialData(res.data.data)
        })
    }, [product_idx])

    const handleSubmit = async (formData) => {
        try {
            const res = await axios.put(`http://localhost:8080/product/${product_idx}/imgUpdate`, formData, {
                headers: {
                    Authorization: sessionStorage.getItem("token"),
                    'Content-Type': 'multipart/form-data',
                },
            })

            if (res.data?.success) {
                alert('수정 완료!')
                router.push(`/component/product/detail/${product_idx}`)
            } else {
                alert('수정 실패')
            }
        } catch (err) {
            console.error(err)
            alert('오류 발생')
        }
    }

    if (!initialData) return <div>로딩 중...</div>

    return (
        <div className='productPage wrap page-background'>
            <Header />
            <ProductForm onSubmit={handleSubmit} initialData={initialData} />
        </div>
    )
}
