'use client'

import Header from "@/app/header";
import '../../globals.css';
import {useEffect} from "react";

const Schedule = () => {
/*
    useEffect(() => {
        fetchChart({
            categoryIdx: chartData.categoryIdx,
            startDate: chartData.startDate,
            endDate: chartData.endDate,
        });
    }, []);

    if (loading) return <p>loading...</p>;
*/

    return (
        <div>
            <Header />
            <h2>Schedule</h2>

        </div>
    );
}


export default Schedule;