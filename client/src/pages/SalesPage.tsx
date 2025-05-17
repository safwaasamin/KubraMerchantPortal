import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalesSummary } from "@/components/sales/SalesSummary";
import { SalesTable } from "@/components/sales/SalesTable";
import { useLocation } from "wouter";

const SalesPage: React.FC = () => {
  const [_, navigate] = useLocation();

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-800">Sales Reports</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
      
      <SalesSummary />
      
      <SalesTable />
    </>
  );
};

export default SalesPage;
