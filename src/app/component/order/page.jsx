'use client'
import React, {useEffect, useState} from 'react';
import Header from "@/app/header";
import axios from "axios";
import SearchProductModal from "@/app/component/modal/SearchProductModal";

const OrderPage = () => {

    const [products, setProducts] = useState([]);
    const [openSearchProductModal, setOpenSearchProductModal] = useState(false);
    const [selectProduct, setSelectProduct] = useState({});
    const [row,setRow] = useState(3);
    const [key,setKey] = useState(0);

    useEffect(()=>{

    },[])

    const getProducts = async () => {
        const {data} = await axios.post(`http://localhost:8080/product/list`, {search: products})
    }

    const inputProduct = (e) => {
        let {name, value} = e.target;
        setProducts((prev)=>({
            ...prev,
            [name]:value})
        );
    }

    // 모달 상품 선택 함수
    const selectModal = (product) => {
        setSelectProduct((prev)=>({
            ...prev,
            [key]:product,
        }));
    }

    return (
        <div>
            <Header/>
            <div className='wrap page-background'>
                <div className='margin-0-200 margin-bottom-20'>
                    <div className='text-align-left order-head-text'>
                        발주서 입력
                    </div>
                </div>
                <div className='back-ground-white margin-0-200 padding-30 width-auto flex back-radius flex-direction-col margin'>
                    <div className='flex'>
                        <div className='flex flex-direction-col margin-bottom-20'>
                            <div className='flex align-center gap_15'>
                                <div className='max-width-80 white-space-nowrap'>담당자</div>
                                <div><input type='text'/></div>
                            </div>
                            <div className='flex align-center gap_15'>
                                <div className='max-width-80 white-space-nowrap'>거래처</div>
                                <div><input type='text'/></div>
                            </div>
                            <div className='flex align-center gap_15'>
                                <div className='max-width-80 white-space-nowrap'>입고 창고</div>
                                <div><input type='text'/></div>
                            </div>
                            <div className='flex align-center gap_15'>
                                <div className='max-width-80 white-space-nowrap'>날짜</div>
                                <div><input type='text'/></div>
                            </div>
                        </div>
                        <div></div>
                    </div>
                    <div className='margin-y-20'>
                        <div>발주 품목</div>
                        <table className='order-table'>
                            <thead>
                                <tr>
                                    <th><input type='checkbox'/>선택</th>
                                    <th>상품 코드</th>
                                    <th>상품 이름</th>
                                    <th>상품 옵션</th>
                                    <th>수량</th>
                                    <th>단가</th>
                                    <th>공급가액</th>
                                    <th>부가세</th>
                                </tr>
                            </thead>
                            <tbody>
                            {Array.from({ length: row }, (_, i) => (
                                <tr key={i}>
                                    <td><input type='checkbox'/></td>
                                    <td><input className='order_table_input' type='text' name='product_idx' value={selectProduct[i]?.product_idx||''} onClick={()=>{setOpenSearchProductModal(true);setKey(i)}}/></td>
                                    <td><input className='order_table_input' type='text' name='product_idx' value={selectProduct[i]?.product_name||''} onClick={()=>{setOpenSearchProductModal(true);setKey(i)}}/></td>
                                    <td><input className='order_table_input' type='text'/></td>
                                    <td><input className='order_table_input' type='text'/></td>
                                    <td><input className='order_table_input' type='text'/></td>
                                    <td><input className='order_table_input' type='text'/></td>
                                    <td><input className='order_table_input' type='text'/></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className='back-ground-white margin-40-200 width-auto'>2</div>
            </div>
            <SearchProductModal open={openSearchProductModal} onClose={()=>setOpenSearchProductModal(false)} key={key} selectProduct={selectModal}/>
        </div>
    );
};

export default OrderPage;