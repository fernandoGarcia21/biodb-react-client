export interface User {
  id: string;
  name?: string;
  avatar?: string;
  email?: string;

  [key: string]: unknown;
}


export interface Person {
  firstName?: string;
  familyName?: string;
  email?: string;
}
