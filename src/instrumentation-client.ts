import posthog from 'posthog-js';

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (token) {
  posthog.init(token, {
    api_host: '/ingest',
    ui_host: 'https://eu.posthog.com',
    defaults: '2025-05-24',
    capture_pageview: 'history_change',
    capture_pageleave: true,
    skip_trailing_slash: true,
    persistence: 'localStorage+cookie',
  });
}

export default posthog;
