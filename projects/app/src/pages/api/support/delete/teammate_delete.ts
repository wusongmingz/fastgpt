// import { authCert } from '@fastgpt/service/support/permission/auth/common';
// import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';
// import {
//   deleteTeamMemberByUserIdAndGroupId // 删除团队中某个用户与该团队绑定关系的函数
// } from '@fastgpt/service/support/permission/memberGroup/controllers';
// import { NextAPI } from '@/service/middleware/entry';
// import { ERROR_ENUM } from '@fastgpt/global/common/error/errorCode';

// /**
//  * API 请求体类型
//  */
// export type DeleteTeamMemberQuery = {};
// export type DeleteTeamMemberBody = {
//   userId: string; // 需要删除的用户 ID
//   groupId: string; // 需要删除的团队 ID
// };
// export type DeleteTeamMemberResponse = {
//   message: string;
// };

// /**
//  * 处理函数
//  * @param req API 请求
//  * @param res API 响应
//  * @returns 删除结果
//  */
// async function handler(
//   req: ApiRequestProps<DeleteTeamMemberBody, DeleteTeamMemberQuery>,
//   res: ApiResponseType<DeleteTeamMemberResponse>
// ): Promise<any> {
//   const { userId, groupId } = req.body;

//   try {
//     // 删除团队中某个用户与该团队的绑定关系
//     await deleteTeamMemberByUserIdAndGroupId(userId, groupId);

//     // 返回成功响应
//     return res.status(200).json({ message: '用户与团队的绑定关系删除成功' });
//   } catch (error) {
//     console.error('用户与团队的绑定关系删除失败:', error);
//     return res.status(500).json({ message: '用户与团队的绑定关系删除失败' });
//   }
// }

// export default NextAPI(handler);
