import { NextAPI } from '@/service/middleware/entry';
import { GroupMemberRole } from '@fastgpt/global/support/permission/memberGroup/constant';
import { mongoSessionRun } from '@fastgpt/service/common/mongo/sessionRun';
import { authGroupMemberRole } from '@fastgpt/service/support/permission/memberGroup/controllers';
import { MongoGroupMemberModel } from '@fastgpt/service/support/permission/memberGroup/groupMemberSchema';
import { authUserExist } from '@fastgpt/service/support/user/controller';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';
import { MongoResourcePermission } from '@fastgpt/service/support/permission/schema';
import {
  ManagePermissionVal,
  OwnerPermissionVal,
  PerResourceTypeEnum,
  ReadPermissionVal
} from '@fastgpt/global/support/permission/constant';
import { TeamMemberRoleEnum } from '@fastgpt/global/support/user/team/constant';

interface CreateTeamMemberBody {
  username: string;
  password: string;
  groupId: string;
  role?: `${GroupMemberRole}`;
}

interface CreateTeamMemberQuery {}

interface CreateTeamMemberResponse {}

async function handler(
  req: ApiRequestProps<CreateTeamMemberBody, CreateTeamMemberQuery>,
  res: ApiResponseType
) {
  const { username, password, groupId, role = 'member' } = req.body;
  const { teamId } = await authGroupMemberRole({
    req,
    authToken: true,
    groupId,
    role: ['owner', 'admin']
  });
  try {
    // 验证用户是否已存在
    const user = await authUserExist({ username });
    if (user) {
      return res.json({
        code: 400,
        message: '用户已存在',
        data: null
      });
    }
    let per = ManagePermissionVal;
    if (role === TeamMemberRoleEnum.member.valueOf()) {
      per = ReadPermissionVal;
    } else if (role === TeamMemberRoleEnum.owner.valueOf()) {
      per = OwnerPermissionVal;
    }

    await mongoSessionRun(async (session) => {
      // 1. 创建用户
      const user = await MongoUser.create([{ username, password }], { session });
      // 2. 添加用户到团队
      const member = await MongoTeamMember.create(
        [
          {
            teamId,
            userId: user[0]._id,
            name: username,
            role: TeamMemberRoleEnum.owner,
            defaultTeam: true
          }
        ],
        { session }
      );

      // 3. 添加用户到群组
      if (groupId !== undefined) {
        await MongoGroupMemberModel.create([{ groupId, tmbId: member[0]._id, role }], { session });
      }
      // 4.添加资源权限
      // if (role !== TeamMemberRoleEnum.member.valueOf()) {
      //   await MongoResourcePermission.create(
      //     [
      //       {
      //         resourceType: PerResourceTypeEnum.team,
      //         teamId,
      //         tmbId: member[0]._id,
      //         ...(groupId ? { groupId } : {}),
      //         permission: ManagePermissionVal
      //       }
      //     ],
      //     { session }
      //   );
      // }
    });
    return '添加用户成功';
  } catch (error) {
    console.error('添加用户失败：', error);
    return Promise.reject(error);
  }
}

export default NextAPI(handler);
