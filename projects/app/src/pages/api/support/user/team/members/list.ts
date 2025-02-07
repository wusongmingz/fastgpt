import { NextAPI } from '@/service/middleware/entry';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { getNotGroupMembers, getTeamMembers } from '@fastgpt/service/support/user/team/controller';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';

async function handler(req: ApiRequestProps, res: ApiResponseType) {
  // const { teamId } = await authCert({ req, authToken: true });
  // return await getTeamMembers(teamId);

  const { teamId } = await authCert({ req, authToken: true });

  // 使用 Promise.all 并行执行两个异步操作
  const [allMembers, notGroupMembers] = await Promise.all([
    getTeamMembers(teamId),
    getNotGroupMembers(teamId)
  ]);

  // 返回一个 Map 对象，包含两个查询结果
  return {
    allMembers: allMembers,
    notGroupMembers: notGroupMembers
  };
}

export default NextAPI(handler);
