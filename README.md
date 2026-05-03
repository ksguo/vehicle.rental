# Vehicle Rental Management (SAPUI5)

SAPUI5 (Fiori) application for managing a vehicle fleet and rental bookings. It includes a dashboard with KPI tiles, dedicated list pages for vehicles and rentals, and an optional "Fleet AI" assistant backed by an OData function import.

## Features

- Dashboard
    - Fleet KPIs: total vehicles, available vs. rented
    - Rental KPIs: active/open/closed rentals
    - Revenue KPIs: total revenue, total bookings, average daily rate
- Vehicle management
    - Search and availability filters
    - Create / edit / delete vehicles
    - "Book now" action creates a rental for a vehicle
- Rental management
    - Search and status filters (OPEN / ACTIVE / CLOSED)
    - Create / edit / delete rentals
    - Actions via OData function imports: confirm rental, close rental
- Fleet AI (optional)
    - Chat UI on the dashboard
    - Calls an OData function import `/AskFleetAI` (POST)

## Tech Stack

- SAPUI5 1.147.2, theme `sap_horizon`
- UI5 Tooling (specVersion 4)
- SAP Fiori tools (`fiori run`, proxy middleware, ABAP deploy)
- OData V2 (ABAP On-Premise)
- ESLint with @sap-ux/eslint-plugin-fiori-tools

## Getting Started

### Prerequisites

- Node.js LTS + npm
- UI5 tooling is installed via devDependencies (no global install required)

### Install

```bash
npm install
```

### Run (with FLP sandbox preview)

```bash
npm start
```

### Run without FLP sandbox

```bash
npm run start-noflp
```

### Run with local backend proxy config

```bash
npm run start-local
```

## Backend / OData Configuration

- The OData model is configured in [webapp/manifest.json](webapp/manifest.json) under `sap.app.dataSources.mainService`.
- Proxy settings are defined in `ui5.yaml` (remote backend) and `ui5-local.yaml` (local backend).

If you change the backend URL or client, update:

- `webapp/manifest.json` -> `sap.app.dataSources.mainService.uri`
- `ui5.yaml` / `ui5-local.yaml` -> `server.customMiddleware[].configuration.backend[]`

## Useful Scripts

From [package.json](package.json):

```text
npm start               Run in FLP sandbox preview
npm run start-local     Run with ui5-local.yaml proxy
npm run start-noflp     Run without FLP sandbox

npm run lint            Run ESLint
npm run unit-test       Open QUnit unit tests
npm run int-test        Open OPA integration tests

npm run build           Build to ./dist
npm run deploy          Build + deploy to ABAP (ui5-deploy.yaml)
npm run undeploy        Build + undeploy from ABAP
npm run deploy-test     Build + deploy in testMode
```

## Testing

- Unit tests (QUnit): `npm run unit-test`
- Integration tests (OPA5): `npm run int-test`

## Build & Deploy (ABAP)

The deploy configuration is in `ui5-deploy.yaml` (target system, client, app name/package/transport).

```bash
npm run deploy
```

Notes:

- Ensure you have the required ABAP authorizations.
- Transport/package values are project-specific; adjust `ui5-deploy.yaml` as needed.

## Project Structure

```text
webapp/
    controller/           Controllers for Dashboard, VehicleList, RentalList
    view/                 XML views
    view/fragment/        Dialog fragments for create/edit
    model/                Formatters and model helpers
    css/style.css         App-specific styling
    test/                 QUnit (unit) and OPA5 (integration)
ui5.yaml                UI5 tooling + proxy middleware (remote)
ui5-local.yaml          UI5 tooling + proxy middleware (local)
ui5-deploy.yaml         ABAP deployment configuration
```

## Troubleshooting

- Fleet AI shows "No rental data loaded yet": the assistant needs at least one `/Rental` entry loaded (the current implementation uses the first rental's `RentalId`).
- Proxy / certificate errors: if your backend uses a self-signed certificate, configure `ignoreCertErrors` in `ui5.yaml` accordingly.
- OData errors (404/403): verify `mainService` URI, client (`sap-client`), and that the ABAP service is active.

---

## Appendix: Generator Metadata

|               |
| ------------- |
|**Generation Date and Time**<br>Fri May 01 2026 12:18:01 GMT+0200 (中欧夏令时间)|
|**App Generator**<br>SAP Fiori Application Generator|
|**App Generator Version**<br>1.23.0|
|**Generation Platform**<br>Visual Studio Code|
|**Template Used**<br>Basic|
|**Service Type**<br>SAP System (ABAP On-Premise)|
|**Service URL**<br>N/A|
|**Module Name**<br>vehicle.rental|
|**Application Title**<br>Vehicle Rental Management|
|**Namespace**<br>z00196ss26|
|**UI5 Theme**<br>sap_horizon|
|**UI5 Version**<br>1.147.2|
|**Enable TypeScript**<br>False|
|**Add Eslint configuration**<br>True, see https://www.npmjs.com/package/@sap-ux/eslint-plugin-fiori-tools#rules for the eslint rules.|


