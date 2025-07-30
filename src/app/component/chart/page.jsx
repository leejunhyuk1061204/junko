'use client'

import Header from "@/app/header";
import '../../globals.css';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, ArcElement } from 'chart.js';
import {useAlertModalStore, useCategoryStore, useChartStore, useDatePickerStore} from "@/app/zustand/store";
import React, {useEffect, useRef, useState} from "react";
import format from "date-fns/format";
import {FaRegCalendarCheck} from "react-icons/fa6";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import {Chart} from "chart.js/auto";
import FilterBar from '../chart/FilterBar';
import {useRouter} from "next/navigation";
import axios from "axios";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ArcElement);
const tabList = [
    '매출 분석',
    '재고/입출고 분석',
    '주문/반품 분석',
    '정산/마진 분석',
];
const donutColors = [
    '#7FB7E5', // 하늘
    '#F6DA9C', // 노랑
    '#C98DDA', // 보라
    '#90D5CE', // 연청록
    '#F2B183', // 살구
    '#F4A1A1', // 핑크
    '#A3D9A5', // 연두
    '#9E91E7', // 연보라
];
const chartColors = [
    '#748FFC', '#F783AC', '#63E6BE', '#FF922B', '#A9E34B', '#BE4BDB',
    '#4DABF7', '#FFD43B', '#69DB7C', '#E64980', '#9775FA', '#FFA94D'
];

const prodColors = [
    '#845EC2', '#D65DB1', '#FF6F91', '#FF9671',
    '#FFC75F', '#F9F871', '#008F7A', '#0089BA'
];

export default function SalesChart() {

    const router = useRouter();
    const [activeTab, setActiveTab] = useState('매출 분석');
    const [startDate, setStartDate] = useState(new Date());
    const [selectedParent, setSelectedParent] = useState(null);
    const [selectedSub, setSelectedSub] = useState(null);
    const [isEmpty, setIsEmpty] = useState(false);

    const {openDatePicker, closeDatePicker} = useDatePickerStore();
    const {openModal, closeModal} = useAlertModalStore();
    const {chartData, fetchChart, loading} = useChartStore();
    const {parentCategories, subCategories, fetchCategories} = useCategoryStore();

    const monthlySalesRef = useRef(null);
    const parentCateRef = useRef(null);
    const subCateRef = useRef(null);
    const inventoryTurnoverRef = useRef(null);
    const inOutProdRef = useRef(null);
    const orderTrendRef = useRef(null);
    const orderStatusRef = useRef(null);
    const returnRateRef = useRef(null);
    const marginRateRef = useRef(null);
    const netProfitRef = useRef(null);
    const productChartRef = useRef(null);

    const filteredSubCategories = selectedParent
        ? subCategories.filter(sub => sub.category_parent === selectedParent.category_idx)
        : [];

    useEffect(() => {
        const token = (typeof window !== "undefined" ? sessionStorage.getItem("token") : "");
        if (!token) {
            openModal({
                svg: '❗',
                msg1: '해당 페이지 접근 불가',
                msg2: '로그인 후 이용해주세요.',
                showCancel: false,
                onConfirm: () => router.push('./login'),
            });
            return;
        }

        fetchCategories();
        fetchChart({
            categoryIdx: null,
            startDate: null,
            endDate: null,
        });
    }, []);

    // 카테고리 변경 시
    useEffect(() => {
        const categoryIdx = selectedSub?.category_idx ?? selectedParent?.category_idx ?? null;
        fetchChart({categoryIdx});
    }, [selectedParent, selectedSub]);

    // 탭 바뀌면 카테고리 초기화
    useEffect(() => {
        setSelectedParent(null);
        setSelectedSub(null);
    }, [activeTab]);

    // 전년도 대비 매출 (막대)
    useEffect(() => {
        if (!chartData.getMonthlySalesYoY?.length) return;
        setIsEmpty(chartData.getMonthlySalesYoY?.length === 0);

        setTimeout(() => {
            const labels = Array.from({ length: 12 }, (_, i) => `${(i + 1).toString().padStart(2, '0')}월`);
            const monthMap = new Map(chartData.getMonthlySalesYoY.map(item => [item.month.slice(5), item]));
            const thisYear = labels.map(m => monthMap.get(m.slice(0, 2))?.sales_this_year || 0);
            const lastYear = labels.map(m => monthMap.get(m.slice(0, 2))?.sales_last_year || 0);

            const ctx = document.getElementById("monthlySales");
            if (!ctx) return;

            monthlySalesRef.current?.destroy();

            monthlySalesRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {
                            label: '올해 매출',
                            data: thisYear,
                            backgroundColor: '#D98E04',
                            borderRadius: 4,
                            barThickness: 28,
                        },
                        {
                            label: '작년 매출',
                            data: lastYear,
                            backgroundColor: '#A3A380',
                            borderRadius: 4,
                            barThickness: 28,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {grid: {display: false}},
                        y: {beginAtZero: true},}
                }
            })
        }, 0);
    }, [activeTab, chartData.getMonthlySalesYoY]);

    // 상위 카테고리별 매출 (도넛)
    useEffect(() => {
        setIsEmpty(chartData.getSalesByCategory?.length === 0);

        setTimeout(() => {
            const parentData = chartData.getSalesByCategory?.filter(item => !item.category_parent);

            if (!parentData?.length) return;
            const ctx = document.getElementById("parentCate");
            if (!ctx) return;

            parentCateRef.current?.destroy();

            parentCateRef.current = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: parentData.map(d => d.category_name),
                    datasets: [{
                        data: parentData.map(d => d.sales),
                        backgroundColor: donutColors.slice(0, parentData.length),
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                boxWidth: 14,
                                padding: 12
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function (ctx) {
                                    const value = ctx.raw.toLocaleString();
                                    const label = ctx.label || '';
                                    return `${label}: ${value}원`;
                                }
                            }
                        }
                    }
                }
            });
        }, 0);
    }, [activeTab, chartData.getSalesByCategory]);

    // 상품별 매출 (막대)
    useEffect(() => {
        setIsEmpty(chartData.getSalesByProduct?.length === 0);

        setTimeout(() => {
            const productData = chartData.getSalesByProduct || [];

            if (!productData?.length) return;
            const ctx = document.getElementById("productSalesChart");
            if (!ctx) return;

            productChartRef.current?.destroy();

            productChartRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: productData.map(d => d.product_name),
                    datasets: [{
                        label: '상품 매출',
                        data: productData.map(d => d.sales),
                        backgroundColor: prodColors.slice(0, productData.length),
                        barThickness: 28
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {callback: value => value.toLocaleString()},
                            grid: {display: false}
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: (ctx) => `${ctx.label}: ${ctx.raw.toLocaleString()}원`
                            }
                        }
                    }
                }
            });
        }, 0);
    }, [selectedParent, chartData.getSalesByProduct]);

    // 재고 회전율 (가로 막대)
    useEffect(() => {
        if (activeTab !== '재고/입출고 분석') return;
        setIsEmpty(chartData.getInventoryTurnoverStats?.length === 0);

        setTimeout(() => {
            const turnoverData = chartData.getInventoryTurnoverStats || [];

            if (!turnoverData?.length) return;
            const ctx = document.getElementById("inventoryTurnover");
            if (!ctx) return;

            inventoryTurnoverRef.current?.destroy();

            const labels = turnoverData.map(item => item.product_name);
            const currentStock = turnoverData.map(item => item.current_stock);
            const totalSales = turnoverData.map(item => item.total_sales);
            const turnoverRatio = turnoverData.map(item => item.turnover_ratio);

            inventoryTurnoverRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {label: '현재 재고 수', data: currentStock, backgroundColor: '#74c0fc',},
                        {label: '최근 30일 출고 수', data: totalSales, backgroundColor: '#40c057',},
                        {label: '회전율', data: turnoverRatio, backgroundColor: '#fab005',}
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                        x: {beginAtZero: true},
                        y: {ticks: {autoSkip: false}}
                    },
                    plugins: {
                        legend: {position: 'bottom'},
                        tooltip: {
                            callbacks: {
                                label: ctx =>`${ctx.dataset.label}: ${ctx.raw}`
                            }
                        }
                    }
                }
            });
        }, 0);
    }, [activeTab, chartData.getInventoryTurnoverStats]);

    // 입출고 현황 (라인)
    useEffect(() => {
        if (activeTab !== '재고/입출고 분석') return;
        setIsEmpty(chartData.getInOutProduct?.length === 0);

        setTimeout(() => {
            const inOutData = chartData.getInOutProduct || [];

            if (!inOutData?.length) return;
            const ctx = document.getElementById("inOutProd");
            if (!ctx) return;

            inOutProdRef.current?.destroy();

            const labels = inOutData.map(item => item.product_name);
            const receiveCnt = inOutData.map(item => item.total_receive_cnt || 0);
            const shipmentCnt = inOutData.map(item => item.total_shipment_cnt || 0);

            inOutProdRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [
                        {
                            label: '입고',
                            data: receiveCnt,
                            borderColor: '#228be6',
                            backgroundColor: '#228be6',
                            fill: false,
                            tension: 0.3
                        },
                        {
                            label: '출고',
                            data: shipmentCnt,
                            borderColor: '#fa5252',
                            backgroundColor: '#fa5252',
                            fill: false,
                            tension: 0.3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {y: {beginAtZero: true}},
                    plugins: {legend: {position: 'bottom'},}
                }
            });
        }, 0);
    }, [activeTab, chartData.getInOutProduct]);

    // 주문/반품 (라인)
    useEffect(() => {
        if (activeTab !== '주문/반품 분석') return;
        setIsEmpty(chartData.getRecentOrderStats?.length === 0);

        setTimeout(() => {
            const orderStatData = chartData.getRecentOrderStats || [];

            if (!orderStatData?.length) return;
            const ctx = document.getElementById("orderTrend");
            if (!ctx) return;

            orderTrendRef.current?.destroy();

            const labels = orderStatData.map(item => item.date.slice(5));
            const orderCnt = orderStatData.map(item => item.order_cnt);
            const cancelCnt = orderStatData.map(item => item.cancel_cnt);

            orderTrendRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [
                        {
                            label: '주문 수',
                            data: orderCnt,
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: '#ff6384',
                            fill: true,
                            tension: 0.3
                        },
                        {
                            label: '취소 수',
                            data: cancelCnt,
                            backgroundColor: 'rgba(255, 159, 64, 0.2)',
                            borderColor: '#ffa94d',
                            fill: true,
                            tension: 0.3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {legend: {position: 'top'},},
                    scales: {y: {beginAtZero: true}},
                }
            });
        }, 0);
    }, [activeTab, chartData.getRecentOrderStats]);

    // 주문 상태 분포 (막대)
    useEffect(() => {
        if (activeTab !== '주문/반품 분석') return;
        setIsEmpty(chartData.getOrderStatus?.length === 0);

        setTimeout(() => {
            const orderStatusData = chartData.getOrderStatus || [];

            if (!orderStatusData?.length) return;
            const ctx = document.getElementById("orderStatus");
            if (!ctx) return;

            orderStatusRef.current?.destroy();

            const labels = Array.from({ length: 12 }, (_, i) => `${(i + 1).toString().padStart(2, '0')}월`);
            const monthMap = new Map(labels.map(label => [label, {complete: 0, shipping: 0, shipped: 0, cancelled: 0}]));
            orderStatusData.forEach(item => {
                if (!item?.payment_date) return;
                const [, mm] = item.payment_date.split('-');
                const key = `${mm}월`;
                const curr = monthMap.get(key);
                if (curr) {
                    curr.complete += item.complete || 0;
                    curr.shipping += item.shipping || 0;
                    curr.shipped += item.shipped || 0;
                    curr.cancelled += item.cancelled || 0;
                }
            });

            const complete = labels.map(m => monthMap.get(m).complete);
            const shipping = labels.map(m => monthMap.get(m).shipping);
            const shipped = labels.map(m => monthMap.get(m).shipped);
            const cancelled = labels.map(m => monthMap.get(m).cancelled);

            orderStatusRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        { label: '결제완료', data: complete, backgroundColor: '#4dabf7' },
                        { label: '배송중', data: shipping, backgroundColor: '#9775fa' },
                        { label: '배송완료', data: shipped, backgroundColor: '#51cf66' },
                        { label: '결제취소', data: cancelled, backgroundColor: '#ff6b6b' },
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {legend: {position: 'bottom'},},
                    scales: {
                        x: {stacked: true},
                        y: {stacked: true, beginAtZero: true},
                    }
                }
            });
        }, 0);
    }, [activeTab, chartData.getOrderStatus]);

    // 반품률 (막대+라인)
    useEffect(() => {
        if (activeTab !== '주문/반품 분석') return;
        setIsEmpty(chartData.returnProduct?.length === 0);

        setTimeout(() => {
            const returnRateData = chartData.returnProduct || [];

            if (!returnRateData?.length) return;
            const ctx = document.getElementById("returnRate");
            if (!ctx) return;

            returnRateRef.current?.destroy();

            const labels = returnRateData.map(item => item.product_name);
            const values = returnRateData.map(item => item.return_cnt);

            returnRateRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {
                            label: '반품 수',
                            data: values,
                            backgroundColor: '#69db7c',
                            barThickness: 40,
                            order: 2
                        },
                        {
                            type: 'line',
                            label: '반품 추이',
                            data: values,
                            borderColor: '#228be6',
                            tension: 0.3,
                            fill: false,
                            order: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {legend: {position: 'bottom'},},
                    scales: {y: {beginAtZero: true},}
                }
            });
        }, 0);
    }, [activeTab, chartData.returnProduct]);

    // 마진율 (라인)
    useEffect(() => {
        if (activeTab !== '정산/마진 분석') return;
        setIsEmpty(chartData.getProductMarginStats?.length === 0);

        setTimeout(() => {
            const marginData = chartData.getProductMarginStats || [];

            if (!marginData?.length) return;

            const ctx = document.getElementById("marginRate");
            if (!ctx) return;

            marginRateRef.current?.destroy();
            const labels = Array.from({ length: 12 }, (_, i) => `${(i + 1).toString().padStart(2, '0')}월`);

            // category_name 기준으로 월별 데이터 정리
            const categoryMap = {};
            marginData.forEach(item => {
                const cat = item.category_name;
                const month = Number(item.month.slice(5)) - 1;
                if (!categoryMap[cat]) {
                    categoryMap[cat] = Array(12).fill(0);
                }
                categoryMap[cat][month] = item.margin_rate ?? 0;
            });

            const datasets = Object.entries(categoryMap).map(([category, data], idx) => ({
                label: category,
                data,
                borderColor: prodColors[idx % prodColors.length],
                backgroundColor: prodColors[idx % prodColors.length],
                tension: 0.3,
                fill: false,
                pointRadius: 4,
            }));

            marginRateRef.current = new Chart(ctx, {
                type: 'line',
                data: {labels, datasets},
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {legend: {position: 'bottom'},},
                    tooltip: {mode: 'index', intersect: false},
                    scales: {
                        x: {grid: {display: false}},
                        y: {beginAtZero: true, title: {display: true, text: '%'}},
                    }
                }
            });
        }, 0);
    }, [activeTab, chartData.getProductMarginStats]);

    // 순이익률
    useEffect(() => {
        if (activeTab !== '정산/마진 분석') return;
        setIsEmpty(chartData.getNetProfitStats?.length === 0);

        setTimeout(() => {
            const profitStat = chartData.getNetProfitStats || [];

            if (!profitStat?.length) return;
            const ctx = document.getElementById("netProfit");
            if (!ctx) return;

            netProfitRef.current?.destroy();

            const labels = profitStat.map(item => item.product_name);
            const data = profitStat.map(item => item.net_profit_margin ?? 0);

            netProfitRef.current = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels,
                    datasets: [{
                        data,
                        backgroundColor: chartColors,
                        borderWidth: 0,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    rotation: -90,
                    circumference:180,
                    plugins: {legend: {position: 'bottom'},},
                    tooltip: {callbacks: {
                            label: function (ctx) {
                                return `${ctx.label}: ${ctx.raw}%`;
                            }}},
                }
            });
        }, 0);
    }, [activeTab, chartData.getNetProfitStats]);

    // datePicker 핸들러 -> 기간별 조회하지 않는 차트가 섞여있어서 기능 지움..
    const handleDatePicker = () => {
        openDatePicker({
            mode:'range',
            modeSelect:true,
            initialDates:[null,null],
            onConfirm:((_,value)=>{
                if(Array.isArray(value)){
                    const [start, end] = value;

                    if (!start || !end) return;

                    const formattedStart = format(start, 'yyyy-MM-dd');
                    const formattedEnd = format(end, 'yyyy-MM-dd');
                    setStartDate(formattedStart);

                    fetchChart({
                        categoryIdx: selectedSub?.category_idx ?? selectedParent?.category_idx ?? null,
                        startDate: formattedStart,
                        endDate: formattedEnd,
                    });
                }
                closeDatePicker();
            })
        });
    };

    // EXCEL download
    const handleDownloadExcel = async () => {
        try {
            const token = (typeof window !== "undefined" ? sessionStorage.getItem("token") : "");
            const categoryIdx = selectedSub?.category_idx ?? selectedParent?.category_idx ?? null;
            const params = new URLSearchParams();
            if (categoryIdx) params.append('categoryIdx', categoryIdx);

            const res = await axios.get(`http://192.168.0.122:8080/chart/excel?${params.toString()}`, {
                responseType: "blob",
                headers: {Authorization: token}
            });

            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'chart_data.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        }catch(err) {
            console.error('엑셀 꽝!!!!!', err);
        }
    }

    // PDF download
    const handleDownloadPdf = async () => {
        try {
            const token = (typeof window !== "undefined" ? sessionStorage.getItem("token") : "");
            const categoryIdx = selectedSub?.category_idx ?? selectedParent?.category_idx ?? null;
            const params = new URLSearchParams();
            if (categoryIdx) params.append('categoryIdx', categoryIdx);

            const res = await axios.get(`http://192.168.0.122:8080/chart/pdf?${params.toString()}`, {
                responseType: "blob",
                headers: {Authorization: token}
            });

            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'chart_data.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        }catch(err) {
            console.error('PDF FAILED!!!!!', err);
        }
    }

    if (loading) return <div style={{marginTop: '30px'}}>Loading...</div>;

    return (
        <div className='wrap chart-background'>
            <Header />
            <h3 className="dashboard-tab-wrapper text-align-left margin-bottom-10 margin-30">
                {tabList.map((tab) => (
                    <span
                        key={tab}
                        className={`dashboard-header ${activeTab === tab ? 'dashboard-header-active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >{tab}</span>
                ))}
            </h3>
            {activeTab === '매출 분석' && (
                <div className="dash-list-back">
                    <FilterBar
                        selectedParent={selectedParent}
                        setSelectedParent={setSelectedParent}
                        selectedSub={selectedSub}
                        setSelectedSub={setSelectedSub}
                        parentCategories={parentCategories}
                        filteredSubCategories={filteredSubCategories}
                        fetchChart={fetchChart}
                        showDatePicker={false}
                    />
                    <div className="dashboard-row">
                        <div className="dashboard-box">
                            <h3>전년 대비 총 매출 현황</h3>
                            {isEmpty ? (
                                <div className="empty-message">해당 데이터가 없습니다.</div>
                            ) : (
                                <canvas id="monthlySales"></canvas>
                            )}
                        </div>
                    </div>
                    <div className="dash-row">
                        <div className="dash-card">
                            <div className="dash-box">
                                <h3>카테고리별 매출 분포</h3>
                                {isEmpty ? (
                                    <div className="empty-message">해당 데이터가 없습니다.</div>
                                ) : (
                                    <canvas id="parentCate"></canvas>
                                )}
                            </div>
                        </div>
                        <div className="dash-card">
                            <div className="dash-box">
                                <h3>상품별 매출 분포</h3>
                                {isEmpty ? (
                                    <div className="empty-message">해당 데이터가 없습니다.</div>
                                ) : (
                                    <canvas id="productSalesChart"></canvas>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === '재고/입출고 분석' && (
                <div className="dash-list-back">
                    <div className="flex gap_10 align-center justify-right margin-bottom-10">
                        <FilterBar
                            selectedParent={selectedParent}
                            setSelectedParent={setSelectedParent}
                            selectedSub={selectedSub}
                            setSelectedSub={setSelectedSub}
                            parentCategories={parentCategories}
                            filteredSubCategories={filteredSubCategories}
                            fetchChart={fetchChart}
                            showDatePicker={false}
                        />
                    </div>
                    <div className="dash-stack-container">
                        <div className="dash-ctn-box">
                            <h3>재고 회전율 데이터</h3>
                            {isEmpty ? (
                                <div className="empty-message">해당 데이터가 없습니다.</div>
                            ) : (
                                <canvas id="inventoryTurnover"></canvas>
                            )}
                        </div>
                        <div className="dash-ctn-box">
                            <h3>입출고 현황</h3>
                            {isEmpty ? (
                                <div className="empty-message">해당 데이터가 없습니다.</div>
                            ) : (
                                <canvas id="inOutProd"></canvas>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {activeTab === '주문/반품 분석' && (
                <div className="dash-list-back">
                    <div className="flex gap_10 align-center justify-right margin-bottom-10">
                        <FilterBar
                            selectedParent={selectedParent}
                            setSelectedParent={setSelectedParent}
                            selectedSub={selectedSub}
                            setSelectedSub={setSelectedSub}
                            parentCategories={parentCategories}
                            filteredSubCategories={filteredSubCategories}
                            fetchChart={fetchChart}
                            showDatePicker={false}
                        />
                    </div>
                    <div className="order-chart-row">
                        <div className="order-chart-card">
                            <div className="order-chart-box">
                                <h3>최근 주문 / 반품 트렌드</h3>
                                {isEmpty ? (
                                    <div className="empty-message">해당 데이터가 없습니다.</div>
                                ) : (
                                    <canvas id="orderTrend"></canvas>
                                )}
                            </div>
                        </div>
                        <div className="order-chart-card">
                            <div className="order-chart-box">
                                <h3>주문 상태 현황</h3>
                                {isEmpty ? (
                                    <div className="empty-message">해당 데이터가 없습니다.</div>
                                ) : (
                                    <canvas id="orderStatus"></canvas>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="order-chart-row">
                        <div className="order-chart-card">
                            <div className="order-chart-box">
                                <h3>반품률 현황</h3>
                                {isEmpty ? (
                                    <div className="empty-message">해당 데이터가 없습니다.</div>
                                ) : (
                                    <canvas id="returnRate"></canvas>
                                )}
                            </div>
                        </div>
                        <div className="order-chart-card">
                            <div className="order-chart-box">
                                <h3>누적 지연 건수</h3>
                                {chartData.getDelayedProduct?.length > 0 ? (
                                    <table className="dash-table">
                                        <thead>
                                        <tr>
                                            <th>카테고리</th>
                                            <th>상품명</th>
                                            <th>결제일</th>
                                            <th>상태</th>
                                            <th>지연일</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {chartData.getDelayedProduct.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.category_name}</td>
                                                <td>{item.product_name}</td>
                                                <td>{item.payment_date}</td>
                                                <td>{item.status}</td>
                                                <td>{item.delay_days}일</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="empty-message">해당 데이터가 없습니다.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === '정산/마진 분석' && (
                <div className="dash-list-back">
                    <div className="flex gap_10 align-center justify-right margin-bottom-10">
                        <FilterBar
                            selectedParent={selectedParent}
                            setSelectedParent={setSelectedParent}
                            selectedSub={selectedSub}
                            setSelectedSub={setSelectedSub}
                            parentCategories={parentCategories}
                            filteredSubCategories={filteredSubCategories}
                            fetchChart={fetchChart}
                            showDatePicker={false}
                        />
                    </div>
                    <div className="order-chart-row">
                        <div className="order-chart-card">
                            <div className="order-chart-box">
                                <h3>마진율</h3>
                                {isEmpty ? (
                                    <div className="empty-message">해당 데이터가 없습니다.</div>
                                ) : (
                                    <canvas id="marginRate"></canvas>
                                )}
                            </div>
                        </div>
                        <div className="order-chart-card">
                            <div className="order-chart-box">
                                <h3>매출 대비 순이익률</h3>
                                {isEmpty ? (
                                    <div className="empty-message">해당 데이터가 없습니다.</div>
                                ) : (
                                    <canvas id="netProfit"></canvas>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="chart-download">
                <button onClick={handleDownloadExcel}>Ecxel DOWNLOAD</button>
                <button onClick={handleDownloadPdf}>PDF DOWNLOAD</button>
            </div>
        </div>
    );

}