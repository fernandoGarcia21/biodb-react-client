import { USER_LEVEL_ADMIN, USER_LEVEL_LEADER } from "./constants";

export const protectedRoutes = [
    {
      path: '/dashboard/persons',
      navItemKey: 'persons',
      requiredRoles: [USER_LEVEL_ADMIN], // Example: only admin and user can access.
    },
    {
        path: '/dashboard/persons/create',
        navItemKey: '',
        requiredRoles: [USER_LEVEL_ADMIN], // Example: only admin and user can access.
      },
    {
      path: '/dashboard/persons/update/:id',
      navItemKey: '',
      requiredRoles: [USER_LEVEL_ADMIN], // Example: only admin and user can access.
    },
    {
        path: '/dashboard/users',
        navItemKey: 'users',
        requiredRoles: [USER_LEVEL_ADMIN], // Example: only admin and user can access.
      },
      {
          path: '/dashboard/users/create',
          navItemKey: '',
          requiredRoles: [USER_LEVEL_ADMIN], // Example: only admin and user can access.
        },
      {
        path: '/dashboard/users/update/:id',
        navItemKey: '',
        requiredRoles: [USER_LEVEL_ADMIN], // Example: only admin and user can access.
      },
      {
          path: '/dashboard/projects/create',
          navItemKey: '',
          requiredRoles: [USER_LEVEL_ADMIN, USER_LEVEL_LEADER], // Example: only admin and user can access.
        },
      {
        path: '/dashboard/projects/update/:id',
        navItemKey: '',
        requiredRoles: [USER_LEVEL_ADMIN, USER_LEVEL_LEADER], // Example: only admin and user can access.
      },
      {
          path: '/dashboard/species/create',
          navItemKey: '',
          requiredRoles: [USER_LEVEL_ADMIN], // Example: only admin and user can access.
        },
      {
        path: '/dashboard/species/update/:id',
        navItemKey: '',
        requiredRoles: [USER_LEVEL_ADMIN], // Example: only admin and user can access.
      },
      {
          path: '/dashboard/location/create',
          navItemKey: '',
          requiredRoles: [USER_LEVEL_ADMIN, USER_LEVEL_LEADER], // Example: only admin and user can access.
        },
      {
        path: '/dashboard/location/update/:id',
        navItemKey: '',
        requiredRoles: [USER_LEVEL_ADMIN, USER_LEVEL_LEADER], // Example: only admin and user can access.
      },
      {
          path: '/dashboard/organisms/batch/create',
          navItemKey: '',
          requiredRoles: [USER_LEVEL_ADMIN, USER_LEVEL_LEADER], // Example: only admin and user can access.
        },
      {
        path: '/dashboard/organisms/batch/delete',
        navItemKey: '',
        requiredRoles: [USER_LEVEL_ADMIN, USER_LEVEL_LEADER], // Example: only admin and user can access.
      },
    {
        path: '/dashboard/traits/create',
        navItemKey: '',
        requiredRoles: [USER_LEVEL_ADMIN, USER_LEVEL_LEADER], // Example: only admin and user can access.
      },
    {
      path: '/dashboard/traits/update/:id',
      navItemKey: '',
      requiredRoles: [USER_LEVEL_ADMIN, USER_LEVEL_LEADER], // Example: only admin and user can access.
    },
    {
      path: '/dashboard/properties/create',
      navItemKey: '',
      requiredRoles: [USER_LEVEL_ADMIN, USER_LEVEL_LEADER], // Example: only admin and user can access.
    },
  {
    path: '/dashboard/properties/update/:id',
    navItemKey: '',
    requiredRoles: [USER_LEVEL_ADMIN, USER_LEVEL_LEADER], // Example: only admin and user can access.
  },
  {
      path: '/dashboard/batch',
      navItemKey: 'batch-processes',
      requiredRoles: [USER_LEVEL_ADMIN, USER_LEVEL_LEADER], // Example: only admin and user can access.
    },
  {
      path: '/dashboard/batch/review/:id',
      navItemKey: '',
      requiredRoles: [USER_LEVEL_ADMIN], // Example: only admin and user can access.
    },
    {
        path: '/dashboard/externaldatasets/create',
        navItemKey: '',
        requiredRoles: [USER_LEVEL_ADMIN, USER_LEVEL_LEADER], // Example: only admin and user can access.
      },
    {
      path: '/dashboard/externaldatasets/update/:id',
      navItemKey: '',
      requiredRoles: [USER_LEVEL_ADMIN, USER_LEVEL_LEADER], // Example: only admin and user can access.
    },
    {
      path: '/dashboard/typedatasets',
      navItemKey: 'type-dataset',
      requiredRoles: [USER_LEVEL_ADMIN], // Example: only admin and user can access.
    },
    {
        path: '/dashboard/typedatasets/create',
        navItemKey: '',
        requiredRoles: [USER_LEVEL_ADMIN], // Example: only admin and user can access.
      },
    {
      path: '/dashboard/typedatasets/update/:id',
      navItemKey: '',
      requiredRoles: [USER_LEVEL_ADMIN], // Example: only admin and user can access.
    },
    // Add more protected routes as needed...
  ];
  


// Routes to hide when the user is logged in, e.g. login or register pages
export const hiddenLoginRoutes = [
    {
      path: '/auth/sign-in',
      navItemKey: 'account'
    },
    
    // Add more hidden routes for logged in user as needed...
  ];
  