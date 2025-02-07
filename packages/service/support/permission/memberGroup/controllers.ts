import {
  MemberGroupListType,
  MemberGroupSchemaType
} from '@fastgpt/global/support/permission/memberGroup/type';
import { DEFAULT_TEAM_AVATAR } from '@fastgpt/global/common/system/constants';
import { MongoGroupMemberModel } from './groupMemberSchema';
import { TeamMemberSchema } from '@fastgpt/global/support/user/team/type';
import { PerResourceTypeEnum } from '@fastgpt/global/support/permission/constant';
import { MongoResourcePermission } from '../schema';
import { getGroupPer, parseHeaderCert } from '../controller';
import { MongoMemberGroupModel } from './memberGroupSchema';
import { DefaultGroupName } from '@fastgpt/global/support/user/team/group/constant';
import mongoose, { ClientSession } from 'mongoose';
import { GroupMemberRole } from '@fastgpt/global/support/permission/memberGroup/constant';
import { AuthModeType, AuthResponseType } from '../type';
import team, { TeamErrEnum } from '@fastgpt/global/common/error/code/team';
import { TeamPermission } from '@fastgpt/global/support/permission/user/controller';
import { getTmbInfoByTmbId } from '../../user/team/controller';
import { MongoTeamMember } from '../../user/team/teamMemberSchema'; //江
import { mongoSessionRun } from '../../../common/mongo/sessionRun';
import { MongoUser } from '../../user/schema';
//import { MongoTeamMemberModel } from './teammembersSchema';
/**
 * Get the default group of a team
 * @param{Object} obj
 * @param{string} obj.teamId
 * @param{ClientSession} obj.session
 */
export const getTeamDefaultGroup = async ({
  teamId,
  session
}: {
  teamId: string;
  session?: ClientSession;
}) => {
  const group = await MongoMemberGroupModel.findOne({ teamId, name: DefaultGroupName }, undefined, {
    session
  }).lean();

  // Create the default group if it does not exist
  if (!group) {
    const [group] = await MongoMemberGroupModel.create(
      [
        {
          teamId,
          name: DefaultGroupName
        }
      ],
      { session }
    );
    return group;
  }
  return group;
};

export const getGroupsByTmbId = async ({
  tmbId,
  teamId,
  role
}: {
  tmbId: string;
  teamId: string;
  role?: `${GroupMemberRole}`[];
}) =>
  (
    await Promise.all([
      (
        await MongoGroupMemberModel.find({
          tmbId,
          groupId: {
            $exists: true
          },
          ...(role ? { role: { $in: role } } : {})
        })
          .populate('groupId')
          .lean()
      ).map((item) => {
        return {
          ...(item.groupId as any as MemberGroupSchemaType)
        };
      })
      // 由于当前实现逻辑是所有成员都会被添加进DEFAULT_GROUP，所以这里需要过滤掉默认组
      // role ? [] : getTeamDefaultGroup({ teamId })
    ])
  ).flat();

export const getGroupsByName = async ({
  name,
  teamId,
  tmbId
}: {
  name: string;
  teamId: string;
  tmbId: string;
}) => {
  const memberGroups = await getGroupsByTmbId({ tmbId, teamId });

  // 执行查询并返回结果
  const groups = await MongoMemberGroupModel.find({
    teamId: teamId,
    ...(name ? { name: { $regex: name, $options: 'i' } } : {})
  }).lean();

  return memberGroups.filter((group) =>
    groups.some((g) => g._id.toString() === group._id.toString())
  );
};

export const getTmbByGroupId = async (groupId: string) => {
  return (
    await MongoGroupMemberModel.find({
      groupId
    })
      .populate('tmbId')
      .lean()
  ).map((item) => {
    return {
      ...(item.tmbId as any as MemberGroupSchemaType)
    };
  });
};

export const getGroupMembersByGroupId = async (groupId: string) => {
  return await MongoGroupMemberModel.find({
    groupId
  }).lean();
};

export const getGroupMembersWithInfoByGroupId = async (groupId: string) => {
  return (
    await MongoGroupMemberModel.find({
      groupId
    })
      .populate('tmbId')
      .lean()
  ).map((item) => item.tmbId) as any as TeamMemberSchema[]; // HACK: type casting
};

/**
 * Get tmb's group permission: the maximum permission of the group
 * @param tmbId
 * @param resourceId
 * @param resourceType
 * @returns the maximum permission of the group
 */
export const getGroupPermission = async ({
  tmbId,
  resourceId,
  teamId,
  resourceType
}: {
  tmbId: string;
  teamId: string;
} & (
  | {
      resourceId?: undefined;
      resourceType: 'team';
    }
  | {
      resourceId: string;
      resourceType: Omit<PerResourceTypeEnum, 'team'>;
    }
)) => {
  const groupIds = (await getGroupsByTmbId({ tmbId, teamId })).map((item) => item._id);
  const groupPermissions = (
    await MongoResourcePermission.find({
      groupId: {
        $in: groupIds
      },
      resourceType,
      resourceId,
      teamId
    })
  ).map((item) => item.permission);

  return getGroupPer(groupPermissions);
};

// auth group member role
export const authGroupMemberRole = async ({
  groupId,
  role,
  ...props
}: {
  groupId: string;
  role: `${GroupMemberRole}`[];
} & AuthModeType): Promise<AuthResponseType> => {
  const result = await parseHeaderCert(props);
  const { teamId, tmbId, isRoot } = result;
  if (isRoot) {
    return {
      ...result,
      permission: new TeamPermission({
        isOwner: true
      }),
      teamId,
      tmbId
    };
  }
  const groupMember = await MongoGroupMemberModel.findOne({ groupId, tmbId });
  const tmb = await getTmbInfoByTmbId({ tmbId });
  if (tmb.permission.hasManagePer || (groupMember && role.includes(groupMember.role))) {
    return {
      ...result,
      permission: tmb.permission,
      teamId,
      tmbId
    };
  }
  return Promise.reject(TeamErrEnum.unAuthTeam);
};

/*******************************新增*********************************/
export const createTeamMemberGroup = async ({
  teamId,
  tmbId,
  name,
  avatar,
  intro
}: {
  teamId: string;
  tmbId: string;
  name: string;
  avatar?: string;
  intro?: string;
}): Promise<MemberGroupSchemaType[]> => {
  return mongoSessionRun(async (session) => {
    // 1. 创建群组
    const group = await MongoMemberGroupModel.create(
      [
        {
          name,
          avatar: avatar || DEFAULT_TEAM_AVATAR,
          teamId,
          intro: intro ?? ''
        }
      ],
      { session }
    );

    // 2. 添加团队所有者到群组中
    await MongoGroupMemberModel.create(
      [{ groupId: group[0]._id, tmbId, role: GroupMemberRole.owner }],
      { session }
    );

    return group;
  });
};

//更新团队信息
export const updateTeamMemberGroup = async ({
  _id,
  teamId,
  ...match
}: {
  _id: string;
  name: string;
  avatar?: string;
  intro?: string;
  teamId: string;
}): Promise<MemberGroupSchemaType | null> => {
  if (!_id) {
    throw new Error('Team member ID (_id) is required');
  }

  return await MongoMemberGroupModel.findOneAndUpdate(
    {
      _id,
      teamId
    },
    match
  );
};

//将用户信息添加到team_members中
export const createTeamMember = async ({
  teamId,
  userId,
  username,
  name,
  role,
  status,
  defaultTeam
}: {
  teamId?: string;
  userId: string | null;
  username?: string;
  name?: string;
  role?: string;
  status?: string;
  defaultTeam?: boolean;
}) => {
  try {
    // 将数据插入到 team_members 集合
    const newTeamMember = new MongoTeamMember({
      teamId,
      userId,
      name: username,
      role,
      status,
      createTime: new Date(),
      defaultTeam
    });

    // 保存到数据库
    await newTeamMember.save();

    // 返回成功响应
    return {
      message: 'teammembers创建成功_lay'
    };
  } catch (error) {
    // 处理可能的错误
    console.error(error);
    throw new Error('团队成员创建失败');
  }
};

//groupid+tmbid创建群组增加用户
export const createTeamGroupMember = async ({
  groupId,
  tmbId,
  role
}: {
  groupId: string;
  tmbId: string[];
  role?: string | GroupMemberRole;
}) => {
  try {
    return await MongoGroupMemberModel.create(tmbId.map((id) => ({ groupId, tmbId: id, role })));
  } catch (error) {
    console.error('插入失败:', error);
    throw new Error('创建失败');
  }
};

/*******************************查询**********************************/
//查询所有小组
export async function getAllMemberGroupNames() {
  try {
    // 查询所有数据，并只选择name字段
    const groups = await MongoMemberGroupModel.find({}).lean();
    // 将查询结果中的name字段提取到一个数组中并返回
    return groups;
  } catch (error) {
    console.error('查询大团队里面所有的小组的名字 失败:', error);
    throw new Error('Failed to fetch member group names');
  }
}

//在team_member_groups中，根据组名name查找文档id,作为groupid
export const getGroupIdByName = async (groupname: string): Promise<any> => {
  const name = groupname;
  const group = await MongoMemberGroupModel.findOne({ name }).lean();
  return group;
};

//在team_members根据userid查找文档id，作为tmbid
export const getTmbIdByUserId = async (userId: string | string[]): Promise<any> => {
  let member;
  if (typeof userId === 'string') {
    member = await MongoTeamMember.findOne({ userId }).lean();
  } else {
    member = await MongoTeamMember.find({ userId: { $in: userId } }).lean();
  }
  return member;
};

//查询指定小组的所有成员
export async function getMongoTeamMembertmbIDs(groupId: string) {
  try {
    // 根据给定的groupId从小团队表内查询所有tmbId
    const groupMembers = await MongoGroupMemberModel.find({ groupId }, { tmbId: 1 })
      .lean()
      .populate(['tmbId', 'role']);
    const groupMemberTmbIds = groupMembers.map((member) => member.tmbId);
    // return groupMembers;
    return groupMembers.map((member) => member.tmbId);
    // return groupMemberTmbIds;
  } catch (error) {
    console.error('查看指定小组里面有什么成员 失败:', error);
    throw new Error('Failed to fetch diff team member names');
  }
}

// 查询用户角色为 [owner, admin] 的群组
export const getGroupListWithManagePer = async (tmbId: string) => {
  const members = await MongoGroupMemberModel.find({
    tmbId,
    role: { $in: ['owner', 'admin'] }
  })
    .populate('groupId')
    .lean();

  return members.map((member) => member.groupId) as any as MemberGroupListType;
};

export const getGroupMembersWithInfo = async (groupId: string) => {
  const groupMembers = await MongoGroupMemberModel.find({ groupId }).populate('tmbId').lean();

  return groupMembers.map((member) => {
    const tmb = member.tmbId as any as TeamMemberSchema;
    if (tmb) {
      const { name, role: tmbRole, userId } = tmb ?? {};

      return {
        ...member,
        tmbId: tmb._id,
        userId,
        name,
        tmbRole
      };
    }
  });
};

export const getAllMembersWithInfo = async (groupId: string) => {
  const groupMembers = await MongoGroupMemberModel.find({ groupId }).lean();

  // 1. 提取所有成员的 userId
  const tmbIds = groupMembers.filter((member) => member.tmbId); // 过滤掉 undefined 或 null 的 userId
  // 2. 查询所有用户，并给每个用户加上一个 isMember 字段
  const allUsers = await MongoTeamMember.find({}).populate('userId').lean();

  // 3. 遍历所有用户，检查 userId 是否在 userIds 中，添加 isMember 字段
  const usersWithMemberFlag = allUsers.map((user) => {
    return {
      _id: user._id, // tmbId
      name: user.name,
      username: (user.userId as any).username,
      userId: (user.userId as any)._id,
      isMember: tmbIds.some((tmb) => tmb.tmbId.toString() === user._id.toString()) // 如果 userId 在 userIds 中则为 true，否则为 false
    };
  });

  return usersWithMemberFlag;
};

export const getAllGroupMembersWithInfo = async (groupId: string) => {
  const pipeline = [
    {
      $lookup: {
        from: 'team_members', // 假设 team_members 是 MongoTeamMember 的集合名
        localField: 'tmbId',
        foreignField: '_id',
        as: 'tmbInfo'
      }
    },
    {
      $unwind: '$tmbInfo'
    },
    {
      $lookup: {
        from: 'team_member_groups', // 假设 member_groups 是 MongoMemberGroupModel 的集合名
        localField: 'groupId',
        foreignField: '_id',
        as: 'groupInfo'
      }
    },
    {
      $unwind: '$groupInfo'
    },
    {
      $group: {
        _id: '$groupInfo._id',
        groupName: { $first: '$groupInfo.name' },
        groupId: { $first: '$groupInfo._id' },
        createdAt: { $first: '$groupInfo.createdAt' },
        members: {
          $push: {
            _id: '$tmbInfo._id',
            name: '$tmbInfo.name',
            username: '$tmbInfo.username',
            userId: '$tmbInfo.userId',
            isMember: {
              $cond: [{ $eq: ['$groupId', new mongoose.Types.ObjectId(groupId)] }, true, false]
            }
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        groupName: 1,
        groupId: 1,
        members: 1
      }
    }
  ];

  const result = await MongoGroupMemberModel.aggregate(pipeline);

  // 获取传入 groupId 的组成员
  const groupMembers = await MongoGroupMemberModel.find({ groupId }).lean();
  const groupMemberIds = new Set(groupMembers.map((member) => member.tmbId.toString()));

  // 更新 isMember 字段
  const updatedResult = result.map((group) => ({
    ...group,
    members: group.members.map((member: any) => ({
      ...member,
      isMember: groupMemberIds.has(member._id.toString())
    }))
  }));

  return updatedResult;
};

/*******************************更新**********************************/
export const updateTeamGroupMember = async ({
  groupId,
  tmbId,
  role
}: {
  groupId: string;
  tmbId: string;
  role: `${GroupMemberRole}`;
}) => {
  return await MongoGroupMemberModel.findOneAndUpdate({ groupId, tmbId }, { role });
};

/*******************************删除**********************************/
export const deleteTeamMemberGroup = async ({
  teamId,
  groupId
}: {
  teamId: string;
  groupId: string;
}) => {
  await mongoSessionRun(async (session) => {
    // 1. 删除群组内的成员
    await MongoGroupMemberModel.deleteMany({ groupId }, { session });
    // 2. 删除群组
    await MongoMemberGroupModel.deleteOne({ _id: groupId, teamId }, { session });
  });
};

export const deleteTeamGroupAllMembersByGroupId = async (groupId: string) => {
  return await MongoGroupMemberModel.deleteMany({
    groupId,
    role: { $ne: GroupMemberRole.owner }
  }).lean();
};

export const deleteTeamGroupMember = async ({
  groupId,
  tmbId
}: {
  groupId: string;
  tmbId: string;
}) => {
  await MongoGroupMemberModel.deleteOne({ groupId, tmbId }).lean();
};
