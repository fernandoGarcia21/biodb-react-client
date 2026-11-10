export interface HabitatDescriptorCode {
  id: number;
  code: string;
  meaning: string;
  display_order?: number | null;
}

export interface HabitatDescriptor {
  id: number;
  position_number: number;
  name: string;
  allow_multiple: boolean;
  codes: HabitatDescriptorCode[];
}

export interface HabitatDescriptorFilter {
  codes: string[];
  mode: 'ANY' | 'ALL';
}

export type HabitatFilterState = Record<number, HabitatDescriptorFilter>;

export interface HabitatSamplingArea {
  sampling_area_id: number | string;
  sampling_area_name: string;
  location_name: string;
  country_name?: string | null;
  habitat_code?: string | null;
  habitat_structure_id?: number | null;
  habitat_structure_name?: string | null;
  is_contact_zone?: boolean | 'true' | 'false' | '' | null;
}

export function hasActiveHabitatFilters(filters: HabitatFilterState): boolean {
  return Object.values(filters).some((filter) => filter.codes.length > 0);
}

/** Validate the entire stored code, then match only within each descriptor's segment. */
export function matchesHabitatFilters(
  habitatCode: string | null | undefined,
  descriptors: HabitatDescriptor[],
  filters: HabitatFilterState
): boolean {
  if (!hasActiveHabitatFilters(filters)) return true;
  if (typeof habitatCode !== 'string' || !descriptors.length) return false;

  const segments = habitatCode.split('-');
  const positions = descriptors.map((descriptor) => descriptor.position_number);
  if (positions.some((position) => !Number.isInteger(position) || position < 1) ||
    new Set(positions).size !== descriptors.length ||
    new Set(descriptors.map((descriptor) => descriptor.id)).size !== descriptors.length ||
    segments.length !== Math.max(...positions) || positions.length !== segments.length) return false;

  const parsed = new Map<number, Set<string>>();
  for (const descriptor of descriptors) {
    const segment = segments[descriptor.position_number - 1];
    const available = new Set(descriptor.codes.map((option) => option.code));
    const codes = Array.from(segment);
    if (!codes.length || new Set(codes).size !== codes.length ||
      codes.some((code) => !available.has(code)) ||
      (!descriptor.allow_multiple && codes.length !== 1) ||
      (codes.includes('U') && codes.length !== 1)) return false;
    parsed.set(descriptor.id, new Set(codes));
  }

  return Object.entries(filters).every(([id, filter]) => {
    if (!filter.codes.length) return true;
    const descriptor = descriptors.find((item) => item.id === Number(id));
    const stored = parsed.get(Number(id));
    if (!descriptor || !stored) return false;
    return descriptor.allow_multiple && filter.mode === 'ALL'
      ? filter.codes.every((code) => stored.has(code))
      : filter.codes.some((code) => stored.has(code));
  });
}

export function filterSamplingAreasByHabitat<T extends Pick<HabitatSamplingArea, 'habitat_code' | 'habitat_structure_id' | 'is_contact_zone'>>(
  samplingAreas: T[],
  descriptors: HabitatDescriptor[],
  filters: HabitatFilterState,
  structureIds: string[] = [],
  contactZone: '' | 'true' | 'false' = ''
): T[] {
  return samplingAreas.filter((area) => {
    const contact = area.is_contact_zone === true || area.is_contact_zone === 'true'
      ? 'true'
      : area.is_contact_zone === false || area.is_contact_zone === 'false' ? 'false' : '';
    return matchesHabitatFilters(area.habitat_code, descriptors, filters) &&
      (!structureIds.length || (area.habitat_structure_id != null && structureIds.includes(String(area.habitat_structure_id)))) &&
      (!contactZone || contact === contactZone);
  });
}

/** Select every match for active habitat filters; preserve selections when clearing. */
export function reconcileHabitatSamplingAreas(
  selected: string[],
  available: HabitatSamplingArea[],
  active: boolean
): string[] {
  if (!active) return selected;
  return available.map((area) => String(area.sampling_area_id));
}
