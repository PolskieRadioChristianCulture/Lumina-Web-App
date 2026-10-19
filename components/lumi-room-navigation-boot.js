import { mountRoomNavigation } from './lumi-room-navigation.js?v=20261019_family1';
const start = () => mountRoomNavigation(document, { onFamily: async () => {
    const { openFamilyPanel } = await import('./lumi-family-host.js?v=20261019_family1');
    openFamilyPanel();
} });
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
