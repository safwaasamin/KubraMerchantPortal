import React, { useState } from "react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Pencil, 
  Trash, 
  MoreVertical 
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/lib/types";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ProductForm } from "@/components/products/ProductForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/products/${product.id}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Product deleted",
        description: "Product has been successfully deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setDeleteModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete product",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <>
      <Card className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-32 object-cover" 
            />
          ) : (
            <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="p-1 bg-white rounded shadow text-gray-500 hover:text-gray-700">
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setDeleteModalOpen(true)}
                  className="text-red-600"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-gray-800">{product.name}</h3>
          <p className="text-sm text-gray-500">{product.description}</p>
          <div className="mt-2 flex justify-between items-center">
            <span className="font-semibold text-primary">₹ {product.price}</span>
            <span className={`text-xs ${
              product.stock > 10
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            } px-2 py-1 rounded`}>
              {product.stock > 10 ? "In Stock" : "Low Stock"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
      />
      
      {/* Edit Product Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <ProductForm 
            product={product} 
            onSuccess={() => {
              setEditModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            }} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
