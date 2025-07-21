import Header from "@/app/header";
import React from "react";

export default function selectTemplate() {

    return (
        <div className="productPage wrap page-background">
            <Header />
            <div className="template-list-back">
                <h1 className="text-align-left margin-bottom-10 font-bold margin-left-20" style={{ fontSize: "24px" }}>
                    문서 작성
                </h1>
            </div>
        </div>
    )
}