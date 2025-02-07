import React, { useCallback, useState } from 'react';
import {
  Flex,
  Box,
  IconButton,
  HStack,
  Text,
  useDisclosure,
  Input,
  InputGroup,
  InputLeftElement,
  ModalBody,
  Grid,
  Image
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import MyIcon from '@fastgpt/web/components/common/Icon';
import Avatar from '@fastgpt/web/components/common/Avatar';
import { AppListItemType } from '@fastgpt/global/core/app/type';
import MyDivider from '@fastgpt/web/components/common/MyDivider';
import MyPopover from '@fastgpt/web/components/common/MyPopover/index';
import FolderPath from '@/components/common/folder/Path';
import { getMyApps } from '@/web/core/app/api';
import {
  GetResourceFolderListProps,
  GetResourceListItemResponse
} from '@fastgpt/global/common/parentFolder/type';
import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import dynamic from 'next/dynamic';
import AIcon from '@/components/AIcon/AIcon';
import MyModal from '@fastgpt/web/components/common/MyModal';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { ListAppBody } from '@/pages/api/core/app/list';
import { getAppFolderPath } from '@/web/core/app/api/app';
import MyBox from '@fastgpt/web/components/common/MyBox';
import Loading from '@fastgpt/web/components/common/MyLoading';
import style from '../index.module.scss';
const SelectOneResource = dynamic(() => import('@/components/common/folder/SelectOneResource'));

const SliderApps = ({ apps, activeAppId }: { apps: AppListItemType[]; activeAppId: string }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const isTeamChat = router.pathname === '/chat/team';
  const {
    isOpen: isSelectMoreOpen,
    onOpen: onSelectMoreOpen,
    onClose: onSelectMoreClose
  } = useDisclosure();
  const menuList: any = [
    {
      title: '全部',
      value: [AppTypeEnum.folder, AppTypeEnum.plugin, AppTypeEnum.simple, AppTypeEnum.workflow],
      menuValue: 'ALL'
    },
    {
      title: t('app:type.Simple bot'),
      value: [AppTypeEnum.folder, AppTypeEnum.simple],
      menuValue: 'simple'
    },
    {
      title: '工作流',
      value: [AppTypeEnum.folder, AppTypeEnum.workflow],
      menuValue: 'workflow'
    },
    {
      title: '团队插件',
      value: [AppTypeEnum.folder, AppTypeEnum.plugin],
      menuValue: 'teamPlugin'
    }
  ];
  const [parentId, setParentId] = useState<any>('');
  const [searchKey, setSearchKey] = useState<any>('');
  const [menuActive, setMenuActive] = useState<any>(menuList[0].menuValue);
  const [templateType, setTemplateType] = useState<any>(menuList[0].value);
  const {
    data: templates = [],
    runAsync: loadTemplates,
    loading: isLoading
  } = useRequest2(
    () => {
      return getMyApps({ type: templateType, parentId, searchKey }).then((res) =>
        res.map<GetResourceListItemResponse>((item) => ({
          id: item._id,
          name: item.name,
          avatar: item.avatar,
          isFolder: item.type === AppTypeEnum.folder,
          type: item.type,
          selectColor: item.selectColor
        }))
      );
    },
    {
      manual: false,
      throttleWait: 300,
      refreshDeps: [parentId, searchKey, templateType],
      errorToast: t('common:core.module.templates.Load plugin error')
    }
  );
  const { data: paths = [] } = useRequest2(
    () => {
      return getAppFolderPath(parentId);
    },
    {
      manual: false,
      refreshDeps: [parentId]
    }
  );
  const onUpdateParentId = useCallback((parentId: any) => {
    setMenuActive('ALL');
    //bug  系统插件如果有目录大概率出错
    setParentId(parentId);
  }, []);
  const onChangeApp = useCallback(
    (appId: string) => {
      router.replace({
        query: {
          ...router.query,
          chatId: '',
          appId
        }
      });
    },
    [router]
  );
  // useRequest2(() => loadTemplates({ searchVal: searchKey }), {
  //   manual: false,
  //   throttleWait: 300,
  //   refreshDeps: [searchKey]
  // });
  return (
    <Flex flexDirection={'column'} h={'100%'} bg={'white'} borderRadius={'10px'}>
      <Box mt={4} px={4}>
        {!isTeamChat && (
          <Flex
            alignItems={'center'}
            cursor={'pointer'}
            py={2}
            px={3}
            borderRadius={'md'}
            border={'1px solid #e2e3ea'}
            _hover={{ bg: '#eceff6' }}
            onClick={() => router.push('/applicationCenter')}
            bg={'white'}
          >
            {/* <IconButton
              mr={3}
              _hover={{}}
              icon={<AIcon name={'icon-tuichu'} color={'rgb(215, 0, 15)'} />}
              // bg={'white'}
              bg={'none !important'}
              // boxShadow={'1px 1px 9px rgba(0,0,0,0.15)'}
              size={'smSquare'}
              aria-label={''}
            /> */}

            <AIcon name={'icon-tuichu'} color={'rgb(215, 0, 15)'}></AIcon>
            <Text flex={1} fontWeight={600} textAlign={'center'}>
              {t('common:core.chat.Exit Chat')}
            </Text>
          </Flex>
        )}
      </Box>

      {!isTeamChat && (
        <>
          <MyDivider h={2} my={1} />
          <HStack
            px={4}
            my={2}
            color={'myGray.500'}
            fontSize={'sm'}
            justifyContent={'space-between'}
          >
            <Box>{t('common:core.chat.Recent use')}</Box>
          </HStack>
        </>
      )}

      <Box flex={'1 0 0'} px={4} pb={4} h={0} overflow={'overlay'} className={style.scroll}>
        {apps.map((item) => (
          <Flex
            key={item._id}
            // py={3}
            // px={3}
            border={'1px solid #e2e3ea'}
            mb={3}
            h={'50px'}
            cursor={'pointer'}
            borderRadius={'md'}
            // alignItems={'center'}
            fontSize={'sm'}
            {...(item._id === activeAppId
              ? {
                  bg: '#eceff6',
                  boxShadow: 'md'
                  // color: 'primary.600'
                }
              : {
                  _hover: {
                    bg: 'myGray.200'
                  },
                  onClick: () => onChangeApp(item._id)
                })}
          >
            <AIcon
              {...(item.type === AppTypeEnum.simple
                ? {
                    name: 'icon-biaoqian1'
                  }
                : item.type === AppTypeEnum.workflow
                  ? {
                      name: 'icon-biaoqian2'
                    }
                  : {
                      name: 'icon-guanyuchajian'
                    })}
              color={item.selectColor}
            />
            <Box
              ml={2}
              h={'100%'}
              alignContent={'center'}
              textAlign={'center'}
              _hover={{
                bg: '#eceff6'
              }}
              className={'textEllipsis'}
            >
              {item.name}
            </Box>
          </Flex>
        ))}
        {/* <MyPopover
          placement="bottom-end"
          offset={[20, 10]}
          p={4}
          trigger="hover"
          Trigger={
            <Box
              textAlign={'center'}
              cursor={'pointer'}
              h="40px"
              borderRadius={'md'}
              alignContent={'center'}
              border={'1px solid #e2e3ea'}
              _hover={{
                bg: '#fbe6e8',
                color: '#d70010'
              }}
            >
              {t('common:common.More')}
            </Box>
          }
        >
          {({ onClose }) => (
            <Box minH={'200px'}>
              <SelectOneResource
                maxH={'60vh'}
                value={activeAppId}
                onSelect={(id) => {
                  if (!id) return;
                  onChangeApp(id);
                  onClose();
                }}
                server={getAppList}
              />
            </Box>
          )}
        </MyPopover> */}
        <Box
          textAlign={'center'}
          cursor={'pointer'}
          h="40px"
          borderRadius={'md'}
          alignContent={'center'}
          border={'1px solid #e2e3ea'}
          onClick={onSelectMoreOpen}
          _hover={{
            bg: '#fbe6e8',
            color: '#d70010'
          }}
        >
          {t('common:common.More')}
        </Box>
      </Box>
      {isSelectMoreOpen && (
        <MyModal
          w={'600px'}
          minH={'700px'}
          maxH={'700px'}
          bg={'#f7f7fc'}
          title={
            <InputGroup>
              <InputLeftElement>
                <AIcon name="icon-sousuo" color="primary.500"></AIcon>
              </InputLeftElement>
              <Input
                w={'500px'}
                value={searchKey}
                onChange={(e) => {
                  setSearchKey(e.target.value);
                }}
              ></Input>
            </InputGroup>
          }
          onClose={onSelectMoreClose}
        >
          <ModalBody userSelect={'none'} pt={1}>
            <Flex gap={2} justifyContent={'center'}>
              {menuList.map((item: any) => {
                return (
                  <Box
                    key={item.menuValue}
                    minW={'60px'}
                    px={2}
                    textAlign={'center'}
                    fontSize={'13px'}
                    alignContent={'center'}
                    py={1}
                    borderRadius={'md'}
                    cursor={'pointer'}
                    _hover={{
                      bg: '#eceff6'
                    }}
                    border={'1px solid #e2e3ea'}
                    bg={menuActive == item.menuValue ? '#eceff6' : '#fff'}
                    onClick={() => {
                      setMenuActive(item.menuValue);
                      setTemplateType(item.value);
                      // loadTemplates({
                      //   type: item.value,
                      //   parentId: parentId || null
                      // });
                    }}
                  >
                    {item.title}
                  </Box>
                );
              })}
            </Flex>
            <Flex mt={2}>
              <FolderPath
                paths={paths}
                FirstPathDom={null}
                onClick={() => {
                  onUpdateParentId(null);
                }}
              />
            </Flex>
            <MyBox w={'100%'} h={'100%'} minH={'60px'} isLoading={isLoading}>
              <Grid pt={4} gridTemplateColumns={'repeat(3,1fr)'} gap={3}>
                {templates.map((item) => {
                  return (
                    <Flex
                      key={item.id}
                      borderRadius={'md'}
                      cursor={'pointer'}
                      bgImage={'/imgs/images/picture/appbackgroundimage.png'}
                      bgSize={'cover'}
                      boxShadow={'0px 0px 3px rgb(0,0,0,0.15)'}
                      _hover={{
                        transform: 'scale(1.05)',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => {
                        if (item.isFolder) {
                          setParentId(item.id);
                          // loadTemplates({
                          //   parentId: item.id
                          // });
                        } else {
                          onChangeApp(item.id);
                          onSelectMoreClose();
                          setParentId('');
                        }
                      }}
                      // border={'1px solid #e2e3ea'}
                      h={'50px'}
                    >
                      {!item.isFolder ? (
                        <AIcon
                          fontSize="25px"
                          {...(item.type === AppTypeEnum.simple
                            ? {
                                name: 'icon-biaoqian1'
                              }
                            : item.type === AppTypeEnum.workflow
                              ? {
                                  name: 'icon-biaoqian2'
                                }
                              : {
                                  name: 'icon-guanyuchajian'
                                })}
                          color={item.selectColor}
                        />
                      ) : (
                        <Image
                          m={1.5}
                          w={'22px'}
                          h={'22px'}
                          alt=""
                          src={'/imgs/images/picture/文件.png'}
                        ></Image>
                      )}
                      <Box
                        flex={1}
                        h={'100%'}
                        pb={1}
                        pl={3}
                        alignContent={'center'}
                        fontSize={'14px'}
                      >
                        {item.name}
                      </Box>
                    </Flex>
                  );
                })}
              </Grid>
            </MyBox>
          </ModalBody>
        </MyModal>
      )}
    </Flex>
  );
};

export default React.memo(SliderApps);
