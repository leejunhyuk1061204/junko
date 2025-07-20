'use client'
import React, {useEffect, useRef, useState} from 'react';
import Header from "@/app/header";
import {FaSearch} from "react-icons/fa";
import {FaRegCalendarCheck} from "react-icons/fa6";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import Pagination from "react-js-pagination";
import ProductModal from "@/app/component/modal/ProductModal";
import {useAlertModalStore, useDatePickerStore} from "@/app/zustand/store";
import axios from "axios";
import {format} from "date-fns";
import ShipmentUpdateModal from "@/app/component/modal/ShipmentUpdateModal";
import shipmentUpdateModal from "@/app/component/modal/ShipmentUpdateModal";

const sortOptions = [
    { id: 1, name: '최신순' , orderColumn : 'shipment_date', orderDirection: 'desc' },
    { id: 2, name: '오래된순' , orderColumn : 'shipment_date', orderDirection: 'asc' },
    { id: 3, name: '번호순' , orderColumn : 'shipment_idx', orderDirection: 'asc'}
];

const statusFilterList = [
    {idx:1, name:'전체'},
    {idx:2, name:'출고예정'},
    {idx:3, name:'출고완료'},
]

const shipmentStatusList = [
    {idx:1, name:'출고예정'},
    {idx:2, name:'출고완료'},
]

const ShipmentPage = () => {

    const {openModal,closeModal} = useAlertModalStore();
    const {openDatePicker, closeDatePicker} = useDatePickerStore();
    const [selectedDate, setSelectedDate] = useState({});
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedSort, setSelectedSort] = useState({ id: 1, name: '최신순' , orderColumn : 'shipment_date', orderDirection: 'desc' },);
    const [selectedStatus, setSelectedStatus] = useState({idx:1, name:'전체'});
    const [mode, setMode] = useState(null);
    const [statusClicked, setStatusClicked] = useState({});
    const statusRef = useRef({});
    const [checkboxChecked, setCheckboxChecked] = useState({});

    const [shipmentList, setShipmentList] = useState([]);
    const [productModalOpen, setProductModalOpen] = useState({bool:false,idx:0});
    const [shipmentUpdateModalOpen, setShipmentUpdateModalOpen] = useState({bool:false});

    useEffect(() => {
        getShipmentList();
    }, [selectedSort, selectedStatus, page, selectedDate]);

    // shipment 리스트 가져오기
    const getShipmentList = async(searchText='') => {
        const {data} = await axios.post('http://localhost:8080/shipment/list',{
            search:searchText,
            status:selectedStatus.name === '전체'?'':selectedStatus.name,
            orderColumn:selectedSort.orderColumn,
            orderDirection:selectedSort.orderDirection,
            page:1,
            shipment_date:selectedDate.selectDate||'',
            start_date:selectedDate.startDate||'',
            end_date:selectedDate.endDate||'',
        });
        console.log(data);
        setTotal(data.total*10);
        setShipmentList(data.list);
    }

    // 검색 엔터
    const searchEnter = (e)=>{
        if(e.keyCode === 13){
            getShipmentList(search);
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
        getShipmentList();
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
        for (let i=0; i<shipmentList.length; i++) {
            updated[i] = {bool:checked,idx:shipmentList[i].sales_idx};
            // console.log(updated[i]);
        }
        setCheckboxChecked(updated);
    }

    useEffect(() => {
        console.log('checkboxChecked',checkboxChecked);
    }, [checkboxChecked]);

    // datePicker 핸들러
    const handleDatePicker = () => {
        openDatePicker({
            mode:'single',
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
                            <button className='btn white-space-nowrap height-50' onClick={()=>{getShipmentList();setSearch('')}}><FaSearch /></button>
                        </div>
                        {/* 기간 설정 */}
                        <div className='width-fit cursor-pointer'><button className='btn' onClick={()=>handleDatePicker()}><FaRegCalendarCheck /> 출고일자</button></div>
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
                                {/*<th><input type='checkbox' checked={shipmentList?.length > 0 && shipmentList?.every((_, i) => checkboxChecked[i]?.bool === true)} onChange={e=>allCheck(e.target.checked)}/></th>*/}
                                <th>출고번호</th>
                                <th>주문번호</th>
                                <th>송장번호</th>
                                <th>담당자</th>
                                <th>출고창고</th>
                                <th>출고날짜</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shipmentList?.map((shipment,i)=>(
                                <tr key={i} className='cursor-pointer' onClick={()=>setProductModalOpen({bool:true,idx:shipment.sales_idx})}>
                                    {/*<td><input type='checkbox' checked={checkboxChecked[i]?.bool ?? false} onChange={()=>setCheckboxChecked(prev=>({...prev,[i]:{bool:!checkboxChecked[i]?.bool,idx:shipment.shipment_idx}}))}/></td>*/}
                                    <td>{shipment.shipment_idx}</td>
                                    <td>{shipment.sales_idx}</td>
                                    <td>{shipment.waybill_idx}</td>
                                    <td>{shipment.user_name}</td>
                                    <td>{shipment.warehouse_name}</td>
                                    <td>{shipment.shipment_date}</td>
                                    <td className={`position-relative cursor-pointer ${statusClicked[i] ? 'show-dropdown':''} `} onClick={(e)=>{e.stopPropagation();changeStatusClicked(i)}} ref={el => (statusRef.current[i] = el)}>
                                        {shipment.status}
                                        {statusClicked[i] && shipment.status === '출고예정'
                                            ? (
                                                <ul className="listBox-option">
                                                    {shipmentStatusList.filter(f=>f.name !== shipment.status)?.map((sl) => (
                                                        <li
                                                            key={sl.idx}
                                                            className="listBox-option-item margin-0"
                                                            onClick={()=>setShipmentUpdateModalOpen({bool:true,shipment:shipment})}
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
                    </div>
                </div>
            </div>
            <ProductModal open={productModalOpen.bool} onClose={()=>setProductModalOpen({bool:false,idx:0})} sales_idx={productModalOpen.idx}/>
            <ShipmentUpdateModal open={shipmentUpdateModalOpen.bool} onClose={()=>setShipmentUpdateModalOpen({bool:false,shipment:null})} shipment={shipmentUpdateModalOpen.shipment} getShipmentList={getShipmentList}/>
        </div>
    );
};

export default ShipmentPage;