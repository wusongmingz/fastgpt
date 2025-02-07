// import { authCert } from '@fastgpt/service/support/permission/auth/common';
// import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';
// import {
//   deleteGroupById, // 删除团队的函数
//   deleteTeamMembersByGroupId // 删除团队中用户与该团队绑定关系的函数
// } from '@fastgpt/service/support/permission/memberGroup/controllers';
// import { NextAPI } from '@/service/middleware/entry';
// import { ERROR_ENUM } from '@fastgpt/global/common/error/errorCode';

// /**
//  * API 请求体类型
//  */
// export type DeleteGroupQuery = {};
// export type DeleteGroupBody = {
//   groupId: string; // 需要删除的团队 ID
// };
// export type DeleteGroupResponse = {
//   message: string;
// };

// /**
//  * 处理函数
//  * @param req API 请求
//  * @param res API 响应
//  * @returns 删除结果
//  */
// async function handler(
//   req: ApiRequestProps<DeleteGroupBody, DeleteGroupQuery>,
//   res: ApiResponseType<DeleteGroupResponse>
// ): Promise<any> {
//   const { groupId } = req.body;

//   try {
//     // 1. 删除团队
//     await deleteGroupById(groupId);

//     // 2. 删除团队中用户与该团队绑定的关系
//     await deleteTeamMembersByGroupId(groupId);

//     // 返回成功响应
//     return res.status(200).json({ message: '团队删除成功' });
//   } catch (error) {
//     console.error('团队删除失败:', error);
//     return res.status(500).json({ message: '团队删除失败', error });
//   }
// }

// export default NextAPI(handler);
