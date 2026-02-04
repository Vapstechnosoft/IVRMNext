'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductTab from "./_components/product-tab";
import ProductQtyTab from "./_components/product-qty-tab";

export default function InvMasterProductPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Product Master</h2>
            </div>
            <Tabs defaultValue="product" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="product">Product</TabsTrigger>
                    <TabsTrigger value="productQty">Product Quantity</TabsTrigger>
                </TabsList>
                <TabsContent value="product" className="space-y-4">
                    <ProductTab />
                </TabsContent>
                <TabsContent value="productQty" className="space-y-4">
                    <ProductQtyTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
