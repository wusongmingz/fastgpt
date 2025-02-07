import { TeamType } from '@/global/core/chat/api';
import { DELETE, GET, POST, PUT } from '@/web/common/api/request';
import { GroupMemberRole } from '@fastgpt/global/support/permission/memberGroup/constant';
import { MemberGroupListType } from '@fastgpt/global/support/permission/memberGroup/type';
import { CreateTeamProps } from '@fastgpt/global/support/user/team/controller';
import {
  postCreateGroupData,
  putUpdateGroupData
} from '@fastgpt/global/support/user/team/group/api';

interface GroupListItem {
  _id: string;
  name: string;
  teamId: string;
}

interface PostCreateGroupMemberData {
  groupId: string;
  tmbId: string[];
}

interface Member {
  _id: string;
  groupId: string;
  tmbId: string;
  userId: string;
  name: string;
  role: `${GroupMemberRole}`;
}

export const getGroupList = () => GET<MemberGroupListType>('/proApi/support/user/team/group/list');

export const postCreateGroup = (data: postCreateGroupData) =>
  POST('/proApi/support/user/team/group/create', data);

export const deleteGroup = (groupId: string) =>
  DELETE('/proApi/support/user/team/group/delete', { groupId });

export const putUpdateGroup = (data: putUpdateGroupData) =>
  PUT('/proApi/support/user/team/group/update', data);

/********************** group & group member operations ****************** */

export const getTeamGroupMembersByGroupId = (groupId: string) =>
  GET<Member[]>(`/support/user/team/group/members/list`, { groupId });

export const getDefaultTeamGroup = () => GET('/support/user/team/group/default');

// 获取具备Manage权限的群组列表
export const getTeamGroupListWithPer = () =>
  GET<GroupListItem[]>('/support/user/team/group/listWithPer');

export const postCreateTeamGroup = (data: CreateTeamProps) =>
  POST<{ _id: string; name: string; teamId: string }>('/support/user/team/group/create', data);

export const postCreateTeamGroupMember = (data: PostCreateGroupMemberData) =>
  POST('/support/user/team/group/members/create', data);

export const deleteTeamGroupByGroupId = (groupId: string) =>
  POST('/support/user/team/group/delete', { groupId });

export const deleteTeamGroupMember = (data: { groupId: string; tmbId: string }) =>
  POST('/support/user/team/group/members/delete', data);

export const deleteAllTeamGroupMembers = (groupId: string) =>
  POST('/support/user/team/group/members/deleteAll', { groupId });

export const updateTeamGroupMemberRole = (data: {
  groupId: string;
  tmbId: string;
  role: `${GroupMemberRole}`;
}) => POST('/support/user/team/group/members/update', data);

export const searchGroupMembers = (data: { groupId: string; name: string }) =>
  POST<Member[]>('/support/user/team/group/members/filter', data);

export const searchGroupList = (data: { name: string }) =>
  GET<TeamType[]>('/support/user/team/group/findByName', data);

export const updateGroupInfo = (data: {
  name: string;
  avatar?: string;
  intro?: string;
  _id: string;
}) => POST('/support/user/team/group/update', data);
