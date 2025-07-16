import React from "react";
import CategoryTree from "./categoryTree";

export default function CategoryList({ data, onChange }) {
    return (
        <div className="catagory-tree-wrapper">
            <CategoryTree data={data} onReorder={onChange} />
        </div>
    );
}