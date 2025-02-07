import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  ModalFooter,
  ModalBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useTheme,
  Link,
  Input,
  IconButton
} from '@chakra-ui/react';
import {
  getOpenApiKeys,
  createAOpenApiKey,
  delOpenApiById,
  putOpenApiKey
} from '@/web/support/openapi/api';
import type { EditApiKeyProps } from '@/global/support/openapi/api.d';
import dayjs from 'dayjs';
import { AddIcon } from '@chakra-ui/icons';
import { useCopyData } from '@/web/common/hooks/useCopyData';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useTranslation } from 'next-i18next';
import MyIcon from '@fastgpt/web/components/common/Icon';
import MyModal from '@fastgpt/web/components/common/MyModal';
import { useForm } from 'react-hook-form';
import { useRequest, useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { getDocPath } from '@/web/common/system/doc';
import MyMenu from '@fastgpt/web/components/common/MyMenu';
import { useConfirm } from '@fastgpt/web/hooks/useConfirm';
import { useI18n } from '@/web/context/I18n';
import FormLabel from '@fastgpt/web/components/common/MyBox/FormLabel';
import QuestionTip from '@fastgpt/web/components/common/MyTooltip/QuestionTip';
import MyBox from '@fastgpt/web/components/common/MyBox';
import AIcon from '@/components/AIcon/AIcon';

type EditProps = EditApiKeyProps & { _id?: string };
const defaultEditData: EditProps = {
  name: '',
  limit: {
    maxUsagePoints: -1
  }
};

const ApiKeyTable = ({ tips, appId }: { tips: string; appId?: string }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { copyData } = useCopyData();
  const { feConfigs } = useSystemStore();
  const [baseUrl, setBaseUrl] = useState('https://tryfastgpt.ai/api');
  const [editData, setEditData] = useState<EditProps>();
  const [apiKey, setApiKey] = useState('');

  const { ConfirmModal, openConfirm } = useConfirm({
    type: 'delete',
    content: t('common:delete_api')
  });

  const { runAsync: onclickRemove } = useRequest2(delOpenApiById, {
    onSuccess() {
      refetch();
    }
  });

  const {
    data: apiKeys = [],
    loading: isGetting,
    run: refetch
  } = useRequest2(() => getOpenApiKeys({ appId }), {
    manual: false,
    refreshDeps: [appId]
  });

  useEffect(() => {
    setBaseUrl(feConfigs?.customApiDomain || `${location.origin}/api`);
  }, [feConfigs?.customApiDomain]);
  const { publishT } = useI18n();

  return (
    <MyBox
      isLoading={isGetting}
      display={'flex'}
      mt={2}
      flexDirection={'column'}
      h={'calc(100vh - 336px)'}
      position={'relative'}
    >
      <Box display={['block', 'flex']} alignItems={'center'}>
        <Box flex={1}>
          <Flex alignItems={'flex-end'}>
            <Box color={'myGray.900'} fontSize={'lg'} pl={2}>
              {t('common:support.openapi.Api manager')}
            </Box>
            {/* {feConfigs?.docUrl && (
              <Link
                href={feConfigs.openAPIDocUrl || getDocPath('/docs/development/openapi')}
                target={'_blank'}
                ml={1}
                color={'primary.500'}
                fontSize={'sm'}
              >
                {t('common:common.Read document')}
              </Link>
            )} */}
          </Flex>
          <Box fontSize={'mini'} color={'myGray.600'}>
            <Flex
              mt={[2, 0]}
              // bg={'myGray.100'}
              justifyContent={'space-between'}
              py={2}
              // px={4}
              borderRadius={'md'}
              userSelect={'none'}
              alignItems={'center'}
              borderBottom={'1px solid #e0e0e0'}
            >
              <Flex fontSize={'sm'}>
                <Box fontSize={'xs'}>{t('common:support.openapi.Api baseurl')}:&nbsp;&nbsp;</Box>
                {baseUrl}
                <AIcon
                  pl={2}
                  name="icon-fuzhi"
                  cursor={'pointer'}
                  onClick={() => copyData(baseUrl, t('common:support.openapi.Copy success'))}
                  color="rgb(18,107,174)"
                ></AIcon>
              </Flex>
              <Box textAlign={'right'}>
                <Button
                  ml={3}
                  // leftIcon={<AddIcon fontSize={'md'} />}
                  variant={'whitePrimary'}
                  size={'lg'}
                  _hover={{}}
                  bg={'#d7000f'}
                  color={'#fff'}
                  fontSize={'20px !important'}
                  fontWeight={'900 !important'}
                  w={'200px'}
                  onClick={() =>
                    setEditData({
                      ...defaultEditData,
                      appId
                    })
                  }
                >
                  {t('common:new_create_api')}
                </Button>
              </Box>
            </Flex>
          </Box>
        </Box>
      </Box>
      <TableContainer
        mt={1}
        position={'relative'}
        minH={'300px'}
        maxH={'calc(100vh - 425px)'}
        overflowY={'scroll'}
      >
        <Table>
          <Thead>
            <Tr bg={'#e2e3ea !important'}>
              <Th textAlign={'center'}>{t('common:Name')}</Th>
              <Th textAlign={'center'}>Api Key</Th>
              <Th textAlign={'center'}>{t('common:support.outlink.Usage points')}</Th>
              {feConfigs?.isPlus && (
                <>
                  <Th textAlign={'center'}>{t('common:common.Expired Time')}</Th>
                </>
              )}

              <Th textAlign={'center'}>{t('common:common.Create Time')}</Th>
              <Th textAlign={'center'}>{t('common:common.Last use time')}</Th>
              <Th textAlign={'center'}>{t('common:support.outlink.operation')}</Th>
            </Tr>
          </Thead>
          <Tbody fontSize={'sm'} maxH={'calc(100vh - 520px)'}>
            {apiKeys.map(({ _id, name, usagePoints, limit, apiKey, createTime, lastUsedTime }) => (
              <Tr key={_id}>
                <Td textAlign={'center'}>{name}</Td>
                <Td textAlign={'center'}>{apiKey}</Td>
                <Td textAlign={'center'}>
                  {Math.round(usagePoints)}/
                  {feConfigs?.isPlus && limit?.maxUsagePoints && limit?.maxUsagePoints > -1
                    ? `${limit?.maxUsagePoints}`
                    : t('common:common.Unlimited')}
                </Td>
                {feConfigs?.isPlus && (
                  <>
                    <Td textAlign={'center'} whiteSpace={'pre-wrap'}>
                      {limit?.expiredTime
                        ? dayjs(limit?.expiredTime).format('YYYY/MM/DD HH:mm')
                        : '-'}
                    </Td>
                  </>
                )}
                <Td textAlign={'center'} whiteSpace={'pre-wrap'}>
                  {dayjs(createTime).format('YYYY/MM/DD HH:mm:ss')}
                </Td>
                <Td textAlign={'center'} whiteSpace={'pre-wrap'}>
                  {lastUsedTime
                    ? dayjs(lastUsedTime).format('YYYY/MM/DD HH:mm:ss')
                    : t('common:common.Un used')}
                </Td>
                <Td textAlign={'center'}>
                  <Button
                    onClick={() =>
                      setEditData({
                        _id,
                        name,
                        limit,
                        appId
                      })
                    }
                    size={'sm'}
                    mr={3}
                    variant={'whiteCommon'}
                  >
                    {t('common:common.Edit')}
                  </Button>
                  <Button
                    onClick={() => openConfirm(() => onclickRemove(_id))()}
                    size={'sm'}
                    mr={3}
                    variant={'whiteCommon'}
                  >
                    {t('common:common.Delete')}
                  </Button>
                  {/* <MyMenu
                    offset={[-50, 5]}
                    Button={
                      <IconButton
                        icon={<MyIcon name={'more'} w={'14px'} />}
                        name={'more'}
                        variant={'whitePrimary'}
                        size={'sm'}
                        aria-label={''}
                      />
                    }
                    menuList={[
                      {
                        children: [
                          {
                            label: t('common:common.Edit'),
                            icon: 'edit',
                            onClick: () =>
                              setEditData({
                                _id,
                                name,
                                limit,
                                appId
                              })
                          },
                          {
                            label: t('common:common.Delete'),
                            icon: 'delete',
                            type: 'danger',
                            onClick: () => openConfirm(() => onclickRemove(_id))()
                          }
                        ]
                      }
                    ]}
                  /> */}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {!!editData && (
        <EditKeyModal
          defaultData={editData}
          onClose={() => setEditData(undefined)}
          onCreate={(id) => {
            setApiKey(id);
            refetch();
            setEditData(undefined);
          }}
          onEdit={() => {
            refetch();
            setEditData(undefined);
          }}
        />
      )}
      <ConfirmModal />
      <MyModal
        isOpen={!!apiKey}
        w={['400px', '400px']}
        // iconSrc="/imgs/modal/key.svg"
        title={
          <Box w="310px" textAlign={'center'}>
            {publishT('create_api_key')}
          </Box>
        }
        onClose={() => setApiKey('')}
      >
        <ModalBody pt={5} borderTop={'1px solid #e0e0e0'}>
          <Flex
            // bg={'myGray.100'}

            px={3}
            pl={2}
            pr={1}
            whiteSpace={'pre-wrap'}
            wordBreak={'break-all'}
            cursor={'pointer'}
            direction={'column'}
            borderRadius={'md'}
            userSelect={'all'}
            onClick={() => copyData(apiKey)}
          >
            <Flex flex={1} alignItems={'end'}>
              <Box flex={1} borderRadius={'md'} border={'1px solid #e0e0e0'} minH={'100px'} p={2}>
                {apiKey}
              </Box>
              <AIcon ml={1} name="icon-fuzhi"></AIcon>
              {/* <MyIcon ml={1} name={'copy'} w={'16px'}></MyIcon> */}
            </Flex>

            <Box fontSize={'xs'} color={'myGray.600'} mt={6} fontWeight={'700'} mb={'50px'}>
              {t('common:support.openapi.New api key tip')}
            </Box>
          </Flex>
        </ModalBody>
        {/* <ModalFooter>
          <Button variant="whiteBase" onClick={() => setApiKey('')}>
            {t('common:common.OK')}
          </Button>
        </ModalFooter> */}
      </MyModal>
    </MyBox>
  );
};

export default React.memo(ApiKeyTable);

// edit link modal
function EditKeyModal({
  defaultData,
  onClose,
  onCreate,
  onEdit
}: {
  defaultData: EditProps;
  onClose: () => void;
  onCreate: (id: string) => void;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const { publishT } = useI18n();
  const isEdit = useMemo(() => !!defaultData._id, [defaultData]);
  const { feConfigs } = useSystemStore();

  const {
    register,
    setValue,
    handleSubmit: submitShareChat
  } = useForm({
    defaultValues: defaultData
  });

  const { mutate: onclickCreate, isLoading: creating } = useRequest({
    mutationFn: async (e: EditProps) => createAOpenApiKey(e),
    errorToast: t('workflow:create_link_error'),
    onSuccess: onCreate
  });
  const { mutate: onclickUpdate, isLoading: updating } = useRequest({
    mutationFn: (e: EditProps) => {
      //@ts-ignore
      return putOpenApiKey(e);
    },
    errorToast: t('workflow:update_link_error'),
    onSuccess: onEdit
  });

  return (
    <MyModal
      isOpen={true}
      // iconSrc="/imgs/modal/key.svg"
      title={
        <Box pl={'120px'} textAlign={'center'}>
          {isEdit ? publishT('edit_api_key') : publishT('create_api_key')}
        </Box>
      }
    >
      <ModalBody borderY={'1px solid #e0e0e0'}>
        <Flex direction={'column'} minH={'150px'} justifyContent={'center'}>
          <FormLabel pb={2}>{t('common:Name')}</FormLabel>
          <Input
            placeholder={publishT('key_alias') || 'key_alias'}
            maxLength={20}
            {...register('name', {
              required: t('common:common.name_is_empty') || 'name_is_empty'
            })}
          />
        </Flex>
        {feConfigs?.isPlus && (
          <>
            <Flex alignItems={'center'} mt={4}>
              <FormLabel display={'flex'} flex={'0 0 90px'} alignItems={'center'}>
                {t('common:support.outlink.Max usage points')}
                <QuestionTip
                  ml={1}
                  label={t('common:support.outlink.Max usage points tip')}
                ></QuestionTip>
              </FormLabel>
              <Input
                {...register('limit.maxUsagePoints', {
                  min: -1,
                  max: 10000000,
                  valueAsNumber: true,
                  required: true
                })}
              />
            </Flex>
            <Flex alignItems={'center'} mt={4}>
              <FormLabel flex={'0 0 90px'}>{t('common:common.Expired Time')}</FormLabel>
              <Input
                type="datetime-local"
                defaultValue={
                  defaultData.limit?.expiredTime
                    ? dayjs(defaultData.limit?.expiredTime).format('YYYY-MM-DDTHH:mm')
                    : ''
                }
                onChange={(e) => {
                  setValue('limit.expiredTime', new Date(e.target.value));
                }}
              />
            </Flex>
          </>
        )}
      </ModalBody>

      <ModalFooter>
        <Button variant={'whiteCommon'} mr={3} size={'sm'} w={'80px'} onClick={onClose}>
          {t('common:common.Close')}
        </Button>

        <Button
          isLoading={creating || updating}
          bg={'#d7000f'}
          size={'sm'}
          w={'80px'}
          _hover={{}}
          onClick={submitShareChat((data) => (isEdit ? onclickUpdate(data) : onclickCreate(data)))}
        >
          {t('common:common.Confirm')}
        </Button>
      </ModalFooter>
    </MyModal>
  );
}
