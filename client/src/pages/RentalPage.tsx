import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RentalSummary } from "@/components/rental/RentalSummary";
import { MaintenanceForm } from "@/components/rental/MaintenanceForm";

const RentalPage: React.FC = () => {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  
  const handleMakePayment = () => {
    setPaymentModalOpen(true);
  };

  return (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-5">Rental Maintenance</h2>
      
      <RentalSummary onMakePayment={handleMakePayment} />
      
      <MaintenanceForm />
      
      {/* Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="p-4">
            <div className="mb-5 flex items-center">
              <h2 className="text-xl font-semibold text-gray-800">Make Payment</h2>
            </div>
            
            {/* Payment Details */}
            <div className="bg-white rounded-lg overflow-hidden mb-6">
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-sm text-gray-500">Rent Due</div>
                    <div className="font-medium text-primary">₹ 12,000</div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-sm text-gray-500">Due Date</div>
                    <div className="text-red-500">20 Apr 2025</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-gray-500">Invoice ID</div>
                    <div>KM-INV-0485</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment Method Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Payment Method</h3>
              
              <div className="flex items-center p-4 border rounded-lg bg-primary-light/20 border-primary">
                <input
                  type="radio"
                  name="payment-method"
                  className="h-4 w-4 text-primary focus:ring-primary"
                  defaultChecked
                />
                <span className="ml-3 font-medium text-gray-700">UPI</span>
              </div>
              
              <div className="p-4 border rounded-lg border-gray-200">
                <label htmlFor="upi-id" className="sr-only">UPI ID</label>
                <input
                  id="upi-id"
                  type="text"
                  placeholder="UPI ID"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="payment-method"
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <span className="ml-3 font-medium text-gray-700">Card</span>
              </div>
              
              <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="payment-method"
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <span className="ml-3 font-medium text-gray-700">Net Banking</span>
              </div>
              
              <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="payment-method"
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <span className="ml-3 font-medium text-gray-700">Wallet</span>
              </div>
              
              <div className="flex flex-col gap-3 mt-6">
                <button className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium transition-colors">
                  Pay Now
                </button>
                
                <button 
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  onClick={() => setPaymentModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RentalPage;
