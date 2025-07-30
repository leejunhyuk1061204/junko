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
        getSalesByCategory: [],
        getSalesByProduct: [],
    },
    loading: false,

    setCategoryIdx: (categoryIdx) => set({categoryIdx}),
    setStartDate: (startDate) => set({startDate}),
    setEndDate: (endDate) => set({endDate}),

    fetchChart: async (filters = {}) => {
        set({ loading: true });
        try {
            const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : "";

            const {categoryIdx, startDate, endDate} = filters;
            const payload = {
                categoryIdx: categoryIdx ?? null,
                startDate: startDate ?? null,
                endDate: endDate ?? null,
            };

            const {data} = await axios.post('http://192./list/chart', payload,
                {headers: {Authorization: token}});

            if (data.success && data.loginYN) {
                set({
                    chartData: data.chartData,
                    loading: false,
                });
            } else {
                console.warn("FALSE", data);
                set({loading: false});
            }
        } catch (err) {
            console.error("Chart fetch error:", err);
            set({loading: false});
        }
    },
}));

// 카테고리 상태
export const useCategoryStore = create((set) => ({
    parentCategories: [],
    subCategories: [],
    categoryLoading: false,

    fetchCategories: async () => {
        set({categoryLoading: true});
        try {
            const token = sessionStorage.getItem("token");
            const {data} = await axios.get('http://192.168.0.122:8080/chart/category/list', {
                headers: {Authorization: token}});

            if (data.loginYN) {
                set({
                    parentCategories: data.parents,
                    subCategories: data.subs,
                    categoryLoading: false,
                });
            }
        }catch (err) {
            console.error("카테고리 조회 실패: ", err);
            set({categoryLoading: false});
        }
    },
}));

// datePicker Date
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

// timePicker Time
export const useTimePickerStore = create((set) => ({
    isOpen : false,
    targetIndex: null,
    selectedTime: null,
    onConfirm: null,

    openTimePicker: ({index = null, initialTime = null, onConfirm}) =>
        set({
            isOpen: true,
            targetIndex: index,
            selectedTime: initialTime,
            onConfirm,
        }),

    closeTimePicker: () => set({isOpen: false, onConfirm:null}),
    setSelectedTime: (time) => set({selectedTime:time}),

}));