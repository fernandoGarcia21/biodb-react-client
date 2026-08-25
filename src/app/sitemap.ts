import type { MetadataRoute } from 'next';

export const revalidate = 3600; // Refresh sitemap approximately once per hour

interface EntityWithId {
  id: number | string;
}

async function fetchIds(
  apiUrl: string,
  endpoint: string
): Promise<Array<number | string>> {
  try {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error(
        `Unable to generate sitemap entries from ${endpoint}:`,
        response.status
      );

      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error(
        `Unexpected sitemap API response from ${endpoint}`
      );

      return [];
    }

    return data
      .filter((item: EntityWithId) => item?.id !== undefined && item?.id !== null)
      .map((item: EntityWithId) => item.id);

  } catch (error) {
    console.error(
      `Error retrieving sitemap entries from ${endpoint}:`,
      error
    );

    return [];
  }
}


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8080';

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';


  // ========================================================================
  // STATIC PUBLIC ROUTES
  // ========================================================================

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/dashboard`,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/dashboard/organisms`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/dashboard/projects`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/dashboard/species`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/dashboard/habitats`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/dashboard/location`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/dashboard/samplingarea`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/dashboard/traits`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/dashboard/properties`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/dashboard/externaldatasets`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/dashboard/about`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];


  // ========================================================================
  // GET IDS OF PUBLIC DATABASE OBJECTS
  // ========================================================================

  const [
    projectIds,
    locationIds,
    samplingAreaIds,
    traitIds,
    propertyIds,
    externalDatasetIds,
  ] = await Promise.all([
    fetchIds(apiUrl, '/project'),
    fetchIds(apiUrl, '/location'),
    fetchIds(apiUrl, '/sampling_area'),
    fetchIds(apiUrl, '/trait'),
    fetchIds(apiUrl, '/property'),
    fetchIds(apiUrl, '/external_dataset'),
  ]);


  // ========================================================================
  // DYNAMIC PUBLIC ROUTES
  // ========================================================================

  const projectPages: MetadataRoute.Sitemap = projectIds.map((id) => ({
    url: `${siteUrl}/dashboard/projects/display/${id}`,
    changeFrequency: 'daily',
    priority: 0.7,
  }));


  const locationPages: MetadataRoute.Sitemap = locationIds.map((id) => ({
    url: `${siteUrl}/dashboard/location/display/${id}`,
    changeFrequency: 'daily',
    priority: 0.7,
  }));


  const samplingAreaPages: MetadataRoute.Sitemap = samplingAreaIds.map(
    (id) => ({
      url: `${siteUrl}/dashboard/samplingarea/display/${id}`,
      changeFrequency: 'daily',
      priority: 0.7,
    })
  );


  const traitPages: MetadataRoute.Sitemap = traitIds.map((id) => ({
    url: `${siteUrl}/dashboard/traits/display/${id}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));


  const propertiesTraitPages: MetadataRoute.Sitemap = propertyIds.map((trait_id) => ({
    url: `${siteUrl}/dashboard/properties/${trait_id}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const propertyPages: MetadataRoute.Sitemap = propertyIds.map((id) => ({
    url: `${siteUrl}/dashboard/properties/display/${id}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));


  const externalDatasetPages: MetadataRoute.Sitemap =
    externalDatasetIds.map((id) => ({
      url: `${siteUrl}/dashboard/externaldatasets/display/${id}`,
      changeFrequency: 'daily',
      priority: 0.7,
    }));


  // ========================================================================
  // FINAL SITEMAP
  // ========================================================================

  return [
    ...staticPages,
    ...projectPages,
    ...locationPages,
    ...samplingAreaPages,
    ...traitPages,
    ...propertiesTraitPages,
    ...propertyPages,
    ...externalDatasetPages,
  ];
}