'use client'
import React, {useEffect, useState} from 'react';
import Header from "@/app/header";
import axios from "axios";
import SearchProductModal from "@/app/component/modal/SearchProductModal";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import {useAlertModalStore, useDatePickerStore} from "@/app/zustand/store";
import {format} from "date-fns";

const OrderPage = () => {

    const {openModal,closeModal} = useAlertModalStore();
    const {openDatePicker} = useDatePickerStore();
    const [openSearchProductModal, setOpenSearchProductModal] = useState(false);
    const [order, setOrder] = useState({});
    const [orderProducts, setOrderProducts] = useState([]);
    const [orderPlan, setOrderPlan] = useState([]);
    const [planProduct, setPlanProduct] = useState([]);
    const [planIdxList, setPlanIdxList] = useState([]);
    const [planOptionList, setPlanOptionList] = useState([]);
    const [row,setRow] = useState(3);
    const [planRow, setPlanRow] = useState(2);
    const [key,setKey] = useState(0);
    const [warehouse, setWarehouse] = useState([]);
    const [warehouseSearch, setWarehouseSearch] = useState('');
    const [warehouseName, setWarehouseName] = useState('');
    const [warehouseFocused, setWarehouseFocused] = useState(false);
    const [custom, setCustom] = useState([]);
    const [customSearch, setCustomSearch] = useState('');
    const [customName, setCustomName] = useState('');
    const [customFocused, setCustomFocused] = useState(false);
    const [user, setUser] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [userName, setUserName] = useState('');
    const [userFocused, setUserFocused] = useState(false);


    useEffect(() => {
        const filteredOrderProducts = orderProducts.filter(
            (item, index, self) =>
                index === self.findIndex((t) => t.product_idx === item.product_idx)
        );
        setPlanIdxList(filteredOrderProducts);
    }, [orderProducts]);

    useEffect(() => {
        getWarehouse();
        getCustom();
        getUser();
    },[])

    // user 리스트
    const getUser = async (searchText='') => {
        const {data} = await axios.post('http://localhost:8080/users/list',{page:1,user_name:searchText});
        setUser(data.list);
        console.log('user',data);
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setUserName(userSearch);
            console.log('유저 검색');
        }, 300);

        return () => clearTimeout(timer);
    }, [userSearch]);

    useEffect(() => {
        getUser(userName);
    }, [userName]);


    // 거래처 리스트
    const getCustom = async (searchText='') => {
        const {data} = await axios.get(`http://localhost:8080/custom/list?start=0&size=10&search=${searchText}`);
        setCustom(data);
        console.log(data);
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setCustomName(customSearch);
            console.log('거래처 검색');
        }, 300);

        return () => clearTimeout(timer);
    }, [customSearch]);

    useEffect(() => {
        getCustom(customName);
    }, [customName]);

    // 창고 리스트
    const getWarehouse = async (searchText='') => {
        const {data} = await axios.post('http://localhost:8080/warehouse/list',{page:1,warehouse_name:searchText});
        setWarehouse(data.list);
        console.log('창고 불러오기');
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setWarehouseName(warehouseSearch);
            console.log('창고 검색');
        }, 300);

        return () => clearTimeout(timer);
    }, [warehouseSearch]);

    useEffect(() => {
        getWarehouse(warehouseName);
    }, [warehouseName]);

    const inputOrderProduct = (i,e) => {
        let {name, value} = e.target;
        setOrderProducts((prev)=>{
            const updated = [...prev];
            const item = updated[i] || {};
            updated[i] = {
                ...item,
                [name]: value
            };
            return updated;
        })
    }

    // 모달 상품 선택 함수
    const selectModal = (product) => {
        setOrderProducts((prev) => {
            const updated = [...prev];
            updated[key] = product;
            return updated;
        });
    };

    const planProductChange = (i,p,option) =>{
        console.log(p);
        setPlanProduct((prev) => {
            const updated = [...prev];
            updated[i] = {
                ...updated[i],
                product_idx: p.product_idx,
                product_name: p.product_name,
                product_option_idx: option
                    ? (p.product_option_idx ?? null)
                    : (p.product_option_idx ?? null),
                combined_name: option
                    ? (p.combined_name ?? '옵션 없음')
                    : (p.combined_name ?? '옵션 없음')
            };
            return updated;
        })

        if(!option){
            const filteredOrderProducts = orderProducts
                .filter(item => item.product_idx === p.product_idx)
                .map(item => ({
                    ...item,
                    product_option_idx: item.product_option_idx ?? null,
                    combined_name: item.combined_name ?? '옵션 없음'
                }));
            setPlanOptionList(prev => {
                const updated = [...prev];
                updated[i] = filteredOrderProducts;
                return updated;
            });

            console.log('filteredOrderProducts',filteredOrderProducts);

            if (filteredOrderProducts.length > 0) {
                setPlanProduct(prev => {
                    const updated = [...prev];
                    updated[i].combined_name = filteredOrderProducts[0].combined_name; // 첫 번째 옵션 설정
                    return updated;
                });
            }
        }
    }

    const planProductCnt = (i,e) => {
        const { value } = e.target;
        console.log(value);
        setPlanProduct((prev) => {
            const updated = [...prev];
            const item = updated[i] || {};
            updated[i] = {
                ...item,
                order_cnt: value
            };
            return updated;
        });
    }

    const openDatePickerModal = (i) =>{
        console.log(i);
        openDatePicker({
            index:i,
            initialDate: new Date(),
            onConfirm:(index,date)=>{
                setOrderPlan((prev) => {
                    const updated = [...prev];
                    const item = updated[i] || {};
                    updated[i] = {
                        ...item,
                        delivery_date: format(date,'yyyy-MM-dd'),
                    };
                    return updated;
                });
            }
        });
    }

    const deleteOrderProduct = (idx) => {
        setOrderProducts((prev) => prev.filter((_, i) => i !== idx));
        if(row>3){
            setRow(row-1);
        }
    };

    const deletePlanProduct = (idx) => {
        setPlanProduct((prev) => prev.filter((_, i) => i !== idx));
        if(planRow>2){
            setPlanRow(planRow-1);
        }
    };

    const orderChange = (field,value) =>{
        setOrder({...order, [field]: value});
    }


    function generateProductKey(product) {
        return product.product_option_idx != null
            ? `${product.product_idx}-${product.product_option_idx}`
            : `${product.product_idx}`;
    }

    function mergeOrderPlanByDate(orderPlan) {
        const mergedMap = {};

        orderPlan.forEach(plan => {
            const date = plan.delivery_date;

            if (!mergedMap[date]) {
                mergedMap[date] = {
                    delivery_date: date,
                    planProduct: [...plan.planProduct]
                };
            } else {
                mergedMap[date].planProduct.push(...plan.planProduct);
            }
        });

        return Object.values(mergedMap);
    }

    const insertOrder = async() => {
        // 1. tempId 매핑
        const productKeyToTempId = {};
        const enrichedOrderProducts = orderProducts.map((op, idx) => {
            const key = generateProductKey(op);
            const tempId = `p${idx + 1}`;
            productKeyToTempId[key] = tempId;
            return { ...op, tempId };
        });

        // 2. orderPlan 가공 - planProduct에 tempId 부여
        const rawPlan = [];

        planProduct.forEach((prod, idx) => {
            const key = generateProductKey(prod);
            const tempId = productKeyToTempId[key];
            const order_cnt = prod.order_cnt;
            const delivery_date = orderPlan[idx]?.delivery_date;

            if (tempId && delivery_date) {
                rawPlan.push({
                    delivery_date,
                    planProduct: [{ productTempId: tempId, order_cnt:Number(order_cnt || 0) }],
                });
            }
        });

        // 3. ✅ 날짜 기준으로 plan 병합
        const mergedOrderPlan = mergeOrderPlanByDate(rawPlan);

        const insertData = {
            order: {
                custom_idx: order?.custom?.custom_idx,
                warehouse_idx: order?.warehouse?.warehouse_idx,
                user_idx: order?.user?.user_idx
            },
            orderProduct: enrichedOrderProducts,
            orderPlan: mergedOrderPlan
        };

        console.log('🔥 최종 insertData:', insertData);

        // 유효성 검사
        const result = validateOrderPlan(insertData);
        if (!result.valid) {
            openModal({
                svg: '❌',
                msg1: '수량 확인',
                msg2: result.message,
                showCancel: false,
                onConfirm:()=>{
                    closeModal();
                }
            })
            return false;
        }

        // axios.post('/api/insert', insertData);
        openModal({
            svg: '❓',
            msg1: '발주 등록 확인',
            msg2: '발주를 등록 하시겠습니까?',
            showCancel: true,
            onConfirm: async() => {
                const {data} = await axios.post('http://localhost:8080/order/full/insert',insertData)
                console.log(data);
                closeModal();
                setTimeout(()=>{
                    try {
                        if (data.success) {
                            openModal({
                                svg: '✔',
                                msg1: '등록 완료',
                                msg2: '발주가 등록되었습니다.',
                                showCancel: false,
                            });
                        } else {
                            openModal({
                                svg: '❗',
                                msg1: '등록 실패',
                                msg2: '발주 등록에 실패했습니다.',
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

    };

// 4. 발주수량과 납품계획 수량 일치 검증
    function validateOrderPlan(data) {
        const productTotals = {};

        // 각 날짜의 planProduct 순회해서 tempId별로 수량 누적
        data.orderPlan.forEach(plan => {
            plan.planProduct.forEach(p => {
                const tempId = p.productTempId;
                const cnt = Number(p.order_cnt || 0);

                if (!productTotals[tempId]) {
                    productTotals[tempId] = 0;
                }

                productTotals[tempId] += cnt;
            });
        });

        // 발주 제품 수량과 누적 수량 비교
        for (const op of data.orderProduct) {
            const expected = Number(op.order_cnt || 0);
            const actual = productTotals[op.tempId] || 0;

            if (expected !== actual) {
                return {
                    valid: false,
                    message: `tempId ${op.tempId}: 발주 수량 ${expected} ≠ 납품 계획 총합 ${actual}`
                };
            }
        }

        return { valid: true };
    }

    const today = new Date();
    const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
    return (
        <div>
            <Header/>
            <div className='wrap page-background'>
                <div className='margin-0-200 margin-bottom-20'>
                    <div className='text-align-left order-head-text'>
                        발주서 입력
                    </div>
                </div>
                <div className='back-ground-white margin-0-200 padding-30 width-auto flex back-radius flex-direction-col margin min-width-400'>
                    <div className='flex gap_20 justify-content-between'>
                        <div className='flex flex-direction-col margin-bottom-20  justify-content-left gap_5' style={{flex:'0 0 30%'}}>
                            <div className='order-product-text margin-bottom-10 text-align-left'>발주 정보</div>
                            <div className='flex align-center gap_15'>
                                <div className='max-width-80 white-space-nowrap width'>담당자</div>
                                <div>
                                    <div className="listBox-container">
                                        <input
                                            type="text"
                                            className="width-100 border rounded"
                                            placeholder="담당자 검색"
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            onFocus={() => {
                                                setUserFocused(true);
                                                getUser(userSearch);
                                            }}
                                            onBlur={() => setTimeout(() => setUserFocused(false), 120)}
                                        />
                                        {userFocused ? (<>
                                            {user?.length > 0 && (
                                                <ul className="listBox-option">
                                                    {user?.map((u) => (
                                                        <li
                                                            key={u.user_idx}
                                                            onClick={() => {
                                                                orderChange('user', u);
                                                                setUserSearch(u.user_name);
                                                            }}
                                                            className="listBox-option-item margin-0"
                                                        >
                                                            {u.user_name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {user?.length === 0 && userSearch && (
                                                <div className="position-absolute z-10 width-100 back-ground-white border px-2 py-1 h-over-sky">검색 결과 없음</div>
                                            )}
                                        </>):('')}
                                    </div>
                                </div>
                            </div>
                            <div className='flex align-center gap_15'>
                                <div className='max-width-80 white-space-nowrap'>거래처</div>
                                <div>
                                    <div className="listBox-container">
                                        <input
                                            type="text"
                                            className="width-100 border rounded"
                                            placeholder="거래처 검색"
                                            value={customSearch}
                                            onChange={(e) => setCustomSearch(e.target.value)}
                                            onFocus={() => {
                                                setCustomFocused(true);
                                                getCustom(customSearch);
                                            }}
                                            onBlur={() => setTimeout(() => setCustomFocused(false), 120)}
                                        />
                                        {customFocused ? (<>
                                            {custom?.length > 0 && (
                                                <ul className="listBox-option">
                                                    {custom?.map((c) => (
                                                        <li
                                                            key={c.custom_idx}
                                                            onClick={() => {
                                                                orderChange('custom', c);
                                                                setCustomSearch(c.custom_name);
                                                            }}
                                                            className="listBox-option-item margin-0"
                                                        >
                                                            {c.custom_name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {custom?.length === 0 && customSearch && (
                                                <div className="position-absolute z-10 width-100 back-ground-white border px-2 py-1 h-over-sky">검색 결과 없음</div>
                                            )}
                                        </>):('')}
                                    </div>
                                </div>
                            </div>
                            <div className='flex align-center gap_15'>
                                <div className='max-width-80 white-space-nowrap'>입고 창고</div>
                                <div>
                                    <div className="listBox-container">
                                        <input
                                            type="text"
                                            className="width-100 border rounded"
                                            placeholder="창고 검색"
                                            value={warehouseSearch}
                                            onChange={(e) => setWarehouseSearch(e.target.value)}
                                            onFocus={() => {
                                                setWarehouseFocused(true);
                                                getWarehouse(warehouseSearch);
                                            }}
                                            onBlur={() => setTimeout(() => setWarehouseFocused(false), 120)}
                                        />
                                        {warehouseFocused ? (<>
                                        {warehouse?.length > 0 && (
                                            <ul className="listBox-option">
                                                {warehouse?.map((w) => (
                                                    <li
                                                        key={w.warehouse_idx}
                                                        onClick={() => {
                                                            orderChange('warehouse', w);
                                                            setWarehouseSearch(w.warehouse_name);
                                                        }}
                                                        className="listBox-option-item margin-0"
                                                    >
                                                        {w.warehouse_name}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {warehouse?.length === 0 && warehouseSearch && (
                                            <div className="position-absolute z-10 width-100 back-ground-white border px-2 py-1 h-over-sky">검색 결과 없음</div>
                                        )}
                                        </>):('')}
                                    </div>
                                </div>
                            </div>
                            <div className='flex align-center gap_15'>
                                <div className='max-width-80 white-space-nowrap'>날짜</div>
                                <div>{formattedDate}</div>
                            </div>
                        </div>
                        <div style={{flex:'0 0 60%'}}>
                            <div className='order-product-text margin-bottom-20 text-align-left'>납품 계획</div>
                            <table className='plan-table'>
                                <thead>
                                <tr>
                                    <th><input type='checkbox'/></th>
                                    <th>상품 코드</th>
                                    <th>상품 이름</th>
                                    <th>상품 옵션</th>
                                    <th>상품 수량</th>
                                    <th>납품 일자</th>
                                    <th>삭제</th>
                                </tr>
                                </thead>
                                <tbody>
                                {Array.from({ length: planRow }, (_, i) => (
                                    <tr key={i}>
                                        <td><input type='checkbox'/></td>
                                        <td><div className="listBox-container flex justify-content-center">
                                            <Listbox value={planProduct} onChange={(p)=>planProductChange(i,p,false)}>
                                                <ListboxButton className="listBox-btn">{planProduct[i]?.product_idx || '상품 선택'}</ListboxButton>
                                                <ListboxOptions className="listBox-option">
                                                    {planIdxList?.length === 0 && <ListboxOption value='' className="listBox-option-item">상품 없음</ListboxOption>}
                                                    {planIdxList?.length > 0 && planIdxList.map((option,idx) => (
                                                        <ListboxOption key={idx} value={option} className="listBox-option-item">
                                                            {option.product_idx}
                                                        </ListboxOption>
                                                    ))}
                                                </ListboxOptions>
                                            </Listbox>
                                        </div></td>
                                        <td><input className='order_table_input' type='text' value={planProduct[i]?.product_name||''} readOnly={true}/></td>
                                        <td><div className="listBox-container flex justify-content-center">
                                            <Listbox value={planProduct[i]} onChange={(p)=>planProductChange(i,p,true)}>
                                                <ListboxButton className="listBox-btn">{planProduct[i]?.combined_name || '옵션 선택'}</ListboxButton>
                                                <ListboxOptions className="listBox-option">
                                                    {planOptionList[i]?.length > 0 && planOptionList[i].map((option,idx) => (
                                                        <ListboxOption key={idx} value={option} className="listBox-option-item">
                                                            {option.combined_name}
                                                        </ListboxOption>
                                                    ))}
                                                </ListboxOptions>
                                            </Listbox>
                                        </div></td>
                                        <td><input className='order_table_input' type='text' name='order_cnt' value={planProduct[i]?.order_cnt} onChange={e=>planProductCnt(i,e)}/></td>
                                        <td>
                                            <div><input className='cursor-pointer width-100' value={orderPlan[i]?.delivery_date || '날짜 선택'} onClick={()=>openDatePickerModal(i)}/></div>
                                        </td>
                                        <td><button className='order-delete-btn cursor-pointer' onClick={()=>deletePlanProduct(i)}>[삭제]</button></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            <div className='flex justify-right margin-y-20'><button className='btn' onClick={()=>setPlanRow(planRow+1)}>계획 추가</button></div>
                        </div>
                    </div>
                    <div className='margin-y-20 '>
                        <div className='order-product-text margin-bottom-10 text-align-left'>발주 품목</div>
                        <table className='order-table text-overflow-ellipsis'>
                            <thead>
                                <tr>
                                    <th><input type='checkbox'/></th>
                                    <th>상품 코드</th>
                                    <th>상품 이름</th>
                                    <th>상품 옵션</th>
                                    <th>단가</th>
                                    <th>수량</th>
                                    <th>공급가액</th>
                                    <th>부가세</th>
                                    <th>삭제</th>
                                </tr>
                            </thead>
                            <tbody>
                            {Array.from({ length: row }, (_, i) => (
                                <tr key={i}>
                                    <td><input type='checkbox' /></td>
                                    <td><input className='order_table_input' type='text' name='product_idx' value={orderProducts[i]?.product_idx||''} onClick={()=>{setOpenSearchProductModal(true);setKey(i)}} readOnly={true}/></td>
                                    <td><input className='order_table_input' type='text' name='product_name' value={orderProducts[i]?.product_name||''} onClick={()=>{setOpenSearchProductModal(true);setKey(i)}} readOnly={true}/></td>
                                    <td><input className='order_table_input' type='text' name='product_option' value={orderProducts[i]?.combined_name||'없음'} onClick={()=>{setOpenSearchProductModal(true);setKey(i)}} readOnly={true}/></td>
                                    <td><input className='order_table_input' type='text' name='purchase_price' value={orderProducts[i]?.purchase_price||''} onClick={()=>{setOpenSearchProductModal(true);setKey(i)}} readOnly={true}/></td>
                                    <td><input className='order_table_input' type='text' name='order_cnt' value={orderProducts[i]?.order_cnt||''} onChange={(e)=>inputOrderProduct(i,e)}/></td>
                                    <td><input className='order_table_input' type='text' value={orderProducts[i]?.order_cnt * orderProducts[i]?.purchase_price || ''} readOnly={true}/></td>
                                    <td><input className='order_table_input' type='text' value={orderProducts[i]?.order_cnt * orderProducts[i]?.purchase_price * 0.1 || ''} readOnly={true}/></td>
                                    <td><button className='order-delete-btn cursor-pointer' onClick={()=>deleteOrderProduct(i)}>[삭제]</button></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <div className='flex justify-right margin-y-20'><button className='btn' onClick={()=>setRow(row+1)}>상품 추가</button></div>
                    </div>
                    <div><button className='btn' onClick={insertOrder}>발주 등록</button></div>
                </div>
            </div>
            <SearchProductModal open={openSearchProductModal} onClose={()=>setOpenSearchProductModal(false)} orderProduct={selectModal}/>
        </div>
    );
};

export default OrderPage;