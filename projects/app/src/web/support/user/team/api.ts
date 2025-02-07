import { GET, POST, PUT, DELETE } from '@/web/common/api/request';
import { UpdatePermissionBody } from '@fastgpt/global/support/permission/collaborator';
import {
  CreateTeamProps,
  InviteMemberProps,
  InviteMemberResponse,
  UpdateInviteProps,
  UpdateTeamProps
} from '@fastgpt/global/support/user/team/controller.d';
import type {
  TeamMemberWithUserInfoType,
  TeamTagItemType,
  TeamTagSchema
} from '@fastgpt/global/support/user/team/type';
import {
  TeamTmbItemType,
  TeamMemberItemType,
  TeamMemberSchema
} from '@fastgpt/global/support/user/team/type.d';
import { FeTeamPlanStatusType, TeamSubSchema } from '@fastgpt/global/support/wallet/sub/type';
import { TeamInvoiceHeaderType } from '@fastgpt/global/support/user/team/type';
import { ResourcePermissionType } from '@fastgpt/global/support/permission/type';
import { TeamType } from '@/global/core/chat/api';

/* --------------- team  ---------------- */
export const getTeamList = (status: `${TeamMemberSchema['status']}`) =>
  GET<TeamTmbItemType[]>(`/proApi/support/user/team/list`, { status });
// export const postCreateTeam = (data: CreateTeamProps) =>
//   POST<string>(`/proApi/support/user/team/create`, data);
export const putUpdateTeam = (data: UpdateTeamProps) => PUT(`/support/user/team/update`, data);
export const putSwitchTeam = (teamId: string) =>
  PUT<string>(`/proApi/support/user/team/switch`, { teamId });

/* --------------- team member ---------------- */
// export const getTeamMembers = () =>
//   GET<TeamMemberItemType[]>(`/proApi/support/user/team/member/list`);
export const postInviteTeamMember = (data: InviteMemberProps) =>
  POST<InviteMemberResponse>(`/proApi/support/user/team/member/invite`, data);
export const putUpdateMemberName = (name: string) =>
  PUT(`/proApi/support/user/team/member/updateName`, { name });
export const delRemoveMember = (tmbId: string) =>
  DELETE(`/proApi/support/user/team/member/delete`, { tmbId });
export const updateInviteResult = (data: UpdateInviteProps) =>
  PUT('/proApi/support/user/team/member/updateInvite', data);
export const delLeaveTeam = (teamId: string) =>
  DELETE('/proApi/support/user/team/member/leave', { teamId });

export const getTeamClbs = () =>
  GET<ResourcePermissionType[]>(`/proApi/support/user/team/collaborator/list`);

/* -------------- team collaborator -------------------- */
export const updateMemberPermission = (data: UpdatePermissionBody) =>
  PUT('/proApi/support/user/team/collaborator/updatePermission', data);

/* --------------- team tags ---------------- */
export const getTeamsTags = () => GET<TeamTagSchema[]>(`/proApi/support/user/team/tag/list`);
export const loadTeamTagsByDomain = (domain: string) =>
  GET<TeamTagItemType[]>(`/proApi/support/user/team/tag/async`, { domain });

/* team limit */
export const checkTeamExportDatasetLimit = (datasetId: string) =>
  GET(`/support/user/team/limit/exportDatasetLimit`, { datasetId });
export const checkTeamWebSyncLimit = () => GET(`/support/user/team/limit/webSyncLimit`);
export const checkTeamDatasetSizeLimit = (size: number) =>
  GET(`/support/user/team/limit/datasetSizeLimit`, { size });

/* plans */
export const getTeamPlanStatus = () =>
  GET<FeTeamPlanStatusType>(`/support/user/team/plan/getTeamPlanStatus`, { maxQuantity: 1 });
export const getTeamPlans = () =>
  GET<TeamSubSchema[]>(`/proApi/support/user/team/plan/getTeamPlans`);

export const getTeamInvoiceHeader = () =>
  GET<TeamInvoiceHeaderType>(`/proApi/support/user/team/invoiceAccount/getTeamInvoiceHeader`);

export const updateTeamInvoiceHeader = (data: TeamInvoiceHeaderType) =>
  POST(`/proApi/support/user/team/invoiceAccount/update`, data);

/* --------------- team  ---------------- */

interface GroupItem {
  _id: string;
  name: string;
  avatar: string;
  intro: string;
}

export interface TeamMemberWithSimpleInfo {
  _id: string;
  name: string;
  username: string;
  userId: string;
  isMember: boolean;
}

export const postCreateTeam = (data: CreateTeamProps) =>
  POST<{ _id: string; name: string; teamId: string }>('/support/user/team/group/create', data);

export const getTeamListNew = () => GET<GroupItem[]>('/support/user/team/group/list');

/* --------------- team member ---------------- */
export const getTeamMembers = () => GET<any>('/support/user/team/members/list');

export const searchTeamMembers = (username: string) =>
  POST<TeamMemberWithUserInfoType[]>('/support/user/team/members/filter', { username });

export const deleteTeamMember = (data: { tmbId: string; userId: string }) =>
  POST('/support/user/team/members/delete', data);

export const getTeamLists = () => GET<TeamType[]>('/support/user/team/group/list');

export const getAllTeamMembersWithInfo = (groupId: string) =>
  GET<TeamMemberWithSimpleInfo[]>('/support/user/team/group/members/getAllMembers', { groupId });

export const getAllTeamMembersWithInfoInGroup = (groupId: string) =>
  GET('/support/user/team/group/members/getAllGroupMembers', { groupId });
