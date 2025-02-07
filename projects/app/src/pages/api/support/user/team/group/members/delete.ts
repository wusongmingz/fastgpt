import { NextAPI } from '@/service/middleware/entry';
import {
  ManagePermissionVal,
  PermissionKeyEnum
} from '@fastgpt/global/support/permission/constant';
import { jsonRes } from '@fastgpt/service/common/response';
import {
  authGroupMemberRole,
  deleteTeamGroupMember
} from '@fastgpt/service/support/permission/memberGroup/controllers';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';

interface DeleteGroupMemberBody {
  groupId: string;
  tmbId: string;
}
async function handler(req: ApiRequestProps<DeleteGroupMemberBody>, res: ApiResponseType) {
  const { groupId, tmbId } = req.body;

  try {
    const { permission } = await authGroupMemberRole({
      groupId,
      role: ['owner', 'admin'],
      req,
      authToken: true
    });
    if (!permission.checkPer(ManagePermissionVal)) {
      throw new Error('不具备权限');
    }
    return await deleteTeamGroupMember({ groupId, tmbId });
  } catch (error) {
    console.error('删除成员失败：', error);
    jsonRes(res, { code: 500, error });
  }
}

export default NextAPI(handler);
