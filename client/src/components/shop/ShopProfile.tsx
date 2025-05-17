import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Shop } from "@/lib/types";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

const shopSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().min(10, { message: "Phone number must be valid" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  bannerUrl: z.string().optional(),
  logoUrl: z.string().optional(),
});

type ShopFormValues = z.infer<typeof shopSchema>;

export const ShopProfile: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  
  const { data: shop, isLoading } = useQuery<Shop>({
    queryKey: ["/api/shop"],
  });
  
  const form = useForm<ShopFormValues>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      name: shop?.name || "",
      phone: shop?.phone || "",
      address: shop?.address || "",
      bannerUrl: shop?.bannerUrl || "",
      logoUrl: shop?.logoUrl || "",
    },
  });
  
  // Update form values when shop data is loaded
  React.useEffect(() => {
    if (shop) {
      form.reset({
        name: shop.name,
        phone: shop.phone,
        address: shop.address,
        bannerUrl: shop.bannerUrl,
        logoUrl: shop.logoUrl,
      });
    }
  }, [shop, form]);
  
  const updateShopMutation = useMutation({
    mutationFn: async (values: ShopFormValues) => {
      return await apiRequest("PATCH", "/api/shop", values);
    },
    onSuccess: () => {
      toast({
        title: "Shop profile updated",
        description: "Your shop profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/shop"] });
      setIsEditing(false);
      setSuccessModalOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Failed to update shop profile",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  const submitMaintenanceRequest = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/maintenance-requests", {
        shopId: shop?.id,
        type: "general",
        description: "General maintenance request",
        priority: "medium",
      });
    },
    onSuccess: () => {
      toast({
        title: "Maintenance request submitted",
        description: "Your maintenance request has been submitted successfully.",
      });
      setMaintenanceModalOpen(false);
      setSuccessModalOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Failed to submit maintenance request",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ShopFormValues) => {
    updateShopMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading shop profile...</p>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-800">Shop Profile</h3>
            <Button 
              variant="secondary" 
              className="bg-primary-light text-primary hover:bg-primary hover:text-white"
              onClick={() => setMaintenanceModalOpen(true)}
            >
              Maintenance issues
            </Button>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled={!isEditing} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled={!isEditing} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        disabled={!isEditing} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bannerUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Shop Banner</FormLabel>
                    <div className="mt-1 relative">
                      {field.value ? (
                        <img 
                          src={field.value} 
                          alt="Shop banner" 
                          className="w-full h-40 object-cover rounded-lg" 
                        />
                      ) : (
                        <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400">No banner image</span>
                        </div>
                      )}
                      {isEditing && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                          <Input
                            type="text"
                            placeholder="Enter banner URL"
                            className="max-w-sm bg-white"
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Logo</FormLabel>
                    <div className="mt-1 flex">
                      {field.value ? (
                        <img 
                          src={field.value} 
                          alt="Shop logo" 
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No logo</span>
                        </div>
                      )}
                      {isEditing ? (
                        <Input
                          type="text"
                          placeholder="Enter logo URL"
                          className="ml-4 flex-1"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      ) : (
                        <Button 
                          variant="outline" 
                          className="ml-4" 
                          type="button"
                          disabled
                        >
                          Change Logo
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type={isEditing ? "submit" : "button"}
                className="w-full"
                onClick={() => !isEditing && setIsEditing(true)}
                disabled={updateShopMutation.isPending}
              >
                {isEditing ? (
                  updateShopMutation.isPending ? "Saving..." : "Save Changes"
                ) : (
                  <>
                    <Pencil className="h-5 w-5 mr-2" />
                    Edit
                  </>
                )}
              </Button>
              
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsEditing(false);
                    form.reset({
                      name: shop?.name || "",
                      phone: shop?.phone || "",
                      address: shop?.address || "",
                      bannerUrl: shop?.bannerUrl || "",
                      logoUrl: shop?.logoUrl || "",
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Success Modal */}
      <ConfirmationModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        title="Operation Successful"
        description="Your changes have been saved successfully."
        onConfirm={() => setSuccessModalOpen(false)}
        isSuccess
      />
      
      {/* Maintenance Modal */}
      <ConfirmationModal
        open={maintenanceModalOpen}
        onOpenChange={setMaintenanceModalOpen}
        title="Submit Maintenance Request"
        description="Do you want to submit a maintenance request for your shop? Our team will contact you shortly."
        confirmText="Submit Request"
        onConfirm={() => submitMaintenanceRequest.mutate()}
      />
    </>
  );
};
