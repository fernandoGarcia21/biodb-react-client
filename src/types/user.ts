export interface User {
  id: string;
  name?: string;
  avatar?: string;
  email?: string;

  [key: string]: unknown;
}


export interface Person {
  first_name?: string;
  family_name?: string;
  email?: string;
}
