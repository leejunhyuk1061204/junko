'use client'
import React, {useEffect, useRef, useState} from 'react';
import Header from "@/app/header";
import {format} from "date-fns";
import axios from "axios";
import {useAlertModalStore} from "@/app/zustand/store";

const salesStatusList = [
    {idx:1, name:'결제 대기'},
    {idx:2, name:'결제 취소'},
    {idx:3, name:'결제 완료'},
    {idx:4, name:'출고 예정'},
    {idx:5, name:'배송중'},
    {idx:6, name:'배송완료'},
]

const paymentOptionList = [
    {idx:1, name:'현금'},
    {idx:2, name:'카드'},
]

const SalesInsertPage = () => {

    const {openModal, closeModal} = useAlertModalStore();
    const [salesForm, setSalesForm] = useState({});
    const [salesProductForm, setSalesProductForm] = useState([]);
    const [productOptionList, setProductOptionList] = useState([]);
    const [productList, setProductList] = useState([]);
    const [optionList, setOptionList] = useState({});
    const [filteredOptionList, setFilteredOptionList] = useState({});
    const [row, setRow] = useState(3);

    const [productSearch1, setProductSearch1] = useState({});
    const [productSearch2, setProductSearch2] = useState({});
    const [productFocused, setProductFocused] = useState(false);
    const [selectedRow, setSelectedRow] = useState(0);

    const [optionSearch1, setOptionSearch1] = useState({});
    const [optionSearch2, setOptionSearch2] = useState({});
    const [optionFocused, setOptionFocused] = useState(false);

    const [statusClicked, setStatusClicked] = useState(false);
    const [paymentOptionClicked, setPaymentOptionClicked] = useState(false);
    const statusRef = useRef(null);
    const paymentOptionRef = useRef(null);

    useEffect(() => {
        getProductList();
    },[])

    // 상품 리스트
    const getProductList = async (searchText='') => {
        const {data} = await axios.post('http://localhost:8080/productNoption/list',{search:searchText});
        setProductOptionList(data.list);
        const filteredList = data.list.filter((item,index,self)=>index === self.findIndex(v=>v.product_idx===item.product_idx));
        setProductList(filteredList);
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setProductSearch2(prev=>({...prev,[selectedRow]:productSearch1[selectedRow]}));
        }, 300);

        return () => clearTimeout(timer);
    }, [productSearch1[selectedRow]]);

    useEffect(() => {
        getProductList(productSearch2[selectedRow]);
    }, [productSearch2[selectedRow]]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setOptionSearch2(prev=>({...prev,[selectedRow]:optionSearch1[selectedRow]}));
        }, 300);

        console.log('optionSearch1[selectedRow]',optionSearch1[selectedRow]);
        return () => clearTimeout(timer);
    }, [optionSearch1[selectedRow]]);

    useEffect(() => {
        filterOptionList(selectedRow,optionSearch2[selectedRow]);
        console.log('optionSearch2[selectedRow]',optionSearch2[selectedRow]);
    }, [optionSearch2[selectedRow]]);

    // salesForm 입력
    const changeSalesFrom = (e) => {
        const {name, value} = e.target;
        console.log(name, value);
        if(name === 'payment_date') {
            const date = format(value, 'yyyy-MM-dd');
            setSalesForm(prev => ({
                ...prev,
                [name]: date
            }));
        } else {
            setSalesForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    }

    // salesProduct 입력
    const changeProductForm = (i,filed,value) => {
        setSalesProductForm(prev=>{
            const copy = [...prev];
            const item = copy[i] || {} ;
            copy[i] = {
                ...item,
                [filed] : value
            }
            return copy;
        })
    }

    // 옵션 리스트 변경
    const changeOptionList = (i,idx) => {
        const filteredList = productOptionList.filter(f=>f.product_idx === idx);
        setOptionList(prev=>({...prev,[i]:filteredList}));
        setFilteredOptionList(prev=>({...prev,[i]:filteredList}));
        console.log('옵션 리스트 변경',filteredList);
    }

    // 옵션 리스트 필터
    const filterOptionList = (i,search) => {
        if(search===''){
            if(filteredOptionList?.[i]?.length === 1 && typeof filteredOptionList[i][0].combined_name === 'undefined'){
                setFilteredOptionList(prev=>({...prev,[i]:[{combined_name:'없음'}]}));
            } else {
                setFilteredOptionList(prev => ({
                    ...prev,
                    [i]: optionList[i]
                }));
            }
            return;
        }
        const filteredList = optionList[i]?.filter(f=>(typeof f.combined_name === 'string') && f.combined_name.toLowerCase().includes(search.toLowerCase())) || [];
        setFilteredOptionList(prev => ({
            ...prev,
            [i]: filteredList
        }));
        console.log('옵션 리스트 필터',filteredList);
    }

    // 외부 클릭 감지
    const handleClickOutside = (e) => {
        if (statusRef.current && !statusRef.current.contains(e.target)) {
            setStatusClicked(false);
        }
        if (paymentOptionRef.current && !paymentOptionRef.current.contains(e.target)) {
            setPaymentOptionClicked(false);
        }
    };

    useEffect(() => {

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 주문 입력
    const insertSales = async() => {
        console.log(salesForm);
        console.log(salesProductForm);

        openModal({
            svg: '❓',
            msg1: '주문 등록 확인',
            msg2: '주문을 등록하시겠습니까?',
            showCancel: true,
            onConfirm: async() => {
                try {
                    const {data} = await axios.post('http://localhost:8080/sales/insert',{sales:salesForm,products:salesProductForm});
                    console.log(data);
                    if (!data.success) {
                        openModal({
                            svg: '❗',
                            msg1: '등록 실패',
                            msg2: '주문 등록에 실패했습니다',
                            showCancel: false,
                        })
                    } else {
                        openModal({
                            svg: '❗',
                            msg1: '등록 성공',
                            msg2: '주문 등록에 성공했습니다',
                            showCancel: false,
                            onConfirm: () => {
                                location.href='/component/sales';
                            }
                        })
                    }
                } catch (error) {
                    console.log(error);
                    openModal({
                        svg: '❗',
                        msg1: '오류 발생',
                        msg2: '서버 요청 중 문제가 발생했습니다',
                        showCancel: false,
                    })
                }
            }
        })

    }

    return (
        <div>
            <Header/>
            <div className='wrap page-background'>
                <div className='margin-0-200 margin-bottom-20'>
                    <div className='text-align-left order-head-text'>
                        주문 입력
                    </div>
                </div>
                <div className='back-ground-white margin-0-200 padding-30 width-auto flex back-radius flex-direction-col margin min-width-400'>
                    <div className='flex flex-direction-col'>
                        <div className='order-product-text margin-bottom-10 text-align-left'>주문 정보</div>
                        <div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>고객 이름</th>
                                        <th>연락처</th>
                                        <th>주소</th>
                                        <th>결제 옵션</th>
                                        <th>결제일자</th>
                                        <th>결제상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><input className='input-border-none' type='text' name='customer' value={salesForm.customer||''} onChange={e=>changeSalesFrom(e)}/></td>
                                        <td><input className='input-border-none' type='text' name='customer_phone' value={salesForm.customer_phone||''} onChange={e=>changeSalesFrom(e)}/></td>
                                        <td><input className='input-border-none' type='text' name='customer_address' value={salesForm.customer_address||''} onChange={e=>changeSalesFrom(e)}/></td>
                                        <td className='position-relative cursor-pointer' onClick={()=>setPaymentOptionClicked(true)} ref={paymentOptionRef}>
                                            {salesForm.payment_option || ''}
                                            {paymentOptionClicked
                                                ? (
                                                    <ul className="listBox-option">
                                                        {paymentOptionList.filter(f=>f.name !== salesForm.payment_option)?.map((pl) => (
                                                            <li
                                                                key={pl.idx}
                                                                className="listBox-option-item margin-0"
                                                                onClick={(e)=>{
                                                                    e.stopPropagation();
                                                                    changeSalesFrom({target : {name:'payment_option',value:pl.name}});
                                                                    setPaymentOptionClicked(false);
                                                                }}
                                                            >
                                                                {pl.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ):('')}
                                        </td>
                                        <td><input className='input-border-none' type='date' name='payment_date' value={salesForm.payment_date||''} onChange={e=>changeSalesFrom(e)}/></td>
                                        <td className='position-relative cursor-pointer' onClick={()=>setStatusClicked(true)} ref={statusRef}>
                                            {salesForm.status || ''}
                                            {statusClicked
                                                ? (
                                                    <ul className="listBox-option">
                                                        {salesStatusList.filter(f=>f.name !== salesForm.status)?.map((sl) => (
                                                            <li
                                                                key={sl.idx}
                                                                className="listBox-option-item margin-0"
                                                                onClick={(e)=>{
                                                                    e.stopPropagation();
                                                                    changeSalesFrom({target : {name:'status',value:sl.name}});
                                                                    setStatusClicked(false);
                                                                }}
                                                            >
                                                                {sl.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ):('')}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className='flex flex-direction-col'>
                        <div className='order-product-text margin-bottom-10 text-align-left'>상품 정보</div>
                        <div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>상품 이름</th>
                                        <th>상품 옵션</th>
                                        <th>수량</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {Array.from({ length: row }, (_, i) => (
                                    <tr key={i}>
                                        <td>
                                            <div className='flex align-center gap_15'>
                                                <div className='max-width-80 white-space-nowrap width'>상품</div>
                                                <div>
                                                    <div className="listBox-container">
                                                        <input
                                                            type="text"
                                                            className="width-100 border rounded"
                                                            placeholder="상품 검색"
                                                            value={productSearch1[i]?productSearch1[i]:''}
                                                            onChange={(e) => setProductSearch1(prev=>({...prev,[i]:e.target.value}))}
                                                            onFocus={() => {
                                                                setSelectedRow(i);
                                                                setProductFocused(prev=>({...prev,[i]:true}));
                                                                getProductList('');
                                                                setProductSearch1(prev=>({...prev,[i]:''}));
                                                                setOptionSearch1(prev=>({...prev,[i]:''}));
                                                            }}
                                                            onBlur={() => setTimeout(() => setProductFocused(prev=>({...prev,[i]:false})), 120)}
                                                        />
                                                        {productFocused[i] ? (<>
                                                            {productList?.length > 0 && (
                                                                <ul className="listBox-option">
                                                                    {productList?.map((pl) => (
                                                                        <li
                                                                            key={pl.product_idx}
                                                                            onClick={() => {
                                                                                setProductSearch1(prev=>({...prev,[i]:pl.product_name}));
                                                                                changeProductForm(i,'product_idx',pl.product_idx);
                                                                                changeOptionList(i,pl.product_idx);
                                                                            }}
                                                                            className="listBox-option-item margin-0"
                                                                        >
                                                                            {pl.product_name}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                            {productList?.length === 0 && productSearch1[i] && (
                                                                <div className="position-absolute z-10 width-100 back-ground-white border px-2 py-1 h-over-sky">검색 결과 없음</div>
                                                            )}
                                                        </>):('')}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className='flex align-center gap_15'>
                                                <div className='max-width-80 white-space-nowrap width'>옵션</div>
                                                <div>
                                                    <div className="listBox-container">
                                                        <input
                                                            type="text"
                                                            className="width-100 border rounded"
                                                            placeholder="옵션 검색"
                                                            value={optionSearch1[i]?optionSearch1[i]:''}
                                                            onChange={(e) => setOptionSearch1(prev=>({...prev,[i]:e.target.value}))}
                                                            onFocus={() => {
                                                                setSelectedRow(i);
                                                                setOptionFocused(prev=>({...prev,[i]:true}));
                                                                filterOptionList(i,'');
                                                                setOptionSearch1(prev=>({...prev,[i]:''}));
                                                            }}
                                                            onBlur={() => setTimeout(() => setOptionFocused(prev=>({...prev,[i]:false})), 120)}
                                                        />
                                                        {optionFocused[i] ? (<>
                                                            {filteredOptionList?.[i]?.length > 0 && (
                                                                <ul className="listBox-option">
                                                                    {filteredOptionList[i]?.map((ol,index) => (
                                                                        <li
                                                                            key={index}
                                                                            onClick={() => {
                                                                                setOptionSearch1(prev=>({...prev,[i]:ol.combined_name}));
                                                                                if(typeof ol.product_option_idx !=='undefined') {
                                                                                    changeProductForm(i, 'product_option_idx', ol.product_option_idx);
                                                                                }
                                                                            }}
                                                                            className="listBox-option-item margin-0"
                                                                        >
                                                                            {ol.combined_name}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                            {filteredOptionList[i]?.length === 0 && optionSearch1[i] && (
                                                                <div className="position-absolute z-10 width-100 back-ground-white border px-2 py-1 h-over-sky">검색 결과 없음</div>
                                                            )}
                                                        </>):('')}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><input className='input-border-none' type='text' value={salesProductForm?.[i]?.product_cnt || ''} onChange={(e)=>changeProductForm(i,'product_cnt',e.target.value)} /></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            <div className='flex justify-right margin-y-20'><button className='btn' onClick={()=>setRow(row+1)}>상품 추가</button></div>
                        </div>
                    </div>
                    <div><button className='btn' onClick={insertSales}>주문 등록</button></div>
                </div>
            </div>
        </div>
    );
};

export default SalesInsertPage;