# Website availability monitoring

Business-owned Checkly account: sign in using Rachel's business Google account. Account registration completed by the owner on 4 October 2026. The account UI confirms automatic transition from the initial Team trial to the $0 Hobby plan on 18 October 2026 unless someone explicitly upgrades. No paid upgrade was selected.

## Checks

- **Website — homepage:** `https://www.thewhitleycaptures.com/`, every five minutes; require HTTP 200, validate HTTPS, follow redirects, fail after 15 seconds.
- **Website — Baby & Newborn service:** `https://www.thewhitleycaptures.com/prices/baby-newborn`, same settings.
- **Website — enquiry form journey:** the adjacent Playwright script; hourly, round-robin between London and Frankfurt. Opens the homepage, declines analytics, navigates to Baby & Newborn, then returns to the enquiry section and verifies the embedded Session form's submit button is visible and the form is ready. Never fills or submits the form.

Each check retries once after 60 seconds before the failure becomes an alert. Alert channels are subscribed to failures and recoveries, without repeated reminders. Both business and administrator email channels are subscribed. Change recipients under **Alert channels**, and check each monitor's subscriptions after changing a channel. Both test messages were received, as confirmed by the user on 4 October 2026.

## Free-plan limits

Two uptime monitors fit within the ten-monitor allowance. The single hourly browser check uses at most 744 scheduled runs in a 31-day month; additional retries and manual tests count toward the 1,000-run allowance. Keep round-robin enabled: running in parallel doubles consumption. A prolonged failure with many retries could exhaust the browser allowance; Hobby is hard-capped, so review usage after a sustained incident. No paid overages were enabled. Additional dashboard users are not included in Hobby; both email recipients can receive alerts without adding another dashboard user.

## Responding to an alert

Open the check result, then open the affected page in a normal browser. A failure may be the site, Session, a network issue, or a selector needing maintenance. Check the retry result and other monitor results before changing anything. Verify recovery after any repair. These checks confirm page and form loading, not successful enquiry delivery: delivery still needs an occasional agreed manual enquiry test.

## Changing the browser check

Update `enquiry.check.spec.js`, lint it, paste the full script into Checkly's browser editor, run it there, then save only after a successful result. Do not enable automatic script repair that could remove a useful assertion without review. Website deployment is not required for monitor changes.

## Verification on 4 October 2026

Both URL checks passed their cloud tests with HTTP 200. The corrected browser journey passed in Checkly runtime 2026.04 in approximately nine seconds. The initial unpublished script selected a hidden mobile-menu link; it was corrected to select the visible service card before activation. All three checks were saved active and unmuted, with both email channels subscribed. Automatic browser-script repair is explicitly off. A deliberately induced production outage was not needed or performed; alert-channel test delivery was confirmed by the user in both inboxes.
