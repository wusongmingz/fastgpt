import { NextAPI } from '@/service/middleware/entry';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { getTeamMembers } from '@fastgpt/service/support/user/team/controller';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';

interface SearchBody {
  username: string;
}
async function handler(req: ApiRequestProps<SearchBody>, res: ApiResponseType) {
  const { teamId } = await authCert({ req, authToken: true });
  const { username } = req.body;

  let teamMemberWithUserInfoTypes = await getTeamMembers(teamId);
  const escapedUsername = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // 创建正则表达式，支持模糊匹配和大小写不敏感
  const regex = new RegExp(escapedUsername, 'i');

  // 过滤数组，判断 username 是否匹配正则
  return teamMemberWithUserInfoTypes.filter((member) => regex.test(member.username));
}

export default NextAPI(handler);
