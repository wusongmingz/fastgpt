import { ACollapse } from '@/components/ACollapse';
import AIcon from '@/components/AIcon/AIcon';
import {
  getAllTeamMembersWithInfo,
  getAllTeamMembersWithInfoInGroup,
  TeamMemberWithSimpleInfo
} from '@/web/support/user/team/api';
import { postCreateTeamGroupMember } from '@/web/support/user/team/group/api';
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalOverlay,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Flex,
  Box,
  Tabs,
  TabList,
  Tab,
  TabIndicator,
  TabPanels,
  TabPanel,
  Button,
  Divider
} from '@chakra-ui/react';
import Avatar from '@fastgpt/web/components/common/Avatar';
import MyBox from '@fastgpt/web/components/common/MyBox';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { useRouter } from 'next/router';
import { MouseEvent, useEffect, useState } from 'react';

const AddUserModal = ({
  users,
  usersInGroup,
  isOpen,
  isLoading,
  onClose,
  onConfirm
}: {
  users: TeamMemberWithSimpleInfo[] | undefined;
  usersInGroup: any;
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => {
  const router = useRouter();

  const [selectedUsers, setSelectedUsers] = useState<TeamMemberWithSimpleInfo[]>([]);

  const { run: onSave, loading: saveLoading } = useRequest2(
    () =>
      postCreateTeamGroupMember({
        tmbId: selectedUsers.map((u) => u._id),
        groupId: router.query.groupId as string
      }),
    {
      onSuccess: async () => {
        setSelectedUsers([]);
        onConfirm();
        onClose();
      }
    }
  );

  const onSelectedUser = (e: MouseEvent, user: TeamMemberWithSimpleInfo) => {
    if (user.isMember) return;
    if (!selectedUsers.find((u) => u._id === user._id)) {
      const users = selectedUsers.slice();
      users.push(user);
      setSelectedUsers(users);
    }
  };

  useEffect(() => {
    setSelectedUsers([]);
  }, [router.query.groupId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        minW={['300px', '600px']}
        maxW={['28rem', '1000px']}
        w={'800px'}
        h={['360px', '500px']}
        // maxH={['460px', '600px']}
      >
        <ModalHeader
          py={2}
          display={'flex'}
          alignItems={'center'}
          roundedTop={'lg'}
          fontSize={'md'}
          bgColor={'borderColor.low'}
        >
          添加成员
          <ModalCloseButton _hover={{ bgColor: 'none' }} size={'md'} mt={'-0.25rem'} />
        </ModalHeader>

        <ModalBody p={4} maxH={['260px', '400px']}>
          {/* <AddMember /> */}
          <>
            <MyBox isLoading={isLoading} h={'100%'}>
              <Flex h={'100%'}>
                <Box
                  h={'100%'}
                  overflowY={'auto'}
                  flex={1}
                  px={2}
                  borderRight={'1px solid'}
                  borderColor={'borderColor.low'}
                >
                  <Tabs>
                    <TabList color={'black'}>
                      <Tab _hover={{ fontWeight: '600' }} w={['auto', '100px']} color={'black'}>
                        用户
                      </Tab>
                      <Tab _hover={{ fontWeight: '600' }} w={['auto', '100px']} color={'black'}>
                        团队
                      </Tab>
                    </TabList>
                    <TabIndicator mt="-1.5px" height="2px" bg="primary.500" borderRadius="1px" />
                    <TabPanels>
                      <TabPanel>
                        {users?.length &&
                          users?.map((user) => (
                            <Flex
                              key={user._id}
                              alignItems={'center'}
                              gap={4}
                              onClick={(e) => onSelectedUser(e, user)}
                              mb={2}
                              cursor={user.isMember ? 'not-allowed' : 'pointer'}
                              color={user.isMember ? '#B9AABB' : '#333333'}
                            >
                              <AIcon name="icon-icon-user" fontSize="1.5rem" color="primary.500" />
                              {user.name}
                              {selectedUsers.find((u) => u._id === user._id) && (
                                <AIcon
                                  name="icon-tijiao"
                                  fontSize="1.5rem"
                                  color="primary.500"
                                  ml={'auto'}
                                />
                              )}
                            </Flex>
                          ))}
                      </TabPanel>
                      <TabPanel>
                        <Flex flexDirection={'column'} w={'100%'}>
                          {usersInGroup?.length &&
                            usersInGroup.map((group: any) => (
                              <ACollapse
                                key={group._id}
                                trigger={({ isOpen, onToggle }) => (
                                  <Flex
                                    alignItems={'center'}
                                    gap={2}
                                    bgColor={'#e0e0f4'}
                                    h={'2rem'}
                                    borderRadius={'md'}
                                    cursor={'pointer'}
                                    onClick={() => onToggle()}
                                    _notLast={{ mb: 2 }}
                                  >
                                    {isOpen ? (
                                      <AIcon name="icon-shousuo2" fontSize="2rem" color="#797979" />
                                    ) : (
                                      <AIcon name="icon-shousuo1" fontSize="2rem" color="#797979" />
                                    )}

                                    <Avatar src="/imgs/images/picture/our_team.svg" w={'1.5rem'} />

                                    <Box flex={1}>{group.groupName}</Box>
                                  </Flex>
                                )}
                              >
                                {group.members.map((user: any) => {
                                  return (
                                    <Flex
                                      key={user._id}
                                      alignItems={'center'}
                                      gap={4}
                                      pl={'2.5rem'}
                                      onClick={(e) => onSelectedUser(e, user)}
                                      mb={2}
                                      cursor={user.isMember ? 'not-allowed' : 'pointer'}
                                      color={user.isMember ? '#B9AABB' : '#333333'}
                                    >
                                      <AIcon
                                        name="icon-icon-user"
                                        fontSize="1.5rem"
                                        color="primary.500"
                                      />
                                      {user.name}
                                      {selectedUsers.find((u) => u._id === user._id) && (
                                        <AIcon
                                          name="icon-tijiao"
                                          fontSize="1.5rem"
                                          color="primary.500"
                                          ml={'auto'}
                                        />
                                      )}
                                    </Flex>
                                  );
                                })}
                              </ACollapse>
                            ))}
                        </Flex>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </Box>
                <Box flex={1} px={2} overflowY={'auto'}>
                  <Box fontSize={'sm'}>已选择（{selectedUsers.length}）</Box>
                  {selectedUsers.map((user) => (
                    <Flex
                      key={user._id}
                      h={'30px'}
                      alignItems={'center'}
                      gap={4}
                      _hover={{ bgColor: 'rgb(236, 239, 246)' }}
                      px={4}
                      mt={2}
                    >
                      <AIcon name="icon-icon-user" fontSize="1.5rem" color="primary.500" />
                      {user.name}
                      <AIcon
                        name="icon-quxiao"
                        fontSize="1.25rem"
                        color="rgb(57, 56,72)"
                        ml={'auto'}
                        cursor={'pointer'}
                        onClick={() => {
                          const users = selectedUsers.filter((u) => u._id !== user._id);
                          setSelectedUsers(users);
                        }}
                      />
                    </Flex>
                  ))}
                </Box>
              </Flex>
            </MyBox>
          </>
        </ModalBody>
        <Divider bgColor={'borderColor.low'} h={'1px'} />
        <ModalFooter mt={2} pb={2}>
          <Button
            h={'2rem'}
            w={['6rem', '100px']}
            variant={'whiteCommon'}
            mr={2}
            onClick={() => {
              onClose();
            }}
          >
            取消
          </Button>
          <Button
            h={'2rem'}
            w={['6rem', '100px']}
            variant={'blackCommon'}
            isLoading={saveLoading}
            onClick={onSave}
          >
            提交
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddUserModal;
