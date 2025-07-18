'use client'

import React, {useContext, useEffect, useRef, useState} from 'react';
import Header from "@/app/header";
import "./globals.css";
import {Bar, Line} from "react-chartjs-2";
import {Chart} from "chart.js/auto";
import {useAlertModalStore, useMainChartStore, useScheduleStore} from "@/app/zustand/store";
import {ko} from "date-fns/locale/ko";
import {Calendar, dateFnsLocalizer} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from 'date-fns/startOfWeek';
import getDay from "date-fns/getDay";
import {router} from "next/client";

const locales = {
    'ko': ko,
};

const localizer = dateFnsLocalizer({format, parse, startOfWeek, getDay, locales,});

const MainPage = () => {

    if (typeof window !== 'undefined') {
        if (
            sessionStorage.getItem('token') === null ||
            sessionStorage.getItem('token') === '' ||
            typeof sessionStorage.getItem('token') === 'undefined'
        ) {
            location.href = "/component/login";
        }
    }

    const {openModal} = useAlertModalStore();
    const {chartData, loading, fetchMainChart} = useMainChartStore();
    const {fetchSchedules} = useScheduleStore();

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        console.log("토큰있음?",token);
        if (token) {
            fetchSchedules(token);
        }
    }, []);

    // 달력 클릭 시
    const handleDateClick = () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            openModal({
                svg: '❗',
                msg1: '해당 페이지 접근 불가',
                msg2: '로그인 후 이용해주세요.',
                showCancel: false,
            });
            return;
        }
        router.push('/schedule'); // SPA
    };

    const [summaryData, setSummaryData] = useState(null);

    const monthlySalesChartRef = useRef(null);
    const daySalesChartRef = useRef(null);
    const inOutChartRef = useRef(null);
    const popularProductChartRef = useRef(null);

    useEffect(() => {
        fetchMainChart({});
    }, [fetchMainChart]);

    useEffect(() => {
        if (!chartData || !chartData.getSalesThisMonth || !Array.isArray(chartData.getSalesThisMonth)) return;

        // 요약 정보
        setSummaryData({
            totalSales: chartData?.getSalesThisMonth?.[0]?.total_sales?? 0,
            totalReceive: chartData.getReceiveThisMonth[0]?.receive_cnt?
                chartData.getReceiveThisMonth[0].receive_cnt.toLocaleString() : '0',
            lowStock: chartData.getLowStockProduct.length.toLocaleString(),
            returnProd: chartData.returnProductThisMonth.reduce((acc, cur) =>
                acc+(cur.return_cnt || 0), 0).toLocaleString(),
            newOrderCnt: chartData.newOrder[0]?.new_order_cnt?
                chartData.newOrder[0].new_order_cnt.toLocaleString() : '0',
            pendingShipping: chartData.getPendingShipment.reduce((acc, cur) =>
                acc+(cur.waiting_cnt || 0), 0).toLocaleString(),
            shipped: chartData.getShippedToday.reduce((acc, cur) =>
                acc+(cur.shipped_today_cnt || 0), 0).toLocaleString()
        });

        // 전년 대비 월별 매출
        const monthlySalesChart = (rawData) => {
            const ctx = document.getElementById("monthlySalesChart");
            const labels = Array.from({length: 12}, (_, i) => {
                const month = (i+1).toString().padStart(2, "0");
                return `${month}`;
            });
            const dataMap = new Map(rawData.map(item => [item.month, item]));
            const thisYear = labels.map(month => dataMap.get(month)?.sales_this_year?? 0);
            const lastYear = labels.map(month => dataMap.get(month)?.sales_last_year?? 0);

            if (ctx && !monthlySalesChartRef.current) {
                monthlySalesChartRef.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                type: 'bar',
                                label: '올해 매출',
                                data: thisYear,
                                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            },
                            {
                                type: 'line',
                                label: '작년 매출',
                                data: lastYear,
                                borderColor: 'rgba(255, 99, 132, 1)',
                                borderWidth: 2,
                                tension: 0.3,
                                fill: false,
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                beginAtZero: true,
                                grid: {display: false},
                                ticks: {
                                    maxRotation: 45,
                                    minRotation: 20,
                                    autoSkip: false,
                                    callback: function(value) {return value.length > 8 ? value.slice(0, 8) + '…' : value;}}
                            },
                            y: {beginAtZero: true,}
                        }
                    }
                });
            }
        };

        // 전일 대비 매출
        const daySalesChart = (data) => {
            const ctx = document.getElementById("daySalesChart");
            const labels = ['전일', '금일'];
            const sales = data.map(d => d.total_sales);
            const maxValue = Math.max(...sales);
            const adjustedMax = Math.max(maxValue, 500000); // y축 최소 최대값 50만원

            if (ctx && !daySalesChartRef.current) {
                daySalesChartRef.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: '일일 매출',
                                data: sales,
                                backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)'],
                                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
                                borderWidth: 1,
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: {padding: {bottom: 20},},
                        scales: {
                            x: {
                                beginAtZero: true,
                                grid: {display: false},},
                            y: {
                                beginAtZero: true,
                                max: adjustedMax,
                                ticks: {
                                    stepSize: 100000,
                                    callback: value => value.toLocaleString() + '원'

                                }
                            }
                        }
                    }
                });
            }
        };

        // 입출고 현황
        const inOutChart = (data) => {
            const ctx = document.getElementById("inOutChart");
            const labels = data.map(d => d.product_name);
            const receive = data.map(d => d.total_recive_cnt || 0);
            const shipment = data.map(d => d.total_shipment_cnt || 0);

            if (ctx && !inOutChartRef.current) {
                inOutChartRef.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels,
                        datasets: [
                            {
                                label: '입고 수량',
                                data: receive,
                                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            },
                            {
                                label: '출고 수량',
                                data: shipment,
                                backgroundColor: 'rgba(255, 159, 64, 0.6)',
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: {padding: {bottom: 20},},
                        scales: {
                            x: {grid: {display: false}},
                            y: {beginAtZero: true,
                                grid: {display: false},}
                        }
                    }
                });
            }
        };

        // 인기 상품
        const popularProductChart = (data) => {
            const ctx = document.getElementById("popularProductChart");
            const labels = data.map(d => d.product_name);
            const sales = data.map(d => d.total_sales || 0);

            if (ctx && !popularProductChartRef.current) {
                popularProductChartRef.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels,
                        datasets: [
                            {
                                label: '판매 수',
                                data: sales,
                                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                                barThickness: 30,
                            }
                        ]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: {padding: {bottom: 20},},
                        scales: {
                            x: {beginAtZero: true,
                                grid: {display: false},
                                ticks: {stepSize: 5},
                                title: {display: false,
                                        text: '(개)',
                                        align: 'end',
                                        color: '#666',
                                        font: {size: 12, weight: 'normal'},},},
                            y: {grid: {display: false},},
                        }
                    }
                })
            }
        }

        // 차트 그리기
        monthlySalesChart(chartData.getMonthlySalesYoY);
        daySalesChart(chartData.getDaySales);
        inOutChart(chartData.getInOutProduct);
        popularProductChart(chartData.getPopularProduct);

        return () => {
            // 재렌더 시 기존 차트 제거
            if (monthlySalesChartRef.current) monthlySalesChartRef.current.destroy();
            if (daySalesChartRef.current) daySalesChartRef.current.destroy();
            if (inOutChartRef.current) inOutChartRef.current.destroy();
            if (popularProductChartRef.current) popularProductChartRef.current.destroy();
        };

    }, [chartData]);

    if (loading) return <div style={{marginTop: '30px'}}>Loading...</div>;
    if (!summaryData) return null;

    const SummaryCard = ({ title, value }) => (
        <div className="summary-card">
            <div className="summary-title">{title}</div>
            <div className="summary-value">{typeof value === 'number'? value.toLocaleString():value}</div>
        </div>
    );

    const CustomToolbar = ({label, onNavigate}) => {
        return (
            <div className="custom-toolbar">
                <button onClick={() => onNavigate("PREV")} aria-label="이전">&lt;</button>
                <span className="custom-label">{label}</span>
                <button onClick={() => onNavigate("NEXT")} aria-label="다음">&gt;</button>
            </div>
        );
    };

    return (
        <div>
            <Header/>
            <div className="main-container">
                <div className="main-box">
                    <div className="summary-grid">
                        <SummaryCard title="이달 매출" value={summaryData.totalSales} />
                        <SummaryCard title="이달 매입 건수" value={summaryData.totalReceive} />
                        <SummaryCard title="재고 부족 상품 수" value={summaryData.lowStock} />
                        <SummaryCard title="이달 반품 건수" value={summaryData.returnProd} />
                        <SummaryCard title="신규 주문" value={summaryData.newOrderCnt} />
                        <SummaryCard title="출고 대기" value={summaryData.pendingShipping} />
                        <SummaryCard title="오늘 출고" value={summaryData.shipped} />
                    </div>

                    <div className="main-chart-row">
                        <div className="main-chart-box">
                            <h2>전년 대비 총 매출 현황</h2>
                            <canvas id="monthlySalesChart"></canvas>
                        </div>

                        <div className="main-calendar-box" onClick={handleDateClick}>
                            <Calendar
                                localizer={localizer}
                                defaultView="month"
                                views={['month']}
                                onSelectSlot={handleDateClick}
                                selectable
                                style={{height: 400}}
                                components={{toolbar: CustomToolbar,}}
                            />
                        </div>
                    </div>

                    <div className="chart-row">
                        <div className="chart-card">
                            <div className="chart-box">
                                <h3>전일 대비 매출</h3>
                                <canvas id="daySalesChart"></canvas>
                            </div>
                        </div>
                        <div className="chart-card">
                            <div className="chart-box">
                                <h3>입출고 현황</h3>
                                <canvas id="inOutChart"></canvas>
                            </div>
                        </div>
                        <div className="chart-card">
                            <div className="chart-box">
                                <h3>인기 상품</h3>
                                <canvas id="popularProductChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <div className="table-row">
                        <div className="table-card delayed">
                            <div className="table-wrapper">
                                <h3>처리 지연 상품</h3>
                                <table className="data-table">
                                    <thead>
                                    <tr>
                                        <th>상품명</th>
                                        <th>카테고리</th>
                                        <th>결제일</th>
                                        <th>지연일</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {chartData.getDelayedProduct?.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.product_name}</td>
                                            <td>{item.category_name}</td>
                                            <td>{item.payment_date}</td>
                                            <td>{item.delay_days}일</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="table-card return">
                            <div className="table-wrapper">
                                <h3>반품율 높은 상품</h3>
                                <table className="data-table">
                                    <thead>
                                    <tr>
                                        <th>상품명</th>
                                        <th>카테고리</th>
                                        <th>반품 건수</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {chartData.getHighReturnProduct?.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.product_name}</td>
                                            <td>{item.category_name}</td>
                                            <td>{item.return_cnt}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MainPage;