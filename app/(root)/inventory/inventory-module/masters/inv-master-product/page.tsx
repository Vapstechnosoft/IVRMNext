'use client';

import { useState } from 'react';

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
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
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
        </div>
    );
}

