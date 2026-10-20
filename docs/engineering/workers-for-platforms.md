# Customer code deployments with Workers for Platforms

The customer deployment console is a small control plane in the Next.js app and a separate Cloudflare dispatch Worker. Customer ES modules are uploaded to one Cloudflare Dispatch Namespace and invoked through the dispatcher. Cloudflare isolates each uploaded Worker; the control plane never evaluates customer code.

## Provisioning

1. Register a `workers.dev` subdomain in the Cloudflare dashboard before the first app deployment. Wrangler cannot publish the app until this account-level setup is complete. A custom domain can be attached instead after its DNS zone is configured in Cloudflare.
2. Create a Cloudflare Workers for Platforms Dispatch Namespace named `lakehouse-customer-workers`.
3. Create a Cloudflare API token scoped to the account with permission to read and edit Worker scripts. Keep it server-side; never expose it as a `NEXT_PUBLIC_*` variable.
4. Set these server environment variables in the Cloudflare Worker:

   | Variable | Value |
   | --- | --- |
   | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
   | `CLOUDFLARE_API_TOKEN` | Token created above |
   | `CUSTOMER_WORKERS_NAMESPACE` | `lakehouse-customer-workers` |
   | `CUSTOMER_WORKERS_RUNTIME_URL` | HTTPS URL of the deployed dispatcher Worker |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk application publishable key |
   | `CLERK_SECRET_KEY` | Clerk application secret key |

5. Configure Clerk sign-in and sign-up for the app's production domains.
   Keep sign-up invite-only until you add customer quotas, billing, and runtime rate limits. The current implementation does not meter invocations or enforce a deployment count.
6. Deploy the dispatcher Worker from the repository root:

   ```sh
   npm run deploy:customer-dispatcher
   ```

   The namespace binding in `workers/customer-dispatcher/wrangler.jsonc` must match the namespace created in step 1. Set `CUSTOMER_WORKERS_RUNTIME_URL` to the HTTPS URL Wrangler reports.
7. Deploy the Next.js app. The `/deployments` page and `/api/customer-workers` endpoints then become available to authenticated customers.

For local dispatcher development, run `npm run dev:customer-dispatcher`; use a local Dispatch Namespace in Wrangler configuration. The Next.js control plane still requires the server environment variables above to perform real Cloudflare operations.

## Isolation and current limits

- Clerk's verified user ID determines an opaque tenant prefix. List, deploy, and delete operations derive the Cloudflare Worker name server-side; clients cannot choose a tenant prefix or Cloudflare binding.
- Customer source is limited to a single ES module of 64 KB. The API does not accept Worker bindings, secrets, or arbitrary deployment metadata.
- The dispatcher imposes per-invocation limits of 1,000 ms CPU time and 50 subrequests. Adjust these after deciding plan-level quotas and validating Cloudflare account limits.
- Worker runtime URLs are public. Customer Worker code should implement its own application-level authentication when it serves private content.
- This initial version does not provide outbound-network allowlisting, custom domains, build pipelines for multi-file projects, or billing/quota enforcement.

See Cloudflare's [Workers for Platforms architecture](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/how-workers-for-platforms-works/), [API examples](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/platform-examples/), and [custom limits](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/configuration/custom-limits/).
