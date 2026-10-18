import { DurableObject } from 'cloudflare:workers';

// LOCAL LAB ONLY. These labels are fixtures, never real accounts or user UIDs.
const MEMBERS = ['demo-a', 'demo-b'];
export class PresenceLab extends DurableObject {
    async fetch(request) {
        if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') return new Response('WebSocket required', { status: 426 });
        const member = new URL(request.url).searchParams.get('member');
        if (!MEMBERS.includes(member)) return new Response('Fixture required', { status: 403 });
        if (this.ctx.getWebSockets().length >= 8) return new Response('Lab full', { status: 429 });
        const [client, server] = Object.values(new WebSocketPair());
        this.ctx.acceptWebSocket(server);
        server.serializeAttachment({ member, lastSeen: Date.now(), closed: false });
        await this.publish();
        return new Response(null, { status: 101, webSocket: client });
    }
    async webSocketMessage(ws, message) {
        if (message !== 'heartbeat') { ws.close(1008, 'Heartbeat only'); return; }
        const state = ws.deserializeAttachment();
        // A client cannot choose another identity or post chat contents.
        if (Date.now() - state.lastSeen < 1000) return;
        ws.serializeAttachment({ ...state, lastSeen: Date.now() });
        await this.publish();
    }
    async webSocketClose(ws) {
        ws.serializeAttachment({ ...ws.deserializeAttachment(), closed: true });
        await this.publish();
    }
    async webSocketError(ws) { await this.webSocketClose(ws); }
    async alarm() { await this.publish(); }
    async publish() {
        const now = Date.now();
        const sockets = this.ctx.getWebSockets();
        const active = sockets.map(ws => ws.deserializeAttachment()).filter(s => !s.closed && s.lastSeen + 90000 > now);
        const payload = JSON.stringify({ demo: true, checkedAt: now,
            members: MEMBERS.map(member => ({ member, online: active.some(s => s.member === member) })) });
        for (const ws of sockets) { try { ws.send(payload); } catch (_) {} }
        if (active.length) await this.ctx.storage.setAlarm(Math.min(...active.map(s => s.lastSeen + 90000)));
        else await this.ctx.storage.deleteAlarm();
    }
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        // Production stays disabled even if this isolated package is accidentally deployed.
        if (env.PRESENCE_PILOT_MODE !== 'local-fixtures' || !['localhost', '127.0.0.1'].includes(url.hostname)) {
            return new Response('Pilot disabled', { status: 503 });
        }
        if (!['/lab/one', '/lab/two'].includes(url.pathname)) return new Response('Not found', { status: 404 });
        if (request.headers.get('Origin') && !['http://localhost:8787', 'http://127.0.0.1:8787'].includes(request.headers.get('Origin'))) {
            return new Response('Origin denied', { status: 403 });
        }
        const stub = env.PRESENCE_LAB.getByName(url.pathname);
        return stub.fetch(request);
    }
};
