'use client'
import React, {useState} from 'react';
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";

const sampleCategory = [
    { id:1, name:'과자' },
    { id:2, name:'의류' },
    { id:3, name:'음료' },
    { id:4, name:'전자제품' },
    { id:5, name:'기타' },
]

const ExamModal = ({open,val,onClose}) => {

    const [category,setCategory] = useState(sampleCategory);
    const [product,setProduct] = useState({
        product_name:'',
        product_standard:'',
        purchase_price:0,
        selling_price:0,
        discount_rate:0,
        category:'',
    });

    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        onClose();
    };

    // 상품 입력
    const inputProduct = (e) =>{
        const {name, value} = e.target;
        setProduct({
            ...product,
            [name]:value
        })
    }

    if (!open) return null;

    return (
        <div
            className="modal_overlay"
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.3)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div
                className="modal_content"
                style={{
                    background: '#F4F6FA',
                    borderRadius: '10px',
                    padding: '40px 30px',
                    minWidth: '320px',
                    position: 'relative',
                    width: '700px'
                }}
            >
                <button
                    style={{
                        position: 'absolute',
                        right: 20,
                        top: 20,
                        background: 'none',
                        border: 'none',
                        fontSize: '3rem',
                        cursor: 'pointer'
                    }}
                    onClick={handleClose}
                >
                    ×
                </button>
                <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>{val==='regist'? '상품 등록' : '상품 수정' }</h3>
                <>

                    {/* 탭 내용 */}
                    <div style={{ display: 'flex',flexDirection:'column', gap: '16px', background:'#fff', padding:'20px'}}>
                        {val === 'regist' ? (
                        <>
                            <div className='flex white-space-nowrap align-center gap_20'>
                                <p className='content_text width-100'>상품명</p>
                                <input type='text' name='product_name' placeholder='상품명을 입력하세요' value={product.product_name} onChange={inputProduct}/>
                            </div>
                            <div className='flex white-space-nowrap align-center gap_20'>
                                <p className='content_text width-100'>규격</p>
                                <input type='text' name='product_standard' placeholder='규격을 입력하세요' value={product.product_standard} onChange={inputProduct}/>
                            </div>
                            <div className='flex white-space-nowrap align-center gap_20'>
                                <p className='content_text width-100'>입고단가</p>
                                <input type='text' name='purchase_price'  value={product.purchase_price} onChange={inputProduct}/>
                            </div>
                            <div className='flex white-space-nowrap align-center gap_20'>
                                <p className='content_text width-100'>판매단가</p>
                                <input type='text' name='selling_price' value={product.selling_price} onChange={inputProduct}/>
                            </div>
                            <div className='flex white-space-nowrap align-center gap_20'>
                                <p className='content_text width-100'>할인율</p>
                                <input type='text' name='discount_rate' value={product.discount_rate} onChange={inputProduct}/>
                            </div>
                            <div className='flex white-space-nowrap align-center gap_20'>
                                <p className='content_text width-100'>카테고리</p>
                                <select className='product-modal-select' name='category' onChange={inputProduct}>
                                    {category.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>


                        </>
                        ):'' }
                    </div>
                </>
                <div style={{marginTop: '20px'}}>
                    <button className='product-modal-btn'>{val==='regist'?'등록':'수정'}</button>
                </div>
            </div>
        </div>
    );
};

export default ExamModal;