import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Asset, StockAdjustmentTransaction, StockStatus } from '../types/asset';
import { fetchAssets, INITIAL_ASSETS, adjustStockApi } from '../services/api';

interface InventoryContextType {
  assets: Asset[];
  transactions: StockAdjustmentTransaction[];
  isLoading: boolean;
  adjustStock: (
    assetId: string,
    type: 'IN' | 'OUT',
    quantity: number,
    reason: string,
    performer: string,
    referenceDoc?: string
  ) => { success: boolean; message: string };
  batchAddStock: (
    items: { assetId: string; quantity: number }[],
    reason: string,
    performer: string,
    referenceDoc?: string
  ) => { success: boolean; count: number };
  getAssetById: (id: string) => Asset | undefined;
  addNewAsset: (asset: Asset) => void;
  kpi: {
    totalItems: number;
    totalQuantity: number;
    consumablesCount: number;
    sharedDevicesCount: number;
    totalValuation: number;
    lowStockCount: number;
  };
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [transactions, setTransactions] = useState<StockAdjustmentTransaction[]>([
    {
      id: 'TXN-001',
      assetId: 'VT-101',
      assetName: 'Giấy in Double A A4 70gsm',
      type: 'IN',
      quantity: 50,
      previousStock: 18,
      newStock: 68,
      timestamp: '2026-10-01T10:00:00Z',
      performedBy: 'Trần Huy Hoàng (Phòng HC-QT)',
      reason: 'Nhập định kỳ tháng 10/2026 theo Hóa đơn VAT 004128',
      referenceDoc: 'HĐ-004128',
    },
    {
      id: 'TXN-002',
      assetId: 'VT-101',
      assetName: 'Giấy in Double A A4 70gsm',
      type: 'OUT',
      quantity: 20,
      previousStock: 68,
      newStock: 48,
      timestamp: '2026-10-05T14:30:00Z',
      performedBy: 'Trần Huy Hoàng (Phòng HC-QT)',
      reason: 'Cấp phát cho Phòng Marketing in ấn tài liệu dự án',
      referenceDoc: 'CP-MKT-10',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchAssets().then((data) => {
      if (mounted && data.length > 0) {
        setAssets(data);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const getAssetById = (id: string) => assets.find((a) => a.id === id);

  const calculateNewStatus = (asset: Asset, newStock: number): StockStatus => {
    if (asset.status === 'MAINTENANCE') return 'MAINTENANCE';
    if (newStock <= 0) return 'OUT_OF_STOCK';
    if (newStock <= asset.minSafeStock) return 'LOW_STOCK';
    return 'AVAILABLE';
  };

  const adjustStock = (
    assetId: string,
    type: 'IN' | 'OUT',
    quantity: number,
    reason: string,
    performer: string,
    referenceDoc?: string
  ): { success: boolean; message: string } => {
    if (quantity <= 0) {
      return { success: false, message: 'Số lượng điều chỉnh phải lớn hơn 0' };
    }

    const target = assets.find((a) => a.id === assetId);
    if (!target) {
      return { success: false, message: 'Không tìm thấy vật tư / thiết bị' };
    }

    const previousStock = target.currentStock;
    let newStock = previousStock;

    if (type === 'IN') {
      newStock = previousStock + quantity;
    } else {
      if (previousStock < quantity) {
        return {
          success: false,
          message: `Không đủ tồn kho để xuất. Tồn hiện tại: ${previousStock} ${target.unit}, yêu cầu xuất: ${quantity} ${target.unit}`,
        };
      }
      newStock = previousStock - quantity;
    }

    const updatedStatus = calculateNewStatus(target, newStock);

    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? {
              ...a,
              currentStock: newStock,
              status: updatedStatus,
              lastAudited: new Date().toISOString().split('T')[0],
            }
          : a
      )
    );

    const newTxn: StockAdjustmentTransaction = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      assetId,
      assetName: target.name,
      type,
      quantity,
      previousStock,
      newStock,
      timestamp: new Date().toISOString(),
      performedBy: performer,
      reason,
      referenceDoc,
    };

    setTransactions((prev) => [newTxn, ...prev]);

    // Persist to SQLite backend
    adjustStockApi(assetId, type, quantity, reason, performer, referenceDoc);

    return {
      success: true,
      message: `Đã ${type === 'IN' ? 'nhập' : 'xuất'} thành công ${quantity} ${target.unit}. Tồn kho mới: ${newStock} ${target.unit}`,
    };
  };

  const batchAddStock = (
    items: { assetId: string; quantity: number }[],
    reason: string,
    performer: string,
    referenceDoc?: string
  ) => {
    let count = 0;
    items.forEach((item) => {
      const res = adjustStock(item.assetId, 'IN', item.quantity, reason, performer, referenceDoc);
      if (res.success) count++;
    });
    return { success: count > 0, count };
  };

  const addNewAsset = (newAsset: Asset) => {
    setAssets((prev) => [newAsset, ...prev]);
  };

  const kpi = {
    totalItems: assets.length,
    totalQuantity: assets.reduce((sum, a) => sum + a.currentStock, 0),
    consumablesCount: assets.filter((a) => a.category === 'Vật tư tiêu hao').length,
    sharedDevicesCount: assets.filter((a) => a.category === 'Thiết bị dùng chung').length,
    totalValuation: assets.reduce((sum, a) => sum + a.currentStock * a.unitPrice, 0),
    lowStockCount: assets.filter((a) => a.status === 'LOW_STOCK' || a.status === 'OUT_OF_STOCK').length,
  };

  return (
    <InventoryContext.Provider
      value={{
        assets,
        transactions,
        isLoading,
        adjustStock,
        batchAddStock,
        getAssetById,
        addNewAsset,
        kpi,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory(): InventoryContextType {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
