'use client';

import * as React from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

import {
  List as ListIcon,
} from '@phosphor-icons/react/dist/ssr/List';

import { useUser } from '@/hooks/use-user';
import { useLogoContext } from '@/contexts/logo-context';
import { usePopover } from '@/hooks/use-popover';

import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';


interface MainNavProps {
  initialWelcomeMessage?: string;
}


export function MainNav({
  initialWelcomeMessage,
}: MainNavProps): React.JSX.Element {
  const { user } = useUser();

  const {
    dbName,
    dbNameSuffix,
    dbWelcomeMessage,
  } = useLogoContext();

  const [openNav, setOpenNav] =
    React.useState<boolean>(false);

  const userPopover =
    usePopover<HTMLDivElement>();


  const dbNameToDisplay =
    dbName ?? 'FlexBioDB';

  const dbNameSuffixToDisplay =
    dbNameSuffix ?? '';

  const dbWelcomeMessageToDisplay =
    dbWelcomeMessage ??
    initialWelcomeMessage ??
    'Welcome to FlexBioDB!';


  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom:
            '1px solid var(--mui-palette-divider)',
          backgroundColor:
            'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex:
            'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
            justifyContent:
              'space-between',
            minHeight: '64px',
            px: 2,
          }}
        >
          <Card
            elevation={0}
            sx={{
              border: 0,
              boxShadow: 'none',
              display: {
                xs: 'none',
                sm: 'block',
              },
              px: 1,
              py: 1.5,
            }}
          >
            <CardContent
              sx={{
                px: 0.25,
                py: 1,
                '&:last-child': {
                  pb: 0,
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 30,
                  fontWeight: 600,
                  gap: 0,
                  lineHeight: 1.2,
                  textAlign: 'left',
                }}
              >
                <Box
                  component="span"
                  sx={{
                    textDecoration:
                      'none',
                  }}
                >
                  {dbNameToDisplay}
                </Box>

                <Box
                  component="span"
                  sx={{
                    textDecoration:
                      'none',
                  }}
                >
                  {dbNameSuffixToDisplay}
                </Box>

                <Box
                  component="span"
                  sx={{
                    textDecoration:
                      'none',
                    fontSize: 16,
                    fontWeight: 400,
                    marginLeft: 1,
                  }}
                >
                  {
                    dbWelcomeMessageToDisplay
                  }
                </Box>
              </Box>
            </CardContent>
          </Card>


          <Stack
            sx={{
              alignItems: 'center',
            }}
            direction="row"
            spacing={2}
          >
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{
                display: {
                  lg: 'none',
                },
              }}
            >
              <ListIcon />
            </IconButton>
          </Stack>


          {user != null && (
            <Stack
              sx={{
                alignItems: 'center',
              }}
              direction="row"
              spacing={2}
            >
              <Avatar
                onClick={
                  userPopover.handleOpen
                }
                ref={
                  userPopover.anchorRef
                }
                src="/assets/neutral-avatar.png"
                sx={{
                  cursor: 'pointer',
                }}
              />
            </Stack>
          )}
        </Stack>
      </Box>


      <UserPopover
        anchorEl={
          userPopover.anchorRef.current
        }
        onClose={
          userPopover.handleClose
        }
        open={userPopover.open}
      />


      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}