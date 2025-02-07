import { NextAPI } from '@/service/middleware/entry';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { getGroupMembersWithInfo } from '@fastgpt/service/support/permission/memberGroup/controllers';
import { getTeamMembers } from '@fastgpt/service/support/user/team/controller';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';

interface SearchTeamGroupMembersBody {
  groupId: string;
  name: string;
}
async function handler(req: ApiRequestProps<SearchTeamGroupMembersBody>, res: ApiResponseType) {
  const { teamId } = await authCert({ req, authToken: true });
  const { name, groupId } = req.body;

  let teamMemberWithUserInfoTypes = await getGroupMembersWithInfo(groupId);
  const escapedUsername = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // 创建正则表达式，支持模糊匹配和大小写不敏感
  const regex = new RegExp(escapedUsername, 'i');

  // 过滤数组，判断 name 是否匹配正则
  return teamMemberWithUserInfoTypes.filter((member) => regex.test(member!.name));
}

export default NextAPI(handler);
