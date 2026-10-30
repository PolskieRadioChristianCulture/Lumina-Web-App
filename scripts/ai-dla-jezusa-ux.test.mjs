import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('AI DLA JEZUSA [Etap 4]: MCP UX elements present in wyszukiwarka.html', () => {
  const html = fs.readFileSync('wyszukiwarka.html', 'utf8');

  // Trigger button
  assert.ok(html.includes('id="ccwMcpOpenBtn"'), 'Missing #ccwMcpOpenBtn');
  assert.ok(html.includes('data-i18n="mcp_btn"'), 'Missing data-i18n="mcp_btn"');

  // Dialog element
  assert.ok(html.includes('id="ccwMcpDialog"'), 'Missing #ccwMcpDialog');
  assert.ok(html.includes('data-i18n="mcp_title"'), 'Missing data-i18n="mcp_title"');
  assert.ok(html.includes('data-i18n="mcp_desc"'), 'Missing data-i18n="mcp_desc"');
  assert.ok(html.includes('id="ccwMcpCopyBtn"'), 'Missing #ccwMcpCopyBtn');
  assert.ok(html.includes('id="ccwMcpCloseBtn"'), 'Missing #ccwMcpCloseBtn');
  assert.ok(html.includes('https://polskieradio.cc/api/ai-dla-jezusa/v1/mcp/sse'), 'Missing Remote MCP SSE URL');
});

test('AI DLA JEZUSA [Etap 4]: i18n dictionary contains MCP keys in PL, EN, DE', () => {
  const js = fs.readFileSync('js/ekocc-i18n-core.js', 'utf8');
  assert.ok(js.includes('mcp_btn: "Połącz z AI (MCP)"'), 'Missing PL mcp_btn');
  assert.ok(js.includes('mcp_btn: "Connect with AI (MCP)"'), 'Missing EN mcp_btn');
  assert.ok(js.includes('mcp_btn: "Mit KI verbinden (MCP)"'), 'Missing DE mcp_btn');
  assert.ok(js.includes('mcp_copy_config:'), 'Missing mcp_copy_config');
});
