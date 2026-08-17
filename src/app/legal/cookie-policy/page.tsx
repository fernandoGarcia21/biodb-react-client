import * as React from 'react';
import type { Metadata } from 'next';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';

import { config } from '@/config';
import { paths } from '@/paths';

export const metadata = { title: `Cookie Policy | ${config.site.name}` } satisfies Metadata;

export default function CookiePolicy(): React.JSX.Element {
  return (
    <Box component="main" sx={{ py: 8 }}>
      <Container maxWidth="md">
        <Stack spacing={4}>
          <div>
            <Button
              component={RouterLink}
              href={paths.home}
              startIcon={<ArrowLeftIcon />}
              variant="text"
              sx={{ mb: 3 }}
            >
              Back to Home
            </Button>
            <Typography variant="h3" sx={{ mb: 2 }}>
              Cookie Policy
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Last updated: January 21, 2026
            </Typography>
          </div>

          <Stack spacing={3}>
            <div>
              <Typography variant="h5" sx={{ mb: 2 }}>
                1. What Are Cookies
              </Typography>
              <Typography variant="body1" paragraph>
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
                They are widely used to make websites work more efficiently and provide information to website owners.
              </Typography>
            </div>

            <div>
              <Typography variant="h5" sx={{ mb: 2 }}>
                2. How We Use Cookies
              </Typography>
              <Typography variant="body1" paragraph>
                We use cookies for the following purposes:
              </Typography>
              <Typography component="div" variant="body1">
                <ul>
                  <li><strong>Essential Cookies:</strong> Required for the website to function properly, including authentication and security.</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website by collecting and reporting information anonymously.</li>
                </ul>
              </Typography>
            </div>

            <div>
              <Typography variant="h5" sx={{ mb: 2 }}>
                3. Cookies We Use
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Authentication Cookies</strong>
              </Typography>
              <Typography component="div" variant="body1" sx={{ mb: 2, pl: 2 }}>
                • <strong>jwt:</strong> Used to maintain your login session<br />
                • Duration: Session (expires when you close your browser)<br />
                • Purpose: Essential for authentication and security
              </Typography>

              <Typography variant="body1" paragraph>
                <strong>Consent Cookie</strong>
              </Typography>
              <Typography component="div" variant="body1" sx={{ mb: 2, pl: 2 }}>
                • <strong>biodb-cookie-consent:</strong> Stores your cookie preferences<br />
                • Duration: 365 days<br />
                • Purpose: Remember your consent choices
              </Typography>

              <Typography variant="body1" paragraph>
                <strong>Google Analytics Cookies (only if you accept)</strong>
              </Typography>
              <Typography component="div" variant="body1" sx={{ pl: 2 }}>
                • <strong>_ga:</strong> Used to distinguish users<br />
                • <strong>_gid:</strong> Used to distinguish users<br />
                • <strong>_gat:</strong> Used to throttle request rate<br />
                • Duration: Varies (2 years for _ga, 24 hours for _gid, 1 minute for _gat)<br />
                • Purpose: Analytics and website performance monitoring<br />
                • Third Party: Google LLC
              </Typography>
            </div>

            <div>
              <Typography variant="h5" sx={{ mb: 2 }}>
                4. Managing Cookies
              </Typography>
              <Typography variant="body1" paragraph>
                You can control and manage cookies in several ways:
              </Typography>
              <Typography component="div" variant="body1">
                <ul>
                  <li><strong>Cookie Banner:</strong> When you first visit our site, you can accept or decline non-essential cookies.</li>
                  <li><strong>Browser Settings:</strong> Most browsers allow you to refuse cookies or delete existing cookies. Please note that disabling cookies may affect website functionality.</li>
                  <li><strong>Opt-out Tools:</strong> For Google Analytics, you can use the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--mui-palette-primary-main)' }}>Google Analytics Opt-out Browser Add-on</a>.</li>
                </ul>
              </Typography>
            </div>

            <div>
              <Typography variant="h5" sx={{ mb: 2 }}>
                5. Third-Party Cookies
              </Typography>
              <Typography variant="body1" paragraph>
                We use Google Analytics, a web analytics service provided by Google LLC. Google Analytics uses cookies to help 
                us analyze how users interact with our website. The information generated by the cookie about your use of the 
                website will be transmitted to and stored by Google on servers in the United States.
              </Typography>
              <Typography variant="body1" paragraph>
                Google's use of cookies is subject to their own privacy policy. For more information, please visit:{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--mui-palette-primary-main)' }}>
                  Google Privacy Policy
                </a>
              </Typography>
            </div>

            <div>
              <Typography variant="h5" sx={{ mb: 2 }}>
                6. Updates to This Policy
              </Typography>
              <Typography variant="body1" paragraph>
                We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, 
                regulatory, or operational reasons. We encourage you to review this page periodically.
              </Typography>
            </div>

            <div>
              <Typography variant="h5" sx={{ mb: 2 }}>
                7. Contact Us
              </Typography>
              <Typography variant="body1" paragraph>
                If you have any questions about our use of cookies, please visit our contact page:
              </Typography>
              <Typography variant="body1">
                <a 
                  href="https://littorina.at.biopolis.pt/contact" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--mui-palette-primary-main)', textDecoration: 'underline' }}
                >
                  Littorina Research Community - Contact
                </a>
              </Typography>
            </div>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
