import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';
import {
  getGroupIdByName,
  getTmbIdByUserId,
  createTeamGroupMember
} from '@fastgpt/service/support/permission/memberGroup/controllers';
import { NextAPI } from '@/service/middleware/entry';
import { ERROR_ENUM } from '@fastgpt/global/common/error/errorCode';
import { GroupMemberRole } from '@fastgpt/global/support/permission/memberGroup/constant';
/**
 * API 请求体类型
 */
export type CreateTeamMemberGroupQuery = {};
export type CreateTeamMemberGroupBody = {
  userId: string | string[];
  groupId: string;
};
export type CreateTeamMemberGroupResponse = {
  message: string;
};
/**
 * 处理函数
 * @param req API 请求
 * @param _res API 响应
 * @returns 创建结果
 */
async function handler(
  req: ApiRequestProps<CreateTeamMemberGroupBody, CreateTeamMemberGroupQuery>,
  _res: ApiResponseType<any>
): Promise<any> {
  const { userId, groupId } = req.body;
  // const group = await getGroupIdByName(groupname);
  // const groupid = group._id;
  const member = await getTmbIdByUserId(userId);
  if (Array.isArray(member)) {
    return await createTeamGroupMember({ groupId, tmbId: member.map((item: any) => item._id) });
  }
  return await createTeamGroupMember({ groupId, tmbId: member._id });
  // return _res.status(201).json('群组添加成员成功_lay');
}
export default NextAPI(handler);
