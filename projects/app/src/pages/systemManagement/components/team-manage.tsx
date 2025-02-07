import MyIcon from '@fastgpt/web/components/common/Icon';
import MyInput from '@/components/MyInput';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Grid,
  Input,
  Textarea
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import AIcon from '@/components/AIcon/AIcon';
import Avatar from '@fastgpt/web/components/common/Avatar';
import { useForm } from 'react-hook-form';
import Card from './card';
import useDeleteModal from '../hooks/useDeleteModal';
import useCreateModal from '../hooks/useCreateModal';
import FormLabel from '@fastgpt/web/components/common/MyBox/FormLabel';
import AddUserModal from './add-user-modal';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import {
  getAllTeamMembersWithInfo,
  getAllTeamMembersWithInfoInGroup,
  getTeamList,
  getTeamListNew,
  getTeamMembers,
  TeamMemberWithSimpleInfo
} from '@/web/support/user/team/api';
import { useRouter } from 'next/router';
import MyBox from '@fastgpt/web/components/common/MyBox';
import { getMyApps } from '@/web/core/app/api';
import { AppListItemType } from '@fastgpt/global/core/app/type';
import { getAllDataset, getDatasets } from '@/web/core/dataset/api';
import { DatasetSimpleItemType } from '@fastgpt/global/core/dataset/type';
import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import {
  postCreateTeamGroup,
  deleteTeamGroupByGroupId,
  deleteAllTeamGroupMembers,
  getTeamGroupMembersByGroupId,
  deleteTeamGroupMember,
  updateTeamGroupMemberRole,
  searchGroupMembers,
  searchGroupList,
  updateGroupInfo
} from '@/web/support/user/team/group/api';
import { GroupMemberRole } from '@fastgpt/global/support/permission/memberGroup/constant';
import { Select } from 'chakra-react-select';
import Table1 from './table';
import { useDebounceFn } from 'ahooks';
import { DEFAULT_TEAM_AVATAR } from '@fastgpt/global/common/system/constants';
import { useToast } from '@fastgpt/web/hooks/useToast';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import { useSelectFile } from '@/web/common/file/hooks/useSelectFile';
import { compressImgFileAndUpload } from '@/web/common/file/controller';
import { MongoImageTypeEnum } from '@fastgpt/global/common/file/image/constants';
import CreateTeamModal from './create-team-modal';

interface EditTeamInfoForm {
  id?: string;
  name: string;
  intro: string;
}

interface CreateTeamFormData {
  avatar: string;
  name: string;
  intro: string;
}

interface Team {
  _id: string;
  name: string;
  avatar: string;
  intro: string;
}

interface Member {
  _id: string;
  groupId: string;
  tmbId: string;
  userId: string;
  name: string;
  role: `${GroupMemberRole}`;
}

interface User {
  userId: string;
  tmbId: string;
  name: string;
}

const TeamManage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { groupId, tab } = router.query as { groupId: string; tab: 'team' | 'user' };

  const memberRoleOptions = [
    { value: GroupMemberRole.admin, label: '团队管理员' },
    { value: GroupMemberRole.member, label: '团队成员' }
  ];

  const [teamList, setTeamList] = useState<Team[]>([]);
  const [originalTeamList, setOriginalTeamList] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>();
  const groupIdRef = useRef<string>(groupId);

  useEffect(() => {
    getTeamListNew().then((res) => {
      setTeamList(res);
      setOriginalTeamList(res);
      setSelectedTeam(() => res.find((team) => team._id === groupId));
    });
  }, []);

  useEffect(() => {
    groupIdRef.current = groupId;
  }, [teamList, groupId]);

  useEffect(() => {
    setSelectedTeam(() => teamList.find((team) => team._id === groupId));
  }, [groupId]);

  const [searchText, setSearchText] = useState('');
  const [isExpand, setisExpand] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isOpenUserModal, setIsOpenUserModal] = useState(false);
  const [isOpenCreateTeamModal, setIsOpenCreateTeamModal] = useState(false);
  const {
    openConfirm,
    ConfirmModal,
    onClose: closeConfirm
  } = useDeleteModal({
    content: ''
  });

  const [members, setMembers] = useState<Member[]>([]);
  const [apps, setApps] = useState<AppListItemType[]>([]);
  const [datasets, setDatasets] = useState<DatasetSimpleItemType[]>([]);

  const { run: fetchMembers, loading: isFetchingMembers } = useRequest2(
    () => getTeamGroupMembersByGroupId(groupIdRef.current),
    {
      onSuccess: (res) => {
        setMembers(res.filter(Boolean));
      }
    }
  );

  const { run: fetchApps, loading: isFetchingApps } = useRequest2(() => getMyApps(), {
    onSuccess: (res) => {
      setApps(res);
    }
  });

  const { run: fetchDatasets, loading: isFetchingDatasets } = useRequest2(() => getAllDataset(), {
    onSuccess: (res) => {
      setDatasets(res);
    }
  });

  const isFetchingReSource = (title: string) =>
    ['知识库', '图知识库'].includes(title) ? isFetchingDatasets : isFetchingApps;

  useEffect(() => {
    fetchMembers();
    fetchApps();
    fetchDatasets();
    fetchUsers();
  }, [groupId]);

  const [users, setUsers] = useState<TeamMemberWithSimpleInfo[]>();
  const [usersInGroup, setUsersInGroup] = useState();
  const { run: fetchUsers, loading: isFetchingUsers } = useRequest2(
    () =>
      Promise.all([
        getAllTeamMembersWithInfo(groupIdRef.current),
        getAllTeamMembersWithInfoInGroup(groupIdRef.current)
      ]),
    {
      manual: false,
      onSuccess: (data: any) => {
        const [users, usersInGroup] = data;
        setUsers(users);
        setUsersInGroup(usersInGroup);
      }
    }
  );

  // 新增团队、添加成员的模态框
  const { openModal, CreateModal, onClose } = useCreateModal({ title: '', content: '' });

  const onCreateTeamSuccess = async () => {
    const data = await getTeamListNew();
    setTeamList(data);
    setOriginalTeamList(data);
    setIsOpenCreateTeamModal(false);
  };

  const onCreateTeam = () => {
    setIsOpenCreateTeamModal(true);
  };

  const removeAllMembers = () => {
    openConfirm({
      confirm: async () => {
        await deleteAllTeamGroupMembers(groupId);
        fetchMembers();
        fetchUsers();
        closeConfirm();
      },
      customContent: '是否确认移除所有成员？'
    })();
  };

  const deleteTeam = () => {
    openConfirm({
      confirm: async () => {
        try {
          await deleteTeamGroupByGroupId(groupId);
          const res = await getTeamListNew();
          setTeamList(res);
          router.replace({ query: { groupId: res[0]._id, tab: 'team' } });
        } catch (error: any) {
          toast({
            title: error.message,
            status: 'error'
          });
        } finally {
          closeConfirm();
        }
      },
      customContent: '是否确认删除该团队'
    })();
  };

  const teamInfo = useMemo(() => {
    return {
      name: selectedTeam?.name,
      avatar: selectedTeam?.avatar ?? DEFAULT_TEAM_AVATAR,
      intro: selectedTeam?.intro || '暂无团队介绍'
    };
  }, [selectedTeam]);

  const resourceList = useMemo(
    () => [
      {
        title: '知识库',
        data: datasets.filter((dataset) => dataset.type !== 'graph')
      },
      {
        title: '图知识库',
        data: datasets.filter((dataset) => dataset.type === 'graph')
      },
      {
        title: '简易应用',
        data: apps.filter((app) => app.type === 'simple')
      },
      {
        title: '工作流',
        data: apps.filter((app) => app.type === AppTypeEnum.workflow)
      },
      {
        title: '插件',
        data: apps.filter((app) => app.type === AppTypeEnum.plugin)
      }
    ],
    [datasets, apps]
  );

  const { register, handleSubmit, reset } = useForm<EditTeamInfoForm>({
    defaultValues: {
      name: selectedTeam?.name || '',
      intro: selectedTeam?.intro || ''
    }
  });

  useEffect(() => {
    if (selectedTeam) {
      reset({
        name: selectedTeam?.name || '',
        intro: selectedTeam?.intro || ''
      });
    }
  }, [selectedTeam]);

  const onSearch = useCallback(async (searchText: string) => {
    const res = await searchGroupMembers({ groupId, name: searchText });
    return res;
  }, []);

  const { run: onSearchTeamList } = useDebounceFn(
    async (searchText: string) => {
      const res = await searchGroupList({ name: searchText });
      setTeamList(res);
      // 如果搜索结果中没有当前选中的团队，保持 selectedTeam 不变
      if (!res.find((team) => team._id === groupIdRef.current)) {
        setSelectedTeam(() => originalTeamList.find((team) => team._id === groupIdRef.current));
      }
    },
    {
      wait: 200
    }
  );

  const handleUpdateTeamInfo = async () => {
    handleSubmit(async (formData) => {
      // 记录原始数据
      const originalTeamList = [...teamList];

      // 乐观更新 UI
      const updatedTeamList = teamList.map((team) =>
        team._id === groupId ? { ...team, ...formData } : team
      );
      setTeamList(updatedTeamList);
      setSelectedTeam(updatedTeamList.find((team) => team._id === groupId));
      setIsEditing(false);

      try {
        // 发送更新请求
        await updateGroupInfo({ ...formData, _id: groupId });
        // 请求成功，可以再次获取最新数据或直接使用乐观更新的数据
        const res = await getTeamListNew();
        setTeamList(res);
        reset();
      } catch (error) {
        // 请求失败，回退到原始数据
        setTeamList(originalTeamList);
        setSelectedTeam(originalTeamList.find((team) => team._id === groupId));
        console.error('更新团队信息失败:', error);
        // 可以显示错误提示给用户
        toast({
          title: '更新团队信息失败',
          status: 'error'
        });
      }
    })();
  };

  const Action = ({ record }: { record: Member }) => {
    let role = record.role;
    const groupId = groupIdRef.current;
    const onRemoveFromTeam = () => {
      if (record.role === 'owner') return;
      openConfirm({
        customContent: '确定将成员移除该团队吗？',
        confirm: async () => {
          await deleteTeamGroupMember({
            groupId,
            tmbId: record.tmbId
          });
          fetchMembers();
          fetchUsers();
        }
      })();
    };

    const onRoleManage = () => {
      if (record.role === 'owner') return;
      openModal({
        customTitle: '设置角色',
        customContent: (
          <Flex w={'100%'} h={'100%'} justifyContent={'center'} alignItems={'center'}>
            <Select
              options={memberRoleOptions}
              defaultValue={memberRoleOptions.filter((val) => val.value === record.role)[0]}
              onChange={(val) => {
                // setMemberRole(val!.value);
                role = val!.value;
              }}
            />
          </Flex>
        ),
        confirm: async () => {
          if (role === record.role) {
            onClose();
            return;
          }
          await updateTeamGroupMemberRole({
            groupId,
            tmbId: record.tmbId,
            role: role!
          });
          fetchMembers();
          onClose();
        },
        style: { minW: ['300px', '400px'], h: '240px' }
      })();
    };

    return (
      <Flex gap={4} justifyContent={'center'}>
        <Flex
          alignItems={'center'}
          gap={2}
          cursor={record.role === 'owner' ? 'not-allowed' : 'pointer'}
          onClick={onRoleManage}
        >
          <AIcon name="icon-jiaoseguanli2" color="primary.500" fontSize="1.5rem" />
          <Box>角色管理</Box>
        </Flex>
        <Flex
          alignItems={'center'}
          gap={2}
          cursor={record.role === 'owner' ? 'not-allowed' : 'pointer'}
          onClick={onRemoveFromTeam}
        >
          <AIcon name="icon-gaojizujian_yichuxiezuoren" color="primary.500" fontSize="1.75rem" />
          <Box>从团队移除</Box>
        </Flex>
      </Flex>
    );
  };

  return (
    <MyBox
      display={['block', 'flex']}
      h={'100%'}
      flexDirection={'row'}
      flex={1}
      bgColor={'#fff'}
      borderRadius={'lg'}
      p={2}
      // isLoading={isFetchingTeamList}
    >
      {/* 左边列表 */}
      <Box
        minW={'400px'}
        bg={`linear-gradient(45deg, #EFEFF9, #FFFFFF, #EFEFF9, #FFFFFF)`}
        borderRadius={'lg'}
        p={2}
        overflowY={'auto'}
      >
        <Flex justifyContent={'center'} alignItems={'center'}>
          <Flex alignItems={'center'}>
            <Avatar src="/imgs/images/picture/our_team.svg" w={'1.5rem'} mr={2} />
            <Box fontWeight={'bold'} fontSize={'sm'}>
              团队管理
            </Box>
          </Flex>
          <Button
            variant={'whiteCommon'}
            w={'100px'}
            h={'32px'}
            ml={'auto'}
            mr={4}
            onClick={onCreateTeam}
          >
            <AIcon name="icon-xinzeng" fontSize="8px" mx={1} /> 新增
          </Button>
        </Flex>
        {/* 搜索框 */}
        <Box my={2}>
          <MyInput
            leftIcon={
              <MyIcon
                name="common/searchLight"
                position={'absolute'}
                w={'1.5rem'}
                color={'primary.500'}
              />
            }
            rightIcon={
              <AIcon
                name="icon-quxiao1"
                fontSize={'1.5rem'}
                color={'myGray.300'}
                cursor={'pointer'}
                onClick={async () => {
                  setSearchText('');
                  const res = await getTeamListNew();
                  setTeamList(res);
                }}
              />
            }
            pl={'38px'}
            bg={'myGray.25'}
            borderColor={'myGray.200'}
            color={'myGray.500'}
            w={'100%'}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              onSearchTeamList(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearchTeamList(searchText);
              }
            }}
          />
        </Box>
        {/* 团队列表 */}
        <Flex flexDirection={'column'} maxW={['100%', '300px']} mx={4} overflowY={'auto'}>
          <Flex
            alignItems={'center'}
            gap={2}
            bgColor={'#e0e0f4'}
            h={'40px'}
            borderRadius={'md'}
            cursor={'pointer'}
            onClick={() => setisExpand(!isExpand)}
          >
            {isExpand ? (
              <AIcon name="icon-shousuo2" fontSize="2rem" color="#797979" />
            ) : (
              <AIcon name="icon-shousuo1" fontSize="2rem" color="#797979" />
            )}

            <Box flex={1}>我的团队</Box>
          </Flex>
          {isExpand &&
            teamList.length > 0 &&
            teamList.map((team) => (
              <Flex
                w="calc(100% - 1rem)"
                h={'40px'}
                _hover={{ bgColor: '#e0e0f4' }}
                alignItems={'center'}
                borderRadius={'md'}
                mt={2}
                ml={'1rem'}
                px={4}
                cursor={'pointer'}
                bgColor={team._id === router.query.groupId ? '#e0e0f4' : ''}
                key={team._id}
                onClick={() => {
                  router.push({ query: { groupId: team._id, tab: 'team' } });
                }}
              >
                <Avatar src="/imgs/images/picture/our_team.svg" w={'1.5rem'} mr={4} />
                <Box overflow={'hidden'} whiteSpace={'nowrap'} textOverflow={'ellipsis'}>
                  {team.name}
                </Box>
              </Flex>
            ))}
        </Flex>
      </Box>

      {/* 右边 */}
      <Flex flexDir={'column'} flex={1} ml={2}>
        <Box
          display={'flex'}
          flexDirection={'column'}
          width={'100%'}
          h={'275px'}
          border={'2px solid'}
          borderColor={'#E0E0F4'}
          borderRadius={'lg'}
          p={2}
        >
          {/* 团队信息 */}
          <Flex h={'60px'} alignItems={'center'} gap={4} mb={2}>
            <Box>
              <Avatar src={teamInfo.avatar} w={'4rem'} />
            </Box>

            {isEditing ? (
              <>
                <Box
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'center'}
                  minW={'190px'}
                  fontWeight={'bold'}
                  h={'100%'}
                >
                  <Input
                    {...register('name', { required: true, maxLength: 10 })}
                    placeholder="填写团队名称"
                  />
                </Box>
                <Box
                  display={'flex'}
                  maxW={'500px'}
                  alignItems={'center'}
                  justifyContent={'center'}
                  h={'100%'}
                  borderRadius={'lg'}
                  flex={1}
                  textAlign={'center'}
                  border={'1px solid'}
                  borderColor={'borderColor.low'}
                >
                  <Input
                    {...register('intro', { maxLength: 20 })}
                    placeholder="填写团队简介"
                    h={'100%'}
                  />
                </Box>
                <AIcon
                  name="icon-tijiao"
                  fontSize="2rem"
                  color="primary.500"
                  mb={'-1rem'}
                  cursor={'pointer'}
                  onClick={handleUpdateTeamInfo}
                />
              </>
            ) : (
              <>
                <Box
                  // display={'inline-flex'}
                  // alignItems={'center'}
                  // justifyContent={'center'}
                  minW={'100px'}
                  maxW={'190px'}
                  fontWeight={'bold'}
                  lineHeight={'3rem'}
                  h={'100%'}
                  overflow={'hidden'}
                  whiteSpace={'nowrap'}
                  textOverflow={'ellipsis'}
                >
                  {teamInfo.name}
                </Box>
                <Box
                  maxW={'500px'}
                  h={'100%'}
                  lineHeight={'3.5rem'}
                  borderRadius={'lg'}
                  flex={1}
                  textAlign={'center'}
                  border={'2px solid'}
                  borderColor={'#EFEFF9'}
                  textOverflow={'ellipsis'}
                  overflow={'hidden'}
                  whiteSpace={'nowrap'}
                >
                  {teamInfo.intro}
                </Box>
                <AIcon
                  name="icon-shoudong"
                  fontSize="2rem"
                  color="primary.500"
                  mb={'-1rem'}
                  cursor={'pointer'}
                  onClick={() => setIsEditing(true)}
                />
              </>
            )}
            <Button variant={'whiteCommon'} w={'100px'} h={'32px'} ml={'auto'} onClick={deleteTeam}>
              删除团队
            </Button>
          </Flex>
          {/* 团队资源 */}
          <Grid gridTemplateColumns={'repeat(5, 1fr)'} gridGap={4} overflowY={'auto'}>
            {resourceList.map((item, index) => (
              <Card
                key={index}
                title={item.title}
                data={item.data}
                isLoading={isFetchingReSource(item.title)}
              />
            ))}
          </Grid>
        </Box>
        <Box display={'flex'} justifyContent={'flex-end'}>
          <Button
            variant={'whiteCommon'}
            w={'150px'}
            h={'32px'}
            my={2}
            mr={4}
            onClick={() => setIsOpenUserModal(true)}
          >
            <AIcon name="icon-xinzeng" fontSize="8px" mx={1} /> 添加成员
          </Button>
          <Button variant={'whiteCommon'} w={'150px'} h={'32px'} my={2} onClick={removeAllMembers}>
            <Box mx={1} fontWeight={'bold'} fontSize={'16px'}>
              -
            </Box>
            移除全部成员
          </Button>
        </Box>
        <Box flex={1} overflowY={'auto'}>
          <Table1<Member>
            data={members}
            type="team"
            Action={Action}
            loading={isFetchingMembers}
            onSearch={onSearch}
          />
        </Box>
      </Flex>

      {/* 删除模态框 */}
      <ConfirmModal />

      {/* 修改角色模态框 */}
      <CreateModal w={'600px'} />

      {/* 新增团队模态框 */}
      <CreateTeamModal
        isOpen={isOpenCreateTeamModal}
        onClose={() => setIsOpenCreateTeamModal(false)}
        onCancel={() => setIsOpenCreateTeamModal(false)}
        onSuccess={onCreateTeamSuccess}
      />

      {/* 添加成员模态框 */}
      <AddUserModal
        users={users}
        usersInGroup={usersInGroup}
        isOpen={isOpenUserModal}
        onConfirm={() => {
          fetchMembers();
          fetchUsers();
        }}
        onClose={() => setIsOpenUserModal(false)}
        isLoading={isFetchingUsers}
      />
    </MyBox>
  );
};

export default TeamManage;
