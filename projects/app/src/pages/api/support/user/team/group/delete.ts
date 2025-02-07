import { NextAPI } from '@/service/middleware/entry';
import { ManagePermissionVal } from '@fastgpt/global/support/permission/constant';
import { jsonRes } from '@fastgpt/service/common/response';
import {
  deleteTeamMemberGroup,
  getTeamDefaultGroup
} from '@fastgpt/service/support/permission/memberGroup/controllers';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';

interface DeleteTeamMemberGroupBody {
  groupId: string;
}

interface DeleteTeamMemberGroupQuery {}

async function handler(
  req: ApiRequestProps<DeleteTeamMemberGroupBody, DeleteTeamMemberGroupQuery>,
  res: ApiResponseType
) {
  const { groupId } = req.body;
  const { teamId } = await authUserPer({ req, authToken: true, per: ManagePermissionVal });
  const group = await getTeamDefaultGroup({ teamId });
  if (group._id.toString() === groupId) {
    return jsonRes(res, {
      code: 400,
      message: '默认团队不能删除'
    });
  }
  return await deleteTeamMemberGroup({ groupId, teamId });
}

export default NextAPI(handler);
