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
        axios.get(`http://192.168.0.122:8080/product/detail/${product_idx}`).then(res => {
            setInitialData(res.data.data)
        })
    }, [product_idx])

    const handleSubmit = async (formData) => {
        try {
            // 이미지 업로드 먼저
            const imgRes = await axios.put(
                `http://192.168.0.122:8080/product/${product_idx}/imgUpdate`,
                formData,
                {
                    headers: {
                        Authorization: sessionStorage.getItem("token"),
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const productFormData = new FormData();

            productFormData.append("product_idx", product_idx.toString());
            productFormData.append("product_name", formData.get("product_name") || "");
            productFormData.append("purchase_price", formData.get("purchase_price") || "0");
            productFormData.append("selling_price", formData.get("selling_price") || "0");
            productFormData.append("discount_rate", formData.get("discount_rate") || "0");
            productFormData.append("product_standard", formData.get("product_standard") || "");
            productFormData.append("category_idx", formData.get("category_idx") || "0");
            productFormData.append("min_cnt", formData.get("min_cnt") || "0");

            const productRes = await axios.put(
                `http://192.168.0.122:8080/product/update`,
                productFormData,
                {
                    headers: {
                        Authorization: sessionStorage.getItem("token")
                    },
                }
            );

            if (imgRes.data?.success && productRes.data?.success) {
                alert("수정 완료!");
                router.push(`/component/product/detail/${product_idx}`);
            } else {
                alert("수정 실패");
            }
        } catch (err) {
            console.error(err);
            alert("오류 발생");
        }
    };

    if (!initialData) return <div>로딩 중...</div>

    return (
        <div className='productPage wrap page-background'>
            <Header />
            <ProductForm onSubmit={handleSubmit} initialData={initialData} />
        </div>
    )
}
