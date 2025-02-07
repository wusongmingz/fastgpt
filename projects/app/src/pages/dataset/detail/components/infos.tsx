import React, { use, useEffect, useState, useRef } from 'react';
import {
  Box,
  Flex,
  Input,
  Textarea,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Text
} from '@chakra-ui/react';
import { useSelectFile } from '@/web/common/file/hooks/useSelectFile';
import { useConfirm } from '@fastgpt/web/hooks/useConfirm';
import { useForm } from 'react-hook-form';
import { compressImgFileAndUpload } from '@/web/common/file/controller';
import type { DatasetItemType } from '@fastgpt/global/core/dataset/type.d';
import Avatar from '@fastgpt/web/components/common/Avatar';
import { useTranslation } from 'next-i18next';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { MongoImageTypeEnum } from '@fastgpt/global/common/file/image/constants';
import AIModelSelector from '@/components/Select/AIModelSelector';
import { postRebuildEmbedding } from '@/web/core/dataset/api';
import type { VectorModelItemType } from '@fastgpt/global/core/ai/model.d';
import { useContextSelector } from 'use-context-selector';
import { DatasetPageContext } from '@/web/core/dataset/context/datasetPageContext';
import MyDivider from '@fastgpt/web/components/common/MyDivider/index';
import { DatasetTypeEnum, DatasetTypeMap } from '@fastgpt/global/core/dataset/constants';
import QuestionTip from '@fastgpt/web/components/common/MyTooltip/QuestionTip';
import FormLabel from '@fastgpt/web/components/common/MyBox/FormLabel';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { DatasetPermissionList } from '@fastgpt/global/support/permission/dataset/constant';
import MemberManager from '../../component/MemberManager';

import {
  getCollaboratorList,
  postUpdateDatasetCollaborators,
  deleteDatasetCollaborators
} from '@/web/core/dataset/api/collaborator';
import DatasetTypeTag from '@/components/core/dataset/DatasetTypeTag';
import dynamic from 'next/dynamic';
import { EditResourceInfoFormType } from '@/components/common/Modal/EditResourceModal';
import MyInput from '@/components/MyInput';
import { Button } from '@chakra-ui/react';

import { useToast } from '@fastgpt/web/hooks/useToast';
// const { toast } = useToast();
const EditResourceModal = dynamic(() => import('@/components/common/Modal/EditResourceModal'));
const buttonStyles = {
  cancelButtonStyle: {
    bg: 'white',
    w: '100px',
    h: '32px',
    color: 'black',
    border: '1px solid #d6d7ef',
    borderRadius: '5px',
    _hover: {
      bg: 'rgb(237,241,244)',
      color: 'black'
    }
  },
  okButtonStyle: {
    bg: 'black',
    color: 'white',
    w: '100px',
    h: '32px',
    borderRadius: '5px',
    border: '1px solid black',
    _hover: {
      bg: 'rgb(237,241,244)',
      color: 'black',
      border: '1px solid black'
    }
  }
};

const Info = ({ datasetId }: { datasetId: string }) => {
  const { t } = useTranslation();
  const { datasetDetail, loadDatasetDetail, updateDataset, rebuildingCount, trainingCount } =
    useContextSelector(DatasetPageContext, (v) => v);
  const [selectColor, setSelectColor] = useState<string | undefined>(datasetDetail.selectColor);
  const [name, setName] = useState<string>(datasetDetail.name);
  const nameRef = useRef(name);
  const [intro, setIntro] = useState<string>(datasetDetail.intro);
  const introRef = useRef(intro);
  const [id, setId] = useState<string>(datasetDetail._id);
  const [editedDataset, setEditedDataset] = useState<EditResourceInfoFormType>();
  const handleChange = (event: any) => {
    const newValue = event.target.value;
    setIntro(newValue);
    introRef.current = newValue;
    datasetSetValue('intro', intro);
  };
  const handleChangeName = (event: any) => {
    const newValue = event.target.value;
    setName(newValue);
    nameRef.current = newValue;
    datasetSetValue('name', name);
  };
  useEffect(() => {
    // 当 intro 状态更新时，执行此回调
    datasetSetValue('intro', intro);
  }, [intro]);

  useEffect(() => {
    // 当 name 状态更新时，执行此回调
    datasetSetValue('name', name);
  }, [name]);
  const refetchDatasetTraining = useContextSelector(
    DatasetPageContext,
    (v) => v.refetchDatasetTraining
  );
  const { setValue, register, handleSubmit, watch, reset } = useForm<DatasetItemType>({
    defaultValues: datasetDetail
  });
  // const [savedataset, setSavedataset] = useState(datasetDetail.name);
  const [agent, setAgent] = useState<DatasetItemType['agentModel']>();
  useEffect(() => {
    setAgent(datasetDetail.agentModel);
    setIntro(datasetDetail.intro);
    setName(datasetDetail.name);
    setId(datasetDetail._id);
    setSelectColor(datasetDetail.selectColor);
    datasetSetValue('intro', intro);
    datasetSetValue('name', name);
    datasetSetValue('selectColor', selectColor);
    datasetSetValue('id', id);
  }, [datasetDetail]);

  const vectorModel = watch('vectorModel');
  const agentModel = watch('agentModel');
  const storeAgentModel = localStorage.getItem('agentModel');

  const {
    register: datasetRegister,
    handleSubmit: datasetHandleSubmit,
    reset: datasetReset,
    watch: datasetWatch,
    setValue: datasetSetValue
  } = useForm({
    defaultValues: {
      id: datasetDetail._id,
      name: datasetDetail.name,
      intro: datasetDetail.intro,
      selectColor: datasetDetail.selectColor
    }
  });
  const { datasetModelList, vectorModelList } = useSystemStore();
  const { ConfirmModal: ConfirmDelModal } = useConfirm({
    content: t('common:core.dataset.Delete Confirm'),
    type: 'delete'
  });
  const { openConfirm: onOpenConfirmRebuild, ConfirmModal: ConfirmRebuildModal } = useConfirm({
    title: t('common:common.confirm.Common Tip'),
    content: t('dataset:confirm_to_rebuild_embedding_tip'),
    type: 'delete'
  });

  const { File } = useSelectFile({
    fileType: '.jpg,.png',
    multiple: false
  });
  // const { runAsync: onSaveDataset, loading } = useRequest2(
  //   (data: EditResourceInfoFormType) => {
  //     onEditBaseInfo({
  //       id: editedDataset.id,
  //       name: data.name,
  //       intro: data.intro,
  //       avatar: data.avatar
  //     });
  //   },
  //   {
  //     onSuccess: () => {
  //       toast({
  //         title: '重命名成功',
  //         status: 'success'
  //       });
  //     }
  //   }
  // );

  const { runAsync: onSave } = useRequest2(
    (data: DatasetItemType) => {
      return updateDataset({
        id: datasetId,
        agentModel: data.agentModel,
        externalReadUrl: data.externalReadUrl
      });
    },
    {
      successToast: t('common:common.Update Success'),
      errorToast: t('common:common.Update Failed')
    }
  );

  const { runAsync: onSelectFile } = useRequest2(
    (e: File[]) => {
      const file = e[0];
      if (!file) return Promise.resolve(null);
      return compressImgFileAndUpload({
        type: MongoImageTypeEnum.datasetAvatar,
        file,
        maxW: 300,
        maxH: 300
      });
    },
    {
      onSuccess(src: string | null) {
        if (src) {
          setValue('avatar', src);
        }
      },
      errorToast: t('common:common.avatar.Select Failed')
    }
  );

  const { runAsync: onRebuilding } = useRequest2(
    (vectorModel: VectorModelItemType) => {
      return postRebuildEmbedding({
        datasetId,
        vectorModel: vectorModel.model
      });
    },
    {
      onSuccess() {
        refetchDatasetTraining();
        loadDatasetDetail(datasetId);
      },
      successToast: t('dataset:rebuild_embedding_start_tip'),
      errorToast: t('common:common.Update Failed')
    }
  );

  const { runAsync: onEditBaseInfo } = useRequest2(updateDataset, {
    onSuccess() {
      setEditedDataset(undefined);
    },
    successToast: t('common:common.Update Success'),
    errorToast: t('common:common.Update Failed')
  });
  // 持久化存储颜色
  // useEffect(() => {
  //   const storedSelectColor = localStorage.getItem('selectColor');
  //   if (storedSelectColor) {
  //     setSelectColor(storedSelectColor);
  //   }
  // }, []);
  // useEffect(() => {
  //   localStorage.setItem('selectColor', selectColor || '');
  // }, [selectColor]);

  useEffect(() => {
    datasetSetValue('name', datasetDetail.name);
    datasetSetValue('intro', datasetDetail.intro);
    datasetSetValue('selectColor', datasetDetail.selectColor);
    datasetSetValue('id', datasetDetail._id);
  }, [datasetDetail, setValue]);

  return (
    <Box w={'100%'} h={'100%'} p={6} pt={8}>
      <Box>
        <Flex mt={3} w={'100%'}>
          <FormLabel fontSize={'14px'} w={'200px'}>
            {t('common:core.dataset.Dataset ID')}:
          </FormLabel>
          <Box fontSize={'14px'}>{datasetDetail._id}</Box>
        </Flex>
        <Flex mb={2} alignItems={'center'} pt={4}>
          {/* <Avatar src={datasetDetail.avatar} w={'20px'} h={'20px'} borderRadius={'xs'} /> */}
          <FormLabel fontSize={'14px'} w={'200px'}>
            知识库标签:
          </FormLabel>
          <Box
            bg={selectColor}
            w="30px"
            h="30px"
            cursor="pointer"
            _hover={{
              border: '2px solid gray'
            }}
          />
          <Box ml={2}>
            <Popover>
              <PopoverTrigger>
                <Button {...buttonStyles.cancelButtonStyle}>更换颜色</Button>
              </PopoverTrigger>
              <PopoverContent maxWidth="200px" maxHeight="300px">
                {/* 在这里添加弹框内要显示的内容，比如颜色选择相关的 UI 元素等 */}
                <Box
                  p={4}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 0.1fr)',
                    gridGap: '5px'
                  }}
                >
                  {[
                    '#002FA7',
                    '#008C8C',
                    '#003153',
                    '#81D8CF',
                    '#B05923',
                    '#900021',
                    '#E60000',
                    '#FBD26A',
                    '#432913',
                    '#E85827'
                  ].map((color) => (
                    <Box
                      key={color}
                      bg={color}
                      w="30px"
                      h="30px"
                      cursor="pointer"
                      _hover={{
                        border: '2px solid gray'
                      }}
                      {...datasetRegister('selectColor')}
                      onClick={() => {
                        setSelectColor(color);
                        datasetSetValue('selectColor', color);
                      }}
                      border={selectColor === color ? '2px solid gray' : 'none'}
                    />
                  ))}
                </Box>
              </PopoverContent>
            </Popover>
          </Box>
        </Flex>
      </Box>

      <Box overflow={'hidden'}>
        <Flex mb={2} alignItems={'center'} pt={4}>
          {/* <Avatar src={datasetDetail.avatar} w={'20px'} h={'20px'} borderRadius={'xs'} /> */}
          <FormLabel fontSize={'14px'} w={'200px'}>
            知识库名称:
          </FormLabel>
          <Box>
            <Input
              fontSize={'14px'}
              maxLength={10}
              // defaultValue={name}
              // {...datasetRegister('name')}
              onChange={handleChangeName}
              value={name}
            ></Input>
          </Box>
        </Flex>

        <Flex mt={5} w={'100%'}>
          <FormLabel fontSize={'14px'} w={'200px'}>
            {t('common:core.ai.model.Vector Model')}:
          </FormLabel>
          <FormLabel fontSize={'14px'}>{vectorModel.model}</FormLabel>
        </Flex>

        <Flex mt={2} w={'100%'} alignItems={'center'} pt={4}>
          <FormLabel fontSize={'14px'} w={'200px'} fontWeight={'500'}>
            {t('common:core.Max Token')}:
          </FormLabel>
          <Box fontSize={'14px'}>{vectorModel.maxToken}</Box>
        </Flex>

        <Flex pt={5}>
          <FormLabel fontSize={'14px'} fontWeight={'500'} w={'200px'} pt={2}>
            {t('common:core.ai.model.Dataset Agent Model')}:
          </FormLabel>
          <Box>
            <AIModelSelector
              w={'100%'}
              value={agent?.model}
              list={datasetModelList.map((item) => ({
                label: item.name,
                value: item.model
              }))}
              fontSize={'14px'}
              onchange={(e) => {
                const agentModel = datasetModelList.find((item) => item.model === e);
                if (!agentModel) return;
                setValue('agentModel', agentModel);
                return handleSubmit((data) => onSave({ ...data, agentModel: agentModel }))();
              }}
            />
          </Box>
        </Flex>
        <Flex pt={6}>
          <FormLabel fontSize={'14px'} w={'200px'} fontWeight={'500'}>
            介绍:
          </FormLabel>
          <Flex
            flex={1}
            className={'textEllipsis3'}
            wordBreak={'break-all'}
            fontSize={'xs'}
            color={'myGray.500'}
            direction={'column'}
          >
            <Textarea
              resize={'none'}
              w={'300px'}
              h={'220px'}
              maxLength={20}
              // defaultValue={datasetDetail.intro || t('common:core.dataset.Intro Placeholder')}
              // {...datasetRegister('intro')}
              onChange={handleChange}
              value={intro}
            ></Textarea>
            <Button
              {...buttonStyles.okButtonStyle}
              mt={2}
              fontWeight={800}
              onClick={async () => {
                datasetSetValue('selectColor', selectColor);
                await onEditBaseInfo({
                  id: datasetWatch('id'),
                  name: datasetWatch('name'),
                  intro: datasetWatch('intro'),
                  avatar: '',
                  selectColor: datasetWatch('selectColor')
                });
              }}
            >
              保存
            </Button>
          </Flex>
        </Flex>

        {datasetDetail.type === DatasetTypeEnum.externalFile && (
          <>
            <Box w={'100%'} alignItems={'center'} pt={4}>
              <FormLabel display={'flex'} pb={2} fontSize={'14px'} fontWeight={'500'}>
                <Box>{t('dataset:external_read_url')}</Box>
                <QuestionTip label={t('dataset:external_read_url_tip')} />
              </FormLabel>
              <Input
                fontSize={'14px'}
                flex={[1, '0 0 320px']}
                placeholder="https://test.com/read?fileId={{fileId}}"
                {...register('externalReadUrl')}
                onBlur={handleSubmit((data) => onSave(data))}
              />
            </Box>
          </>
        )}
      </Box>

      <File onSelect={onSelectFile} />
      <ConfirmDelModal />
      <ConfirmRebuildModal countDown={10} />
      {editedDataset && (
        <EditResourceModal
          {...editedDataset}
          title={t('common:dataset.Edit Info')}
          onClose={() => setEditedDataset(undefined)}
          onEdit={(data) =>
            onEditBaseInfo({
              id: editedDataset.id,
              name: data.name,
              intro: data.intro,
              avatar: data.avatar
            })
          }
        />
      )}
    </Box>
  );
};

export default React.memo(Info);
