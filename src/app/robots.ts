import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8080';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        // API
        '/api/',

        // Authentication
        '/auth/sign-in',

        // User administration
        '/dashboard/users/',
        '/dashboard/persons/',

        // Batch processing
        '/dashboard/batch/',
        '/dashboard/organisms/batch/create',
        '/dashboard/organisms/batch/delete',

        // Dataset type administration
        '/dashboard/typedatasets/',

        // Projects
        '/dashboard/projects/create',
        '/dashboard/projects/update/',

        // Species
        '/dashboard/species/create',
        '/dashboard/species/update/',

        // Habitats
        '/dashboard/habitats/create',
        '/dashboard/habitats/update/',

        // Locations
        '/dashboard/location/create',
        '/dashboard/location/update/',

        // Sampling areas
        '/dashboard/samplingarea/create',
        '/dashboard/samplingarea/update/',

        // Traits
        '/dashboard/traits/create',
        '/dashboard/traits/update/',

        // Properties
        '/dashboard/properties/create',
        '/dashboard/properties/update/',
        '/dashboard/properties/*/create',

        // External datasets
        '/dashboard/externaldatasets/create',
        '/dashboard/externaldatasets/update/',
      ],
    },

    sitemap: `${siteUrl}/sitemap.xml`,
  };
}