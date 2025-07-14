'use client'

import Header from '@/app/header';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from "react-js-pagination";
import { useRouter } from 'next/navigation';

const sortOptions = [
    { id: 'latest', name: '최신순' },
    { id: 'oldest', name: '오래된순' }
];

export default function OrderList() {
    const [checkedItems, setCheckedItems] = useState([]);
    const [isAllChecked, setIsAllChecked] = useState(false);
    const [orders, setOrders] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([{ id: 0, name: '전체' }]);
    const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
    const [selectedCategory, setSelectedCategory] = useState({ id: 0, name: '전체' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;
    const router = useRouter();

    useEffect(() => {
        fetchCategoryOptions();
    }, []);

    useEffect(() => {
        fetchOrders(currentPage, selectedSort.id, selectedCategory.id);
    }, [selectedSort.id, selectedCategory.id, currentPage]);

    useEffect(() => {
        setCheckedItems([]);
        setIsAllChecked(false);
    }, [orders]);

    // 정렬 변경 시
    const handleSortChange = (sort) => {
        setSelectedSort(sort);
        setCurrentPage(1);
    };

    // 카테고리 변경 시
    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setCurrentPage(1);
    };

    const handleAllCheck = (e) => {
        const checked = e.target.checked;
        setIsAllChecked(checked);
        if (checked) {
            setCheckedItems(orders.map(o => o.product_idx));
        } else {
            setCheckedItems([]);
        }
    };

    const handleCheckItem = (e, product_idx) => {
        const checked = e.target.checked;
        if (checked) {
            setCheckedItems(prev => [...prev, product_idx]);
        } else {
            setCheckedItems(prev => prev.filter(id => id !== product_idx));
        }
    };

    const fetchCategoryOptions = async () => {
        try {
            const res = await axios.get('http://localhost:8080/cate/list');
            if (res.data?.list) {
                const options = res.data.list.map(c => ({
                    id: c.category_idx,
                    name: c.category_name
                }));
                setCategoryOptions([{ id: 0, name: '전체' }, ...options]);
            }
        } catch (err) {
            console.error('카테고리 목록 불러오기 실패:', err);
        }
    };

    const fetchOrders = async (page, sortId, categoryId) => {
        try {
            const response = await axios.post('http://localhost:8080/product/list', {
                search: '',
                category: selectedCategory.id,
                sort: selectedSort.id === 'latest' ? '' : 'price_asc',
                page: page,
                size: pageSize
            }, {
                headers: {
                    Authorization: sessionStorage.getItem('token')
                }
            });

            if (response.data) {
                setOrders(response.data.list || []);
                setTotalCount(response.data.total || 0);
            }
        } catch (err) {
            console.error('상품 목록 조회 실패:', err);
        }
    };

    const goToNewProduct = () => {
        router.push('./product/insert');
    };

    const goToDetail = (productIdx) => {
        router.push(`./product/detail/${productIdx}`);
    };

    const handleDelSelected = async () => {
        if (checkedItems.length === 0) {
            alert('삭제할 상품을 선택해주세요.');
            return;
        }

        if (!window.confirm('선택한 상품을 삭제하시겠습니까?')) return;

        try {
            const token = sessionStorage.getItem('token');
            console.log('삭제 요청 전 토큰:', token);

            // 병렬 삭제 요청
            const deleteResults = await Promise.all(
                checkedItems.map(product_idx =>
                    axios.put(`http://localhost:8080/product/${product_idx}/del`, null, {
                        headers: { Authorization: token }
                    }).then(res => {
                        console.log(`상품 ${product_idx} 응답:`, res.data);
                        return res;
                    })
                )
            );

            // 성공 필터링
            const successCount = deleteResults.filter(res => res.data?.success).length;
            alert(`${successCount}개 상품 삭제 완료`);

            // 삭제 후 리스트 갱신
            fetchOrders(currentPage, selectedSort.id, selectedCategory.id);
        } catch (err) {
            console.error('상품 삭제 실패:', err);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };


    return (
        <div className='productPage wrap page-background'>
            <Header />
            <div className="product-list-back">
                <h3 className="text-align-left margin-bottom-10">
                    <span className="product-header">상품 목록 / 상세 조회</span>
                </h3>

                <div className="flex gap_10 align-center justify-right margin-bottom-10">
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

                    {/* 카테고리 */}
                    <div className="select-container">
                        <Listbox value={selectedCategory} onChange={handleCategoryChange}>
                            <ListboxButton className="select-btn">{selectedCategory.name}</ListboxButton>
                            <ListboxOptions className="select-option">
                                {categoryOptions.map(option => (
                                    <ListboxOption key={option.id} value={option} className="select-option-item">
                                        {option.name}
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </Listbox>
                    </div>
                </div>

                {/* 상품 테이블 */}
                <table className="product-list margin-bottom-10">
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={isAllChecked}
                                    onChange={handleAllCheck}
                                />
                            </th>
                            <th>NO.</th>
                            <th>품목코드</th>
                            <th>품목명</th>
                            <th>규격</th>
                            <th>입고 단가</th>
                            <th>판매 단가</th>
                            <th>할인율</th>
                            <th>카테고리</th>
                            <th>이미지</th>
                        </tr>
                    </thead>
                    <tbody>
                    {orders.map((order, index) => (
                        <tr key={order.product_idx}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={checkedItems.includes(order.product_idx)}
                                    onChange={(e) => handleCheckItem(e, order.product_idx)}
                                />
                            </td>
                            <td>{index + 1}</td>
                            <td>{order.product_idx}</td>
                            <td className="product-clickable" onClick={() => goToDetail(order.product_idx)}>
                                {order.product_name}
                            </td>
                            <td>{order.product_standard}</td>
                            <td>{order.purchase_price.toLocaleString()}원</td>
                            <td>{order.selling_price.toLocaleString()}원</td>
                            <td>{order.discount_rate}%</td>
                            <td>{order.category_name || '기타'}</td>
                            <td>-</td>
                        </tr>
                    ))}

                    {/* 빈 줄 채우기 */}
                    {orders.length < pageSize &&
                        Array.from({ length: pageSize - orders.length }).map((_, i) => (
                            <tr key={`empty-${i}`}>
                                <td colSpan={11} style={{ height: '45px' }}>&nbsp;</td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>

                {/* 페이지네이션 */}
                <div className="product-pagination flex justify-content-center gap_5">
                    <Pagination
                        activePage={currentPage}
                        itemsCountPerPage={pageSize}
                        totalItemsCount={totalCount}
                        pageRangeDisplayed={5}
                        onChange={(page) => setCurrentPage(page)}  // set만!
                    />
                </div>

                <div className="flex justify-left gap_10">
                    <button className="product-btn" onClick={goToNewProduct}>
                        상품 등록
                    </button>
                    <button className="product-btn-del" onClick={handleDelSelected}>
                        삭제
                    </button>
                </div>
            </div>
        </div>
    );
}
