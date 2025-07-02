'use client'
import React, {useEffect, useState} from 'react';
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";

const sampleCategory = [
    { id:1, name:'과자' },
    { id:2, name:'의류' },
    { id:3, name:'음료' },
    { id:4, name:'전자제품' },
    { id:5, name:'기타' },
]

const ExamModal = ({open,val,onClose,productList}) => {

    const [allSelect, setAllSelect] = useState(false);
    const [selectColumn, setSelectColumn] = useState(false);
    const [updateColumns,setUpdateColumns]= useState([]);
    const [category,setCategory] = useState(sampleCategory);
    const [products,setProducts] = useState(productList);
    const [product,setProduct] = useState({
        product_name:'',
        product_standard:'',
        purchase_price:0,
        selling_price:0,
        discount_rate:0,
        category:'',
    });

    useEffect(() => {
        setProducts(productList);
    }, [productList]);

    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        setAllSelect(false);
        setSelectColumn(false);
        setUpdateColumns([]);
        onClose();
    };

    // 상품 입력
    const inputProduct = (e) =>{
        const {name, value} = e.target;
        setProduct({
            ...product,
            [name]: value
        });

    }

    // 수정항목 선택
    const makeUpdateColumns = (col) => {
        if(updateColumns.includes(col)){
            const filteredList = updateColumns.filter((item) => item !== col);
            setUpdateColumns(filteredList);
        } else {
            setUpdateColumns((prev)=>[...prev, col]);
        }
    }

    //
    const allColumns = () => {
        if(!allSelect) {
            let col = ['product_name', 'product_standard', 'purchase_price', 'selling_price', 'discount_rate', 'category'];
            setAllSelect(true);
            setUpdateColumns(col);
        } else {
            setAllSelect(false);
            setUpdateColumns([]);
        }
    }

    // 선택된 컬럼이 어떤 컬럼인지
    const whatIsColumn = (column) => {
        switch (column) {
            case 'product_name':
                return '상품명';
            case 'product_standard':
                return '규격';
            case 'purchase_price':
                return '입고단가';
            case 'selling_price':
                return '판매단가';
            case 'discount_rate':
                return '할인율';
            case 'category':
                return '카테고리';
        }
    }

    // 상품 수정
    const updateProduct = (e,col,idx) =>{
        const {value} = e.target;
        setProducts(prev=>
            prev.map((item)=>
                item.product_idx === idx?
                    {...item,[col]:value} : item
            )
        );
    }

    if (!open) return null;

    return (
        <div
            className="modal_overlay"
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.3)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div
                className="modal_content"
                style={{
                    background: '#F4F6FA',
                    borderRadius: '10px',
                    padding: '40px 30px',
                    minWidth: '320px',
                    position: 'relative',
                    width: '900px'
                }}
            >
                <button
                    style={{
                        position: 'absolute',
                        right: 20,
                        top: 20,
                        background: 'none',
                        border: 'none',
                        fontSize: '3rem',
                        cursor: 'pointer'
                    }}
                    onClick={handleClose}
                >
                    ×
                </button>
                <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>{val==='regist'? '상품 등록' : '상품 수정' }</h3>
                <>

                    {/* 탭 내용 */}
                    <div className='back-shadow back-radius' style={{ display: 'flex',flexDirection:'column', gap: '16px', background:'#fff', padding:'20px'}}>
                        {/*등록일 때*/}
                        {val === 'regist' && (
                        <>
                            <div className='flex white-space-nowrap align-center gap_20'>
                                <p className='content_text width-100'>상품명</p>
                                <input type='text' name='product_name' placeholder='상품명을 입력하세요' value={product.product_name} onChange={inputProduct}/>
                            </div>
                            <div className='flex white-space-nowrap align-center gap_20'>
                                <p className='content_text width-100'>규격</p>
                                <input type='text' name='product_standard' placeholder='규격을 입력하세요' value={product.product_standard} onChange={inputProduct}/>
                            </div>
                            <div className='flex white-space-nowrap align-center gap_20'>
                                <p className='content_text width-100'>입고단가</p>
                                <input type='text' name='purchase_price'  value={product.purchase_price} onChange={inputProduct}/>
                            </div>
                            <div className='flex white-space-nowrap align-center gap_20'>
                                <p className='content_text width-100'>판매단가</p>
                                <input type='text' name='selling_price' value={product.selling_price} onChange={inputProduct}/>
                            </div>
                            <div className='flex white-space-nowrap align-center gap_20'>
                                <p className='content_text width-100'>할인율</p>
                                <input type='text' name='discount_rate' value={product.discount_rate} onChange={inputProduct}/>
                            </div>
                            <div className='flex white-space-nowrap align-center gap_20'>
                                <p className='content_text width-100'>카테고리</p>
                                <select className='product-modal-select' name='category' onChange={inputProduct}>
                                    {category.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                        )}
                        {/*수정일 때*/}
                        {val === 'update' && (
                            <>
                                {products && products.length === 0 ? (
                                    <p>선택된 상품이 없습니다</p>
                                ):
                                !selectColumn ?
                                <table>
                                    <thead>
                                        <tr>
                                            <th>수정 항목</th>
                                            <th>전체 선택<input type='checkbox' checked={allSelect} onChange={()=>allColumns()}/></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>상품명</td>
                                            <td><input type='checkbox' checked={updateColumns.includes('product_name')} onChange={()=>makeUpdateColumns('product_name')}/></td>
                                        </tr>
                                        <tr>
                                            <td>규격</td>
                                            <td><input type='checkbox' checked={updateColumns.includes('product_standard')} onChange={()=>makeUpdateColumns('product_standard')}/></td>
                                        </tr>
                                        <tr>
                                            <td>입고단가</td>
                                            <td><input type='checkbox' checked={updateColumns.includes('purchase_price')} onChange={()=>makeUpdateColumns('purchase_price')}/></td>
                                        </tr>
                                        <tr>
                                            <td>판매단가</td>
                                            <td><input type='checkbox' checked={updateColumns.includes('selling_price')} onChange={()=>makeUpdateColumns('selling_price')}/></td>
                                        </tr>
                                        <tr>
                                            <td>할인율</td>
                                            <td><input type='checkbox' checked={updateColumns.includes('discount_rate')} onChange={()=>makeUpdateColumns('discount_rate')}/></td>
                                        </tr>
                                        <tr>
                                            <td>카테고리</td>
                                            <td><input type='checkbox' checked={updateColumns.includes('category')} onChange={()=>makeUpdateColumns('category')}/></td>
                                        </tr>
                                    </tbody>
                                </table>
                                    :
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>상품코드</th>
                                            {updateColumns.map((c,idx) => (
                                                <th key={idx}>{whatIsColumn(c)}</th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {products.map(p => (
                                            <tr>
                                                <td>{p.product_idx}</td>
                                                {updateColumns.map((c,idx) => {
                                                    return (
                                                    <td key={idx}><input type='text'
                                                                         value={p[c] ?? ''} name={c}
                                                                         onChange={(e)=>updateProduct(e,c,p.product_idx)}/>
                                                    </td>
                                                    )})}
                                            </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                }
                            </>
                        )}
                    </div>
                </>
                <div style={{marginTop: '20px'}}>
                    {val ==='regist' &&
                        <button className='product-modal-btn cursor-pointer' onClick={handleClose}>등록</button>
                    }
                    {val ==='update' &&(
                        products && products?.length > 0 && !selectColumn ?
                        <button className='product-modal-btn cursor-pointer' onClick={()=>setSelectColumn(true)}>선택</button>
                            :
                        <button className='product-modal-btn cursor-pointer' onClick={handleClose}>수정</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExamModal;