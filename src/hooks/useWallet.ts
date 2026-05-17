/**
 * useWallet.ts
 * ─────────────
 * Freighter wallet hook via @creit.tech/stellar-wallets-kit.
 *
 * Provides:
 * - connect()        — open wallet selector modal
 * - disconnect()     — clear wallet state
 * - signTransaction() — sign a Stellar XDR transaction
 * - address          — connected public key (G...)
 * - isConnected      — boolean
 * - isLoading        — connecting / fetching state
 */

import { useState, useCallback, useRef } from "react";
import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  allowAllModules,
} from "@creit.tech/stellar-wallets-kit";

const NETWORK =
  (import.meta.env.VITE_NETWORK as string | undefined) ?? "TESTNET";

const walletNetwork =
  NETWORK === "PUBLIC" ? WalletNetwork.PUBLIC : WalletNetwork.TESTNET;

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (xdr: string) => Promise<string>;
}

export function useWallet(): WalletState {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const kitRef = useRef<StellarWalletsKit | null>(null);

  const getKit = useCallback(() => {
    if (!kitRef.current) {
      kitRef.current = new StellarWalletsKit({
        network: walletNetwork,
        selectedWalletId: FREIGHTER_ID,
        modules: allowAllModules(),
      });
    }
    return kitRef.current;
  }, []);

  const connect = useCallback(async () => {
    setIsLoading(true);
    try {
      const kit = getKit();

      await new Promise<void>((resolve, reject) => {
        kit.openModal({
          onWalletSelected: async (option) => {
            kit.setWallet(option.id);
            resolve();
          },
          onClosed: () => reject(new Error("Modal closed")),
        });
      });

      const { address: addr } = await kit.getAddress();
      setAddress(addr);
    } catch (err) {
      // User closed modal — not an error
      if (err instanceof Error && err.message !== "Modal closed") {
        console.error("[useWallet] connect error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getKit]);

  const disconnect = useCallback(() => {
    setAddress(null);
    kitRef.current = null;
  }, []);

  const signTransaction = useCallback(
    async (xdr: string): Promise<string> => {
      if (!address) throw new Error("Wallet not connected");
      const kit = getKit();
      const { signedTxXdr } = await kit.signTransaction(xdr, {
        address,
        networkPassphrase:
          walletNetwork === WalletNetwork.PUBLIC
            ? "Public Global Stellar Network ; September 2015"
            : "Test SDF Network ; September 2015",
      });
      return signedTxXdr;
    },
    [address, getKit]
  );

  return {
    address,
    isConnected: !!address,
    isLoading,
    connect,
    disconnect,
    signTransaction,
  };
}
