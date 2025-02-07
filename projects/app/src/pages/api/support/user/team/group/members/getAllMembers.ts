import { NextAPI } from '@/service/middleware/entry';
import {
  getAllMembersWithInfo,
  getGroupMembersWithInfo
} from '@fastgpt/service/support/permission/memberGroup/controllers';
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
      message: 'groupId is required',
      data: null
    });
  }
  return await getAllMembersWithInfo(groupId);
}

export default NextAPI(handler);
