import React, { useCallback, useMemo, useState } from 'react';
import { Box, Flex, Button, InputGroup, InputLeftElement, Input, Image } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serviceSideProps } from '@/web/common/utils/i18n';
import ParentPaths from '@/components/common/folder/Path';
import List from './component/List';
import { DatasetsContext } from './context';
import DatasetContextProvider from './context';
import { useContextSelector } from 'use-context-selector';
import MyMenu from '@fastgpt/web/components/common/MyMenu';
import { AddIcon } from '@chakra-ui/icons';
import { useUserStore } from '@/web/support/user/useUserStore';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { FolderIcon } from '@fastgpt/global/common/file/image/constants';
import { EditFolderFormType } from '@fastgpt/web/components/common/MyModal/EditFolderModal';
import dynamic from 'next/dynamic';
import { postCreateDatasetFolder, resumeInheritPer } from '@/web/core/dataset/api';
import FolderSlideCard from '@/components/common/folder/SlideCard';
import { DatasetPermissionList } from '@fastgpt/global/support/permission/dataset/constant';
import {
  postUpdateDatasetCollaborators,
  deleteDatasetCollaborators,
  getCollaboratorList
} from '@/web/core/dataset/api/collaborator';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import { CreateDatasetType } from './component/CreateModal';
import { DatasetTypeEnum } from '@fastgpt/global/core/dataset/constants';
import { useToast } from '@fastgpt/web/hooks/useToast';
import FolderPath from '@/components/common/folder/Path';
import MyBox from '@fastgpt/web/components/common/MyBox';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import HeaderFilter from './component/HeaderFilter';
import KnowledgeHome from '@/pages/dataset/knowledgeHome/index';

const EditFolderModal = dynamic(
  () => import('@fastgpt/web/components/common/MyModal/EditFolderModal')
);

const CreateModal = dynamic(() => import('./component/CreateModal'));

const Dataset = () => {
  const { isPc } = useSystem();
  const { t } = useTranslation();
  const router = useRouter();
  const { parentId } = router.query as { parentId: string };
  // console.log(parentId, 11);
  const { datasetId } = router.query as { datasetId: string };
  // console.log(datasetId, 22);

  const {
    myDatasets,
    paths,
    isFetchingDatasets,
    refetchPaths,
    loadMyDatasets,
    refetchFolderDetail,
    folderDetail,
    setMoveDatasetId,
    onDelDataset,
    onUpdateDataset,
    searchKey,
    setSearchKey
  } = useContextSelector(DatasetsContext, (v) => v);
  const { userInfo } = useUserStore();
  const { feConfigs } = useSystemStore();
  const { toast } = useToast();
  const [editFolderData, setEditFolderData] = useState<EditFolderFormType>();
  const [createDatasetType, setCreateDatasetType] = useState<CreateDatasetType>();

  const onSelectDatasetType = useCallback(
    (e: CreateDatasetType) => {
      if (
        !feConfigs?.isPlus &&
        (e === DatasetTypeEnum.websiteDataset || e === DatasetTypeEnum.externalFile)
      ) {
        return toast({
          status: 'warning',
          title: t('common:common.system.Commercial version function')
        });
      }
      setCreateDatasetType(e);
    },
    [t, toast, feConfigs]
  );

  const RenderSearchInput = useMemo(
    () => (
      <InputGroup maxW={['auto', '100%']}>
        <InputLeftElement h={'full'} alignItems={'center'} display={'flex'}>
          <MyIcon color={'myGray.600'} name={'common/searchLight'} w={'1rem'} />
        </InputLeftElement>
        <Input
          pl={'34px'}
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          placeholder={t('common:dataset.dataset_name')}
          py={0}
          lineHeight={'34px'}
          maxLength={30}
          bg={'white'}
        />
      </InputGroup>
    ),
    [searchKey, setSearchKey, t]
  );
  const { lastAppListRouteType } = useSystemStore();
  const onClickRoute = useCallback(
    (parentId: string) => {
      router.push({
        pathname: '/dataset/list',
        query: {
          parentId,
          type: lastAppListRouteType
        }
      });
    },
    [router, lastAppListRouteType]
  );

  return (
    <MyBox
      flexDirection={'column'}
      height={'calc(100vh - 100px)'}
      margin={'10px 10px 10px 0px'}
      overflowY={'auto'}
      overflowX={'hidden'}
      borderRadius={'10px'}
      bg={'#eceff6'}
    >
      <Flex>
        <Flex flexGrow={1} flexDirection="column">
          {/* 显示新建搜索框等 */}
          {/* {myDatasets.length > 0 && (
            <Flex alignItems={'center'} justifyContent={'space-between'}>
              <ParentPaths
                paths={paths}
                FirstPathDom={
                  <Flex flex={1} alignItems={'center'}>
                    <Box
                      pl={2}
                      letterSpacing={1}
                      fontSize={'1.25rem'}
                      fontWeight={'bold'}
                      color={'myGray.900'}
                    >
                      {t('common:core.dataset.My Dataset')}
                    </Box>
                  </Flex>
                }
                onClick={(e) => {
                  router.push({
                    query: {
                      parentId: e
                    }
                  });
                }}
              />
              {isPc && RenderSearchInput}
              {userInfo?.team?.permission.hasWritePer && (
                <Box pl={[0, 4]}>
                  <MyMenu
                    offset={[0, 10]}
                    width={120}
                    iconSize="2rem"
                    iconRadius="6px"
                    placement="bottom-end"
                    Button={
                      <Button variant={'primary'} px="0">
                        <Flex alignItems={'center'} px={5}>
                          <AddIcon mr={2} />
                          <Box>{t('common:common.Create New')}</Box>
                        </Flex>
                      </Button>
                    }
                    menuList={[
                      {
                        children: [
                          {
                            icon: 'core/dataset/commonDatasetColor',
                            label: t('dataset:common_dataset'),
                            description: t('dataset:common_dataset_desc'),
                            onClick: () => onSelectDatasetType(DatasetTypeEnum.dataset)
                          },
                          {
                            icon: 'core/dataset/websiteDatasetColor',
                            label: t('dataset:website_dataset'),
                            description: t('dataset:website_dataset_desc'),
                            onClick: () => onSelectDatasetType(DatasetTypeEnum.websiteDataset)
                          },
                          {
                            icon: 'core/dataset/externalDatasetColor',
                            label: t('dataset:external_file'),
                            description: t('dataset:external_file_dataset_desc'),
                            onClick: () => onSelectDatasetType(DatasetTypeEnum.externalFile)
                          }
                        ]
                      },
                      {
                        children: [
                          {
                            icon: FolderIcon,
                            label: t('common:Folder'),
                            onClick: () => setEditFolderData({})
                          }
                        ]
                      }
                    ]}
                  />
                </Box>
              )}
            </Flex>
          )} */}
          {!isPc && <Box mt={2}>{RenderSearchInput}</Box>}
          {/* 知识库的数据集页面 */}
          <>
            <MyBox
              bgColor={'rgb(236,239,246)'}
              flexDirection={'column'}
              h={'calc(100vh - 165px)'}
              // m={'10px'}
              ml={0}
              p={'8px'}
              borderRadius={'md'}
            >
              <Flex
                h={'40px'}
                bgColor={'white'}
                borderRadius={'md'}
                alignItems={'center'}
                pl={'15px'}
              >
                <Image
                  w={'30px'}
                  h={'30px'}
                  src="/imgs/images/picture/书籍.png"
                  alt=""
                  borderRadius={'25px'}
                  boxShadow={'4px 4px 4px rgba(0,0,0,0.20)'}
                />
                <Box pl={'23px'} fontWeight={1000} fontSize={'17px'} w={'120px'}>
                  我的知识库
                </Box>
                {!!parentId && (
                  <>
                    <Box h={'30px'} pl={'10px'} borderRight={'3px solid #d7000f'}></Box>

                    <Box pl={'20px'}>
                      <FolderPath
                        rootName={'根目录'}
                        paths={paths}
                        hoverStyle={{ color: 'primary.600' }}
                        onClick={onClickRoute}
                        fontSize={'14px'}
                      />
                    </Box>
                  </>
                )}
                {((!parentId && myDatasets.length > 0) || !!searchKey) && (
                  <HeaderFilter
                    filterButtonList={[
                      {
                        name: '全部',
                        value: 'ALL',
                        isActive: true
                      },
                      {
                        name: '通用知识库',
                        value: 'dataset'
                      },
                      {
                        name: '图知识库',
                        value: 'graph'
                      }
                    ]}
                  ></HeaderFilter>
                )}
              </Flex>
              <MyBox h={'100%'} flex={1} isLoading={isFetchingDatasets}>
                {/* <List></List> */}
                {(myDatasets.length > 0 || !!searchKey) && <List></List>}
                {myDatasets.length === 0 && !searchKey && !isFetchingDatasets && <KnowledgeHome />}
              </MyBox>
            </MyBox>
          </>
        </Flex>
        {/* 文件详情 */}
        {/* {!!folderDetail && isPc && (
          <Box ml="6">
            <FolderSlideCard
              resumeInheritPermission={() => resumeInheritPer(folderDetail._id)}
              isInheritPermission={folderDetail.inheritPermission}
              hasParent={!!folderDetail.parentId}
              refetchResource={() => Promise.all([refetchFolderDetail(), loadMyDatasets()])}
              refreshDeps={[folderDetail._id, folderDetail.inheritPermission]}
              name={folderDetail.name}
              intro={folderDetail.intro}
              onEdit={() => {
                setEditFolderData({
                  id: folderDetail._id,
                  name: folderDetail.name,
                  intro: folderDetail.intro
                });
              }}
              onMove={() => setMoveDatasetId(folderDetail._id)}
              deleteTip={t('common:dataset.deleteFolderTips')}
              onDelete={() =>
                onDelDataset(folderDetail._id).then(() => {
                  router.replace({
                    query: {
                      ...router.query,
                      parentId: folderDetail.parentId
                    }
                  });
                })
              }
              managePer={{
                mode: 'all',
                permission: folderDetail.permission,
                onGetCollaboratorList: () => getCollaboratorList(folderDetail._id),
                permissionList: DatasetPermissionList,
                onUpdateCollaborators: ({
                  members,
                  groups,
                  permission
                }: {
                  members?: string[];
                  groups?: string[];
                  permission: number;
                }) =>
                  postUpdateDatasetCollaborators({
                    members,
                    groups,
                    permission,
                    datasetId: folderDetail._id
                  }),
                onDelOneCollaborator: async ({ tmbId, groupId }) => {
                  if (tmbId) {
                    return deleteDatasetCollaborators({
                      datasetId: folderDetail._id,
                      tmbId
                    });
                  } else if (groupId) {
                    return deleteDatasetCollaborators({
                      datasetId: folderDetail._id,
                      groupId
                    });
                  }
                },
                refreshDeps: [folderDetail._id, folderDetail.inheritPermission]
              }}
            />
          </Box>
        )} */}
      </Flex>

      {!!editFolderData && (
        <EditFolderModal
          // 将editFolderData的属性传递给EditFolderModal组件
          {...editFolderData}
          // 关闭EditFolderModal组件时，将editFolderData设置为undefined
          onClose={() => setEditFolderData(undefined)}
          // 创建数据集文件夹时，调用postCreateDatasetFolder函数，并传入parentId、name和intro参数，然后调用loadMyDatasets和refetchPaths函数
          onCreate={async ({ name, intro }) => {
            try {
              await postCreateDatasetFolder({
                parentId: parentId || undefined,
                name,
                intro: intro ?? ''
              });
              loadMyDatasets();
              refetchPaths();
            } catch (error) {
              return Promise.reject(error);
            }
          }}
          // 编辑数据集时，调用onUpdateDataset函数，并传入id、name和intro参数
          onEdit={async ({ name, intro, id }) => {
            try {
              await onUpdateDataset({
                id,
                name,
                intro
              });
            } catch (error) {
              return Promise.reject(error);
            }
          }}
        />
      )}
      {createDatasetType && (
        <CreateModal
          type={createDatasetType}
          onClose={() => setCreateDatasetType(undefined)}
          parentId={parentId || undefined}
        />
      )}
    </MyBox>
  );
};
export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content, ['dataset', 'user']))
    }
  };
}

function DatasetContextWrapper() {
  return (
    <DatasetContextProvider>
      <Dataset />
    </DatasetContextProvider>
  );
}

export default DatasetContextWrapper;
