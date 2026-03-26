'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductTab from "./_components/product-tab";
import ProductQtyTab from "./_components/product-qty-tab";
import { parseAsInteger, useQueryState } from "nuqs";
import { tableSearchVariables } from "@/lib/data-table.config";
import { FormProvider, useFormContext } from "@/components/ui/form/form-provider";
import ToggleProductForm from "./_components/toggle-form";

export default function InvMasterProductPage() {
    return (
        <FormProvider<any>>
            <InvMasterProductContent />
        </FormProvider>
    );
}

function InvMasterProductContent() {
    const [, setPage] = useQueryState(
        tableSearchVariables.page,
        parseAsInteger.withOptions({ shallow: false }).withDefault(1)
    );
    const [, setPageSize] = useQueryState(
        tableSearchVariables.page_size,
        parseAsInteger.withOptions({ shallow: false }).withDefault(10)
    );

    const [activeTab, setActiveTab] = useState("product");
    const { isToggleFormOpen, selectedRow, closeToggleForm } = useFormContext<any>();

    const onTabChange = (value: string) => {
        setActiveTab(value);
        setPage(1);
        setPageSize(10);
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center space-x-2 pb-2">
                <Package className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold tracking-tight">Product Master</h2>
            </div>
            <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="product">Product</TabsTrigger>
                    <TabsTrigger value="productQty">Product Quantity</TabsTrigger>
                </TabsList>
                <TabsContent value="product" className="space-y-4">
                    <ProductTab />
                </TabsContent>
                <TabsContent value="productQty" className="space-y-4">
                    {activeTab === 'productQty' && <ProductQtyTab />}
                </TabsContent>
            </Tabs>

            {isToggleFormOpen && selectedRow && (
                <ToggleProductForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </div>
    );
}

