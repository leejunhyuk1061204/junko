'use client'
import React, {useEffect, useState} from 'react';
import Header from "@/app/header";
import {format} from "date-fns";
import axios from "axios";

const SalesInsertPage = () => {

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

        return () => clearTimeout(timer);
    }, [optionSearch1[selectedRow]]);

    useEffect(() => {
        filterOptionList(selectedRow,optionSearch2[selectedRow]);
    }, [optionSearch2[selectedRow]]);

    // salesForm 입력
    const changeSalesFrom = (e) => {
        const {name, value} = e.target;
        if(name !== 'payment_date') {
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
            setFilteredOptionList(prev=>({...prev,[i]:optionList}));
            return;
        }
        const filteredList = optionList[i]?.filter(f=>f.combined_name && f.combined_name.toLowerCase().includes(search.toLowerCase())) || [];
        setFilteredOptionList(prev=>({...prev,[i]:filteredList}));
        console.log('옵션 리스트 필터',filteredList);
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
                                        <td><input className='input-border-none' type='text' name='payment_option' value={salesForm.payment_option||''} onChange={e=>changeSalesFrom(e)}/></td>
                                        <td><input className='input-border-none' type='date' name='payment_date' value={salesForm.payment_date||''} onChange={e=>changeSalesFrom(e)}/></td>
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
                                                            value={productSearch1[i]}
                                                            onChange={(e) => setProductSearch1(prev=>({...prev,[i]:e.target.value}))}
                                                            onFocus={() => {
                                                                setSelectedRow(i);
                                                                setProductFocused(prev=>({...prev,[i]:true}));
                                                                getProductList('');
                                                                setProductSearch1(prev=>({...prev,[i]:''}));
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
                                                            // value={!optionList[i] || optionList[i].length === 0 ? '없음' : optionList[i].length === 1 ? (optionList[i][0]?.combined_name || '없음'):(optionList[i].combined_name || '')}
                                                            value={(salesProductForm?.[i]?.product_idx !==null) ?'':(typeof filteredOptionList?.[i]?.[0]?.combined_name === 'undefined')?'없음': optionSearch1[i]}
                                                            onChange={(e) => setOptionSearch1(prev=>({...prev,[i]:e.target.value}))}
                                                            onFocus={() => {
                                                                setSelectedRow(i);
                                                                setOptionFocused(prev=>({...prev,[i]:true}));
                                                                filterOptionList(i,'');
                                                            }}
                                                            onBlur={() => setTimeout(() => setOptionFocused(prev=>({...prev,[i]:false})), 120)}
                                                        />
                                                        {optionFocused[i] ? (<>
                                                            {filteredOptionList[i]?.length > 0 && (
                                                                <ul className="listBox-option">
                                                                    {filteredOptionList[i]?.map((ol) => (
                                                                        <li
                                                                            key={ol.product_option_idx}
                                                                            onClick={() => {
                                                                                setOptionSearch1(prev=>({...prev,[i]:ol.combined_name}));
                                                                                filterOptionList(i,'')
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
                                                            {filteredOptionList[i]?.length === 1 && (typeof filteredOptionList?.[i]?.[0]?.combined_name === 'undefined') && (
                                                                <div className="position-absolute z-10 width-100 back-ground-white border px-2 py-1 h-over-sky">없음</div>
                                                            )}
                                                        </>):('')}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><input className='input-border-none' type='text'/></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            <div className='flex justify-right margin-y-20'><button className='btn' onClick={()=>setRow(row+1)}>상품 추가</button></div>
                        </div>
                    </div>
                    <div><button className='btn' >주문 등록</button></div>
                </div>
            </div>
        </div>
    );
};

export default SalesInsertPage;