import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const pages = [
  'lumina.html',
  'lumina-profile.html',
  'lumina-tablica.html',
  'lumina-tablica-light.html',
  'lumina.cezaryrgowski.html',
  'lumina.wiolettarogowska.html',
];

const sources = await Promise.all(pages.map(async file => [file, await readFile(file, 'utf8')]));

test('message timestamps are HTML-escaped in every active chat renderer', () => {
  for (const [file, source] of sources) {
    assert.match(source, /function formatChatTime\(msg\)/, `${file} keeps the dateStr fallback formatter`);
    assert.doesNotMatch(
      source,
      /\$\{\s*(?:time|readTime|delivTime)\s*\}/,
      `${file} must not interpolate a potentially attacker-controlled timestamp directly into HTML`,
    );
    assert.match(source, /\$\{escapeHtml\(time\)\}/, `${file} escapes rendered chat timestamps`);
  }
});

test('reaction keys and chat identifiers are escaped in generated reaction HTML', () => {
  for (const [file, source] of sources) {
    const reactionBlock = source.match(/function buildMessageReactionsHtml\(msg, type, chatId, myId\) \{[\s\S]*?\n        \}/)?.[0];
    assert.ok(reactionBlock, `${file} has the expected reaction renderer`);
    assert.doesNotMatch(
      reactionBlock,
      /\$\{\s*(?:type|chatId|emojiKey)\s*\}/,
      `${file} must not interpolate untrusted reaction data into HTML or inline JavaScript`,
    );
    assert.match(reactionBlock, /\$\{escapeForInlineJs\(chatId\)\}/, `${file} escapes the reaction chat identifier`);
    assert.match(reactionBlock, /\$\{escapeForInlineJs\(emojiKey\)\}/, `${file} escapes the reaction key in inline JavaScript`);
    assert.match(reactionBlock, /\$\{escapeHtml\(emojiKey\)\}/, `${file} escapes the displayed reaction key`);
  }
});

test('renderChatMedia is defined and used across all Lumina chat renderers and global chat widget', async () => {
  const globalChatSource = await readFile('components/cc-global-chat-button.js', 'utf8');
  assert.match(globalChatSource, /function renderChatMedia\(/, 'cc-global-chat-button.js defines renderChatMedia');
  assert.match(globalChatSource, /\$\{renderChatMedia\(text,\s*m\.id\)\}/, 'cc-global-chat-button.js uses renderChatMedia on escaped text');

  for (const [file, source] of sources) {
    assert.match(source, /function renderChatMedia\(escapedText,\s*msgId\)/, `${file} defines renderChatMedia`);
    assert.match(source, /window\.playChatYoutube\s*=/, `${file} defines window.playChatYoutube`);
    assert.match(source, /renderChatMedia\(escapeHtml\(msg\.text\),\s*msg\.id\)/, `${file} passes escapeHtml(msg.text) to renderChatMedia`);
    assert.match(source, /i\.ytimg\.com\/vi\/.*firstYtId.*\/hqdefault\.jpg/, `${file} renders 16:9 YouTube thumbnail`);
    assert.match(source, /youtube-nocookie\.com\/embed/, `${file} uses privacy-friendly youtube-nocookie embed`);
  }
});

test('renderChatMedia unit tests: url linking, YouTube preview generation, and strict XSS safety', () => {
  // Extract implementation from lumina.html
  const luminaSource = sources.find(([f]) => f === 'lumina.html')[1];
  const fnMatch = luminaSource.match(/function renderChatMedia\(escapedText, msgId\) \{[\s\S]*?\n        \}/);
  assert.ok(fnMatch, 'renderChatMedia implementation found in lumina.html');

  // Eval function in isolated test scope
  const renderChatMedia = new Function('escapedText', 'msgId', `${fnMatch[0]}; return renderChatMedia(escapedText, msgId);`);

  // 1. Plain text without URLs
  const plain = renderChatMedia('Pokój Wam! Pozdrowienia w Chrystusie.', 'm1');
  assert.equal(plain, 'Pokój Wam! Pozdrowienia w Chrystusie.');

  // 2. Regular website URL
  const web = renderChatMedia('Sprawdź stronę: https://polskieradio.cc/akademia!', 'm2');
  assert.match(web, /<a href="https:\/\/polskieradio\.cc\/akademia" target="_blank"/);
  assert.ok(web.endsWith('!'), 'Trailing punctuation is preserved outside anchor');

  // 3. YouTube standard URL
  const ytStandard = renderChatMedia('Zobacz ten film: https://www.youtube.com/watch?v=prZNFB_p5uw', 'm3');
  assert.match(ytStandard, /<a href="https:\/\/www\.youtube\.com\/watch\?v=prZNFB_p5uw"/);
  assert.match(ytStandard, /cc-chat-yt-card/, 'Contains preview card');
  assert.match(ytStandard, /i\.ytimg\.com\/vi\/prZNFB_p5uw\/hqdefault\.jpg/, 'Thumbnail loaded');
  assert.match(ytStandard, /window\.playChatYoutube\('yt_preview_m3', 'prZNFB_p5uw'\)/, 'Play handler attached');

  // 4. YouTube short URL (youtu.be)
  const ytShort = renderChatMedia('Krótki link: https://youtu.be/prZNFB_p5uw', 'm4');
  assert.match(ytShort, /cc-chat-yt-card/);
  assert.match(ytShort, /prZNFB_p5uw/);

  // 5. YouTube Shorts URL
  const ytShorts = renderChatMedia('Shorts: https://youtube.com/shorts/prZNFB_p5uw?feature=share', 'm5');
  assert.match(ytShorts, /cc-chat-yt-card/);
  assert.match(ytShorts, /prZNFB_p5uw/);

  // 6. XSS Injection attack prevention
  const maliciousInput = '&lt;script&gt;alert(1)&lt;/script&gt; &lt;img src=x onerror=alert(2)&gt;';
  const sanitized = renderChatMedia(maliciousInput, 'm6');
  assert.doesNotMatch(sanitized, /<script>/, 'No unescaped script tag');
  assert.doesNotMatch(sanitized, /<img src=x/, 'No unescaped img tag');

  // 7. Malicious YouTube ID with quote/injection attempt
  const malformedInput = 'https://youtu.be/prZNFB_p5u&#039;&gt;&lt;script&gt;alert(1)&lt;/script&gt;';
  const sanitizedMalformed = renderChatMedia(malformedInput, 'm7');
  assert.doesNotMatch(sanitizedMalformed, /<script>/, 'No unescaped script execution');
  assert.doesNotMatch(sanitizedMalformed, /cc-chat-yt-card/, 'Invalid/tampered YouTube ID is rejected and not rendered as preview card');
});

test('every chat message renderer includes an accessible 44px UDOSTĘPNIJ button', async () => {
  const globalChatSource = await readFile('components/cc-global-chat-button.js', 'utf8');
  assert.match(globalChatSource, /class="cc-chat-share-btn"/, 'cc-global-chat-button.js renders cc-chat-share-btn');
  assert.match(globalChatSource, /min-height:\s*44px/, 'cc-global-chat-button.js has min 44px touch target');
  assert.match(globalChatSource, /window\.shareChatMessage/, 'cc-global-chat-button.js wires window.shareChatMessage');

  for (const [file, source] of sources) {
    assert.match(source, /function shareChatMessage\(/, `${file} defines shareChatMessage`);
    assert.match(source, /window\.shareChatMessage\s*=/, `${file} exports window.shareChatMessage`);
    assert.match(source, /window\.openShareMessageModal\s*=/, `${file} exports window.openShareMessageModal`);
    assert.match(source, /class="cc-chat-share-btn"/, `${file} contains cc-chat-share-btn`);
    assert.match(source, /min-height:\s*44px/, `${file} share button satisfies 44px touch ergonomics`);
    assert.match(source, /api\.whatsapp\.com\/send\?text=/, `${file} modal supports WhatsApp sharing`);
    assert.match(source, /t\.me\/share\/url\?/, `${file} modal supports Telegram sharing`);
    assert.match(source, /facebook\.com\/sharer\/sharer\.php\?/, `${file} modal supports Facebook sharing`);
    assert.match(source, /twitter\.com\/intent\/tweet\?/, `${file} modal supports X (Twitter) sharing`);
  }
});

test('public chat is opened first as default tab across ekosystem', async () => {
  const standaloneSource = await readFile('js/lumi-standalone.js', 'utf8');
  assert.match(standaloneSource, /window\.openDirectMessagesModal\('public'\)/, 'lumi-standalone.js opens public chat first');

  const globalChatSource = await readFile('components/cc-global-chat-button.js', 'utf8');
  assert.match(globalChatSource, /setChatPartner\(COMMUNITY_MEMBERS\[0\]\)/, 'cc-global-chat-button.js defaults to community public chat');

  for (const [file, source] of sources) {
    assert.match(
      source,
      /function openDirectMessagesModal\([^)]*\)\s*\{[\s\S]*?(?:preferredTab\s*\|\|\s*['"]public['"]|switchMessengerMainTab\(.*['"]public['"]\))/,
      `${file} defaults openDirectMessagesModal to public tab`,
    );
  }
});


