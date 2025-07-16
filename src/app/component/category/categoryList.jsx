import React from "react";
import CategoryTree from "./categoryTree";

export default function CategoryList({ data, onChange, onEdit, onDelete }) {
    return (
        <div className="category-tree-wrapper">
            <CategoryTree
                data={data}
                onReorder={onChange}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </div>
    );
}
