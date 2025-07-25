'use client';

import SettlementList from '@/app/component/purchaseSettlement/SettlementList';
import Header from "@/app/header"

export default function PurchaseSettlementPage() {
    return (
        <main>
            <Header />
            <SettlementList />
        </main>
    );
}
