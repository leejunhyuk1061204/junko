'use client'

import Header from '@/app/header'
import { useRouter } from 'next/navigation'
import InvoiceFormPage from "@/app/component/invoiceTax/form/invoiceForm";

export default function InvoiceInsertPage() {
    const router = useRouter()
    return (
        <div className="wrap page-background">
            <Header />
            <h1 className="margin-left-20 text-align-left margin-bottom-20 font-bold" style={{ fontSize: '24px' }}>
                세금 계산서 등록
            </h1>
            <InvoiceFormPage isEdit={false} onSubmitSuccess={() => router.push('./')} />
        </div>
    )
}