/**
 * Firebase Hosting Pre-flight Check & Provisioning Guard (October 2026 Deprecation Mitigation)
 * 
 * Background:
 * Starting October 15, 2026, Firebase no longer auto-creates a default hosting site
 * for new projects. Automated deployments without explicit site provisioning fail with
 * 'HTTP 404 Site Not Found'.
 * 
 * This tool:
 * 1. Analyzes local firebase.json & .firebaserc files.
 * 2. Identifies targeted vs untargeted sites and implicit default assumptions.
 * 3. Can run safe pre-flight checks before 'firebase deploy'.
 * 4. Outputs exact, zero-cost remediation commands.
 * 
 * Safety: Runs offline / dry-run by default without external changes unless explicitly requested.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export function inspectFirebaseConfig(repoDir) {
  const firebaseJsonPath = path.join(repoDir, 'firebase.json');
  const firebasercPath = path.join(repoDir, '.firebaserc');

  const result = {
    repoDir,
    hasFirebaseJson: fs.existsSync(firebaseJsonPath),
    hasFirebaserc: fs.existsSync(firebasercPath),
    projects: {},
    targets: {},
    hostingConfigs: [],
    vulnerabilities: [],
    remediations: []
  };

  if (!result.hasFirebaseJson) {
    return result;
  }

  try {
    const rawJson = fs.readFileSync(firebaseJsonPath, 'utf8');
    const parsedJson = JSON.parse(rawJson);
    const hosting = parsedJson.hosting;

    if (Array.isArray(hosting)) {
      result.hostingConfigs = hosting.map((h, idx) => ({
        index: idx,
        target: h.target || null,
        site: h.site || null,
        public: h.public || null
      }));
    } else if (hosting && typeof hosting === 'object') {
      result.hostingConfigs = [{
        index: 0,
        target: hosting.target || null,
        site: hosting.site || null,
        public: hosting.public || null
      }];
    }
  } catch (err) {
    result.vulnerabilities.push(`Failed to parse firebase.json: ${err.message}`);
  }

  if (result.hasFirebaserc) {
    try {
      const rawRc = fs.readFileSync(firebasercPath, 'utf8');
      const parsedRc = JSON.parse(rawRc);
      result.projects = parsedRc.projects || {};
      result.targets = {};
      // Targets can be per project: targets[projectId].hosting[targetName]
      if (parsedRc.targets) {
        for (const [projOrKey, val] of Object.entries(parsedRc.targets)) {
          if (val && val.hosting) {
            for (const [targetName, sites] of Object.entries(val.hosting)) {
              result.targets[targetName] = (result.targets[targetName] || []).concat(sites);
            }
          } else if (projOrKey === 'hosting' && typeof val === 'object') {
            for (const [targetName, sites] of Object.entries(val)) {
              result.targets[targetName] = (result.targets[targetName] || []).concat(sites);
            }
          }
        }
      }
    } catch (err) {
      result.vulnerabilities.push(`Failed to parse .firebaserc: ${err.message}`);
    }
  }

  // Vulnerability Analysis
  for (const h of result.hostingConfigs) {
    if (!h.target && !h.site) {
      result.vulnerabilities.push(
        `Hosting config at index ${h.index} has neither 'site' nor 'target' specified. It assumes the default project-id site, which will NOT exist automatically for new projects created after Oct 15, 2026.`
      );
      const defaultProject = result.projects.default || '<project-id>';
      result.remediations.push({
        type: 'explicit_site_or_create',
        description: `Explicitly set 'site': '${defaultProject}' in firebase.json OR create site via CLI before first deploy.`,
        command: `firebase hosting:sites:create ${defaultProject} --project=${defaultProject}`
      });
    } else if (h.target) {
      const mappedSites = result.targets[h.target] || [];
      if (mappedSites.length === 0) {
        result.vulnerabilities.push(
          `Hosting target '${h.target}' has no mapped sites in .firebaserc. Any new project will fail to deploy.`
        );
      } else {
        for (const mapped of mappedSites) {
          result.remediations.push({
            type: 'verify_site_exists',
            site: mapped,
            target: h.target,
            command: `firebase hosting:sites:create ${mapped} --project=${result.projects.default || '<project-id>'}`
          });
        }
      }
    }
  }

  return result;
}

export function auditAllRepositories(baseDir) {
  const reports = [];
  if (!fs.existsSync(baseDir)) return reports;

  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subPath = path.join(baseDir, entry.name);
      if (fs.existsSync(path.join(subPath, 'firebase.json'))) {
        reports.push(inspectFirebaseConfig(subPath));
      }
    }
  }
  return reports;
}

// CLI Execution
if (process.argv[1] && process.argv[1].endsWith('firebase-hosting-preflight.mjs')) {
  const isAuditAll = process.argv.includes('--audit-all');
  const targetDir = process.cwd();

  if (isAuditAll) {
    const parentDir = path.resolve(targetDir, '..');
    console.log(`Auditing all Christian Culture repositories in: ${parentDir}\n`);
    const results = auditAllRepositories(parentDir);
    for (const r of results) {
      console.log(`=== Repository: ${path.basename(r.repoDir)} ===`);
      console.log(`  Hosting configs: ${r.hostingConfigs.length}`);
      console.log(`  Vulnerabilities: ${r.vulnerabilities.length}`);
      r.vulnerabilities.forEach(v => console.log(`   ⚠️  ${v}`));
      if (r.remediations.length > 0) {
        console.log(`  Recommended Remediation Commands:`);
        r.remediations.forEach(rem => console.log(`    👉 ${rem.command}`));
      }
      console.log('');
    }
  } else {
    console.log(`Auditing current repository: ${targetDir}\n`);
    const r = inspectFirebaseConfig(targetDir);
    console.log(`Hosting configs: ${r.hostingConfigs.length}`);
    console.log(`Vulnerabilities: ${r.vulnerabilities.length}`);
    r.vulnerabilities.forEach(v => console.log(` ⚠️  ${v}`));
    if (r.remediations.length > 0) {
      console.log(`\nRecommended Remediation Commands:`);
      r.remediations.forEach(rem => console.log(`  👉 ${rem.command}`));
    } else {
      console.log(`✅ All hosting configurations have explicit sites/targets defined.`);
    }
  }
}
