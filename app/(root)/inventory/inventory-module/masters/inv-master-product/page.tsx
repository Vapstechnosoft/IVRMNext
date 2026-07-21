'use client';

import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductTab from "./_components/product-tab";
import ProductQtyTab from "./_components/product-qty-tab";
import { parseAsInteger, useQueryState } from "nuqs";
import { tableSearchVariables } from "@/lib/data-table.config";
import { FormProvider, useFormContext } from "@/components/ui/form/form-provider";
import ToggleProductForm from "./_components/toggle-form";

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    const { isToggleFormOpen, selectedRow, closeToggleForm, openAddForm, closeAddForm, closeEditForm } = useFormContext<any>();

    const onTabChange = (value: string) => {
        setActiveTab(value);
        setPage(1);
        setPageSize(10);
        closeAddForm();
        closeEditForm();
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                        <div className="flex justify-between items-center w-full mb-4">
                            <TabsList>
                                <TabsTrigger value="product">Product</TabsTrigger>
                                <TabsTrigger value="productQty">Product Quantity</TabsTrigger>
                            </TabsList>
                            <Button
                                type='button'
                                onClick={openAddForm}
                                className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                                <Plus className='h-4 w-4 mr-2' />
                                Add {activeTab === 'product' ? 'Product' : 'Quantity'}
                            </Button>
                        </div>
                        <TabsContent value="product" className="space-y-4">
                            <ProductTab />
                        </TabsContent>
                        <TabsContent value="productQty" className="space-y-4">
                            {activeTab === 'productQty' && <ProductQtyTab />}
                        </TabsContent>
                    </Tabs>
                </div>

                {isToggleFormOpen && selectedRow && (
                    <ToggleProductForm rowData={selectedRow} onClose={closeToggleForm} />
                )}
            </div>
        </div>
    );
}

