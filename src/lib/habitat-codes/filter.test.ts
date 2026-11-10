import assert from 'node:assert/strict';
import { test } from 'node:test';
import { filterSamplingAreasByHabitat, matchesHabitatFilters, reconcileHabitatSamplingAreas } from './filter';
import type { HabitatDescriptor, HabitatDescriptorFilter, HabitatFilterState } from './filter';

// Deliberately unordered descriptors and IDs unrelated to their positions.
const descriptors: HabitatDescriptor[] = [
  { id: 30, position_number: 3, name: 'Third', allow_multiple: true, codes: ['M', 'H', 'U'] },
  { id: 10, position_number: 1, name: 'First', allow_multiple: true, codes: ['R', 'B', 'U'] },
  { id: 20, position_number: 2, name: 'Second', allow_multiple: false, codes: ['P', 'M', 'U'] },
].map(descriptor => ({ ...descriptor, codes: descriptor.codes.map((code, id) => ({ id, code, meaning: code })) }));
const filters = (codes: string[], mode: HabitatDescriptorFilter['mode'] = 'ANY'): HabitatFilterState => ({ 10: { codes, mode } });
const areas = ['R-P-M', 'B-M-H', 'RB-P-MH', 'U-U-U', null].map((habitatCode, index) => ({
  sampling_area_id: index + 1,
  sampling_area_name: `Area ${index + 1}`,
  location_name: 'Location',
  habitat_code: habitatCode,
}));
const ids = (value: { sampling_area_id: number }[]): number[] => value.map(area => area.sampling_area_id);

void test('one selected code matches its descriptor only', () => {
  assert.deepEqual(ids(filterSamplingAreasByHabitat(areas, descriptors, filters(['R']))), [1, 3]);
  assert.equal(matchesHabitatFilters('R-M-H', descriptors, { 30: { codes: ['M'], mode: 'ANY' } }), false);
});

void test('ANY uses OR within a descriptor, including composite stored segments', () => {
  assert.deepEqual(ids(filterSamplingAreasByHabitat(areas, descriptors, filters(['R', 'B']))), [1, 2, 3]);
});

void test('ALL requires every selected code in the same descriptor', () => {
  assert.deepEqual(ids(filterSamplingAreasByHabitat(areas, descriptors, filters(['R', 'B'], 'ALL'))), [3]);
});

void test('different descriptor filters are combined using AND', () => {
  assert.deepEqual(ids(filterSamplingAreasByHabitat(areas, descriptors, {
    ...filters(['R']), 30: { codes: ['H'], mode: 'ANY' },
  })), [3]);
});

void test('single-value descriptors allow multiple search alternatives and always use ANY', () => {
  assert.deepEqual(ids(filterSamplingAreasByHabitat(areas, descriptors, { 20: { codes: ['P', 'M'], mode: 'ALL' } })), [1, 2, 3]);
});

void test('Unknown is searchable alone and alongside other alternatives', () => {
  assert.deepEqual(ids(filterSamplingAreasByHabitat(areas, descriptors, filters(['U']))), [4]);
  assert.deepEqual(ids(filterSamplingAreasByHabitat(areas, descriptors, filters(['U', 'R']))), [1, 3, 4]);
});

void test('no active filters, including empty ALL selections, returns all areas without mutation', () => {
  const snapshot = JSON.stringify(areas);
  assert.deepEqual(filterSamplingAreasByHabitat(areas, descriptors, {}), areas);
  assert.deepEqual(filterSamplingAreasByHabitat(areas, descriptors, filters([], 'ALL')), areas);
  assert.equal(JSON.stringify(areas), snapshot);
});

void test('invalid stored codes never match active filters', () => {
  for (const code of [null, undefined, '', 'R', 'R-P', 'R-P-M-X', 'X-P-M', 'RR-P-M', 'RU-P-M', 'R-PM-H', 'R-P-X', ' R-P-M']) {
    assert.equal(matchesHabitatFilters(code, descriptors, filters(['R'])), false, String(code));
  }
});

void test('unknown active descriptors and unavailable configurations do not match', () => {
  assert.equal(matchesHabitatFilters('R-P-M', descriptors, { 99: { codes: ['R'], mode: 'ANY' } }), false);
  assert.equal(matchesHabitatFilters('R-P-M', [], filters(['R'])), false);
  assert.equal(matchesHabitatFilters('R-P-M', descriptors.map(item => ({ ...item, position_number: 1 })), filters(['R'])), false);
});

void test('changing habitat filters updates available sampling areas and clearing restores the list', () => {
  const narrowed = filterSamplingAreasByHabitat(areas, descriptors, filters(['B']));
  assert.deepEqual(ids(narrowed), [2, 3]);
  assert.deepEqual(reconcileHabitatSamplingAreas(['1', '3'], narrowed, true), ['2', '3']);
  assert.deepEqual(reconcileHabitatSamplingAreas([], narrowed, true), ['2', '3']);
  assert.deepEqual(reconcileHabitatSamplingAreas(['1'], narrowed, true), ['2', '3']);
  assert.deepEqual(reconcileHabitatSamplingAreas(['2', '3'], areas.slice(0, 3), true), ['1', '2', '3']);
  assert.deepEqual(reconcileHabitatSamplingAreas(['2', '3'], [], true), []);
  assert.deepEqual(filterSamplingAreasByHabitat(areas, descriptors, {}), areas);
  assert.deepEqual(reconcileHabitatSamplingAreas(['3'], areas, false), ['3']);
});

void test('structure and contact-zone filters combine with habitat codes', () => {
  const structured = areas.map((area, index) => ({
    ...area,
    habitat_structure_id: index === 0 ? 1 : 2,
    is_contact_zone: index === 2,
  }));
  assert.deepEqual(ids(filterSamplingAreasByHabitat(structured, descriptors, {}, ['1', '2'])), [1, 2, 3, 4, 5]);
  assert.deepEqual(ids(filterSamplingAreasByHabitat(structured, descriptors, filters(['R']), ['2'], 'true')), [3]);
  assert.deepEqual(ids(filterSamplingAreasByHabitat(structured, descriptors, filters(['R']), ['1'], 'true')), []);
});

void test('contact-zone filtering accepts booleans and strings without treating unknown as No', () => {
  const values = [true, false, 'true', 'false', '', null] as const;
  const contacts = values.map((is_contact_zone, index) => ({ sampling_area_id: index + 1, is_contact_zone }));
  assert.deepEqual(ids(filterSamplingAreasByHabitat(contacts, [], {}, [], 'true')), [1, 3]);
  assert.deepEqual(ids(filterSamplingAreasByHabitat(contacts, [], {}, [], 'false')), [2, 4]);
  assert.deepEqual(ids(filterSamplingAreasByHabitat(contacts, [], {})), [1, 2, 3, 4, 5, 6]);
});
