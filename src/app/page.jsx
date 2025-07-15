'use client'

import React, {useContext, useEffect, useRef, useState} from 'react';
import Header from "@/app/header";
import "./globals.css";
import {Bar, Line} from "react-chartjs-2";
import {Chart} from "chart.js/auto";
import {useAlertModalStore, useMainChartStore} from "@/app/zustand/store";
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

const localizer = dateFnsLocalizer({
    format, parse, startOfWeek, getDay, locales,});

const MainPage = () => {

    const {openModal} = useAlertModalStore();
    const {chartData, loading, fetchMainChart} = useMainChartStore();

    // 달력 클릭 시
    const handleDateClick = () => {
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
            returnProd: chartData.returnProduct.reduce((acc, cur) =>
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
            const labels = rawData.map(item => item.month);
            const thisYear = rawData.map(item => item.this_year_sales);
            const lastYear = rawData.map(item => item.last_year_sales);

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
                            y: {
                                beginAtZero: true,
                            }
                        }
                    }
                });
            }
        };

        // 전일 대비 매출
        const daySalesChart = (data) => {
            const ctx = document.getElementById("daySalesChart");
            const labels = data.map(d => d.date);
            const sales = data.map(d => d.total_sales);

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
                        scales: {
                            y: {
                                beginAtZero: true,
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
                        scales: {
                            y: {
                                beginAtZero: true,
                            }
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
                                label: '판매량',
                                data: sales,
                                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                            }
                        ]
                    },
                    options: {
                        indexAxis: 'y', // 수평 막대
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                beginAtZero: true,
                            }
                        }
                    }
                })
            }
        }

        // 차트 그리기
        monthlySalesChart(chartData.getMonthlySalesYoY);
        daySalesChart(chartData.getDaySales);

        return () => {
            // 재렌더 시 기존 차트 제거
            if (monthlySalesChartRef.current) monthlySalesChartRef.current.destroy();
            if (daySalesChartRef.current) daySalesChartRef.current.destroy();
        };

    }, [chartData]);

    if (loading) return <div>Loading...</div>;
    if (!summaryData) return null;

    const SummaryCard = ({ title, value }) => (
        <div className="summary-card">
            <div className="summary-title">{title}</div>
            <div className="summary-value">{typeof value === 'number'? value.toLocaleString():value}</div>
        </div>
    );

    return (
        <div>
            <Header/>
            <div className="main-container">
                <div className="main-box">
                    <div className="summary-grid">
                        <SummaryCard title="이달 매출" value={summaryData.totalSales} />
                        <SummaryCard title="이달 매입" value={summaryData.totalReceive} />
                        <SummaryCard title="재고 부족 상품 수" value={summaryData.lowStock} />
                        <SummaryCard title="반품 건수" value={summaryData.returnProd} />
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


            {/*
            <div className="dashboard-container">
                요약 카드
                <div className="summary-grid">
                    {[
                        ['매출', '1,233'],
                        ['매입', '890'],
                        ['재고부족', '38'],
                        ['미정산', '7'],
                        ['오류', ''],
                        ['신규주문', '6'],
                        ['출고대기', '22'],
                    ].map(([label, value], idx) => (
                        <div key={idx} className="summary-card">
                            <div className="summary-label">{label}</div>
                            <div className="summary-value">{value}</div>
                        </div>
                    ))}
                </div>

                공지
                <div className="notice-box">
                    <strong>📢 공지 사항</strong>
                    <p>● 미결제 정산 72건 처리 요청</p>
                </div>

                차트 및 리스트
                <div className="chart-grid">
                    <div className="chart-card">
                        <h3>매출 추이</h3>
                        <Line data={{
                            labels: [6, 7, 8, 9, 10, 11, 12],
                            datasets: [
                                {
                                label: '매출',
                                data: [200, 400, 300, 450, 380, 500, 420],
                                borderColor: '#3B82F6',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                },
                            ],
                        }}
                        options={{responsive: true, maintainAspectRatio: false}}
                        />
                    </div>

                    <div className="chart-card">
                        <h3>매출 VS 매입</h3>
                        <Bar data={{
                            labels: ['6월', '7월', '8월'],
                            datasets: [
                                {
                                    label: '매출',
                                    data: [1200, 1233, 1100],
                                    backgroundColor: '#60A5FA',
                                },
                                {
                                    label: '매입',
                                    data: [800, 890, 950],
                                    backgroundColor: '#9CA3AF',
                                },
                            ],
                        }}
                        options={{responsive: true, maintainAspectRatio: false}}
                        />
                    </div>

                    <div className="chart-card">
                        <h3>최근 매출</h3>
                        <ul>
                            <li>2025-06-26: ￦100,000</li>
                            <li>2025-06-25: ￦120,000</li>
                            <li>2025-06-24: ￦98,000</li>
                        </ul>
                    </div>

                    <div className="chart-card">
                        <h3>최근 매입</h3>
                        <ul>
                            <li>2025-06-26: ￦70,000</li>
                            <li>2025-06-25: ￦85,000</li>
                            <li>2025-06-24: ￦90,000</li>
                        </ul>
                    </div>
                </div>
                <div className="footer-top">
                    <div className="circle-box">
                        <div className="circle">
                            <div className="circle-label">KPI 달성</div>
                            <div className="circle-value">100%</div>
                        </div>
                    </div>
                    <div className="circle-box">
                        <div className="circle">
                            <div className="circle-label">주간 성장률</div>
                            <div className="circle-value">40%</div>
                        </div>
                    </div>
                    <div className="report-box">
                        <h4>◆ 오늘의 한 줄 보고 / 요약</h4>
                        <ul>
                            <li>1. 전일 매출 +5%</li>
                            <li>2. 오늘 날씨 맑음</li>
                            <li>3. 오늘 팀원과 간단 안건 공유, 논의 챙겨</li>
                            <li>4. 거래처 미팅 장소 변경 됨 (본사 → 외식)</li>
                            <li>5. 포켓몬 vs 디지몬 (밸런스 게임)</li>
                        </ul>
                    </div>
                </div>

                <Link href="/component/schedule" className="calendar-box">
                    <div className="calendar-header">6월 일정</div>
                    <table className="calendar">
                        <thead>
                        <tr>
                            <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>
                        </tr>
                        </thead>
                        <tbody>
                        {[0, 1, 2, 3, 4].map((weekIdx) => (
                            <tr key={weekIdx}>
                                {Array.from({ length: 7 }).map((_, dayIdx) => {
                                    const day = weekIdx * 7 + dayIdx - 1;
                                    return (
                                        <td key={dayIdx} className={day % 7 === 0 ? 'sunday' : ''}>
                                            {day > 0 && day <= 30 ? day : ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </Link>
            </div>*/}
        </div>
    );
};

export default MainPage;