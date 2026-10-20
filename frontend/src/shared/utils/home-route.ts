import { Roles } from "@/shared/models/enums/roles";

export function homeRouteFor(role: Roles | undefined): string {
  switch (role) {
    case Roles.ADMIN: return "/dashboard/admin";
    case Roles.PROFESSOR: return "/dashboard/teacher";
    case Roles.ESTUDANTE: return "/student-home-page";
    default: return "/";
  }
}
