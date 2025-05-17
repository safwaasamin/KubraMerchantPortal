import { useQuery } from "@tanstack/react-query";
import { Merchant } from "@/lib/types";

export function useMerchant() {
  const { data: merchant, isLoading } = useQuery<Merchant | null>({
    queryKey: ["/api/auth/current-merchant"],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  return {
    merchant,
    loading: isLoading,
  };
}
