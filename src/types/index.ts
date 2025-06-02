export type User = {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  profileImage?: string | null;
  createdAt: string;
};