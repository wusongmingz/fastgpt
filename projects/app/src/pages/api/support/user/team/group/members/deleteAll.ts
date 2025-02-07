import { NextAPI } from '@/service/middleware/entry';
import { ManagePermissionVal } from '@fastgpt/global/support/permission/constant';
import { deleteTeamGroupAllMembersByGroupId } from '@fastgpt/service/support/permission/memberGroup/controllers';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';

async function handler(req: ApiRequestProps<{ groupId: string }>, res: ApiResponseType) {
  const { groupId } = req.body;
  try {
    await authUserPer({ req, authToken: true, per: ManagePermissionVal });
    return await deleteTeamGroupAllMembersByGroupId(groupId);
  } catch (error) {
    return Promise.reject(error);
  }
}

export default NextAPI(handler);
