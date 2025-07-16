import {create} from "zustand/react";
import process from "next/dist/build/webpack/loaders/resolve-url-loader/lib/postcss";
import axios from "axios";

export const useAlertModalStore = create((set) => ({
    svg: null,
    isOpen: false,
    msg1: '',
    msg2: '',
    showCancel: false,
    onConfirm: null,
    onCancel: null,
    openModal: ({ svg = null, msg1, msg2, onConfirm, onCancel, showCancel = false }) =>
        set({
            svg,
            isOpen: true,
            msg1,
            msg2,
            onConfirm,
            onCancel,
            showCancel,
        }),
    closeModal: () =>
        set({
            svg: null,
            isOpen: false,
            msg1: '',
            msg2: '',
            onConfirm: null,
            onCancel: null,
            showCancel: false, // 항상 false로 리셋
        }),
}));

// 메인 대시보드
export const useMainChartStore = create((set) => ({
    categoryIdx: null,
    startDate: null,
    endDate: null,
    chartData: {
        getDaySales: [],
        getRecentOrderStats: [],
        getPopularProduct: [],
        getHighReturnProduct: [],
        getInventoryTurnoverStats: [],
        returnProduct: [],
        returnProductThisMonth: [],
        getDelayedProduct: [],
        getOrderStatus: [],
        getProductMarginStats: [],
        getNetProfitStats: [],
        getInOutProduct: [],
        getMonthlySalesYoY: [],
        getLowStockProduct: [],
        getSalesThisMonth: [],
        newOrder: [],
        getPendingShipment: [],
        getShippedToday: [],
        getReceiveThisMonth: [],
    },
    loading: false,

    setCategoryIdx: (categoryIdx) => set({categoryIdx}),
    setStartDate: (startDate) => set({startDate}),
    setEndDate: (endDate) => set({endDate}),

    fetchMainChart: async () => {
        set({loading: true});
        try {
            const {categoryIdx, startDate, endDate} = useMainChartStore.getState();
            const {data} = await axios.post('http://localhost:8080/list/chart', {categoryIdx, startDate, endDate});

            if (data.success) {
                set({
                    chartData: data.chartData || {},
                    loading: false,
                });
            }else {
                console.warn('차트 응답 성공 여부 false:', data);
                set({ loading: false });
            }
        } catch (err) {
            console.error("차트 데이터 요청 실패 : ", err);
            set({loading: false});
        }
    },
}));

// 메인 캘린더
export const useScheduleStore = create((set) => ({
    scheduleList: [],
    fetchSchedules: async(token) => {
        try {
            const {data} = await axios.post('http://localhost:8080/schedule/list', {},
                {headers: {Authorization: token}});
            if (data.success) {
                set({scheduleList: data.list});
            }
        }catch (err) {
            console.error("일정 불러오기 실패 : ", err);
        }
    },
    clearSchedules: () => set({scheduleList: []}),
}));

// 차트
export const useChartStore = create((set) => ({
    categoryIdx: null,
    startDate: null,
    endDate: null,
    chartData: {
        getDaySales: [],
        getRecentOrderStats: [],
        getPopularProduct: [],
        getHighReturnProduct: [],
        getInventoryTurnoverStats: [],
        getDelayedProduct: [],
        getOrderStatus: [],
        getProductMarginStats: [],
        getNetProfitStats: [],
        getInOutProduct: [],
        getMonthlySalesYoY: []
    },
    loading: false,

    setCategoryIdx: (categoryIdx) => set({categoryIdx}),
    setStartDate: (startDate) => set({startDate}),
    setEndDate: (endDate) => set({endDate}),

    fetchChart: async () => {
        set({ loading: true });

        try {
            const user_id = typeof window !== "undefined" ? sessionStorage.getItem("user_id") : "";
            set({ loading: false });
            const headers = {
                Authorization: sessionStorage.getItem("authorization"),
            };
            const payload = {
                user_id,
                ...(categoryIdx && { categoryIdx }),
                ...(startDate && endDate && { startDate, endDate })
            };

            const {data} = await axios.post('http://localhost/list/chart', payload, {headers});

            if (data.success && data.loginYN) {
                set({
                    chartData: data.chartData,
                    loading: false,
                });
            } else {
                console.warn("LOGIN FALSE");
                set({loading: false});
            }
        } catch (err) {
            console.error("Chart fetch error:", err);
            set({loading: false});
        }
    }

}));

// datePicker
export const useDatePickerStore = create((set) => ({
    isOpen : false,
    mode : 'single',
    targetIndex: null,
    selectedDate:null,
    selectedDates:null,
    onConfirm: null,
    modeSelect: null,

    openDatePicker:({index = null,initialDate = null, initialDates = [null,null],mode = 'single', modeSelect = null, onConfirm})=>
        set({
            isOpen: true,
            mode,
            modeSelect,
            targetIndex: index,
            selectedDate:mode === 'single' ? initialDate : null,
            selectedDates:mode === 'range' ? initialDates : [null,null],
            onConfirm,
        }),

    closeDatePicker: () => set({isOpen: false, onConfirm:null}),

    setSelectedDate: (date) => set({selectedDate:date}),
    setSelectedDates:(dates) => set({selectedDates:dates}),

}));