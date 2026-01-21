"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEntitlements, updateEntitlements } from "@/lib/db/repositories/entitlements";
import type { Plan } from "@/lib/types";

export function useEntitlements() {
  return useQuery({
    queryKey: ["entitlements"],
    queryFn: getEntitlements
  });
}

export function useUpdatePlan() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (plan: Plan) => updateEntitlements(plan),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["entitlements"] });
    }
  });
}
