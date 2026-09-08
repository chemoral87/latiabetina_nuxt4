import { createCommonRepository } from "~/repositories/factory/createCommonRepository"
import { createRoleRepository } from "~/repositories/RoleRepository"
import { createOrganizationRepository } from "~/repositories/OrganizationRepository"
import { createSaleRepository } from "~/repositories/SaleRepository"
import { createProductRepository } from "~/repositories/ProductRepository"
import { createTestimonyRepository } from "~/repositories/TestimonyRepository"
import { createChurchEventRepository } from "~/repositories/ChurchEventRepository"
import { createChurchMemberRepository, createChurchMemberTrackingLogRepository } from "~/repositories/ChurchMemberRepository"
import { createPermissionRepository } from "~/repositories/PermissionRepository"
import { createConsoSheetRepository } from "~/repositories/ConsoSheetRepository"
import { createSongRepository } from "~/repositories/SongRepository"
import { createProfileRepository } from "~/repositories/ProfileRepository"
import { createWhatsAppRepository } from "~/repositories/WhatsAppRepository"

export function useRepository() {
  const { $api } = useApi()

  return {
    Organization: createOrganizationRepository($api),
    Auditorium: createCommonRepository($api, "/auditorium"),
    AuditoriumEvent: createCommonRepository($api, "/auditorium-event"),
    AuditoriumEventSeat: createCommonRepository($api, "/auditorium-event-seat"),
    AuditoriumEventSeatLog: createCommonRepository($api, "/auditorium-event-seat-log"),
    User: createCommonRepository($api, "/user"),
    Role: createRoleRepository($api, "/role"),
    Permission: createPermissionRepository($api),
    Profile: createProfileRepository($api),
    Testimony: createTestimonyRepository($api),
    ChurchEvent: createChurchEventRepository($api),
    Song: createSongRepository($api),
    Sale: createSaleRepository($api),
    Product: createProductRepository($api),
    ConsoSheet: createConsoSheetRepository($api),
    ChurchMember: createChurchMemberRepository($api),
    ChurchMemberTrackingLog: createChurchMemberTrackingLogRepository($api),
    WhatsApp: createWhatsAppRepository($api),
  }
}
