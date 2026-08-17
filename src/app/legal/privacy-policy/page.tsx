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

export const metadata = { title: `Privacy Policy | ${config.site.name}` } satisfies Metadata;

export default function PrivacyPolicy(): React.JSX.Element {
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
              Privacy Policy
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Last updated: January 21, 2026
            </Typography>
          </div>

          <Stack spacing={3}>
            <div>
              <Typography variant="h5" sx={{ mb: 2 }}>
                1. Introduction
              </Typography>
              <Typography variant="body1" paragraph>
                Welcome to {config.site.name}. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy explains how we collect, use, and safeguard your information when you use our biological database platform.
              </Typography>
            </div>

            <div>
              <Typography variant="h5" sx={{ mb: 2 }}>
                2. Information We Collect
              </Typography>
              <Typography variant="body1" paragraph>
                We collect the following types of information:
              </Typography>
              <Typography component="div" variant="body1">
                <ul>
                  <li><strong>Account Information:</strong> Name, email address, and credentials when you register.</li>
                  <li><strong>Usage Data:</strong> Information about how you interact with our platform, including pages visited and features used.</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, device information, and cookies.</li>
                  <li><strong>Research Data:</strong> Biological data, organism information, and related research materials you upload or create.</li>
                </ul>
              </Typography>
            </div>

            <div>
              <Typography variant="h5" sx={{ mb: 2 }}>
                3. How We Use Your Information
              </Typography>
              <Typography variant="body1" paragraph>
                We use your information for the following purposes:
              </Typography>
              <Typography component="div" variant="body1">
                <ul>
                  <li>To provide and maintain our database services</li>
                  <li>To authenticate users and secure accounts</li>
                  <li>To improve and optimize our platform</li>
                  <li>To communicate with you about your account and services</li>
                  <li>To analyze usage patterns and generate statistics</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </Typography>
            </div>

            <div>
              <Typography variant="h5" sx={{ mb: 2 }}>
                4. Legal Basis for Processing (GDPR)
              </Typography>
              <Typography variant="body1" paragraph>
                If you are in the European Economic Area (EEA), our legal basis for collecting and using your information depends on the data and context:
              </Typography>
              <Typography component="div" variant="body1">
                <ul>
                  <li><strong>Contract:</strong> Processing necessary to provide services you requested</li>
                  <li><strong>Consent:</strong> You have given explicit consent (e.g., for analytics cookies)</li>
                  <li><strong>Legitimate Interests:</strong> Processing necessary for our legitimate interests (e.g., improving our services)</li>
                  <li><strong>Legal Obligation:</strong> Processing required by law</li>
                </ul>
              </Typography>
            </div>

            <div>
              <Typography variant="h5" sx={{ mb: 2 }}>
                5. Data Sharing and Disclosure
              </Typography>
              <Typography variant="body1" paragraph>
                We do not sell your personal information. We may share your data with:
              </Typography>
              <Typography component="div" variant="body1">
                <ul>
                  <li><strong>Service Providers:</strong> Third-party services that help us operate our platform (e.g., Google Analytics)</li>
                  <li><strong>Research Collaborators:</strong> Only with your explicit consent for specific research projects</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                </ul>
              </Typography>
            </div>

            <div>
              <Typography variant="h5" sx={{ mb: 2 }}>
                6. Data Security
              </Typography>
              <Typography variant="body1" paragraph>
                We implement appropriate technical and organizational measures to protect your personal data, including:
              </Typography>
              <Typography component="div" variant="body1">
                <ul>
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure authentication mechanisms (JWT tokens)</li>
                  <li>Regular security assessments</li>
                  <li>Access controls and user permissions</li>
                  <li>Rate limiting to prevent abuse</li>
                </ul>
              </Typography>
            </div>

            <div>
              <Typography variant="h5" sx={{ mb: 2 }}>
                7. Your Rights
              </Typography>
              <Typography variant="body1" paragraph>
                You have the following rights regarding your personal data:
              </Typography>
              <Typography component="div" variant="body1">
                <ul>
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
                  <li><strong>Erasure:</strong> Request deletion of your data (right to be forgotten)</li>
                  <li><strong>Restriction:</strong> Request limitation of processing</li>
                  <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                  <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw consent at any time (e.g., for analytics cookies)</li>
                </ul>
              </Typography>
            </div>

            <div>
              <Typography variant="h5" sx={{ mb: 2 }}>
                8. Data Retention
              </Typography>
              <Typography variant="body1" paragraph>
                We retain your personal data only as long as necessary for the purposes outlined in this policy:
              </Typography>
              <Typography component="div" variant="body1">
                <ul>
                  <li>Account data: Until you delete your account or request deletion</li>
                  <li>Research data: As required by research protocols and institutional policies</li>
                  <li>Analytics data: Up to 26 months (Google Analytics default)</li>
                  <li>Logs: 90 days for security purposes</li>
                </ul>
              </Typography>
            </div>

            <div>
              <Typography variant="h5" sx={{ mb: 2 }}>
                9. International Data Transfers
              </Typography>
              <Typography variant="body1" paragraph>
                Your data may be transferred to and processed in countries other than your own. We ensure appropriate 
                safeguards are in place to protect your data in accordance with this privacy policy and applicable laws.
              </Typography>
            </div>

            <div>
              <Typography variant="h5" sx={{ mb: 2 }}>
                10. Children's Privacy
              </Typography>
              <Typography variant="body1" paragraph>
                Our services are not directed to individuals under 16 years of age. We do not knowingly collect 
                personal information from children. If you believe we have collected information from a child, please contact us.
              </Typography>
            </div>

            <div>
              <Typography variant="h5" sx={{ mb: 2 }}>
                11. Cookies
              </Typography>
              <Typography variant="body1" paragraph>
                We use cookies to enhance your experience. For detailed information about our use of cookies, 
                please see our{' '}
                <RouterLink href={paths.legal.cookiePolicy} style={{ color: 'var(--mui-palette-primary-main)' }}>
                  Cookie Policy
                </RouterLink>.
              </Typography>
            </div>

            <div>
              <Typography variant="h5" sx={{ mb: 2 }}>
                12. Changes to This Policy
              </Typography>
              <Typography variant="body1" paragraph>
                We may update this Privacy Policy from time to time. We will notify you of significant changes by 
                posting the new policy on this page and updating the "Last updated" date. We encourage you to review 
                this policy periodically.
              </Typography>
            </div>

            <div>
              <Typography variant="h5" sx={{ mb: 2 }}>
                13. Contact Us
              </Typography>
              <Typography variant="body1" paragraph>
                If you have any questions about this Privacy Policy or wish to exercise your rights, please visit our contact page:
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
              <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                If you are in the EEA and have concerns about our data processing, you also have the right to 
                lodge a complaint with your local data protection authority.
              </Typography>
            </div>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
