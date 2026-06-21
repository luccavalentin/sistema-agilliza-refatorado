// Dispara a rehidratação da store após mount no cliente.
// Necessário porque o store usa `skipHydration: true` para evitar mismatch SSR.
import { useEffect } from "react";
import { useDB } from "./store";

export function DataHydrationGate() {
  useEffect(() => {
    void useDB.persist.rehydrate();
  }, []);
  return null;
}
