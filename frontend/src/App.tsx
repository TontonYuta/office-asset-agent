/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './hooks/useAuth';
import { InventoryProvider } from './hooks/useInventory';
import { TicketsProvider } from './hooks/useTickets';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CommandMenu } from './components/layout/CommandMenu';
import { ChatTab } from './components/chat/ChatTab';
import { InventoryTab } from './components/inventory/InventoryTab';
import { AuditWorkbenchTab } from './components/audit/AuditWorkbenchTab';
import { TicketsTab } from './components/tickets/TicketsTab';
import { KnowledgeNotebookTab } from './components/knowledge/KnowledgeNotebookTab';

export function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Phím tắt toàn cục Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (tab: string, assetId?: string) => {
    setActiveTab(tab);
    if (assetId) {
      setSelectedAssetId(assetId);
    }
  };

  const handleSelectForAudit = (assetId: string) => {
    setSelectedAssetId(assetId);
    setActiveTab('audit');
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased overflow-hidden selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-900 transition-colors">
      {/* Cột điều hướng bên trái */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Vùng nội dung chính */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Thanh tiêu đề & chuyển giao diện */}
        <Header activeTab={activeTab} onOpenCommand={() => setIsCommandOpen(true)} />

        {/* Nội dung trang hiện tại */}
        <main className="flex-1 overflow-y-auto p-6 bg-zinc-100/60 dark:bg-zinc-950/90 transition-colors">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'chat' && <ChatTab onNavigateTab={handleNavigate} />}
            {activeTab === 'inventory' && (
              <InventoryTab
                onSelectForAudit={handleSelectForAudit}
                selectedAssetId={selectedAssetId}
              />
            )}
            {activeTab === 'audit' && (
              <AuditWorkbenchTab initialAssetId={selectedAssetId} />
            )}
            {activeTab === 'tickets' && <TicketsTab />}
            {activeTab === 'knowledge' && <KnowledgeNotebookTab />}
          </div>
        </main>
      </div>

      {/* Hộp tìm kiếm nhanh Ctrl+K */}
      <CommandMenu
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        setActiveTab={setActiveTab}
        onSelectAsset={(id) => setSelectedAssetId(id)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InventoryProvider>
          <TicketsProvider>
            <AppContent />
          </TicketsProvider>
        </InventoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
