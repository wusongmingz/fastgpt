import AIcon from '@/components/AIcon/AIcon';
import {
  Box,
  Button,
  Flex,
  FormLabel,
  FormControl,
  FormErrorMessage,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Divider
} from '@chakra-ui/react';
import Table from './table';
import { FormState, useForm } from 'react-hook-form';
import useCreateModal from '../hooks/useCreateModal';
import { updateUserPassword } from '@/web/support/user/api';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { deleteTeamMember, getTeamMembers, searchTeamMembers } from '@/web/support/user/team/api';
import { formatTime2YMDHMS } from '@fastgpt/global/common/string/time';
import { GroupMemberRole } from '@fastgpt/global/support/permission/memberGroup/constant';
import useDeleteModal from '../hooks/useDeleteModal';
import { TeamMemberWithUserInfoType } from '@fastgpt/global/support/user/team/type';
import { useToast } from '@fastgpt/web/hooks/useToast';
import CreateUserModal from './create-user-modal';
import UserInfoCard from './user-info-card';
import { createPortal } from 'react-dom';

interface FormData {
  username: string;
  role: `${GroupMemberRole}`;
  password: string;
  groupId: string;
}

interface Group {
  _id: string;
  teamId: string;
  name: string;
}

interface RoleSelectOption {
  value: `${GroupMemberRole}`;
  label: '团队成员' | '团队管理员';
}

const UserManage = () => {
  const [users, setUsers] = useState<TeamMemberWithUserInfoType[]>([]);
  const [noTeamUsers, setNoTeamUsers] = useState<TeamMemberWithUserInfoType[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedTab, setSelectedTab] = useState<'all' | 'noTeam'>('all');
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const usersTableData = useMemo(() => {
    return users.map((user) => ({
      ...user,
      createTime: formatTime2YMDHMS(user.userCreateTime as unknown as Date)
    }));
  }, [users]);

  const noTeamUsersTableData = useMemo(() => {
    return noTeamUsers.map((user) => ({
      ...user,
      createTime: formatTime2YMDHMS(user.userCreateTime as unknown as Date)
    }));
  }, [noTeamUsers]);

  const { loading: isFetchingUsers } = useRequest2(() => getTeamMembers(), {
    manual: false,
    onSuccess: (data: any) => {
      setUsers(data.allMembers);
      setNoTeamUsers(data.notGroupMembers);
    }
  });

  const { openModal, CreateModal, onClose } = useCreateModal({});
  const { openConfirm, ConfirmModal, onClose: closeConfirm } = useDeleteModal({});

  const onCreateUserSuccess = async () => {
    const users = await getTeamMembers();
    setUsers(users.allMembers);
    setCreateUserModalOpen(false);
  };

  const onCreateUser = () => {
    setCreateUserModalOpen(true);
  };

  const onSearch = useCallback(async (searchText: string) => {
    const res = await searchTeamMembers(searchText);
    return res;
  }, []);

  const Action = ({ record }: { record: TeamMemberWithUserInfoType }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [showPassword, setShowPassword] = useState(false);
    const [isUerInfoOpen, setIsUerInfoOpen] = useState(false);

    const {
      register,
      formState: { errors },
      reset,
      handleSubmit
    } = useForm<{ tmbId: string; password: string }>({
      defaultValues: { tmbId: record.tmbId, password: '' }
    });

    const { run, loading } = useRequest2(
      (formData: { tmbId: string; password: string }) => updateUserPassword(formData),
      {
        onSuccess: (res) => {
          reset();
          onClose();
        }
      }
    );

    const handleDeleteUser = () => {
      console.log(record);
      if (record.role === 'owner') return;
      openConfirm({
        customContent: '是否确认删除用户？',
        confirm: async () => {
          await deleteTeamMember({ tmbId: record.tmbId, userId: record.userId });
          const data = await getTeamMembers();
          setUsers(data.allMembers);
          setNoTeamUsers(data.notGroupMembers);
          closeConfirm();
        }
      })();
    };

    const handleCloseModal = () => {
      reset();
      onClose();
    };

    const handleOpenUserInfo = () => {
      setIsUerInfoOpen(true);
      console.log('click', isUerInfoOpen);
    };

    // const handleUpdatePassword = () => {
    //   openModal({
    //     customTitle: '设置用户密码',
    //     customContent: <UpdatePasswordForm record={record} formState={formState} />,
    //     confirm: async () => {
    //       await handleUpdateUserSubmit((data) => {
    //         updateUserPassword(data);
    //         resetUpdateUser();
    //       })();
    //     },
    //     cancel: resetUpdateUser,
    //     style: { maxW: ['300px', '600px'], h: '240px' }
    //   })();
    // };
    // createPortal(
    //   <UserInfoCard record={record} onClose={() => setIsUerInfoOpen(false)} />,
    //   document.body
    // )

    return (
      <>
        <Flex gap={2} justifyContent={'center'}>
          <Box
            rounded={'full'}
            bgColor={'borderColor.low'}
            p={2}
            cursor={'pointer'}
            onClick={handleOpenUserInfo}
          >
            <AIcon name="icon-chakanyuanwen" fontSize="1.25rem" />
          </Box>
          <Box
            rounded={'full'}
            bgColor={'borderColor.low'}
            p={2}
            cursor={record.role === 'owner' ? 'not-allowed' : 'pointer'}
            onClick={handleDeleteUser}
          >
            <AIcon name="icon-shanchu1" fontSize="1.25rem" />
          </Box>
          <Box
            rounded={'full'}
            bgColor={'borderColor.low'}
            p={2}
            cursor={'pointer'}
            onClick={() => onOpen()}
          >
            <AIcon name="icon-shezhi-mima" fontSize="1.25rem" />
          </Box>
        </Flex>

        {/* 修改密码弹窗 */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent maxW={['300px', '600px']} h={'240x'}>
            <ModalHeader
              py={2}
              display={'flex'}
              alignItems={'center'}
              roundedTop={'lg'}
              fontSize={'md'}
              bgColor={'borderColor.low'}
            >
              设置用户密码
              <ModalCloseButton
                _hover={{ bgColor: 'none' }}
                size={'md'}
                mt={'-0.25rem'}
                onClick={handleCloseModal}
              />
            </ModalHeader>

            <ModalBody p={4}>
              <Box px={'4rem'}>
                <FormControl isInvalid={!!errors}>
                  <FormLabel mb={4} fontSize={'md'}>
                    设置密码
                  </FormLabel>
                  <InputGroup size={'lg'}>
                    <Input
                      {...register('password', {
                        required: '密码不能为空',
                        minLength: { message: '密码长度不能小于6位', value: 6 },
                        maxLength: { message: '密码长度不能大于20位', value: 20 }
                      })}
                      type={showPassword ? 'text' : 'password'}
                    />
                    <InputRightElement>
                      {showPassword ? (
                        <AIcon
                          name="icon-yanjing_xianshi"
                          fontSize="1rem"
                          cursor={'pointer'}
                          onClick={() => setShowPassword(false)}
                        />
                      ) : (
                        <AIcon
                          name="icon-yanjing_yincang"
                          fontSize="1rem"
                          cursor={'pointer'}
                          onClick={() => setShowPassword(true)}
                        />
                      )}
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors?.password?.message}</FormErrorMessage>
                </FormControl>
              </Box>
            </ModalBody>
            <Divider bgColor={'borderColor.low'} h={'1px'} />
            <ModalFooter mt={2} pb={2}>
              <Button
                h={'2rem'}
                w={['6rem', '100px']}
                variant={'whiteCommon'}
                mr={2}
                onClick={handleCloseModal}
              >
                取消
              </Button>
              <Button
                h={'2rem'}
                w={['6rem', '100px']}
                variant={'blackCommon'}
                isLoading={loading}
                onClick={handleSubmit(run)}
              >
                提交
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* 用户详细信息 */}
        {isUerInfoOpen && <UserInfoCard record={record} onClose={() => setIsUerInfoOpen(false)} />}
      </>
    );
  };

  return (
    <Box
      display={['block', 'flex']}
      h={'100%'}
      flexDirection={'column'}
      flex={1}
      bgColor={'#fff'}
      borderRadius={'lg'}
      p={2}
    >
      {/* Header */}
      <Flex
        px={4}
        py={1}
        alignItems={'center'}
        borderBottom={'1px solid'}
        borderColor={'borderColor.low'}
      >
        <Flex alignItems={'center'} gap={4}>
          <AIcon name="icon-yonghuliebiao" color="primary.500" fontSize="2rem" />
          <Box fontWeight={'600'}>用户管理</Box>
        </Flex>
        <Button
          variant={'whiteCommon'}
          w={['auto', '150px']}
          h={'32px'}
          ml={'auto'}
          mr={4}
          onClick={onCreateUser}
        >
          <AIcon name="icon-xinzeng" fontSize="8px" mx={1} />
          添加用户
        </Button>
      </Flex>
      {/* Body */}
      <Flex flex={1} mt={2} h={'calc(100% - 50px)'}>
        {/* Left */}
        <Flex
          flexDir={'column'}
          alignItems={'center'}
          w={['auto', '200px']}
          h={'100%'}
          px={2}
          borderRadius={'lg'}
          bg={`linear-gradient(45deg, #EFEFF9, #FFFFFF, #EFEFF9, #FFFFFF)`}
        >
          <Box
            bgColor={selectedTab === 'all' ? '#e0e0f4' : '#fff'}
            border={'2px solid'}
            borderColor={'#e0e0f4'}
            textAlign={'center'}
            w={['100px', '160px']}
            py={2}
            fontSize={'sm'}
            fontWeight={'600'}
            borderRadius={'md'}
            mt={'2rem'}
            cursor={'pointer'}
            onClick={() => {
              setSelectedTab('all');
            }}
          >
            全部用户
          </Box>
          <Box
            bgColor={selectedTab === 'noTeam' ? '#e0e0f4' : '#fff'}
            border={'2px solid'}
            borderColor={'#e0e0f4'}
            textAlign={'center'}
            w={['100px', '160px']}
            py={2}
            fontSize={'sm'}
            fontWeight={'600'}
            borderRadius={'md'}
            mt={'2rem'}
            cursor={'pointer'}
            onClick={() => {
              setSelectedTab('noTeam');
            }}
          >
            未分配团队
          </Box>
          <Box></Box>
        </Flex>
        {/* Right */}
        <Box px={1} flex={1} h={'100%'} overflowY={'auto'}>
          <Table<TeamMemberWithUserInfoType>
            data={selectedTab === 'all' ? usersTableData : noTeamUsersTableData}
            type="user"
            Action={(props) => <Action record={props.record} />}
            loading={isFetchingUsers}
            onSearch={onSearch}
          />
        </Box>
      </Flex>

      {/* 添加成员模态框 */}
      <CreateUserModal
        isOpen={createUserModalOpen}
        onClose={() => setCreateUserModalOpen(false)}
        onCancel={() => setCreateUserModalOpen(false)}
        onSuccess={onCreateUserSuccess}
      />

      <CreateModal />

      <ConfirmModal />
    </Box>
  );
};

export default UserManage;
