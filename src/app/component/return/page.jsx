'use client'
import React, {useEffect, useRef, useState} from 'react';
import Header from "@/app/header";
import {FaSearch} from "react-icons/fa";
import {FaRegCalendarCheck} from "react-icons/fa6";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import Pagination from "react-js-pagination";
import {useAlertModalStore, useDatePickerStore} from "@/app/zustand/store";
import axios from "axios";
import ProductModal from "@/app/component/modal/ProductModal";
import {format} from "date-fns";
import ReturnHandleModal from "@/app/component/modal/ReturnHandleModal";

const sortOptions = [
    { id: 1, name: '최신순' , orderColumn : 'receive_date', orderDirection: 'desc' },
    { id: 2, name: '오래된순' , orderColumn : 'receive_date', orderDirection: 'asc' },
    { id: 3, name: '번호순' , orderColumn : 'return_receive_idx', orderDirection: 'asc'}
];

const returnStatusList = [
    {idx:1, name:'반품예정'},
    {idx:2, name:'반품완료'},
]
const statusFilterList = [
    {idx:1, name:'전체'},
    {idx:2, name:'반품예정'},
    {idx:3, name:'반품완료'},
]

const ReturnPage = () => {

    const {openDatePicker, closeDatePicker} = useDatePickerStore();
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [selectedSort, setSelectedSort] = useState({ id: 1, name: '최신순' , orderColumn : 'receive_date', orderDirection: 'desc' });
    const [search, setSearch] = useState('');
    const [statusClicked, setStatusClicked] = useState({});
    const [selectedStatus, setSelectedStatus] = useState({idx:1, name:'전체'});
    const statusRef = useRef({});
    const [selectedDate, setSelectedDate] = useState({});

    const [returnList, setReturnList] = useState([]);
    const [productModalOpen, setProductModalOpen] = useState({bool:false,idx:0});
    const [returnHandleModalOpen, setReturnHandleModalOpen] = useState({bool:false,return:null});

    // 초기화
    const listInitialize = () => {
        setPage(1);
        setSearch('');
        setSelectedSort({ id: 1, name: '최신순' , orderColumn : 'receive_date', orderDirection: 'desc' });
        setSelectedStatus({idx:1, name:'전체'});
        setSelectedDate({});
    }

    useEffect(() => {
        getReturnList();
    }, [page,selectedSort,selectedStatus,selectedDate]);

    // 반품입고 리스트 가져오기
    const getReturnList = async () =>{
        const {data} = await axios.post('http://localhost:8080/returnReceive/list',{
            page:page,
            orderColumn : selectedSort.orderColumn,
            orderDirection: selectedSort.orderDirection,
            search:search,
            status:selectedStatus.name==='전체'?'':selectedStatus.name,
            receive_date: 'receiveDate' in selectedDate ?  selectedDate.receiveDate : '',
            start_date: 'startDate' in selectedDate ?  selectedDate.startDate : '',
            end_date: 'endDate' in selectedDate ?  selectedDate.endDate : ''
        });
        console.log(data);
        setReturnList(data.list);
        setTotal(data.total*10);
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

    // 검색 엔터
    const searchEnter = (e)=>{
        if(e.keyCode === 13){
            getReturnList();
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
    }


    // 스테이터스 변경
    const changeStatusClicked = (i) => {
        setStatusClicked(prev=>({
            ...prev,
            [i]:!prev[i]
        }));
    }

    // datePicker 핸들러
    const handleDatePicker = () => {
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
                        receiveDate:format(value,'yyyy-MM-dd')
                    })
                }
                closeDatePicker();
            })
        })
    }

    return (
        <div className='productPage wrap page-background'>
            <Header/>
            <h3 className="text-align-left margin-bottom-10 margin-30">
                <span className="product-header">반품 입고 목록 / 상세 조회</span>
            </h3>
            <div className="order-list-back">
                <div className="flex gap_10 align-center justify-right margin-bottom-10">
                    {/* 검색 */}
                    <div className='width-fit flex gap_15 align-center'>
                        <input style={{padding:'1.5px'}} type='text' placeholder='검색어를 입력해주세요' value={search} onChange={e=>setSearch(e.target.value)} onKeyUp={e=>searchEnter(e)}/>
                        <button className='btn white-space-nowrap height-50' onClick={()=>{getReturnList();setSearch('')}}><FaSearch /></button>
                    </div>
                    {/* 기간 설정 */}
                    <div className='width-fit cursor-pointer'><button className='btn' onClick={handleDatePicker}><FaRegCalendarCheck /></button></div>
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
                    <div className="select-container" style={{marginRight:0}}>
                        <Listbox value={selectedSort} onChange={handleSortChange}>
                            <ListboxButton className="select-btn" style={{marginRight:0}}>{selectedSort.name}</ListboxButton>
                            <ListboxOptions className="select-option">
                                {sortOptions.map(option => (
                                    <ListboxOption key={option.id} value={option} className="select-option-item">
                                        {option.name}
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </Listbox>
                    </div>
                    <button className='btn width-fit' style={{padding:'8px 15px'}} onClick={listInitialize}>초기화</button>
                </div>
                <table className={'text-overflow-table'}>
                    <thead>
                    <tr>
                        <th>입고번호</th>
                        <th>송장번호</th>
                        <th>상품</th>
                        <th>입고창고</th>
                        <th>입고일자</th>
                        <th>담당자</th>
                        <th>진행 상태</th>
                    </tr>
                    </thead>
                    <tbody>
                        {returnList.map((r,i)=>(
                            <tr key={i}>
                                <td>{r.return_receive_idx}</td>
                                <td>{r.return_waybill_idx}</td>
                                <td className='cursor-pointer' onClick={()=>setProductModalOpen({bool:true,idx:r.claim_idx})}>{r.product_name}{r.product_cnt > 1 ? ` 외 ${r.product_cnt-1}개`:''}</td>
                                <td>{r.warehouse_name}</td>
                                <td>{r.receive_date}</td>
                                <td>{r.user_name}</td>
                                <td className={`position-relative cursor-pointer ${statusClicked[i] && r.status === '반품예정' ? 'show-dropdown' : ''}`} onClick={(e)=>{e.stopPropagation();changeStatusClicked(i)}} ref={el => (statusRef.current[i] = el)}>
                                    {r.status}
                                    {statusClicked[i]
                                    && r.status === '반품예정'
                                        ? (
                                            <ul className="listBox-option">
                                                {returnStatusList?.filter(f=>f.name !== r.status)?.map((rs) => (
                                                    <li
                                                        key={rs.idx}
                                                        className="listBox-option-item margin-0"
                                                        onClick={()=>{
                                                            setReturnHandleModalOpen({bool:true,return:r});
                                                        }}
                                                    >
                                                        {rs.name}
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
                    <div>
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
            <ProductModal open={productModalOpen.bool} onClose={()=>setProductModalOpen({bool:false,idx:0})} claim_idx={productModalOpen.idx}/>
            <ReturnHandleModal open={returnHandleModalOpen.bool} onClose={()=>setReturnHandleModalOpen({bool:false,return:null})} return_receive={returnHandleModalOpen.return} getReturnList={getReturnList}/>
        </div>
    );
};

export default ReturnPage;