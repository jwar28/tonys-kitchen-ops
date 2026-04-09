"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type ProductsStatusToastProps = {
  error?: string;
  success?: string;
};

export function ProductsStatusToast({ error, success }: ProductsStatusToastProps) {
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (hasShownRef.current || (!error && !success)) {
      return;
    }

    hasShownRef.current = true;

    const dismissLabel = "Listo";

    if (success) {
      const toastId = toast.success("Operacion completada", {
        description: success,
        duration: 3200,
        action: {
          label: dismissLabel,
          onClick: () => toast.dismiss(toastId),
        },
      });
    }

    if (error) {
      const toastId = toast.error("Revisa la informacion", {
        description: error,
        duration: 4200,
        action: {
          label: dismissLabel,
          onClick: () => toast.dismiss(toastId),
        },
      });
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("success");
    url.searchParams.delete("error");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [error, success]);

  return null;
}
