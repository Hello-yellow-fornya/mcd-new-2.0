# Claims 24/7: open items

## Blocking

### Who "we" is: lead generation versus claims management

The footer's legal line (supplied by the client, 9 September 2026) says:

> Claims247.co.uk provides marketing and lead-generation services only and does not provide legal advice or claims-management services.

The body copy says the opposite: "we manage your claim", "one dedicated claims handler", "we fight your corner", "we deal with the at-fault insurer", "we arrange everything with an approved repairer". That is a contradiction between the entity line and the service the pages describe.

- **Status:** with the client. Until they answer who "we" is (Claims247.co.uk, or the accident management company the leads go to), the copy stays as designed and this item blocks go-live.
- **Not resolved here:** no wording has been changed to paper over it.

## Open

- The legal line is rendered from `sites/mcd2/site.ts` on every page; the status sentence is `FCA_STATUS_LINE` there.
- Six proof points are gated in `sites/mcd2/claims.json` and render only with an evidence line: recovery within 90 minutes; answered within 1 minute; lifetime guarantee on repairs; BS 10125 and new parts; updates your way; no cut of the settlement.
