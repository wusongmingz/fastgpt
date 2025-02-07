import { NextAPI } from '@/service/middleware/entry';
import { ManagePermissionVal } from '@fastgpt/global/support/permission/constant';
import { jsonRes } from '@fastgpt/service/common/response';
import {
  authGroupMemberRole,
  createTeamGroupMember,
  getAllMembersWithInfo,
  getGroupMembersWithInfoByGroupId
} from '@fastgpt/service/support/permission/memberGroup/controllers';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';

interface CreateGroupMemberBody {
  groupId: string;
  tmbId: string[];
}

async function handler(req: ApiRequestProps<CreateGroupMemberBody>, res: ApiResponseType) {
  const { tmbId, groupId } = req.body;
  try {
    // 1. 验证是否具备添加成员权限
    await authGroupMemberRole({
      groupId,
      role: ['owner', 'admin'],
      req,
      authToken: true
    });

    // 2. 验证该用户是否已在团队
    const existMembers = await getGroupMembersWithInfoByGroupId(groupId);
    if (existMembers.some((member) => tmbId.includes(member._id))) {
      return jsonRes(res, {
        code: 400,
        message: '该用户已在团队中',
        data: null
      });
    }

    return await createTeamGroupMember({ groupId, tmbId });
  } catch (error) {
    console.error('添加成员失败：', error);
    return Promise.reject(error);
  }
}

export default NextAPI(handler);
