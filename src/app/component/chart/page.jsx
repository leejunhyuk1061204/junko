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

    return (
        <div>
            <Header />
            <h2>Dashboard</h2>

        </div>
    );
}

export default Chart;