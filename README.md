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

Create a local environment file from the provided example:

``` bash
cp .env.example .env.local
```

Configure the URL of the flexBioDB REST API in `.env.local`:

``` env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

For a production deployment, replace this value with the public URL of
the corresponding REST API.

Do not commit `.env.local` to the repository.

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

Create an optimized production build:

``` bash
npm run build
```

Start the production server:

``` bash
npm start
```

The production application runs on port `8080` by default.

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

**Contributors**

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
