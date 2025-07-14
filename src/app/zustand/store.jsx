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
    chartData: {
        getDaySales: [],
        getRecentOrderStats: [],
        getPopularProduct: [],
        getHighReturnProduct: [],
        getInventoryTurnoverStats: [],
        returnProduct: [],
        getDelayedProduct: [],
        getOrderStatus: [],
        getProductMarginStats: [],
        getNetProfitStats: [],
        getInOutProduct: [],
        getMonthlySalesYoY: []
    },
    loading: false,
    fetchChart: async ({ categoryIdx = null, startDate = null, endDate = null } = {}) => {
        set({ loading: true });

        try {
            const user_id = typeof window !== "undefined" ? sessionStorage.getItem("user_id") : "";
            if (!user_id) {
                set({ loading: false });
                return;
            }
            const header = {
                Authorization: sessionStorage.getItem("authorization"),
            };
            const payload = {
                user_id,
                ...(categoryIdx && { categoryIdx }),
                ...(startDate && endDate && { startDate, endDate })
            };

            const {data} = await axios.post('http://localhost/list/chart', payload, {header});

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
    targetIndex: null,
    selectedDate:null,
    onConfirm: null,

    openDatePicker:({index = null,initialDate = null, onConfirm})=>
        set({
            isOpen: true,
            targetIndex: index,
            selectedDate:initialDate,
            onConfirm,
        }),

    closeDatePicker: () => set({isOpen: false, onConfirm:null}),

    setSelectedDate: (date) => set({selectedDate:date}),

}));