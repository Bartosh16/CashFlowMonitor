"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings } from "@/lib/db/repositories/settings";
import type { Settings } from "@/lib/types";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: getSettings
  });
}

export function useUpdateSettings() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<Settings>) => updateSettings(values),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["settings"] });
    }
  });
}
