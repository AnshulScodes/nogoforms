import posthog from 'posthog-js'

// Initialize PostHog
posthog.init('phc_eAmZrRWDpb8NH0mfkB2EJmPddKkgMEzdGfDZxMxd55X', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'always',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
    }
})

export { posthog } 