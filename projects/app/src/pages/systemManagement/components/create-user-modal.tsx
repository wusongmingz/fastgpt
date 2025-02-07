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
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { Select } from 'chakra-react-select';
import { postCreateUser } from '@/web/support/user/api';
import React, { useEffect, useMemo, useState } from 'react';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { getTeamGroupListWithPer } from '@/web/support/user/team/group/api';
import { GroupMemberRole } from '@fastgpt/global/support/permission/memberGroup/constant';

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

const chakraStyles = {
  container: (prev: any) => ({
    ...prev,
    w: '240px',
    maxH: '32px'
  }),
  // @ts-ignore
  option: (provided, { isSelected }) => ({
    ...provided,
    _hover: {
      color: '#d7000f',
      bg: '#f7f8fa'
    },
    backgroundColor: '#fff',
    ...(isSelected && {
      backgroundColor: '#fff',
      color: '#d7000f'
    })
  }),
  dropdownIndicator: (prev: any, { selectProps }: any) => ({
    ...prev, // w: '120px',
    '> svg': {
      transform: `rotate(${selectProps.menuIsOpen ? 180 : 0}deg)`,
      transition: 'transform 0.3s'
    }
  })
};

function CreateUserModal({
  isOpen,
  onCancel,
  onClose,
  onConfirm,
  onSuccess,
  onError
}: {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onConfirm?: () => void;
  onSuccess?: (data: any) => void;
  onError?: (err: any) => void;
}) {
  const { onClose: closeModal } = useDisclosure();
  const [showPassword, setShowPassword] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);

  const teamListOptions = useMemo(() => {
    return groups.map((group) => ({ value: group._id, label: group.name }));
  }, [groups]);

  const roleListOptions: RoleSelectOption[] = [
    {
      value: 'member',
      label: '团队成员'
    },
    {
      value: 'admin',
      label: '团队管理员'
    }
  ];

  const { register, handleSubmit, reset, setValue, formState } = useForm<FormData>({
    defaultValues: {
      username: '',
      password: '',
      role: 'member',
      groupId: groups[0]?._id
    }
  });

  useEffect(() => {
    getTeamGroupListWithPer().then((data) => {
      setGroups(data);
      setValue('groupId', data[0]?._id);
    });
  }, []);

  const { run: onSave, loading } = useRequest2((formData: FormData) => postCreateUser(formData), {
    onSuccess: async (res) => {
      reset();
      onSuccess?.(res);
    },
    onError: (err) => {
      onError?.(err);
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent minW={['300px', '600px']} maxW={['28rem', '1000px']} w={'800px'} h={'360px'}>
        <ModalHeader
          py={2}
          display={'flex'}
          alignItems={'center'}
          roundedTop={'lg'}
          fontSize={'md'}
          bgColor={'borderColor.low'}
        >
          添加用户
          <ModalCloseButton
            _hover={{ bgColor: 'none' }}
            size={'md'}
            mt={'-0.25rem'}
            onClick={() => {
              onCancel();
            }}
          />
        </ModalHeader>
        <ModalBody p={4}>
          <form>
            <Flex justifyContent={'space-between'} mb={8} mx={8}>
              <Box w={['128px', '280px']}>
                <FormControl isInvalid={!!formState.errors.username}>
                  <FormLabel htmlFor="username" fontSize={'sm'}>
                    登录用户名
                  </FormLabel>
                  <Input
                    id="username"
                    placeholder="请输入电话或邮箱"
                    {...register('username', {
                      required: '用户名不能为空',
                      pattern: {
                        message: '请输入有效的电话号码或邮箱',
                        value:
                          /^(?:\+?86)?1[3-9]\d{9}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
                      }
                    })}
                  />
                  <FormErrorMessage>
                    {formState.errors.username && formState.errors.username.message}
                  </FormErrorMessage>
                </FormControl>
              </Box>
              <Box w={['128px', '280px']}>
                <FormControl isInvalid={!!formState.errors.password}>
                  <FormLabel htmlFor="password" fontSize={'sm'}>
                    初始密码
                  </FormLabel>
                  <InputGroup>
                    <Input
                      id="password"
                      placeholder="请输入密码"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: '密码不能为空',
                        minLength: { message: '密码长度不能小于6位', value: 6 },
                        maxLength: { message: '密码长度不能大于14位', value: 14 }
                      })}
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
                  <FormErrorMessage>
                    {formState.errors.password && formState.errors.password.message}
                  </FormErrorMessage>
                </FormControl>
              </Box>
            </Flex>

            <Flex justifyContent={'space-between'} mx={8}>
              <Box w={['80px', '240px']}>
                <FormControl>
                  <FormLabel fontSize={'sm'}>所属团队</FormLabel>
                  <Select
                    chakraStyles={chakraStyles}
                    {...register('groupId')}
                    defaultValue={teamListOptions[0]}
                    options={teamListOptions}
                    onChange={(val) => {
                      setValue('groupId', val!.value);
                      console.log(formState.errors);
                    }}
                  />
                </FormControl>
              </Box>
              <Box w={['80px', '240px']}>
                <FormControl>
                  <FormLabel fontSize={'sm'}>设置角色</FormLabel>
                  <Select
                    chakraStyles={chakraStyles}
                    {...register('role')}
                    defaultValue={roleListOptions[0]}
                    options={roleListOptions}
                    onChange={(val) => setValue('role', val!.value)}
                  />
                </FormControl>
              </Box>
            </Flex>
          </form>
        </ModalBody>
        <Divider bgColor={'borderColor.low'} h={'1px'} />
        <ModalFooter mt={2} pb={2}>
          <Button
            h={'2rem'}
            w={['6rem', '100px']}
            variant={'whiteCommon'}
            mr={2}
            onClick={() => {
              onCancel();
            }}
          >
            取消
          </Button>
          <Button
            h={'2rem'}
            w={['6rem', '100px']}
            variant={'blackCommon'}
            isLoading={loading}
            onClick={async () => {
              try {
                await handleSubmit(onSave)();
                onConfirm?.();
              } catch (error) {
              } finally {
                closeModal();
              }
            }}
          >
            提交
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CreateUserModal;
