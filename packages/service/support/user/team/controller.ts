import {
  TeamTmbItemType,
  TeamMemberWithTeamSchema,
  TeamMemberWithUserSchema,
  TeamMemberWithUserInfoType
} from '@fastgpt/global/support/user/team/type';
import { ClientSession, Types } from '../../../common/mongo';
import {
  TeamMemberRoleEnum,
  TeamMemberStatusEnum,
  notLeaveStatus
} from '@fastgpt/global/support/user/team/constant';
import { MongoTeamMember } from './teamMemberSchema';
import { MongoTeam } from './teamSchema';
import { UpdateTeamProps } from '@fastgpt/global/support/user/team/controller';
import { getResourcePermission } from '../../permission/controller';
import { PerResourceTypeEnum } from '@fastgpt/global/support/permission/constant';
import { TeamPermission } from '@fastgpt/global/support/permission/user/controller';
import { TeamDefaultPermissionVal } from '@fastgpt/global/support/permission/user/constant';
import { MongoMemberGroupModel } from '../../permission/memberGroup/memberGroupSchema';
import { mongoSessionRun } from '../../../common/mongo/sessionRun';
import { DefaultGroupName } from '@fastgpt/global/support/user/team/group/constant';
import { addUser } from '../controller';
import { MongoGroupMemberModel } from '../../permission/memberGroup/groupMemberSchema';
import { MongoUser } from '../schema';
import { DEFAULT_TEAM_AVATAR } from '@fastgpt/global/common/system/constants';
import { GroupMemberRole } from '@fastgpt/global/support/permission/memberGroup/constant';
async function getTeamMember(match: Record<string, any>): Promise<TeamTmbItemType> {
  const tmb = (await MongoTeamMember.findOne(match).populate('teamId')) as TeamMemberWithTeamSchema;
  if (!tmb) {
    return Promise.reject('member not exist');
  }

  const Per = await getResourcePermission({
    resourceType: PerResourceTypeEnum.team,
    teamId: tmb.teamId._id,
    tmbId: tmb._id
  });

  return {
    userId: String(tmb.userId),
    teamId: String(tmb.teamId._id),
    teamName: tmb.teamId.name,
    memberName: tmb.name,
    avatar: tmb.teamId.avatar,
    balance: tmb.teamId.balance,
    tmbId: String(tmb._id),
    teamDomain: tmb.teamId?.teamDomain,
    role: tmb.role,
    status: tmb.status,
    defaultTeam: tmb.defaultTeam,
    lafAccount: tmb.teamId.lafAccount,
    permission: new TeamPermission({
      per: Per ?? TeamDefaultPermissionVal,
      isOwner: tmb.role === TeamMemberRoleEnum.owner
    }),
    notificationAccount: tmb.teamId.notificationAccount
  };
}

export async function getTmbInfoByTmbId({ tmbId }: { tmbId: string }) {
  if (!tmbId) {
    return Promise.reject('tmbId or userId is required');
  }
  return getTeamMember({
    _id: new Types.ObjectId(String(tmbId)),
    status: notLeaveStatus
  });
}

export async function getUserDefaultTeam({ userId }: { userId: string }) {
  if (!userId) {
    return Promise.reject('tmbId or userId is required');
  }
  return getTeamMember({
    userId: new Types.ObjectId(userId),
    defaultTeam: true
  });
}

export async function createDefaultTeam({
  userId,
  teamName = 'My Team',
  avatar = '/imgs/tianyuanlogo.png',
  balance,
  session
}: {
  userId: string;
  teamName?: string;
  avatar?: string;
  balance?: number;
  session: ClientSession;
}) {
  // auth default team
  const tmb = await MongoTeamMember.findOne({
    userId: new Types.ObjectId(userId),
    defaultTeam: true
  });

  if (!tmb) {
    // create team
    const [{ _id: insertedId }] = await MongoTeam.create(
      [
        {
          ownerId: userId,
          name: teamName,
          avatar,
          balance,
          createTime: new Date()
        }
      ],
      { session }
    );
    // create team member
    const [tmb] = await MongoTeamMember.create(
      [
        {
          teamId: insertedId,
          userId,
          name: 'Owner',
          role: TeamMemberRoleEnum.owner,
          status: TeamMemberStatusEnum.active,
          createTime: new Date(),
          defaultTeam: true
        }
      ],
      { session }
    );
    // create default group
    const [group] = await MongoMemberGroupModel.create(
      [
        {
          teamId: tmb.teamId,
          name: DefaultGroupName,
          avatar: DEFAULT_TEAM_AVATAR
        }
      ],
      { session }
    );
    console.log('create default team and group', userId);

    await MongoGroupMemberModel.create(
      [
        {
          tmbId: tmb._id,
          groupId: group._id,
          role: GroupMemberRole.owner
        }
      ],
      { session }
    );
    return tmb;
  } else {
    console.log('default team exist', userId);
    await MongoTeam.findByIdAndUpdate(tmb.teamId, {
      $set: {
        ...(balance !== undefined && { balance })
      }
    });
  }
}

export async function updateTeam({
  teamId,
  name,
  avatar,
  teamDomain,
  lafAccount
}: UpdateTeamProps & { teamId: string }) {
  return mongoSessionRun(async (session) => {
    await MongoTeam.findByIdAndUpdate(
      teamId,
      {
        name,
        avatar,
        teamDomain,
        lafAccount
      },
      { session }
    );

    // update default group
    if (avatar) {
      await MongoMemberGroupModel.updateOne(
        {
          teamId: teamId,
          name: DefaultGroupName
        },
        {
          avatar
        },
        { session }
      );
    }
  });
}

//新增用户
export const createUser = async ({
  userData,
  inviterId
}: {
  userData: {
    username: string;
    password: string;
    phonePrefix?: number;
    status?: string;
    avatar?: string;
    inviterId?: string;
    promotionRate?: number;
    openaiAccount?: {
      key?: string;
      baseUrl?: string;
    };
    timezone?: string;
    lastLoginTmbId?: string;
    fastgpt_sem?: object;
  };
  inviterId: string;
}): Promise<{ message: string }> => {
  // 校验必填项
  if (!userData.username || !userData.password) {
    throw new Error('用户名和密码为必填项');
  }

  try {
    // 调用 addUser 函数插入用户数据
    await addUser({ ...userData, inviterId });
    return { message: '用户创建成功' };
  } catch (error) {
    console.error('用户创建失败:', error);
    throw new Error('用户创建失败');
  }
};

/***************************查询 ***************************/
export const getTeamMembers = async (teamId: string) => {
  const teamMembers = (await MongoTeamMember.find({ teamId })
    .lean()
    .populate(['userId'])) as TeamMemberWithUserSchema[];

  const groupMembers = await MongoGroupMemberModel.find({}).lean().populate('groupId');

  return teamMembers.map((tmb) => ({
    tmbId: tmb._id,
    teamId: tmb.teamId,
    role: tmb.role,
    name: tmb.name,
    status: tmb.status,
    defaultTeam: tmb.defaultTeam,
    groups: groupMembers
      .filter((gm) => gm.tmbId.toString() === tmb._id.toString())
      .map((gm) => ({
        groupId: (gm.groupId as any)._id,
        name: (gm.groupId as any).name,
        role: gm.role
      })),
    userId: tmb.userId._id,
    username: tmb.userId.username,
    avatar: tmb.userId.avatar,
    userStatus: tmb.userId.status,
    userCreateTime: tmb.userId.createTime
  })) as TeamMemberWithUserInfoType[];
};

export const getNotGroupMembers = async (teamId: string) => {
  const groupIds = await MongoMemberGroupModel.find({ teamId: teamId }, { _id: 1 }).lean();

  // 1. 查询 group_member 表，获取所有的 userId
  const groupMemberUserIds = await MongoGroupMemberModel.find(
    { groupId: { $in: groupIds } },
    { tmbId: 1 } // 获取所有 userId
  ).lean();

  // 提取 userId 列表
  const tmbIdsInGroup = groupMemberUserIds.map((item) => item.tmbId);

  // 2. 查询 tmb 表中不在 group_member 表中的 userId
  const result = (await MongoTeamMember.find({
    _id: { $nin: tmbIdsInGroup } // 查找 tmb 表中不在 userIdsInGroup 列表中的记录
  })
    .lean()
    .populate(['userId'])) as TeamMemberWithUserSchema[];

  return result.map((tmb) => ({
    tmbId: tmb._id,
    teamId: tmb.teamId,
    role: tmb.role,
    name: tmb.name,
    status: tmb.status,
    defaultTeam: tmb.defaultTeam,
    userId: tmb.userId._id,
    username: tmb.userId.username,
    avatar: tmb.userId.avatar,
    userStatus: tmb.userId.status,
    userCreateTime: tmb.userId.createTime,
    groups: []
  })) as TeamMemberWithUserInfoType[];
};

/*************************** 删除 ***************************/
export const deleteTeamMember = async ({ tmbId, userId }: { tmbId: string; userId: string }) => {
  return await mongoSessionRun(async (session) => {
    // 1. 从全部所在群组移除
    await MongoGroupMemberModel.deleteMany({ tmbId }, { session });

    // 2. 从所在团队移除
    const res = await MongoTeamMember.deleteOne({ _id: tmbId }, { session }).lean();

    console.log('从成员表中删除：', res);

    // 3. 删除用户
    await MongoUser.deleteOne({ _id: userId }, { session });
  });
};
