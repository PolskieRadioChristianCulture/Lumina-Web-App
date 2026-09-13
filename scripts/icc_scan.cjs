/**
 * ICC scanner: create/update Issue "ICC monitor" with report.
 * Uses GITHUB_TOKEN from Actions.
 */
const https = require('https');
const fs = require('fs');

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('GITHUB_TOKEN not set');
  process.exit(1);
}
const repo = process.env.REPO || process.env.GITHUB_REPOSITORY;
if (!repo || !/^[^/]+\/[^/]+$/.test(repo)) {
  console.error('REPO must use the owner/name format');
  process.exit(1);
}
const [owner, repoName] = repo.split('/');

function ghRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        'User-Agent': 'icc-scanner',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${token}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      timeout: 10000,
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (d) => data += d);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('timeout', () => req.destroy(new Error(`GitHub request timed out: ${method} ${path}`)));
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function requireStatus(response, expected, operation) {
  if (response.status !== expected) {
    throw new Error(`${operation} failed with HTTP ${response.status}: ${JSON.stringify(response.body).slice(0, 500)}`);
  }
  return response.body;
}

(async () => {
  try {
    const commits = await ghRequest(`/repos/${owner}/${repoName}/commits?sha=main&per_page=1`);
    const commitsBody = requireStatus(commits, 200, 'commit lookup');
    const latest = Array.isArray(commitsBody) && commitsBody[0] ? commitsBody[0] : null;
    const commitSha = latest ? latest.sha : 'unknown';
    const commitMsg = latest ? latest.commit.message.split('\n')[0] : 'n/a';
    const commitAuthor = latest && latest.commit.author ? latest.commit.author.name : 'n/a';

    let guardian = 'not available';
    if (fs.existsSync('guardian.trim')) {
      guardian = fs.readFileSync('guardian.trim', 'utf8').trim();
    } else if (fs.existsSync('guardian.out')) {
      guardian = fs.readFileSync('guardian.out', 'utf8').trim().slice(0, 3000);
    }
    let health = 'not available';
    if (fs.existsSync('health.trim')) {
      health = fs.readFileSync('health.trim', 'utf8').trim();
    } else if (fs.existsSync('health.out')) {
      health = fs.readFileSync('health.out', 'utf8').trim().slice(0, 3000);
    }

    const bodyText = [
      '📡 PEŁNY MONIT OPERACYJNY [@ICC]',
      '',
      `* 🤖 **Aktywny Agent:** GitHub Actions ICC Scanner`,
      `* 🎯 **Bieżące Zadanie:** Periodic scan / monitoring repo`,
      `* 📦 **Ostatni Commit:** ${commitSha} | ${commitMsg} | autor: ${commitAuthor}`,
      `* 🛡️ **Strażnik Kodu (guardian) (trimmed):**`,
      '```',
      guardian || 'no-guardian-output',
      '```',
      `* 🌐 **Status publicznych endpointów:**`,
      '```',
      health || 'no-health-output',
      '```',
      '',
      `* ⏰ **Checked at:** ${new Date().toISOString()}`,
      '',
      `--`,
      `Automatyczny raport generowany co 15 minut przez workflows/icc-scanner.yml`
    ].join('\n');

    const searchQ = encodeURIComponent(`repo:${owner}/${repoName} in:title "ICC monitor"`);
    const search = await ghRequest(`/search/issues?q=${searchQ}`);
    const searchBody = requireStatus(search, 200, 'issue search');
    let issueNumber = null;
    if (searchBody.items && searchBody.items.length > 0) {
      issueNumber = searchBody.items[0].number;
    }

    const labelName = 'icc-monitor';
    const labelCheck = await ghRequest(`/repos/${owner}/${repoName}/labels/${encodeURIComponent(labelName)}`);
    if (labelCheck.status === 404) {
      requireStatus(await ghRequest(`/repos/${owner}/${repoName}/labels`, 'POST', { name: labelName, color: '0e8a16', description: 'Automated ICC monitor' }), 201, 'label creation');
    } else {
      requireStatus(labelCheck, 200, 'label lookup');
    }

    if (issueNumber) {
      requireStatus(await ghRequest(`/repos/${owner}/${repoName}/issues/${issueNumber}`, 'PATCH', { body: bodyText }), 200, 'issue update');
      console.log(`Updated issue #${issueNumber}`);
    } else {
      const created = await ghRequest(`/repos/${owner}/${repoName}/issues`, 'POST', {
        title: 'ICC monitor — automated status',
        body: bodyText,
        labels: [labelName],
      });
      if (created.status === 201) {
        console.log(`Created issue #${created.body.number}`);
      } else {
        console.error('Failed to create issue', created);
        process.exit(2);
      }
    }
  } catch (err) {
    console.error('Error in icc_scan:', err);
    process.exit(3);
  }
})();
