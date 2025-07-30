'use client'
import React, {useEffect, useState} from 'react';
import axios from "axios";
import Header from "@/app/header";
import {IoIosArrowDown, IoIosArrowUp} from "react-icons/io";
import Pagination from "react-js-pagination";
import StockAdjustModal from "@/app/component/modal/StockAdjustModal";
import {useAlertModalStore} from "@/app/zustand/store";
import StockHistoryModal from "@/app/component/modal/StockHistoryModal";

const StockPage = () => {

    const {openModal} = useAlertModalStore();
    const [warehouseList, setWarehouseList] = useState([]);
    const [zoneList, setZoneList] = useState([]);
    const [showZone, setShowZone] = useState([]);
    const [selected, setSelected] = useState(null);
    const [group, setGroup] = useState([]);
    const [stockSumList, setStockSumList] = useState([]);
    const [checkboxChecked, setCheckboxChecked] = useState({});
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [stockAdjustModalOpen, setStockAdjustModalOpen] = useState({bool:false});
    const [stockHistoryModalOpen, setStockHistoryModalOpen] = useState({bool:false});
    const [lowStockPage, setLowStockPage] = useState(1);
    const [lowStockTotal, setLowStockTotal] = useState(0);
    const [lowStockList, setLowStockList] = useState([]);

    useEffect(() => {
        getWarehouseList();
        getZoneList();
        getStockSumList();
        getLowStockList();
    }, []);

    useEffect(() => {
        getStockSumList();
    },[selected,group,page]);

    useEffect(()=>{
        getLowStockList();
    },[lowStockPage])

    useEffect(()=>{
        setShowZone(Array(warehouseList.length).fill(false));
    },[warehouseList])

    const getLowStockList = async () => {
        const {data} = await axios.post('http://192.168.0.122/lowStock/list',{page:lowStockPage});
        console.log('lowStockList',data);
        setLowStockList(data.list);
        setLowStockTotal(data.total*10);
    }

    const getStockSumList = async () => {
        const {data} = await axios.post('http://192.168.0.122/stock/sum/list',{
            page:page,
            warehouse_idx: selected?.warehouse?.warehouse_idx || 0,
            zone_idx: selected?.zone?.zone_idx || 0,
            group : group,
        });
        console.log('stockSumList',data.list);
        setStockSumList(data.list);
        setTotal(data.total*10);
    }

    const getWarehouseList = async () => {
        const {data} = await axios.post('http://192.168.0.122/warehouse/list',{});
        console.log(data);
        setWarehouseList(data.list);
    }

    const getZoneList = async () => {
        const {data} = await axios.post('http://192.168.0.122/zone/list',{});
        console.log(data);
        setZoneList(data.list);
    }

    const onSelect = (some,bool) => {
        setCheckboxChecked({});
        if(bool){
            if(some.warehouse_idx === selected?.warehouse?.warehouse_idx){
                setSelected(null);
                setGroup(()=>(group.filter(f=>f !== 'warehouse')));
            } else {
                setSelected({warehouse:some,bool:true});
                if(!group.includes('warehouse')){
                    setGroup(prev=>([...prev,'warehouse']));
                }
            }
        }else{
            if(some.zone_idx === selected?.zone?.zone_idx){
                setSelected(null);
                setGroup(()=>(group.filter(f=>f !== 'zone')));
            } else {
                setSelected({zone:some,bool:false});
                if(!group.includes('zone')){
                    setGroup(prev=>([...prev,'zone']));
                }
            }
        }

    }

    const groupFilter = (value) => {
        setGroup(prev=>{
            if(group.includes(value)){
                return group.filter(f=>f !== value);
            } else {
                return [...prev,value];
            }
        })
        setCheckboxChecked({});
    }

    // 체크박스 전체 선택
    const allCheck = (checked) => {
        console.log(checkboxChecked);
        const updated = {};
        for (let i=0; i<stockSumList.length; i++) {
            updated[i] = {bool:checked,stock:stockSumList[i]};
            console.log(updated[i]);
        }
        setCheckboxChecked(updated);
    }

    useEffect(()=>{
        console.log(group);
    },[group])

    // 재고조정
    const stockAdjust = () => {
        if(Object.values(checkboxChecked)?.length === 0){
            openModal({
                svg: '❗',
                msg1: '조정 실패',
                msg2: '상품을 선택해주세요',
                showCancel: false,
            })
            return;
        }
        const filteredList = Object.values(checkboxChecked)?.filter(f=>f.bool === true);

        if(filteredList.length === 0){
            openModal({
                svg: '❗',
                msg1: '조정 실패',
                msg2: '상품을 선택해주세요',
                showCancel: false,
            })
            return;
        }

        if(filteredList.length > 1){
            openModal({
                svg: '❗',
                msg1: '조정 실패',
                msg2: '하나의 상품만 선택해주세요',
                showCancel: false,
            })
            return;
        }
        if(filteredList.length === 1){
            setStockAdjustModalOpen({bool:true,stock:filteredList[0].stock});
        }
    }

    // 재고 히스토리
    const stockHistory = () =>{
        if(Object.values(checkboxChecked)?.length === 0){
            openModal({
                svg: '❗',
                msg1: '조정 실패',
                msg2: '상품을 선택해주세요',
                showCancel: false,
            })
            return;
        }
        const filteredList = Object.values(checkboxChecked)?.filter(f=>f.bool === true);

        if(filteredList.length === 0){
            openModal({
                svg: '❗',
                msg1: '조정 실패',
                msg2: '상품을 선택해주세요',
                showCancel: false,
            })
            return;
        }

        if(filteredList.length > 1){
            openModal({
                svg: '❗',
                msg1: '조정 실패',
                msg2: '하나의 상품만 선택해주세요',
                showCancel: false,
            })
            return;
        }
        if(filteredList.length === 1){
            setStockHistoryModalOpen({bool:true,stock:filteredList[0].stock});
        }
    }

    return (
        <div>
            <div className='productPage wrap page-background'>
                <Header/>
                <h3 className="text-align-left margin-bottom-10 margin-30 margin-bottom-20">
                    <span className="product-header">재고 조회</span>
                </h3>
                <div className='order-list-back flex flex-direction-col'>
                    <div className='flex gap_10 margin-top-10 justify-right'>
                        <button className='btn width-fit' onClick={()=>groupFilter('option')}>옵션</button>
                        <button className='btn width-fit' onClick={()=>groupFilter('manufacture')}>제조일자</button>
                        <button className='btn width-fit' onClick={()=>groupFilter('expiration')}>유통기한</button>
                        <button className='btn width-fit' onClick={()=>groupFilter('warehouse')}>창고</button>
                        <button className='btn width-fit' onClick={()=>groupFilter('zone')}>구역</button>
                    </div>
                    <div className='flex gap_20'>
                        <div className='flex flex-25 flex-direction-col'>
                            <div className='border border-gray border-radius padding-30 margin-20 gap_15 flex flex-direction-col '>
                                {warehouseList?.map((warehouse, i) => (
                                    <div className='flex flex-direction-col text-align-left margin-left-5 white-space-nowrap warehouse-div' key={i}>
                                        <div className='flex cursor-pointer' onClick={()=>onSelect(warehouse,true)}>
                                            {warehouse.warehouse_name}
                                            {showZone[i] ? (
                                                <IoIosArrowUp
                                                    className='cursor-pointer'
                                                    onClick={(e)=>{
                                                        e.stopPropagation();
                                                        setShowZone(prev=>{
                                                            const copy = [...prev];
                                                            copy[i] = !copy[i];
                                                            return copy;
                                                        })
                                                    }}
                                                />
                                            ) : (
                                                <IoIosArrowDown
                                                    className='cursor-pointer'
                                                    onClick={(e)=>{
                                                        e.stopPropagation();
                                                        setShowZone(prev=>{
                                                            const copy = [...prev];
                                                            copy[i] = !copy[i];
                                                            return copy;
                                                        })
                                                    }}
                                                />
                                            )}
                                        </div>
                                        {showZone[i] && zoneList.filter(f=>f.warehouse_idx === warehouse.warehouse_idx).length > 0 && zoneList.filter(f=>f.warehouse_idx === warehouse.warehouse_idx).map((zone,i)=>(
                                            <div className='text-align-left zone-div'
                                                 style={{marginLeft:'80px',cursor:'pointer'}}
                                                 key={i}
                                                 onClick={()=>onSelect(zone,false)}
                                            >
                                                {zone.zone_name}
                                            </div>
                                        ))}
                                        {showZone[i] && zoneList.filter(f=>f.warehouse_idx === warehouse.warehouse_idx).length === 0 &&
                                            <div style={{fontSize:'17px',fontWeight:'normal',padding:'15px 30px'}}>지정된 구역이 없습니다</div>
                                        }

                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='margin-20'>
                            <div className='margin-bottom-10'>
                                <table className='checkbox-table text-overflow-table'>
                                    <thead>
                                        <tr>
                                            <th><input type='checkbox' checked={stockSumList.length > 0 && stockSumList.every((_, i) => checkboxChecked[i]?.bool === true)} onChange={e=>allCheck(e.target.checked)}/></th>
                                            <th>상품코드</th>
                                            <th>상품명</th>
                                            {group.includes('option')?<th>옵션명</th>:''}
                                            {group.includes('manufacture')?<th>제조일자</th>:''}
                                            {group.includes('expiration')?<th>유통기한</th>:''}
                                            {group.includes('warehouse')?<th>창고</th>:''}
                                            {group.includes('zone')?<th>구역</th>:''}
                                            <th>재고</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {stockSumList.map((stock,i)=>(
                                        <tr key={i}>
                                            <td><input type='checkbox' checked={checkboxChecked[i]?.bool ?? false} onChange={()=>setCheckboxChecked(prev=>({...prev,[i]:{bool:!checkboxChecked[i]?.bool,stock:stock}}))}/></td>
                                            <td>{stock.product_idx}</td>
                                            <td>{stock.product_name}</td>
                                            {group.includes('option')?<td>{typeof stock.product_option_idx === 'undefined'?'없음':stock.combined_name}</td>:''}
                                            {group.includes('manufacture')?<td>{typeof stock.manufacture === 'undefined'?'':stock.manufacture}</td>:''}
                                            {group.includes('expiration')?<td>{typeof stock.expiration === 'undefined'?'':stock.expiration}</td>:''}
                                            {group.includes('warehouse')?<td>{stock.warehouse_name}</td>:''}
                                            {group.includes('zone')?<td>{stock.zone_name}</td>:''}
                                            <td>{stock.stock_sum}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
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
                                <div className='flex justify-right width-fit gap_10'>
                                    <button className='btn cursor-pointer width-fit white-space-nowrap' onClick={stockHistory}>재고 내역</button>
                                    {group.includes('option') && group.includes('manufacture') && group.includes('expiration') && group.includes('warehouse') && group.includes('zone') &&
                                        <button className='btn cursor-pointer width-fit white-space-nowrap' onClick={stockAdjust}>재고 조정</button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <h3 className="text-align-left margin-bottom-10 margin-30 margin-bottom-20">
                    <span className="product-header">재고 부족 상품</span>
                </h3>
                <div className='order-list-back flex flex-direction-col'>
                    <div className='margin-bottom-10'>
                        <table className='text-overflow-table'>
                            <thead>
                                <tr>
                                    <th>상품 코드</th>
                                    <th>상품 이름</th>
                                    <th>옵션 이름</th>
                                    <th>최소 재고 수량</th>
                                    <th>현재 수량</th>
                                </tr>
                            </thead>
                            <tbody>
                            {lowStockList?.map((stock,i)=>(
                                <tr key={i}>
                                    <td>{stock.product_idx}</td>
                                    <td>{stock.product_name}</td>
                                    <td>{typeof stock.combined_name === 'undefined' ? '없음' : stock.combined_name}</td>
                                    <td>{stock.min_cnt}</td>
                                    <td>{stock.total_stock}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    {/* 페이지네이션 */}
                    <div className="product-pagination flex justify-content-between gap_5 margin-bottom-10">
                        <div className='flex justify-content-center'>
                            <Pagination
                                activePage={lowStockPage}
                                itemsCountPerPage={10}
                                totalItemsCount={lowStockTotal}
                                pageRangeDisplayed={5}
                                onChange={(page) => setLowStockPage(page)}  // set만!
                            />
                        </div>
                    </div>
                </div>
            </div>
            <StockAdjustModal open={stockAdjustModalOpen.bool} onClose={()=>setStockAdjustModalOpen({bool:false})} stock={stockAdjustModalOpen.stock} getStockSumList={getStockSumList}/>
            <StockHistoryModal open={stockHistoryModalOpen.bool} onClose={()=>setStockHistoryModalOpen({bool:false})} stock={stockHistoryModalOpen.stock}/>
        </div>
    );
};

export default StockPage;