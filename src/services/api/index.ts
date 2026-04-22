export {
  addTenantToRegistry,
  deleteSubmission,
  deleteSubmissions,
  deleteTenantFromRegistry,
  getSubmissions,
  getTenantDisplayName,
  getTenantPublicBranding,
  getTenantList,
  getTenantOverview,
  getTenantRegistry,
  getTenantSetores,
  getTenantStatus,
  getTenantWhistleblowerStatus,
  saveSubmission,
  searchOrganizations,
  type OrganizationSearchHit,
  updateTenantRegistry,
  upsertTenantRegistry,
  type Submission,
  type TenantGroupCnpj,
  type TenantOverviewItem,
  type TenantRegistryItem,
} from '@/types/submission'

export {
  getWhistleblowerEvidenceSignedUrl,
  getWhistleblowerReports,
  getWhistleblowerStatusByProtocol,
  markWhistleblowerReportRead,
  saveWhistleblowerReport,
  updateWhistleblowerStatus,
  type EvidencePathEntry,
  type SaveWhistleblowerPayload,
  type WhistleblowerReport,
  type WhistleblowerStatus,
} from '@/types/whistleblower'

export { logAdminAuditAction } from '@/services/api/audit'

