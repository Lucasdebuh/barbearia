import { Role } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      barbershopId: string | null;
      barbershopStatus: string | null;
    };
  }

  interface User {
    id: string;
    role: Role;
    barbershopId?: string | null;
    barbershopStatus?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    barbershopId: string | null;
    barbershopStatus: string | null;
  }
}
