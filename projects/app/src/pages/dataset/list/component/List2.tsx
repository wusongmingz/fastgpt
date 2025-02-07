import React, { useMemo, useRef, useState } from 'react';
import { resumeInheritPer } from '@/web/core/dataset/api';
import { Box, Flex, Grid, HStack } from '@chakra-ui/react';
import { DatasetTypeEnum, DatasetTypeMap } from '@fastgpt/global/core/dataset/constants';
import MyMenu from '@fastgpt/web/components/common/MyMenu';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useRouter } from 'next/router';
import PermissionIconText from '@/components/support/permission/IconText';
import Avatar from '@fastgpt/web/components/common/Avatar';
import { useConfirm } from '@fastgpt/web/hooks/useConfirm';
import { useRequest, useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { DatasetItemType, DatasetListItemType } from '@fastgpt/global/core/dataset/type';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { checkTeamExportDatasetLimit } from '@/web/support/user/team/api';
import { downloadFetch } from '@/web/common/system/utils';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import dynamic from 'next/dynamic';
import { useContextSelector } from 'use-context-selector';
import { DatasetsContext } from '../context';
import {
  DatasetDefaultPermissionVal,
  DatasetPermissionList
} from '@fastgpt/global/support/permission/dataset/constant';
import ConfigPerModal from '@/components/support/permission/ConfigPerModal';
import {
  deleteDatasetCollaborators,
  getCollaboratorList,
  postUpdateDatasetCollaborators
} from '@/web/core/dataset/api/collaborator';
import EmptyTip from '@fastgpt/web/components/common/EmptyTip';
import { useFolderDrag } from '@/components/common/folder/useFolderDrag';
import MyBox from '@fastgpt/web/components/common/MyBox';
import { useI18n } from '@/web/context/I18n';
import { useTranslation } from 'next-i18next';
import { useUserStore } from '@/web/support/user/useUserStore';
import { formatTimeToChatTime } from '@fastgpt/global/common/string/time';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import SideTag from './SideTag';
import AMenu from './AMenu';
import Image from 'next/image';
import useDeleteModal from '../hooks/useDeleteModal';
import { useMemoizedFn } from 'ahooks';
import EditModal from './EditModal';
import AIcon from '@/components/AIcon/AIcon';

const EditResourceModal = dynamic(() => import('@/components/common/Modal/EditResourceModal'));

function List() {
  const { setLoading } = useSystemStore();
  const { toast } = useToast();
  const { isPc } = useSystem();
  const { t } = useTranslation();
  const { commonT } = useI18n();
  const { loadAndGetTeamMembers } = useUserStore();
  const {
    loadMyDatasets,
    setMoveDatasetId,
    refetchPaths,
    editedDataset,
    setEditedDataset,
    onDelDataset,
    onUpdateDataset,
    myDatasets,
    folderDetail
  } = useContextSelector(DatasetsContext, (v) => v);
  const [editPerDatasetIndex, setEditPerDatasetIndex] = useState<number>();
  const [loadingDatasetId, setLoadingDatasetId] = useState<string>();

  const itemBgImg = '/imgs/images/picture/页面_1.png';

  const { getBoxProps } = useFolderDrag({
    activeStyles: {
      borderColor: 'primary.600'
    },
    onDrop: async (dragId: string, targetId: string) => {
      setLoadingDatasetId(dragId);
      try {
        await onUpdateDataset({
          id: dragId,
          parentId: targetId
        });
      } catch (error) {}
      setLoadingDatasetId(undefined);
    }
  });

  const { data: members = [] } = useRequest2(loadAndGetTeamMembers, {
    manual: false
  });

  const editPerDataset = useMemo(
    () => (editPerDatasetIndex !== undefined ? myDatasets[editPerDatasetIndex] : undefined),
    [editPerDatasetIndex, myDatasets]
  );

  const router = useRouter();

  const { parentId = null } = router.query as { parentId?: string | null };

  // 知识库导出请求函数
  const { mutate: exportDataset } = useRequest({
    mutationFn: async (dataset: DatasetItemType) => {
      setLoading(true);
      await checkTeamExportDatasetLimit(dataset._id);

      await downloadFetch({
        url: `/api/core/dataset/exportAll?datasetId=${dataset._id}`,
        filename: `${dataset.name}.csv`
      });
    },
    onSuccess() {
      toast({
        status: 'success',
        title: t('common:core.dataset.Start export')
      });
    },
    onSettled() {
      setLoading(false);
    },
    errorToast: t('common:dataset.Export Dataset Limit Error')
  });

  const DeleteTipsMap = useRef({
    [DatasetTypeEnum.folder]: t('common:dataset.deleteFolderTips'),
    [DatasetTypeEnum.dataset]: t('common:core.dataset.Delete Confirm'),
    [DatasetTypeEnum.websiteDataset]: t('common:core.dataset.Delete Confirm'),
    [DatasetTypeEnum.externalFile]: t('common:core.dataset.Delete Confirm')
  });

  const deleteTipsMap = useMemoizedFn((dataset: DatasetListItemType) => {
    if (dataset.type === DatasetTypeEnum.folder) {
      // TODO: 数据类型目前未包含 children 字段，暂时默认里面有内容
      return '此目录不为空，请确认是否删除目录及其数据，删除后数据将无法恢复！';
    } else {
      return '请确认是否删除该知识库？删除后数据将无法恢复！';
    }
  });

  const formatDatasets = useMemo(
    () =>
      myDatasets.map((item) => {
        return {
          ...item,
          label: DatasetTypeMap[item.type]?.label,
          icon: DatasetTypeMap[item.type]?.icon
        };
      }),
    [myDatasets]
  );

  // const { openConfirm, ConfirmModal } = useConfirm({
  //   type: 'delete'
  // });
  const { openConfirm, ConfirmModal } = useDeleteModal();

  const onClickDeleteDataset = (dataset: DatasetListItemType) => {
    openConfirm(
      () =>
        onDelDataset(dataset._id).then(() => {
          refetchPaths();
          loadMyDatasets();
        }),
      undefined,
      deleteTipsMap(dataset)
    )();
  };

  return (
    <>
      {formatDatasets.length > 0 && (
        <Grid
          py={4}
          gridTemplateColumns={
            folderDetail
              ? ['1fr', 'repeat(2,1fr)', 'repeat(2,1fr)', 'repeat(3,1fr)']
              : ['1fr', 'repeat(2,1fr)', 'repeat(3,1fr)', 'repeat(3,1fr)', 'repeat(4,1fr)']
          }
          gridGap={5}
          alignItems={'stretch'}
        >
          {formatDatasets.map((dataset, index) => {
            const owner = members.find((v) => v.tmbId === dataset.tmbId);
            return (
              <Box
                key={index}
                w={'300px'}
                position={'relative'}
                overflow={'hidden'}
                borderRadius={'lg'}
                _hover={{ boxShadow: 'lg' }}
              >
                <MyBox
                  isLoading={loadingDatasetId === dataset._id}
                  display={'flex'}
                  flexDirection={'column'}
                  lineHeight={1.5}
                  h="100%"
                  pt={2}
                  pb={2}
                  px={3}
                  cursor={'pointer'}
                  borderRadius={'lg'}
                  position={'relative'}
                  minH={'150px'}
                  color={'#333'}
                  bgImg={itemBgImg}
                  onClick={() => {
                    if (dataset.type === DatasetTypeEnum.folder) {
                      router.push({
                        pathname: '/dataset/list',
                        query: {
                          parentId: dataset._id
                        }
                      });
                    } else {
                      router.push({
                        pathname: '/dataset/detail',
                        query: {
                          datasetId: dataset._id
                        }
                      });
                    }
                  }}
                >
                  <HStack position={'relative'}>
                    {dataset.type === DatasetTypeEnum.folder && (
                      <Avatar src="/imgs/images/picture/文件.png" w={'48px'} />
                    )}
                    <Box
                      flex={'1 0 0'}
                      className="textEllipsis3"
                      fontSize={'sm'}
                      mt={dataset.type === DatasetTypeEnum.folder ? '-0.5rem' : 0}
                      ml={dataset.type === DatasetTypeEnum.folder ? 0 : '2rem'}
                    >
                      {dataset.name}
                    </Box>
                    {dataset.permission.hasWritePer && (
                      <Box position={'absolute'} top={0} right={0}>
                        <AMenu
                          offset={[-90, -5]}
                          menulist={[
                            {
                              children: [
                                {
                                  icon: 'rename',
                                  // label: commonT('dataset.Edit Info'),
                                  label: '重命名',
                                  onClick: () =>
                                    setEditedDataset({
                                      id: dataset._id,
                                      name: dataset.name,
                                      intro: dataset.intro,
                                      avatar: dataset.avatar
                                    })
                                },

                                ...(dataset.permission.hasManagePer
                                  ? [
                                      {
                                        icon: 'permission',
                                        label: t('common:permission.Permission'),
                                        onClick: () => setEditPerDatasetIndex(index)
                                      }
                                    ]
                                  : [])
                              ]
                            },
                            ...(dataset.permission.hasManagePer
                              ? [
                                  {
                                    children: [
                                      {
                                        icon: 'delete',
                                        label: t('common:common.Delete'),
                                        type: 'danger' as 'danger',
                                        onClick: () => onClickDeleteDataset(dataset)
                                      }
                                    ]
                                  }
                                ]
                              : [])
                          ]}
                        />
                      </Box>
                    )}
                  </HStack>

                  <Box
                    flex={1}
                    className={'textEllipsis3'}
                    py={3}
                    wordBreak={'break-all'}
                    fontSize={'xs'}
                    color={'#AAAAAA'}
                    px={3}
                  >
                    {dataset.intro ||
                      (dataset.type === DatasetTypeEnum.folder
                        ? t('common:core.dataset.Folder placeholder')
                        : t('common:core.dataset.Intro Placeholder'))}
                  </Box>

                  {dataset.type !== DatasetTypeEnum.folder && (
                    <Flex alignItems={'center'} justifyContent={'space-between'}>
                      <HStack>
                        <Box display={'flex'} alignItems={'center'}>
                          {dataset.type === DatasetTypeEnum.dataset ? (
                            <AIcon
                              name="icon-tongyongzhishiku"
                              fontSize={'1.125rem'}
                              color="rgb(215, 0, 15)"
                            />
                          ) : (
                            <AIcon name="icon-tupu" fontSize={'1.125rem'} color="rgb(215, 0, 15)" />
                          )}
                        </Box>
                        <Box fontWeight={'700'} fontSize={'sm'}>
                          {dataset.type === DatasetTypeEnum.graph ? '图谱知识库' : '通用知识库'}
                        </Box>
                      </HStack>
                      <HStack>
                        <Box display={'flex'} alignItems={'center'}>
                          <Avatar
                            src={'/imgs/images/picture/大模型接入2-copy.svg'}
                            w={'1.125rem'}
                          />
                        </Box>
                        <Box color={'#606266'} fontSize={'sm'}>
                          {dataset.vectorModel.name}
                        </Box>
                      </HStack>
                    </Flex>
                  )}
                </MyBox>
                {/* 知识库标签样式 */}
                {dataset.type !== DatasetTypeEnum.folder && (
                  <Box
                    borderWidth={'20px'}
                    borderColor={'red transparent transparent red'}
                    position={'absolute'}
                    top={0}
                    left={0}
                  />
                )}
              </Box>
            );
          })}
        </Grid>
      )}
      {myDatasets.length === 0 && (
        <EmptyTip
          pt={'35vh'}
          text={t('common:core.dataset.Empty Dataset Tips')}
          flexGrow="1"
        ></EmptyTip>
      )}

      {editedDataset && (
        <EditModal
          {...editedDataset}
          onClose={() => setEditedDataset(undefined)}
          onEdit={async (data) => {
            await onUpdateDataset({
              id: editedDataset.id,
              name: data.name,
              intro: data.intro,
              avatar: data.avatar
            });
          }}
        />
      )}

      {!!editPerDataset && (
        <ConfigPerModal
          hasParent={!!parentId}
          refetchResource={loadMyDatasets}
          isInheritPermission={editPerDataset.inheritPermission}
          resumeInheritPermission={() =>
            resumeInheritPer(editPerDataset._id).then(() => Promise.all([loadMyDatasets()]))
          }
          avatar={editPerDataset.avatar}
          name={editPerDataset.name}
          defaultPer={{
            value: editPerDataset.defaultPermission,
            defaultValue: DatasetDefaultPermissionVal,
            onChange: (e: any) =>
              onUpdateDataset({
                id: editPerDataset._id,
                defaultPermission: e
              })
          }}
          managePer={{
            permission: editPerDataset.permission,
            onGetCollaboratorList: () => getCollaboratorList(editPerDataset._id),
            permissionList: DatasetPermissionList,
            onUpdateCollaborators: ({
              members = [], // TODO: remove default value after group is ready
              permission
            }: {
              members?: string[];
              permission: number;
            }) => {
              return postUpdateDatasetCollaborators({
                members,
                permission,
                datasetId: editPerDataset._id
              });
            },
            onDelOneCollaborator: (props) =>
              deleteDatasetCollaborators({
                datasetId: editPerDataset._id,
                ...props
              }),
            refreshDeps: [editPerDataset._id, editPerDataset.inheritPermission]
          }}
          onClose={() => setEditPerDatasetIndex(undefined)}
        />
      )}
      <ConfirmModal />
    </>
  );
}

export default List;
