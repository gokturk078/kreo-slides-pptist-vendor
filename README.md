# KreoSlides PPTist-Derived Vendor Source Disclosure

This repository contains the public source disclosure for the PPTist-derived KreoSlides vendor/adaptation layer used by Kreotar.

It is not the proprietary Kreotar application. It does not contain KreoCloud, authentication, Supabase integration, storage integration, dashboard code, billing, analytics, deployment configuration, product secrets, or private product logic.

## License

This source disclosure is provided under the GNU Affero General Public License v3.0 (AGPL-3.0) because the disclosed code is derived from PPTist or AGPL-licensed source.

Do not treat this repository as Apache, MIT, or another permissive license unless a specific upstream file proves that license for that file.

## Upstream

- Upstream project: PPTist
- Upstream repository: https://github.com/pipipi-pikachu/PPTist
- Upstream license: AGPL-3.0
- Upstream copyright notice found in the vendor source: Copyright (c) 2020-PRESENT pipipi-pikachu

## What Is Included

- PPTist-derived presentation editor source under this vendor tree.
- KreoSlides vendor/adaptation code needed to mount the vendored presentation runtime.
- Compatibility guards and adapters used by the KreoSlides vendor layer.
- Public license, notice, upstream, changelog, third-party notice, and source availability documentation for this disclosure.

## What Is Not Included

- The private Kreotar application.
- KreoCloud file system, dashboard, storage, or account logic.
- Supabase schema, RLS policies, database access, or auth code.
- Cloudflare R2 paths, object storage logic, signed URL logic, or upload/download APIs.
- Proprietary editor shells outside this vendor/adaptation boundary.
- Billing, analytics, deployment configuration, environment files, production credentials, or private business logic.

## Integration Boundary

KreoSlides uses this vendor/adaptation layer inside a larger private Kreotar product. The private product is responsible for authentication, file ownership, cloud save/open flows, storage, routing, and product shell UI outside this disclosed vendor source.

Imports that resolve through the vendor build configuration are part of this vendor source tree unless explicitly documented otherwise. Private Kreotar application modules are not included in this public disclosure repository.

## Source Availability

Source for the PPTist-derived KreoSlides vendor/adaptation layer is available in this public repository. The proprietary Kreotar product code is separate and is not included in this source disclosure.

For source availability questions about this disclosed layer, open an issue in the public repository or use the contact path provided by the repository owner.

## Attribution

This disclosure preserves attribution to PPTist and its upstream author/repository. See `NOTICE.md`, `UPSTREAM.md`, and `THIRD_PARTY_NOTICES.md` for additional details.

## No Warranty

This source is provided without warranty, to the extent permitted by applicable law. See the AGPL-3.0 license text in `LICENSE`.
# kreo-slides-pptist-vendor
