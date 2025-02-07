import { NextAPI } from '@/service/middleware/entry';
import { ManagePermissionVal } from '@fastgpt/global/support/permission/constant';
import { GroupMemberRole } from '@fastgpt/global/support/permission/memberGroup/constant';
import { jsonRes } from '@fastgpt/service/common/response';
import { updateTeamGroupMember } from '@fastgpt/service/support/permission/memberGroup/controllers';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';

interface UpdateGroupMemberBody {
  groupId: string;
  tmbId: string;
  role: `${GroupMemberRole}`;
}
async function handler(req: ApiRequestProps<UpdateGroupMemberBody>, res: ApiResponseType) {
  try {
    const { groupId, tmbId, role } = req.body;
    await authUserPer({ req, authToken: true, per: ManagePermissionVal });
    await updateTeamGroupMember({ groupId, tmbId, role });
    return jsonRes(res, {
      code: 200,
      message: '设置角色成功',
      data: null
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

export default NextAPI(handler);
