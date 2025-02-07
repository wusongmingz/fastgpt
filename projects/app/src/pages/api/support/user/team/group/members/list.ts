import { NextAPI } from '@/service/middleware/entry';
import { getGroupMembersWithInfo } from '@fastgpt/service/support/permission/memberGroup/controllers';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';

interface GetGroupMembersListBody {}
interface GetGroupMembersListQuery {
  groupId: string;
}
async function handler(
  req: ApiRequestProps<GetGroupMembersListBody, GetGroupMembersListQuery>,
  res: ApiResponseType
) {
  const { groupId } = req.query;
  if (!groupId) {
    return res.status(400).json({
      code: 400,
      message: '群组不存在',
      data: null
    });
  }
  return await getGroupMembersWithInfo(groupId);
}

export default NextAPI(handler);
