'use client'

import Header from '@/app/header'
import { useRouter, useParams } from 'next/navigation'
import InvoiceFormPage from "@/app/component/invoiceTax/form/invoiceForm";

export default function InvoiceUpdatePage() {
    const router = useRouter()
    const { invoice_idx } = useParams()

    return (
        <div className="wrap page-background">
            <Header />
            <h1 className="margin-left-20 text-align-left margin-bottom-20 font-bold" style={{ fontSize: '24px' }}>
                세금 계산서 수정
            </h1>
            <InvoiceFormPage isEdit={true} invoice_idx={invoice_idx} onSubmitSuccess={() => router.push('../')} />
        </div>
    )
}