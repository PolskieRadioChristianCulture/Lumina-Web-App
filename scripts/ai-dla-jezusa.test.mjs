import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getCanonicalDocuments,
  searchKnowledgeHub,
  getDocumentById,
  getTopicsCatalog,
  toCanonicalDocument,
  extractScriptureRefs,
  normalizeText
} from '../services/ai-dla-jezusa/knowledge-hub.js';
import { handleAiDlaJezusaApi } from '../services/ai-dla-jezusa/api-v1.js';
import { openApiSpec } from '../services/ai-dla-jezusa/openapi.js';

test('AI DLA JEZUSA [Etap 1]: CanonicalDocument contract conformity', () => {
  const docs = getCanonicalDocuments();
  assert.ok(docs.length >= 300, `Knowledge Hub should have at least 300 documents, got ${docs.length}`);

  for (const doc of docs.slice(0, 50)) {
    assert.ok(doc.id && doc.id.startsWith('cc:'), `Invalid doc id: ${doc.id}`);
    assert.equal(doc.version, 1);
    assert.ok(['page', 'article', 'scripture', 'course', 'audio', 'video', 'app'].includes(doc.type), `Unexpected type: ${doc.type}`);
    assert.ok(doc.title && doc.title.length > 0, 'Missing title');
    assert.equal(doc.language, 'pl');
    assert.ok(doc.canonical_url.startsWith('https://'), `URL must be canonical HTTPS: ${doc.canonical_url}`);
    assert.equal(doc.status, 'published');
    assert.equal(doc.visibility, 'public');
    assert.equal(doc.license, 'owned-or-authorized');
    assert.equal(doc.attribution, 'Christian Culture');
    assert.ok(Array.isArray(doc.tags), 'Tags must be an array');
    assert.ok(Array.isArray(doc.scripture_refs), 'scripture_refs must be an array');
    assert.ok(doc.checksum.startsWith('sha256:'), 'checksum must have sha256 prefix');
    assert.ok(typeof doc.text === 'string', 'text must be string');
  }
});

test('AI DLA JEZUSA [Etap 1]: Scripture ref extraction & text normalization', () => {
  assert.equal(normalizeText('Zażółć Gęślą Jaźń'), 'zazolc gesla jazn');
  assert.equal(normalizeText('Werset Dnia: Łaska'), 'werset dnia: laska');

  const refs = extractScriptureRefs('Czytaj Ewangelia Jana J 3:16 oraz List do Rzymian Rz 8:28 i 1 Kor 13:4-8 dla nadziei');
  assert.ok(refs.some(r => r.includes('3:16')), 'Should extract J 3:16');
  assert.ok(refs.some(r => r.includes('8:28')), 'Should extract Rz 8:28');
});

test('AI DLA JEZUSA [Etap 2]: REST API v1 Health & OpenAPI endpoints', async () => {
  // 1. Health
  const reqHealth = new Request('https://polskieradio.cc/api/ai-dla-jezusa/v1/health', { method: 'GET' });
  const resHealth = await handleAiDlaJezusaApi(reqHealth);
  assert.equal(resHealth.status, 200);
  const healthData = await resHealth.json();
  assert.equal(healthData.status, 'healthy');
  assert.equal(healthData.free_tier_status, 'ZERO_COST_COMPLIANT');
  assert.ok(healthData.index_documents > 300);

  // 2. OpenAPI
  const reqOpenApi = new Request('https://polskieradio.cc/api/ai-dla-jezusa/v1/openapi.json', { method: 'GET' });
  const resOpenApi = await handleAiDlaJezusaApi(reqOpenApi);
  assert.equal(resOpenApi.status, 200);
  const openApiData = await resOpenApi.json();
  assert.equal(openApiData.openapi, '3.1.0');
  assert.ok(openApiData.paths['/search']);
  assert.ok(openApiData.paths['/health']);
  assert.ok(openApiData.paths['/documents/{id}']);
});

test('AI DLA JEZUSA [Etap 2]: REST API v1 Search query, pagination & filtering', async () => {
  // Zapytanie o Apokalipsę
  const reqSearch = new Request('https://polskieradio.cc/api/ai-dla-jezusa/v1/search?q=Apokalipsa&limit=5', { method: 'GET' });
  const resSearch = await handleAiDlaJezusaApi(reqSearch);
  assert.equal(resSearch.status, 200);
  const searchData = await resSearch.json();
  assert.equal(searchData.query, 'Apokalipsa');
  assert.ok(searchData.total > 0, 'Expected results for Apokalipsa');
  assert.ok(searchData.results.length <= 5);

  const topResult = searchData.results[0];
  assert.ok(topResult.document_id);
  assert.ok(topResult.title);
  assert.ok(topResult.url);
  assert.ok(topResult.snippet);
  assert.equal(topResult.license, 'owned-or-authorized');
  assert.equal(topResult.attribution, 'Christian Culture');

  // Puste zapytanie zwraca polecane (featured)
  const reqFeatured = new Request('https://polskieradio.cc/api/ai-dla-jezusa/v1/search', { method: 'GET' });
  const resFeatured = await handleAiDlaJezusaApi(reqFeatured);
  assert.equal(resFeatured.status, 200);
  const featData = await resFeatured.json();
  assert.ok(featData.results.length > 0);
});

test('AI DLA JEZUSA [Etap 2]: Document retrieval & Topics catalog', async () => {
  const docs = getCanonicalDocuments();
  const firstDoc = docs[0];

  // Pobranie po ID
  const reqDoc = new Request(`https://polskieradio.cc/api/ai-dla-jezusa/v1/documents/${encodeURIComponent(firstDoc.id)}`, { method: 'GET' });
  const resDoc = await handleAiDlaJezusaApi(reqDoc);
  assert.equal(resDoc.status, 200);
  const docData = await resDoc.json();
  assert.equal(docData.document.id, firstDoc.id);

  // Pobranie nieistniejącego ID
  const reqMissing = new Request('https://polskieradio.cc/api/ai-dla-jezusa/v1/documents/cc:none:not-found-12345', { method: 'GET' });
  const resMissing = await handleAiDlaJezusaApi(reqMissing);
  assert.equal(resMissing.status, 404);
  const problemData = await resMissing.json();
  assert.equal(problemData.status, 404);
  assert.equal(problemData.title, 'Dokument nie znaleziony');

  // Katalog tematów
  const reqTopics = new Request('https://polskieradio.cc/api/ai-dla-jezusa/v1/topics', { method: 'GET' });
  const resTopics = await handleAiDlaJezusaApi(reqTopics);
  assert.equal(resTopics.status, 200);
  const topicsData = await resTopics.json();
  assert.ok(Array.isArray(topicsData.topics));
  assert.ok(topicsData.topics.length > 0);
});

test('AI DLA JEZUSA [Etap 2]: Security, CORS & Method safety', async () => {
  // CORS OPTIONS
  const reqCors = new Request('https://polskieradio.cc/api/ai-dla-jezusa/v1/search', { method: 'OPTIONS' });
  const resCors = await handleAiDlaJezusaApi(reqCors);
  assert.equal(resCors.status, 204);
  assert.equal(resCors.headers.get('Access-Control-Allow-Origin'), '*');

  // POST method rejected (Read-only API)
  const reqPost = new Request('https://polskieradio.cc/api/ai-dla-jezusa/v1/search', { method: 'POST' });
  const resPost = await handleAiDlaJezusaApi(reqPost);
  assert.equal(resPost.status, 405);
  const prob = await resPost.json();
  assert.equal(prob.status, 405);
  assert.equal(prob.title, 'Metoda niedozwolona');
});
