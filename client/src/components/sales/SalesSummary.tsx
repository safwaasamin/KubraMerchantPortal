import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Package, Calculator } from "lucide-react";
import { SalesSummary as SalesSummaryType } from "@/lib/types";

export const SalesSummary: React.FC = () => {
  const { data, isLoading } = useQuery<SalesSummaryType>({
    queryKey: ["/api/sales/summary"],
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-primary rounded-lg shadow-sm overflow-hidden">
            <CardContent className="p-6 text-white">
              <div className="flex items-center justify-center h-20">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-primary rounded-lg shadow-sm overflow-hidden">
        <CardContent className="p-6 text-white">
          <div className="flex items-center">
            <div className="p-3 bg-white bg-opacity-20 rounded-full mr-4">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white text-opacity-80 text-sm">Total Sale</p>
              <p className="text-2xl font-bold">₹ {data.totalSale.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-red-400 rounded-lg shadow-sm overflow-hidden">
        <CardContent className="p-6 text-white">
          <div className="flex items-center">
            <div className="p-3 bg-white bg-opacity-20 rounded-full mr-4">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white text-opacity-80 text-sm">No of Orders</p>
              <p className="text-2xl font-bold">{data.orderCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-red-400 rounded-lg shadow-sm overflow-hidden">
        <CardContent className="p-6 text-white">
          <div className="flex items-center">
            <div className="p-3 bg-white bg-opacity-20 rounded-full mr-4">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white text-opacity-80 text-sm">Avg Order Value</p>
              <p className="text-2xl font-bold">₹ {data.avgOrderValue.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
