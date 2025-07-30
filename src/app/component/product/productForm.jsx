'use client'

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation';

export default function ProductForm({ onSubmit, initialData = {} }) {
    const isEdit = !!initialData?.product_idx;

    const [form, setForm] = useState({
        product_name: '',
        product_standard: '',
        purchase_price: '',
        selling_price: '',
        discount_rate: '',
        category_idx: 0,
    })

    const [categories, setCategories] = useState([])
    const [images, setImages] = useState([])

    const dragItem = useRef(null)
    const dragOverItem = useRef(null)

    const router = useRouter();

    useEffect(() => {
        axios.get('http://192.168.0.122:8080/cate/list').then(res => {
            const list = res.data?.list || []
            setCategories([{ category_idx: 0, category_name: '카테고리 선택' }, ...list])
        })
    }, [])

    useEffect(() => {
        console.log('initialData in ProductForm:', initialData)
    }, [initialData])

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setForm({
                product_name: initialData.product_name || '',
                product_standard: initialData.product_standard || '',
                purchase_price: initialData.purchase_price ? formatNumber(initialData.purchase_price.toString()) : '',
                selling_price: initialData.selling_price ? formatNumber(initialData.selling_price.toString()) : '',
                discount_rate: initialData.discount_rate || '',
                category_idx: initialData.category_idx || 0,
            })

            if (initialData.imageUrls) {
                const existingImages = initialData.imageUrls.map(fileName => ({
                    file: null,
                    url: `http://192.168.0.122:8080/images/${fileName}`,
                    isExisting: true,
                }))
                setImages(existingImages)
            }
        }
    }, [initialData?.product_idx])


    const handleChange = (e) => {
        const { name, value } = e.target

        if (['purchase_price', 'selling_price'].includes(name)) {
            const formatted = formatNumber(value)
            setForm(prev => ({ ...prev, [name]: formatted }))
        } else {
            setForm(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files)
        const newImages = files.map(file => ({
            file,
            url: URL.createObjectURL(file),
            isExisting: false,
        }))
        setImages(prev => [...prev, ...newImages])
    }

    const handleImageDelete = (index) => {
        setImages(prev => {
            const next = [...prev]
            const removed = next[index]
            if (!removed.isExisting) {
                URL.revokeObjectURL(removed.url)
            }
            next.splice(index, 1)
            return next
        })
    }

    const handleDragStart = (index) => {
        dragItem.current = index
    }

    const handleDragEnter = (index) => {
        dragOverItem.current = index
    }

    const handleDrop = () => {
        const copy = [...images]
        const dragged = copy[dragItem.current]
        copy.splice(dragItem.current, 1)
        copy.splice(dragOverItem.current, 0, dragged)
        dragItem.current = null
        dragOverItem.current = null
        setImages(copy)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const fd = new FormData()

        const unformattedForm = {
            ...form,
            purchase_price: unformatNumber(form.purchase_price),
            selling_price: unformatNumber(form.selling_price),
        }

        Object.entries(unformattedForm).forEach(([key, val]) => fd.append(key, val))

        // 신규 이미지만 업로드
        images.forEach(img => {
            if (!img.isExisting) {
                fd.append("images", img.file)
            }
        })

        // 기존 이미지 중 남겨진 파일명 리스트만 서버에 전달
        const remaining = images
            .filter(img => img.isExisting)
            .map(img => {
                const segments = img.url.split('/')
                return segments[segments.length - 1]
            })
        remaining.forEach(name => fd.append("remainImageUrls", name))

        onSubmit(fd)
    }

    const formatNumber = (value) => {
        const number = value.replace(/[^0-9]/g, '')
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    const unformatNumber = (value) => {
        return value.replace(/,/g, '')
    }

    return (
        <form onSubmit={handleSubmit} className="product-wrap back-ground-white padding-30 border-radius">
            <h3 className="order-head-text margin-bottom-20 text-align-left">
                상품 {isEdit ? '수정' : '등록'}
            </h3>

            <table className="product-entry-table margin-bottom-20">
                <tbody>
                <tr>
                    <th>상품명</th>
                    <td>
                        <input
                            type="text"
                            name="product_name"
                            value={form.product_name}
                            onChange={handleChange}
                            className="product-form-input"
                            placeholder="상품명을 입력하세요"
                        />
                    </td>
                    <th>규격</th>
                    <td>
                        <input
                            type="text"
                            name="product_standard"
                            value={form.product_standard}
                            onChange={handleChange}
                            className="product-form-input"
                            placeholder="예: 500ml, 20개입"
                        />
                    </td>
                </tr>
                <tr>
                    <th>입고 단가</th>
                    <td>
                        <input
                            type="text"
                            name="purchase_price"
                            value={form.purchase_price}
                            onChange={handleChange}
                            className="product-form-input text-align-right"
                            placeholder="숫자만 입력"
                        />
                    </td>
                    <th>판매 단가</th>
                    <td>
                        <input
                            type="text"
                            name="selling_price"
                            value={form.selling_price}
                            onChange={handleChange}
                            className="product-form-input text-align-right"
                            placeholder="숫자만 입력"
                        />
                    </td>
                </tr>
                <tr>
                    <th>할인율(%)</th>
                    <td>
                        <input
                            type="number"
                            name="discount_rate"
                            value={form.discount_rate}
                            onChange={handleChange}
                            className="product-form-input text-align-right"
                            placeholder="예: 10"
                        />
                    </td>
                    <th>카테고리</th>
                    <td>
                        <select
                            name="category_idx"
                            value={form.category_idx}
                            onChange={handleChange}
                            className="product-form-input"
                        >
                            {categories.map(c => (
                                <option key={c.category_idx} value={c.category_idx}>{c.category_name}</option>
                            ))}
                        </select>
                    </td>
                </tr>
                <tr>
                    <th>이미지 첨부</th>
                    <td colSpan={3} className="text-align-left">
                        <input
                            type="file"
                            multiple
                            onChange={handleImageChange}
                            accept="image/*"
                            className="product-form-input-file"
                        />
                        {images.length > 0 && (
                            <div className="flex gap_10 margin-top-10">
                                {images.map((img, i) => (
                                    <div
                                        key={img.url}
                                        className="product-image-preview-box"
                                        draggable
                                        onDragStart={() => handleDragStart(i)}
                                        onDragEnter={() => handleDragEnter(i)}
                                        onDragEnd={handleDrop}
                                    >
                                        <img src={img.url} className="product-image-preview" alt={`미리보기 ${i}`} />
                                        <button type="button" className="product-image-delete-btn" onClick={() => handleImageDelete(i)}>×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </td>
                </tr>
                </tbody>
            </table>

            <div className="flex justify-between gap_10">
                <button
                    type="button"
                    className="btn"
                    onClick={() => router.push('/component/product')}
                >
                    목록
                </button>

                <button type="submit" className="product-btn">
                    {initialData.product_idx ? '수정' : '등록'}
                </button>
            </div>
        </form>
    )
}
