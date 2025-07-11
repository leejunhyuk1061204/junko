'use client'

import Header from "@/app/header";
import '../../globals.css';
import {useChartStore} from "@/app/zustand/store";
import {useEffect} from "react";

const Chart = () => {
    const {fetchChart, chartData, loading} = useChartStore();

    useEffect(() => {
        fetchChart({
            categoryIdx: chartData.categoryIdx,
            startDate: chartData.startDate,
            endDate: chartData.endDate,
        });
    }, []);

    if (loading) return <p>loading...</p>;

    // 다의 언니 뭐해요??
    // 지금 잠을 잘 시간이 아니에요!
    // 얼른 일 합시다
    // 언니는 잘 할 수 있어요.

    // 통계 하루만에 끝나는 [통계 하루의 기적] by. 김다의 강사
    // 통계.. 너무 어렵나요?
    // 저만 믿고 따라오세요.
    // 합격 시 전액 환불 보장!
    // 하이미디어 김다의 강사와 함께 합시다.

    // 늦었다고 생각했을 때가 가장 빠르다.
    // 나이는 걸림돌이 아닙니다.
    // 여러분은 키즈모델 빼고 다 할 수 있습니다.

    return (
        <div>
            <Header />
            <h2>Dashboard</h2>

        </div>
    );
}

export default Chart;