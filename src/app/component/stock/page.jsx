'use client'
import React, {useEffect, useState} from 'react';
import axios from "axios";

const StockPage = () => {

    const [warehouseList, setWarehouseList] = useState([]);
    const [zoneList, setZoneList] = useState([]);

    useEffect(() => {
        getWarehouseList();
        getZoneList();
    }, []);

    const getWarehouseList = async () => {
        const {data} = await axios.post('http://localhost:8080/warehouse/list',{});
        console.log(data);
        setWarehouseList(data.list);
    }

    const getZoneList = async () => {
        const {data} = await axios.post('http://localhost:8080/zone/list',{});
        console.log(data);
        setZoneList(data.list);
    }

    return (
        <div>
            
        </div>
    );
};

export default StockPage;