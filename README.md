# flexBioDB React Client

The **flexBioDB React Client** is the web frontend of **flexBioDB**, an
open-source and fully customizable database framework designed to
support research communities working with emerging model systems in
evolutionary biology, ecology, and related fields.

flexBioDB originated from the development of **LittorinaDB**, a database
created to address the specific data-management needs of the
international *Littorina* research community. The framework generalizes
the architecture developed for LittorinaDB so that it can be configured
and adapted to other biological study systems.

Further details on the conception, development, architecture, and implementation
of LittorinaDB are provided in Chapter 4 of:

> García Castillo, D. F. (2026). *The genomic architecture of local adaptation
> in introduced populations*. Institute of Science and Technology Austria (ISTA).
> https://doi.org/10.15479/AT-ISTA-20991

Because flexBioDB is open source and configurable, research communities
can adapt its data structure, terminology, interface, and deployment to
their own organisms, projects, and data-management requirements.

**LittorinaDB** is the inaugural and reference implementation of
flexBioDB. It is a dedicated Model Organism Database (MOD) for the
*Littorina* research community, with an initial focus on *Littorina
saxatilis* and *Littorina arcana*.

For more information about the Littorina research community, visit the
[Littorina Research Community
website](https://littorina.at.biopolis.pt/).

## Architecture

flexBioDB follows a three-tier architecture composed of:

1.  **Web client** --- the user interface contained in this repository.
2.  **REST API** --- the backend application that handles requests and
    database operations.
3.  **PostgreSQL database** --- the relational database used to store
    biological data and metadata.

This separation allows each component to be maintained and deployed
independently.


## Repository structure

The React client repository is organized as follows:

```text
biodb-react-client/
├── public/
│   ├── assets/
│   └── favicon.ico
│
├── src/
│   ├── api/
│   ├── app/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── errors/
│   │   └── legal/
│   ├── components/
│   │   ├── auth/
│   │   ├── core/
│   │   └── dashboard/
│   ├── contexts/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   ├── types/
│   ├── config.ts
│   ├── constants.ts
│   ├── paths.ts
│   └── protected-routes.ts
│
├── .env.example
├── next.config.mjs
├── package.json
├── package-lock.json
├── prettier.config.mjs
├── tsconfig.json
└── README.md
```

### Main directories and files

- **`public/`** — contains static files served directly by the web application.
- **`public/assets/`** — contains logos, species images, avatars, error-page graphics, and other static visual assets.
- **`src/api/`** — contains the client-side modules used to communicate with the flexBioDB REST API.
- **`src/app/`** — contains the Next.js application routes and page hierarchy, including authentication, dashboard, legal, and error pages.
- **`src/components/`** — contains reusable React components organized by application area.
- **`src/contexts/`** — contains React context providers used to share application state.
- **`src/hooks/`** — contains reusable custom React hooks.
- **`src/lib/`** — contains shared client-side utilities and application services.
  The `auth/` module manages frontend authentication workflows, including
  user sign-in, sign-out, JWT session validation, and retrieval of the
  authenticated user's information.
- **`src/styles/`** — contains global styles and theme configuration.
- **`src/types/`** — contains shared TypeScript type definitions.
- **`src/config.ts`** — contains general frontend configuration.
- **`src/constants.ts`** — contains constants used throughout the client, including the API endpoint configuration.
- **`src/paths.ts`** — centralizes application route paths.
- **`src/protected-routes.ts`** — defines application routes that require authentication.

## Main technologies

The client is built primarily with:

-   Next.js
-   React
-   TypeScript
-   Material UI (MUI)
-   Axios
-   Leaflet / React Leaflet
-   React Hook Form
-   Zod

## Requirements

To run the client locally, you need:

-   Node.js
-   npm
-   A running instance of the flexBioDB REST API

## Installation

Clone the repository:

``` bash
git clone https://github.com/fernandoGarcia21/biodb-react-client.git
cd biodb-react-client
```

Install the dependencies:

``` bash
npm install
```

## Environment configuration

The frontend uses environment variables to define the backend API endpoint,
the public URL of the deployed instance, and optional Google Analytics
integration.

An example configuration is provided in `.env.example`.

For local development, create a `.env.local` file from the example:

```bash
cp .env.example .env.local
```

The available environment variables are:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | URL of the flexBioDB REST API used by the frontend. |
| `NEXT_PUBLIC_SITE_URL` | Production | Public URL of the deployed flexBioDB frontend instance. In local development, the application can fall back to localhost. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Google Analytics 4 Measurement ID used to collect website traffic statistics. Leave unset if analytics tracking is not required. |

### Local development

For a standard local installation, the minimum configuration is:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

`NEXT_PUBLIC_SITE_URL` can normally be omitted during local development,
as the application falls back to localhost.

Google Analytics is optional. If analytics tracking is not required during
development, `NEXT_PUBLIC_GA_MEASUREMENT_ID` can also be omitted.

For example:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000

# Optional in local development
# NEXT_PUBLIC_SITE_URL=http://localhost:8080

# Optional
# NEXT_PUBLIC_GA_MEASUREMENT_ID=G-MY_GA_MEASUREMENT_ID
```

### Production

For a production deployment, configure the environment variables with the
URLs corresponding to the deployed flexBioDB instance.

For example:

```env
NEXT_PUBLIC_API_URL=https://www.my-flexBioDB-backend.com/api
NEXT_PUBLIC_SITE_URL=https://www.my-flexBioDB-site.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-MY_GA_MEASUREMENT_ID
```

The frontend and backend do not need to use different domains. For example,
when a reverse proxy exposes the REST API under `/api`, both can share the
same domain:

```env
NEXT_PUBLIC_API_URL=https://www.my-flexBioDB-site.com/api
NEXT_PUBLIC_SITE_URL=https://www.my-flexBioDB-site.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-MY_GA_MEASUREMENT_ID
```

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser and
therefore **must not contain passwords, secret keys, database credentials,
or other sensitive information**.

In production, these variables must be available when the frontend is built
with `npm run build`, because Next.js embeds public environment variables
into the generated client bundle.

Do not commit environment files containing instance-specific configuration
to the repository.

## Development

Start the development server:

``` bash
npm run dev
```

By default, the application runs at:

``` text
http://localhost:8080
```

The backend REST API must also be running and accessible through the URL
configured in `NEXT_PUBLIC_API_URL`.

## Production build

Before creating the production build, make sure that the required
`NEXT_PUBLIC_*` environment variables are configured and available in the
current environment. These variables are embedded into the client bundle
during the build process.

Create an optimized production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

The production application runs on port `8080` by default.

For a persistent production deployment, the application can be managed
using a process manager such as PM2 and exposed publicly through a reverse
proxy such as Nginx.

## Backend

The frontend requires the flexBioDB REST API:

https://github.com/fernandoGarcia21/biodb-rest-api

The backend provides access to the PostgreSQL database and implements
the API used by this client.

## LittorinaDB: reference implementation

LittorinaDB was developed for the needs of the international *Littorina*
research community and served as the foundation from which the more
general flexBioDB framework emerged.

LittorinaDB is designed to centralize standardized biological
information, including phenotypic and environmental data, while linking
database records to datasets stored in external public repositories.

As the reference implementation, LittorinaDB demonstrates how the
underlying flexBioDB architecture can be customized for a particular
research community while retaining a reusable and lightweight framework
that can be adapted to other emerging model systems.

## Authors and contributors

**Author and project lead**

-   Diego Fernando García Castillo ---
    https://github.com/fernandoGarcia21

**Co-authors**

-   Anja Westram
-   Roger Butlin
-   Rui Faria
-   Nick Barton


## Acknowledgements

The user interface was originally developed using the open-source
[Devias Kit React](https://github.com/devias-io/material-kit-react)
dashboard template as a starting point and was subsequently adapted and
extended for flexBioDB and LittorinaDB.

## License

This project is distributed under the MIT License. See `LICENSE.md` for
details.
