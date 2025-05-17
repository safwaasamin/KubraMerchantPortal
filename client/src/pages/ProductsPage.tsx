import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductForm } from "@/components/products/ProductForm";
import { Product } from "@/lib/types";

const ProductsPage: React.FC = () => {
  const [addProductOpen, setAddProductOpen] = useState(false);
  
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm overflow-hidden h-64 animate-pulse"
            >
              <div className="w-full h-32 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          
          {/* Add New Product Card */}
          <Button
            variant="outline"
            className="h-full min-h-[210px] border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary-light/20 flex flex-col items-center justify-center gap-3"
            onClick={() => setAddProductOpen(true)}
          >
            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <span className="text-primary font-medium">Add New Product</span>
          </Button>
        </div>
      )}
      
      {/* Add Product Modal */}
      <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <ProductForm
            onSuccess={() => {
              setAddProductOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductsPage;
