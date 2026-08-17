"use client";
import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { AboutUs } from '@/components/dashboard/about/aboutus';

import { getAboutUsSettings } from '@/api/settings'; // Importing this to ensure the API is initialized, if needed
import { useBrandTitle } from '@/hooks/use-brand-title';

export default function Page(): React.JSX.Element {

  const isMounted = useRef(false);
  const [aboutUsSettings, setAboutUsSettings] = useState<any[]>([]);
  const brandTitle = useBrandTitle();
    
      useEffect(() => {
      const fetchAboutUsData = async () => {
        try {
          if (!isMounted.current) {
            isMounted.current = true;
            const aboutUsResponse = await getAboutUsSettings(); 
            setAboutUsSettings(aboutUsResponse.data);
            console.log('About Us settings:', aboutUsResponse.data);
          }
        } catch (error) {
          console.error('Error fetching About Us settings:', error);
        }
      };
  
      fetchAboutUsData();
  
    }, []);

  //Add title to the page
    useEffect(() => {
      document.title = `About us | ${brandTitle}`;
  }, [brandTitle]);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">About us</Typography>
        </Stack>
      </Stack>
      {/**<About us screen />  */}
      <AboutUs
        aboutUsSettings={aboutUsSettings}
      />
    </Stack>
  );
}
