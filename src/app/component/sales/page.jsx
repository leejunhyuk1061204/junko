'use client'
import React, {useEffect, useRef, useState} from 'react';
import Header from "@/app/header";
import {FaSearch} from "react-icons/fa";
import {FaRegCalendarCheck} from "react-icons/fa6";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import Pagination from "react-js-pagination";
import {useAlertModalStore, useDatePickerStore} from "@/app/zustand/store";
import axios from "axios";
import {format} from "date-fns";
import ProductModal from "@/app/component/modal/ProductModal";
import WaybillInsertModal from "@/app/component/modal/WaybillInsertModal";

const sortOptions = [
    { id: 1, name: '최신순' , orderColumn : 'reg_date', orderDirection: 'desc' },
    { id: 2, name: '오래된순' , orderColumn : 'reg_date', orderDirection: 'asc' },
    { id: 3, name: '번호순' , orderColumn : 'sales_idx', orderDirection: 'asc'}
];

const statusFilterList = [
    {idx:1, name:'전체'},
    {idx:2, name:'결제 대기'},
    {idx:3, name:'결제 취소'},
    {idx:4, name:'결제 완료'},
    {idx:5, name:'출고 예정'},
    {idx:6, name:'배송중'},
    {idx:7, name:'배송완료'},
]

const salesStatusList = [
    {idx:1, name:'결제 대기'},
    {idx:2, name:'결제 취소'},
    {idx:3, name:'결제 완료'},
    {idx:4, name:'출고 예정'},
    {idx:5, name:'배송중'},
    {idx:6, name:'배송완료'},
]

const SalesPage = () => {

    const {openModal,closeModal} = useAlertModalStore();
    const {openDatePicker, closeDatePicker} = useDatePickerStore();
    const [selectedDate, setSelectedDate] = useState({});
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedSort, setSelectedSort] = useState({ id: 1, name: '최신순' , orderColumn : 'reg_date', orderDirection: 'desc' },);
    const [selectedStatus, setSelectedStatus] = useState({idx:1, name:'전체'});
    const [mode, setMode] = useState(null);
    const [statusClicked, setStatusClicked] = useState({});
    const statusRef = useRef({});
    const [checkboxChecked, setCheckboxChecked] = useState({});

    const [salesList, setSalesList] = useState([]);
    const [productModalOpen, setProductModalOpen] = useState({bool:false,idx:0});
    const [waybillInsertModalOpen, setWaybillInsertModalOpen] = useState({bool:false,idxList:[]});

    useEffect(() => {
        getSalesList();
    },[selectedSort, selectedStatus, page, selectedDate]);

    const waybillInsert = () => {
        if(Object.values(checkboxChecked).length === 0) return;
        const filteredChecked = Object.values(checkboxChecked).filter(f=>f.bool === true);
        const selectedIdx = filteredChecked.map(f=>f.idx);
        const filteredSalesList = salesList.filter(f=>selectedIdx.includes(f.sales_idx)).filter(f=>f.status === '결제 완료').map(f=>f.sales_idx);
        console.log(filteredSalesList);
        setWaybillInsertModalOpen({bool:true,idxList:filteredSalesList});
    }

    // 주문 업데이트
    const updateSales = async (idx,status) => {
        openModal({
            svg: '❓',
            msg1: '변경 확인',
            msg2: '상태를 변경하시겠습니까?',
            showCancel: true,
            onConfirm: async() => {
                const {data} = await axios.post('http://localhost:8080/sales/update',{sales_idx:idx,status:status});
                console.log(data);
                closeModal();
                setTimeout(()=>{
                    try {
                        if (data.success) {
                            openModal({
                                svg: '✔',
                                msg1: '변경 완료',
                                msg2: '주문이 변경되었습니다.',
                                showCancel: false,
                                onConfirm: ()=>{
                                    getSalesList();
                                }
                            });
                        } else {
                            openModal({
                                svg: '❗',
                                msg1: '변경 실패',
                                msg2: '주문 변경에 실패했습니다.',
                                showCancel: false,
                            });
                        }
                    } catch (err) {
                        openModal({
                            svg: '❗',
                            msg1: '오류',
                            msg2: err.response?.data?.message || err.message,
                            showCancel: false,
                        });
                    }
                },100);
            }
        });
    }

    // 주문 리스트
    const getSalesList = async () => {
        const {data} = await axios.post('http://localhost:8080/sales/list',
            {
                page:page,
                search:search,
                orderColumn:selectedSort.orderColumn,
                orderDirection:selectedSort.orderDirection,
                reg_date:mode ? selectedDate.selectDate:'',
                payment_date:!mode ? selectedDate.selectDate:'',
                start_date:selectedDate.startDate||'',
                end_date:selectedDate.endDate||'',
                status:selectedStatus.name === '전체' ? '' : selectedStatus.name,
                mode:mode
            });
        setSalesList(data.list);
        setTotal(data.total*10);
        console.log(data.list);
        setCheckboxChecked({});
    }

    // 검색 엔터
    const searchEnter = (e)=>{
        if(e.keyCode === 13){
            getSalesList(search);
            setSearch('');
        }
    }
    // 정렬 변경
    const handleSortChange = (sort) => {
        setSelectedSort(sort);
        setPage(1);
    };

    // 스테이터스 필터
    const handleStatusChange = (status) => {
        setSelectedStatus(status);
        setPage(1);
        getSalesList();
    }


    // 스테이터스 변경
    const changeStatusClicked = (i) => {
        setStatusClicked(prev=>({
            ...prev,
            [i]:!prev[i]
        }));
    }

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

    // 체크박스 전체 선택
    const allCheck = (checked) => {
        console.log(checkboxChecked);
        const updated = {};
        for (let i=0; i<salesList.length; i++) {
            updated[i] = {bool:checked,idx:salesList[i].sales_idx};
            console.log(updated[i]);
        }
        setCheckboxChecked(updated);
    }

    // datePicker 핸들러
    const handleDatePicker = (mode) => {
        setMode(mode);
        openDatePicker({
            mode:'range',
            modeSelect:true,
            initialDates:[null,null],
            onConfirm:((_,value)=>{
                if(Array.isArray(value)){
                    const [start,end] = value;
                    setSelectedDate({
                        startDate:start ? format(start,'yyyy-MM-dd') : null,
                        endDate:end ? format(end,'yyyy-MM-dd') : null
                    });
                } else {
                    setSelectedDate({
                        selectDate:format(value, 'yyyy-MM-dd')
                    })
                }
                closeDatePicker();
            })
        })
    }

    return (
        <div>
            <div className='productPage wrap page-background'>
                <Header/>
                <h3 className="text-align-left margin-bottom-10 margin-30">
                    <span className="product-header">주문 목록 / 상세 조회</span>
                </h3>
                <div className={`order-list-back ${Object.values(statusClicked).some(v=>v === true) ?'overflow-visible-important':''}`}>
                    <div className="flex gap_10 align-center justify-right margin-bottom-10">
                        {/* 검색 */}
                        <div className='width-fit flex gap_15 align-center'>
                            <input style={{padding:'1.5px'}} type='text' placeholder='검색어를 입력해주세요' value={search} onChange={e=>setSearch(e.target.value)} onKeyUp={e=>searchEnter(e)}/>
                            <button className='btn white-space-nowrap height-50' onClick={()=>{getSalesList();setSearch('')}}><FaSearch /></button>
                        </div>
                        {/* 기간 설정 */}
                        <div className='width-fit cursor-pointer'><button className='btn' onClick={()=>handleDatePicker(true)}><FaRegCalendarCheck /> 주문일자</button></div>
                        <div className='width-fit cursor-pointer'><button className='btn' onClick={()=>handleDatePicker(false)}><FaRegCalendarCheck /> 결제일자</button></div>
                        {/* 상태필터 */}
                        <div className="select-container" style={{marginRight:0}}>
                            <Listbox value={selectedStatus} onChange={handleStatusChange}>
                                <ListboxButton className="select-btn" style={{marginRight:0}}>{selectedStatus.name}</ListboxButton>
                                <ListboxOptions className="select-option">
                                    {statusFilterList.map(option => (
                                        <ListboxOption key={option.idx} value={option} className="select-option-item">
                                            {option.name}
                                        </ListboxOption>
                                    ))}
                                </ListboxOptions>
                            </Listbox>
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
                    <table className={'checkbox-table text-overflow-table'}>
                        <thead>
                        <tr>
                            <th><input type='checkbox' checked={salesList.length > 0 && salesList.every((_, i) => checkboxChecked[i]?.bool === true)} onChange={e=>allCheck(e.target.checked)}/></th>
                            <th>주문번호</th>
                            <th>주문자명</th>
                            <th>연락처</th>
                            <th>주소</th>
                            <th>상품</th>
                            <th>주문일자</th>
                            <th>결제일자</th>
                            <th>결제방법</th>
                            <th>상태</th>
                        </tr>
                        </thead>
                        <tbody>
                            {salesList.map((sale,i)=>(
                                <tr key={sale.sales_idx}>
                                    <td><input type='checkbox' checked={checkboxChecked[i]?.bool ?? false} onChange={()=>setCheckboxChecked(prev=>({...prev,[i]:{bool:!checkboxChecked[i]?.bool,idx:sale.sales_idx}}))}/></td>
                                    <td>{sale.sales_idx}</td>
                                    <td>{sale.customer}</td>
                                    <td>{sale.customer_phone}</td>
                                    <td>{sale.customer_address}</td>
                                    <td className='cursor-pointer' onClick={()=>setProductModalOpen({bool:true,idx:sale.sales_idx})}>{sale.product_name}{sale.product_cnt >1 ? ` 외 ${sale.product_cnt-1} 개` : '' }</td>
                                    <td>{sale.reg_date}</td>
                                    <td>{sale.payment_date || ''}</td>
                                    <td>{sale.payment_option}</td>
                                    <td className={`position-relative cursor-pointer ${statusClicked[i] ? 'show-dropdown':''} `} onClick={(e)=>{e.stopPropagation();changeStatusClicked(i)}} ref={el => (statusRef.current[i] = el)}>
                                        {sale.status}
                                        {statusClicked[i]
                                            ? (
                                                <ul className="listBox-option">
                                                    {salesStatusList.filter(f=>f.name !== sale.status)?.map((sl) => (
                                                        <li
                                                            key={sl.idx}
                                                            className="listBox-option-item margin-0"
                                                            onClick={()=>updateSales(sale.sales_idx,sl.name)}
                                                        >
                                                            {sl.name}
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
                        <div className='flex justify-content-center'>
                            <Pagination
                                activePage={page}
                                itemsCountPerPage={10}
                                totalItemsCount={total}
                                pageRangeDisplayed={5}
                                onChange={(page) => setPage(page)}  // set만!
                            />
                        </div>
                        <div className='flex width-fit margin-right-10 gap_10'>
                            <button className='btn white-space-nowrap' onClick={waybillInsert}>송장 등록</button>
                            <button className='btn white-space-nowrap' onClick={()=>{location.href='/component/sales/insert'}}>주문 등록</button>
                        </div>
                    </div>
                </div>
            </div>
            <ProductModal open={productModalOpen.bool} onClose={()=>setProductModalOpen({bool:false,idx:0})} sales_idx={productModalOpen.idx}/>
            <WaybillInsertModal open={waybillInsertModalOpen.bool} onClose={()=>setWaybillInsertModalOpen({bool:false,idxList:[]})} idxList={waybillInsertModalOpen.idxList} getSalesList={getSalesList}/>
        </div>
    );
};

export default SalesPage;