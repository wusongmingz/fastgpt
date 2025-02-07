// 引入一些需要的模块和类型
import { getMongoTeamMembertmbIDs } from '@fastgpt/service/support/permission/memberGroup/controllers';
import type { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import {
  getGroupIdByName,
  getTmbIdByUserId,
  createTeamGroupMember
} from '@fastgpt/service/support/permission/memberGroup/controllers';
import { parseHeaderCert } from '@fastgpt/service/support/permission/controller';
import { AuthUserTypeEnum, PerResourceTypeEnum } from '@fastgpt/global/support/permission/constant';
// 定义一些类型
export type TokenLoginQuery = { groupId: string };
export type TokenLoginBody = {};
export type TokenLoginResponse = {};

// 定义一个handler函数，它接收一个请求和一个响应对象
async function handler(
  req: ApiRequestProps<TokenLoginBody, TokenLoginQuery>,
  _res: ApiResponseType<any>
) {
  const { groupId } = req.query;
  // const groupid = await getGroupIdByName(groupname);
  const groupMembers = await getMongoTeamMembertmbIDs(groupId);
  return groupMembers;
}
// 导出NextAPI中间件，它使用handler函数处理请求
export default NextAPI(handler);
