'use client'

import Header from '@/app/header';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from "react-js-pagination";
import { useRouter } from 'next/navigation';
import { TbSearch } from "react-icons/tb";
import DocsModal from "@/app/component/product/productModal/DocsModal";

const sortOptions = [
    { id: 'latest', name: '최신순' },
    { id: 'oldest', name: '오래된순' }
];

export default function OrderList() {
    const [checkedItems, setCheckedItems] = useState([]);
    const [isAllChecked, setIsAllChecked] = useState(false);
    const [orders, setOrders] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([{ id: 0, name: '전체' }]);
    const [selectedCategory, setSelectedCategory] = useState({ id: 0, name: '전체' });
    const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [searchText, setSearchText] = useState('');
    const [showDocsModal, setShowDocsModal] = useState(false);
    const [docProductIdx, setDocProductIdx] = useState(null);

    const openDocsModal = (productIdx) => {
        setDocProductIdx(productIdx);
        setShowDocsModal(true);
    };

    const closeDocsModal = () => {
        setShowDocsModal(false);
        setDocProductIdx(null);
    };

    useEffect(() => {
        fetchCategoryOptions();
    }, []);

    useEffect(() => {
        if (selectedCategory?.id !== undefined) {
            fetchOrders(currentPage, selectedSort.id, selectedCategory.id, searchText); // ← 검색어 추가
        }
    }, [selectedSort.id, selectedCategory?.id, currentPage, searchText]);

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
                setCategoryOptions(options);
                setSelectedCategory(options[0]);
            }
        } catch (err) {
            console.error('카테고리 목록 불러오기 실패:', err);
        }
    };

    const fetchOrders = async (page, sortId, categoryId, search = '') => {
        const token = sessionStorage.getItem('token')
        const url = 'http://localhost:8080/product/list'

        const payload = {
            category_idx: categoryId || 0,
            page,
            size: 10,
            sort: sortId,
            search: search.trim()
        }

        try {
            const res = await axios.post(url, payload, {
                headers: { Authorization: token }
            })

            const list = res.data?.data?.list || res.data?.list || []
            const total = res.data?.data?.total || res.data?.total || list.length

            setOrders(list)
            setTotalCount(total)
        } catch (err) {
            console.error('상품 목록 조회 실패:', err)
        }
    }



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

    const handleSearch = () => {
        setCurrentPage(1);
        fetchOrders(1, selectedSort.id, selectedCategory?.id, searchText);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
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
                    {/* 검색 입력창 */}
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="상품명 또는 품목코드"
                        className="product-input-search"
                    />
                    <button className="product-search-btn" onClick={handleSearch}><TbSearch className="product-search-icon"/></button>

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
                            <ListboxButton className="select-btn">
                                {selectedCategory ? selectedCategory.name : '카테고리 선택'}
                            </ListboxButton>
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
                            NO.<input
                            type="checkbox"
                            checked={isAllChecked}
                            onChange={handleAllCheck}
                        />
                        </th>
                        <th>품목코드</th>
                        <th>품목명</th>
                        <th>규격</th>
                        <th>입고 단가</th>
                        <th>판매 단가</th>
                        <th>할인율</th>
                        <th>카테고리</th>
                        <th>문서</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orders.map((order, index) => (
                        <tr key={order.product_idx}>
                            <td>
                                {index + 1}.
                                <input
                                    type="checkbox"
                                    checked={checkedItems.includes(order.product_idx)}
                                    onChange={(e) => handleCheckItem(e, order.product_idx)}
                                />
                            </td>
                            <td>{order.product_idx}</td>
                            <td className="product-clickable" onClick={() => goToDetail(order.product_idx)}>
                                {order.product_name}
                            </td>
                            <td>{order.product_standard}</td>
                            <td>{order.purchase_price.toLocaleString()}원</td>
                            <td>{order.selling_price.toLocaleString()}원</td>
                            <td>{order.discount_rate}%</td>
                            <td>{order.category_name || '기타'}</td>
                            <td>
                                <button className="product-clickable" onClick={() => openDocsModal(order.product_idx)}>
                                    문서
                                </button>
                            </td>
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
                <div className="product-pagination flex justify-content-center gap_5 margin-bottom-20">
                    <Pagination
                        activePage={currentPage}
                        itemsCountPerPage={pageSize}
                        totalItemsCount={totalCount}
                        pageRangeDisplayed={5}
                        onChange={(page) => setCurrentPage(page)}  // set만!
                    />
                </div>

                <div className="flex justify-left gap_10 position-relative">
                    <div className="product-dropdown-wrap">
                        <button className="product-btn" onClick={() => setIsDropdownOpen(prev => !prev)}>
                            상품 등록 ▾
                        </button>
                        {isDropdownOpen && (
                            <p className="product-dropdown-content">
                                <button onClick={() => router.push('./product/insert')}>1개 상품 등록</button>
                                <button onClick={() => router.push('./product/insertCsv')}>CSV 대량 등록</button>
                            </p>
                        )}
                    </div>
                    <button className="product-btn-del" onClick={handleDelSelected}>
                        선택 삭제
                    </button>
                </div>
            </div>
            {showDocsModal && (
                <DocsModal productIdx={docProductIdx} onClose={closeDocsModal} />
            )}
        </div>
);
}
