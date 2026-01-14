#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');

const argv = yargs(hideBin(process.argv))
  .option('table', { type: 'string', demandOption: true })
  .option('dir', { type: 'string', demandOption: true })
  .option('region', { type: 'string', default: process.env.AWS_REGION || 'eu-west-2' })
  .option('concurrency', { type: 'number', default: 4 })
  .strict()
  .argv;

const TABLE = argv.table;
const DIR = argv.dir;

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: argv.region }), {
  marshallOptions: { removeUndefinedValues: true }
});

function listFromCell(v) {
  if (!v) return [];
  const s = String(v).trim();
  if (!s) return [];
  // Tabiya lists are \n-separated and values cannot contain new lines.
  return s.split('\n').map(x => x.trim()).filter(Boolean);
}

function firstUuid(uuidHistoryCell) {
  const h = listFromCell(uuidHistoryCell);
  return h[0] || null;
}

function normaliseAlias(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9' -]/g, '');
}

function mustFile(name) {
  return path.join(DIR, name);
}

async function readCsv(filePath) {
  return new Promise((resolve, reject) => {
    const records = [];
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => records.push(row))
      .on('end', () => resolve(records))
      .on('error', reject);
  });
}

async function batchWriteAll(items) {
  // DynamoDB BatchWrite max 25 items per request.
  const chunks = [];
  for (let i = 0; i < items.length; i += 25) chunks.push(items.slice(i, i + 25));

  const pLimit = (await import('p-limit')).default;
  const limit = pLimit(argv.concurrency);
  let written = 0;

  await Promise.all(chunks.map(chunk => limit(async () => {
    let req = {
      RequestItems: {
        [TABLE]: chunk.map(Item => ({ PutRequest: { Item } }))
      }
    };

    // Retry unprocessed with backoff.
    for (let attempt = 0; attempt < 8; attempt++) {
      const resp = await ddb.send(new BatchWriteCommand(req));
      const unprocessed = resp.UnprocessedItems && resp.UnprocessedItems[TABLE] ? resp.UnprocessedItems[TABLE] : [];
      if (!unprocessed.length) break;

      await new Promise(r => setTimeout(r, 50 * Math.pow(2, attempt)));
      req = { RequestItems: { [TABLE]: unprocessed } };
    }

    written += chunk.length;
    if (written % 5000 < 25) {
      console.log(`Written ~${written} items`);
    }
  })));
}

function makeAliasItems(entityType, uuid, preferredLabel, altLabels) {
  const aliases = new Set();
  if (preferredLabel) aliases.add(preferredLabel);
  for (const a of (altLabels || [])) aliases.add(a);

  const items = [];
  for (const a of aliases) {
    const norm = normaliseAlias(a);
    if (!norm) continue;
    items.push({
      PK: `ALIAS#${norm}`,
      SK: `TARGET#${entityType}#${uuid}`,
      type: 'alias',
      targetType: entityType,
      targetUuid: uuid,
      preferredLabel: preferredLabel || a,
      GSI2PK: `ALIAS#${norm}`,
      GSI2SK: `TYPE#${entityType}#LABEL#${(preferredLabel || '').slice(0, 180)}`
    });
  }
  return items;
}

/**
 * Build lookup maps from Tabiya "ID" -> current UUID
 * Needed because relation CSVs reference IDs not UUIDs.
 */
function indexIdToUuid(skills, skillGroups, occupations, iscoGroups) {
  const map = new Map();

  for (const s of skills) map.set(`skill:${s.ID}`, firstUuid(s.UUIDHISTORY));
  for (const sg of skillGroups) map.set(`skillgroup:${sg.ID}`, firstUuid(sg.UUIDHISTORY));
  for (const o of occupations) map.set(`${o.OCCUPATIONTYPE || 'escooccupation'}:${o.ID}`, firstUuid(o.UUIDHISTORY));
  for (const ig of iscoGroups) map.set(`iscogroup:${ig.ID}`, firstUuid(ig.UUIDHISTORY));

  return map;
}

function skillItem(r) {
  const uuid = firstUuid(r.UUIDHISTORY);
  const altLabels = listFromCell(r.ALTLABELS);
  return {
    PK: `SKILL#${uuid}`,
    SK: 'META',
    type: 'skill',
    id: r.ID,
    uuid,
    uuidHistory: listFromCell(r.UUIDHISTORY),
    originUri: r.ORIGINURI || null,
    preferredLabel: r.PREFERREDLABEL || null,
    altLabels,
    description: r.DESCRIPTION || null,
    definition: r.DEFINITION || null,
    scopeNote: r.SCOPENOTE || null,
    skillType: (r.SKILLTYPE || '').trim() || null,
    reuseLevel: (r.REUSELEVEL || '').trim() || null,
    createdAt: r.CREATEDAT || null,
    updatedAt: r.UPDATEDAT || null,
    GSI1PK: `ID#${r.ID}`,
    GSI1SK: 'TYPE#skill'
  };
}

function skillGroupItem(r) {
  const uuid = firstUuid(r.UUIDHISTORY);
  const altLabels = listFromCell(r.ALTLABELS);
  return {
    PK: `SKILLGROUP#${uuid}`,
    SK: 'META',
    type: 'skillgroup',
    id: r.ID,
    uuid,
    uuidHistory: listFromCell(r.UUIDHISTORY),
    originUri: r.ORIGINURI || null,
    code: r.CODE || null,
    preferredLabel: r.PREFERREDLABEL || null,
    altLabels,
    description: r.DESCRIPTION || null,
    scopeNote: r.SCOPENOTE || null,
    createdAt: r.CREATEDAT || null,
    updatedAt: r.UPDATEDAT || null,
    GSI1PK: `ID#${r.ID}`,
    GSI1SK: 'TYPE#skillgroup'
  };
}

function occupationItem(r) {
  const uuid = firstUuid(r.UUIDHISTORY);
  const altLabels = listFromCell(r.ALTLABELS);
  const occType = (r.OCCUPATIONTYPE || 'escooccupation').trim();
  return {
    PK: `OCC#${uuid}`,
    SK: 'META',
    type: occType,
    id: r.ID,
    uuid,
    uuidHistory: listFromCell(r.UUIDHISTORY),
    originUri: r.ORIGINURI || null,
    iscoGroupCode: r.ISCOGROUPCODE || null,
    code: r.CODE || null,
    preferredLabel: r.PREFERREDLABEL || null,
    altLabels,
    description: r.DESCRIPTION || null,
    definition: r.DEFINITION || null,
    scopeNote: r.SCOPENOTE || null,
    regulatedProfessionNote: r.REGULATEDPROFESSIONNOTE || null,
    isLocalized: (String(r.ISLOCALIZED || '').toLowerCase() === 'true'),
    createdAt: r.CREATEDAT || null,
    updatedAt: r.UPDATEDAT || null,
    GSI1PK: `ID#${r.ID}`,
    GSI1SK: `TYPE#${occType}`
  };
}

function iscoGroupItem(r) {
  const uuid = firstUuid(r.UUIDHISTORY);
  const altLabels = listFromCell(r.ALTLABELS);
  return {
    PK: `ISCO#${uuid}`,
    SK: 'META',
    type: 'iscogroup',
    id: r.ID,
    uuid,
    uuidHistory: listFromCell(r.UUIDHISTORY),
    originUri: r.ORIGINURI || null,
    code: r.CODE || null,
    preferredLabel: r.PREFERREDLABEL || null,
    altLabels,
    description: r.DESCRIPTION || null,
    createdAt: r.CREATEDAT || null,
    updatedAt: r.UPDATEDAT || null,
    GSI1PK: `ID#${r.ID}`,
    GSI1SK: 'TYPE#iscogroup'
  };
}

function modelInfoItem(r) {
  // Single item only.
  const uuid = firstUuid(r.UUIDHISTORY) || 'MODEL';
  return {
    PK: `MODEL#${uuid}`,
    SK: 'META',
    type: 'model_info',
    uuid,
    uuidHistory: listFromCell(r.UUIDHISTORY),
    name: r.NAME || null,
    locale: r.LOCALE || null,
    description: r.DESCRIPTION || null,
    version: r.VERSION || null,
    released: (String(r.RELEASED || '').toLowerCase() === 'true'),
    releaseNotes: r.RELEASENOTES || null,
    createdAt: r.CREATEDAT || null,
    updatedAt: r.UPDATEDAT || null
  };
}

function edgeItem(parentType, parentUuid, childType, childUuid, edgeType, extra = {}) {
  return {
    PK: `PARENT#${parentType}#${parentUuid}`,
    SK: `CHILD#${childType}#${childUuid}`,
    type: 'edge',
    edgeType,
    parentType,
    parentUuid,
    childType,
    childUuid,
    ...extra
  };
}

async function main() {
  // Read base entity files first.
  const [
    skills,
    skillGroups,
    occupations,
    iscoGroups
  ] = await Promise.all([
    readCsv(mustFile('skills.csv')),
    readCsv(mustFile('skillGroups.csv')),
    readCsv(mustFile('occupations.csv')),
    readCsv(mustFile('iscogroups.csv'))
  ]);

  const idToUuid = indexIdToUuid(skills, skillGroups, occupations, iscoGroups);

  const items = [];

  // Model info (optional)
  const modelInfoPath = mustFile('model_info.csv');
  if (fs.existsSync(modelInfoPath)) {
    const mi = await readCsv(modelInfoPath);
    if (mi[0]) items.push(modelInfoItem(mi[0]));
  }

  // Skills + aliases
  for (const r of skills) {
    const it = skillItem(r);
    items.push(it, ...makeAliasItems('skill', it.uuid, it.preferredLabel, it.altLabels));
  }

  // Skill groups + aliases
  for (const r of skillGroups) {
    const it = skillGroupItem(r);
    items.push(it, ...makeAliasItems('skillgroup', it.uuid, it.preferredLabel, it.altLabels));
  }

  // Occupations + aliases
  for (const r of occupations) {
    const it = occupationItem(r);
    items.push(it, ...makeAliasItems(it.type, it.uuid, it.preferredLabel, it.altLabels));
  }

  // ISCO groups + aliases
  for (const r of iscoGroups) {
    const it = iscoGroupItem(r);
    items.push(it, ...makeAliasItems('iscogroup', it.uuid, it.preferredLabel, it.altLabels));
  }

  console.log(`Base entities+aliases items: ${items.length}`);

  // Skill hierarchy edges
  const skillHierarchy = await readCsv(mustFile('skills_hierarchy.csv'));
  for (const r of skillHierarchy) {
    const pType = r.PARENTOBJECTTYPE.trim(); // skill or skillgroup
    const cType = r.CHILDOBJECTTYPE.trim();  // skill or skillgroup
    const parentUuid = idToUuid.get(`${pType}:${r.PARENTID}`);
    const childUuid = idToUuid.get(`${cType}:${r.CHILDID}`);
    if (!parentUuid || !childUuid) continue;

    items.push(edgeItem(
      pType, parentUuid,
      cType, childUuid,
      'skill_hierarchy',
      { parentId: r.PARENTID, childId: r.CHILDID }
    ));
  }

  // Occupation hierarchy edges
  const occHierarchy = await readCsv(mustFile('occupations_hierarchy.csv'));
  for (const r of occHierarchy) {
    const pType = r.PARENTOBJECTTYPE.trim(); // iscogroup, escooccupation, localoccupation
    const cType = r.CHILDOBJECTTYPE.trim();
    const parentUuid = idToUuid.get(`${pType}:${r.PARENTID}`);
    const childUuid = idToUuid.get(`${cType}:${r.CHILDID}`);
    if (!parentUuid || !childUuid) continue;

    items.push(edgeItem(
      pType, parentUuid,
      cType, childUuid,
      'occupation_hierarchy',
      { parentId: r.PARENTID, childId: r.CHILDID }
    ));
  }

  // Occupation-to-skill edges
  const occSkill = await readCsv(mustFile('occupation_skill_relations.csv'));
  for (const r of occSkill) {
    const occType = (r.OCCUPATIONTYPE || 'escooccupation').trim();
    const occUuid = idToUuid.get(`${occType}:${r.OCCUPATIONID}`);
    const skillUuid = idToUuid.get(`skill:${r.SKILLID}`);
    if (!occUuid || !skillUuid) continue;

    const rel = (r.RELATIONTYPE || '').trim(); // essential|optional
    items.push({
      PK: `OCC#${occUuid}`,
      SK: `SKILL#${rel}#${skillUuid}`,
      type: 'edge',
      edgeType: 'occ_skill',
      relationType: rel,
      occType,
      occUuid,
      skillUuid,
      occId: r.OCCUPATIONID,
      skillId: r.SKILLID,
      createdAt: r.CREATEDAT || null,
      updatedAt: r.UPDATEDAT || null
    });
  }

  // Skill-to-skill edges (optional)
  const skillSkill = await readCsv(mustFile('skill_skill_relations.csv'));
  for (const r of skillSkill) {
    const requiringUuid = idToUuid.get(`skill:${r.REQUIRINGID}`);
    const requiredUuid = idToUuid.get(`skill:${r.REQUIREDID}`);
    if (!requiringUuid || !requiredUuid) continue;

    const rel = (r.RELATIONTYPE || '').trim(); // essential|optional
    items.push({
      PK: `SKILL#${requiringUuid}`,
      SK: `REQ#${rel}#${requiredUuid}`,
      type: 'edge',
      edgeType: 'skill_skill',
      relationType: rel,
      requiringUuid,
      requiredUuid,
      requiringId: r.REQUIRINGID,
      requiredId: r.REQUIREDID,
      createdAt: r.CREATEDAT || null,
      updatedAt: r.UPDATEDAT || null
    });
  }

  console.log(`Total items to write: ${items.length}`);
  await batchWriteAll(items);
  console.log('Done');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
