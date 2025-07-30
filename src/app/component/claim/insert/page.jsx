'use client'
import React, {useEffect} from 'react';
import Header from "@/app/header";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import axios from "axios";


const ClaimInsertPage = () => {

    const [claimForm, setClaimForm] = React.useState({});
    const [returnProductForm, setReturnProductForm] = React.useState([]);
    const [row, setRow] = React.useState(2);

    const changeClaimForm = (e) => {
        const {name, value} = e.target;
        setClaimForm(prev=>({
            ...prev,
            [name]: value,
        }));
    }

    const changeReturnProductForm = (i,e) => {
        const {name, value} = e.target;
        setReturnProductForm(prev=>{
            const copy = [...prev];
            const item = copy[i] || {};
            copy[i] = {
                ...item,
                [name]: value,
            }
            return copy;
        })
    }

    const insertClaim = async() => {
        const {data} = await axios.post('http://192.168.0.122/claim/insert', {claim:claimForm, products:returnProductForm});
        console.log(data);
        if(data.success){
            location.href='/component/claim';
        } else {
            alert("등록 실패");
        }
    }

    useEffect(() => {
        console.log('claimForm',claimForm);
    }, [claimForm]);

    useEffect(() => {
        console.log('returnProductForm',returnProductForm);
    },[returnProductForm])

    return (
        <div>
            <div className='productPage wrap page-background'>
                <Header/>
                <h3 className="text-align-left margin-bottom-10 margin-30">
                    <span className="product-header">클레임 등록</span>
                </h3>
                <div className='order-list-back margin-bottom-20 flex flex-direction-col gap_5'>
                    <div className='margin-0-200 width-auto'>
                        <div style={{fontSize:'18px', fontWeight:'bold'}}><h3 className='text-align-left margin-left-5'>반품 정보</h3></div>
                        <div className='flex text-align-center'>
                            <div className='flex align-center flex-25 justify-content-center'><p>주문번호</p></div>
                            <div><input type='text' placeholder='주문번호를 입력해주세요' name='sales_idx' value={claimForm?.sales_idx||''} onChange={(e)=>changeClaimForm(e)}/></div>
                        </div>
                        <div className='flex text-align-center margin-bottom-20'>
                            <div className='flex align-center flex-25 justify-content-center'><p>타입</p></div>
                            <div>
                                <select style={{border:'1px solid lightgray'}} className='width-100 border-radius' name='type' value={claimForm.type} onChange={(e)=>changeClaimForm(e)}>
                                    <option>선택</option>
                                    <option>반품</option>
                                    <option>교환</option>
                                </select>
                            </div>
                        </div>
                        <div className='flex text-align-center margin-bottom-20'>
                            <div className='flex align-center flex-25 justify-content-center'><p>반품사유</p></div>
                            <div><textarea style={{minHeight:'400px',border:'1px solid lightgray', width:'100%'}} className='border-radius' name='claim_reason' onChange={(e)=>changeClaimForm(e)}>{claimForm.claim_reason}</textarea></div>
                        </div>
                        <div className='flex text-align-center flex-direction-col gap_20'>
                            <div style={{fontSize:'18px', fontWeight:'bold'}}><h3 className='text-align-left margin-left-5'>반품 품목</h3></div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>상품코드</th>
                                        <th>상품옵션</th>
                                        <th>상품수량</th>
                                        <th>교환옵션</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {Array.from({length:row},(_,i)=>(
                                    <tr key={i}>
                                        <td><input type='text' name='product_idx' value={returnProductForm?.[i]?.product_idx||''} onChange={(e)=>changeReturnProductForm(i,e)}/></td>
                                        <td><input type='text' name='product_option_idx' value={returnProductForm?.[i]?.product_option_idx||''} onChange={(e)=>changeReturnProductForm(i,e)}/></td>
                                        <td><input type='text' name='return_cnt' value={returnProductForm?.[i]?.return_cnt||''} onChange={(e)=>changeReturnProductForm(i,e)}/></td>
                                        <td><input type='text' name='exchange_option' value={returnProductForm?.[i]?.exchange_option||''} onChange={(e)=>changeReturnProductForm(i,e)}/></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            <div className='flex justify-right'><button className='btn width-fit' onClick={()=>setRow(row+1)}>상품 추가</button></div>
                            <div className='flex justify-content-center margin-bottom-20'><button className='btn width-fit' onClick={insertClaim}>클레임 등록</button></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClaimInsertPage;