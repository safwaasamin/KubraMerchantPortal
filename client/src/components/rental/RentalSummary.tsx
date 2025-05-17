import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Rental } from "@/lib/types";
import { format } from "date-fns";

interface RentalSummaryProps {
  onMakePayment: () => void;
}

export const RentalSummary: React.FC<RentalSummaryProps> = ({ onMakePayment }) => {
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  
  const { data: rental, isLoading } = useQuery<Rental>({
    queryKey: ["/api/rental"],
  });

  if (isLoading || !rental) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center h-40">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  const dueDate = new Date(rental.dueDate);
  const isOverdue = dueDate < new Date();
  const isDueSoon = !isOverdue && dueDate.getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Rent Summary</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Label
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Rent Due:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary text-right">
                    ₹ {rental.amount.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Due Date:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={isOverdue ? "text-red-500 font-medium" : "font-medium"}>
                      {format(dueDate, "dd MMM yyyy")}
                    </span>
                    {(isOverdue || isDueSoon) && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        {isOverdue ? "Overdue" : "Due soon"}
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-3">
            <Button 
              className="w-full"
              onClick={onMakePayment}
            >
              Make Payment
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={() => setInvoiceModalOpen(true)}
            >
              <Download className="h-5 w-5 mr-2" />
              Download Invoice
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Invoice Modal */}
      <Dialog open={invoiceModalOpen} onOpenChange={setInvoiceModalOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Invoice Details</h2>
            <div className="border rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Invoice Number:</span>
                <span className="font-medium">KM-INV-{rental.id.toString().padStart(4, '0')}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Shop Name:</span>
                <span className="font-medium">{rental.shopName}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Rent Period:</span>
                <span className="font-medium">
                  {format(new Date(rental.startDate), "MMM yyyy")} - {format(new Date(rental.dueDate), "MMM yyyy")}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Amount:</span>
                <span className="font-medium">₹ {rental.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className={rental.isPaid ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {rental.isPaid ? "Paid" : "Unpaid"}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Your invoice is ready to download. This document contains all the details of your rental payment.
            </p>
            <Button className="w-full">Download PDF</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
