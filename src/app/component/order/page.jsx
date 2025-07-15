'use client'
import React, {useEffect, useRef, useState} from 'react';
import Header from "@/app/header";
import axios from "axios";
import Pagination from "react-js-pagination";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import {useAlertModalStore} from "@/app/zustand/store";
import {IoIosSearch} from "react-icons/io";
import {FaSearch} from "react-icons/fa";
import dynamic from "next/dynamic";

const sortOptions = [
    { id: 1, name: '최신순' , orderColumn : 'reg_date', orderDirection: 'desc' },
    { id: 2, name: '오래된순' , orderColumn : 'reg_date', orderDirection: 'asc' },
    { id: 3, name: '번호순' , orderColumn : 'order_idx', orderDirection: 'asc'}
];

const orderStatusList = [
    {idx:1, name:'확정'},
    {idx:2, name:'취소'},
    {idx:3, name:'입고완료'},
    {idx:4, name:'요청'},
]

const DetailOrderModal = dynamic(() => import('../modal/DetailOrderModal'), {
    ssr: false,
});

const OrderListPage = () => {

    const {openModal,closeModal} = useAlertModalStore();
    const [orderList, setOrderList] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedSort, setSelectedSort] = useState({ id: 3, name: '번호순' , orderColumn : 'order_idx', orderDirection: 'asc'});
    const [search, setSearch] = useState('');
    const [statusClicked, setStatusClicked] = useState({});
    const [detailOrderOpen, setDetailOrderOpen] = useState({boolean:false,idx:0});
    const statusRef = useRef({});
    
    useEffect(() => {
        getOrderList();
    },[page,selectedSort]);

    // 외부 클릭 감지
    useEffect(() => {
        document.addEventListener('mousedown',handleClickOutside);
        return () => {
            document.removeEventListener('mousedown',handleClickOutside);
        }
    }, [statusClicked]);

    const handleClickOutside = (e) => {
        Object.entries(statusClicked).forEach(([key, value]) => {
            if(value && statusRef.current[key] && ! statusRef.current[key].contains(e.target)){
                setStatusClicked(prev=>({...prev,[key]:false}));
            }
        })
    }

    // 오더 리스트 가져오기
    const getOrderList = async() => {
        const {data} = await axios.post('http://localhost:8080/order/list',{page:page, orderColumn : selectedSort.orderColumn, orderDirection: selectedSort.orderDirection, search:search});
        console.log(data);
        setOrderList(data.orderList);
        setTotal(data.total*10);
    }

    // 오더 수정
    const updateOrder = async(idx,status) => {
        const {data} = await axios.post('http://localhost:8080/order/update',{order_idx:idx,status:status});
        console.log(data);
        getOrderList();
        if(!data.success){
            openModal({
                svg: '❗',
                msg1: '변경 실패',
                msg2: '진행 상태 변경에 실패했습니다',
                showCancel: false,
                onConfirm: closeModal
            })
        }
    }

    // 정렬 변경
    const handleSortChange = (sort) => {
        setSelectedSort(sort);
        setPage(1);
    };

    // 검색 엔터
    const searchEnter = (e)=>{
        if(e.keyCode === 13){
            getOrderList();
            setSearch('');
        }
    }

    // 스테이터스 변경
    const changeStatusClicked = (i) => {
        setStatusClicked(prev=>({
            ...prev,
                [i]:!prev[i]
        }));
    }

    return (
    <div className='productPage wrap page-background'>
        <Header/>
        <h3 className="text-align-left margin-bottom-10 margin-30">
            <span className="product-header">발주 목록 / 상세 조회</span>
        </h3>
        <div className="order-list-back">
            <div className="flex gap_10 align-center justify-right margin-bottom-10">
                {/* 검색 */}
                <div className='width-fit flex gap_15 align-center'>
                    <input style={{padding:'1.5px'}} type='text' placeholder='검색어 입력 후 엔터' value={search} onChange={e=>setSearch(e.target.value)} onKeyUp={e=>searchEnter(e)}/>
                    <button className='btn white-space-nowrap height-50' onClick={()=>{getOrderList();setSearch('')}}><FaSearch /></button>
                </div>
                {/* 정렬 */}
                <div className="select-container">
                    <Listbox value={selectedSort} onChange={handleSortChange}>
                        <ListboxButton className="select-btn">{selectedSort.name}</ListboxButton>
                        <ListboxOptions className="select-option">
                            {sortOptions.map(option => (
                                <ListboxOption key={option.id} value={option} className="select-option-item">
                                    {option.name}
                                </ListboxOption>
                            ))}
                        </ListboxOptions>
                    </Listbox>
                </div>
            </div>

            <table className='order-list-table'>
                <thead>
                    <tr>
                        <th><input type='checkbox'/></th>
                        <th>발주 번호</th>
                        <th>발주 상품</th>
                        <th>거래처</th>
                        <th>입고 창고</th>
                        <th>총액</th>
                        <th>발주 일자</th>
                        <th>담당자</th>
                        <th>진행 상태</th>
                    </tr>
                </thead>
                <tbody>
                    {orderList?.length >0 && orderList?.map((order,i) => (
                        <tr key={order.order_idx} className='cursor-pointer' onClick={()=>setDetailOrderOpen({boolean:true,idx:order.order_idx})}>
                            <td><input type='checkbox'/></td>
                            <td>{order.order_idx}</td>
                            <td>{order.product_name} 외 {order.cnt-1}개 상품</td>
                            <td>{order.custom_name}</td>
                            <td>{order.warehouse_name}</td>
                            <td>{order.price}</td>
                            <td>{order.reg_date}</td>
                            <td>{order.user_name}</td>
                            <td className='position-relative cursor-pointer' onClick={(e)=>{e.stopPropagation();changeStatusClicked(i)}} ref={el => (statusRef.current[i] = el)}>
                                {order.status}
                                {statusClicked[i]
                                && order.status ==='요청'
                                    ? (
                                <ul className="listBox-option">
                                    {orderStatusList?.map((os) => (
                                        <li
                                            key={os.idx}
                                            className="listBox-option-item margin-0"
                                            onClick={()=>updateOrder(order.order_idx,os.name)}
                                        >
                                            {os.name}
                                        </li>
                                    ))}
                                </ul>
                                ):('')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* 페이지네이션 */}
            <div className="product-pagination flex justify-content-between gap_5 margin-bottom-10">
                <div className='width-fit'></div>
                <div>
                <Pagination
                    activePage={page}
                    itemsCountPerPage={10}
                    totalItemsCount={total}
                    pageRangeDisplayed={5}
                    onChange={(page) => setPage(page)}  // set만!
                />
                </div>
                <div className='flex justify-right width-fit'><button className='btn white-space-nowrap' onClick={()=>{location.href="/component/order/insert"}}>등록</button></div>
            </div>
        </div>
        <DetailOrderModal open={detailOrderOpen.boolean} idx={detailOrderOpen.idx} onClose={()=>setDetailOrderOpen({boolean:false,idx:0})}/>
    </div>
    );
};

export default OrderListPage;