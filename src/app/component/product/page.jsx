'use client'
import React, {useEffect, useState} from 'react';
import Header from "@/app/header";
import '../../globals.css';
import Image from "next/image";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import ExamModal from "@/app/component/modal/ExamModal";
import ProductModal from "@/app/component/modal/productModal";

const sampleProducts =[
    {
        product_idx:1,
        product_name:'상품명',
        product_standard:'규격',
        purchase_price:'입고단가',
        selling_price:'판매단가',
        discount_rate:'할인율',
        category:'카테고리'
    },
    {
        product_idx:2,
        product_name:'상품명',
        product_standard:'규격',
        purchase_price:'입고단가',
        selling_price:'판매단가',
        discount_rate:'할인율',
        category:'카테고리'
    },
    {
        product_idx:3,
        product_name:'상품명',
        product_standard:'규격',
        purchase_price:'입고단가',
        selling_price:'판매단가',
        discount_rate:'할인율',
        category:'카테고리'
    },
    {
        product_idx:4,
        product_name:'상품명',
        product_standard:'규격',
        purchase_price:'입고단가',
        selling_price:'판매단가',
        discount_rate:'할인율',
        category:'카테고리'
    },
    {
        product_idx:5,
        product_name:'상품명',
        product_standard:'규격',
        purchase_price:'입고단가',
        selling_price:'판매단가',
        discount_rate:'할인율',
        category:'카테고리'
    },
    // {
    //     product_idx:6,
    //     product_name:'상품명',
    //     product_standard:'규격',
    //     purchase_price:'입고단가',
    //     selling_price:'판매단가',
    //     discount_rate:'할인율',
    //     category:'카테고리'
    // },
    // {
    //     product_idx:7,
    //     product_name:'상품명',
    //     product_standard:'규격',
    //     purchase_price:'입고단가',
    //     selling_price:'판매단가',
    //     discount_rate:'할인율',
    //     category:'카테고리'
    // },
    // {
    //     product_idx:8,
    //     product_name:'상품명',
    //     product_standard:'규격',
    //     purchase_price:'입고단가',
    //     selling_price:'판매단가',
    //     discount_rate:'할인율',
    //     category:'카테고리'
    // },
    // {
    //     product_idx:9,
    //     product_name:'상품명',
    //     product_standard:'규격',
    //     purchase_price:'입고단가',
    //     selling_price:'판매단가',
    //     discount_rate:'할인율',
    //     category:'카테고리'
    // },
    // {
    //     product_idx:10,
    //     product_name:'상품명',
    //     product_standard:'규격',
    //     purchase_price:'입고단가',
    //     selling_price:'판매단가',
    //     discount_rate:'할인율',
    //     category:'카테고리'
    // },
]

const sampleOptions = [
    {
        option_idx:1,
        product_name:'상품명',
        option_name:'Red/100',
        stock_quantity:13,
    },
    {
        option_idx:2,
        product_name:'상품명',
        option_name:'Red/105',
        stock_quantity:13,
    },
    {
        option_idx:3,
        product_name:'상품명',
        option_name:'Green/100',
        stock_quantity:13,
    },
    {
        option_idx:4,
        product_name:'상품명',
        option_name:'Yellow/100',
        stock_quantity:13,
    },
]

const order_options = [
    { id:1, name:'오름차순' },
    { id:2, name:'내림차순' },
]

const options = [
    { id : 1, name:'상품코드'},
    { id : 2, name:'상품명'},
    { id : 3, name:'입고단가'},
    { id : 4, name:'판매단가'},
]

const ProductPage = () => {

    const [selectedOrder, setSelectedOrder] = useState(order_options[1]);
    const [selectedOption, setSelectedOption] = useState(options[0]);
    const [checkedList, setCheckedList] = useState([]);
    const [optionList, setOptionList] = useState([]);
    const [open, setOpen] = useState(0);
    const [productAll,setProductAll] = useState(false);
    const [optionAll, setOptionAll] = useState(false);
    const [productModalOpen, setProductModalOpen] = useState({bool : false, val : ''});

    // 상품 체크박스 선택
    const makeCheckedList = (idx) => {
        if(checkedList.includes(idx)){
            const filteredList = checkedList.filter((item) => item !== idx);
            setCheckedList(filteredList);
        } else {
            setCheckedList((prev)=>[...prev, idx]);
        }
    }

    // 옵션 체크박스 선택
    const makeOptionCheckedList = (idx) => {
        if(optionList.includes(idx)){
            const filteredList = optionList.filter((item) => item !== idx);
            setOptionList(filteredList);
        } else {
            setOptionList((prev)=>[...prev, idx]);
        }
    }

    // option 열기 닫기
    const optionOpen = (idx) => {
        if(idx !== open){
            setOpen(idx);
        } else {
            setOpen(0);
        }
    }

    return (
        <div className='productPage wrap'>
            <Header/>
            <div className='product-wrap'>
                <div className='text-align-left margin-bottom-20'><span className='header-text'>상품 관리</span></div>
                {/*상품 테이블*/}
                <div className='product-list-back flex flex-direction-col margin-bottom-20'>
                    <div className='flex justify-right margin-bottom-10 '>
                        <div className='select-container'>
                            <Listbox value={selectedOption} onChange={setSelectedOption}>
                                <ListboxButton className='select-btn'>{selectedOption.name}</ListboxButton>
                                <ListboxOptions className='select-option'>
                                    {options.map((option) => (
                                        <ListboxOption key={option.id} value={option} className="select-option-item">
                                            {option.name}
                                        </ListboxOption>
                                    ))}
                                </ListboxOptions>
                            </Listbox>
                        </div>
                        <div className='select-container'>
                            <Listbox value={selectedOrder} onChange={setSelectedOrder}>
                                <ListboxButton className='select-btn'>{selectedOrder.name}</ListboxButton>
                                <ListboxOptions className="select-option">
                                    {order_options.map((order) => (
                                        <ListboxOption key={order.id} value={order} className='select-option-item'>
                                            {order.name}
                                        </ListboxOption>
                                    ))}
                                </ListboxOptions>
                            </Listbox>
                        </div>
                    </div>
                    <div className='product-list'>
                    <table className='product-table'>
                        <thead>
                            <tr>
                                <th className='text-align-center'><input type='checkbox' checked={productAll} onChange={()=>setProductAll(!productAll)}/>전체선택</th>
                                <th>상품코드</th>
                                <th>상품명</th>
                                <th>규격</th>
                                <th>입고 단가</th>
                                <th>판매 단가</th>
                                <th>할인율</th>
                                <th>카테고리</th>
                                <th>이미지</th>
                                <th>상세문서</th>
                            </tr>
                        </thead>
                        <tbody>
                        {sampleProducts &&
                            sampleProducts?.map(p => (
                                <tr key={p.product_idx} onClick={()=>optionOpen(p.product_idx)} className='cursor-pointer'>
                                    <td><input type='checkbox' checked={productAll ? true : checkedList.includes(p.product_idx)} onChange={()=>makeCheckedList(p.product_idx)} onClick={(e)=>e.stopPropagation()}/></td>
                                    <td>{p.product_idx}</td>
                                    <td>{p.product_name}</td>
                                    <td>{p.product_standard}</td>
                                    <td>{p.purchase_price}</td>
                                    <td>{p.selling_price}</td>
                                    <td>{p.discount_rate}</td>
                                    <td>{p.category}</td>
                                    <td><Image src='/logo.png' alt='product_img' width={50} height={50}/></td>
                                    <td>상세문서</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                    <div className='flex'>
                        <button className='product-btn' onClick={()=>setProductModalOpen({bool:true,val:'regist'})}>등록</button>
                        <button className='product-btn' onClick={()=>setProductModalOpen({bool:true,val:'update'})}>수정</button>
                        <button className='product-btn-del'>삭제</button>
                    </div>
                </div>
                {/*옵션 테이블*/}
                {open !== 0 ?(
                <div className='product-list-back flex flex-direction-col'>
                    <table className='product-table'>
                        <thead>
                        <tr>
                            <th><input type='checkbox' checked={optionAll} onChange={()=>setOptionAll(!optionAll)}/>전체선택</th>
                            <th>상품명</th>
                            <th>옵션명</th>
                            <th>재고 수량</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sampleOptions && sampleOptions?.map(o=>(
                            <tr key={o.option_idx}>
                                <td><input type='checkbox' key={o.option_idx} checked={optionAll ? true : optionList.includes(o.option_idx)} onChange={()=>makeOptionCheckedList(o.option_idx)}/></td>
                                <td>{o.product_name}</td>
                                <td>{o.option_name}</td>
                                <td>{o.stock_quantity}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <div className='flex'>
                        <button className='product-btn'>등록</button>
                        <button className='product-btn'>수정</button>
                        <button className='product-btn-del'>삭제</button>
                    </div>
                </div>
                ):''}
            </div>
            <ProductModal open={productModalOpen.bool} val={productModalOpen.val} onClose={()=>setProductModalOpen({bool:false,val:''})}/>
        </div>
    );
};

export default ProductPage;